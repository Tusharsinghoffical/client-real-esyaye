import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, resetDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('aura_admin_session')?.value;
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookieToken || authHeader;

    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    resetDatabase();

    return NextResponse.json({
      success: true,
      message: 'Local SQLite database successfully reset to clean seed state.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to reset database' },
      { status: 500 }
    );
  }
}
