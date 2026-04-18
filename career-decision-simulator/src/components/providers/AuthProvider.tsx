'use client';

/**
 * AuthProvider — global auth state via InsForge SDK
 * Uses: insforge.auth.getCurrentUser() which auto-refreshes the session
 * User profile lives at data.user.profile.name / avatar_url
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import insforge from '@/lib/insforgeClient';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  /** Call after login / profile update to re-hydrate global state */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

// Shape returned by InsForge getCurrentUser
interface InsforgeUser {
  id: string;
  email: string;
  profile?: {
    name?: string;
    avatar_url?: string;
  };
}

/** Map InsForge raw user → our lean AuthUser */
function mapUser(raw: InsforgeUser): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.profile?.name,
    avatarUrl: raw.profile?.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = async () => {
    try {
      // getCurrentUser auto-refreshes the session from httpOnly cookie
      const { data, error } = await insforge.auth.getCurrentUser();
      if (!error && data?.user) {
        setUser(mapUser(data.user as InsforgeUser));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const logout = async () => {
    await insforge.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, logout, refreshUser: hydrate }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
