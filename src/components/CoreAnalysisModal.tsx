import React, { useState } from 'react';
import type { PokemonCard } from '../types/store';
import { analyzeTeamCores, type CoreEntry, getEffectiveSpriteName, getEffectiveTypes } from '../utils/coreAnalysis';
import { getShowdownSpriteUrl } from '../utils/spriteUtils';
import { TypeChip } from './TypeChip';

interface Props {
  team: PokemonCard[];
  activeFormat: any;
  isOpen: boolean;
  onClose: () => void;
}

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
};

const scoreBarColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

const CoreAnalysisModal: React.FC<Props> = ({ team, activeFormat, isOpen, onClose }) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const analysis = analyzeTeamCores(team, activeFormat);

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderMemberList = (members: PokemonCard[]) => (
    <div className="flex items-center gap-2 flex-wrap">
      {members.map((m, i) => {
        const spriteName = getEffectiveSpriteName(m, activeFormat);
        const types = getEffectiveTypes(m, activeFormat);
        return (
          <div key={m.id} className="flex items-center gap-1.5 bg-gray-700/50 rounded-lg px-2 py-1">
            <img
              src={getShowdownSpriteUrl(spriteName)}
              alt={m.name}
              className="w-8 h-8 bg-gray-600 rounded-full"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
            />
            <div>
              <span className="text-xs font-bold text-white block">{m.name}</span>
              <div className="flex gap-0.5">
                {types.map(t => <TypeChip key={t} type={t} className="text-[8px]!" />)}
              </div>
            </div>
            {i < members.length - 1 && <span className="text-gray-500 text-sm">+</span>}
          </div>
        );
      })}
    </div>
  );

  const renderDetail = (entry: CoreEntry) => {
    const key = entry.name + entry.members.map(m => m.id).join(',');
    const isExpanded = expandedKeys.has(key);
    return (
      <div key={key}>
        <div
          className="flex items-center justify-between p-2 hover:bg-gray-700/50 rounded cursor-pointer"
          onClick={() => toggleExpand(key)}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-sm flex-shrink-0">{entry.icon}</span>
            <span className="text-sm font-semibold text-white truncate">{entry.name}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${scoreBarColor(entry.score)}`} style={{ width: `${entry.score}%` }} />
            </div>
            <span className={`text-xs font-mono font-bold w-8 text-right ${scoreColor(entry.score)}`}>
              {entry.score}%
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="ml-8 mb-2 p-2 bg-gray-700/30 rounded text-xs space-y-2">
            {entry.details.map((d, i) => {
              const spriteName = getEffectiveSpriteName(d.member, activeFormat);
              return (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <img src={getShowdownSpriteUrl(spriteName)} alt={d.member.name} className="w-6 h-6 bg-gray-600 rounded-full" />
                    <span className="font-bold text-gray-200">{d.member.name}</span>
                    <span className="text-gray-500">— {d.member.ability || 'No ability'}</span>
                  </div>
                  <div className="text-gray-400 ml-8">
                    {d.weaknesses.length === 0 ? (
                      <span className="text-green-400">No weaknesses!</span>
                    ) : (
                      <>
                        <span>Weak to: </span>
                        {d.weaknesses.map(w => {
                          const covered = d.coveredBy.includes(w);
                          return (
                            <span key={w} className={covered ? 'text-green-400' : 'text-red-400'}>
                              {w}{covered ? ' ✓' : ' ✗'}{' '}
                            </span>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Core Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {team.length < 2 ? (
            <div className="text-center text-gray-400 py-8">
              Add at least 2 Pokémon to your team to analyze cores.
            </div>
          ) : (
            <>
              {/* Recognized Cores */}
              {analysis.recognizedCores.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-yellow-400 mb-2">🏷️ Recognized Cores</h3>
                  <div className="space-y-1">
                    {analysis.recognizedCores.map(entry => (
                      <div key={entry.name + entry.members.map(m => m.id).join(',')} className="bg-gray-750 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">{entry.icon} {entry.name}</span>
                          <span className={`text-xs font-mono ${scoreColor(entry.score)}`}>{entry.score}%</span>
                        </div>
                        {renderMemberList(entry.members)}
                        {renderDetail(entry)}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {analysis.recognizedCores.length === 0 && team.length >= 2 && (
                <div className="text-center text-gray-500 text-sm py-2">
                  No recognized type cores found for this team.
                </div>
              )}

              {/* Top Pairs */}
              <section>
                <h3 className="text-sm font-bold text-blue-400 mb-2">📊 Top Pairs</h3>
                <div className="space-y-0.5">
                  {analysis.topPairs.slice(0, 5).map(entry => renderDetail(entry))}
                </div>
              </section>

              {/* Top Triples */}
              {analysis.topTriples.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-purple-400 mb-2">📊 Top Triples</h3>
                  <div className="space-y-0.5">
                    {analysis.topTriples.slice(0, 5).map(entry => renderDetail(entry))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoreAnalysisModal;
