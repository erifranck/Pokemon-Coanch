import React, { useState, useMemo } from 'react';
import { PokemonCard } from './PokemonCard';
import { LeadAnalysis } from './LeadAnalysis';
import { computeThreatScore, analyzeLeads } from '../utils/enemyTeamAnalysis';
import { getShowdownSpriteUrl } from '../utils/spriteUtils';
import type { EnemyProfile, TeamCard } from '../types/store';

interface Props {
  enemyTeam: EnemyProfile;
  myTeam: TeamCard[];
  activeFormat: any;
  formatData: Record<string, any>;
  onAddMember: (enemyId: string, card: Omit<TeamCard, 'id' | 'isTeamMember'>) => void;
  onUpdateMember: (enemyId: string, memberId: string, updates: Partial<TeamCard>) => void;
  onRemoveMember: (enemyId: string, memberId: string) => void;
  onClose: () => void;
}

export const EnemyTeamExpanded: React.FC<Props> = ({
  enemyTeam, myTeam, activeFormat, formatData,
  onAddMember, onUpdateMember, onRemoveMember, onClose,
}) => {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [showLeads, setShowLeads] = useState(false);
  const [searchAdd, setSearchAdd] = useState('');

  const fmt = formatData[enemyTeam.regulation];
  const pokemon = fmt?.pokemon as Record<string, any> || {};
  const moves = fmt?.moves as Record<string, any> || {};

  const threatResult = useMemo(
    () => computeThreatScore(myTeam, enemyTeam, formatData),
    [myTeam, enemyTeam, formatData],
  );

  const leadResults = useMemo(() => {
    if (!showLeads) return null;
    const myFmt = (activeFormat as any)?.pokemon || {};
    const enemyFmt = pokemon;
    return analyzeLeads(myTeam, enemyTeam.members, myFmt, enemyFmt, moves);
  }, [showLeads, myTeam, enemyTeam, activeFormat, pokemon, moves]);

  const filteredPokedex = activeFormat
    ? Object.entries(activeFormat.pokemon)
        .filter(([_key, def]: any) =>
          def.name.toLowerCase().includes(searchAdd.toLowerCase()) &&
          !def.name.includes('-Mega'),
        )
        .slice(0, 8)
    : [];

  const handleAddMember = (pokemonId: string) => {
    const def = activeFormat?.pokemon[pokemonId];
    if (!def || enemyTeam.members.length >= 6) return;
    onAddMember(enemyTeam.id, {
      pokemonId,
      name: def.name,
      nature: 'Serious',
      item: '',
      ability: Object.values(def.abilities)[0] as string,
      teraType: def.types[0],
      sps: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: ['', '', '', ''],
    });
    setSearchAdd('');
  };

  return (
    <div className="bg-gray-800 border border-purple-500 rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">{enemyTeam.name}</h3>
          {enemyTeam.tournamentName && (
            <p className="text-xs text-yellow-500">
              {enemyTeam.tournamentName} — #{enemyTeam.placement}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLeads(!showLeads)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded"
          >
            {showLeads ? 'Hide Leads' : 'Analyze Leads'}
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">×</button>
        </div>
      </div>

      {enemyTeam.patternFlags && enemyTeam.patternFlags.length > 0 && (
        <div className="flex gap-1">
          {enemyTeam.patternFlags.map((flag) => (
            <span key={flag} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-400 font-bold">{flag}</span>
          ))}
        </div>
      )}

      {/* Threat score summary */}
      <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-4">
        <div className={`text-2xl font-bold ${threatResult.totalScore >= 70 ? 'text-red-400' : threatResult.totalScore >= 40 ? 'text-yellow-400' : 'text-green-400'}`}>
          {threatResult.totalScore}%
        </div>
        <div className="text-xs text-gray-400">
          <p>Threat Score — based on speed tiers & SE coverage (no EVs)</p>
          <p className={threatResult.endangeredCount >= 3 ? 'text-red-400' : 'text-gray-500'}>
            {threatResult.endangeredCount}/6 of your members are at risk
          </p>
        </div>
      </div>

      {/* 6x6 Matrix */}
      {myTeam.length > 0 && enemyTeam.members.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-500">Enemy ↓ / You →</th>
                {myTeam.map((m) => (
                  <th key={m.id} className="p-2">
                    <div className="flex flex-col items-center">
                      <img src={getShowdownSpriteUrl(m.name)} alt="" className="w-6 h-6 bg-gray-700 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-[9px] text-gray-400 mt-0.5 truncate max-w-[60px]">{m.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enemyTeam.members.map((em) => (
                <tr key={em.id} className="border-t border-gray-700/50">
                  <td className="p-2">
                    <div className="flex flex-col items-center">
                      <img src={getShowdownSpriteUrl(em.name)} alt="" className="w-6 h-6 bg-gray-700 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-[9px] text-gray-400 mt-0.5">{em.name}</span>
                    </div>
                  </td>
                  {myTeam.map((mm) => {
                    const result = threatResult.memberResults.find(
                      (r) => r.myMemberId === mm.id && r.enemyMemberId === em.id,
                    );
                    if (!result) return <td key={mm.id} className="p-2 text-center text-gray-600">—</td>;
                    const se = result.enemySEAgainstMe.length > 0;
                    const mySE = result.mySEAgainstEnemy.length > 0;
                    let bg = 'bg-gray-800/50';
                    if (result.speedStatus === 'faster' && se) bg = 'bg-red-900/40';
                    else if (mySE && !se) bg = 'bg-green-900/30';
                    else if (se && mySE) bg = 'bg-yellow-900/20';
                    return (
                      <td key={mm.id} className={`p-1 text-center ${bg} rounded`}>
                        <div className="text-[10px]">
                          <span className={result.speedStatus === 'faster' ? 'text-red-400' : result.speedStatus === 'slower' ? 'text-green-400' : 'text-gray-400'}>
                            {result.speedStatus === 'faster' ? '↑' : result.speedStatus === 'slower' ? '↓' : '='}
                          </span>
                          <span className="ml-0.5">{Math.round(result.threatFactor * 100)}%</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lead Analysis */}
      {showLeads && leadResults && (
        <LeadAnalysis result={leadResults} />
      )}

      {/* Enemy team members */}
      <div>
        <h4 className="text-sm font-bold text-gray-300 mb-2">
          Enemy Members ({enemyTeam.members.length}/6)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {enemyTeam.members.map((member) => (
            <div key={member.id}>
              {editingMember === member.id ? (
                <PokemonCard
                  card={member}
                  onUpdate={(updates) => onUpdateMember(enemyTeam.id, member.id, updates)}
                  onRemove={() => {
                    onRemoveMember(enemyTeam.id, member.id);
                    setEditingMember(null);
                  }}
                />
              ) : (
                <div
                  className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 cursor-pointer hover:border-purple-500/50"
                  onClick={() => setEditingMember(member.id)}
                >
                  <div className="flex items-center gap-2">
                    <img src={getShowdownSpriteUrl(member.name)} alt="" className="w-8 h-8 bg-gray-700 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-white">{member.name}</span>
                      <div className="flex gap-1 mt-0.5">
                        {member.moves.filter(Boolean).map((m, i) => (
                          <span key={i} className="text-[9px] text-blue-300">{m}</span>
                        ))}
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5">
                        {member.item || 'No item'} · {member.nature}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {enemyTeam.members.length < 6 && (
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Add Pokemon to enemy team..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-purple-500"
              value={searchAdd}
              onChange={(e) => setSearchAdd(e.target.value)}
            />
            {searchAdd && filteredPokedex.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-10">
                {filteredPokedex.map(([key, def]: any) => (
                  <button
                    key={key}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm"
                    onClick={() => handleAddMember(key)}
                  >
                    {def.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
