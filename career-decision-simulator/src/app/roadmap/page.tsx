'use client';

/**
 * Career Roadmap Page
 * Route: /roadmap
 *
 * Reads the recommended career from localStorage (onboarding state),
 * then renders a full phase-by-phase learning timeline.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OnboardingState, DEFAULT_ONBOARDING_STATE, CAREER_OPTIONS } from '@/lib/onboardingData';
import { analyse, generateDetailedRoadmap, DetailedRoadmap } from '@/lib/analysisEngine';
import UserMenu from '@/components/ui/UserMenu';

const STORAGE_KEY = 'pathfinder_onboarding';

// External resources per skill category
const RESOURCES: Record<string, { name: string; url: string; type: string }[]> = {
  Programming: [
    { name: 'freeCodeCamp', url: 'https://freecodecamp.org', type: 'Free' },
    { name: 'The Odin Project', url: 'https://theodinproject.com', type: 'Free' },
  ],
  'Linux / Bash Scripting': [
    { name: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'Free' },
    { name: 'KodeKloud - DevOps', url: 'https://kodekloud.com/', type: 'Paid' },
  ],
  'Cloud Platforms (AWS/Azure/GCP)': [
    { name: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws/', type: 'Free' },
    { name: 'A Cloud Guru', url: 'https://acloudguru.com/', type: 'Paid' },
  ],
  'Data Analysis': [
    { name: 'Kaggle Learn', url: 'https://kaggle.com/learn', type: 'Free' },
    { name: 'DataCamp', url: 'https://datacamp.com', type: 'Paid' },
  ],
  Design: [
    { name: 'Figma Academy', url: 'https://figma.com/resources/learn-design', type: 'Free' },
    { name: 'Google UX Design (Coursera)', url: 'https://grow.google/certificates/ux-design', type: 'Paid' },
  ],
  Communication: [
    { name: 'Toastmasters', url: 'https://toastmasters.org', type: 'Paid' },
    { name: 'Coursera — Business Communication', url: 'https://coursera.org', type: 'Free/Paid' },
  ],
  Finance: [
    { name: 'CFA Institute', url: 'https://cfainstitute.org', type: 'Paid' },
    { name: 'Investopedia Academy', url: 'https://investopedia.com/academy', type: 'Paid' },
  ],
  default: [
    { name: 'Coursera', url: 'https://coursera.org', type: 'Free/Paid' },
    { name: 'YouTube', url: 'https://youtube.com', type: 'Free' },
  ],
};

const PHASE_COLORS = ['violet', 'pink', 'emerald'];
const PHASE_GRADIENTS = [
  'from-violet-600/20 to-violet-600/5',
  'from-pink-600/20 to-pink-600/5',
  'from-emerald-600/20 to-emerald-600/5',
];
const PHASE_BORDERS = ['border-violet-500/30', 'border-pink-500/30', 'border-emerald-500/30'];
const PHASE_DOTS = ['bg-violet-500', 'bg-pink-500', 'bg-emerald-500'];

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<DetailedRoadmap | null>(null);
  const [careerTitle, setCareerTitle] = useState('Your Career');
  const [careerEmoji, setCareerEmoji] = useState('🗺️');
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState<number>(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const state: OnboardingState = raw ? JSON.parse(raw) : DEFAULT_ONBOARDING_STATE;
      const res = analyse(state);

      if (res.roadmapCareer) {
        const analysis = res.careers.find((c) => c.career.id === res.roadmapCareer!.id);
        if (analysis) {
          const generated = generateDetailedRoadmap(res.roadmapCareer, analysis, state);
          setRoadmap(generated);
          setCareerTitle(res.roadmapCareer.title);
          setCareerEmoji(res.roadmapCareer.emoji);
        }
      }
    } catch (err) {
      console.error('Roadmap error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!roadmap || roadmap.phases.length === 0) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center text-center px-6">
        <div>
          <p className="text-4xl mb-4">🗺️</p>
          <h1 className="text-2xl font-black text-white mb-3">No Roadmap Yet</h1>
          <p className="text-white/40 mb-6">Complete the career wizard to generate your personalised roadmap.</p>
          <Link href="/onboarding" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white">
            Start Wizard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl">
        <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/analysis" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Analysis
          </Link>
          <span className="font-bold text-white text-sm tracking-tight">
            Path<span className="gradient-text">Finder</span> — Roadmap
          </span>
          <UserMenu />
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-4xl mb-3">{careerEmoji}</p>
          <h1 className="text-4xl font-black text-white mb-3">
            Your <span className="gradient-text">{careerTitle}</span> Roadmap
          </h1>
          <p className="text-white/40">A step-by-step 12-month plan to land your dream role</p>

          {/* Intelligence Overlays */}
          {roadmap && (
            <div className="mt-8 grid md:grid-cols-2 gap-4 text-left border border-white/5 bg-white/5 rounded-3xl p-6 relative overflow-hidden">
               {/* Background flare */}
               <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
               <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-pink-500/10 blur-[50px] rounded-full pointer-events-none" />

               <div className="glass p-5 rounded-2xl border-white/10 relative">
                 <h2 className="text-base font-black text-white mb-3">✨ Why This Fits You</h2>
                 <ul className="space-y-3">
                   {roadmap.whyThisCareer.map((reason, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-sm text-emerald-400">
                       <span className="shrink-0 mt-0.5">•</span> 
                       <span className="font-medium">{reason}</span>
                     </li>
                   ))}
                 </ul>
               </div>
               <div className="flex flex-col gap-4 relative">
                 <div className="glass p-5 rounded-2xl border-white/10 flex-1">
                   <h2 className="text-base font-black text-white mb-3">⚠️ Weak Areas Focus</h2>
                   <ul className="space-y-3">
                     {roadmap.weakAreas.map((reason, idx) => (
                       <li key={idx} className="flex items-start gap-2 text-sm text-pink-400/90">
                         <span className="shrink-0 mt-0.5">•</span> 
                         <span className="font-medium">{reason}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div className="glass p-4 rounded-xl border-white/10 flex items-center justify-between">
                   <span className="text-sm font-bold text-white">Transition Difficulty</span>
                   <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                    roadmap.switchDifficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    roadmap.switchDifficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-pink-500/20 text-pink-400 border-pink-500/30'
                   }`}>{roadmap.switchDifficulty}</span>
                 </div>
               </div>
            </div>
          )}

          {/* Timeline bar */}
          <div className="flex items-center justify-center gap-0 mt-12 max-w-sm mx-auto">
            {roadmap?.phases.map((phase, i) => (
              <div key={i} className="flex items-center flex-1">
                <button
                  onClick={() => setExpandedPhase(i)}
                  className={`flex flex-col items-center flex-1 transition-all ${expandedPhase === i ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${expandedPhase === i ? PHASE_DOTS[i] + ' shadow-lg' : 'bg-white/10'}`}>
                    {phase.emoji}
                  </div>
                  <span className="text-[10px] mt-1 font-semibold text-white/60">{phase.duration}</span>
                </button>
                {i < roadmap.phases.length - 1 && <div className="h-px w-8 bg-white/15 mx-1 mt-[-10px]" />}
              </div>
            ))}
          </div>
        </div>

        {/* Phase cards */}
        <div className="space-y-6">
          {roadmap?.phases.map((phase, i) => (
            <article
              key={i}
              className={`rounded-3xl border overflow-hidden transition-all duration-300 cursor-pointer
                ${expandedPhase === i ? `bg-gradient-to-br ${PHASE_GRADIENTS[i]} ${PHASE_BORDERS[i]}` : 'border-white/8 glass hover:border-white/15'}`}
              onClick={() => setExpandedPhase(expandedPhase === i ? -1 : i)}
              aria-expanded={expandedPhase === i}
            >
              {/* Phase header */}
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${expandedPhase === i ? PHASE_DOTS[i] : 'bg-white/10'}`}>
                    {phase.emoji}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{phase.duration}</p>
                    <h2 className="text-lg font-black text-white">{phase.phase} Phase</h2>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-white/10 px-2 py-1 rounded-lg text-white/50">
                    {phase.skills.length} skill{phase.skills.length !== 1 ? 's' : ''}
                  </span>
                  <svg
                    className={`w-5 h-5 text-white/40 transition-transform duration-200 ${expandedPhase === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded content */}
              {expandedPhase === i && (
                <div className="px-6 pb-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Skills to learn */}
                    <div>
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Skills to Master</h3>
                      <ul className="space-y-4">
                        {phase.skills.map((skill, idx) => (
                          <li key={idx} className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/5 bg-white/5">
                            <div className="flex items-start gap-2.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${PHASE_DOTS[i]}`} />
                              <span className="text-sm text-white/90 font-bold leading-tight">{skill.name}</span>
                            </div>
                            <div className="flex gap-2 pl-4.5 ms-4 border-l border-white/10 pl-2 ml-1 items-center">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                skill.priority === 'High' ? 'bg-pink-500/20 text-pink-400' :
                                skill.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-violet-500/20 text-violet-400'
                              }`}>{skill.priority} Priority</span>
                              <span className="text-[10px] text-white/40 font-mono tracking-tighter">⏱ {skill.timeEstimate}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div>
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Action Items</h3>
                      <ul className="space-y-2">
                        {phase.actions.map((action, ai) => (
                          <li key={ai} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black text-white/50 shrink-0 mt-0.5">
                              {ai + 1}
                            </span>
                            <span className="text-sm text-white/70">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Milestone */}
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
                    <span className="text-lg">🏆</span>
                    <div>
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Phase Milestone</p>
                      <p className="text-sm font-semibold text-white">{phase.milestone}</p>
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Recommended Resources</h3>
                    <div className="flex flex-wrap gap-2">
                      {phase.resources.map((r, ri) => (
                        <a
                          key={ri}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 text-xs font-semibold text-white/80 hover:text-white transition-all"
                        >
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${r.isFree ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {r.isFree ? 'Free' : 'Paid'}
                          </span>
                          <span className="truncate max-w-[200px]">{r.title} <span className="text-white/40 font-medium text-[10px] ml-1">({r.platform})</span></span>
                          <span className="text-white/20">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* CTA bar */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/progress" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2">
            📈 Track My Progress
          </Link>
          <Link href="/chatbot" className="px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all inline-flex items-center gap-2">
            💬 Ask AI for Help
          </Link>
        </div>
      </main>
    </div>
  );
}
