import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TYPES } from '../utils/typeChart';
import { getOffensiveCoverage, type MemberCoverage } from '../utils/offensiveCoverage';
import formatData from '../data/format_data.json';
import { getShowdownSpriteUrl } from '../utils/spriteUtils';
import { TypeChip } from '../components/TypeChip';

const OffensiveCoverage: React.FC = () => {
  const { teams, activeTeamId } = useAppStore();
  const team = teams[activeTeamId]?.members || [];
  const regulation = teams[activeTeamId]?.regulation || 'gen9championsvgc2026regma';
  const [useTera, setUseTera] = useState(false);
  const [highlightStab, setHighlightStab] = useState(true);

  const activeFormat = (formatData as any)[regulation];

  const coverageData = useMemo(
    () => getOffensiveCoverage(team, activeFormat, useTera),
    [team, activeFormat, useTera]
  );

  const [hoveredCell, setHoveredCell] = useState<{
    moves: { name: string; type: string; isStab: boolean }[];
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Offensive Coverage</h1>
          <p className="text-gray-400">See which types your team's attacks hit super-effectively.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg border border-yellow-700">
            <input
              type="checkbox"
              id="highlightStab"
              checked={highlightStab}
              onChange={(e) => setHighlightStab(e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
            <label htmlFor="highlightStab" className="font-bold text-sm select-none cursor-pointer text-yellow-400">
              Highlight STAB
            </label>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg border border-green-700">
            <input
              type="checkbox"
              id="useTeraStab"
              checked={useTera}
              onChange={(e) => setUseTera(e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            <label htmlFor="useTeraStab" className="font-bold text-sm select-none cursor-pointer text-green-400">
              Tera STAB
            </label>
          </div>
        </div>
      </div>

      {team.length === 0 ? (
        <div className="p-8 bg-gray-800 rounded text-center">
          Your active team is empty. Go to Team Builder to add Pokémon.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-xl">
          <table className="w-full text-sm text-center">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="p-3 text-left w-32 sticky left-0 bg-gray-900 z-10 border-r border-gray-700">
                  Defending Type →
                </th>
                {coverageData.map((member: MemberCoverage) => (
                  <th key={member.id} className="p-2 border-b border-gray-700 w-16">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <img
                        src={getShowdownSpriteUrl(member.spriteName)}
                        alt={member.name}
                        className="w-12 h-12 bg-gray-800 rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
                        title={member.name}
                      />
                      <span className="text-[10px] truncate w-16">{member.name}</span>
                      <div className="flex flex-col space-y-0.5">
                        {member.types.map((t: string) => <TypeChip key={t} type={t} />)}
                      </div>
                    </div>
                  </th>
                ))}
                <th className="p-3 bg-green-900 text-green-300 border-l border-gray-700 font-bold min-w-[60px]">
                  Cvrg
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800">
              {TYPES.map((defType) => {
                const cells = coverageData.map((member) => member.coverage[defType]);
                const coveredCount = cells.filter(c => c.covered).length;
                const isUncovered = coveredCount === 0;

                return (
                  <tr key={defType} className={`border-b border-gray-700 ${isUncovered ? 'bg-red-900/20' : ''}`}>
                    <td className={`p-2 sticky left-0 z-10 border-r border-gray-700 font-bold ${isUncovered ? 'bg-red-900 text-white' : 'bg-gray-900 text-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <TypeChip type={defType} />
                        {isUncovered && <span className="text-lg" title="No coverage for this type">⚠️</span>}
                      </div>
                    </td>

                    {cells.map((cell, i) => {
                      const member = coverageData[i];
                      return (
                        <td
                          key={member.id}
                          className={`p-2 font-mono font-bold border-r border-gray-700 relative ${cell.covered ? 'bg-green-900/50 text-green-300 cursor-pointer hover:bg-green-800/50' : 'bg-gray-800/50 text-gray-600'}`}
                          onMouseEnter={(e) => {
                            if (cell.covered && cell.moves.length > 0) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredCell({
                                moves: cell.moves,
                                x: rect.right + 8,
                                y: rect.top,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {cell.covered ? (highlightStab && cell.hasStab ? '✓☆' : '✓') : '✗'}
                        </td>
                      );
                    })}

                    <td className={`p-2 font-mono font-bold border-l border-gray-700 ${isUncovered ? 'bg-red-900 text-red-300' : 'bg-gray-900 text-green-400'}`}>
                      {coveredCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-[100] pointer-events-none bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-2 text-xs min-w-[180px]"
          style={{ top: hoveredCell.y, left: hoveredCell.x }}
        >
          <p className="text-gray-400 mb-1 font-semibold">Covering Moves:</p>
          {hoveredCell.moves.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 py-0.5">
              <TypeChip type={m.type} className="text-[9px]" />
              <span className="text-white">{m.name}</span>
              {m.isStab && <span className="text-yellow-400 text-[10px] font-bold">STAB</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffensiveCoverage;
