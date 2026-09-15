import type { TeamCard, EnemyProfile } from '../types/store';
import { TYPE_CHART } from './typeChart';

const NATURE_MULTIPLIERS: Record<string, Record<string, number>> = {
  hp: { Serious: 1, Hardy: 1, Lonely: 1, Adamant: 1, Naughty: 1, Brave: 1, Bold: 1, Impish: 1, Lax: 1, Relaxed: 1, Modest: 1, Mild: 1, Rash: 1, Quiet: 1, Calm: 1, Gentle: 1, Careful: 1, Sassy: 1, Timid: 1, Hasty: 1, Jolly: 1, Naive: 1 },
  atk: { Lonely: 1.1, Adamant: 1.1, Naughty: 1.1, Brave: 1.1, Bold: 0.9, Timid: 0.9, Calm: 0.9, Modest: 0.9 },
  def: { Bold: 1.1, Impish: 1.1, Lax: 1.1, Relaxed: 1.1, Lonely: 0.9, Mild: 0.9, Gentle: 0.9, Hasty: 0.9 },
  spa: { Modest: 1.1, Mild: 1.1, Rash: 1.1, Quiet: 1.1, Adamant: 0.9, Impish: 0.9, Careful: 0.9, Jolly: 0.9 },
  spd: { Calm: 1.1, Gentle: 1.1, Careful: 1.1, Sassy: 1.1, Naughty: 0.9, Lax: 0.9, Rash: 0.9, Naive: 0.9 },
  spe: { Timid: 1.1, Hasty: 1.1, Jolly: 1.1, Naive: 1.1, Brave: 0.9, Relaxed: 0.9, Quiet: 0.9, Sassy: 0.9 },
};

export interface MemberThreatResult {
  myMemberId: string;
  myMemberName: string;
  enemyMemberId: string;
  enemyMemberName: string;
  mySpeed: number;
  enemySpeed: number;
  speedStatus: 'faster' | 'slower' | 'tie';
  enemySEAgainstMe: { move: string; type: string; multiplier: number; basePower: number }[];
  mySEAgainstEnemy: { move: string; type: string; multiplier: number; basePower: number }[];
  threatFactor: number;
}

export interface ThreatScoreResult {
  enemyTeamId: string;
  totalScore: number;
  memberResults: MemberThreatResult[];
  endangeredCount: number;
}

export interface LeadResult {
  members: TeamCard[];
  score: number;
  speedAdvantage: number;
  seCoverage: number;
  defensiveSafety: number;
  synergyBonus: number;
  reasoning: string[];
}

export interface LeadAnalysisResult {
  myLeads: LeadResult[];
  enemyLeads: LeadResult[];
  comparisons: { myLead: LeadResult; enemyLead: LeadResult; myWins: boolean }[];
}

export type PatternFlag = 'PERISH' | 'WEATHER' | 'TR' | 'STALL' | 'SUN' | 'RAIN' | 'SAND' | 'SNOW';

