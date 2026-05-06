import React from 'react';
import { useAppStore } from '../store/useAppStore';
import pokedexData from '../data/pokedex.json';

import formatData from '../data/format_data.json';

export const TeamManager: React.FC = () => {
  const { teams, activeTeamId, setActiveTeam, createTeam, cloneTeam, deleteTeam, updateTeamRegulation } = useAppStore();
  const activeTeam = teams[activeTeamId];

  if (!activeTeam) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex-1 w-full flex items-center space-x-4">
          <select 
            className="bg-gray-700 text-white p-2 rounded-lg font-bold border border-gray-600 focus:outline-none focus:border-blue-500 w-full max-w-xs"
            value={activeTeamId}
            onChange={(e) => setActiveTeam(e.target.value)}
          >
            {Object.values(teams).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select 
            className="bg-gray-800 text-gray-300 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
            value={activeTeam.regulation || 'gen9championsvgc2026regma'}
            onChange={(e) => updateTeamRegulation(activeTeamId, e.target.value)}
          >
            {Object.entries(formatData).map(([key, format]: any) => (
              <option key={key} value={key}>{format.name}</option>
            ))}
          </select>
          
          {/* Mini Sprites Preview */}
          <div className="hidden md:flex space-x-1">
            {activeTeam.members.map(m => {
              const def = (pokedexData as any)[m.pokemonId];
              const num = def?.baseSpecies ? (pokedexData as any)[def.baseSpecies.toLowerCase()]?.num : def?.num;
              return (
                <img 
                  key={m.id}
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num || 0}.png`}
                  alt={m.name}
                  className="w-10 h-10 bg-gray-700 rounded-full"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
                  title={m.name}
                />
              );
            })}
            {/* Empty slots placeholders */}
            {Array.from({ length: 6 - activeTeam.members.length }).map((_, i) => (
              <div key={`empty-${i}`} className="w-10 h-10 border border-dashed border-gray-600 rounded-full flex items-center justify-center text-gray-600 text-xs">
                +
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => createTeam()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded"
          >
            + New
          </button>
          <button 
            onClick={() => cloneTeam()}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm font-bold rounded"
          >
            Clone
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Delete this team?')) deleteTeam(activeTeamId);
            }}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
};
