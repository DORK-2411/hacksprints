'use client';

import { Career, generateRoadmap, getMissingSkills } from '@/lib/api';

interface RoadmapProps {
  career: Career;
  userSkills: string[];
}

const phaseColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Beginner: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', dot: 'bg-sky-500' },
  Intermediate: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', dot: 'bg-violet-500' },
  Advanced: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', dot: 'bg-pink-500' },
};

export default function Roadmap({ career, userSkills }: RoadmapProps) {
  const missingSkills = getMissingSkills(userSkills, career.skills_required);
  const phases = generateRoadmap(career, missingSkills);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Career Roadmap</h3>
        <p className="text-sm text-white/40 mt-0.5">
          Your personalized path to becoming a {career.title}
        </p>
      </div>

      {/* Missing skills summary */}
      {missingSkills.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            Skills to Learn ({missingSkills.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, i) => (
              <span
                key={skill}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-xs text-amber-300 border border-amber-500/20"
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-400">
                  {i + 1}
                </span>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {missingSkills.length === 0 && userSkills.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-emerald-400 font-semibold">
            🎉 You already have all required skills! Focus on deepening expertise.
          </p>
        </div>
      )}

      {/* Timeline phases */}
      <div className="space-y-4">
        {phases.map((phase, idx) => {
          const colors = phaseColors[phase.phase];
          return (
            <div key={phase.phase} className="relative">
              {/* Connector line */}
              {idx < phases.length - 1 && (
                <div className="absolute left-4 top-10 bottom-0 w-px bg-white/10 -mb-4" />
              )}
              <div className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full ${colors.dot} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${colors.text}`}>{phase.phase}</p>
                    <p className="text-xs text-white/40">{phase.duration}</p>
                  </div>
                </div>

                {phase.skills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-white/40 mb-1.5">Skills to master:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {phase.projects.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-1.5">Project idea:</p>
                    {phase.projects.map((p) => (
                      <p key={p} className="text-xs text-white/70 flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">▸</span>
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
