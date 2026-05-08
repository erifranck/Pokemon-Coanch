import { TYPE_CHART, TYPES } from './typeChart';
import { getImmunityTypes } from './abilityImmunities';
import { getMegaFormId } from './megaUtils';
import type { PokemonCard } from '../types/store';

// ── Types ──

export interface CoreEntry {
  name: string;
  icon: string;
  members: PokemonCard[];
  score: number;
  details: MemberCoverageDetail[];
}

export interface MemberCoverageDetail {
  member: PokemonCard;
  weaknesses: string[];
  coveredBy: string[];  // which weaknesses are covered by teammates
  uncovered: string[];   // which weaknesses are NOT covered
}

export interface CoreAnalysis {
  recognizedCores: CoreEntry[];
  topPairs: CoreEntry[];
  topTriples: CoreEntry[];
}

// ── Helpers ──

function getEffectiveTypes(member: PokemonCard, activeFormat: any): string[] {
  const baseDef = activeFormat?.pokemon?.[member.pokemonId];
  if (!baseDef) return ['Normal'];
  const itemDef = member.item
    ? Object.values(activeFormat?.items || {}).find((i: any) => i.name === member.item) as any
    : null;
  const megaId = getMegaFormId(itemDef, baseDef);
  if (megaId && activeFormat?.pokemon?.[megaId]) {
    return activeFormat.pokemon[megaId].types || baseDef.types;
  }
  return baseDef.types || ['Normal'];
}

function getEffectiveSpriteName(member: PokemonCard, activeFormat: any): string {
  const baseDef = activeFormat?.pokemon?.[member.pokemonId];
  if (!baseDef) return member.name;
  const itemDef = member.item
    ? Object.values(activeFormat?.items || {}).find((i: any) => i.name === member.item) as any
    : null;
  const megaId = getMegaFormId(itemDef, baseDef);
  if (megaId && activeFormat?.pokemon?.[megaId]) {
    return activeFormat.pokemon[megaId].name;
  }
  return baseDef.name;
}

function getAbilityImmunities(member: PokemonCard): string[] {
  if (!member.ability) return [];
  return getImmunityTypes(member.ability);
}

/**
 * Get the defensive multiplier for a defending type against an attacking type,
 * considering ability immunities.
 */
function getDefensiveMultiplier(
  defTypes: string[],
  atkType: string,
  abilityImmunities: string[]
): number {
  // Check ability-based immunity first
  if (abilityImmunities.includes(atkType)) return 0;
  // Then check type chart
  let mult = 1;
  for (const defType of defTypes) {
    const row = TYPE_CHART[atkType];
    if (row && row[defType] !== undefined) {
      mult *= row[defType];
    }
  }
  return mult;
}

/**
 * Get all types that hit this member for ≥2x (weaknesses).
 */
function getWeaknesses(member: PokemonCard, activeFormat: any): string[] {
  const types = getEffectiveTypes(member, activeFormat);
  const immunities = getAbilityImmunities(member);
  const weak: string[] = [];
  for (const atkType of TYPES) {
    const mult = getDefensiveMultiplier(types, atkType, immunities);
    if (mult >= 2) weak.push(atkType);
  }
  return weak;
}

/**
 * Get all types that this member resists (≤0.5x) or is immune to (0x).
 */
function getResistances(member: PokemonCard, activeFormat: any): string[] {
  const types = getEffectiveTypes(member, activeFormat);
  const immunities = getAbilityImmunities(member);
  const resist: string[] = [];
  for (const atkType of TYPES) {
    const mult = getDefensiveMultiplier(types, atkType, immunities);
    if (mult <= 0.5 || mult === 0) resist.push(atkType);
  }
  return resist;
}

// ── Weakness coverage detail ──

function getCoverageDetail(
  members: PokemonCard[],
  activeFormat: any
): MemberCoverageDetail[] {
  // Pre-compute weaknesses and resistances for all members
  const data = members.map(m => ({
    member: m,
    weaknesses: getWeaknesses(m, activeFormat),
  }));
  const allResistances = members.map(m => getResistances(m, activeFormat));

  return data.map(({ member, weaknesses }, i) => {
    // Collect all resistance types from OTHER members
    const teammateResists = new Set<string>();
    for (let j = 0; j < members.length; j++) {
      if (j === i) continue;
      for (const r of allResistances[j]) {
        teammateResists.add(r);
      }
    }

    const coveredBy = weaknesses.filter(w => teammateResists.has(w));
    const uncovered = weaknesses.filter(w => !teammateResists.has(w));

    return { member, weaknesses, coveredBy, uncovered };
  });
}

