import { TYPE_CHART, TYPES } from './typeChart';
import type { TeamCard } from '../types/store';
import { getMegaFormId } from './megaUtils';

export interface MoveCoverage {
  name: string;
  type: string;
  isStab: boolean;
}

export interface TypeCoverage {
  covered: boolean;
  hasStab: boolean;
  moves: MoveCoverage[];
}

export interface MemberCoverage {
  id: string;
  name: string;
  types: string[];
  spriteName: string;
  coverage: Record<string, TypeCoverage>;
}

/**
 * Resolve the effective types of a team member, considering mega evolution and Tera type.
 */
function getEffectiveTypes(
  member: TeamCard,
  activeFormat: any,
  useTera: boolean
): string[] {
  if (useTera) return [member.teraType];

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

/**
 * Calculate offensive coverage for a team.
 * Returns per-member data showing which defending types are covered by their damaging moves.
 */
export function getOffensiveCoverage(
  team: TeamCard[],
  activeFormat: any,
  useTera: boolean = false
): MemberCoverage[] {
  return team.map(member => {
    const effectiveTypes = getEffectiveTypes(member, activeFormat, useTera);

    // Resolve sprite name (mega form if applicable)
    const baseDef = activeFormat?.pokemon?.[member.pokemonId];
    let spriteName = member.name;
    if (baseDef) {
      const itemDef = member.item
        ? Object.values(activeFormat?.items || {}).find((i: any) => i.name === member.item) as any
        : null;
      const megaId = getMegaFormId(itemDef, baseDef);
      if (megaId && activeFormat?.pokemon?.[megaId]) {
        spriteName = activeFormat.pokemon[megaId].name;
      } else {
        spriteName = baseDef.name;
      }
    }

    // Collect damaging moves only
    const damagingMoves: { name: string; type: string }[] = [];
    for (const moveId of member.moves) {
      if (!moveId) continue;
      const moveDef = activeFormat?.moves?.[moveId];
      if (!moveDef) continue;
      // Exclude Status moves and moves with 0 basePower
      if (moveDef.category === 'Status' || moveDef.basePower === 0) continue;
      damagingMoves.push({ name: moveDef.name, type: moveDef.type });
    }

    // Build coverage per defending type
    const coverage: Record<string, TypeCoverage> = {};
    for (const defType of TYPES) {
      const coveringMoves: MoveCoverage[] = [];

      for (const move of damagingMoves) {
        const row = TYPE_CHART[move.type];
        const mult = row?.[defType];
        if (mult !== undefined && mult >= 2) {
          const isStab = effectiveTypes.includes(move.type);
          coveringMoves.push({ name: move.name, type: move.type, isStab });
        }
      }

      coverage[defType] = {
        covered: coveringMoves.length > 0,
        hasStab: coveringMoves.some(m => m.isStab),
        moves: coveringMoves,
      };
    }

    return {
      id: member.id,
      name: member.name,
      types: effectiveTypes,
      spriteName,
      coverage,
    };
  });
}
