import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function requireAdminAccess() {
  const session = await getServerSession(authOptions);
  
  // Not logged in at all
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  // Fetch user from database to get actual role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  // User not found or not an admin
  if (!user || user.role !== 'ADMIN') {
    // Redirect to a forbidden page or home
    redirect('/forbidden');
  }

  return user;
}

export async function requireAuthAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, email: true, name: true }
  });

  if (!user) {
    redirect('/auth/login');
  }

  return user;
}

export async function getUserRole() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  return user?.role || null;
}