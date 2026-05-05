import React, { useState, useRef, useEffect } from 'react';

export interface ComboboxOption {
  id: string;
  label: string;
}

interface Props {
  label: string;
  value: string; // The selected option ID
  options: ComboboxOption[];
  onChange: (id: string) => void;
  isIllegal?: boolean;
}

export const Combobox: React.FC<Props> = ({ label, value, options, onChange, isIllegal = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Find the selected option to display its label, otherwise show empty string
  const selectedOption = options.find(o => o.id === value || o.label === value);
  const displayValue = isOpen ? query : (selectedOption ? selectedOption.label : value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 50); // Limit to 50 for performance on massive lists

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
  };

  const inputStyles = isIllegal 
    ? "w-full bg-red-900/30 border border-red-500 text-red-400 rounded p-1 pl-2 focus:outline-none focus:ring-1 focus:ring-red-500"
    : "w-full bg-gray-700 border border-gray-600 rounded p-1 pl-2 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-gray-400 text-xs mb-0.5 flex justify-between">
        {label}
        {isIllegal && <span className="text-red-500 font-bold" title="Illegal in current format">⚠️</span>}
      </label>
      
      <input
        type="text"
        className={inputStyles}
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onClick={() => setIsOpen(true)}
        placeholder={selectedOption ? "" : "(None)"}
      />

      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-gray-800 border border-gray-600 rounded shadow-2xl">
          <li 
            className="px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 cursor-pointer italic"
            onClick={() => handleSelect('')}
          >
            (Clear Selection)
          </li>
          {filteredOptions.length === 0 ? (
            <li className="px-2 py-1 text-sm text-gray-500">No results found</li>
          ) : (
            filteredOptions.map((option) => (
              <li
                key={option.id}
                className="px-2 py-1 text-sm hover:bg-blue-600 cursor-pointer truncate"
                onClick={() => handleSelect(option.id)}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};
