import React from 'react';

export interface PreferenceOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface PreferenceCardProps {
  title: string;
  options: PreferenceOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function PreferenceCard({ title, options, selectedValue, onSelect }: PreferenceCardProps) {
  return (
    <div className="flex flex-col mb-6 last:mb-0">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`
                flex items-center gap-3 p-4 rounded-xl border transition-all duration-300
                ${isSelected 
                  ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-white shadow-[0_0_15px_rgba(0,212,255,0.15)] ring-1 ring-[#00d4ff]/50' 
                  : 'bg-[#0f172a]/60 border-white/10 text-white/60 hover:scale-105 hover:border-[#00d4ff]/40 hover:text-white/90 hover:shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                }
              `}
              aria-pressed={isSelected}
            >
              <span className={`text-xl ${isSelected ? 'opacity-100' : 'opacity-80'}`}>{opt.icon}</span>
              <span className={`font-semibold text-sm ${isSelected ? 'text-white' : ''}`}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
