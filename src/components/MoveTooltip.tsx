import React from 'react';

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

const CATEGORY_STYLES: Record<string, { icon: string; color: string; label: string }> = {
  Physical: { icon: '💥', color: 'text-orange-400', label: 'Physical' },
  Special:  { icon: '◎', color: 'text-blue-400', label: 'Special' },
  Status:   { icon: '○', color: 'text-gray-400', label: 'Status' }
};

function getAccuracyDisplay(accuracy: number | string | true): { text: string; colorClass: string } {
  if (accuracy === true) return { text: '--', colorClass: 'text-gray-400' };
  const acc = Number(accuracy);
  if (isNaN(acc)) return { text: '--', colorClass: 'text-gray-400' };
  if (acc >= 100) return { text: `${acc}%`, colorClass: 'text-green-400' };
  if (acc >= 80) return { text: `${acc}%`, colorClass: 'text-yellow-400' };
  return { text: `${acc}%`, colorClass: 'text-red-400' };
}

interface Props {
  name: string;
  type: string;
  category: string;
  basePower: number | string;
  accuracy: number | string | true;
  description?: string;
}

export const MoveTooltip: React.FC<Props> = ({ name, type, category, basePower, accuracy, description }) => {
  const typeColorClass = TYPE_COLORS[type] || 'bg-gray-500 text-white';
  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES['Status'];
  const accDisplay = getAccuracyDisplay(accuracy);
  
  // Power display: number for attacks, "--" for Status (0 power)
  const powerDisplay = category === 'Status' || Number(basePower) === 0 ? '--' : String(basePower);

  return (
    <div className="w-52 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl overflow-hidden">
      {/* Move Name Header */}
      <div className="px-3 py-2 bg-gray-750 border-b border-gray-700">
        <p className="text-white font-bold text-sm truncate">{name}</p>
      </div>
      
      {/* Body */}
      <div className="px-3 py-2 space-y-2 text-sm">
        {/* Type Badge */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs w-14 flex-shrink-0">Type</span>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow ${typeColorClass}`}>
            {type}
          </span>
        </div>

        {/* Power */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs w-14 flex-shrink-0">Power</span>
          <span className={`font-bold text-lg ${category === 'Status' ? 'text-gray-500' : 'text-white'}`}>
            {powerDisplay}
          </span>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs w-14 flex-shrink-0">Category</span>
          <span className={`font-semibold ${catStyle.color}`}>
            {catStyle.icon} {catStyle.label}
          </span>
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs w-14 flex-shrink-0">Accuracy</span>
          <span className={`font-semibold ${accDisplay.colorClass}`}>
            {accDisplay.text}
          </span>
        </div>
      </div>

      {/* Effect Description */}
      {description && (
        <div className="px-3 py-2 bg-gray-750 border-t border-gray-700">
          <p className="text-xs text-gray-400 leading-tight italic">{description}</p>
        </div>
      )}
    </div>
  );
};
