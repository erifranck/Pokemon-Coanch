import formatData from '../data/format_data.json';

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

  // 1. Check if Pokemon is explicitly legal in the format (key = pokemon ID like "charizard")
  if (type === 'pokemon') {
      const isLegal = !!format.pokemon[valueId];
      return isLegal;
  }
  
  // 2. Items: valueId is the item NAME (e.g., "Charizardite X"), search by name
  if (type === 'item') {
      const isLegal = Object.values(format.items || {}).some((item: any) => item.name === valueId);
      return isLegal;
  }

  // 3. Moves: valueId is the move ID (e.g., "thunderbolt"), check existence in format
  if (type === 'move') {
      const isLegal = !!format.moves[valueId];
      return isLegal;
  }

  // 4. Check if ability belongs to Pokemon in the current format
  if (type === 'ability') {
    const pokeDef = format.pokemon[pokemonId];
    if (pokeDef && pokeDef.abilities) {
      const validAbilities = Object.values(pokeDef.abilities);
      return validAbilities.includes(valueId);
    }
  }

  return true;
};
