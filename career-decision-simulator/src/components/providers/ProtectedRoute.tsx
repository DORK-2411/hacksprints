'use client';

/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 * Wrap any page's content with this component.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <ProfilePageContent />
 *   </ProtectedRoute>
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show a minimal loading state while session hydrates
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060610]">
        <span className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null; // redirect is in flight

  return <>{children}</>;
}
