import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PokemonCard } from '../components/PokemonCard';
import { MetaSidebar } from '../components/MetaSidebar';
import ThreatCoverageModal from '../components/ThreatCoverageModal';
import { EnemyTeamList } from '../components/EnemyTeamList';
import { EnemyTeamExpanded } from '../components/EnemyTeamExpanded';
import { computeThreatScore, detectPatterns } from '../utils/enemyTeamAnalysis';
import { parsePokePaste } from '../utils/pokepaste';
import tournamentData from '../data/tournament_data.json';
import formatData from '../data/format_data.json';
import { DEFAULT_REGULATION } from '../utils/regulation';

type Tab = 'threats' | 'enemy';

const ThreatMatrix: React.FC = () => {
  const {
    threats, addThreat, updateThreat, removeThreat,
    teams, activeTeamId, relationships, linkThreat, unlinkThreat,
    enemyTeams, createEnemyTeam, deleteEnemyTeam, updateEnemyTeam,
    addEnemyTeamMember, updateEnemyTeamMember, removeEnemyTeamMember,
    importEnemyTeam,
  } = useAppStore();
  const team = teams[activeTeamId]?.members || [];
  const regulation = teams[activeTeamId]?.regulation || DEFAULT_REGULATION;
  const [search, setSearch] = useState('');
  const [showCoverage, setShowCoverage] = useState(false);
  const [tab, setTab] = useState<Tab>('threats');
  const [expandedEnemyId, setExpandedEnemyId] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importSelection, setImportSelection] = useState<Set<number>>(new Set());
  const [showPokePaste, setShowPokePaste] = useState(false);
  const [pokePasteText, setPokePasteText] = useState('');
  const [showTournamentBrowser, setShowTournamentBrowser] = useState(false);

  const activeFormat = (formatData as any)[regulation];

  const handleAddThreat = (pokemonId: string) => {
    const def = activeFormat?.pokemon[pokemonId];
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

  const handleCreateEnemyTeam = () => {
    createEnemyTeam(`Enemy Team ${enemyTeams.length + 1}`);
  };

  const tournamentTeams = (tournamentData as any).recentTournaments?.flatMap((t: any) => t.teams || []) || [];

  const handleImportTournamentTeams = () => {
    for (const idx of importSelection) {
      const t = tournamentTeams[idx];
      if (!t) continue;
      const exists = enemyTeams.some((et) =>
        et.tournamentName === t.tournamentName && et.placement === t.placement);
      if (exists) continue;
      importEnemyTeam({
        name: `${t.tournamentName || 'Tournament'} #${t.placement || '?'}`,
        regulation,
        members: [],
        tournamentName: t.tournamentName || '',
        placement: t.placement || 0,
        date: t.date || '',
        source: 'tournament',
        patternFlags: [],
      });
    }
    setShowImportDialog(false);
    setImportSelection(new Set());
  };

  const handlePokePasteImport = () => {
    const { cards, dropped } = parsePokePaste(pokePasteText, regulation);
    if (cards.length === 0) {
      alert(dropped.length > 0 ? `All Pokemon dropped (not in regulation): ${dropped.join(', ')}` : 'No valid Pokemon found in PokePaste.');
      return;
    }

    const members = cards.map((card) => ({
      ...card,
      id: Math.random().toString(36).substring(2, 9),
      isTeamMember: true as const,
      teraType: card.teraType || 'Normal',
    }));

    const patterns = detectPatterns(members);
    importEnemyTeam({
      name: `Imported Team ${enemyTeams.length + 1}`,
      regulation,
      members,
      tournamentName: '',
      placement: 0,
      date: '',
      source: 'manual' as const,
      patternFlags: patterns,
    });

    setShowPokePaste(false);
    setPokePasteText('');
    if (dropped.length > 0) {
      alert(`Imported ${cards.length} Pokemon. Dropped (not legal): ${dropped.join(', ')}`);
    }
  };

  const filteredPokedex = activeFormat ? Object.entries(activeFormat.pokemon)
    .filter(([_key, def]: any) => 
      def.name.toLowerCase().includes(search.toLowerCase()) &&
      !def.name.includes('-Mega')
    )
    .slice(0, 10) : [];

  const enemyTeamsWithScore = enemyTeams
    .map((et) => {
      const result = computeThreatScore(team, et, formatData);
      const patterns = detectPatterns(et.members);
      if (JSON.stringify(patterns) !== JSON.stringify(et.patternFlags)) {
        updateEnemyTeam(et.id, { patternFlags: patterns });
      }
      return { ...et, threatScore: result.totalScore, endangeredCount: result.endangeredCount };
    })
    .sort((a, b) => (b.threatScore || 0) - (a.threatScore || 0));

  return (
    <div className="flex gap-6">
      {tab === 'threats' && <MetaSidebar />}
      <div className="flex-1 space-y-6 min-w-0">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2">Threat Matrix</h1>
            <p className="text-gray-400">Manage common meta threats and link them to your team members.</p>
          </div>
          <div className="flex gap-2">
            {tab === 'threats' && (
              <button
                onClick={() => setShowCoverage(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg flex items-center gap-2"
              >
                🔍 Analyze Coverage
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setTab('threats')}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg ${tab === 'threats' ? 'bg-gray-800 text-red-400 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Threats
          </button>
          <button
            onClick={() => setTab('enemy')}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg ${tab === 'enemy' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Enemy Teams
          </button>
        </div>

        {tab === 'threats' && (
          <>
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
                          e.target.value = '';
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
          </>
        )}

        {tab === 'enemy' && (
          <>
            <EnemyTeamList
              enemyTeams={enemyTeamsWithScore}
              expandedId={expandedEnemyId}
              onExpand={setExpandedEnemyId}
              onDelete={(id) => {
                if (window.confirm('Delete this enemy team?')) deleteEnemyTeam(id);
              }}
              onCreate={handleCreateEnemyTeam}
              onRename={(id, name) => updateEnemyTeam(id, { name })}
            />
            <div className="flex gap-2">
              {tournamentTeams.length > 0 && (
                <button
                  onClick={() => setShowImportDialog(true)}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded transition-colors"
                >
                  Import Tournament Teams
                </button>
              )}
              <button
                onClick={() => setShowTournamentBrowser(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors"
              >
                Browse Tournaments
              </button>
            </div>
            <button
              onClick={() => setShowPokePaste(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
            >
              Import PokePaste
            </button>

            {/* PokePaste Import Modal */}
            {showPokePaste && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-lg w-full space-y-4">
                  <h3 className="text-lg font-bold">Import Enemy Team from PokePaste</h3>
                  <p className="text-xs text-gray-400">
                    Paste a Showdown PokePaste export of an enemy team below.
                  </p>
                  <textarea
                    value={pokePasteText}
                    onChange={(e) => setPokePasteText(e.target.value)}
                    className="w-full h-48 p-3 bg-gray-700 border border-gray-600 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    placeholder="Charizard @ Heavy-Duty Boots&#10;Ability: Blaze&#10;Tera Type: Fire&#10;EVs: 252 SpA / 4 SpD / 252 Spe&#10;Timid Nature&#10;- Flamethrower&#10;- Air Slash&#10;- Solar Beam&#10;- Protect"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handlePokePasteImport}
                      disabled={!pokePasteText.trim()}
                      className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white text-sm rounded"
                    >
                      Import
                    </button>
                    <button
                      onClick={() => { setShowPokePaste(false); setPokePasteText(''); }}
                      className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tournament Browser Modal */}
            {showTournamentBrowser && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full space-y-4 max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Tournament Teams Browser</h3>
                    <button onClick={() => setShowTournamentBrowser(false)} className="text-gray-400 hover:text-white text-lg">×</button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Browse top teams from recent tournaments. Teams without published EVs are shown by composition only.
                  </p>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {((tournamentData as any).recentTournaments || []).map((t: any, ti: number) => (
                      <div key={ti} className="bg-gray-900 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="text-sm font-bold text-white">{t.name}</span>
                            <span className="text-xs text-gray-500 ml-2">{t.date}</span>
                          </div>
                          <span className="text-xs text-gray-500">{t.players || '?'} players</span>
                        </div>
                        {t.teams && t.teams.length > 0 ? (
                          <div className="space-y-1">
                            {t.teams.map((team: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-1.5 hover:bg-gray-700/50 rounded text-xs">
                                <span className="text-yellow-400 font-bold min-w-[24px]">#{team.placement || idx + 1}</span>
                                <span className="text-gray-300 truncate flex-1">
                                  {team.members?.map((m: any) => m.name || m.pokemonId).join(' / ') || 'No members listed'}
                                </span>
                                <button
                                  onClick={() => {
                                    const exists = enemyTeams.some((et) =>
                                      et.tournamentName === t.name && et.placement === team.placement);
                                    if (exists) return;
                                    importEnemyTeam({
                                      name: `${t.name} #${team.placement || idx + 1}`,
                                      regulation,
                                      members: [],
                                      tournamentName: t.name,
                                      placement: team.placement || idx + 1,
                                      date: t.date || '',
                                      source: 'tournament',
                                      patternFlags: [],
                                    });
                                  }}
                                  className="text-[10px] px-1.5 py-0.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded shrink-0"
                                >
                                  Import
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">
                            No team compositions available. Run <code className="bg-gray-700 px-1 rounded">npm run update-data</code> to fetch tournament teams.
                          </p>
                        )}
                      </div>
                    ))}
                    {((tournamentData as any).recentTournaments || []).length === 0 && (
                      <div className="text-center text-gray-500 py-8 space-y-3">
                        <p className="text-sm">No tournament data available yet.</p>
                        <p className="text-xs">
                          Run <code className="bg-gray-700 px-1.5 py-0.5 rounded text-purple-400">npm run update-data</code> to fetch tournament results from Limitless VGC.
                        </p>
                        <p className="text-xs text-gray-600">
                          This will populate tournament_data.json with recent teams for Reg M-A.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showImportDialog && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4">
                  <h3 className="text-lg font-bold">Import Tournament Teams</h3>
                  <p className="text-xs text-gray-400">
                    Select teams to import from tournament data.
                    {tournamentTeams.length === 0 && ' No teams available.'}
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tournamentTeams.map((t: any, idx: number) => (
                      <label key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={importSelection.has(idx)}
                          onChange={() => {
                            const next = new Set(importSelection);
                            if (next.has(idx)) next.delete(idx); else next.add(idx);
                            setImportSelection(next);
                          }}
                        />
                        <span className="text-white">{t.tournamentName} #{t.placement}</span>
                        <span className="text-gray-500">{t.date}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleImportTournamentTeams}
                      disabled={importSelection.size === 0}
                      className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 text-white text-sm rounded"
                    >
                      Import Selected
                    </button>
                    <button
                      onClick={() => { setShowImportDialog(false); setImportSelection(new Set()); }}
                      className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {expandedEnemyId && (() => {
              const enemy = enemyTeams.find((et) => et.id === expandedEnemyId);
              if (!enemy) return null;
              return (
                <EnemyTeamExpanded
                  enemyTeam={enemy}
                  myTeam={team}
                  activeFormat={activeFormat}
                  formatData={formatData as any}
                  onAddMember={(enemyId, card) => addEnemyTeamMember(enemyId, card)}
                  onUpdateMember={(enemyId, memberId, updates) => updateEnemyTeamMember(enemyId, memberId, updates)}
                  onRemoveMember={(enemyId, memberId) => removeEnemyTeamMember(enemyId, memberId)}
                  onClose={() => setExpandedEnemyId(null)}
                />
              );
            })()}
          </>
        )}
      </div>

      <ThreatCoverageModal
        team={team}
        threats={threats}
        activeFormat={activeFormat}
        isOpen={showCoverage}
        onClose={() => setShowCoverage(false)}
      />
    </div>
  );
};

export default ThreatMatrix;
