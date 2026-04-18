'use client';

/**
 * Analysis Page — Decision Analysis Output (the CORE feature)
 * Route: /analysis
 *
 * Reads onboarding state from localStorage.
 * Shows:
 *   • Decision Confidence Scores (both careers)
 *   • Skill Gap Analysis
 *   • Salary & Future Prediction (10-yr)
 *   • Best Career Recommendation
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OnboardingState, DEFAULT_ONBOARDING_STATE, CAREER_OPTIONS } from '@/lib/onboardingData';
import { analyse, AnalysisResult } from '@/lib/analysisEngine';
import { simulateSalary, LOCATION_MULTIPLIERS } from '@/lib/api';
import SalaryChart from '@/components/SalaryChart';
import LocationSelector from '@/components/LocationSelector';
import PremiumDivider from '@/components/PremiumDivider';
import UserMenu from '@/components/ui/UserMenu';
import MetricCard from '@/components/MetricCard';

const STORAGE_KEY = 'pathfinder_onboarding';

// Map our CareerOption to the existing Career interface shape for SalaryChart
function toChartCareer(opt: ReturnType<typeof CAREER_OPTIONS.find>) {
  if (!opt) return null;
  // Extract rough number from salaryRange like "₹8–35L" → use midpoint in thousands
  const match = opt.salaryRange.match(/₹?(\d+)[–-](\d+)/);
  const low = match ? Number(match[1]) * 100000 : 600000;
  const high = match ? Number(match[2]) * 100000 : 1200000;
  const avg = Math.round((low + high) / 2);
  return {
    id: opt.id,
    title: opt.title,
    avg_salary: avg,
    growth_rate: 0.12,
    skills_required: [],
    demand_level: opt.demand === 'High' ? 5 : opt.demand === 'Medium' ? 3 : 1,
    category: 'Technology',
    description: '',
  };
}

export default function AnalysisPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationKey, setLocationKey] = useState('india');
  const [locationMultiplier, setLocationMultiplier] = useState(1);
  const [activeTab, setActiveTab] = useState<'decision' | 'gaps' | 'salary' | 'recommendation'>('decision');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const state: OnboardingState = raw ? JSON.parse(raw) : DEFAULT_ONBOARDING_STATE;
      const res = analyse(state);
      setResult(res);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocation = (key: string, mult: number) => {
    setLocationKey(key);
    setLocationMultiplier(mult);
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Running analysis…</p>
        </div>
      </div>
    );
  }

  if (!result || result.careers.length === 0) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center text-center px-6">
        <div>
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-2xl font-black text-white mb-3">No Data Yet</h1>
          <p className="text-white/40 mb-6">Complete the career profiling wizard first.</p>
          <Link href="/onboarding" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white">
            Start Profiling →
          </Link>
        </div>
      </div>
    );
  }

  const TABS = [
    { key: 'decision' as const, label: '🎯 Decision Score' },
    { key: 'gaps' as const, label: '🔧 Skill Gaps' },
    { key: 'salary' as const, label: '💰 Salary Forecast' },
    { key: 'recommendation' as const, label: '🏆 Recommendation' },
  ];

  return (
    <div className="min-h-screen mesh-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl">
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/onboarding" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <span className="font-bold text-white text-sm tracking-tight">
            Path<span className="gradient-text">Finder</span> — Decision Analysis
          </span>
          <UserMenu />
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero result banner */}
        {result.winner && (
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-violet-900/20 p-8 text-center mb-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-violet-600/5 pointer-events-none" />
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">
              AI Recommendation
            </p>
            <p className="text-4xl mb-2">{result.winner.emoji}</p>
            <h1 className="text-3xl font-black text-white mb-2">
              <span className="gradient-text">{result.winner.title}</span>
            </h1>
            <p className="text-white/50 text-sm max-w-xl mx-auto">{result.insightText}</p>
          </div>
        )}

        <PremiumDivider />

        {/* Tab navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Decision Score ──────────────────────────────────────────── */}
        {activeTab === 'decision' && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid md:grid-cols-2 gap-6">
              {result.careers.map((c, idx) => {
                const isWinner = c.career.id === result.winner?.id;
                const barColor = idx === 0 ? '#8b5cf6' : '#ec4899';
                return (
                  <div key={c.career.id} className={`glass rounded-2xl p-7 border transition-all ${isWinner ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/8'}`}>
                    {isWinner && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 mb-4">
                        ✦ Best Match
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-3xl">{c.career.emoji}</span>
                      <div>
                        <p className="text-xs text-white/40 font-medium">{c.career.salaryRange}</p>
                        <h2 className="font-black text-white text-lg">{c.career.title}</h2>
                      </div>
                    </div>

                    {/* NEW: Decision Intelligence Panel */}
                    <div className="mb-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MetricCard title="Skills Match" value={c.skillMatchScore} type="skills" />
                        <MetricCard title="Market Demand" value={c.career.demand} type="demand" />
                        <MetricCard title="Automation Risk" value={c.automationRisk} type="automation" />
                      </div>

                      {/* Overall Score */}
                      <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-emerald-500/10 border border-white/10 p-6 text-center backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -translate-x-full group-hover:animate-shimmer" />
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 flex justify-center items-center gap-1.5">
                          <span className="w-4 h-px border-t border-white/20" />
                          Overall Decision Score
                          <span className="w-4 h-px border-t border-white/20" />
                        </h3>
                        <p className="text-5xl font-black gradient-text inline-flex items-center gap-2 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                          {c.confidenceScore}%
                        </p>
                        <p className="text-[11px] font-semibold text-white/40 mt-3 uppercase tracking-widest">
                          Based on skills match, demand, and future risk
                        </p>
                      </div>
                    </div>

                    {/* Insights */}
                    <ul className="space-y-1.5">
                      {c.insights.map((ins, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                          {ins}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Demand & growth comparison */}
            <div className="glass rounded-2xl p-6 border-white/8">
              <h2 className="font-bold text-white mb-4">Market Comparison</h2>
              <div className="grid grid-cols-2 gap-6">
                {result.careers.map((c) => (
                  <div key={c.career.id}>
                    <p className="text-xs font-semibold text-white/40 mb-2">{c.career.title}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full border ${c.career.demand === 'High' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : c.career.demand === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                        {c.career.demand} Demand
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">{c.career.salaryRange}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Skill Gaps ──────────────────────────────────────────────── */}
        {activeTab === 'gaps' && (
          <div className="space-y-6 animate-fade-up">
            {result.careers.map((c, idx) => (
              <div key={c.career.id} className="glass rounded-2xl p-6 border-white/8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{c.career.emoji}</span>
                  <h2 className="font-bold text-white">{c.career.title}</h2>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${c.gapSkills.length === 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : idx === 0 ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                        : 'text-pink-400 bg-pink-500/10 border-pink-500/20'
                    }`}>
                    {c.gapSkills.length === 0 ? '✓ All skills covered' : `${c.gapSkills.length} skills to learn`}
                  </span>
                </div>

                {c.gapSkills.length === 0 ? (
                  <p className="text-sm text-emerald-400/80 text-center py-4">
                    🎉 You already have all key skills for this career!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {c.gapSkills.map((skill, i) => (
                      <div key={skill} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400 shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{skill}</p>
                          <div className="h-1 rounded-full bg-white/10 mt-1">
                            <div
                              className="h-full rounded-full bg-amber-500"
                              style={{ width: `${Math.max(10, 100 - i * 20)}%`, transition: 'width 0.6s ease' }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-white/30">Priority {i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="text-center pt-2">
              <Link href="/roadmap" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2">
                Get a Learning Roadmap →
              </Link>
            </div>
          </div>
        )}

        {/* ── TAB: Salary Forecast ─────────────────────────────────────────── */}
        {activeTab === 'salary' && (
          <div className="space-y-6 animate-fade-up">
            <div className="max-w-sm">
              <LocationSelector value={locationKey} onChange={handleLocation} />
            </div>

            {/* Salary numbers */}
            <div className="grid md:grid-cols-2 gap-4">
              {result.careers.map((c) => {
                const chartCareer = toChartCareer(c.career);
                if (!chartCareer) return null;
                const adjSalary = Math.round(chartCareer.avg_salary * locationMultiplier);
                const tenYear = simulateSalary(chartCareer.avg_salary, chartCareer.growth_rate, 10, locationMultiplier);
                const finally_salary = tenYear.at(-1)?.salary ?? adjSalary;
                return (
                  <div key={c.career.id} className="glass rounded-2xl p-6 border-white/8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">{c.career.emoji}</span>
                      <p className="font-bold text-white text-sm">{c.career.title}</p>
                    </div>
                    <p className="text-3xl font-black text-emerald-400">
                      {adjSalary.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-white/40 mt-1">Starting salary · {LOCATION_MULTIPLIERS[locationKey]?.label}</p>
                    <div className="mt-4 pt-4 border-t border-white/8">
                      <p className="text-xs text-white/40 mb-1">10-Year Projection</p>
                      <p className="text-xl font-black text-violet-400">
                        {finally_salary.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart — use existing SalaryChart component */}
            {result.careers.length >= 2 && (() => {
              const c1 = toChartCareer(result.careers[0].career);
              const c2 = toChartCareer(result.careers[1].career);
              if (!c1 || !c2) return null;
              return <SalaryChart career1={c1} career2={c2} locationMultiplier={locationMultiplier} />;
            })()}
          </div>
        )}

        {/* ── TAB: Recommendation ──────────────────────────────────────────── */}
        {activeTab === 'recommendation' && (
          <div className="space-y-6 animate-fade-up">
            {result.winner && (
              <div className="glass rounded-2xl p-8 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{result.winner.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Our Recommendation</p>
                    <h2 className="text-2xl font-black text-white">{result.winner.title}</h2>
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-4">{result.recommendation}</p>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/roadmap" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2">
                    🗺️ Get Learning Roadmap
                  </Link>
                  <Link href="/chatbot" className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all inline-flex items-center gap-2">
                    💬 Ask AI Advisor
                  </Link>
                </div>
              </div>
            )}

            <PremiumDivider />

            {/* Reasoning cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '🧠', label: 'Skill Alignment', value: `${result.careers[0]?.skillMatchScore ?? 0}%`, desc: 'of required skills already matched' },
                { icon: '💹', label: 'Market Demand', value: result.winner?.demand ?? '—', desc: 'demand level for this role' },
                { icon: '📈', label: 'Growth Outlook', value: 'Strong', desc: '10+ year career trajectory' },
              ].map((item) => (
                <div key={item.label} className="glass rounded-2xl p-5 text-center border-white/8">
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <p className="text-xl font-black text-white mb-1">{item.value}</p>
                  <p className="text-xs font-semibold text-white/60 mb-1">{item.label}</p>
                  <p className="text-xs text-white/30">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Next steps */}
            <div className="glass rounded-2xl p-6 border-white/8">
              <h2 className="font-bold text-white mb-4">Your Next Steps</h2>
              <ol className="space-y-3">
                {[
                  { step: 1, action: 'Review your personalised learning roadmap', link: '/roadmap', label: 'View Roadmap' },
                  { step: 2, action: 'Ask the AI Advisor for specific guidance on your career', link: '/chatbot', label: 'Open Chat' },
                  { step: 3, action: 'Track your weekly progress towards your goals', link: '/progress', label: 'Progress Tracker' },
                ].map((item) => (
                  <li key={item.step} className="flex items-center gap-4">
                    <span className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                      {item.step}
                    </span>
                    <p className="flex-1 text-sm text-white/70">{item.action}</p>
                    <Link href={item.link} className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors shrink-0">
                      {item.label} →
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
