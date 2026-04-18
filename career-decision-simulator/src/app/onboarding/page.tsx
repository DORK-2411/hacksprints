'use client';

/**
 * Onboarding Wizard — 5-step career profiling flow
 * Route: /onboarding
 *
 * Steps:
 *   1 → Career Category
 *   2 → Domain / Department
 *   3 → Pick 2 Career Options
 *   4 → Profile (sliders + skills)
 *   5 → Insights preview → redirect to /analysis
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CATEGORIES, DOMAINS, CAREER_OPTIONS, SKILL_OPTIONS,
  OnboardingState, DEFAULT_ONBOARDING_STATE,
} from '@/lib/onboardingData';
import { analyse } from '@/lib/analysisEngine';
import UserMenu from '@/components/ui/UserMenu';
import PreferenceCard from '@/components/PreferenceCard';

const STORAGE_KEY = 'pathfinder_onboarding';

// ── Step labels ───────────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, label: 'Category' },
  { number: 2, label: 'Domain' },
  { number: 3, label: 'Interest' },
  { number: 4, label: 'Compare' },
  { number: 5, label: 'Profile' },
  { number: 6, label: 'Insights' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<OnboardingState>(DEFAULT_ONBOARDING_STATE);

  // NEW: Search logic state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!debouncedQuery.trim()) return CATEGORIES;
    const q = debouncedQuery.toLowerCase();
    return CATEGORIES.filter(c => 
      c.label.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) || 
      c.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [debouncedQuery]);

  // NEW: filter SKILL_OPTIONS in real-time as user types in the skills search
  const filteredSkills = useMemo(() => {
    if (!skillSearch.trim()) return SKILL_OPTIONS;
    const q = skillSearch.toLowerCase();
    return SKILL_OPTIONS.filter(s => s.toLowerCase().includes(q));
  }, [skillSearch]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  // Derived data
  const selectedCategory = CATEGORIES.find((c) => c.id === state.categoryId);
  const availableDomains = DOMAINS.filter((d) => d.categoryId === state.categoryId);
  const selectedDomain = DOMAINS.find((d) => d.id === state.domainId);
  const categoryDomainIds = DOMAINS.filter((d) => d.categoryId === state.categoryId).map((d) => d.id);
  const availableCareers = CAREER_OPTIONS.filter((c) => categoryDomainIds.includes(c.domainId))
    .sort((a, b) => {
      // Sort selected domain careers to the top
      if (a.domainId === state.domainId && b.domainId !== state.domainId) return -1;
      if (b.domainId === state.domainId && a.domainId !== state.domainId) return 1;
      return 0;
    });

  const getDomainLabel = (domainId: string) => DOMAINS.find(d => d.id === domainId)?.label || domainId;

  // Analysis result (for step 6 preview)
  const analysisResult = step === 6 ? analyse(state) : null;

  const goNext = () => setStep((s) => Math.min(s + 1, 6));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    router.push('/analysis');
  };

  return (
    <div className="min-h-screen mesh-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl">
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight">
              Path<span className="gradient-text">Finder</span>
            </span>
          </Link>
          <span className="text-sm text-white/40">Career Profiling</span>
          <UserMenu />
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                      ${step > s.number ? 'bg-violet-600 text-white' : step === s.number ? 'bg-violet-600 text-white ring-4 ring-violet-500/30' : 'bg-white/10 text-white/30'}`}
                  >
                    {step > s.number ? '✓' : s.number}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${step >= s.number ? 'text-violet-400' : 'text-white/25'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-2 h-px mt-[-14px]" style={{ background: step > s.number ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-up">
          {/* ── Step 1: Category ─────────────────────────────────────────────── */}
          {step === 1 && (
            <section aria-labelledby="step1-heading">
              <div className="text-center mb-8">
                <h1 id="step1-heading" className="text-3xl font-black text-white mb-2">
                  Choose Your <span className="gradient-text">Career Domain</span>
                </h1>
                <p className="text-white/40 text-sm mb-6">Select the broad field you want to explore</p>
                
                {/* UPDATED: Search Bar UI */}
                <div className="relative max-w-lg mx-auto z-20">
                  <div className="relative flex items-center">
                    <svg className="w-5 h-5 absolute left-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search careers, domains, or fields..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full py-3.5 pl-12 pr-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all text-sm"
                    />
                  </div>
                  
                  {/* Smart Suggestions Dropdown */}
                  {showSuggestions && searchQuery.trim() && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#0d0d14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-fade-in origin-top">
                      {filteredCategories.slice(0, 5).map(cat => (
                        <button
                          key={`sugg-${cat.id}`}
                          onClick={() => { setState((s) => ({ ...s, categoryId: cat.id, domainId: null, selectedCareerIds: [] })); goNext(); }}
                          className="w-full text-left px-5 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors"
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <p className="font-semibold text-white text-sm">{cat.label}</p>
                            <p className="text-xs text-white/40">{cat.description}</p>
                          </div>
                        </button>
                      ))}
                      {filteredCategories.length === 0 && (
                        <div className="px-5 py-4 text-center">
                          <p className="text-sm font-medium text-white/60">No matching careers found</p>
                          <p className="text-xs text-white/40 mt-1">Try broader keywords like 'tech', 'design', or 'business'</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Grid with fade animation */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 relative z-10 transition-opacity duration-300">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setState((s) => ({ ...s, categoryId: cat.id, domainId: null, selectedCareerIds: [] })); goNext(); }}
                      className={`glass rounded-2xl p-5 text-left hover-lift border transition-all duration-200
                        ${state.categoryId === cat.id ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/8 hover:border-white/20 hover:bg-white/6'}`}
                    >
                      <span className="text-2xl mb-3 block">{cat.icon}</span>
                      <p className="font-bold text-white text-sm leading-snug">{cat.label}</p>
                      <p className="text-xs text-white/40 mt-1">{cat.description}</p>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center glass rounded-2xl border-white/5">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-white">No matching careers found</p>
                    <p className="text-sm text-white/40 mt-1">Try broader keywords like 'tech', 'design', or 'business'</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Step 2: Domain ───────────────────────────────────────────────── */}
          {step === 2 && (
            <section aria-labelledby="step2-heading">
              <div className="text-center mb-8">
                <p className="text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">{selectedCategory?.icon} {selectedCategory?.label}</p>
                <h1 id="step2-heading" className="text-3xl font-black text-white mb-2">
                  Select Your <span className="gradient-text">Specialisation</span>
                </h1>
                <p className="text-white/40 text-sm">Pick the specific department that interests you most</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {availableDomains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setState((s) => ({ ...s, domainId: d.id, selectedCareerIds: [] })); goNext(); }}
                    className={`glass rounded-xl p-4 text-left hover-lift border transition-all duration-200 flex items-center gap-3
                      ${state.domainId === d.id ? 'border-violet-500/50 bg-violet-500/10 text-violet-300' : 'border-white/8 hover:border-white/20 text-white'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                    <span className="font-semibold text-sm">{d.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={goBack} className="w-full py-3 rounded-xl border border-white/10 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                ← Back to categories
              </button>
            </section>
          )}

          {/* ── Step 3: Primary Career Selection ───────────────────────────────────────── */}
          {step === 3 && (
            <section aria-labelledby="step3-heading">
              <div className="text-center mb-8">
                <p className="text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">{selectedCategory?.label}</p>
                <h1 id="step3-heading" className="text-3xl font-black text-white mb-2">
                  Select Your <span className="gradient-text">Primary Career</span> Interest
                </h1>
                <p className="text-white/40 text-sm">Showing all options in {selectedCategory?.label}. Your selected specialization ({selectedDomain?.label}) is at the top.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {availableCareers.map((c) => {
                  const isSelected = state.selectedCareerIds[0] === c.id;
                  const demandColor = c.demand === 'High' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : c.demand === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20';

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setState((s) => ({
                          ...s,
                          selectedCareerIds: isSelected ? [] : [c.id],
                        }));
                      }}
                      aria-pressed={isSelected}
                      className={`glass rounded-2xl p-5 text-left hover-lift border transition-all duration-200
                        ${isSelected ? 'border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-500/10' : 'border-white/8 hover:border-white/20'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{c.emoji}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-white text-sm mb-0.5">{c.title}</p>
                      <p className="text-[10px] font-bold text-violet-400/80 uppercase tracking-widest mb-2">{getDomainLabel(c.domainId)}</p>
                      <p className="text-xs text-white/40 mb-3">{c.salaryRange}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${demandColor}`}>
                        {c.demand} Demand
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={goBack} className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                  ← Back
                </button>
                <button
                  onClick={goNext}
                  disabled={state.selectedCareerIds.length < 1}
                  className="flex-2 btn-primary px-8 py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </section>
          )}

          {/* ── Step 4: Career Comparison ───────────────────────────────────────── */}
          {step === 4 && (
            <section aria-labelledby="step4-heading">
              <div className="text-center mb-8">
                <p className="text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">{selectedCategory?.label}</p>
                <h1 id="step4-heading" className="text-3xl font-black text-white mb-2">
                  <span className="gradient-text">Compare</span> Careers
                </h1>
                <p className="text-white/40 text-sm">You selected <strong>{CAREER_OPTIONS.find(c => c.id === state.selectedCareerIds[0])?.title}</strong>. Now choose one more career to compare.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {availableCareers.map((c) => {
                  const isPrimary = state.selectedCareerIds[0] === c.id;
                  const isSecondary = state.selectedCareerIds[1] === c.id;
                  const demandColor = c.demand === 'High' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : c.demand === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20';

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        if (isPrimary) return; // Prevent toggling primary career here
                        setState((s) => ({
                          ...s,
                          selectedCareerIds: isSecondary
                            ? [s.selectedCareerIds[0]] // Remove secondary
                            : [s.selectedCareerIds[0], c.id], // Add secondary
                        }));
                      }}
                      disabled={isPrimary}
                      aria-pressed={isSecondary}
                      className={`glass rounded-2xl p-5 text-left transition-all duration-200
                        ${isPrimary ? 'border-violet-500/60 bg-violet-500/10 opacity-60 cursor-not-allowed'
                          : isSecondary ? 'border-pink-500/60 bg-pink-500/10 shadow-lg shadow-pink-500/10 hover-lift'
                          : 'border-white/8 hover:border-white/20 hover-lift'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{c.emoji}</span>
                        {isPrimary && (
                          <span className="px-2 py-1 bg-violet-600 rounded text-[10px] font-bold text-white uppercase tracking-wider">Your Choice</span>
                        )}
                        {isSecondary && (
                          <span className="w-5 h-5 rounded-full bg-pink-600 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-white text-sm mb-0.5">{c.title}</p>
                      <p className="text-[10px] font-bold text-violet-400/80 uppercase tracking-widest mb-2">{getDomainLabel(c.domainId)}</p>
                      <p className="text-xs text-white/40 mb-3">{c.salaryRange}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${demandColor}`}>
                        {c.demand} Demand
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={goBack} className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                  ← Back
                </button>
                <button
                  onClick={goNext}
                  disabled={state.selectedCareerIds.length !== 2}
                  className="flex-2 btn-primary px-8 py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue (2/2 selected) →
                </button>
              </div>
            </section>
          )}

          {/* ── Step 5: Profile ──────────────────────────────────────────────── */}
          {step === 5 && (
            <section aria-labelledby="step5-heading">
              <div className="text-center mb-8">
                <h1 id="step5-heading" className="text-3xl font-black text-white mb-2">
                  Build Your <span className="gradient-text">Profile</span>
                </h1>
                <p className="text-white/40 text-sm">Help us personalise your analysis</p>
              </div>

              <div className="space-y-6">
                {/* Section A: Personal Skills Sliders */}
                <div className="glass rounded-2xl p-6 border-white/8">
                  <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-black">A</span>
                    Personal Skills
                  </h2>
                  <div className="space-y-5">
                    {(
                      [
                        { key: 'leadership' as const, label: 'Leadership', hint: 'Taking initiative & guiding others' },
                        { key: 'communication' as const, label: 'Communication', hint: 'Explaining ideas clearly, written & verbal' },
                        { key: 'analytical' as const, label: 'Analytical Thinking', hint: 'Breaking down complex problems logically' },
                        { key: 'management' as const, label: 'Management Ability', hint: 'Organising people, tasks & resources' },
                      ] as const
                    ).map(({ key, label, hint }) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="text-sm font-semibold text-white">{label}</span>
                            <p className="text-xs text-white/30 mt-0.5">{hint}</p>
                          </div>
                          <span className="text-sm font-black text-violet-400 w-10 text-right">
                            {state.profile[key]}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0} max={100} step={5}
                          value={state.profile[key]}
                          onChange={(e) =>
                            setState((s) => ({
                              ...s,
                              profile: { ...s.profile, [key]: Number(e.target.value) },
                            }))
                          }
                          aria-label={`${label} level`}
                          className="w-full accent-violet-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* REMOVED: Slider-based UI */}
                {/* NEW: Button-based Work Style Preferences */}
                <div className="glass rounded-2xl p-6 border-white/8">
                  <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#00d4ff] flex items-center justify-center text-xs font-black text-[#0f172a]">B</span>
                    Work Style Preferences
                  </h2>
                  <div className="space-y-8">
                    <PreferenceCard 
                      title="1. Team Preference"
                      options={[
                        { value: 'team', label: 'Team-Oriented', icon: '👥' },
                        { value: 'solo', label: 'Solo Worker', icon: '🧍' }
                      ]}
                      selectedValue={state.profile.workPreferences.teamType}
                      onSelect={(val) => setState(s => ({...s, profile: {...s.profile, workPreferences: {...s.profile.workPreferences, teamType: val as any}}}))}
                    />
                    <PreferenceCard 
                      title="2. Work Nature"
                      options={[
                        { value: 'creative', label: 'Creative', icon: '🎨' },
                        { value: 'analytical', label: 'Analytical', icon: '📊' }
                      ]}
                      selectedValue={state.profile.workPreferences.workNature}
                      onSelect={(val) => setState(s => ({...s, profile: {...s.profile, workPreferences: {...s.profile.workPreferences, workNature: val as any}}}))}
                    />
                    <PreferenceCard 
                      title="3. Work Pace"
                      options={[
                        { value: 'stable', label: 'Stable', icon: '🧘' },
                        { value: 'fast', label: 'Fast-Paced', icon: '⚡' }
                      ]}
                      selectedValue={state.profile.workPreferences.pace}
                      onSelect={(val) => setState(s => ({...s, profile: {...s.profile, workPreferences: {...s.profile.workPreferences, pace: val as any}}}))}
                    />
                    <PreferenceCard 
                      title="4. Interaction Style"
                      options={[
                        { value: 'people', label: 'People-Facing', icon: '📢' },
                        { value: 'technical', label: 'Technical', icon: '💻' }
                      ]}
                      selectedValue={state.profile.workPreferences.interaction}
                      onSelect={(val) => setState(s => ({...s, profile: {...s.profile, workPreferences: {...s.profile.workPreferences, interaction: val as any}}}))}
                    />
                  </div>
                </div>

                {/* Section C: Current Skills */}
                <div className="glass rounded-2xl p-6 border-white/8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-xs font-black">C</span>
                      Current Skills
                    </h2>
                    <div className="flex items-center gap-2">
                      {state.profile.currentSkills.length > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                          {state.profile.currentSkills.length} selected
                        </span>
                      )}
                      <span className="text-xs text-white/30 font-normal">Select all that apply</span>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="relative mb-4">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skills… e.g. Python, Design"
                      className="w-full py-2.5 pl-9 pr-9 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-emerald-500/40 focus:bg-white/8 transition-all"
                    />
                    {skillSearch && (
                      <button
                        onClick={() => setSkillSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        aria-label="Clear search"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Skill chips */}
                  {filteredSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredSkills.map((skill) => {
                        const isSelected = state.profile.currentSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            onClick={() =>
                              setState((s) => ({
                                ...s,
                                profile: {
                                  ...s.profile,
                                  currentSkills: isSelected
                                    ? s.profile.currentSkills.filter((sk) => sk !== skill)
                                    : [...s.profile.currentSkills, skill],
                                },
                              }))
                            }
                            aria-pressed={isSelected}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150
                              ${isSelected
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 scale-[1.02]'
                                : 'border-white/10 text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20'}`}
                          >
                            {isSelected ? '✓ ' : ''}{skill}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <svg className="w-8 h-8 text-white/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-white/40">
                        No skill found for &ldquo;<span className="text-white/60 font-semibold">{skillSearch}</span>&rdquo;
                      </p>
                      <button onClick={() => setSkillSearch('')} className="text-xs text-emerald-400 mt-1 hover:text-emerald-300 transition-colors">
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={goBack} className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                  ← Back
                </button>
                <button onClick={goNext} className="flex-2 btn-primary px-8 py-3.5 rounded-xl text-sm font-bold text-white">
                  Generate Insights →
                </button>
              </div>
            </section>
          )}

          {/* ── Step 6: Insight Preview ──────────────────────────────────────── */}
          {step === 6 && analysisResult && (
            <section aria-labelledby="step6-heading">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Analysis Complete
                </div>
                <h1 id="step6-heading" className="text-3xl font-black text-white mb-2">
                  Your <span className="gradient-text">Career Insight</span>
                </h1>
              </div>

              {/* Insight card */}
              <div className="glass rounded-2xl p-6 border-violet-500/20 bg-violet-500/5 mb-6">
                <p className="text-sm text-white/80 leading-relaxed">{analysisResult.insightText}</p>
              </div>

              {/* Quick confidence preview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {analysisResult.careers.map((c, i) => (
                  <div key={c.career.id} className="glass rounded-2xl p-5 text-center border-white/8">
                    <span className="text-2xl block mb-2">{c.career.emoji}</span>
                    <p className="text-xs text-white/40 font-medium mb-1">{c.career.title}</p>
                    <p className="text-3xl font-black" style={{ color: i === 0 ? '#8b5cf6' : '#ec4899' }}>
                      {c.confidenceScore}%
                    </p>
                    <p className="text-xs text-white/30 mt-1">Confidence Score</p>
                  </div>
                ))}
              </div>

              {/* Winner banner */}
              {analysisResult.winner && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center mb-6">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Best Match</p>
                  <p className="text-lg font-black text-white">
                    {analysisResult.winner.emoji} {analysisResult.winner.title}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={goBack} className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                  ← Adjust Profile
                </button>
                <button onClick={handleFinish} className="flex-2 btn-primary px-8 py-3.5 rounded-xl text-sm font-bold text-white">
                  View Full Analysis →
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
