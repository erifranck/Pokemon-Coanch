import React, { useMemo, useState } from 'react';
import type { TeamCard, ThreatCard } from '../types/store';
import { analyzeAllMatchups, type MatchupResult, type CoverageSummary } from '../utils/threatCoverage';
import { getEffectiveSpriteName, getEffectiveTypes } from '../utils/coreAnalysis';
import { getShowdownSpriteUrl } from '../utils/spriteUtils';
import { TypeChip } from './TypeChip';

interface Props {
  team: TeamCard[];
  threats: ThreatCard[];
  activeFormat: any;
  isOpen: boolean;
  onClose: () => void;
}

const KO_COLORS: Record<string, string> = {
  'OHKO': 'text-red-400 font-bold',
  '2HKO': 'text-orange-400',
  '3HKO': 'text-yellow-400',
  '4HKO+': 'text-gray-500',
};

const ThreatCoverageModal: React.FC<Props> = ({ team, threats, activeFormat, isOpen, onClose }) => {
  const [tooltip, setTooltip] = useState<{
    data: MatchupResult;
    threatName: string;
    memberName: string;
    x: number;
    y: number;
  } | null>(null);

  const coverage = useMemo(
    () => analyzeAllMatchups(threats, team, activeFormat),
    [threats, team, activeFormat]
  );

  if (!isOpen) return null;

  const renderCell = (m: MatchupResult | null, threatName: string, memberName: string) => {
    if (!m) return <td className="p-2 text-center text-gray-600 text-xs">—</td>;

    const threatCanKO = m.threatKOPotential === 'OHKO' || m.threatKOPotential === '2HKO';
    const iCanKO = m.myKOPotential === 'OHKO' || m.myKOPotential === '2HKO';

    // Color logic
    let bgClass = 'bg-gray-800/50';
    if (m.speedStatus === 'faster' && threatCanKO && !iCanKO) {
      bgClass = 'bg-red-900/40'; // Threat dominates
    } else if ((m.speedStatus === 'slower' || m.speedStatus === 'tie') && iCanKO && !threatCanKO) {
      bgClass = 'bg-green-900/30'; // We dominate
    } else if (threatCanKO && iCanKO) {
      bgClass = 'bg-yellow-900/30'; // Mutual threat
    }

    return (
      <td
        className={`p-1.5 text-center text-[10px] cursor-help border-r border-gray-700/50 ${bgClass}`}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltip({ data: m, threatName, memberName, x: rect.right + 8, y: rect.top });
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        <div className={m.speedStatus === 'faster' ? 'text-red-400' : m.speedStatus === 'slower' ? 'text-green-400' : 'text-gray-400'}>
          {m.speedStatus === 'faster' ? '↑' : m.speedStatus === 'slower' ? '↓' : '='}
        </div>
        <div className={KO_COLORS[m.threatKOPotential]}>
          {m.threatKOPotential === 'OHKO' ? '💀' : m.threatKOPotential === '2HKO' ? '⚠️' : '·'}
        </div>
      </td>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-[95vw] max-w-6xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Threat Coverage</h2>
            <p className="text-xs text-gray-400">
              {threats.length} threats × {team.length} team members · ↑ threat faster · ↓ threat slower
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {/* Table */}
        {threats.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No threats to analyze. Add threats in the Threat Matrix first.
          </div>
        ) : team.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Your team is empty. Add Pokémon in Team Builder first.
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-900">
                  <th className="p-2 text-left sticky left-0 bg-gray-900 z-20 border-r border-gray-700 min-w-[140px]">
                    Threat ↓ / Team →
                  </th>
                  {team.map(member => {
                    const spriteName = getEffectiveSpriteName(member, activeFormat);
                    const types = getEffectiveTypes(member, activeFormat);
                    return (
                      <th key={member.id} className="p-2 min-w-[64px] border-r border-gray-700">
                        <div className="flex flex-col items-center gap-0.5">
                          <img
                            src={getShowdownSpriteUrl(spriteName)}
                            alt={member.name}
                            className="w-8 h-8 bg-gray-700 rounded-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
                          />
                          <span className="text-[9px] text-gray-300 truncate max-w-[60px]">{member.name}</span>
                          <div className="flex gap-0.5">
                            {types.map(t => <TypeChip key={t} type={t} className="text-[7px]!" />)}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-2 min-w-[40px] border-r border-gray-700 text-gray-400">!</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {coverage.map((row: CoverageSummary) => {
                  const spriteName = getEffectiveSpriteName(row.threat, activeFormat);
                  const types = getEffectiveTypes(row.threat, activeFormat);
                  const isDanger = row.endangeredCount >= 3;

                  return (
                    <tr key={row.threat.id} className={`border-b border-gray-700/50 ${isDanger ? 'bg-red-900/10' : ''}`}>
                      <td className={`p-2 sticky left-0 z-10 border-r border-gray-700 ${isDanger ? 'bg-red-900/30' : 'bg-gray-900'}`}>
                        <div className="flex items-center gap-2">
                          <img
                            src={getShowdownSpriteUrl(spriteName)}
                            alt={row.threat.name}
                            className="w-7 h-7 bg-gray-700 rounded-full flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
                          />
                          <div className="min-w-0">
                            <div className="text-gray-200 font-bold truncate text-[11px] flex items-center gap-1">
                              {row.threat.name}
                              {isDanger && <span className="text-red-400" title="Serious threat">⚠️</span>}
                            </div>
                            <div className="flex gap-0.5 mt-0.5">
                              {types.map(t => <TypeChip key={t} type={t} className="text-[7px]!" />)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {row.matchups.map((m, i) => {
                        if (!m) return <td key={i} className="p-2 text-center text-gray-600 text-[10px]">—</td>;
                        return renderCell(m, row.threat.name, team[i]?.name || '');
                      })}

                      <td className={`p-2 text-center font-mono font-bold border-l border-gray-700 ${isDanger ? 'bg-red-900/30 text-red-400' : 'bg-gray-900 text-gray-400'}`}>
                        {row.endangeredCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-700 text-[10px] text-gray-500 flex-shrink-0">
          <span>💀 OHKO · ⚠️ 2HKO · ↑↓ speed · Red cell = threat dominates · Green cell = we dominate</span>
          <span>{coverage.filter(r => r.endangeredCount >= 3).length} serious threats</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[250] pointer-events-none bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-2 text-[11px] min-w-[220px]"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          <p className="font-bold text-white mb-1">{tooltip.threatName} vs {tooltip.memberName}</p>
          <div className="space-y-1 text-gray-300">
            <p>Speed: <span className={tooltip.data.speedStatus === 'faster' ? 'text-red-400' : 'text-green-400'}>
              {tooltip.data.speedStatus === 'faster' ? '↑ Threat faster' : tooltip.data.speedStatus === 'slower' ? '↓ Threat slower' : '= Tie'}
              ({tooltip.data.threatSpeed} vs {tooltip.data.mySpeed})
            </span></p>
            <p>Threat → You: <span className="text-red-400 font-bold">{tooltip.data.threatBestMove}</span> ({tooltip.data.threatMaxPct}%) — {tooltip.data.threatKOPotential}</p>
            <p>You → Threat: <span className="text-green-400 font-bold">{tooltip.data.myBestMove}</span> ({tooltip.data.myMaxPct}%) — {tooltip.data.myKOPotential}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatCoverageModal;
