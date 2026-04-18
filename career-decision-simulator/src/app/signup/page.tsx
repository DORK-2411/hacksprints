'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import insforge from '@/lib/insforgeClient';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/onboarding` : undefined;
      const { error } = await insforge.auth.signUp({ email, password, name, redirectTo });
      if (error) throw new Error(error.message ?? 'Signup failed');
      setSuccess('Account created! Check your email to verify, then log in.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/onboarding` : undefined;
    const { error } = await insforge.auth.signInWithOAuth({ provider: 'google', redirectTo });
    if (error) setError(error.message ?? 'Google sign-in failed');
  };

  if (success) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center glass rounded-3xl p-10 border-white/8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-black text-white mb-2">You&apos;re in!</h1>
          <p className="text-white/50 text-sm mb-6">{success}</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary px-8 py-3 rounded-xl font-bold text-white text-sm"
          >
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <header className="border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight">Path<span className="gradient-text">Finder</span></span>
          </Link>
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
            Have an account? <span className="text-violet-400 font-semibold">Log In →</span>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-xs font-semibold text-pink-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
              Create Free Account
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Get Started</h1>
            <p className="text-white/40 text-sm">Join PathFinder and discover your best career path</p>
          </div>

          <div className="glass rounded-3xl p-8 border-white/8">
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 text-white text-sm font-semibold transition-all mb-5 hover:border-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 font-medium">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-xs font-semibold text-white/50 mb-1.5">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-pink-500/60 transition-all"
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-xs font-semibold text-white/50 mb-1.5">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-pink-500/60 transition-all"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-xs font-semibold text-white/50 mb-1.5">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-pink-500/60 transition-all"
                />
              </div>

              {error && (
                <div role="alert" className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account…</>
                ) : 'Create Account →'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-white/30 mt-6">
            Just exploring?{' '}
            <Link href="/onboarding" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Continue as guest →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
