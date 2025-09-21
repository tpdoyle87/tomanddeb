'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import type { UserRole } from '@prisma/client';

interface AuthContextType {
  session: Session | null;
  user: Session['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isAuthor: () => boolean;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user || null;

  const clearError = () => setError(null);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
        throw new Error(result.error);
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'Registration failed');
        throw new Error(result.error || 'Registration failed');
      }

      // Auto-login after successful registration
      await login(data.email, data.password);
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role as UserRole);
  };

  const isAdmin = () => hasRole('ADMIN');
  const isEditor = () => hasRole(['ADMIN', 'EDITOR']);
  const isAuthor = () => hasRole(['ADMIN', 'EDITOR', 'AUTHOR']);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    hasRole,
    isAdmin,
    isEditor,
    isAuthor,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole | UserRole[]
) {
  return function ProtectedComponent(props: P) {
    const { isLoading, isAuthenticated, hasRole } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/auth/login');
        } else if (requiredRole && !hasRole(requiredRole)) {
          router.push('/unauthorized');
        }
      }
    }, [isLoading, isAuthenticated, requiredRole]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Role-based conditional rendering component
export function RoleGuard({
  children,
  roles,
  fallback = null,
}: {
  children: React.ReactNode;
  roles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}) {
  const { hasRole } = useAuthContext();

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}