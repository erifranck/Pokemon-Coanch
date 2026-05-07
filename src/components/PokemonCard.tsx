import React, { useState } from 'react';
import formatData from '../data/format_data.json';
import type { PokemonCard as PokemonCardType, StatMap } from '../types/store';
import { calculateFinalStat, getNatureModifier } from '../utils/calcAdapter';
import { getMegaFormId } from '../utils/megaUtils';
import { TypeChip } from './TypeChip';
import { Combobox } from './Combobox';
import { checkLegality } from '../utils/legality';
import { useAppStore } from '../store/useAppStore';

interface Props {
  card: PokemonCardType;
  onUpdate: (updates: Partial<PokemonCardType>) => void;
  onRemove?: () => void;
}

const STAT_NAMES = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;

export const PokemonCard: React.FC<Props> = ({ card, onUpdate, onRemove }) => {
  const { teams, activeTeamId } = useAppStore();
  const regulation = teams[activeTeamId]?.regulation || 'gen9championsvgc2026regma';
  
  const [previewMode, setPreviewMode] = useState<'mega' | 'base'>('mega');
  
  // Use formatData to get accurate showdwown properties and megas
  const activeFormat = (formatData as any)[regulation];
  if (!activeFormat) return <div className="p-4 bg-gray-800 rounded-lg border border-red-500 text-red-400 text-sm">Format data not found for {regulation}. Run update script.</div>;

  const basePokemonDef = activeFormat.pokemon[card.pokemonId];
  if (!basePokemonDef) return <div className="p-4 bg-gray-800 rounded-lg border border-yellow-500 text-yellow-400 text-sm">Pokémon {card.pokemonId} not found in {regulation} Dex.</div>;

  const itemDefObj = card.item ? Object.values(activeFormat.items || {}).find((i: any) => i.name === card.item) as any : null;
  
  // Use shared mega detection utility
  const megaFormId = getMegaFormId(itemDefObj, basePokemonDef);
  
  const isHoldingMegaStone = megaFormId !== null;
  
  // Choose the definition to display
  let activePokemonDef = basePokemonDef;
  const resolvedMegaId = megaFormId; // TS narrowing
  if (isHoldingMegaStone && resolvedMegaId && previewMode === 'mega' && activeFormat?.pokemon?.[resolvedMegaId]) {
      activePokemonDef = activeFormat.pokemon[resolvedMegaId];
  }

  const totalSP = Object.values(card.sps).reduce((a, b) => a + b, 0);

  const handleSpChange = (stat: keyof StatMap, value: number) => {
    let newVal = Math.max(0, Math.min(32, value));
    
    // Check global cap (66)
    const currentTotalExcludingThis = totalSP - (card.sps[stat] || 0);
    if (currentTotalExcludingThis + newVal > 66) {
      newVal = 66 - currentTotalExcludingThis;
    }

    onUpdate({ sps: { ...card.sps, [stat]: newVal } });
  };

  return (
    <div className={`bg-gray-800 p-4 rounded-xl shadow-lg border flex flex-col space-y-4 ${isHoldingMegaStone && previewMode === 'mega' ? 'border-purple-500 shadow-purple-900/20' : 'border-gray-700'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <img 
            src={`https://play.pokemonshowdown.com/sprites/gen5/${activePokemonDef.id}.png`} 
            alt={activePokemonDef.name}
            className="w-16 h-16 bg-gray-700 rounded-full"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
          />
          <div>
            <h2 className={`text-xl font-bold capitalize ${isHoldingMegaStone && previewMode === 'mega' ? 'text-purple-400' : 'text-yellow-400'}`}>
                {activePokemonDef.name}
            </h2>
            <div className="flex space-x-1 mt-1">
              {activePokemonDef.types.map((t: string) => <TypeChip key={t} type={t} />)}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {isHoldingMegaStone && (
            <button 
              onClick={() => setPreviewMode(prev => prev === 'mega' ? 'base' : 'mega')}
              className="text-xs px-2 py-1 mb-2 bg-purple-900/50 text-purple-300 border border-purple-700 rounded hover:bg-purple-800/50"
            >
              {previewMode === 'mega' ? '👁️ View Base' : '⚡ View Mega'}
            </button>
          )}
          {onRemove && (
            <button onClick={onRemove} className="text-red-400 hover:text-red-300 text-sm mt-1">
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="space-y-2 text-sm">
          <div>
            <label className="block text-gray-400 text-xs">Nature</label>
            <select 
              className="w-full bg-gray-700 rounded p-1"
              value={card.nature}
              onChange={(e) => onUpdate({ nature: e.target.value })}
            >
              {['Adamant', 'Bold', 'Brave', 'Calm', 'Careful', 'Impish', 'Jolly', 'Modest', 'Quiet', 'Relaxed', 'Sassy', 'Timid'].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <Combobox 
              label="Item"
              value={card.item}
              options={Object.values(activeFormat.items || {})
                .map((item: any) => ({ id: item.name, label: item.name }))}
              onChange={(val) => onUpdate({ item: val })}
              isIllegal={!checkLegality(card.pokemonId, 'item', card.item, regulation)}
            />
          </div>
          <div>
            <Combobox 
              label="Ability"
              value={card.ability}
              options={Object.values(activePokemonDef.abilities || {})
                .map((abilityName: any) => ({ id: abilityName, label: abilityName }))}
              onChange={(val) => onUpdate({ ability: val })}
              isIllegal={!checkLegality(activePokemonDef.id, 'ability', card.ability, regulation)}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs">Tera Type</label>
            <select 
              className="w-full bg-gray-700 rounded p-1"
              value={card.teraType}
              onChange={(e) => onUpdate({ teraType: e.target.value })}
            >
              {['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy', 'Stellar'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Moves */}
        <div className="space-y-2 text-sm">
          {[0, 1, 2, 3].map((idx) => {
            const moveId = card.moves[idx] || '';
            return (
              <div key={idx}>
                <Combobox 
                  label={`Move ${idx + 1}`}
                  value={moveId}
                  options={(() => {
                    const allowedMoves = basePokemonDef.allowedMoves || [];
                    const allMoves = Object.values(activeFormat.moves || {}) as any[];
                    if (allowedMoves.length > 0) {
                      // Filter to only learnable moves
                      const allowedSet = new Set(allowedMoves);
                      return allMoves.filter((m: any) => allowedSet.has(m.id)).map((m: any) => ({ id: m.id, label: m.name }));
                    }
                    // Fallback: show all format moves
                    return allMoves.map((m: any) => ({ id: m.id, label: m.name }));
                  })()}
                  onChange={(val) => {
                    const newMoves = [...card.moves] as [string, string, string, string];
                    newMoves[idx] = val;
                    onUpdate({ moves: newMoves });
                  }}
                  isIllegal={!checkLegality(card.pokemonId, 'move', moveId, regulation)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* SP Allocation */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-300">Stat Points (SP)</h3>
          <span className={`text-xs font-mono px-2 py-1 rounded ${totalSP === 66 ? 'bg-green-900 text-green-300' : 'bg-gray-700'}`}>
            {totalSP} / 66
          </span>
        </div>
        
        <div className="space-y-1">
          {STAT_NAMES.map(stat => {
            const spVal = card.sps[stat] || 0;
            const natureMod = getNatureModifier(stat, card.nature);
            
            // Calculate stat WITHOUT item to check for modification
            const baseFinal = calculateFinalStat(stat, activePokemonDef.baseStats[stat], spVal, natureMod);
            // Calculate stat WITH item
            const totalFinal = calculateFinalStat(stat, activePokemonDef.baseStats[stat], spVal, natureMod, card.item);
            
            const isModified = totalFinal !== baseFinal;

            return (
              <div key={stat} className="flex items-center text-xs">
                <span className={`w-8 font-bold uppercase ${natureMod > 1 ? 'text-red-400' : natureMod < 1 ? 'text-blue-400' : 'text-gray-400'}`}>
                  {stat}
                </span>
                <span className={`w-8 text-right font-mono ${isModified ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                  {totalFinal}
                </span>
                <input 
                  type="range" 
                  min="0" 
                  max="32" 
                  value={spVal}
                  onChange={(e) => handleSpChange(stat, parseInt(e.target.value))}
                  className="mx-2 flex-1 accent-blue-500"
                />
                <span className="w-6 text-right font-mono text-blue-400">{spVal}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
