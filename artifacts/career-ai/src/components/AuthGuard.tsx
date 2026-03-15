import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { user, isLoading, refreshUser } = useAuth();

  useEffect(() => {
    // Check if we have persistent auth flag
    const hasPersistentAuth = localStorage.getItem('pathai_persistent_auth');
    const hasToken = localStorage.getItem('pathai_token');
    
    // If we should be authenticated but aren't, try to restore
    if (requireAuth && !user && hasPersistentAuth && hasToken) {
      console.log('AuthGuard: Attempting to restore auth from persistent storage');
      refreshUser();
    }
    
    // If we have auth data but no persistent flag, set it
    if (user && hasToken && !hasPersistentAuth) {
      localStorage.setItem('pathai_persistent_auth', 'true');
    }
  }, [user, refreshUser, requireAuth]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If auth is required but user is not logged in, show fallback or redirect
  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Auto redirect to login
    useEffect(() => {
      window.location.href = '/login';
    }, []);
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Auth is not required or user is authenticated, show children
  return <>{children}</>;
}
