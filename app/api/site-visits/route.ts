import { NextRequest, NextResponse } from 'next/server';
import { getSiteVisits, createSiteVisit } from '@/lib/db';

export async function GET() {
  try {
    const visits = getSiteVisits();
    return NextResponse.json({ success: true, count: visits.length, visits });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch site visits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      propertyId,
      propertyTitle,
      visitDate,
      timeSlot,
      numberOfVisitors,
      pickupRequired,
      notes
    } = body;

    if (!fullName || !phone || !email || !propertyId || !visitDate || !timeSlot) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please fill in all mandatory booking fields (name, phone, email, date, time slot).' 
      }, { status: 400 });
    }

    const visit = createSiteVisit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      propertyId,
      propertyTitle: propertyTitle || 'Selected Property',
      visitDate,
      timeSlot,
      numberOfVisitors: numberOfVisitors ? Number(numberOfVisitors) : 1,
      pickupRequired: Boolean(pickupRequired),
      notes: notes?.trim()
    });

    return NextResponse.json({
      success: true,
      message: 'Your private site visit has been scheduled. Our concierge team will send calendar invite and gate clearance details.',
      visitId: visit.id
    }, { status: 201 });
  } catch (error) {
    console.error('Error scheduling site visit:', error);
    return NextResponse.json({ success: false, error: 'Failed to schedule site visit' }, { status: 500 });
  }
}
