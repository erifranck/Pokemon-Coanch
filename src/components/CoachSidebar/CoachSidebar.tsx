import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { isKnownPokemon } from '../../utils/legality';
import { DEFAULT_REGULATION } from '../../utils/regulation';
import { getShowdownSpriteUrl } from '../../utils/spriteUtils';
import { saveSession, loadSessions, deleteSession, searchSessions, extractTags, generateSessionId, type CoachSession } from '../../utils/coachMemory';
import {
  loadProviders, saveProvider, deleteProvider, getActiveProvider, setActiveProviderId,
  getActiveProviderId, generateProviderId, PROVIDER_MODELS, type ProviderConfig,
} from '../../utils/coachProviders';
import type { TeamCard, ThreatCard, StatMap } from '../../types/store';

const NETLIFY_FUNCTION_URL = '/.netlify/functions/coach';

interface ParsedCard {
  type: 'threat' | 'set' | 'swap' | 'import';
  validated: boolean;
  validationError?: string;
  data: Record<string, unknown>;
}

interface CoachMessage {
  role: 'user' | 'coach' | 'error';
  content: string;
  cards?: ParsedCard[];
}

export const CoachSidebar: React.FC = () => {
  const { teams, activeTeamId, threats, enemyTeams, addThreat, updateTeamMember, createTeam, removeTeamMember, addTeamMember } = useAppStore();
  const activeTeam = teams[activeTeamId];

  const initialProviders = loadProviders();
  const initialActiveId = getActiveProviderId();

  const [collapsed, setCollapsed] = useState(true);
  const [providers, setProviders] = useState<ProviderConfig[]>(initialProviders);
  const [activeProviderId, setActiveProviderIdState] = useState(initialActiveId);
  const [showProvidersPanel, setShowProvidersPanel] = useState(initialProviders.length === 0);
  const [editingProvider, setEditingProvider] = useState<Partial<ProviderConfig>>({});
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<CoachSession[]>(loadSessions);
  const [sessionSearch, setSessionSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeProvider = providers.find((p) => p.id === activeProviderId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSaveProvider = () => {
    const { provider, model, apiKey, label } = editingProvider;
    if (!provider || !model || !apiKey) return;
    saveProvider({
      id: editingProvider.id || generateProviderId(),
      provider: provider as ProviderConfig['provider'],
      model,
      apiKey,
      label: label || PROVIDER_MODELS[provider]?.name || provider,
    });
    const updated = loadProviders();
    setProviders(updated);
    if (!activeProviderId) {
      setActiveProviderIdState(updated[0]?.id || '');
      setActiveProviderId(updated[0]?.id || '');
    }
    setEditingProvider({});
    setShowProvidersPanel(false);
    setToast('Provider saved');
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query || loading || !activeProvider) return;
    if (!activeTeam) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      const response = await fetch(NETLIFY_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          team: activeTeam.members as TeamCard[],
          threats: threats as ThreatCard[],
          regulation: activeTeam.regulation,
          apiKey: activeProvider.apiKey,
          provider: activeProvider.provider,
          model: activeProvider.model,
          enemyTeams: enemyTeams.map((et) => ({
            id: et.id,
            name: et.name,
            tournamentName: et.tournamentName,
            placement: et.placement,
            patternFlags: et.patternFlags,
            members: et.members,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [...prev, { role: 'error', content: data.error || 'Unknown error' }]);
      } else {
        setMessages((prev) => [...prev, {
          role: 'coach',
          content: data.text || '',
          cards: data.cards || [],
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'error',
        content: 'Connection error. Check your network and try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const validateCardLocally = (card: ParsedCard): boolean => {
    if (!activeTeam) return false;
    const fmtId = activeTeam.regulation;

    if (card.type === 'threat' && card.validated) {
      const pokemonId = card.data.pokemon as string;
      if (!pokemonId) return false;
      if (!isKnownPokemon(pokemonId, fmtId)) return false;
      return true;
    }

    if (card.type === 'set' && card.validated) {
      const target = card.data.target as string;
      if (!target) return false;
      const member = activeTeam.members.find((m) => m.pokemonId === target);
      if (!member) return false;
      return true;
    }

    return card.validated;
  };

  const handleAddThreat = (card: ParsedCard) => {
    if (!validateCardLocally(card)) {
      setToast('Cannot add: invalid data for this regulation');
      return;
    }
    const moves = String(card.data.moves || '').split(',').map((m: string) => m.trim());
    addThreat({
      pokemonId: String(card.data.pokemon || ''),
      name: String(card.data.name || card.data.pokemon || ''),
      nature: String(card.data.nature || 'Serious'),
      item: String(card.data.item || ''),
      ability: String(card.data.ability || ''),
      teraType: 'Normal',
      sps: parseSps(String(card.data.sps || '')),
      moves: [moves[0] || '', moves[1] || '', moves[2] || '', moves[3] || ''],
      threatLevel: 'medium',
    });
    setToast(`Added ${card.data.name || card.data.pokemon} to Threats`);
  };

  const handleApplySet = (card: ParsedCard) => {
    if (!activeTeam) return;
    const target = card.data.target as string;
    const member = activeTeam.members.find((m) => m.pokemonId === target);
    if (!member) {
      setToast('Target Pokemon not found in your team');
      return;
    }

    const moves = String(card.data.moves || '').split(',').map((m: string) => m.trim());

    updateTeamMember(member.id, {
      item: String(card.data.item || member.item),
      ability: String(card.data.ability || member.ability),
      nature: String(card.data.nature || member.nature),
      sps: parseSps(String(card.data.sps || '')),
      moves: [moves[0] || '', moves[1] || '', moves[2] || '', moves[3] || ''] as [string, string, string, string],
    });
    setToast(`Updated ${member.name}'s set`);
  };

  const handleSwap = (card: ParsedCard) => {
    if (!activeTeam) return;
    const fmtId = activeTeam.regulation;
    const removeId = card.data.remove as string;
    const addId = card.data.add as string;
    const addName = String(card.data.name || addId);

    if (!isKnownPokemon(addId, fmtId)) {
      setToast(`${addName} is not a valid Pokemon`);
      return;
    }

    const member = activeTeam.members.find((m) => m.pokemonId === removeId);
    if (member) {
      removeTeamMember(member.id);
    } else {
      if (activeTeam.members.length >= 6) {
        setToast('Team is full. Remove a member first.');
        return;
      }
    }

    const moves = String(card.data.moves || '').split(',').map((m: string) => m.trim());
    addTeamMember({
      pokemonId: addId,
      name: addName,
      nature: String(card.data.nature || 'Serious'),
      item: String(card.data.item || ''),
      ability: String(card.data.ability || ''),
      teraType: 'Normal',
      sps: parseSps(String(card.data.sps || '')),
      moves: [moves[0] || '', moves[1] || '', moves[2] || '', moves[3] || ''],
    });
    setToast(`Swapped to ${addName}`);
  };

  const handleSaveSession = () => {
    if (messages.length === 0) return;
    const summary = messages
      .filter((m) => m.role === 'coach')
      .map((m) => m.content)
      .join(' ')
      .slice(0, 500);
    if (!summary) return;

    const session: CoachSession = {
      id: generateSessionId(),
      createdAt: new Date().toISOString(),
      teamName: activeTeam?.name || 'Unknown Team',
      regulation: activeTeam?.regulation || DEFAULT_REGULATION,
      summary,
      tags: extractTags(summary),
      appliedCards: [],
    };

    saveSession(session);
    setSessions(loadSessions());
    setToast('Session saved');
  };

  const handleReferenceSession = (session: CoachSession) => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'coach',
        content: `Referencing session from ${session.createdAt.slice(0, 10)}:\n${session.summary}`,
      },
    ]);
    setShowHistory(false);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setSessions(loadSessions());
  };

  const filteredSessions = sessionSearch
    ? searchSessions(sessionSearch)
    : sessions;

  const handleImportTeam = (card: ParsedCard) => {
    createTeam(String(card.data.name || 'Imported Team'));
    const membersStr = card.data.members as string;
    if (membersStr) {
      const lines = membersStr.split('\n').filter(Boolean);
      for (const line of lines) {
        const parts = line.replace(/^- /, '').split(',').map((p: string) => p.trim());
        if (parts.length >= 6) {
          const [pokemonId, item, ability, nature, spsStr, ...moveParts] = parts;
          const movesStr = moveParts.join(',').trim();
          const moves = movesStr.split('/').map((m: string) => m.trim());
          addTeamMember({
            pokemonId,
            name: pokemonId.charAt(0).toUpperCase() + pokemonId.slice(1),
            nature: nature || 'Serious',
            item: item || '',
            ability: ability || '',
            teraType: 'Normal',
            sps: parseSps(spsStr),
            moves: [moves[0] || '', moves[1] || '', moves[2] || '', moves[3] || ''],
          });
        }
      }
    }
    setToast('Imported suggested team');
  };

  return (
    <div className={`fixed right-0 top-0 h-full bg-gray-800 border-l border-gray-700 transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-12' : 'w-96'}`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-gray-700 whitespace-nowrap"
        >
          {collapsed ? '▶' : '◀'}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-purple-400">AI Coach</h3>
            <span className="text-[10px] text-gray-500">Reg M-A</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <>
          {showProvidersPanel || !activeProvider ? (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-bold">Providers</span>
                {activeProvider && (
                  <button
                    onClick={() => setShowProvidersPanel(false)}
                    className="text-[10px] text-gray-500 hover:text-gray-400"
                  >
                    Back to chat
                  </button>
                )}
              </div>

              {providers.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {providers.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer ${
                        p.id === activeProviderId ? 'bg-purple-600/20 border border-purple-500/50' : 'bg-gray-700/50 hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        setActiveProviderIdState(p.id);
                        setActiveProviderId(p.id);
                        setShowProvidersPanel(false);
                      }}
                    >
                      <div>
                        <span className="text-white">{p.label}</span>
                        <span className="text-gray-500 ml-2">{PROVIDER_MODELS[p.provider]?.models.find((m) => m.id === p.model)?.name || p.model}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete ${p.label}?`)) {
                            deleteProvider(p.id);
                            setProviders(loadProviders());
                            if (activeProviderId === p.id) {
                              const nextProvider = getActiveProvider();
                              setActiveProviderIdState(nextProvider?.id || '');
                            }
                          }
                        }}
                        className="text-red-400 hover:text-red-300 text-[10px]"
                      >
                        Del
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-700 pt-3 space-y-2">
                <p className="text-[10px] text-gray-500">Add a new provider:</p>

                <select
                  value={editingProvider.provider || ''}
                  onChange={(e) => {
                    const p = e.target.value as ProviderConfig['provider'];
                    setEditingProvider((prev) => ({
                      ...prev,
                      provider: p,
                      model: PROVIDER_MODELS[p]?.models[0]?.id || '',
                    }));
                  }}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-xs text-white"
                >
                  <option value="">Select provider</option>
                  {Object.entries(PROVIDER_MODELS).map(([key, val]) => (
                    <option key={key} value={key}>{val.name}</option>
                  ))}
                </select>

                {editingProvider.provider && (
                  <>
                    <select
                      value={editingProvider.model || ''}
                      onChange={(e) => setEditingProvider((prev) => ({ ...prev, model: e.target.value }))}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-xs text-white"
                    >
                      <option value="">Quick select a model</option>
                      {PROVIDER_MODELS[editingProvider.provider]?.models.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editingProvider.model || ''}
                      onChange={(e) => setEditingProvider((prev) => ({ ...prev, model: e.target.value.replace(/\s+/g, '') }))}
                      placeholder="Custom model ID (overrides dropdown)"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </>
                )}

                <input
                  type="password"
                  value={editingProvider.apiKey || ''}
                  onChange={(e) => setEditingProvider((prev) => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="API Key"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:border-purple-500"
                />

                <input
                  type="text"
                  value={editingProvider.label || ''}
                  onChange={(e) => setEditingProvider((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="Label (e.g. My Deepseek)"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:border-purple-500"
                />

                <button
                  onClick={handleSaveProvider}
                  disabled={!editingProvider.provider || !editingProvider.apiKey}
                  className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white text-sm font-bold rounded transition-colors"
                >
                  Save Provider
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-xs mt-8">
                    <p className="text-purple-400 font-bold text-sm mb-2">PokeCoach AI</p>
                    <p>Ask me to audit your team,</p>
                    <p>analyze threats, or suggest</p>
                    <p>improvements.</p>
                    <p className="mt-4 text-gray-600">Try: "Audita mi equipo"</p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                    {msg.role === 'coach' && (
                      <div className="space-y-2 w-full">
                        <div className="p-3 bg-gray-700/50 rounded-lg text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        {msg.cards?.map((card, ci) => (
                          <div key={ci} className="border border-gray-600 rounded-lg p-3 bg-gray-750">
                            {!card.validated ? (
                              <div className="text-red-400 text-xs">
                                <span className="font-bold">Invalid suggestion</span>
                                {card.validationError && <p>{card.validationError}</p>}
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 mb-2">
                                  {(card.type === 'threat' || card.type === 'swap') && (
                                    <img
                                      src={getShowdownSpriteUrl(String(card.data.name || card.data.pokemon || ''))}
                                      alt=""
                                      className="w-8 h-8 bg-gray-700 rounded"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  )}
                                  <div>
                                    <span className="text-xs font-bold uppercase text-purple-400">
                                      {card.type === 'threat' ? 'Add Threat' :
                                       card.type === 'set' ? 'Apply Set' :
                                       card.type === 'swap' ? 'Swap Member' : 'Import Team'}
                                    </span>
                                    <p className="text-xs text-gray-400">
                                      {card.type === 'threat' && `${card.data.name || card.data.pokemon} — ${card.data.reason || ''}`}
                                      {card.type === 'set' && `Target: ${card.data.target} — ${card.data.reason || ''}`}
                                      {card.type === 'swap' && `Remove ${card.data.remove}, add ${card.data.name || card.data.add}`}
                                      {card.type === 'import' && `Team: ${card.data.name}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  {card.type === 'threat' && (
                                    <button
                                      onClick={() => handleAddThreat(card)}
                                      className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors"
                                    >
                                      Add to Threats
                                    </button>
                                  )}
                                  {card.type === 'set' && (
                                    <button
                                      onClick={() => handleApplySet(card)}
                                      className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
                                    >
                                      Apply Set
                                    </button>
                                  )}
                                  {card.type === 'swap' && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Swap ${card.data.remove} for ${card.data.name || card.data.add}?`)) {
                                          handleSwap(card);
                                        }
                                      }}
                                      className="flex-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded transition-colors"
                                    >
                                      Swap
                                    </button>
                                  )}
                                  {card.type === 'import' && (
                                    <button
                                      onClick={() => handleImportTeam(card)}
                                      className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                                    >
                                      Import Team
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.role === 'user' && (
                      <div className="p-3 bg-purple-600/20 rounded-lg text-sm text-white max-w-[85%]">
                        {msg.content}
                      </div>
                    )}

                    {msg.role === 'error' && (
                      <div className="p-3 bg-red-900/30 rounded-lg text-sm text-red-400 w-full">
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="p-3 bg-gray-700/30 rounded-lg flex items-center gap-2 w-full">
                    <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:200ms]" />
                    <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:400ms]" />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the coach..."
                    disabled={loading}
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white text-sm font-bold rounded transition-colors"
                  >
                    Send
                  </button>
                </div>
                <div className="flex justify-between mt-2 flex-wrap gap-1">
                  <button
                    onClick={() => setShowProvidersPanel(true)}
                    className="text-[10px] text-purple-400 hover:text-purple-300"
                  >
                    {activeProvider ? `${activeProvider.label}` : 'Providers'}
                  </button>
                  <button
                    onClick={() => setMessages([])}
                    className="text-[10px] text-gray-500 hover:text-gray-400"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSaveSession}
                    disabled={messages.length === 0}
                    className="text-[10px] text-purple-400 hover:text-purple-300 disabled:text-gray-600"
                  >
                    Save Session
                  </button>
                  <button
                    onClick={() => { setShowHistory(!showHistory); setSessions(loadSessions()); }}
                    className="text-[10px] text-purple-400 hover:text-purple-300"
                  >
                    History
                  </button>
                  <button
                    onClick={async () => {
                      if (!activeTeam || !activeProvider) return;
                      setToast('Fetching prompt...');
                      try {
                        const res = await fetch(NETLIFY_FUNCTION_URL, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            query: input || 'Audita mi equipo',
                            team: activeTeam.members as TeamCard[],
                            threats: threats as ThreatCard[],
                            regulation: activeTeam.regulation,
                            apiKey: activeProvider.apiKey,
                            provider: activeProvider.provider,
                            model: activeProvider.model,
                            enemyTeams: enemyTeams.map((et) => ({
                              id: et.id, name: et.name, tournamentName: et.tournamentName,
                              placement: et.placement, patternFlags: et.patternFlags, members: et.members,
                            })),
                            dryRun: true,
                          }),
                        });
                        const data = await res.json();
                        if (data.prompt) {
                          const fullText = `${data.prompt}\n\n=== USER QUERY ===\n${data.query || ''}\n\n=== MODEL ===\n${data.provider} / ${data.model}`;
                          await navigator.clipboard.writeText(fullText);
                          setToast('Prompt copied! (~' + Math.round(data.prompt.length / 1000) + 'K chars)');
                        } else {
                          setToast('Error: ' + (data.error || 'unknown'));
                        }
                      } catch {
                        setToast('Failed to fetch prompt');
                      }
                    }}
                    className="text-[10px] text-blue-400 hover:text-blue-300"
                  >
                    Copy Prompt
                  </button>
                </div>

                {showHistory && (
                  <div className="mt-2 max-h-40 overflow-y-auto border-t border-gray-700 pt-2">
                    <input
                      type="text"
                      value={sessionSearch}
                      onChange={(e) => setSessionSearch(e.target.value)}
                      placeholder="Search sessions..."
                      className="w-full p-1.5 mb-2 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    {filteredSessions.length === 0 ? (
                      <p className="text-[10px] text-gray-500 text-center">No saved sessions</p>
                    ) : (
                      filteredSessions.map((s) => (
                        <div key={s.id} className="flex items-start gap-2 p-1.5 hover:bg-gray-700/50 rounded text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <span className="text-gray-300 truncate">{s.teamName}</span>
                              <span className="text-gray-500 ml-1 shrink-0">{s.createdAt.slice(0, 10)}</span>
                            </div>
                            <p className="text-gray-500 truncate text-[10px]">{s.summary.slice(0, 80)}</p>
                            {s.tags.length > 0 && (
                              <div className="flex gap-1 mt-0.5">
                                {s.tags.slice(0, 3).map((t) => (
                                  <span key={t} className="text-[8px] bg-gray-700 px-1 rounded text-gray-400">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => handleReferenceSession(s)}
                              className="text-[10px] text-purple-400 hover:text-purple-300"
                              title="Reference"
                            >
                              Ref
                            </button>
                            <button
                              onClick={() => handleDeleteSession(s.id)}
                              className="text-[10px] text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {toast && (
            <div className="absolute bottom-20 left-4 right-4 p-2 bg-gray-700 border border-gray-600 rounded text-xs text-green-400 text-center animate-pulse">
              {toast}
            </div>
          )}
        </>
      )}
    </div>
  );
};

function parseSps(spsStr: string): StatMap {
  const parts = spsStr.split('/').map(Number);
  const labels = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const sps: Record<string, number> = {};
  for (let i = 0; i < labels.length; i++) {
    sps[labels[i]] = parts[i] || 0;
  }
  return sps as StatMap;
}

export default CoachSidebar;
