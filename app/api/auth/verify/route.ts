import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('aura_admin_session')?.value;
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookieToken || authHeader;

    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
