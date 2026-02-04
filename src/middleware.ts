import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

export default auth(authConfig);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
