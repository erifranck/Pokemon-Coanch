import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { calculateChampionsDamage, createChampionsPokemon } from '../utils/calcAdapter';
import pokedexData from '../data/pokedex.json';
import movesData from '../data/moves.json';
import { Field, Generations } from '@smogon/calc';

const gen = Generations.get(9);

const LiveSimulator: React.FC = () => {
  const { teams, activeTeamId, threats, relationships, updateTeamMember } = useAppStore();
  const team = teams[activeTeamId]?.members || [];
  const [activeAllyId, setActiveAllyId] = useState<string>(team[0]?.id || '');
  const [activeThreatId, setActiveThreatId] = useState<string>('');
  
  // Field States
  const [weather, setWeather] = useState<string>('');
  const [terrain, setTerrain] = useState<string>('');
  const [allyTailwind, setAllyTailwind] = useState(false);
  const [threatTailwind, setThreatTailwind] = useState(false);

  const activeAlly = team.find(t => t.id === activeAllyId);
  const activeThreat = threats.find(t => t.id === activeThreatId);

  // Derived priorized threats
  const linkedThreatIds = activeAllyId ? (relationships[activeAllyId] || []) : [];
  const linkedThreats = threats.filter(t => linkedThreatIds.includes(t.id));
  const otherThreats = threats.filter(t => !linkedThreatIds.includes(t.id));

  const runCalcs = () => {
    if (!activeAlly || !activeThreat) return null;

    const allyBase = (pokedexData as any)[activeAlly.pokemonId];
    const threatBase = (pokedexData as any)[activeThreat.pokemonId];

    if (!allyBase || !threatBase) return null;

    const pAlly = createChampionsPokemon(gen, allyBase.name, allyBase.baseStats, activeAlly.sps, activeAlly.nature, { item: activeAlly.item, ability: activeAlly.ability, teraType: activeAlly.teraType });
    const pThreat = createChampionsPokemon(gen, threatBase.name, threatBase.baseStats, activeThreat.sps, activeThreat.nature, { item: activeThreat.item, ability: activeThreat.ability, teraType: activeThreat.teraType });

    const field = new Field({
      weather: weather as any,
      terrain: terrain as any,
      defenderSide: { isTailwind: threatTailwind },
      attackerSide: { isTailwind: allyTailwind }
    });

    // Speed Tiering
    let allySpe = pAlly.stats.spe;
    if (allyTailwind) allySpe *= 2;
    // VERY rough speed mods for weather/abilities (real VGC checks Swift Swim etc)
    if (weather === 'Rain' && pAlly.ability === 'Swift Swim') allySpe *= 2;
    if (weather === 'Sun' && pAlly.ability === 'Chlorophyll') allySpe *= 2;

    let threatSpe = pThreat.stats.spe;
    if (threatTailwind) threatSpe *= 2;
    if (weather === 'Rain' && pThreat.ability === 'Swift Swim') threatSpe *= 2;
    if (weather === 'Sun' && pThreat.ability === 'Chlorophyll') threatSpe *= 2;

    const speeds = [
      { name: activeAlly.name, speed: allySpe, isAlly: true },
      { name: activeThreat.name, speed: threatSpe, isAlly: false }
    ].sort((a, b) => b.speed - a.speed);

    // Damage calculations
    const allyAttacks = activeAlly.moves.filter(m => m).map(moveId => {
      const moveDef = (movesData as any)[moveId];
      if (moveDef.category === 'Status') return { name: moveDef.name, damage: 'Status Move' };
      try {
        const result = calculateChampionsDamage(gen, pAlly, pThreat, new (gen as any).Moves.Move(gen, moveDef.name), field);
        return { name: moveDef.name, desc: result.desc(), damage: result.damage };
      } catch (e) {
        return { name: moveDef.name, damage: 'Error' };
      }
    });

    const threatAttacks = activeThreat.moves.filter(m => m).map(moveId => {
      const moveDef = (movesData as any)[moveId];
      if (moveDef.category === 'Status') return { name: moveDef.name, damage: 'Status Move' };
      try {
        // Swap attacker/defender side logic for field
        const reverseField = new Field({
          weather: weather as any,
          terrain: terrain as any,
          defenderSide: { isTailwind: allyTailwind },
          attackerSide: { isTailwind: threatTailwind }
        });
        const result = calculateChampionsDamage(gen, pThreat, pAlly, new (gen as any).Moves.Move(gen, moveDef.name), reverseField);
        return { name: moveDef.name, desc: result.desc(), damage: result.damage };
      } catch (e) {
        return { name: moveDef.name, damage: 'Error' };
      }
    });

    return { speeds, allyAttacks, threatAttacks, pAlly, pThreat };
  };

  const calcs = useMemo(() => runCalcs(), [activeAlly, activeThreat, weather, terrain, allyTailwind, threatTailwind]);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: ALLY */}
          <div className="bg-gray-800 p-4 rounded-xl shadow-lg border-2 border-blue-900">
            <h2 className="text-blue-400 font-bold mb-4">Your Field</h2>
            <select 
              className="w-full bg-gray-700 p-2 rounded mb-4 text-white font-bold"
              value={activeAllyId}
              onChange={(e) => setActiveAllyId(e.target.value)}
            >
              {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            {activeAlly && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between bg-gray-900 p-2 rounded">
                  <span>HP: {calcs?.pAlly.stats.hp}</span>
                  <span>Spe: {calcs?.pAlly.stats.spe}</span>
                </div>
                {/* SP Tweaker */}
                <div className="mt-4 p-2 bg-gray-700 rounded">
                  <h4 className="text-xs font-bold text-gray-400 mb-2">Quick SP Tweaker</h4>
                  {['hp', 'def', 'spd', 'spe'].map(stat => (
                    <div key={stat} className="flex items-center justify-between mb-1">
                      <span className="uppercase text-xs w-8">{stat}</span>
                      <input 
                        type="range" min="0" max="32" 
                        value={(activeAlly.sps as any)[stat]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateTeamMember(activeAlly.id, { sps: { ...activeAlly.sps, [stat]: val }});
                        }}
                        className="mx-2 flex-1 accent-blue-500"
                      />
                      <span className="w-6 text-right font-mono text-xs">{(activeAlly.sps as any)[stat]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE: FIELD MODS & RESULTS */}
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h2 className="text-gray-300 font-bold mb-4 text-center">Field Conditions</h2>
              <div className="flex justify-between mb-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={allyTailwind} onChange={(e) => setAllyTailwind(e.target.checked)} />
                  <span>Ally Tailwind</span>
                </label>
                <label className="flex items-center space-x-2">
                  <span>Enemy Tailwind</span>
                  <input type="checkbox" checked={threatTailwind} onChange={(e) => setThreatTailwind(e.target.checked)} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <select className="bg-gray-700 p-1 rounded" value={weather} onChange={(e) => setWeather(e.target.value)}>
                  <option value="">No Weather</option>
                  <option value="Sun">Sun</option>
                  <option value="Rain">Rain</option>
                  <option value="Sand">Sand</option>
                  <option value="Snow">Snow</option>
                </select>
                <select className="bg-gray-700 p-1 rounded" value={terrain} onChange={(e) => setTerrain(e.target.value)}>
                  <option value="">No Terrain</option>
                  <option value="Grassy">Grassy</option>
                  <option value="Electric">Electric</option>
                  <option value="Psychic">Psychic</option>
                  <option value="Misty">Misty</option>
                </select>
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
            <select 
              className="w-full bg-gray-700 p-2 rounded mb-4 text-white font-bold"
              value={activeThreatId}
              onChange={(e) => setActiveThreatId(e.target.value)}
            >
              <option value="" disabled>Select Threat...</option>
              {linkedThreats.length > 0 && <optgroup label="Linked to your Ally">
                {linkedThreats.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>}
              <optgroup label="Other Threats">
                {otherThreats.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
            </select>

            {activeThreat && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between bg-gray-900 p-2 rounded">
                  <span>HP: {calcs?.pThreat.stats.hp}</span>
                  <span>Spe: {calcs?.pThreat.stats.spe}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DAMAGE CALCS ROW */}
      {calcs && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-blue-500">
            <h3 className="font-bold mb-4">Your Attacks</h3>
            {calcs.allyAttacks.map((atk, i) => (
              <div key={i} className="mb-3 text-sm">
                <div className="font-bold text-blue-300">{atk.name}</div>
                <div className="text-gray-400">{atk.desc || atk.damage}</div>
              </div>
            ))}
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-red-500">
            <h3 className="font-bold mb-4">Enemy Attacks</h3>
            {calcs.threatAttacks.map((atk, i) => (
              <div key={i} className="mb-3 text-sm">
                <div className="font-bold text-red-300">{atk.name}</div>
                <div className="text-gray-400">{atk.desc || atk.damage}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSimulator;
