import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TYPES, calculateDefensiveMultiplier } from '../utils/typeChart';
import pokedexData from '../data/pokedex.json';
import { TypeChip } from '../components/TypeChip';

const getMultiplierColor = (mult: number) => {
  if (mult === 0) return 'bg-gray-600'; // Immune
  if (mult < 1) return 'bg-green-700 text-green-100'; // Resist
  if (mult > 1) return 'bg-red-700 text-red-100'; // Weak
  return 'bg-gray-800'; // Neutral
};

const getMultiplierText = (mult: number) => {
  if (mult === 0) return '0';
  if (mult === 0.25) return '¼';
  if (mult === 0.5) return '½';
  if (mult === 1) return '';
  if (mult === 2) return '2';
  if (mult === 4) return '4';
  return mult.toString();
};

const TypeSynergy: React.FC = () => {
  const { teams, activeTeamId } = useAppStore();
  const team = teams[activeTeamId]?.members || [];
  const [useTera, setUseTera] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Type Synergy</h1>
          <p className="text-gray-400">Analyze your team's defensive weaknesses and resistances.</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
          <input 
            type="checkbox" 
            id="useTera" 
            checked={useTera} 
            onChange={(e) => setUseTera(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          <label htmlFor="useTera" className="font-bold text-sm select-none cursor-pointer">
            Calculate using Tera Types
          </label>
        </div>
      </div>

      {team.length === 0 ? (
        <div className="p-8 bg-gray-800 rounded text-center">Your active team is empty. Go to Team Builder to add Pokémon.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-xl">
          <table className="w-full text-sm text-center">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="p-3 text-left w-32 sticky left-0 bg-gray-900 z-10 border-r border-gray-700">Defending →<br/>Attacking ↓</th>
                {team.map((member, i) => {
                  const def = (pokedexData as any)[member.pokemonId];
                  const num = def?.baseSpecies ? (pokedexData as any)[def.baseSpecies.toLowerCase()]?.num : def?.num;
                  return (
                    <th key={member.id} className="p-2 border-b border-gray-700 w-16">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num || 0}.png`}
                          alt={member.name}
                          className="w-12 h-12 bg-gray-800 rounded-full"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
                          title={member.name}
                        />
                        <span className="text-[10px] truncate w-16">{member.name}</span>
                        {useTera ? (
                          <TypeChip type={member.teraType} />
                        ) : (
                          <div className="flex flex-col space-y-0.5">
                            {def?.types.map((t: string) => <TypeChip key={t} type={t} />)}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
                {/* Empty slots placeholders in header */}
                {Array.from({ length: 6 - team.length }).map((_, i) => (
                  <th key={`empty-h-${i}`} className="p-2 border-b border-gray-700 w-16 opacity-30">Empty</th>
                ))}
                <th className="p-3 bg-green-900 text-green-300 border-l border-gray-700 font-bold">Resis</th>
                <th className="p-3 bg-red-900 text-red-300 font-bold">Weaks</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800">
              {TYPES.map((attackingType) => {
                let rowResis = 0;
                let rowWeaks = 0;
                
                const cells = team.map(member => {
                  const def = (pokedexData as any)[member.pokemonId];
                  const defendingTypes = useTera ? [member.teraType] : (def?.types || ['Normal']);
                  const mult = calculateDefensiveMultiplier(attackingType, defendingTypes);
                  
                  if (mult < 1) rowResis++;
                  if (mult > 1) rowWeaks++;
                  
                  return { id: member.id, mult };
                });

                const isWarning = rowWeaks >= 3 && rowResis <= 1;

                return (
                  <tr key={attackingType} className="border-b border-gray-700">
                    <td className={`p-2 sticky left-0 z-10 border-r border-gray-700 font-bold flex items-center justify-between ${isWarning ? 'bg-red-900 text-white' : 'bg-gray-900 text-gray-300'}`}>
                      <TypeChip type={attackingType} />
                      {isWarning && <span className="text-xl" title="Critical Structural Weakness">⚠️</span>}
                    </td>
                    
                    {cells.map(c => (
                      <td key={c.id} className={`p-2 font-mono font-bold border-r border-gray-700 opacity-90 ${getMultiplierColor(c.mult)}`}>
                        {getMultiplierText(c.mult)}
                      </td>
                    ))}

                    {/* Empty slots fillers */}
                    {Array.from({ length: 6 - team.length }).map((_, i) => (
                      <td key={`empty-c-${i}`} className="p-2 bg-gray-800 border-r border-gray-700"></td>
                    ))}

                    <td className="p-2 font-mono font-bold bg-gray-900 text-green-400 border-l border-gray-700">{rowResis}</td>
                    <td className="p-2 font-mono font-bold bg-gray-900 text-red-400">{rowWeaks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TypeSynergy;
