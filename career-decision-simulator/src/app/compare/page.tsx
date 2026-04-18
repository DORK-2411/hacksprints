'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchCareers,
  Career,
  LOCATION_MULTIPLIERS,
  computeSkillMatch,
  computeConfidenceScore,
  getMissingSkills,
  getTrend,
} from '@/lib/api';
import SalaryChart from '@/components/SalaryChart';
import ComparisonTable from '@/components/ComparisonTable';
import SkillInput from '@/components/SkillInput';
import LocationSelector from '@/components/LocationSelector';
import Roadmap from '@/components/Roadmap';

type Step = 'select' | 'skills' | 'results';

export default function ComparePage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('select');

  // Selections
  const [career1, setCareer1] = useState<Career | null>(null);
  const [career2, setCareer2] = useState<Career | null>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [locationKey, setLocationKey] = useState('india');
  const [locationMultiplier, setLocationMultiplier] = useState(1);

  // Results tab
  const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'roadmap1' | 'roadmap2'>('chart');

  useEffect(() => {
    fetchCareers().then((data) => {
      setCareers(data);
      setLoading(false);
    });
  }, []);

  const handleLocation = (key: string, mult: number) => {
    setLocationKey(key);
    setLocationMultiplier(mult);
  };

  const canProceedToSkills = career1 && career2 && career1.id !== career2.id;

  const skillMatch1 = career1 ? computeSkillMatch(userSkills, career1.skills_required) : 0;
  const skillMatch2 = career2 ? computeSkillMatch(userSkills, career2.skills_required) : 0;
  const confidence1 = career1 ? computeConfidenceScore(skillMatch1, career1.demand_level, career1.growth_rate) : 0;
  const confidence2 = career2 ? computeConfidenceScore(skillMatch2, career2.demand_level, career2.growth_rate) : 0;
  const missing1 = career1 ? getMissingSkills(userSkills, career1.skills_required) : [];
  const missing2 = career2 ? getMissingSkills(userSkills, career2.skills_required) : [];
  const winner = confidence1 > confidence2 ? career1 : confidence2 > confidence1 ? career2 : null;

  const STEPS: { key: Step; label: string }[] = [
    { key: 'select', label: 'Choose Careers' },
    { key: 'skills', label: 'Your Skills' },
    { key: 'results', label: 'Results' },
  ];

  return (
    <div className="min-h-screen mesh-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <span className="font-bold text-white text-sm tracking-tight">
            Path<span className="gradient-text">Finder</span> — Comparator
          </span>
          <div className="w-16" />
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-12">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <button
                onClick={() => {
                  if (s.key === 'results' && !canProceedToSkills) return;
                  setStep(s.key);
                }}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                  ${step === s.key
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                    : step === 'results' || (step === 'skills' && s.key === 'select')
                      ? 'text-white/60 hover:text-white cursor-pointer'
                      : 'text-white/30 cursor-default'
                  }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                  ${step === s.key ? 'bg-white text-violet-600' : 'bg-white/10 text-white/40'}`}>
                  {i + 1}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-white/10 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Select careers ── */}
        {step === 'select' && (
          <div className="animate-fade-up">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-white mb-3">
                Choose Two <span className="gradient-text">Career Paths</span>
              </h1>
              <p className="text-white/40">
                Select any two careers and we&apos;ll run a full simulation for you.
              </p>
            </div>

            {/* Location Selector */}
            <div className="max-w-sm mx-auto mb-8">
              <LocationSelector value={locationKey} onChange={handleLocation} />
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Selection state display */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                  <div className={`rounded-xl border p-4 text-sm font-semibold transition-all ${career1 ? 'border-violet-500/50 bg-violet-500/10 text-violet-300' : 'border-dashed border-white/10 text-white/30'}`}>
                    Career A: {career1 ? career1.title : 'Not selected'}
                  </div>
                  <div className={`rounded-xl border p-4 text-sm font-semibold transition-all ${career2 ? 'border-pink-500/50 bg-pink-500/10 text-pink-300' : 'border-dashed border-white/10 text-white/30'}`}>
                    Career B: {career2 ? career2.title : 'Not selected'}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {careers.map((career) => {
                    const isC1 = career1?.id === career.id;
                    const isC2 = career2?.id === career.id;
                    const trend = getTrend(career.growth_rate);
                    const adjSalary = Math.round(career.avg_salary * locationMultiplier);

                    return (
                      <div
                        key={career.id}
                        onClick={() => {
                          if (isC1) { setCareer1(null); return; }
                          if (isC2) { setCareer2(null); return; }
                          if (!career1) { setCareer1(career); return; }
                          if (!career2) { setCareer2(career); return; }
                        }}
                        className={`relative rounded-2xl border p-5 cursor-pointer transition-all duration-300 hover-lift
                          ${isC1 ? 'border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                            : isC2 ? 'border-pink-500/60 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                            : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/6'}`}
                      >
                        {(isC1 || isC2) && (
                          <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold
                            ${isC1 ? 'bg-violet-500 text-white' : 'bg-pink-500 text-white'}`}>
                            {isC1 ? 'A' : 'B'}
                          </div>
                        )}
                        <div className="flex items-start gap-3 mb-3">
                          <div>
                            <span className="text-xs text-white/40 font-medium">{career.category}</span>
                            <h3 className="font-bold text-white text-sm mt-0.5">{career.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xl font-black text-emerald-400">${adjSalary.toLocaleString()}</p>
                            <p className="text-xs text-white/40">{(career.growth_rate * 100).toFixed(0)}%/yr growth</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${trend.bg} ${trend.color}`}>
                            {trend.label}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full ${i < career.demand_level ? 'bg-violet-500' : 'bg-white/10'}`}
                            />
                          ))}
                          <span className="text-xs text-white/30 ml-1">demand</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center">
                  <button
                    disabled={!canProceedToSkills}
                    onClick={() => setStep('skills')}
                    className={`btn-primary px-10 py-4 rounded-2xl font-bold text-white inline-flex items-center gap-2 transition-all
                      ${!canProceedToSkills ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    Continue to Skill Analysis
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2: Skills ── */}
        {step === 'skills' && career1 && career2 && (
          <div className="animate-fade-up max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-white mb-3">
                What Are Your <span className="gradient-text">Current Skills</span>?
              </h1>
              <p className="text-white/40">
                Enter your skills to get a personalised match score and gap analysis.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 mb-6">
              <SkillInput onSkillsChange={setUserSkills} />
            </div>

            {/* Live preview cards */}
            {userSkills.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { career: career1, match: skillMatch1, confidence: confidence1, color: 'violet' },
                  { career: career2, match: skillMatch2, confidence: confidence2, color: 'pink' },
                ].map(({ career, match, confidence, color }) => (
                  <div key={career.id} className={`rounded-2xl border p-5 bg-${color}-500/10 border-${color}-500/20`}>
                    <p className="text-xs font-semibold text-white/40 mb-1">{career.title}</p>
                    <p className="text-3xl font-black text-white">{confidence}%</p>
                    <p className="text-xs text-white/40 mt-0.5">match score</p>
                    <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-${color}-500 transition-all duration-700`}
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep('select')}
                className="flex-1 px-6 py-3.5 rounded-xl border border-white/10 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('results')}
                className="btn-primary flex-1 px-6 py-3.5 rounded-xl font-semibold text-white text-sm"
              >
                View Full Results →
              </button>
            </div>
            {userSkills.length === 0 && (
              <p className="text-center text-xs text-white/30 mt-4">
                You can skip skill entry — results will still show salary and trend data.
              </p>
            )}
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 'results' && career1 && career2 && (
          <div className="animate-fade-up">
            {/* Winner banner */}
            {winner && userSkills.length > 0 && (
              <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">
                  Our Recommendation
                </p>
                <h2 className="text-2xl font-black text-white">
                  <span className="gradient-text">{winner.title}</span> is your best match
                </h2>
                <p className="text-sm text-white/40 mt-1">
                  Based on your skills, market demand, and growth trajectory
                </p>
              </div>
            )}

            {/* Confidence scores row */}
            {userSkills.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { career: career1, score: confidence1, match: skillMatch1, missing: missing1, color: 'from-violet-600 to-violet-800', label: 'Career A' },
                  { career: career2, score: confidence2, match: skillMatch2, missing: missing2, color: 'from-pink-600 to-pink-800', label: 'Career B' },
                ].map(({ career, score, match, missing, color, label }) => (
                  <div key={career.id} className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs text-white/40 font-medium">{label}</span>
                        <h3 className="font-bold text-white">{career.title}</h3>
                      </div>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                        <span className="text-xl font-black text-white">{score}%</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-white/60">
                        <span>Skill Match</span>
                        <span className="font-semibold text-white">{match}%</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Skills to Learn</span>
                        <span className="font-semibold text-amber-400">{missing.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {[
                { key: 'chart' as const, label: 'Salary Chart' },
                { key: 'table' as const, label: 'Comparison Table' },
                { key: 'roadmap1' as const, label: `${career1.title} Roadmap` },
                { key: 'roadmap2' as const, label: `${career2.title} Roadmap` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${activeTab === tab.key
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Location selector */}
            <div className="mb-6 max-w-sm">
              <LocationSelector value={locationKey} onChange={handleLocation} />
            </div>

            {/* Tab content */}
            {activeTab === 'chart' && (
              <SalaryChart career1={career1} career2={career2} locationMultiplier={locationMultiplier} />
            )}
            {activeTab === 'table' && (
              <ComparisonTable career1={career1} career2={career2} locationMultiplier={locationMultiplier} />
            )}
            {activeTab === 'roadmap1' && (
              <Roadmap career={career1} userSkills={userSkills} />
            )}
            {activeTab === 'roadmap2' && (
              <Roadmap career={career2} userSkills={userSkills} />
            )}

            {/* Back / restart */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setStep('skills')}
                className="px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors"
              >
                ← Edit Skills
              </button>
              <button
                onClick={() => { setCareer1(null); setCareer2(null); setUserSkills([]); setStep('select'); }}
                className="px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold text-white/60 hover:bg-white/5 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
