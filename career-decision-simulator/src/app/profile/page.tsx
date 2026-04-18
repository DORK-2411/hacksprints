'use client';

/**
 * /profile — Protected user dashboard
 *
 * InsForge API used:
 *  - insforge.auth.getCurrentUser()  → fetch live user + profile
 *  - insforge.auth.setProfile()      → update name / avatar_url
 *  - insforge.auth.signOut()         → logout
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme, Theme } from '@/components/providers/ThemeProvider';
import ProtectedRoute from '@/components/providers/ProtectedRoute';
import UserMenu from '@/components/ui/UserMenu';
import insforge from '@/lib/insforgeClient';
import { CAREER_OPTIONS } from '@/lib/onboardingData';

const THEMES: { id: Theme; label: string; icon: string; desc: string }[] = [
  { id: 'dark',    label: 'Dark Mode',    icon: '🌙', desc: 'Default dark theme' },
  { id: 'light',   label: 'Light Mode',   icon: '☀️', desc: 'Clean and bright'   },
  { id: 'luxury',  label: 'Luxury Mode',  icon: '✨', desc: 'Gold & premium feel' },
];

function ProfileContent() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // ── local form state ──────────────────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ── career choices from localStorage ────────────────────────────────────
  const [savedCareerIds, setSavedCareerIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pathfinder_onboarding');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSavedCareerIds(parsed.selectedCareerIds ?? []);
      }
    } catch { /* ignore */ }
  }, []);

  const selectedCareers = savedCareerIds
    .map((id) => CAREER_OPTIONS.find((c) => c.id === id))
    .filter(Boolean) as (typeof CAREER_OPTIONS)[number][];

  // ── save display name via InsForge setProfile() ──────────────────────────
  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      // insforge.auth.setProfile() updates the profile row in InsForge
      const { error } = await insforge.auth.setProfile({ name: name.trim() });
      if (error) throw new Error(error.message ?? 'Update failed');
      // Re-hydrate global auth context so UserMenu/avatar reflects change immediately
      await refreshUser();
      setSaveMsg({ text: '✓ Name updated successfully!', ok: true });
    } catch (err) {
      setSaveMsg({ text: err instanceof Error ? err.message : 'Failed to update name.', ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // ── avatar initials ──────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen mesh-bg">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl">
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight">Path<span className="gradient-text">Finder</span></span>
          </Link>
          <UserMenu />
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* ── Identity card ── */}
        <section className="glass rounded-3xl p-8 border-white/8 flex items-center gap-6">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name ?? 'avatar'}
              className="w-20 h-20 rounded-full object-cover shadow-xl shadow-violet-500/20 border-2 border-violet-500/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-xl shadow-violet-500/20">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white truncate">{user?.name ?? 'PathFinder User'}</h1>
            <p className="text-white/40 text-sm mt-0.5 truncate">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Session
            </span>
          </div>
        </section>

        {/* ── Update name ── */}
        <section className="glass rounded-2xl p-6 border-white/8">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-black">A</span>
            Account Details
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-semibold text-white/50 mb-1.5">
                Display Name
              </label>
              <div className="flex gap-3">
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/60 transition-all"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !name.trim() || name.trim() === user?.name}
                  className="btn-primary px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40 shrink-0"
                >
                  {saving ? '…' : 'Save'}
                </button>
              </div>
              {saveMsg && (
                <p className={`text-xs mt-2 ${saveMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                  {saveMsg.text}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Email Address</label>
              <p className="px-4 py-3 bg-white/3 border border-white/5 rounded-xl text-sm text-white/50 select-all">
                {user?.email}
              </p>
              <p className="text-[10px] text-white/25 mt-1">Email cannot be changed from the profile page.</p>
            </div>
          </div>
        </section>

        {/* ── Saved career choices ── */}
        <section className="glass rounded-2xl p-6 border-white/8">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-pink-600 flex items-center justify-center text-xs font-black">B</span>
            Saved Career Choices
          </h2>

          {selectedCareers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {selectedCareers.map((career, i) => (
                  <div
                    key={career.id}
                    className={`rounded-xl p-4 border flex items-center gap-3 ${
                      i === 0
                        ? 'border-violet-500/30 bg-violet-500/5'
                        : 'border-pink-500/30 bg-pink-500/5'
                    }`}
                  >
                    <span className="text-2xl">{career.emoji}</span>
                    <div>
                      <p className="font-bold text-white text-sm">{career.title}</p>
                      <p className={`text-xs font-semibold ${i === 0 ? 'text-violet-400' : 'text-pink-400'}`}>
                        {i === 0 ? 'Primary Choice' : 'Comparison'}
                      </p>
                      <p className="text-xs text-white/40">
                        {career.salaryRange} · {career.demand} Demand
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link
                  href="/analysis"
                  className="flex-1 text-center py-3 rounded-xl border border-violet-500/30 text-sm font-bold text-violet-400 hover:bg-violet-500/10 transition-all"
                >
                  View Full Analysis →
                </Link>
                <Link
                  href="/onboarding"
                  className="flex-1 text-center py-3 rounded-xl border border-white/10 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  Retake Quiz
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-3">🎯</p>
              <p className="text-white font-semibold mb-1">No career choices saved yet</p>
              <p className="text-white/40 text-sm mb-4">Complete the 6-step career quiz to see your results here.</p>
              <Link
                href="/onboarding"
                className="btn-primary inline-block px-6 py-3 rounded-xl text-sm font-bold text-white"
              >
                Start Career Quiz →
              </Link>
            </div>
          )}
        </section>

        {/* ── Theme picker ── */}
        <section className="glass rounded-2xl p-6 border-white/8">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-xs font-black">C</span>
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  theme === t.id
                    ? 'border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                    : 'border-white/8 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <span className="text-2xl block mb-1">{t.icon}</span>
                <p className="font-bold text-white text-xs">{t.label}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{t.desc}</p>
                {theme === t.id && (
                  <span className="inline-block mt-2 text-[9px] font-bold text-violet-400 uppercase tracking-widest">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Danger / session zone ── */}
        <section className="glass rounded-2xl p-6 border-red-500/10">
          <h2 className="text-sm font-bold text-white/40 mb-4">Session</h2>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl border border-red-500/20 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
          >
            🚪 Log out of PathFinder
          </button>
        </section>

      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
