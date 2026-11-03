import { NextRequest, NextResponse } from 'next/server';
import { getLeads, createLead } from '@/lib/db';
import { LeadSource } from '@/types/real-estate';

export async function GET() {
  try {
    const leads = getLeads();
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot spam protection
    if (body.website_url_check) {
      return NextResponse.json({ success: true, message: 'Enquiry received' });
    }

    const {
      fullName,
      phone,
      email,
      leadSource,
      propertyId,
      propertyTitle,
      budget,
      preferredLocation,
      message,
      preferredVisitDate
    } = body;

    // Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Please provide a valid full name.' }, { status: 400 });
    }

    const cleanedPhone = phone ? phone.replace(/[^\d+]/g, '') : '';
    if (!cleanedPhone || cleanedPhone.length < 8) {
      return NextResponse.json({ success: false, error: 'Please provide a valid contact number.' }, { status: 400 });
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ success: false, error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const lead = createLead({
      fullName: fullName.trim(),
      phone: cleanedPhone,
      email: email.trim().toLowerCase(),
      leadSource: (leadSource as LeadSource) || 'contact_form',
      propertyId,
      propertyTitle,
      budget,
      preferredLocation,
      message: message ? message.trim() : 'Enquiry registered via website contact channel.',
      preferredVisitDate
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you. A Signature Aura™ property consultant will connect with you shortly.',
      leadId: lead.id 
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting lead:', error);
    return NextResponse.json({ success: false, error: 'Failed to process enquiry. Please call our concierge directly.' }, { status: 500 });
  }
}
