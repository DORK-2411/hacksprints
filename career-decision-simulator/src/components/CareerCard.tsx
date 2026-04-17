'use client';

import { Career, getTrend, computeSkillMatch, computeConfidenceScore } from '@/lib/api';

interface CareerCardProps {
  career: Career;
  userSkills?: string[];
  locationMultiplier?: number;
  selected?: boolean;
  onSelect?: () => void;
}

export default function CareerCard({
  career,
  userSkills = [],
  locationMultiplier = 1,
  selected = false,
  onSelect,
}: CareerCardProps) {
  const trend = getTrend(career.growth_rate);
  const skillMatch = userSkills.length > 0 ? computeSkillMatch(userSkills, career.skills_required) : null;
  const confidence =
    skillMatch !== null
      ? computeConfidenceScore(skillMatch, career.demand_level, career.growth_rate)
      : null;

  const adjustedSalary = Math.round(career.avg_salary * locationMultiplier);

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 cursor-pointer group
        ${selected
          ? 'border-violet-500/70 bg-violet-500/10 shadow-lg shadow-violet-500/20'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
        }`}
    >
      {/* Glow accent on selected */}
      {selected && (
        <div className="absolute inset-0 rounded-2xl bg-violet-500/5 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-medium text-violet-400 uppercase tracking-widest">
            {career.category}
          </span>
          <h3 className="text-xl font-bold text-white mt-1 group-hover:text-violet-200 transition-colors">
            {career.title}
          </h3>
          <p className="text-sm text-white/50 mt-1 line-clamp-2">{career.description}</p>
        </div>
        {/* Trend badge */}
        <span className={`ml-4 shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${trend.bg} ${trend.color}`}>
          {trend.label}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-white/40 mb-1">Avg Salary</p>
          <p className="text-lg font-bold text-emerald-400">
            ${adjustedSalary.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-white/40 mb-1">Growth Rate</p>
          <p className="text-lg font-bold text-amber-400">
            {(career.growth_rate * 100).toFixed(0)}%/yr
          </p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-white/40 mb-1">Demand Level</p>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-full rounded-full transition-colors ${
                  i < career.demand_level ? 'bg-violet-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-white/40 mb-1">Skills Required</p>
          <p className="text-lg font-bold text-blue-400">{career.skills_required.length}</p>
        </div>
      </div>

      {/* Confidence score (if user skills provided) */}
      {confidence !== null && (
        <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/60">Career Match</span>
            <span className="text-lg font-black text-white">{confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-700"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      )}

      {/* Skills preview */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {career.skills_required.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60"
          >
            {skill}
          </span>
        ))}
        {career.skills_required.length > 4 && (
          <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40">
            +{career.skills_required.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}
