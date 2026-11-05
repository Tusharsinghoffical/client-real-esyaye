import { NextResponse } from 'next/server';
import { verifyAdminPassword, createSessionToken } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Access denied.' },
        { status: 401 }
      );
    }

    const token = createSessionToken('admin');
    const response = NextResponse.json({
      success: true,
      token,
      message: 'Authenticated successfully'
    });

    response.cookies.set({
      name: 'aura_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
