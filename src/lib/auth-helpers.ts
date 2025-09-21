import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { UserRole } from '@prisma/client';

/**
 * Get the current user session from server components
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Get the current session from server components
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Check if user is authenticated (for server components)
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole | UserRole[]) {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  return hasRole('ADMIN');
}

/**
 * Check if user is editor or higher
 */
export async function isEditor() {
  return hasRole(['ADMIN', 'EDITOR']);
}

/**
 * Check if user is author or higher
 */
export async function isAuthor() {
  return hasRole(['ADMIN', 'EDITOR', 'AUTHOR']);
}

/**
 * Protect server component - redirects to login if not authenticated
 */
export async function requireAuth() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/auth/login');
  }
}

/**
 * Protect admin routes - redirects if not admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  if (user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }
}

/**
 * Protect editor routes - redirects if not editor or admin
 */
export async function requireEditor() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  if (!['ADMIN', 'EDITOR'].includes(user.role)) {
    redirect('/unauthorized');
  }
}

/**
 * Protect author routes - redirects if not author, editor, or admin
 */
export async function requireAuthor() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  if (!['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role)) {
    redirect('/unauthorized');
  }
}

/**
 * Generate a secure random token
 */
export function generateToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  
  return token;
}

/**
 * Check if a user owns a resource
 */
export async function ownsResource(resourceUserId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // Admins can access everything
  if (user.role === 'ADMIN') return true;
  
  // Check ownership
  return user.id === resourceUserId;
}

/**
 * Get role hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    ADMIN: 4,
    EDITOR: 3,
    AUTHOR: 2,
    READER: 1,
  };
  return levels[role] || 0;
}

/**
 * Check if user has minimum role level
 */
export async function hasMinimumRole(minimumRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return getRoleLevel(user.role) >= getRoleLevel(minimumRole);
}