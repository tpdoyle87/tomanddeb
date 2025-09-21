'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import type { UserRole } from '@prisma/client';

/**
 * Custom hook for authentication
 */
export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }, [user]);

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => hasRole('ADMIN'), [hasRole]);

  /**
   * Check if user is editor or higher
   */
  const isEditor = useCallback(() => hasRole(['ADMIN', 'EDITOR']), [hasRole]);

  /**
   * Check if user is author or higher
   */
  const isAuthor = useCallback(() => hasRole(['ADMIN', 'EDITOR', 'AUTHOR']), [hasRole]);

  /**
   * Require authentication - redirects to login if not authenticated
   */
  const requireAuth = useCallback((redirectTo = '/auth/login') => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router]);

  /**
   * Require specific role - redirects if user doesn't have the role
   */
  const requireRole = useCallback((
    role: UserRole | UserRole[],
    redirectTo = '/unauthorized'
  ) => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (!hasRole(role)) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, hasRole, router]);

  /**
   * Update user session
   */
  const updateSession = useCallback(async () => {
    await update();
  }, [update]);

  return {
    user,
    session,
    status,
    isLoading,
    isAuthenticated,
    hasRole,
    isAdmin,
    isEditor,
    isAuthor,
    requireAuth,
    requireRole,
    updateSession,
  };
}

/**
 * Hook to protect client components
 */
export function useProtectedRoute(
  requiredRole?: UserRole | UserRole[],
  redirectTo = '/unauthorized'
) {
  const router = useRouter();
  const { isLoading, isAuthenticated, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (requiredRole && !hasRole(requiredRole)) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, hasRole, router, redirectTo]);

  return { isLoading };
}

/**
 * Hook for role-based rendering
 */
export function useRoleAccess(requiredRole: UserRole | UserRole[]) {
  const { hasRole } = useAuth();
  return hasRole(requiredRole);
}

/**
 * Hook to get role hierarchy level
 */
export function useRoleLevel() {
  const { user } = useAuth();
  
  const getRoleLevel = (role?: UserRole): number => {
    if (!role) return 0;
    
    const levels: Record<UserRole, number> = {
      ADMIN: 4,
      EDITOR: 3,
      AUTHOR: 2,
      READER: 1,
    };
    
    return levels[role] || 0;
  };

  return {
    userRoleLevel: getRoleLevel(user?.role),
    getRoleLevel,
    hasMinimumRole: (minimumRole: UserRole) => {
      return getRoleLevel(user?.role) >= getRoleLevel(minimumRole);
    },
  };
}