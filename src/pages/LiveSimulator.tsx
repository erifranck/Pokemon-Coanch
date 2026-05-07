import React, { useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { createChampionsPokemon, calculateFullDamageResult, getNatureModifier } from '../utils/calcAdapter';
import formatData from '../data/format_data.json';
import { getMegaFormId } from '../utils/megaUtils';
import { getShowdownSpriteUrl } from '../utils/spriteUtils';
import { Combobox } from '../components/Combobox';
import { Field, Generations, Move } from '@smogon/calc';
import { TypeChip } from '../components/TypeChip';
import { useSimulatorState } from '../utils/useSimulatorState';

const gen = Generations.get(9);
const STAT_NAMES = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;

const getNatureColor = (statName: string, nature: string) => {
  const mod = getNatureModifier(statName, nature);
  if (mod > 1) return 'text-red-400';
  if (mod < 1) return 'text-blue-400';
  return 'text-gray-300';
};

const LiveSimulator: React.FC = () => {
  const { teams, activeTeamId, threats, relationships, updateTeamMember, updateThreat } = useAppStore();
  const team = teams[activeTeamId]?.members || [];
  const regulation = teams[activeTeamId]?.regulation || 'gen9championsvgc2026regma';
  
  const sim = useSimulatorState();
  const activeAllyId = sim.activeAllyId || team[0]?.id || '';
  const activeThreatId = sim.activeThreatId || '';
  const {
    weather, terrain,
    allyTailwind, threatTailwind,
    allyReflect, allyLightScreen, allyAuroraVeil,
    threatReflect, threatLightScreen, threatAuroraVeil,
    allyBurn, threatBurn,
    allyHelpingHand, threatHelpingHand,
    fairyAura, darkAura,
    allyBoosts, threatBoosts,
    allySps, threatSps,
    updateSimulator, resetSimulator,
  } = sim;

  const activeAlly = team.find(t => t.id === activeAllyId);
  const activeThreat = threats.find(t => t.id === activeThreatId);
  const activeFormat = (formatData as any)[regulation];

  // Initialize local SPs from card data
  useEffect(() => {
    if (activeAlly && (!allySps || Object.keys(allySps).length === 0)) {
      updateSimulator({ allySps: { ...activeAlly.sps } });
    }
  }, [activeAllyId]);

  useEffect(() => {
    if (activeThreat && (!threatSps || Object.keys(threatSps).length === 0)) {
      updateSimulator({ threatSps: { ...activeThreat.sps } });
    }
  }, [activeThreatId]);

  const linkedThreatIds = activeAllyId ? (relationships[activeAllyId] || []) : [];
  const linkedThreats = threats.filter(t => linkedThreatIds.includes(t.id));
  const otherThreats = threats.filter(t => !linkedThreatIds.includes(t.id));

  // Resolve Pokemon data including mega evolution
  const resolvePokemon = (member: any) => {
    if (!member || !activeFormat) return { def: null, megaId: null, stats: null, baseStats: null };
    const baseDef = activeFormat.pokemon?.[member.pokemonId];
    if (!baseDef) return { def: null, megaId: null, stats: null, baseStats: null };

    const itemDef = member.item ? Object.values(activeFormat.items || {}).find((i: any) => i.name === member.item) as any : null;
    const megaId = getMegaFormId(itemDef, baseDef);
    const effectiveDef = (megaId && activeFormat.pokemon?.[megaId]) ? activeFormat.pokemon[megaId] : baseDef;

    return { def: baseDef, megaId, effectiveDef };
  };

  const runCalcs = () => {
    if (!activeAlly || !activeThreat || !activeFormat) return null;

    const allyResolved = resolvePokemon(activeAlly);
    const threatResolved = resolvePokemon(activeThreat);
    if (!allyResolved.effectiveDef || !threatResolved.effectiveDef) return null;

    const allyDef = allyResolved.effectiveDef;
    const threatDef = threatResolved.effectiveDef;

    const pAlly = createChampionsPokemon(gen, allyDef.name, allyDef.baseStats, allySps, activeAlly.nature, {
      item: activeAlly.item,
      ability: Object.values(allyDef.abilities || {})[0] as string,
      boosts: allyBoosts,
      status: allyBurn ? 'brn' : '',
    });

    const pThreat = createChampionsPokemon(gen, threatDef.name, threatDef.baseStats, threatSps, activeThreat.nature, {
      item: activeThreat.item,
      ability: Object.values(threatDef.abilities || {})[0] as string,
      boosts: threatBoosts,
      status: threatBurn ? 'brn' : '',
    });

    // Field for ally attacking threat
    const allyField = new Field({
      weather: (weather || undefined) as any,
      terrain: (terrain || undefined) as any,
      attackerSide: { isTailwind: allyTailwind, isHelpingHand: allyHelpingHand },
      defenderSide: { isTailwind: threatTailwind, isReflect: threatReflect, isLightScreen: threatLightScreen, isAuroraVeil: threatAuroraVeil },
      isFairyAura: fairyAura,
      isDarkAura: darkAura,
    });

    // Field for threat attacking ally
    const threatField = new Field({
      weather: (weather || undefined) as any,
      terrain: (terrain || undefined) as any,
      attackerSide: { isTailwind: threatTailwind, isHelpingHand: threatHelpingHand },
      defenderSide: { isTailwind: allyTailwind, isReflect: allyReflect, isLightScreen: allyLightScreen, isAuroraVeil: allyAuroraVeil },
      isFairyAura: fairyAura,
      isDarkAura: darkAura,
    });

    // Speed
    let allySpe = pAlly.stats.spe;
    if (allyTailwind) allySpe *= 2;
    if (weather === 'Rain' && pAlly.ability === 'Swift Swim') allySpe *= 2;
    if (weather === 'Sun' && pAlly.ability === 'Chlorophyll') allySpe *= 2;
    if (allyBoosts['spe']) allySpe = Math.floor(allySpe * (Math.max(2, 2 + allyBoosts['spe']) / 2));

    let threatSpe = pThreat.stats.spe;
    if (threatTailwind) threatSpe *= 2;
    if (weather === 'Rain' && pThreat.ability === 'Swift Swim') threatSpe *= 2;
    if (weather === 'Sun' && pThreat.ability === 'Chlorophyll') threatSpe *= 2;
    if (threatBoosts['spe']) threatSpe = Math.floor(threatSpe * (Math.max(2, 2 + threatBoosts['spe']) / 2));

    const speeds = [
      { name: activeAlly.name, speed: allySpe, isAlly: true },
      { name: activeThreat.name, speed: threatSpe, isAlly: false }
    ].sort((a, b) => b.speed - a.speed);

    // Damage calcs
    const allyAttacks = activeAlly.moves.filter(m => m).map(moveId => {
      const moveDef = activeFormat.moves?.[moveId];
      if (!moveDef || moveDef.category === 'Status') return { name: moveId, bp: 0, category: 'Status', result: null };
      try {
        const move = new Move(gen, moveDef.name);
        const result = calculateFullDamageResult(gen, pAlly, pThreat, move, allyField);
        return { name: moveDef.name, bp: moveDef.basePower, category: moveDef.category, result };
      } catch {
        return { name: moveDef.name, bp: moveDef.basePower || 0, category: moveDef.category || 'Physical', result: null };
      }
    });

    const threatAttacks = activeThreat.moves.filter(m => m).map(moveId => {
      const moveDef = activeFormat.moves?.[moveId];
      if (!moveDef || moveDef.category === 'Status') return { name: moveId, bp: 0, category: 'Status', result: null };
      try {
        const move = new Move(gen, moveDef.name);
        const result = calculateFullDamageResult(gen, pThreat, pAlly, move, threatField);
        return { name: moveDef.name, bp: moveDef.basePower, category: moveDef.category, result };
      } catch {
        return { name: moveDef.name, bp: moveDef.basePower || 0, category: moveDef.category || 'Physical', result: null };
      }
    });

    return { speeds, allyAttacks, threatAttacks, pAlly, pThreat, allyDef, threatDef, allyResolved, threatResolved };
  };

  const calcs = useMemo(() => runCalcs(), [
    activeAlly, activeThreat, weather, terrain, allyTailwind, threatTailwind,
    allyReflect, allyLightScreen, allyAuroraVeil, threatReflect, threatLightScreen, threatAuroraVeil,
    allyBurn, threatBurn, allyHelpingHand, threatHelpingHand, allyBoosts, threatBoosts, fairyAura, darkAura, allySps, threatSps
  ]);

  const boostSetter = (isAlly: boolean, stat: string) => ({
    value: (isAlly ? allyBoosts[stat] : threatBoosts[stat]) || 0,
    onChange: (v: number) => {
      if (isAlly) {
        const next = { ...allyBoosts };
        if (v === 0) delete next[stat];
        else next[stat] = v;
        updateSimulator({ allyBoosts: next });
      } else {
        const next = { ...threatBoosts };
        if (v === 0) delete next[stat];
        else next[stat] = v;
        updateSimulator({ threatBoosts: next });
      }
    }
  });

  const renderStatRow = (label: string, statKey: string, pokemon: any, _sps: any, nature: string, boostVal: number, isAlly: boolean) => {
    const boostSet = boostSetter(isAlly, statKey);
    return (
      <div key={statKey} className="flex items-center justify-between text-xs mb-1">
        <span className={`w-8 font-bold uppercase ${getNatureColor(statKey, nature)}`}>{label}</span>
        <span className="w-10 text-right font-mono">{pokemon?.stats?.[statKey] || '-'}</span>
        <select 
          className="bg-gray-700 text-xs rounded w-12 mx-1"
          value={boostVal}
          onChange={(e) => boostSet.onChange(parseInt(e.target.value))}
        >
          {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map(v => (
            <option key={v} value={v}>{v === 0 ? '0' : v > 0 ? `+${v}` : v}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderDamageCard = (atk: any, side: 'ally' | 'enemy') => {
    const { result } = atk;
    if (atk.category === 'Status') {
      return (
        <div className="mb-3 p-3 bg-gray-700/50 rounded text-sm">
          <div className="font-bold text-gray-400">{atk.name}</div>
          <div className="text-gray-500 text-xs">Status Move</div>
        </div>
      );
    }
    if (!result) {
      return (
        <div className="mb-3 p-3 bg-gray-700/50 rounded text-sm">
          <div className="font-bold text-gray-400">{atk.name}</div>
          <div className="text-gray-500 text-xs">Error calculating</div>
        </div>
      );
    }

    const barPct = Math.min(result.maxPct, 100);
    const koText = result.isOhko ? '💀 OHKO' : result.is2hko ? '⚠️ 2HKO' : result.is3hko ? '3HKO' : '4HKO+';
    const koColor = result.isOhko ? 'text-red-400' : result.is2hko ? 'text-yellow-400' : 'text-gray-400';

    return (
      <div className="mb-3 p-3 bg-gray-700/50 rounded text-sm">
        <div className="flex justify-between items-start mb-1">
          <span className={`font-bold ${side === 'ally' ? 'text-blue-300' : 'text-red-300'}`}>
            {atk.name}
          </span>
          <span className="text-xs text-gray-500">{atk.bp} BP / {atk.category}</span>
        </div>
        
        <div className="flex justify-between font-mono text-xs mb-1">
          <span>{result.minHp} - {result.maxHp} HP</span>
          <span>{result.minPct}% - {result.maxPct}%</span>
        </div>
        
        <div className="w-full bg-gray-600 rounded-full h-2 mb-1">
          <div 
            className={`h-2 rounded-full ${result.isOhko ? 'bg-red-500' : result.is2hko ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold ${koColor}`}>{koText}</span>
          <span className="text-xs text-gray-500 cursor-help" title={result.rolls.join(', ')}>
            🔍 15/16 rolls
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Simulator</h1>
          <p className="text-gray-400">Real-time Matchup Calculator</p>
        </div>
      </div>

      {team.length === 0 ? (
        <div className="p-8 bg-gray-800 rounded text-center">Add Pokemon to your team first!</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: ALLY */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border-2 border-blue-900">
              <h2 className="text-blue-400 font-bold mb-4">Your Field</h2>
              <Combobox
                label="Select Ally"
                className="mb-5"
                value={activeAllyId}
                options={team.map(t => ({ id: t.id, label: t.name }))}
                onChange={(val) => updateSimulator({ activeAllyId: val })}
              />

              {activeAlly && calcs && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <img 
                      src={getShowdownSpriteUrl(calcs.allyDef?.name || activeAlly.name)}
                      alt={activeAlly.name}
                      className="w-40 h-40 bg-gray-700 rounded-full"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
                    />
                    <div className="ml-3">
                      <div className="font-bold">{calcs.allyDef.name}</div>
                      <div className="flex space-x-1 mt-1">
                        {(calcs.allyDef.types || []).map((t: string) => <TypeChip key={t} type={t} />)}
                      </div>
                    </div>
                  </div>
                  {STAT_NAMES.map(s => renderStatRow(s, s, calcs.pAlly, allySps, activeAlly.nature, allyBoosts[s] || 0, true))}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <h4 className="text-xs font-bold text-gray-400 mb-2">SP Tweaker (local)</h4>
                    {STAT_NAMES.map(s => {
                      const val = allySps[s] || 0;
                      return (
                        <div key={s} className="flex items-center text-xs mb-1">
                          <span className="w-8 uppercase text-gray-500">{s}</span>
                          <input type="range" min="0" max="32" value={val}
                            onChange={(e) => updateSimulator({ allySps: { ...allySps, [s]: parseInt(e.target.value) } })}
                            className="mx-1 flex-1 accent-blue-500" />
                          <span className="w-6 text-right font-mono text-blue-400">{val}</span>
                        </div>
                      );
                    })}
                    <button onClick={() => updateTeamMember(activeAlly.id, { sps: allySps as any })} 
                      className="w-full mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded">
                      💾 Save to {activeAlly.name}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MIDDLE: FIELD CONTROLS */}
            <div className="space-y-4">
              <button onClick={resetSimulator} className="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold rounded border border-gray-600">
                🔄 Reset All Modifiers
              </button>

              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h2 className="text-gray-300 font-bold mb-3 text-center">Field Conditions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <select className="bg-gray-700 p-1 rounded" value={weather} onChange={(e) => updateSimulator({ weather: e.target.value })}>
                    <option value="">No Weather</option>
                    <option value="Sun">Sun</option>
                    <option value="Rain">Rain</option>
                    <option value="Sand">Sand</option>
                    <option value="Snow">Snow</option>
                  </select>
                  <select className="bg-gray-700 p-1 rounded" value={terrain} onChange={(e) => updateSimulator({ terrain: e.target.value })}>
                    <option value="">No Terrain</option>
                    <option value="Grassy">Grassy</option>
                    <option value="Electric">Electric</option>
                    <option value="Psychic">Psychic</option>
                    <option value="Misty">Misty</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <label className="flex items-center space-x-1"><input type="checkbox" checked={fairyAura} onChange={() => updateSimulator({ fairyAura: !fairyAura })} /><span className="text-pink-400">Fairy Aura</span></label>
                  <label className="flex items-center space-x-1"><input type="checkbox" checked={darkAura} onChange={() => updateSimulator({ darkAura: !darkAura })} /><span className="text-purple-400">Dark Aura</span></label>
                  <label className="flex items-center space-x-1"><input type="checkbox" checked={allyTailwind} onChange={() => updateSimulator({ allyTailwind: !allyTailwind })} /><span>Ally Tailwind</span></label>
                  <label className="flex items-center space-x-1"><input type="checkbox" checked={threatTailwind} onChange={() => updateSimulator({ threatTailwind: !threatTailwind })} /><span>Enemy Tailwind</span></label>
                  <label className="flex items-center space-x-1"><input type="checkbox" checked={allyHelpingHand} onChange={() => updateSimulator({ allyHelpingHand: !allyHelpingHand })} /><span>Ally Help Hand</span></label>
                  <label className="flex items-center space-x-1"><input type="checkbox" checked={threatHelpingHand} onChange={() => updateSimulator({ threatHelpingHand: !threatHelpingHand })} /><span>Enemy Help Hand</span></label>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-xl border border-yellow-700">
                <h2 className="text-gray-300 font-bold mb-3 text-center">Defensive Screens</h2>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-blue-400 block mb-1">Ally Screens</span>
                    <label className="flex items-center space-x-1"><input type="checkbox" checked={allyReflect} onChange={() => updateSimulator({ allyReflect: !allyReflect })} /><span>Reflect</span></label>
                    <label className="flex items-center space-x-1"><input type="checkbox" checked={allyLightScreen} onChange={() => updateSimulator({ allyLightScreen: !allyLightScreen })} /><span>Light Screen</span></label>
                    <label className="flex items-center space-x-1"><input type="checkbox" checked={allyAuroraVeil} onChange={() => updateSimulator({ allyAuroraVeil: !allyAuroraVeil })} /><span>Aurora Veil</span></label>
                  </div>
                  <div>
                    <span className="text-red-400 block mb-1">Enemy Screens</span>
                    <label className="flex items-center space-x-1"><input type="checkbox" checked={threatReflect} onChange={() => updateSimulator({ threatReflect: !threatReflect })} /><span>Reflect</span></label>
                    <label className="flex items-center space-x-1"><input type="checkbox" checked={threatLightScreen} onChange={() => updateSimulator({ threatLightScreen: !threatLightScreen })} /><span>Light Screen</span></label>
                    <label className="flex items-center space-x-1"><input type="checkbox" checked={threatAuroraVeil} onChange={() => updateSimulator({ threatAuroraVeil: !threatAuroraVeil })} /><span>Aurora Veil</span></label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-xl border border-orange-700">
                <h2 className="text-orange-400 font-bold mb-3 text-center">⚕️ Status Conditions</h2>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-blue-400 block mb-1">Ally</span>
                    <label className="flex items-center space-x-1"><input type="checkbox" checked={allyBurn} onChange={() => updateSimulator({ allyBurn: !allyBurn })} /><span className="text-orange-400">🔥 Burn (Atk×½)</span></label>
                  </div>
                  <div>
                    <span className="text-red-400 block mb-1">Enemy</span>
                    <label className="flex items-center space-x-1"><input type="checkbox" checked={threatBurn} onChange={() => updateSimulator({ threatBurn: !threatBurn })} /><span className="text-orange-400">🔥 Burn (Atk×½)</span></label>
                  </div>
                </div>
              </div>

              {calcs && (
                <div className="bg-gray-800 p-4 rounded-xl border border-yellow-700">
                  <h3 className="font-bold text-yellow-500 mb-2">⚡ Speed Tiers</h3>
                  {calcs.speeds.map((s, i) => (
                    <div key={i} className={`flex justify-between p-1 border-b border-gray-700 ${s.isAlly ? 'text-blue-300' : 'text-red-300'}`}>
                      <span>{i+1}. {s.name}</span>
                      <span className="font-mono">{s.speed}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: THREAT */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border-2 border-red-900">
              <h2 className="text-red-400 font-bold mb-4">Enemy Field</h2>
              <Combobox
                label="Select Threat"
                value={activeThreatId}
                className="mb-5"
                options={[
                  ...linkedThreats.map(t => ({ id: t.id, label: `🔗 ${t.name}` })),
                  ...otherThreats.map(t => ({ id: t.id, label: t.name })),
                ]}
                onChange={(val) => updateSimulator({ activeThreatId: val })}
              />

              {activeThreat && calcs && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <img 
                      src={getShowdownSpriteUrl(calcs.threatDef?.name || activeThreat.name)}
                      alt={activeThreat.name}
                      className="w-40 h-40 bg-gray-700 rounded-full"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
                    />
                    <div className="ml-3">
                      <div className="font-bold">{calcs.threatDef.name}</div>
                      <div className="flex space-x-1 mt-1">
                        {(calcs.threatDef.types || []).map((t: string) => <TypeChip key={t} type={t} />)}
                      </div>
                    </div>
                  </div>
                  {STAT_NAMES.map(s => renderStatRow(s, s, calcs.pThreat, threatSps, activeThreat.nature, threatBoosts[s] || 0, false))}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <h4 className="text-xs font-bold text-gray-400 mb-2">SP Tweaker (local)</h4>
                    {STAT_NAMES.map(s => {
                      const val = threatSps[s] || 0;
                      return (
                        <div key={s} className="flex items-center text-xs mb-1">
                          <span className="w-8 uppercase text-gray-500">{s}</span>
                          <input type="range" min="0" max="32" value={val}
                            onChange={(e) => updateSimulator({ threatSps: { ...threatSps, [s]: parseInt(e.target.value) } })}
                            className="mx-1 flex-1 accent-red-500" />
                          <span className="w-6 text-right font-mono text-red-400">{val}</span>
                        </div>
                      );
                    })}
                    <button onClick={() => updateThreat(activeThreat.id, { sps: threatSps as any })} 
                      className="w-full mt-2 px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded">
                      💾 Save to {activeThreat.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DAMAGE CALCS */}
          {calcs && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-blue-500">
                <h3 className="font-bold mb-4 text-blue-400">⚔️ Your Attacks</h3>
                {calcs.allyAttacks.map((atk: any, i: number) => (
                  <div key={i}>{renderDamageCard(atk, 'ally')}</div>
                ))}
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-red-500">
                <h3 className="font-bold mb-4 text-red-400">🛡️ Enemy Attacks</h3>
                {calcs.threatAttacks.map((atk: any, i: number) => (
                  <div key={i}>{renderDamageCard(atk, 'enemy')}</div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LiveSimulator;
