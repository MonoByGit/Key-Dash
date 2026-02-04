import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAuth = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Allow healthcheck and auth endpoints without auth
  if (pathname === '/api/health' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/', '/dashboard/:path*', '/settings/:path*', '/login'],
};