function computeScore(details: MemberCoverageDetail[]): number {
  const totalWeak = details.reduce((sum, d) => sum + d.weaknesses.length, 0);
  const totalCovered = details.reduce((sum, d) => sum + d.coveredBy.length, 0);
  if (totalWeak === 0) return 100;
  return Math.round((totalCovered / totalWeak) * 100);
}

// ── Recognized cores ──

const RECOGNIZED_CORES = [
  { name: 'Fire/Water/Grass', icon: '🔥💧🌿', types: ['Fire', 'Water', 'Grass'] },
  { name: 'Fantasy (Fairy/Dragon/Steel)', icon: '🧚🐉⚙️', types: ['Fairy', 'Dragon', 'Steel'] },
  { name: 'Fighting/Dark/Psychic', icon: '👊🌑🔮', types: ['Fighting', 'Dark', 'Psychic'] },
  { name: 'Electric/Water/Ground', icon: '⚡💧🌍', types: ['Electric', 'Water', 'Ground'] },
  { name: 'Dark/Fighting/Ghost', icon: '🌑👊👻', types: ['Dark', 'Fighting', 'Ghost'] },
];

function detectRecognizedCores(team: PokemonCard[], activeFormat: any): CoreEntry[] {
  const results: CoreEntry[] = [];

  for (const core of RECOGNIZED_CORES) {
    // For each type in the core, find ALL members that have that type
    const membersByType: Map<string, PokemonCard[]> = new Map();
    for (const t of core.types) {
      membersByType.set(t, []);
    }

    for (const member of team) {
      const types = getEffectiveTypes(member, activeFormat);
      for (const t of core.types) {
        if (types.includes(t)) {
          membersByType.get(t)!.push(member);
        }
      }
    }

    // Check if all types are covered
    const allCovered = core.types.every(t => membersByType.get(t)!.length > 0);
    if (!allCovered) continue;

    // Generate all combinations: pick one member per type
    const combinations = cartesianProduct(
      core.types.map(t => membersByType.get(t)!)
    );

    for (const combo of combinations) {
      // Deduplicate (same Pokémon can't be two members of the same core)
      const uniqueIds = new Set(combo.map(m => m.id));
      if (uniqueIds.size < core.types.length) continue;

      const details = getCoverageDetail(combo, activeFormat);
      const score = computeScore(details);

      results.push({
        name: core.name,
        icon: core.icon,
        members: combo,
        score,
        details,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

// ── Pairs and triples ──

function scorePair(a: PokemonCard, b: PokemonCard, activeFormat: any): CoreEntry {
  const members = [a, b];
  const details = getCoverageDetail(members, activeFormat);
  const score = computeScore(details);
  return { name: `${a.name} + ${b.name}`, icon: '', members, score, details };
}

function scoreTriple(a: PokemonCard, b: PokemonCard, c: PokemonCard, activeFormat: any): CoreEntry {
  const members = [a, b, c];
  const details = getCoverageDetail(members, activeFormat);
  const score = computeScore(details);
  return { name: `${a.name} + ${b.name} + ${c.name}`, icon: '', members, score, details };
}

// ── Cartesian product helper ──

function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  const rest = cartesianProduct(arrays.slice(1));
  return arrays[0].flatMap(x => rest.map(r => [x, ...r]));
}

// ── Combinations helper (n choose k) ──

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

// ── Main analysis ──

export function analyzeTeamCores(team: PokemonCard[], activeFormat: any): CoreAnalysis {
  if (team.length < 2) {
    return { recognizedCores: [], topPairs: [], topTriples: [] };
  }

  const recognizedCores = detectRecognizedCores(team, activeFormat);

  // Score all pairs
  const pairs = combinations(team, 2).map(([a, b]) => scorePair(a, b, activeFormat));
  const topPairs = pairs.sort((a, b) => b.score - a.score);

  // Score all triples
  const triples = team.length >= 3
    ? combinations(team, 3).map(([a, b, c]) => scoreTriple(a, b, c, activeFormat))
    : [];
  const topTriples = triples.sort((a, b) => b.score - a.score);

  return { recognizedCores, topPairs, topTriples };
}

// Re-export for convenience
export { getEffectiveSpriteName, getEffectiveTypes };
