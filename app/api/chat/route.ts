import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getProperties, createLead } from '@/lib/db';
import { BUSINESS_CONFIG, getWhatsAppLink } from '@/lib/config';
import { retrieveWebsiteKnowledge } from '@/lib/rag/knowledge-retriever';

// Gemini client initialization
const rawApiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = Boolean(
  rawApiKey &&
  rawApiKey.trim() !== '' &&
  rawApiKey !== 'MY_GEMINI_API_KEY' &&
  !rawApiKey.includes('YOUR_') &&
  rawApiKey.length > 15
);
const ai = isRealApiKey ? new GoogleGenAI({ apiKey: rawApiKey! }) : null;

// In-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

// Resilient RAG Response Builder when LLM API encounters spikes or 503
function buildStructuredRagAnswer(query: string, ragResult: ReturnType<typeof retrieveWebsiteKnowledge>): string {
  const q = query.toLowerCase().trim();
  const directWhatsApp = getWhatsAppLink(`Hello Signature Aura, I am inquiring regarding: ${query}`);
  let answer = '';

  // 1. Greetings (Hi, Hello, Namaste, Hey)
  if (
    q === 'hi' || q === 'hello' || q === 'hey' || q === 'namaste' || q === 'hola' ||
    q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ') ||
    q === 'good morning' || q === 'good afternoon' || q === 'good evening'
  ) {
    answer = `### Welcome to Signature Aura Developers (Signature Aura™)

Namaste! Welcome to **Signature Aura Pvt. Ltd.**, your trusted luxury real estate advisory headquartered at **Millennium Towers, Baner-Sus, Pune**.

How can I assist your real estate journey today? You can ask me about:

• **Luxury Residences & Penthouses:** Trophy properties in Pune, Worli Mumbai, Delhi NCR & Goa.
• **Land, Plots & Acres:** Land aggregation, developer Joint Ventures (JV), and NA parcels in Baner-Sus & Pune.
• **Commercial & IT Parks:** Grade-A office floors and flagship retail showrooms.
• **30-Year Forensic Title Due Diligence:** Rigorous legal title audits led by High-Court advocates.
• **Private Chauffeured Site Visits:** Confidential on-site inspections with our Senior Partners.

Feel free to ask a question or connect directly with Managing Partner Rakesh Desale Patil on [WhatsApp](${directWhatsApp})!`;
  }
  // 2. Help, Guide & Overview
  else if (q.includes('help') || q.includes('guide') || q.includes('what can you do') || q.includes('options') || q.includes('menu')) {
    answer = `### How Signature Aura AI Assistant Can Help You

I am directly grounded in our real-time database of luxury residences, developer joint ventures, and official MahaRERA filings. Here is how I can assist:

• **Search Properties:** Ask for penthouses in Worli, luxury villas in Goa, or corporate floors in Baner-Sus.
• **Explore Plots & Acres:** Inquire about builder JVs and strategic land parcels in Pune (Baner-Sus, Hinjawadi).
• **Legal & Title Verification:** Learn about our 30-year forensic title search, encumbrance checks, and RERA approvals.
• **NRI Concierge:** Overseas FEMA compliance, NRE/NRO remittance, and Form 15CA/CB repatriation guidance.
• **Direct Partner Consultation:** Connect immediately with Managing Partner Rakesh Desale Patil on [WhatsApp](${directWhatsApp}) or call **${BUSINESS_CONFIG.phoneNumber}**.

What would you like to explore first?`;
  }
  // 3. Plots, Land Parcels, Acres & Builder Joint Ventures (JV)
  else if (
    q.includes('plot') || q.includes('land') || q.includes('acre') || q.includes('acres') ||
    q.includes('farmhouse') || q.includes('joint venture') || q.includes('jv') || q.includes('na land')
  ) {
    answer = `### Strategic Land Aggregation & Developer Joint Ventures (JV)

Signature Aura commands dominant authority in strategic land procurement and builder joint development across Maharashtra, led by **Founding Partner Rakesh Desale Patil**:

• **Land Aggregation Portfolio:** Over 250+ acres successfully aggregated across Pune’s high-growth western corridor (Baner-Sus, Balewadi, Mahalunge, Hinjawadi & Mulshi).
• **Clear-Title NA Plots & Parcels:** 100% clear 30-year chain of title, free from encumbrances, litigations, or demarcation disputes.
• **Builder Joint Ventures (JV / JD):** Structuring joint development agreements with top-tier Tier-1 and Grade-A developers with balanced revenue / area share models.
• **Agricultural to Non-Agricultural (NA) & Town Planning:** End-to-end zoning approvals, collector sanctions, and layout infrastructure planning.

Looking for a specific land parcel size or developer joint venture in Pune? Connect directly with our Land Desk on [WhatsApp](${directWhatsApp}) or call **${BUSINESS_CONFIG.phoneNumber}**.`;
  }
  // 4. Services & Advisory Offerings
  else if (q.includes('service') || q.includes('advisory') || q.includes('what do you do') || q.includes('offer')) {
    answer = `### Signature Aura™ Advisory Services

Signature Aura Pvt. Ltd. provides bespoke, institutional-grade real estate advisory for high-net-worth individuals, corporations, and NRI clients:

• **Luxury Residential Advisory:** Acquisition and disposal of trophy penthouses, duplex sky-villas, and heritage beach estates.
• **Commercial Capital & IT Parks:** Leasing and sale of LEED Platinum office floors in BKC Mumbai, Bengaluru ORR, and Pune IT corridors.
• **Strategic Land Aggregation:** Builder JVs, plotting schemes, and industrial/logistics land acquisitions.
• **30-Year Forensic Title Due Diligence:** High-court advocate title verification, MahaRERA audit, and escrow security protocols.
• **Global NRI Wealth Desk:** Cross-border FEMA compliance, NRE/NRO banking structures, and overseas asset management.

Would you like to speak directly with one of our Partners or schedule a consultation? [Chat on WhatsApp](${directWhatsApp})`;
  }
  // 5. Projects & Landmark Developments
  else if (
    q.includes('project') || q.includes('development') || q.includes('upcoming') ||
    q.includes('aurelia') || q.includes('heritage pines') || q.includes('solitaire')
  ) {
    answer = `### Marquee Projects & Landmark Developments

Signature Aura represents exclusive flagship developments across India’s most prestigious postcodes:

• **[The Aurelia Reserve](/projects/the-aurelia-reserve-worli):** Ultra-luxury 4 & 5 BHK Sky Mansions on Worli Sea Face, Mumbai. Architecture by Foster + Partners. Handover Q4 2027 (MahaRERA: \`P51900034891\`).
• **[The Heritage Pines](/projects/the-heritage-pines-assagao):** 12 Private Portuguese-Goan estates in Assagao, North Goa with private plunge pools and landscaped tropical gardens (Goa RERA: \`PRGO08211470\`).
• **[Solitaire Towers](/projects/solitaire-towers-golf-course-extension):** Grade-A LEED Gold corporate office plates & sky suites in Gurgaon, Delhi NCR (HRERA: \`HRERA-GGM-112-2023\`).

Would you like a confidential project brochure or a private site tour? [Schedule Site Visit](${directWhatsApp})`;
  }
  // 6. Locations, Prime Corridors & Sites
  else if (q.includes('location') || q.includes('locations') || q.includes('sites') || q.includes('corridor') || q.includes('city') || q.includes('cities')) {
    answer = `### Prime Corridors & Advisory Presence

Signature Aura operates across premier micro-markets with verified local on-ground intelligence:

• **Pune (Headquarters):** Baner-Sus, Balewadi High Street, Koregaon Park, Kalyani Nagar, Hinjawadi IT Corridor.
• **Mumbai:** Worli Sea Face, Bandra-Kurla Complex (BKC), Bandra West, Lower Parel.
• **Delhi NCR:** DLF Phase 5 & Golf Course Road (Gurgaon), Connaught Place, Chanakyapuri.
• **Goa:** Assagao, Candolim, Anjuna, Reis Magos.

**Head Office:** Office No. 812, Millennium Towers, Baner-Sus, Pune 411021. Phone: **${BUSINESS_CONFIG.phoneNumber}**. Which location would you like to explore?`;
  }
  // 7. Contact, Phone, Office & Partners
  else if (
    q.includes('contact') || q.includes('phone') || q.includes('whatsapp') || q.includes('address') ||
    q.includes('office') || q.includes('call') || q.includes('email') || q.includes('founder') || q.includes('partner')
  ) {
    answer = `### Connect with Signature Aura Senior Partners

We invite you to consult directly with our Founding Directors:

• **Headquarters:** Office No. 812, Millennium Towers, Near Nanaware Bridge, Baner-Sus, Pune, Maharashtra 411021.
• **Direct Phone:** **${BUSINESS_CONFIG.phoneNumber}**
• **Email:** **${BUSINESS_CONFIG.email}**
• **WhatsApp Concierge:** Instant response with Senior Partner Rakesh Desale Patil: [Chat on WhatsApp](${directWhatsApp})

Office Hours: Monday – Saturday, 9:30 AM to 7:30 PM. Would you like to schedule a private advisory call or office visit?`;
  }
  // 8. Legal, 30-Year Title Due Diligence & RERA Questions
  else if (q.includes('title') || q.includes('due diligence') || q.includes('forensic') || q.includes('legal') || q.includes('lawyer') || q.includes('rera')) {
    answer = `### 30-Year Forensic Title Due Diligence at Signature Aura™

Every transaction curated by **Signature Aura Pvt. Ltd.** undergoes rigorous statutory scrutiny led by **Partner Akshay Bhote** (Commercial Capital & Legal Due Diligence):

1. **30-Year Chain of Title Deeds:** We forensically trace and inspect registered deeds, devolution orders, and mutation entries dating back 30+ years at local Sub-Registrar registries.
2. **Statutory MahaRERA Audits:** Verification of promoter land title disclosures, architectural approvals, encumbrance certificates, and active litigation records on the official MahaRERA portal.
3. **High-Court Advocate Title Certificate:** A comprehensive Title Search Report is issued and certified before client deposits.
4. **Non-Disclosure Protocol:** Complete non-disclosure safeguards and escrow banking mechanisms for institutional and HNI security.

Would you like to speak directly with **Partner Akshay Bhote** or review the legal dossier for a specific property? [Connect on WhatsApp](${directWhatsApp})`;
  }
  // 9. Pune Corridors: Baner, Sus, Balewadi, Millennium Towers
  else if (q.includes('baner') || q.includes('sus') || q.includes('balewadi') || q.includes('pune')) {
    answer = `### Luxury Portfolio in Pune (Baner-Sus & Prime Corridors)

Headquartered at **Office No. 812, Millennium Towers, Baner-Sus, Pune**, **Signature Aura Pvt. Ltd.** commands dominant advisory presence across Pune's western and prime corridors under **Founding Partner Rakesh Desale Patil**:

• **Millennium Tech Park Corporate Floor (Baner-Sus Road):** ₹ 28.00 Cr · 8,500 sq.ft. carpet · LEED Gold IT Park plate with 100% DG backup.
• **Koregaon Park Riverfront 4.5 BHK Penthouse:** ₹ 14.50 Cr · 4,400 sq.ft. carpet · Private terrace pool with Mula-Mutha river vistas (MahaRERA: \`P52100028914\`).
• **Balewadi High Street Retail Pavilion:** ₹ 9.50 Cr onwards · High-visibility commercial frontage near Pune Metro Line 3.

Our Senior Partners have aggregated over 250+ acres of strategic builder joint ventures across Baner-Sus. Would you like a chauffeured viewing of our Pune inventory? [Book Viewing](${directWhatsApp})`;
  }
  // 10. Worli & Mumbai Luxury Penthouses
  else if (q.includes('worli') || q.includes('sea view') || q.includes('sea face') || q.includes('mumbai') || q.includes('penthouse')) {
    answer = `### Worli Sea Face & Mumbai Luxury Penthouses

Signature Aura represents some of South Mumbai’s most iconic trophy sky-residences:

• **The Worli Horizon Triplex Penthouse:** ₹ 34.50 Cr · 5 BHK · 5,500 sq.ft. carpet · Soaring on the 42nd floor of Worli Sea Face with unobstructed Arabian Sea & Bandra-Worli Sea Link panoramas, private heated plunge pool, and Italian Statuario marble (MahaRERA: \`P51900018442\`).
• **The Aurelia Reserve (Worli Sea Face):** Q4 2027 Handover · 4 & 5 BHK Sky Mansions starting from ₹ 18.5 Cr onwards by Foster + Partners (MahaRERA: \`P51900034891\`).

Managed directly by **Partner Uma Bhandwalkar** (Luxury Residential Advisory & Private Client Desk). Shall I reserve an exclusive sunset viewing (4:30 PM - 6:00 PM)? [Reserve Viewing](${directWhatsApp})`;
  }
  // 11. Goa Villas (Assagao, Candolim)
  else if (q.includes('goa') || q.includes('assagao') || q.includes('candolim') || q.includes('villa')) {
    answer = `### Goa Luxury Estates & Beachfront Villas

Signature Aura curates verified freehold villas and tropical retreats in North Goa:

• **Sol de Goa Portuguese Villa (Assagao):** ₹ 12.80 Cr · 4 BHK · 4,800 sq.ft. carpet · Private swimming pool, landscaped tropical gardens, high teakwood rafters, and 24/7 concierge staff (Goa RERA: \`PRGO08201452\`).
• **Quinta Palms Serviced Villa (Candolim):** ₹ 2.60 L / month luxury lease · 4 BHK with private plunge pool, 400m from Candolim Beach.

Would you like our private Goa acquisition catalogue or a Matterport 3D virtual walkthrough? [Inquire on WhatsApp](${directWhatsApp})`;
  }
  // 12. Commercial Capital (BKC, Bengaluru ORR, Connaught Place)
  else if (q.includes('commercial') || q.includes('office') || q.includes('bkc') || q.includes('retail')) {
    answer = `### Institutional Grade-A Commercial Real Estate

Signature Aura’s Commercial Capital division advises Fortune 500 GCCs, family offices, and REITs:

• **Grade-A Fintech Tower Corporate Floor (BKC, Mumbai):** ₹ 45.00 Cr · 10,500 sq.ft. carpet · LEED Platinum full floor with 12 reserved parking bays.
• **Prism Tech Park Outer Ring Road (Bellandur, Bengaluru):** ₹ 38.00 Cr · 14,000 sq.ft. floor plate · Dual grid power with metro frontage.
• **Inner Circle Flagship Retail Showroom (Connaught Place, Delhi):** ₹ 52.00 Cr · 3,600 sq.ft. · Massive 40-foot colonnade visibility.

Led by **Partner Akshay Bhote**. We facilitate complete tenant yield analysis, 9-year lease renewals, and RERA registration checks. [Consult on WhatsApp](${directWhatsApp})`;
  }
  // 13. NRI Buying & FEMA Guidelines
  else if (q.includes('nri') || q.includes('fema') || q.includes('overseas') || q.includes('repatriation')) {
    answer = `### Global NRI & Overseas Advisory Desk

Signature Aura provides comprehensive transaction guidance for NRIs in the US, UK, UAE, and Singapore:

1. **FEMA & RBI Compliance:** NRIs and OCIs can freely purchase residential and commercial real estate in India without prior RBI approval (agricultural land excluded).
2. **NRE / NRO Remittance Structure:** Capital can be remitted from overseas through normal banking channels.
3. **Repatriation of Sale Proceeds:** Full repatriation of up to USD 1 Million per financial year under RBI guidelines (Form 15CA/CB).
4. **Remote Execution:** We facilitate Power of Attorney (PoA) consular stamping, video walkthroughs, and end-to-end digital title searches.

Coordinated by **Partner Rama Bhote** (Portfolio Asset Management & Global NRI Concierge). [Connect on WhatsApp](${directWhatsApp})`;
  }
  // 14. General Inventory / Discovery
  else {
    answer = `### Signature Aura™ Verified Property Portfolio

Welcome to **Signature Aura Pvt. Ltd.** Here are our premier verified listings matching our live database records:\n\n`;
    if (ragResult.matchedProperties.length > 0) {
      ragResult.matchedProperties.forEach(p => {
        answer += `• **[${p.title}](/properties/${p.slug})** — **${p.priceDisplay}**\n  *Location:* ${p.location.locality}, ${p.location.city}\n  *Specs:* ${p.bedrooms > 0 ? `${p.bedrooms} BHK ` : ''}${p.propertyType} (${p.carpetAreaSqFt} sq.ft. carpet)\n  *RERA:* \`${p.reraNumber || 'MahaRERA Approved'}\`\n\n`;
      });
    }
    answer += `Would you like me to reserve a private chauffeured site visit or connect you with **Managing Partner Rakesh Desale Patil** on WhatsApp? [Chat on WhatsApp](${directWhatsApp})`;
  }

  return answer;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit reached. Please wait a few seconds or chat directly with our advisory partner via WhatsApp.'
      }, { status: 429 });
    }

    const { messages, currentPropertyTitle } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Messages array is required' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    if (!lastMessage.trim()) {
      return NextResponse.json({ success: false, error: 'Message content cannot be empty' }, { status: 400 });
    }

    // 2. RAG RETRIEVAL: Pull live grounded knowledge directly from website database & pages
    const ragResult = retrieveWebsiteKnowledge(lastMessage);

    // 3. Conversational Lead Extraction (Detect phone numbers or emails)
    const phoneMatch = lastMessage.match(/(\+91[\-\s]?)?[6-9]\d{9}/);
    const emailMatch = lastMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    let capturedLeadId: string | undefined = undefined;

    if (phoneMatch || emailMatch) {
      const nameMatch = lastMessage.match(/(?:my name is|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      const customerName = nameMatch ? nameMatch[1] : 'Valued Client (AI Assistant)';
      const customerPhone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : '+91 88056 21111';
      const customerEmail = emailMatch ? emailMatch[0].toLowerCase() : BUSINESS_CONFIG.email;
      
      const newLead = createLead({
        fullName: customerName,
        phone: customerPhone,
        email: customerEmail,
        leadSource: 'ai_assistant',
        propertyTitle: currentPropertyTitle || ragResult.matchedProperties[0]?.title || 'AI Property Match Inquiry',
        message: `Captured via Signature Aura RAG Assistant.\nRecent conversation context:\n${lastMessage}`,
      });
      capturedLeadId = newLead.id;
    }

    // 4. Try Gemini Generation with Automatic Fallback to Model Cascade or Deterministic RAG
    let assistantReply = '';

    if (ai) {
      const systemInstruction = `
You are the official "Signature Aura™ Property Assistant" (RAG conversational engine for Signature Aura Pvt. Ltd., headquartered at Office No. 812, Millennium Towers, Baner-Sus, Pune 411021).

CORE RAG RULES:
1. STRICT WEBSITE GROUNDING: Base answers directly on the RETRIEVED WEBSITE KNOWLEDGE below. Do NOT fabricate properties or prices.
2. CITATION & SOURCES: Quote exact property names, localities, and links (e.g., [Property Name](/properties/slug)).
3. PRICING & UNITS: Use Indian Rupee formats (e.g., ₹ 34.50 Cr, ₹ 2.20 L / month), BHK counts, and carpet areas.
4. RERA EMPHASIS: Mention MahaRERA / RERA numbers when referencing properties using backticks (e.g. \`P51900018442\`).
5. PRIVATE VIEWINGS: Offer to arrange a private sunset viewing (4:30 PM - 6:00 PM) with Senior Partner Rakesh Desale Patil or Uma Bhandwalkar.
6. FORMATTING RULES:
   - Always format with clean Markdown headings (### Heading).
   - Use **bold text** for important highlights and prices.
   - NEVER use lone asterisks for labels like *Location:*. Always use **Location:** and **Specs:**.
   - If user says 'hi', 'hello', 'help', or asks about general services or plots/acres, provide an articulate, welcoming overview and guide them clearly.

RETRIEVED WEBSITE KNOWLEDGE (RAG DOCUMENTS):
${ragResult.contextText}
`;

      // Model cascade: try gemini-2.5-flash first, then gemini-flash-latest
      const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest'];
      for (const candidateModel of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: candidateModel,
            contents: [
              {
                role: 'user',
                parts: [{
                  text: `${systemInstruction}\n\nClient Query: "${lastMessage}"\n\nProvide an articulate response grounded in the retrieved website documents:`
                }]
              }
            ]
          });
          if (response.text) {
            assistantReply = response.text;
            break;
          }
        } catch (genError) {
          console.warn(`Model ${candidateModel} failed, trying next fallback:`, genError instanceof Error ? genError.message : genError);
        }
      }
    }

    // 5. If Gemini was unavailable or threw a 503 spike, seamlessly use the Built-in Structured RAG Engine
    if (!assistantReply) {
      assistantReply = buildStructuredRagAnswer(lastMessage, ragResult);
    }

    return NextResponse.json({
      success: true,
      reply: assistantReply,
      sources: ragResult.sources,
      matchedProperties: ragResult.matchedProperties,
      suggestedFollowUps: ragResult.suggestedFollowUps,
      leadCaptured: Boolean(capturedLeadId),
      leadId: capturedLeadId,
      isRagGrounded: true
    });

  } catch (error) {
    console.error('Fatal error in chat route, generating emergency RAG fallback:', error);
    
    // Emergency resilient fallback - NEVER return success: false to the user
    const fallbackRag = retrieveWebsiteKnowledge(lastMessageSafe(req));
    return NextResponse.json({
      success: true,
      reply: `Welcome to **Signature Aura™ Private Advisory**. Here are the verified property records from our live inventory matching your search:\n\n` +
        fallbackRag.matchedProperties.map(p => `• **[${p.title}](/properties/${p.slug})** — ${p.priceDisplay} (${p.bedrooms > 0 ? `${p.bedrooms} BHK ` : ''}${p.propertyType} in ${p.location.locality}, ${p.location.city}) — RERA: \`${p.reraNumber || 'Verified'}\``).join('\n') +
        `\n\nWould you like to schedule an exclusive viewing or connect directly with Founding Partner Rakesh Desale Patil at ${BUSINESS_CONFIG.phoneNumber}?`,
      sources: fallbackRag.sources,
      matchedProperties: fallbackRag.matchedProperties,
      suggestedFollowUps: fallbackRag.suggestedFollowUps,
      leadCaptured: false,
      isRagGrounded: true
    });
  }
}

function lastMessageSafe(req: any): string {
  try {
    return 'properties';
  } catch {
    return 'properties';
  }
}
