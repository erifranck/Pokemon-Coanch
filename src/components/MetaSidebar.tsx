import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import metaSetsData from '../data/meta_sets.json';
import { getShowdownSpriteUrl } from '../utils/spriteUtils';

export const MetaSidebar: React.FC = () => {
  const { addThreat } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddThreat = (meta: any) => {
    addThreat({
      pokemonId: meta.id,
      name: meta.name,
      nature: meta.recommendedNature || 'Serious',
      item: meta.commonItems[0] || '',
      ability: meta.commonAbilities[0] || '',
      teraType: 'Normal',
      sps: meta.defaultSps || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: [
        meta.commonMoves[0] || '',
        meta.commonMoves[1] || '',
        meta.commonMoves[2] || '',
        meta.commonMoves[3] || '',
      ],
      threatLevel: 'medium',
    });
  };

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl transition-all duration-300 ${collapsed ? 'w-12' : 'w-72'}`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        {!collapsed && (
          <h3 className="font-bold text-sm text-pink-400">Meta Pokémon</h3>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-gray-700"
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {!collapsed && (
        <div className="overflow-y-auto max-h-[70vh]">
          <div className="p-2 text-xs text-gray-500 flex justify-between">
            <span>Top {metaSetsData.length}</span>
            <span className="text-pink-500">Usage %</span>
          </div>
          {metaSetsData.map((meta) => {
            const isExpanded = expandedId === meta.id;
            return (
              <div key={meta.id} className="border-b border-gray-700/50">
                <div
                  className="flex items-center p-2 hover:bg-gray-700 cursor-pointer text-sm"
                  onClick={() => setExpandedId(isExpanded ? null : meta.id)}
                >
                  <img
                    src={getShowdownSpriteUrl(meta.name)}
                    alt={meta.name}
                    className="w-8 h-8 bg-gray-700 rounded-full mr-2"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
                  />
                  <span className="flex-1 font-bold text-xs">{meta.name}</span>
                  <span className="text-pink-400 font-mono text-xs">{meta.usage}%</span>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 text-xs space-y-2">
                    <div>
                      <span className="text-gray-500">Items:</span>{' '}
                      {meta.commonItems.slice(0, 3).map((i: string) => (
                        <span key={i} className="text-gray-300 mr-1 bg-gray-700 px-1 rounded">{i}</span>
                      ))}
                    </div>
                    <div>
                      <span className="text-gray-500">Moves:</span>{' '}
                      {meta.commonMoves.slice(0, 4).map((m: string) => (
                        <span key={m} className="text-blue-300 mr-1 capitalize">{m.replace(/([A-Z])/g, ' $1').trim()}</span>
                      ))}
                    </div>
                    <div>
                      <span className="text-gray-500">Ability:</span>{' '}
                      <span className="text-green-300">{meta.commonAbilities[0]}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddThreat(meta);
                      }}
                      className="w-full mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-colors"
                    >
                      + Add as Threat
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!collapsed && (
      <div className="p-2 border-t border-gray-700 text-center">
        <p className="text-[10px] text-gray-500">
          Powered by Pokémon Showdown &amp; Munchstats
        </p>
      </div>
      )}
    </div>
  );
};
