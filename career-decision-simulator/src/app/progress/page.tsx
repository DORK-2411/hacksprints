'use client';

/**
 * Progress Tracker + Help Desk
 * Route: /progress
 *
 * Sections:
 *   • Progress tracker — skill checklist with visual bar
 *   • Study plan — daily/weekly goal system
 *   • Help Desk — links to AI chat + quick FAQ
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/ui/UserMenu';

// Default skill checklist (overridden by onboarding data if available)
const DEFAULT_SKILLS = [
  'Python Basics',
  'Data Structures & Algorithms',
  'SQL Fundamentals',
  'Statistics & Probability',
  'Machine Learning Basics',
  'Model Deployment',
  'Communication & Presentation',
  'Portfolio Project',
];

const STORAGE_KEY_PROGRESS = 'pathfinder_progress';
const STORAGE_KEY_ONBOARDING = 'pathfinder_onboarding';

interface ProgressState {
  completedSkills: string[];
  weeklyGoal: number;
  completedToday: number;
  streak: number;
  lastActiveDate: string;
  notes: string;
}

const DEFAULT_PROGRESS: ProgressState = {
  completedSkills: [],
  weeklyGoal: 3,
  completedToday: 0,
  streak: 0,
  lastActiveDate: '',
  notes: '',
};

const HELP_FAQ = [
  { q: 'How do I choose between two careers?', a: 'Run the full comparison tool — it gives you a data-driven confidence score based on your skills and personality.' },
  { q: 'How long will it take to switch careers?', a: 'Typically 6–12 months of consistent effort. Use the roadmap page for a personalised timeline.' },
  { q: 'Can I use this without technical skills?', a: 'Yes! PathFinder is designed for all backgrounds — engineering, law, medicine, arts, and more.' },
];

export default function ProgressPage() {
  const [skills, setSkills] = useState<string[]>(DEFAULT_SKILLS);
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [notesDirty, setNotesDirty] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      // Load skill list from onboarding if available
      const rawOnboarding = localStorage.getItem(STORAGE_KEY_ONBOARDING);
      if (rawOnboarding) {
        const onboarding = JSON.parse(rawOnboarding);
        if (onboarding?.profile?.currentSkills?.length > 0) {
          // Merge onboarding skills with defaults (put learned skills first)
          const learned = onboarding.profile.currentSkills as string[];
          const gaps = DEFAULT_SKILLS.filter((s) => !learned.map((l: string) => l.toLowerCase()).includes(s.toLowerCase()));
          setSkills([...learned, ...gaps].slice(0, 10));
        }
      }

      const rawProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (rawProgress) setProgress(JSON.parse(rawProgress));
    } catch { /* ignore */ }
  }, []);

  // Persist progress
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress)); }
    catch { /* ignore */ }
  }, [progress]);

  const toggleSkill = (skill: string) => {
    const today = new Date().toDateString();
    setProgress((prev) => {
      const isCompleting = !prev.completedSkills.includes(skill);
      const newCompleted = isCompleting
        ? [...prev.completedSkills, skill]
        : prev.completedSkills.filter((s) => s !== skill);

      // Streak logic
      const streak = prev.lastActiveDate === today
        ? prev.streak
        : prev.lastActiveDate === new Date(Date.now() - 86400000).toDateString()
        ? prev.streak + 1
        : 1;

      return {
        ...prev,
        completedSkills: newCompleted,
        completedToday: isCompleting ? prev.completedToday + 1 : Math.max(0, prev.completedToday - 1),
        streak,
        lastActiveDate: today,
      };
    });
  };

  const pct = Math.round((progress.completedSkills.length / skills.length) * 100);

  return (
    <div className="min-h-screen mesh-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl">
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/roadmap" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Roadmap
          </Link>
          <span className="font-bold text-white text-sm tracking-tight">
            Path<span className="gradient-text">Finder</span> — Progress
          </span>
          <UserMenu />
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔥', label: 'Day Streak', value: `${progress.streak}` },
            { icon: '✅', label: 'Skills Done', value: `${progress.completedSkills.length}/${skills.length}` },
            { icon: '📅', label: "Today's Goal", value: `${progress.completedToday}/${progress.weeklyGoal}` },
            { icon: '📊', label: 'Overall Progress', value: `${pct}%` },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 text-center border-white/8">
              <span className="text-2xl block mb-2">{stat.icon}</span>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div className="glass rounded-2xl p-6 border-white/8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-white">Overall Progress</h2>
            <span className="text-sm font-black text-violet-400">{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)',
              }}
            />
          </div>
          {pct === 100 && (
            <p className="text-sm text-emerald-400 font-semibold mt-3 text-center">
              🎉 Congratulations! Ready to apply for your first role!
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── Skill Checklist ────────────────────────────────────────────── */}
          <section aria-labelledby="skills-heading">
            <div className="glass rounded-2xl p-6 border-white/8 h-full">
              <h2 id="skills-heading" className="font-bold text-white mb-5 flex items-center gap-2">
                <span className="text-lg">📋</span> Skill Checklist
              </h2>
              <ul className="space-y-2.5" role="list">
                {skills.map((skill) => {
                  const done = progress.completedSkills.includes(skill);
                  return (
                    <li key={skill}>
                      <button
                        onClick={() => toggleSkill(skill)}
                        aria-pressed={done}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left
                          ${done
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : 'border-white/8 hover:border-white/20 hover:bg-white/5'}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all
                            ${done ? 'bg-emerald-500 border-emerald-500' : 'border border-white/20 bg-transparent'}`}
                        >
                          {done && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-medium flex-1 ${done ? 'line-through text-white/40' : 'text-white'}`}>
                          {skill}
                        </span>
                        {done && <span className="text-xs text-emerald-400">✓ Done</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <div className="space-y-6">
            {/* ── Study Plan ───────────────────────────────────────────────── */}
            <section aria-labelledby="study-heading" className="glass rounded-2xl p-6 border-white/8">
              <h2 id="study-heading" className="font-bold text-white mb-5 flex items-center gap-2">
                <span className="text-lg">🎯</span> Daily Study Target
              </h2>

              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Daily goal</span>
                  <span className="font-bold text-white">{progress.weeklyGoal} skill{progress.weeklyGoal !== 1 ? 's' : ''}/day</span>
                </div>
                <input
                  type="range"
                  min={1} max={5} step={1}
                  value={progress.weeklyGoal}
                  onChange={(e) => setProgress((p) => ({ ...p, weeklyGoal: Number(e.target.value) }))}
                  aria-label="Daily learning goal"
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>Relaxed</span>
                  <span>Intensive</span>
                </div>
              </div>

              {/* Daily dots */}
              <div className="flex gap-1.5 mb-4">
                {Array.from({ length: progress.weeklyGoal }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                      i < progress.completedToday ? 'bg-violet-500' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40">
                {progress.completedToday >= progress.weeklyGoal
                  ? "🎉 Daily goal achieved! See you tomorrow."
                  : `${progress.weeklyGoal - progress.completedToday} more skill${progress.weeklyGoal - progress.completedToday !== 1 ? 's' : ''} to hit today's target`}
              </p>
            </section>

            {/* ── Notes ────────────────────────────────────────────────────── */}
            <section className="glass rounded-2xl p-6 border-white/8">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-lg">📝</span> Learning Notes
              </h2>
              <textarea
                value={progress.notes}
                onChange={(e) => {
                  setProgress((p) => ({ ...p, notes: e.target.value }));
                  setNotesDirty(true);
                }}
                onBlur={() => setNotesDirty(false)}
                placeholder="Write your learning notes, questions, or reflections here…"
                rows={5}
                aria-label="Learning notes"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40 transition-all leading-relaxed resize-none"
              />
              {notesDirty && (
                <p className="text-[10px] text-white/30 mt-1 text-right">Saved automatically</p>
              )}
            </section>
          </div>
        </div>

        {/* ── Help Desk ─────────────────────────────────────────────────────── */}
        <section aria-labelledby="help-heading" className="glass rounded-2xl p-8 border-white/8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 id="help-heading" className="text-xl font-black text-white mb-1">
                🛟 Help Desk
              </h2>
              <p className="text-sm text-white/40">Get answers instantly — AI-powered or from our FAQ</p>
            </div>
            <Link
              href="/chatbot"
              className="btn-primary px-5 py-3 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Open AI Chat
            </Link>
          </div>

          {/* FAQ */}
          <div className="space-y-3">
            {HELP_FAQ.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/8 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
                >
                  <span className="font-semibold text-white text-sm pr-4">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-violet-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-3 justify-center pb-6">
          {[
            { href: '/', label: '🏠 Home' },
            { href: '/onboarding', label: '🔄 Re-do Profiling' },
            { href: '/analysis', label: '📊 Analysis' },
            { href: '/roadmap', label: '🗺️ Roadmap' },
            { href: '/chatbot', label: '💬 AI Chat' },
            { href: '/compare', label: '⚖️ Compare Careers' },
          ].map((nav) => (
            <Link
              key={nav.href}
              href={nav.href}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              {nav.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
