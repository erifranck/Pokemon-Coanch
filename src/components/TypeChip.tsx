import React from 'react';

const TYPE_COLORS: Record<string, string> = {
  Normal: 'bg-gray-400',
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Electric: 'bg-yellow-400 text-black',
  Grass: 'bg-green-500',
  Ice: 'bg-cyan-300 text-black',
  Fighting: 'bg-red-700',
  Poison: 'bg-purple-500',
  Ground: 'bg-yellow-600',
  Flying: 'bg-indigo-400',
  Psychic: 'bg-pink-500',
  Bug: 'bg-lime-500 text-black',
  Rock: 'bg-yellow-800',
  Ghost: 'bg-purple-700',
  Dragon: 'bg-indigo-700',
  Dark: 'bg-gray-800 border border-gray-600',
  Steel: 'bg-gray-500',
  Fairy: 'bg-pink-400',
  Stellar: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
};

interface Props {
  type: string;
}

export const TypeChip: React.FC<Props> = ({ type }) => {
  const colorClass = TYPE_COLORS[type] || 'bg-gray-500';
  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow ${colorClass}`}>
      {type}
    </span>
  );
};