interface PokemonDef {
  types: string[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
}

function getBaseSpeed(member: TeamCard, def: PokemonDef | undefined): number {
  if (!def) return 0;
  const base = def.baseStats.spe;
  const natureMult = NATURE_MULTIPLIERS.spe[member.nature] || 1;
  const scarfMult = member.item === 'Choice Scarf' ? 1.5 : 1;
  return Math.floor(base * natureMult * scarfMult);
}

function isSE(attackingType: string, defendingTypes: string[]): number {
  let mult = 1;
  for (const defType of defendingTypes) {
    const chart = TYPE_CHART[attackingType];
    if (chart && chart[defType] !== undefined) {
      mult *= chart[defType];
    }
  }
  return mult;
}

function getMoveType(moveId: string, formatMoves: Record<string, any>): string {
  return formatMoves[moveId]?.type || 'Normal';
}

function getMoveBasePower(moveId: string, formatMoves: Record<string, any>): number {
  return formatMoves[moveId]?.basePower || 0;
}

export function analyzeMemberPair(
  myMember: TeamCard,
  enemyMember: TeamCard,
  myDef: PokemonDef | undefined,
  enemyDef: PokemonDef | undefined,
  formatMoves: Record<string, any>,
): MemberThreatResult {
  const mySpeed = getBaseSpeed(myMember, myDef);
  const enemySpeed = getBaseSpeed(enemyMember, enemyDef);

  const speedStatus: 'faster' | 'slower' | 'tie' =
    mySpeed > enemySpeed ? 'faster' : mySpeed < enemySpeed ? 'slower' : 'tie';

  const enemySEAgainstMe: MemberThreatResult['enemySEAgainstMe'] = [];
  for (const moveId of enemyMember.moves) {
    if (!moveId) continue;
    const type = getMoveType(moveId, formatMoves);
    const bp = getMoveBasePower(moveId, formatMoves);
    const mult = isSE(type, myDef?.types || []);
    if (mult > 1 && bp > 0) {
      enemySEAgainstMe.push({ move: moveId, type, multiplier: mult, basePower: bp });
    }
  }

  const mySEAgainstEnemy: MemberThreatResult['mySEAgainstEnemy'] = [];
  for (const moveId of myMember.moves) {
    if (!moveId) continue;
    const type = getMoveType(moveId, formatMoves);
    const bp = getMoveBasePower(moveId, formatMoves);
    const mult = isSE(type, enemyDef?.types || []);
    if (mult > 1 && bp > 0) {
      mySEAgainstEnemy.push({ move: moveId, type, multiplier: mult, basePower: bp });
    }
  }

  const speedWeight = speedStatus === 'faster' ? 1.5 : speedStatus === 'slower' ? 0.5 : 1;
  const offThreat = enemySEAgainstMe.reduce((sum, m) => sum + m.multiplier * m.basePower, 0) / 200;
  const counterThreat = mySEAgainstEnemy.reduce((sum, m) => sum + m.multiplier * m.basePower, 0) / 200;
  const threatFactor = Math.max(0, Math.min(1, speedWeight * offThreat - 0.5 * counterThreat));

  return {
    myMemberId: myMember.id,
    myMemberName: myMember.name,
    enemyMemberId: enemyMember.id,
    enemyMemberName: enemyMember.name,
    mySpeed,
    enemySpeed,
    speedStatus,
    enemySEAgainstMe,
    mySEAgainstEnemy,
    threatFactor,
  };
}

export function computeThreatScore(
  myTeam: TeamCard[],
  enemyTeam: EnemyProfile,
  formatData: any,
): ThreatScoreResult {
  const fmt = formatData[enemyTeam.regulation];
  if (!fmt) return { enemyTeamId: enemyTeam.id, totalScore: 0, memberResults: [], endangeredCount: 0 };

  const pokemon = fmt.pokemon as Record<string, any>;
  const moves = fmt.moves as Record<string, any>;

  const memberResults: MemberThreatResult[] = [];
  let totalThreat = 0;
  let endangered = 0;

  for (const enemyMember of enemyTeam.members) {
    let maxThreat = 0;
    for (const myMember of myTeam) {
      const result = analyzeMemberPair(myMember, enemyMember, pokemon[myMember.pokemonId], pokemon[enemyMember.pokemonId], moves);
      memberResults.push(result);
      maxThreat = Math.max(maxThreat, result.threatFactor);
    }
    totalThreat += maxThreat;
    if (maxThreat > 0.5) endangered++;
  }

  const avgMembers = enemyTeam.members.length || 1;
  const totalScore = Math.round((totalThreat / avgMembers) * 100);

  return { enemyTeamId: enemyTeam.id, totalScore, memberResults, endangeredCount: endangered };
}

export function analyzeLeads(
  myTeam: TeamCard[],
  enemyTeam: TeamCard[],
  myFormatPokemon: Record<string, any>,
  enemyFormatPokemon: Record<string, any>,
  formatMoves: Record<string, any>,
): LeadAnalysisResult {
  const pairs = (team: TeamCard[]): [TeamCard, TeamCard][] => {
    const result: [TeamCard, TeamCard][] = [];
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        result.push([team[i], team[j]]);
      }
    }
    return result;
  };

  const scoreLead = (lead: TeamCard[], vsTeam: TeamCard[], vsDefs: Record<string, any>): LeadResult => {
    let speedSum = 0;
    let seSum = 0;
    let defSum = 0;
    const reasoning: string[] = [];
    const totalEnemy = vsTeam.length || 1;

    for (const member of lead) {
      const def = vsDefs[member.pokemonId];
      speedSum += getBaseSpeed(member, def);
    }

    const avgEnemySpeed = vsTeam.reduce((s, m) => s + getBaseSpeed(m, vsDefs[m.pokemonId]), 0) / totalEnemy;
    const speedAdvantage = Math.min(1, speedSum / 2 / Math.max(1, avgEnemySpeed));

    if (speedAdvantage > 0.8) reasoning.push('Speed advantage');

    for (const member of lead) {
      for (const enemy of vsTeam) {
        for (const moveId of member.moves) {
          if (!moveId) continue;
          const type = getMoveType(moveId, formatMoves);
          const bp = getMoveBasePower(moveId, formatMoves);
          const mult = isSE(type, vsDefs[enemy.pokemonId]?.types || []);
          if (mult > 1 && bp > 0) {
            seSum += mult * bp;
          }
          if (mult === 0 || mult < 1) {
            defSum += 1;
          }
        }
      }
    }

    const seCoverage = Math.min(1, seSum / (totalEnemy * 200));
    const defensiveSafety = Math.min(1, defSum / (totalEnemy * 4));

    let synergyBonus = 0;
    let enemyPenalty = 0;

    // ── Positive synergies (within your lead) ──

    // Fake Out pressure
    const hasFakeOut = lead.some((m) => m.moves.includes('fakeout'));
    if (hasFakeOut) {
      synergyBonus += 0.10;
      reasoning.push('Fake Out pressure');
    }

    // Weather + speed ability (strong synergy)
    const weatherSetters = ['drizzle', 'drought', 'sandstream', 'snowwarning'];
    const speedAbilities = ['chlorophyll', 'swiftswim', 'sandrush', 'slushrush'];
    const hasWeather = lead.some((m) => weatherSetters.includes(m.ability.toLowerCase()));
    const hasSpeedAbility = lead.some((m) => speedAbilities.includes(m.ability.toLowerCase()));
    if (hasWeather && hasSpeedAbility) {
      synergyBonus += 0.35;
      reasoning.push('Weather + speed ability');
    }

    // Prankster support (Tailwind, Encore, Taunt + offensive ally)
    const hasPrankster = lead.some((m) => m.ability.toLowerCase() === 'prankster');
    const pranksterMon = lead.find((m) => m.ability.toLowerCase() === 'prankster');
    const hasSupportMoves = pranksterMon && pranksterMon.moves.some((mv) =>
      ['tailwind', 'encore', 'taunt', 'helpinghand', 'sunnyday', 'raindance'].includes(mv.toLowerCase()),
    );
    const ally = lead.find((m) => m !== pranksterMon && m.ability.toLowerCase() !== 'prankster');
    if (hasPrankster && hasSupportMoves && ally) {
      synergyBonus += 0.20;
      reasoning.push('Prankster support');
    }

    // Redirection + setup sweeper
    const redirectMoves = ['ragepowder', 'followme', 'spotlight'];
    const setupMoves = ['dragondance', 'swordsdance', 'calmmind', 'nastyplot', 'irondefense', 'bulkup', 'quiverdance', 'tidyup'];
    const hasRedirect = lead.some((m) => m.moves.some((mv) => redirectMoves.includes(mv.toLowerCase())));
    const hasSetup = lead.some((m) => m.moves.some((mv) => setupMoves.includes(mv.toLowerCase())));
    if (hasRedirect && hasSetup) {
      synergyBonus += 0.20;
      reasoning.push('Redirection + setup');
    }

    // Trick Room synergy (setter + slow sweeper with base speed < 60)
    const hasTR = lead.some((m) => m.moves.map((mv) => mv.toLowerCase()).includes('trickroom'));
    const trMon = lead.find((m) => m.moves.map((mv) => mv.toLowerCase()).includes('trickroom'));
    const slowSweeper = lead.find((m) => {
      if (m === trMon) return false;
      const def = vsDefs[m.pokemonId];
      return def && def.baseStats?.spe <= 60;
    });
    if (hasTR && slowSweeper) {
      synergyBonus += 0.25;
      reasoning.push('Trick Room + slow sweeper');
    }

    // Wide Guard + spread move ally
    const hasWideGuard = lead.some((m) => m.moves.map((mv) => mv.toLowerCase()).includes('wideguard'));
    const spreadMoves = ['earthquake', 'heatwave', 'rockslide', 'dazzlinggleam', 'hypervoice', 'discharge', 'muddywater', 'surf', 'petalblizzard', 'eruption', 'waterspout'];
    const hasSpread = lead.some((m) => m.moves.some((mv) => spreadMoves.includes(mv.toLowerCase())));
    if (hasWideGuard && hasSpread) {
      synergyBonus += 0.10;
      reasoning.push('Wide Guard + spread');
    }

    // Unburden + consumable item
    const consumableItems = ['whiteherb', 'focussash', 'sitrusberry', 'oranberry', 'lumberry', 'mentalherb', 'powerherb', 'orber', 'seed'];
    const hasUnburden = lead.some((m) => m.ability.toLowerCase() === 'unburden');
    const hasConsumable = lead.some((m) => consumableItems.some((ci) => m.item.toLowerCase().includes(ci)));
    if (hasUnburden && hasConsumable) {
      synergyBonus += 0.15;
      reasoning.push('Unburden + consumable');
    }

    // Beat Up + Justified
    const hasBeatUp = lead.some((m) => m.moves.map((mv) => mv.toLowerCase()).includes('beatup'));
    const hasJustified = lead.some((m) => m.ability.toLowerCase() === 'justified');
    if (hasBeatUp && hasJustified) {
      synergyBonus += 0.25;
      reasoning.push('Beat Up + Justified');
    }

    // ── Negative interactions with enemy team ──

    // Intimidate → enemy Defiant/Competitive (HUGE anti-synergy)
    const hasIntimidate = lead.some((m) => m.ability.toLowerCase() === 'intimidate');
    const enemyBoostedByIntimidate = vsTeam.some((enemy) =>
      ['defiant', 'competitive'].includes(enemy.ability.toLowerCase()),
    );
    if (hasIntimidate && enemyBoostedByIntimidate) {
      enemyPenalty += 0.30;
      reasoning.push('⚠ Intimidate triggers enemy Defiant/Competitive');
    }

    // Intimidate wasted on Clear Body/Full Metal Body/Hyper Cutter
    if (hasIntimidate) {
      const allClear = vsTeam.every((enemy) =>
        ['clearbody', 'fullmetalbody', 'hypercutter', 'innerfocus', 'oblivious', 'owntempo', 'scrappy'].includes(enemy.ability.toLowerCase()),
      );
      if (allClear && vsTeam.length > 0) {
        enemyPenalty += 0.10;
        reasoning.push('⚠ Intimidate blocked by enemy abilities');
      }
    }

    // Your weather also benefits enemy speed abilities
    if (hasWeather) {
      const enemyBenefits = vsTeam.some((enemy) =>
        speedAbilities.includes(enemy.ability.toLowerCase()),
      );
      if (enemyBenefits) {
        enemyPenalty += 0.10;
        reasoning.push('⚠ Weather also helps enemy speed');
      }
    }

    // Fake Out useless if enemy team is all Ghost or has Inner Focus/Covert Cloak-like
    if (hasFakeOut) {
      const allImmune = vsTeam.every((enemy) => {
        const def = vsDefs[enemy.pokemonId];
        const isGhost = def?.types?.includes('Ghost');
        const hasInner = enemy.ability.toLowerCase() === 'innerfocus';
        return isGhost || hasInner;
      });
      if (allImmune && vsTeam.length > 0) {
        enemyPenalty += 0.10;
        reasoning.push('⚠ Fake Out blocked by enemy');
      }
    }

    synergyBonus = Math.max(0, synergyBonus - enemyPenalty);

    const score = (speedAdvantage * 0.25 + seCoverage * 0.30 + defensiveSafety * 0.25 + synergyBonus * 0.20);
    return { members: lead, score, speedAdvantage, seCoverage, defensiveSafety, synergyBonus, reasoning };
  };

  const myPairs = pairs(myTeam);
  const myLeads = myPairs
    .map((lead) => scoreLead(lead, enemyTeam, enemyFormatPokemon))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const enemyPairs = pairs(enemyTeam);
  const enemyLeads = enemyPairs
    .map((lead) => scoreLead(lead, myTeam, myFormatPokemon))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const comparisons: LeadAnalysisResult['comparisons'] = [];
  for (const myLead of myLeads.slice(0, 3)) {
    for (const enemyLead of enemyLeads.slice(0, 3)) {
      comparisons.push({ myLead, enemyLead, myWins: myLead.score > enemyLead.score });
    }
  }

  return { myLeads, enemyLeads, comparisons };
}

export function detectPatterns(members: TeamCard[]): string[] {
  const patterns: string[] = [];
  const allMoves = members.flatMap((m) => m.moves.map((mv) => mv.toLowerCase()));
  const allAbilities = members.map((m) => m.ability.toLowerCase());

  if (allMoves.includes('perishsong') && allAbilities.includes('shadow tag')) {
    patterns.push('PERISH');
  }

  if (allAbilities.includes('drizzle')) patterns.push('RAIN');
  else if (allAbilities.includes('drought')) patterns.push('SUN');
  else if (allAbilities.includes('sand stream')) patterns.push('SAND');
  else if (allAbilities.includes('snow warning')) patterns.push('SNOW');

  if (patterns.some((p) => ['RAIN', 'SUN', 'SAND', 'SNOW'].includes(p))) {
    patterns.push('WEATHER');
  }

  if (allMoves.includes('trickroom')) {
    patterns.push('TR');
  }

  const stallMoves = ['toxic', 'willowisp', 'recover', 'roost', 'softboiled', 'protect', 'spikes', 'stealthrock'];
  if (stallMoves.filter((m) => allMoves.includes(m)).length >= 3) {
    patterns.push('STALL');
  }

  return patterns;
}
