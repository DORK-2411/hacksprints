'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchCareers, Career, getTrend } from '@/lib/api';

const MARQUEE_ITEMS = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'AI/ML Engineer',
  'Cloud Architect', 'UX Designer', 'DevOps Engineer', 'Cybersecurity Analyst',
  'Financial Analyst', 'Marketing Manager',
];

const STATS = [
  { value: '10+', label: 'Career Paths' },
  { value: '10-yr', label: 'Salary Forecast' },
  { value: '100%', label: 'Free to Use' },
  { value: '7', label: 'Global Regions' },
];

const FAQS = [
  {
    q: 'How is the salary projection calculated?',
    a: 'We use compound growth: Year salary = Previous salary + (Previous salary × Growth Rate). This models realistic career earnings over 10 years adjusted for location.',
  },
  {
    q: 'How does the location multiplier work?',
    a: 'Each country has a salary multiplier (e.g., USA = 2×, India = 1×). We multiply the base salary by this factor to give you a realistic regional estimate.',
  },
  {
    q: 'What is the Decision Confidence Score?',
    a: 'It is computed as: (Skill Match × 0.5) + (Demand Level × 10 × 0.3) + (Growth Rate × 100 × 0.2). The higher the score, the better the career fits your current profile.',
  },
  {
    q: 'Can I compare any two careers?',
    a: 'Yes! The comparator lets you select any two careers from our database and see a side-by-side breakdown of salary, growth, demand, and shared skills.',
  },
  {
    q: 'Is the data real?',
    a: 'The data is based on industry reports and market research. Exact figures may vary by company, experience level, and niche — use this as a strategic planning tool, not a guarantee.',
  },
];

export default function HomePage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchCareers().then((data) => {
      setCareers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen mesh-bg">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight">
              Career<span className="gradient-text">Sim</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#careers" className="hover:text-white transition-colors">Careers</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <Link
            href="/compare"
            className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold text-white"
          >
            Start Comparing →
          </Link>
        </nav>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 text-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-pink-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Powered by Real Market Data
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Your Future Career,{' '}
            <span className="gradient-text">Simulated.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Compare careers side-by-side, forecast your 10-year salary, analyse skill gaps,
            and make a{' '}
            <span className="text-white font-semibold">confident, data-driven decision</span> about
            your next move.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/compare"
              className="btn-primary px-8 py-4 rounded-2xl text-base font-bold text-white inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Simulate My Career
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-2xl text-base font-semibold text-white/70 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4">
                <p className="text-2xl font-black gradient-text">{stat.value}</p>
                <p className="text-xs text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Marquee ─── */}
      <div className="py-6 border-y border-white/5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-8">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-semibold text-white/25 flex items-center gap-3">
              {item}
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500/40" />
            </span>
          ))}
        </div>
      </div>

      {/* ─── Features ─── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">
            Everything you need
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Make the <span className="gradient-text">Right Move</span>
          </h2>
          <p className="text-white/40 mt-4 max-w-xl mx-auto">
            Seven precision tools crafted to turn career anxiety into absolute clarity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              ),
              title: 'Career Comparator',
              desc: 'Compare salary, demand, growth, and skills across any two careers. See exactly where each path leads.',
              color: 'text-violet-400',
              bg: 'bg-violet-500/10 border-violet-500/20',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              ),
              title: '10-Year Salary Simulator',
              desc: 'Watch your salary compound year-over-year. Interactive chart that adjusts for location and growth rate.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              ),
              title: 'Skill Gap Analyzer',
              desc: 'Input your current skills and instantly see what\'s missing. Get priority-ordered learning paths.',
              color: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/20',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              ),
              title: 'Confidence Score',
              desc: 'A proprietary score combining skill match, market demand, and growth rate — your personal career fit metric.',
              color: 'text-pink-400',
              bg: 'bg-pink-500/10 border-pink-500/20',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              ),
              title: 'Career Roadmap',
              desc: 'A beginner-to-advanced timeline with skills to learn and real project ideas to build your portfolio.',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10 border-blue-500/20',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
              ),
              title: 'Location Adjuster',
              desc: 'Salaries vary wildly by country. Apply real multipliers for India, USA, UK, Germany, and 3 more regions.',
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10 border-cyan-500/20',
            },
          ].map((f) => (
            <div key={f.title} className={`glass rounded-2xl p-6 border hover-lift ${f.bg}`}>
              <div className={`mb-4 ${f.color}`}>{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Careers Preview ─── */}
      <section id="careers" className="max-w-7xl mx-auto px-6 pb-24">
        <div className="section-divider mb-16" />
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">Live Data</p>
            <h2 className="text-3xl font-black text-white">Explore Career Paths</h2>
          </div>
          <Link
            href="/compare"
            className="hidden md:block text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Compare all →
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careers.slice(0, 6).map((career) => {
              const trend = getTrend(career.growth_rate);
              return (
                <Link key={career.id} href="/compare" className="block hover-lift">
                  <div className="glass rounded-2xl p-5 h-full border-white/8 hover:border-violet-500/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs text-violet-400 font-medium">{career.category}</span>
                        <h3 className="font-bold text-white mt-0.5">{career.title}</h3>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${trend.bg} ${trend.color}`}>
                        {trend.label}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-emerald-400 mb-1">
                      ${career.avg_salary.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/40">
                      {(career.growth_rate * 100).toFixed(0)}% yearly growth · Demand {career.demand_level}/5
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-900/30 to-pink-900/20 p-12 text-center animate-pulse-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-pink-600/5 pointer-events-none" />
          <h2 className="text-4xl font-black text-white mb-4 relative">
            Ready to <span className="gradient-text">Own Your Future</span>?
          </h2>
          <p className="text-white/50 mb-8 relative max-w-xl mx-auto">
            Stop guessing. Start simulating. Our precision tools give you the clarity to make
            the most important career decision of your life.
          </p>
          <Link
            href="/compare"
            className="btn-primary px-10 py-4 rounded-2xl text-base font-bold text-white inline-flex items-center gap-2 relative"
          >
            Launch Simulator Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="max-w-3xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white">Frequently Asked <span className="gradient-text">Questions</span></h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden border-white/8">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors"
              >
                <span className="font-semibold text-white text-sm pr-4">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-violet-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © 2025 CareerSim. Built with precision for your future.
          </p>
          <Link href="/compare" className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Start Comparing Careers →
          </Link>
        </div>
      </footer>
    </div>
  );
}
