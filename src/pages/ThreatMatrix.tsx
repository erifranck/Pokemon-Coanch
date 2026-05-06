import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PokemonCard } from '../components/PokemonCard';
import pokedexData from '../data/pokedex.json';
import { checkLegality } from '../utils/legality';

const ThreatMatrix: React.FC = () => {
  const { threats, addThreat, updateThreat, removeThreat, teams, activeTeamId, relationships, linkThreat, unlinkThreat } = useAppStore();
  const team = teams[activeTeamId]?.members || [];
  const regulation = teams[activeTeamId]?.regulation || 'gen9championsvgc2026regma';
  const [search, setSearch] = useState('');

  const handleAddThreat = (pokemonId: string) => {
    const def = (pokedexData as any)[pokemonId];
    if (!def) return;
    
    addThreat({
      pokemonId,
      name: def.name,
      nature: 'Serious',
      item: '',
      ability: Object.values(def.abilities)[0] as string,
      teraType: def.types[0],
      sps: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: ['', '', '', ''],
      threatLevel: 'medium'
    });
    setSearch('');
  };

  const filteredPokedex = Object.entries(pokedexData)
    .filter(([key, def]: any) => 
      def.name.toLowerCase().includes(search.toLowerCase()) &&
      checkLegality(key, 'pokemon', key, regulation)
    )
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Threat Matrix</h1>
          <p className="text-gray-400">Manage common meta threats and link them to your team members.</p>
        </div>
      </div>

      <div className="relative z-10">
        <input 
          type="text" 
          placeholder="Search Pokemon to add as a Threat..." 
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            {filteredPokedex.map(([key, def]: any) => (
              <button
                key={key}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center"
                onClick={() => handleAddThreat(key)}
              >
                <span className="capitalize">{def.name}</span>
                <span className="text-xs text-red-400">Add to Threats</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {threats.map((threat) => (
          <div key={threat.id} className="relative">
            <PokemonCard
              card={threat}
              onUpdate={(updates) => updateThreat(threat.id, updates)}
              onRemove={() => removeThreat(threat.id)}
            />
            {/* Relational Links */}
            <div className="mt-2 bg-gray-800 border border-gray-700 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Linked to my team:</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {team.filter(t => (relationships[t.id] || []).includes(threat.id)).map(linkedMember => (
                  <span key={linkedMember.id} className="bg-gray-700 text-xs px-2 py-1 rounded flex items-center">
                    {linkedMember.name}
                    <button 
                      className="ml-2 text-red-400 hover:text-red-300"
                      onClick={() => unlinkThreat(linkedMember.id, threat.id)}
                    >&times;</button>
                  </span>
                ))}
              </div>
              <select 
                className="w-full bg-gray-700 text-xs rounded p-1"
                onChange={(e) => {
                  if (e.target.value) {
                    linkThreat(e.target.value, threat.id);
                    e.target.value = ''; // reset
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>+ Link Team Member as answer</option>
                {team.filter(t => !(relationships[t.id] || []).includes(threat.id)).map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {threats.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
            No threats saved. Add common enemy sets to test your team against.
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatMatrix;
