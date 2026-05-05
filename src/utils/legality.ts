import learnsetsData from '../data/learnsets.json';
import regulationsData from '../data/regulations.json';
import pokedexData from '../data/pokedex.json';

type LegalityType = 'pokemon' | 'item' | 'ability' | 'move';

export const checkLegality = (
  pokemonId: string, 
  type: LegalityType, 
  valueId: string, 
  regulationId: string
): boolean => {
  if (!valueId) return true; // Empty string/selection is always "legal"
  
  const regulation = (regulationsData as any)[regulationId];
  if (!regulation) return true; // If regulation doesn't exist, assume anything goes

  // 1. Check banned lists
  if (type === 'pokemon' && regulation.bannedPokemon?.includes(valueId)) return false;
  if (type === 'item' && regulation.bannedItems?.includes(valueId)) return false;
  if (type === 'ability' && regulation.bannedAbilities?.includes(valueId)) return false;

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
