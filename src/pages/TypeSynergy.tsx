import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TYPES, calculateDefensiveMultiplier } from '../utils/typeChart';
import formatData from '../data/format_data.json';
import { getMegaFormId } from '../utils/megaUtils';
import { getImmunityTypes } from '../utils/abilityImmunities';
import { getShowdownSpriteUrl } from '../utils/spriteUtils';
import { TypeChip } from '../components/TypeChip';

const getMultiplierColor = (mult: number) => {
  if (mult === 0) return 'bg-gray-600';
  if (mult < 1) return 'bg-green-700 text-green-100';
  if (mult > 1) return 'bg-red-700 text-red-100';
  return 'bg-gray-800';
};

const getMultiplierText = (mult: number, isAbility = false) => {
  if (mult === 0) return isAbility ? 'A' : '0';
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
  const regulation = teams[activeTeamId]?.regulation || 'gen9championsvgc2026regma';
  const [useTera, setUseTera] = useState(false);
  const [useAbilities, setUseAbilities] = useState(false);

  const activeFormat = (formatData as any)[regulation];

  // Resolve defending types for a team member, accounting for mega evolution
  const getDefendingTypes = (member: typeof team[0]) => {
    if (useTera) return [member.teraType];

    const baseDef = activeFormat?.pokemon?.[member.pokemonId];
    if (!baseDef) return ['Normal'];

    // Check for mega evolution
    const itemDef = member.item 
      ? Object.values(activeFormat?.items || {}).find((i: any) => i.name === member.item) as any 
      : null;
    const megaId = getMegaFormId(itemDef, baseDef);
    if (megaId && activeFormat?.pokemon?.[megaId]) {
      return activeFormat.pokemon[megaId].types || baseDef.types;
    }

    return baseDef.types || ['Normal'];
  };

  const getActiveFormId = (member: typeof team[0]) => {
    const baseDef = activeFormat?.pokemon?.[member.pokemonId];
    if (!baseDef) return member.pokemonId;
    const itemDef = member.item 
      ? Object.values(activeFormat?.items || {}).find((i: any) => i.name === member.item) as any 
      : null;
    const megaId = getMegaFormId(itemDef, baseDef);
    return (megaId && activeFormat?.pokemon?.[megaId]) ? megaId : member.pokemonId;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Type Synergy</h1>
          <p className="text-gray-400">Analyze your team's defensive weaknesses and resistances.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
            <input 
              type="checkbox" 
              id="useTera" 
              checked={useTera} 
              onChange={(e) => setUseTera(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="useTera" className="font-bold text-sm select-none cursor-pointer">
              Tera Types
            </label>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg border border-purple-700">
            <input 
              type="checkbox" 
              id="useAbilities" 
              checked={useAbilities} 
              onChange={(e) => setUseAbilities(e.target.checked)}
              className="w-4 h-4 accent-purple-500"
            />
            <label htmlFor="useAbilities" className="font-bold text-sm select-none cursor-pointer">
              Consider Abilities
            </label>
          </div>
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
                {team.map((member) => {
                  const activeId = getActiveFormId(member);
                  const types = getDefendingTypes(member);
                  return (
                    <th key={member.id} className="p-2 border-b border-gray-700 w-16">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <img 
                          src={getShowdownSpriteUrl(activeFormat?.pokemon?.[activeId]?.name || activeId)}
                          alt={member.name}
                          className="w-12 h-12 bg-gray-800 rounded-full"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
                          title={member.name}
                        />
                        <span className="text-[10px] truncate w-16">{member.name}</span>
                        <div className="flex flex-col space-y-0.5">
                          {types.map((t: string) => <TypeChip key={t} type={t} />)}
                        </div>
                      </div>
                    </th>
                  );
                })}
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
                  const types = getDefendingTypes(member);
                  let mult = calculateDefensiveMultiplier(attackingType, types);
                  let isAbilityImmune = false;

                  // Apply ability-based immunities if toggle is active
                  if (useAbilities && mult !== 0) {
                    const activeId = getActiveFormId(member);
                    const activeDef = activeFormat?.pokemon?.[activeId];
                    if (activeDef) {
                      const abilities = Object.values(activeDef.abilities || {});
                      for (const ability of abilities) {
                        const immunityTypes = getImmunityTypes(ability as string);
                        if (immunityTypes.includes(attackingType)) {
                          mult = 0;
                          isAbilityImmune = true;
                          break;
                        }
                      }
                    }
                  }
                  
                  if (mult < 1) rowResis++;
                  if (mult > 1) rowWeaks++;
                  
                  return { id: member.id, mult, isAbilityImmune };
                });

                const isWarning = rowWeaks >= 3 && rowResis <= 1;

                return (
                  <tr key={attackingType} className="border-b border-gray-700">
                    <td className={`p-2 sticky left-0 z-10 border-r border-gray-700 font-bold flex items-center justify-between ${isWarning ? 'bg-red-900 text-white' : 'bg-gray-900 text-gray-300'}`}>
                      <TypeChip type={attackingType} />
                      {isWarning && <span className="text-xl" title="Critical Structural Weakness">⚠️</span>}
                    </td>
                    
                    {cells.map(c => (
                      <td key={c.id} className={`p-2 font-mono font-bold border-r border-gray-700 opacity-90 ${c.isAbilityImmune ? 'bg-purple-700 text-purple-100' : getMultiplierColor(c.mult)}`}>
                        {getMultiplierText(c.mult, c.isAbilityImmune)}
                      </td>
                    ))}

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
