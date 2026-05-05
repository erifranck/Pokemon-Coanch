import React, { useMemo } from 'react';
import pokedexData from '../data/pokedex.json';
import movesData from '../data/moves.json';
import itemsData from '../data/items.json';
import abilitiesData from '../data/abilities.json';
import type { PokemonCard as PokemonCardType, StatMap } from '../types/store';
import { calculateFinalStat } from '../utils/calcAdapter';
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
  const regulation = teams[activeTeamId]?.regulation || 'vgc2026regma';
  
  const pokemonDef = (pokedexData as any)[card.pokemonId];
  
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

  if (!pokemonDef) return <div className="p-4 bg-gray-800 rounded-lg">Unknown Pokemon</div>;

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <img 
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonDef.baseSpecies ? (pokedexData as any)[pokemonDef.baseSpecies.toLowerCase()]?.num || pokemonDef.num : pokemonDef.num}.png`} 
            alt={pokemonDef.name}
            className="w-16 h-16 bg-gray-700 rounded-full"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
          />
          <div>
            <h2 className="text-xl font-bold text-yellow-400 capitalize">{pokemonDef.name}</h2>
            <div className="flex space-x-1 mt-1">
              {pokemonDef.types.map((t: string) => <TypeChip key={t} type={t} />)}
            </div>
          </div>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-red-400 hover:text-red-300 text-sm mt-1">
            Remove
          </button>
        )}
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
              options={Object.entries(itemsData)
                .filter(([key, item]: any) => checkLegality(card.pokemonId, 'item', item.name, regulation))
                .map(([key, item]: any) => ({ id: item.name, label: item.name }))}
              onChange={(val) => onUpdate({ item: val })}
              isIllegal={!checkLegality(card.pokemonId, 'item', card.item, regulation)}
            />
          </div>
          <div>
            <Combobox 
              label="Ability"
              value={card.ability}
              options={Object.values(pokemonDef.abilities)
                .filter((abilityName: any) => checkLegality(card.pokemonId, 'ability', abilityName, regulation))
                .map((abilityName: any) => ({ id: abilityName, label: abilityName }))}
              onChange={(val) => onUpdate({ ability: val })}
              isIllegal={!checkLegality(card.pokemonId, 'ability', card.ability, regulation)}
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
            const moveDef = moveId ? (movesData as any)[moveId] : null;
            return (
              <div key={idx}>
                <Combobox 
                  label={`Move ${idx + 1}`}
                  value={moveId}
                  options={Object.entries(movesData)
                    .filter(([key, move]: any) => checkLegality(card.pokemonId, 'move', key, regulation))
                    .map(([key, move]: any) => ({ id: key, label: move.name }))}
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
            const finalStat = calculateFinalStat(stat, pokemonDef.baseStats[stat], spVal, 1.0); // Rough display without nature color
            return (
              <div key={stat} className="flex items-center text-xs">
                <span className="w-8 font-bold uppercase text-gray-400">{stat}</span>
                <span className="w-8 text-right font-mono text-gray-300">{finalStat}</span>
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
