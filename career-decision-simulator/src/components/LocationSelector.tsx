'use client';

import { LOCATION_MULTIPLIERS } from '@/lib/api';

interface LocationSelectorProps {
  value: string;
  onChange: (locationKey: string, multiplier: number) => void;
}

export default function LocationSelector({ value, onChange }: LocationSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-white/60 shrink-0">📍 Location</label>
      <select
        value={value}
        onChange={(e) => {
          const key = e.target.value;
          onChange(key, LOCATION_MULTIPLIERS[key].multiplier);
        }}
        className="flex-1 rounded-xl border border-white/10 bg-[#0f0f1a] px-3 py-2.5 text-sm text-white outline-none
          focus:border-violet-500/50 transition-colors appearance-none cursor-pointer"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23aaa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', paddingRight: '2.25rem' }}
      >
        {Object.entries(LOCATION_MULTIPLIERS).map(([key, { label, multiplier }]) => (
          <option key={key} value={key}>
            {label} — {multiplier}× salary
          </option>
        ))}
      </select>
    </div>
  );
}
