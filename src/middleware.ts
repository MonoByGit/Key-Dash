import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

export default auth(authConfig);

export const config = {
  matcher: ['/', '/dashboard/:path*', '/settings/:path*', '/login'],
};
