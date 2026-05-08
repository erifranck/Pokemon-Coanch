import type { TeamCard, ThreatCard } from '../types/store';
import { createChampionsPokemon, calculateFullDamageResult } from './calcAdapter';
import { Generations, Move, Field } from '@smogon/calc';
import { getMegaFormId } from './megaUtils';

const gen = Generations.get(9);

export interface MatchupResult {
  // Speed
  threatSpeed: number;
  mySpeed: number;
  speedStatus: 'faster' | 'slower' | 'tie'; // from threat's perspective

  // Threat → Team Member
  threatBestMove: string;
  threatDamage: number;      // max HP damage
  threatMaxPct: number;
  threatKOPotential: 'OHKO' | '2HKO' | '3HKO' | '4HKO+';
  threatCategory: string;

  // Team Member → Threat
  myBestMove: string;
  myDamage: number;
  myMaxPct: number;
  myKOPotential: 'OHKO' | '2HKO' | '3HKO' | '4HKO+';
  myCategory: string;
}

function getKOPotential(_minPct: number, maxPct: number): 'OHKO' | '2HKO' | '3HKO' | '4HKO+' {
  if (maxPct >= 100) return 'OHKO';
  if (maxPct >= 50) return '2HKO';
  if (maxPct >= 34) return '3HKO';
  return '4HKO+';
}

function getFormName(baseName: string, form: 'attack' | 'defense'): string {
  // Aegislash: Stance Change — use Blade for attacking, Shield for defending
  if (baseName === 'Aegislash') {
    return form === 'attack' ? 'Aegislash-Blade' : 'Aegislash-Shield';
  }
  return baseName;
}

function resolvePokemonDef(member: TeamCard | ThreatCard, activeFormat: any) {
  const baseDef = activeFormat?.pokemon?.[member.pokemonId];
  if (!baseDef || !baseDef.baseStats) return null;
  const itemDef = member.item
    ? Object.values(activeFormat?.items || {}).find((i: any) => i.name === member.item) as any
    : null;
  const megaId = getMegaFormId(itemDef, baseDef);
  if (megaId && activeFormat?.pokemon?.[megaId]) {
    return activeFormat.pokemon[megaId];
  }
  return baseDef;
}

export function calculateMatchup(
  threat: ThreatCard,
  teamMember: TeamCard,
  activeFormat: any
): MatchupResult | null {
  try {
    const threatDef = resolvePokemonDef(threat, activeFormat);
    const myDef = resolvePokemonDef(teamMember, activeFormat);
    if (!threatDef || !myDef) return null;

    // Create Pokemon objects (ensure sps is never undefined)
    const threatSps = threat.sps || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const mySps = teamMember.sps || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    // Aegislash has Stance Change: Blade form when attacking, Shield when defending
    const pThreatAttack = createChampionsPokemon(gen, getFormName(threatDef.name, 'attack'), threatDef.baseStats, threatSps, threat.nature, {
      item: threat.item,
      ability: threat.ability || Object.values(threatDef.abilities || {})[0] as string,
    });

    const pThreatDefend = createChampionsPokemon(gen, getFormName(threatDef.name, 'defense'), threatDef.baseStats, threatSps, threat.nature, {
      item: threat.item,
      ability: threat.ability || Object.values(threatDef.abilities || {})[0] as string,
    });

    const pMine = createChampionsPokemon(gen, myDef.name, myDef.baseStats, mySps, teamMember.nature, {
      item: teamMember.item,
      ability: teamMember.ability || Object.values(myDef.abilities || {})[0] as string,
    });

    // Speed (use attack form stats — same speed for Aegislash both forms)
    const threatSpeed = pThreatAttack.stats.spe;
    const mySpeed = pMine.stats.spe;
    const speedStatus: 'faster' | 'slower' | 'tie' =
      threatSpeed > mySpeed ? 'faster' : threatSpeed < mySpeed ? 'slower' : 'tie';

    // Neutral field (Doubles)
    const field = new Field({ gameType: 'Doubles' });

    // Threat → Team Member: threat attacks (Blade form for Aegislash)
    let threatBest: { name: string; maxPct: number; category: string; damage: number } | null = null;
    for (const moveId of threat.moves) {
      if (!moveId) continue;
      const moveDef = activeFormat?.moves?.[moveId];
      if (!moveDef || moveDef.category === 'Status' || moveDef.basePower === 0) continue;
      try {
        const move = new Move(gen, moveDef.name);
        const result = calculateFullDamageResult(gen, pThreatAttack, pMine, move, field);
        if (result && (!threatBest || result.maxPct > threatBest.maxPct)) {
          threatBest = { name: moveDef.name, maxPct: result.maxPct, category: moveDef.category, damage: result.maxHp };
        }
      } catch {}
    }

    // Team Member → Threat: we attack (Shield form for Aegislash)
    let myBest: { name: string; maxPct: number; category: string; damage: number } | null = null;
    for (const moveId of teamMember.moves) {
      if (!moveId) continue;
      const moveDef = activeFormat?.moves?.[moveId];
      if (!moveDef || moveDef.category === 'Status' || moveDef.basePower === 0) continue;
      try {
        const move = new Move(gen, moveDef.name);
        const result = calculateFullDamageResult(gen, pMine, pThreatDefend, move, field);
        if (result && (!myBest || result.maxPct > myBest.maxPct)) {
          myBest = { name: moveDef.name, maxPct: result.maxPct, category: moveDef.category, damage: result.maxHp };
        }
      } catch {}
    }

    return {
      threatSpeed,
      mySpeed,
      speedStatus,

      threatBestMove: threatBest?.name || '—',
      threatDamage: threatBest?.damage || 0,
      threatMaxPct: Math.round((threatBest?.maxPct || 0) * 10) / 10,
      threatKOPotential: threatBest ? getKOPotential(0, threatBest.maxPct) : '4HKO+',
      threatCategory: threatBest?.category || '—',

      myBestMove: myBest?.name || '—',
      myDamage: myBest?.damage || 0,
      myMaxPct: Math.round((myBest?.maxPct || 0) * 10) / 10,
      myKOPotential: myBest ? getKOPotential(0, myBest.maxPct) : '4HKO+',
      myCategory: myBest?.category || '—',
    };
  } catch {
    // If anything fails (invalid Pokémon, missing data, etc.), return null
    return null;
  }
}

export interface CoverageSummary {
  threat: ThreatCard;
  matchups: (MatchupResult | null)[];
  endangeredCount: number;  // how many team members are in danger
}

export function analyzeAllMatchups(
  threats: ThreatCard[],
  team: TeamCard[],
  activeFormat: any
): CoverageSummary[] {
  return threats.map(threat => {
    const matchups = team.map(member => calculateMatchup(threat, member, activeFormat));
    const endangeredCount = matchups.filter(m => {
      if (!m) return false;
      // Endangered = threat is faster AND can OHKO or 2HKO
      return (m.speedStatus === 'faster' || m.speedStatus === 'tie') &&
        (m.threatKOPotential === 'OHKO' || m.threatKOPotential === '2HKO');
    }).length;

    return { threat, matchups, endangeredCount };
  });
}
