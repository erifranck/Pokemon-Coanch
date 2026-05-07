import { calculate, Pokemon, Move, Field } from '@smogon/calc';

// Standard Pokemon Stat Formula at Level 50 with 31 IVs
// HP = Math.floor((2 * Base + 31 + Math.floor(EV / 4)) * 50 / 100) + 10 + 50
// Since EV is conceptually replaced, the base at 0 EVs is:
// HP_Base50 = Math.floor((2 * Base + 31) * 50 / 100) + 60
// Other = Math.floor((2 * Base + 31) * 50 / 100) + 5

export const calculateBaseStat50 = (statName: string, baseStat: number): number => {
  if (statName === 'hp') {
    return Math.floor((2 * baseStat + 31) * 50 / 100) + 60;
  }
  return Math.floor((2 * baseStat + 31) * 50 / 100) + 5;
};

// Champions M-A format: 1 SP = 1 direct point to the final stat.
// Nature modifier (1.1x / 0.9x) is applied AFTER adding the SP to the other stats.
export const calculateFinalStat = (
  statName: string, 
  baseStat: number, 
  sp: number, 
  natureModifier: number = 1.0,
  itemName: string = ''
): number => {
  const base50 = calculateBaseStat50(statName, baseStat);
  const withSp = base50 + sp;
  
  let finalStat = withSp;
  if (statName !== 'hp') {
    finalStat = Math.floor(withSp * natureModifier);
  }
  
  // Apply item modifiers
  const item = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (item === 'choicescarf' && statName === 'spe') return Math.floor(finalStat * 1.5);
  if (item === 'choiceband' && statName === 'atk') return Math.floor(finalStat * 1.5);
  if (item === 'choicespecs' && statName === 'spa') return Math.floor(finalStat * 1.5);
  if (item === 'eviolite' && (statName === 'def' || statName === 'spd')) return Math.floor(finalStat * 1.5);
  if (item === 'lightball' && (statName === 'atk' || statName === 'spa')) return Math.floor(finalStat * 2.0); // Only for Pikachu, validation done contextually
  if (item === 'thickclub' && statName === 'atk') return Math.floor(finalStat * 2.0); // Cubone/Marowak
  
  return finalStat;
};

// Map of nature modifiers
// { natureName: [increasedStat, decreasedStat] }
export const NATURES: Record<string, [string, string] | null> = {
  Adamant: ['atk', 'spa'],
  Bold: ['def', 'atk'],
  Brave: ['atk', 'spe'],
  Calm: ['spd', 'atk'],
  Careful: ['spd', 'spa'],
  Impish: ['def', 'spa'],
  Jolly: ['spe', 'spa'],
  Modest: ['spa', 'atk'],
  Quiet: ['spa', 'spe'],
  Relaxed: ['def', 'spe'],
  Sassy: ['spd', 'spe'],
  Timid: ['spe', 'atk'],
  Hardy: null,
  Docile: null,
  Serious: null,
  Bashful: null,
  Quirky: null
};

export const getNatureModifier = (statName: string, nature: string): number => {
  const effect = NATURES[nature];
  if (!effect) return 1.0;
  if (effect[0] === statName) return 1.1;
  if (effect[1] === statName) return 0.9;
  return 1.0;
};

export const createChampionsPokemon = (
  generation: any,
  name: string,
  baseStats: Record<string, number>,
  sps: Record<string, number>,
  nature: string,
  options: any = {}
) => {
  const item = options.item || '';
  const boosts = options.boosts || {};
  const status = options.status || '';
  const ability = options.ability || '';
  
  // 1. Calculate raw stats based on SPs
  const rawStats = {
    hp: calculateFinalStat('hp', baseStats.hp, sps.hp || 0, 1.0, item),
    atk: calculateFinalStat('atk', baseStats.atk, sps.atk || 0, getNatureModifier('atk', nature), item),
    def: calculateFinalStat('def', baseStats.def, sps.def || 0, getNatureModifier('def', nature), item),
    spa: calculateFinalStat('spa', baseStats.spa, sps.spa || 0, getNatureModifier('spa', nature), item),
    spd: calculateFinalStat('spd', baseStats.spd, sps.spd || 0, getNatureModifier('spd', nature), item),
    spe: calculateFinalStat('spe', baseStats.spe, sps.spe || 0, getNatureModifier('spe', nature), item)
  };

  // 2. Instantiate Pokemon with all modifiers
  const pokeOptions: any = {
    ...options,
    level: 50,
    nature: nature,
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  };
  
  // Pass ability and boosts to @smogon/calc if provided
  if (ability) pokeOptions.ability = ability;
  if (Object.keys(boosts).length > 0) pokeOptions.boosts = boosts;

  const poke = new Pokemon(generation, name, pokeOptions);
  
  poke.rawStats = rawStats;
  poke.stats = rawStats;
  
  // Apply status
  if (status) {
    (poke as any).status = status;
  }
  
  return poke;
};

export const calculateChampionsDamage = (
  gen: any,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
) => {
  return calculate(gen, attacker, defender, move, field);
};

/**
 * Full damage calculation result with 16 damage rolls.
 * Returns HP values, percentages, and KO indicators.
 */
export interface DamageResult {
  rolls: number[];
  minHp: number;
  maxHp: number;
  minPct: number;
  maxPct: number;
  defenderHp: number;
  isOhko: boolean;
  is2hko: boolean;
  is3hko: boolean;
}

export const calculateFullDamageResult = (
  gen: any,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
): DamageResult | null => {
  const result = calculate(gen, attacker, defender, move, field);
  
  if (!result || !result.damage || !Array.isArray(result.damage)) return null;

  const rolls = result.damage as number[];
  const defenderHp = defender.stats.hp;
  
  const minHp = Math.min(...rolls);
  const maxHp = Math.max(...rolls);
  const minPct = Math.round((minHp / defenderHp) * 1000) / 10;
  const maxPct = Math.round((maxHp / defenderHp) * 1000) / 10;
  
  const isOhko = minHp >= defenderHp;
  const is2hko = !isOhko && minHp * 2 >= defenderHp;
  const is3hko = !isOhko && !is2hko && minHp * 3 >= defenderHp;

  return {
    rolls,
    minHp,
    maxHp,
    minPct,
    maxPct,
    defenderHp,
    isOhko,
    is2hko,
    is3hko,
  };
};
