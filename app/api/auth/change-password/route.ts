import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, verifyAdminPassword, setAdminPassword } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('aura_admin_session')?.value;
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookieToken || authHeader;

    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Both current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(currentPassword)) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    setAdminPassword(newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password successfully changed and encrypted in SQLite database'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update password' },
      { status: 500 }
    );
  }
}
