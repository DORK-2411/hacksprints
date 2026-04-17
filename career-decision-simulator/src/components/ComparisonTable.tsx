'use client';

import { Career, getTrend } from '@/lib/api';

interface ComparisonTableProps {
  career1: Career;
  career2: Career;
  locationMultiplier?: number;
}

function WinnerBadge() {
  return (
    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      BETTER
    </span>
  );
}

export default function ComparisonTable({
  career1,
  career2,
  locationMultiplier = 1,
}: ComparisonTableProps) {
  const sal1 = Math.round(career1.avg_salary * locationMultiplier);
  const sal2 = Math.round(career2.avg_salary * locationMultiplier);

  const rows = [
    {
      label: 'Avg Salary',
      val1: `$${sal1.toLocaleString()}`,
      val2: `$${sal2.toLocaleString()}`,
      winner: sal1 > sal2 ? 1 : sal2 > sal1 ? 2 : 0,
    },
    {
      label: 'Growth Rate',
      val1: `${(career1.growth_rate * 100).toFixed(0)}% /yr`,
      val2: `${(career2.growth_rate * 100).toFixed(0)}% /yr`,
      winner: career1.growth_rate > career2.growth_rate ? 1 : career2.growth_rate > career1.growth_rate ? 2 : 0,
    },
    {
      label: 'Demand Level',
      val1: `${career1.demand_level} / 5`,
      val2: `${career2.demand_level} / 5`,
      winner: career1.demand_level > career2.demand_level ? 1 : career2.demand_level > career1.demand_level ? 2 : 0,
    },
    {
      label: 'Skills Required',
      val1: `${career1.skills_required.length} skills`,
      val2: `${career2.skills_required.length} skills`,
      winner: career1.skills_required.length < career2.skills_required.length ? 1 : career2.skills_required.length < career1.skills_required.length ? 2 : 0,
    },
    {
      label: 'Market Trend',
      val1: getTrend(career1.growth_rate).label,
      val2: getTrend(career2.growth_rate).label,
      winner: career1.growth_rate > career2.growth_rate ? 1 : career2.growth_rate > career1.growth_rate ? 2 : 0,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 border-b border-white/10">
        <div className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Metric</div>
        <div className="p-4 border-l border-white/10 text-center">
          <p className="text-xs text-violet-400 uppercase tracking-wider font-semibold">Career A</p>
          <p className="text-sm font-bold text-white mt-0.5">{career1.title}</p>
        </div>
        <div className="p-4 border-l border-white/10 text-center">
          <p className="text-xs text-pink-400 uppercase tracking-wider font-semibold">Career B</p>
          <p className="text-sm font-bold text-white mt-0.5">{career2.title}</p>
        </div>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`grid grid-cols-3 border-b border-white/5 transition-colors hover:bg-white/3 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
        >
          <div className="p-4 text-sm text-white/50 font-medium flex items-center">{row.label}</div>
          <div className={`p-4 border-l border-white/5 flex items-center justify-center text-sm font-semibold
            ${row.winner === 1 ? 'text-emerald-400' : 'text-white/70'}`}>
            {row.val1}
            {row.winner === 1 && <WinnerBadge />}
          </div>
          <div className={`p-4 border-l border-white/5 flex items-center justify-center text-sm font-semibold
            ${row.winner === 2 ? 'text-emerald-400' : 'text-white/70'}`}>
            {row.val2}
            {row.winner === 2 && <WinnerBadge />}
          </div>
        </div>
      ))}

      {/* Shared Skills */}
      <div className="p-4">
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">
          Shared Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {career1.skills_required
            .filter((s) => career2.skills_required.includes(s))
            .map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-xs text-violet-300 font-medium"
              >
                {skill}
              </span>
            ))}
          {career1.skills_required.filter((s) => career2.skills_required.includes(s)).length === 0 && (
            <span className="text-sm text-white/30">No shared skills</span>
          )}
        </div>
      </div>
    </div>
  );
}
