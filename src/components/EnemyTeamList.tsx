import React from 'react';
import type { EnemyProfile } from '../types/store';

interface Props {
  enemyTeams: (EnemyProfile & { threatScore?: number; endangeredCount?: number })[];
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onRename?: (id: string, name: string) => void;
}

const SCORE_COLORS = (score: number) =>
  score >= 70 ? 'text-red-400' : score >= 40 ? 'text-yellow-400' : 'text-green-400';

export const EnemyTeamList: React.FC<Props> = ({ enemyTeams, expandedId, onExpand, onDelete, onCreate }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {enemyTeams.length} team{enemyTeams.length !== 1 ? 's' : ''} ranked by threat
        </span>
        <button
          onClick={onCreate}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors"
        >
          + New Enemy Team
        </button>
      </div>

      {enemyTeams.length === 0 ? (
        <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
          <p className="mb-2">No enemy teams</p>
          <p className="text-xs">Create one or import from tournaments to analyze matchups</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enemyTeams.map((et) => {
            const score = et.threatScore || 0;
            const isExpanded = expandedId === et.id;
            return (
              <div
                key={et.id}
                className={`bg-gray-800 border rounded-lg transition-colors ${
                  isExpanded ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div
                  className="flex items-center p-3 cursor-pointer gap-3"
                  onClick={() => onExpand(isExpanded ? null : et.id)}
                >
                  <div className={`text-center min-w-[48px] ${SCORE_COLORS(score)}`}>
                    <div className="text-lg font-bold">{score}%</div>
                    <div className="text-[9px] text-gray-500">threat</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {et.tournamentName && (
                        <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 rounded">
                          #{et.placement}
                        </span>
                      )}
                      <span className="text-sm font-bold text-white truncate">{et.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-500">
                        {et.members.length}/6 members
                      </span>
                      {et.endangeredCount !== undefined && et.endangeredCount >= 3 && (
                        <span className="text-[10px] text-red-400">⚠ {et.endangeredCount} in danger</span>
                      )}
                    </div>
                    {et.patternFlags && et.patternFlags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {et.patternFlags.map((flag) => (
                          <span
                            key={flag}
                            className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                              flag === 'PERISH' ? 'bg-purple-900/50 text-purple-400' :
                              flag === 'WEATHER' ? 'bg-blue-900/50 text-blue-400' :
                              flag === 'TR' ? 'bg-pink-900/50 text-pink-400' :
                              flag === 'STALL' ? 'bg-orange-900/50 text-orange-400' :
                              'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(et.id);
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 px-1"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
