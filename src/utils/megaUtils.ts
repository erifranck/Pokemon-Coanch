/**
 * Shared utility for detecting Mega Evolution forms from equipped items.
 * 
 * Showdown's item data stores mega info in `megaStone` property which is an object
 * mapping base species names to mega form names. E.g.:
 *   { "Charizard": "Charizard-Mega-X" }
 * 
 * The megaEvolves property is often null in modern Showdown data, so we rely on megaStone.
 */

/**
 * Given an item definition (from formatData) and a base Pokemon definition,
 * returns the mega form ID (e.g., "charizardmegax") if the item is a compatible Mega Stone.
 * Returns null if no mega evolution is possible.
 */
export function getMegaFormId(
  itemDefObj: any,
  basePokemonDef: any
): string | null {
  if (!itemDefObj || !itemDefObj.megaStone || !basePokemonDef) return null;

  const megaStoneObj = itemDefObj.megaStone;
  
  // megaStone is an object like { "Charizard": "Charizard-Mega-X" }
  if (typeof megaStoneObj === 'object' && megaStoneObj[basePokemonDef.name]) {
    const targetName = megaStoneObj[basePokemonDef.name];
    if (typeof targetName === 'string') {
      return targetName.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
  }

  return null;
}
