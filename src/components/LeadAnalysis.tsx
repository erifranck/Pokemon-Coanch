import React from 'react';
import type { LeadAnalysisResult, LeadResult } from '../utils/enemyTeamAnalysis';

interface Props {
  result: LeadAnalysisResult;
}

const LeadCard: React.FC<{ lead: LeadResult; label: string }> = ({ lead, label }) => (
  <div className="bg-gray-700/50 rounded-lg p-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className={`text-xs font-bold ${lead.score >= 0.7 ? 'text-green-400' : lead.score >= 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
        {Math.round(lead.score * 100)}%
      </span>
    </div>
    <div className="flex items-center gap-2">
      {lead.members.map((m) => (
        <div key={m.id} className="text-xs text-white font-bold">
          {m.name}
        </div>
      ))}
    </div>
    {lead.reasoning.length > 0 && (
      <div className="flex gap-1 mt-1 flex-wrap">
        {lead.reasoning.map((r, i) => (
          <span key={i} className="text-[8px] bg-gray-600 px-1 rounded text-gray-300">{r}</span>
        ))}
      </div>
    )}
  </div>
);

export const LeadAnalysis: React.FC<Props> = ({ result }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-4">
      <h4 className="text-sm font-bold text-purple-400">Lead Analysis</h4>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-green-400">Your Best Leads</h5>
          {result.myLeads.map((lead, i) => (
            <LeadCard key={i} lead={lead} label={`#${i + 1}`} />
          ))}
        </div>
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-red-400">Enemy Likely Leads</h5>
          {result.enemyLeads.map((lead, i) => (
            <LeadCard key={i} lead={lead} label={`#${i + 1}`} />
          ))}
        </div>
      </div>

      {result.comparisons.length > 0 && (
        <div>
          <h5 className="text-xs font-bold text-gray-400 mb-2">Head-to-Head Lead Comparison</h5>
          <div className="grid grid-cols-3 gap-2">
            {result.comparisons.slice(0, 9).map((comp, i) => {
              const myNames = comp.myLead.members.map((m) => m.name).join(' + ');
              const enemyNames = comp.enemyLead.members.map((m) => m.name).join(' + ');
              return (
                <div
                  key={i}
                  className={`p-2 rounded text-[9px] text-center ${
                    comp.myWins ? 'bg-green-900/20 border border-green-500/30 text-green-400' : 'bg-red-900/20 border border-red-500/30 text-red-400'
                  }`}
                >
                  <div className="truncate">{myNames}</div>
                  <div className="text-gray-500 my-0.5">vs</div>
                  <div className="truncate">{enemyNames}</div>
                  <div className="mt-1 font-bold">{comp.myWins ? '✓ You win lead' : '✗ You lose lead'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
