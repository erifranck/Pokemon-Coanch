import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PokemonCard } from '../components/PokemonCard';
import pokedexData from '../data/pokedex.json';
import { TeamManager } from '../components/TeamManager';
import { checkLegality } from '../utils/legality';

const TeamBuilder: React.FC = () => {
  const { teams, activeTeamId, addTeamMember, updateTeamMember, removeTeamMember } = useAppStore();
  const team = teams[activeTeamId]?.members || [];
  const regulation = teams[activeTeamId]?.regulation || 'gen9championsvgc2026regma';
  const [search, setSearch] = useState('');

  const handleAddPokemon = (pokemonId: string) => {
    const def = (pokedexData as any)[pokemonId];
    if (!def) return;
    
    addTeamMember({
      pokemonId,
      name: def.name,
      nature: 'Serious',
      item: '',
      ability: Object.values(def.abilities)[0] as string,
      teraType: def.types[0],
      sps: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: ['', '', '', '']
    });
    setSearch('');
  };

  const filteredPokedex = Object.entries(pokedexData)
    .filter(([key, def]: any) => 
      def.name.toLowerCase().includes(search.toLowerCase()) &&
      checkLegality(key, 'pokemon', key, regulation)
    )
    .slice(0, 10); // Limit results for performance

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Builder</h1>
          <p className="text-gray-400">Configure your team of 6 Pokémon using the 66-SP system.</p>
        </div>
        <div className="font-mono bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          Slots: <span className={team.length === 6 ? 'text-green-400' : 'text-blue-400'}>{team.length} / 6</span>
        </div>
      </div>

      <TeamManager />

      {team.length < 6 && (
        <div className="relative z-10">
          <input 
            type="text" 
            placeholder="Search Pokemon to add..." 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
              {filteredPokedex.map(([key, def]: any) => (
                <button
                  key={key}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center"
                  onClick={() => handleAddPokemon(key)}
                >
                  <span className="capitalize">{def.name}</span>
                  <span className="text-xs text-gray-500">{def.types.join('/')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <PokemonCard
            key={member.id}
            card={member}
            onUpdate={(updates) => updateTeamMember(member.id, updates)}
            onRemove={() => removeTeamMember(member.id)}
          />
        ))}
        {team.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
            Your team is empty. Search above to add your first Pokémon.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamBuilder;
