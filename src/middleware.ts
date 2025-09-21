import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const pathname = request.nextUrl.pathname;

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/admin/journal': ['ADMIN'],
    '/admin/posts': ['ADMIN'],
    '/admin/media': ['ADMIN'],
    '/admin/subscribers': ['ADMIN'],
    '/admin/users': ['ADMIN'],
    '/admin': ['ADMIN', 'EDITOR', 'AUTHOR', 'READER'], // Dashboard can be accessed by all authenticated users
    '/api/admin/journal': ['ADMIN'],
    '/api/admin/posts': ['ADMIN'],
    '/api/admin/users': ['ADMIN'],
    '/editor': ['ADMIN', 'EDITOR'],
    '/author': ['ADMIN', 'EDITOR', 'AUTHOR'],
    '/dashboard': ['ADMIN', 'EDITOR', 'AUTHOR', 'READER'],
    '/profile': ['ADMIN', 'EDITOR', 'AUTHOR', 'READER'],
  };

  // Check if the current path requires authentication
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has the required role
    const requiredRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
    const userRole = token.role as string;

    if (!requiredRoles.includes(userRole)) {
      // User doesn't have the required role
      // For API routes, return JSON error
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }
      // For page routes, redirect to forbidden page
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  // Handle auth pages when already authenticated
  if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};