import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@keydash.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'keydash2024';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
      });
      return response;
    }

    return NextResponse.json({ error: 'Ongeldige inloggegevens' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server fout' }, { status: 500 });
  }
}
