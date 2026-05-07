import React, { useState, useRef, useEffect } from 'react';
import { MoveTooltip } from './MoveTooltip';
import moveDescriptions from '../data/move-descriptions.json';

// Same color system as TypeChip for consistency
const TYPE_COLORS: Record<string, string> = {
  Normal: 'bg-gray-400 text-white',
  Fire: 'bg-red-500 text-white',
  Water: 'bg-blue-500 text-white',
  Electric: 'bg-yellow-400 text-black',
  Grass: 'bg-green-500 text-white',
  Ice: 'bg-cyan-300 text-black',
  Fighting: 'bg-red-700 text-white',
  Poison: 'bg-purple-500 text-white',
  Ground: 'bg-yellow-600 text-white',
  Flying: 'bg-indigo-400 text-white',
  Psychic: 'bg-pink-500 text-white',
  Bug: 'bg-lime-500 text-black',
  Rock: 'bg-yellow-800 text-white',
  Ghost: 'bg-purple-700 text-white',
  Dragon: 'bg-indigo-700 text-white',
  Dark: 'bg-gray-800 text-white border border-gray-600',
  Steel: 'bg-gray-500 text-white',
  Fairy: 'bg-pink-400 text-white',
  Stellar: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white'
};

// Pokemon game-style category icons (no text needed)
const CATEGORY_ICONS: Record<string, string> = {
  Physical: '💥',
  Special: '◎',
  Status: '○'
};

const CATEGORY_COLORS: Record<string, string> = {
  Physical: 'text-orange-400',
  Special: 'text-blue-400',
  Status: 'text-gray-400'
};

function getAccuracyDisplay(accuracy: number | true): { text: string; colorClass: string } {
  if (accuracy === true) return { text: '--', colorClass: 'text-gray-400' };
  const acc = Number(accuracy);
  if (isNaN(acc)) return { text: '--', colorClass: 'text-gray-400' };
  if (acc >= 100) return { text: `${acc}%`, colorClass: 'text-green-400' };
  if (acc >= 80) return { text: `${acc}%`, colorClass: 'text-yellow-400' };
  return { text: `${acc}%`, colorClass: 'text-red-400' };
}

export interface MoveOption {
  id: string;
  name: string;
  type: string;
  basePower: number;
  category: string;
  accuracy: number | true;
}

interface Props {
  label: string;
  value: string; // The selected move ID
  options: MoveOption[];
  onChange: (id: string) => void;
  isIllegal?: boolean;
  className?: string;
}

export const MoveSelector: React.FC<Props> = ({ label, value, options, onChange, isIllegal = false, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(o => o.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 50);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
    setShowTooltip(false);
  };

  const typeColorClass = selectedOption ? (TYPE_COLORS[selectedOption.type] || 'bg-gray-500 text-white') : '';

  const selectedStyles = isIllegal 
    ? "bg-red-900/30 border border-red-500 text-red-400 rounded p-1 cursor-pointer flex items-center gap-1.5 min-h-[28px]"
    : "bg-gray-700 border border-gray-600 rounded p-1 cursor-pointer flex items-center gap-1.5 min-h-[28px] hover:border-blue-500/50 transition-colors";

  const descriptionsDict = moveDescriptions as Record<string, { name: string; shortDesc: string }>;

  return (
    <div className={"relative " + className} ref={wrapperRef}>
      <label className="block text-gray-400 text-xs mb-0.5 flex justify-between">
        {label}
        {isIllegal && <span className="text-red-500 font-bold" title="Illegal in current format">⚠️</span>}
      </label>
      
      {/* Selected value display - shows type badge + move name, hover shows tooltip */}
      <div
        className={selectedStyles}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => { if (selectedOption) setShowTooltip(true); }}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {selectedOption ? (
          <>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shadow flex-shrink-0 ${typeColorClass}`}>
              {selectedOption.type}
            </span>
            <span className="text-sm truncate">{selectedOption.name}</span>
            <span className={`text-xs ml-auto flex-shrink-0 ${CATEGORY_COLORS[selectedOption.category] || 'text-gray-400'}`}>
              {CATEGORY_ICONS[selectedOption.category] || ''}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 px-1">(None)</span>
        )}
      </div>

      {/* Tooltip on hover over selected move */}
      {showTooltip && selectedOption && (
        <div className="absolute left-full top-0 ml-2 z-[100] pointer-events-none">
          <MoveTooltip
            name={selectedOption.name}
            type={selectedOption.type}
            category={selectedOption.category}
            basePower={selectedOption.basePower}
            accuracy={selectedOption.accuracy}
            description={descriptionsDict[selectedOption.id]?.shortDesc}
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-2xl">
          {/* Search input inside dropdown */}
          <div className="p-1 border-b border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded p-1 pl-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search moves..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Options list */}
          <ul className="max-h-56 overflow-y-auto">
            <li 
              className="px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 cursor-pointer italic"
              onClick={() => handleSelect('')}
            >
              (Clear Selection)
            </li>
            {filteredOptions.length === 0 ? (
              <li className="px-2 py-1 text-sm text-gray-500">No results found</li>
            ) : (
              filteredOptions.map((option) => {
                const optTypeColor = TYPE_COLORS[option.type] || 'bg-gray-500 text-white';
                const catIcon = CATEGORY_ICONS[option.category] || '';
                const catColor = CATEGORY_COLORS[option.category] || 'text-gray-400';
                const powerDisplay = option.category === 'Status' ? '--' : String(option.basePower);
                const accDisplay = getAccuracyDisplay(option.accuracy);
                const desc = descriptionsDict[option.id]?.shortDesc;
                
                return (
                  <li
                    key={option.id}
                    className="px-2 py-2 text-sm hover:bg-blue-600 cursor-pointer border-b border-gray-700/50 last:border-b-0"
                    onClick={() => handleSelect(option.id)}
                  >
                    {/* Row 1: Name + Type chip */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white truncate flex-1">{option.name}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shadow flex-shrink-0 ${optTypeColor}`}>
                        {option.type}
                      </span>
                    </div>
                    
                    {/* Row 2: Accuracy · Power · Category */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-mono ${accDisplay.colorClass}`}>
                        {accDisplay.text}
                      </span>
                      <span className="text-gray-600">·</span>
                      <span className={`font-mono ${option.category === 'Status' ? 'text-gray-500' : 'text-gray-200'}`}>
                        {powerDisplay}
                      </span>
                      <span className="text-gray-600">·</span>
                      <span className={`${catColor} text-sm`}>
                        {catIcon}
                      </span>
                    </div>

                    {/* Row 3: Effect description */}
                    {desc && (
                      <div className="mt-1 text-[11px] text-gray-400 leading-tight italic">
                        {desc}
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
