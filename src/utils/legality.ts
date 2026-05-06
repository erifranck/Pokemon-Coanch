import learnsetsData from '../data/learnsets.json';
import formatData from '../data/format_data.json';
import pokedexData from '../data/pokedex.json';

type LegalityType = 'pokemon' | 'item' | 'ability' | 'move';

export const checkLegality = (
  pokemonId: string, 
  type: LegalityType, 
  valueId: string, 
  formatId: string
): boolean => {
  if (!valueId) return true; // Empty string/selection is always "legal"
  
  const format = (formatData as any)[formatId];
  if (!format) return true; // If format doesn't exist, assume anything goes

  // 1. Check if Pokemon is explicitly legal in the format
  if (type === 'pokemon') {
      const isLegal = !!format.pokemon[valueId];
      return isLegal;
  }
  
  if (type === 'item') {
      const isLegal = !!format.items[valueId];
      return isLegal;
  }

  // 2. Check move learnsets
  if (type === 'move') {
    // Some Pokemon inherit learnsets from base forms (e.g. Ogerpon-Wellspring -> Ogerpon)
    let searchId = pokemonId;
    let allowedMoves: string[] = (learnsetsData as any)[searchId] || [];
    
    // If we don't have moves for this specific form, check the base species
    if (allowedMoves.length === 0) {
      const pokeDef = (pokedexData as any)[pokemonId];
      if (pokeDef && pokeDef.baseSpecies) {
        searchId = pokeDef.baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
        allowedMoves = (learnsetsData as any)[searchId] || [];
      }
    }

    if (allowedMoves.length > 0) {
      // Normalize valueId (sometimes moves in learnsets don't have dashes/spaces)
      const normalizedMoveId = valueId.toLowerCase().replace(/[^a-z0-9]/g, '');
      return allowedMoves.includes(normalizedMoveId);
    }
    
    // If we truly have no learnset data for this Pokemon, we might want to default to true
    // to avoid false positives on brand new Pokemon until Showdown updates their files.
    // However, for strict VGC, we could return false. Let's return true as fallback.
    return true; 
  }

  // 3. Check if ability belongs to Pokemon
  if (type === 'ability') {
    const pokeDef = (pokedexData as any)[pokemonId];
    if (pokeDef) {
      const validAbilities = Object.values(pokeDef.abilities);
      // Value might be the ID or the Name. We check if it matches any name.
      return validAbilities.includes(valueId);
    }
  }

  return true;
};
