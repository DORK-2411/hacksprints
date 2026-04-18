'use client';

/**
 * UserMenu — top-right nav dropdown for authenticated users.
 *
 * Authenticated state: avatar + name dropdown with Profile / Themes / Logout
 * Guest state: Login + Sign Up buttons
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme, Theme } from '@/components/providers/ThemeProvider';

const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'luxury', label: 'Luxury', icon: '✨' },
];

export default function UserMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push('/login');
  };

  // While hydrating session, show nothing to avoid flash
  if (isLoading) return <div className="w-24 h-8" />;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors font-medium">
          Log In
        </Link>
        <Link
          href="/signup"
          className="text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 group focus:outline-none"
        aria-expanded={open}
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-xs font-black text-white shadow-lg group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors hidden sm:block max-w-[100px] truncate">
          {user?.name ?? user?.email?.split('@')[0]}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-[#0d0d14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* User identity header */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-bold text-white truncate">{user?.name ?? 'PathFinder User'}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>

          {/* Nav links */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span>👤</span> Profile & Settings
            </Link>
            <Link
              href="/analysis"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span>📊</span> My Analysis
            </Link>
          </div>

          {/* Theme switcher */}
          <div className="border-t border-white/5 px-4 py-2">
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-2">Theme</p>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    theme === t.id
                      ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                      : 'border-white/10 text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-white/5 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <span>🚪</span> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
