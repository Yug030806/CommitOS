import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow auth routes without any redirect
  if (pathname === '/signin' || pathname === '/signup') {
    return NextResponse.next();
  }

  // 2. Inspect session authentication cookie
  const authCookie = req.cookies.get('commitos_auth');
  const isAuthenticated = authCookie && authCookie.value === 'true';

  // 3. If unauthenticated, redirect immediately to login page
  if (!isAuthenticated) {
    const signinUrl = new URL('/signin', req.url);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/...)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static public image assets (.png, .jpg, .svg, .webp, .ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
