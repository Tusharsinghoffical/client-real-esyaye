import { NextRequest, NextResponse } from 'next/server';
import { updateSiteVisitStatus } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updated = updateSiteVisitStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Site visit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, visit: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update site visit' }, { status: 500 });
  }
}
