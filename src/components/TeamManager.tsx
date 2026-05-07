import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import formatData from '../data/format_data.json';
import { getMegaFormId } from '../utils/megaUtils';
import { getShowdownSpriteUrl } from '../utils/spriteUtils';
import { parsePokePaste, exportToPokePaste } from '../utils/pokepaste';

export const TeamManager: React.FC = () => {
  const { teams, activeTeamId, setActiveTeam, createTeam, cloneTeam, deleteTeam, updateTeamRegulation } = useAppStore();
  const activeTeam = teams[activeTeamId];
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState('');

  if (!activeTeam) return null;

  const activeFormat = (formatData as any)[activeTeam.regulation];

  const handleImport = () => {
    if (!importText.trim()) return;
    const { cards, dropped } = parsePokePaste(importText, activeTeam.regulation);
    const importName = cards.length > 0 ? `${cards[0].name} Team` : 'Imported Team';
    createTeam(importName);
    const toAdd = cards.slice(0, 6);
    for (const card of toAdd) {
      useAppStore.getState().addTeamMember({
        pokemonId: card.pokemonId,
        name: card.name,
        nature: card.nature,
        item: card.item,
        ability: card.ability,
        teraType: card.teraType,
        sps: card.sps,
        moves: card.moves,
      });
    }
    let msg = `Imported ${toAdd.length} Pokémon to new team.`;
    if (dropped.length > 0) msg += ` Skipped ${dropped.length} illegal: ${dropped.join(', ')}`;
    setImportMsg(msg);
    setShowImport(false);
    setImportText('');
    setTimeout(() => setImportMsg(''), 6000);
  };

  const handleExport = () => {
    const text = exportToPokePaste(activeTeam, activeTeam.regulation);
    navigator.clipboard.writeText(text).then(() => {
      setImportMsg('PokePaste copied to clipboard!');
      setTimeout(() => setImportMsg(''), 3000);
    });
  };

  return (
    <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-md mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <select 
          className="bg-gray-700 text-white p-1.5 rounded-lg font-bold border border-gray-600 focus:outline-none focus:border-blue-500 max-w-[160px] text-sm"
          value={activeTeamId}
          onChange={(e) => setActiveTeam(e.target.value)}
        >
          {Object.values(teams).map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select 
          className="bg-gray-800 text-gray-300 p-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-xs max-w-[140px]"
          value={activeTeam.regulation || 'gen9championsvgc2026regma'}
          onChange={(e) => updateTeamRegulation(activeTeamId, e.target.value)}
        >
          {Object.entries(formatData).map(([key, format]: any) => (
            <option key={key} value={key}>{format.name}</option>
          ))}
        </select>
          
        <div className="flex items-center space-x-0.5">
          {activeTeam.members.map(m => {
            if (!activeFormat) return null;
            const itemDef = m.item ? Object.values(activeFormat.items || {}).find((i: any) => i.name === m.item) as any : null;
            let activeId = m.pokemonId;
            const baseDef = activeFormat.pokemon[activeId];
            const megaId = getMegaFormId(itemDef, baseDef);
            if (megaId) activeId = megaId;
            return (
              <img key={m.id} src={getShowdownSpriteUrl(activeFormat?.pokemon?.[activeId]?.name || activeId)}
                alt={m.name} className="w-8 h-8 bg-gray-700 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/items/poke-ball.png'; }}
                title={m.name} />
            );
          })}
          {Array.from({ length: 6 - activeTeam.members.length }).map((_, i) => (
            <div key={`empty-${i}`} className="w-8 h-8 border border-dashed border-gray-600 rounded-full flex items-center justify-center text-gray-600 text-xs">+</div>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button onClick={() => createTeam()} className="px-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded">+ New</button>
          <button onClick={() => cloneTeam()} className="px-2 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold rounded">Clone</button>
          <button onClick={handleExport} className="px-2 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded">📋</button>
          <button onClick={() => setShowImport(true)} className="px-2 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded">📥</button>
          <button onClick={() => { if (window.confirm('Delete?')) deleteTeam(activeTeamId); }} className="px-2 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">✕</button>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowImport(false)}>
          <div className="bg-gray-800 p-6 rounded-xl border border-purple-700 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-purple-400 mb-3">Import from PokePaste</h3>
            <textarea className="w-full h-48 bg-gray-700 text-white text-xs p-3 rounded border border-gray-600 focus:border-purple-500 outline-none font-mono"
              placeholder="Paste your PokePaste here..." value={importText} onChange={(e) => setImportText(e.target.value)} />
            <div className="flex justify-between mt-3">
              <button onClick={() => setShowImport(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded">Cancel</button>
              <button onClick={handleImport} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded">Import</button>
            </div>
          </div>
        </div>
      )}

      {importMsg && (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-yellow-700 text-yellow-300 text-sm px-4 py-3 rounded-lg shadow-xl z-50 max-w-md">
          {importMsg}
        </div>
      )}
    </div>
  );
};
