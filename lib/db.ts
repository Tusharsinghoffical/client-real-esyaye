import { 
  Property, 
  Lead, 
  SiteVisit, 
  ProjectDevelopment, 
  CityLocation, 
  Testimonial, 
  BusinessConfig,
  LeadStatus,
  LeadSource
} from '@/types/real-estate';
import { 
  SAMPLE_PROPERTIES, 
  SAMPLE_PROJECTS, 
  SAMPLE_LOCATIONS, 
  SAMPLE_TESTIMONIALS 
} from '@/lib/data/sample-data';
import { BUSINESS_CONFIG } from '@/lib/config';
import { getSupabaseServerClient } from '@/lib/supabase/client';

// In-memory persistent state (persists across API calls in the Node.js runtime process)
interface DatabaseStore {
  properties: Property[];
  leads: Lead[];
  siteVisits: SiteVisit[];
  projects: ProjectDevelopment[];
  locations: CityLocation[];
  testimonials: Testimonial[];
  businessSettings: BusinessConfig;
}

declare global {
  var __realEstateDb: DatabaseStore | undefined;
}

function initDatabase(): DatabaseStore {
  if (global.__realEstateDb) {
    return global.__realEstateDb;
  }

  const initialLeads: Lead[] = [
    {
      id: 'lead-1',
      fullName: 'Aarav Singhal',
      phone: '+91 98111 23456',
      email: 'aarav.singhal@capitalventures.in',
      leadSource: 'property_enquiry',
      propertyId: 'prop-res-1',
      propertyTitle: 'The Worli Horizon Triplex Penthouse',
      budget: '₹ 30 Cr – ₹ 40 Cr',
      preferredLocation: 'Worli Sea Face, Mumbai',
      message: 'Looking for a sea-facing duplex/penthouse with immediate possession. Would like a private evening site visit with our architect.',
      leadStatus: 'Qualified',
      preferredVisitDate: '2026-03-05',
      internalNotes: ['Verified HNI prospect. Pre-qualified for purchase. High intent.'],
      createdAt: '2026-02-26T14:20:00Z'
    },
    {
      id: 'lead-2',
      fullName: 'Meenakshi Sundaram',
      phone: '+91 98450 98765',
      email: 'meenakshi.s@techhorizon.co',
      leadSource: 'ai_assistant',
      propertyId: 'prop-res-2',
      propertyTitle: 'The Camellias Signature 4 BHK',
      budget: '₹ 25 Cr – ₹ 30 Cr',
      preferredLocation: 'Golf Course Road, Gurgaon',
      message: 'Qualified via AI Assistant: Inquiring about high-floor apartment facing golf fairway. Seeking floor plans and pricing schedule.',
      leadStatus: 'Site Visit Scheduled',
      preferredVisitDate: '2026-03-07',
      internalNotes: ['Connected through AI Property Assistant. Requested chauffeur pick-up.'],
      createdAt: '2026-02-27T09:15:00Z'
    },
    {
      id: 'lead-3',
      fullName: 'Ranjit Deshmukh',
      phone: '+91 97654 32109',
      email: 'deshmukh.farms@gmail.com',
      leadSource: 'callback_modal',
      budget: '₹ 15 Cr – ₹ 20 Cr',
      preferredLocation: 'Assagao, Goa',
      message: 'Interested in buying a luxury Portuguese holiday villa in North Goa for family retreat and vacation rental.',
      leadStatus: 'Contacted',
      internalNotes: ['Initial call completed. Sent Sol Terra and Heritage Pines brochures.'],
      createdAt: '2026-02-28T16:45:00Z'
    }
  ];

  const initialVisits: SiteVisit[] = [
    {
      id: 'visit-1',
      fullName: 'Aarav Singhal',
      phone: '+91 98111 23456',
      email: 'aarav.singhal@capitalventures.in',
      propertyId: 'prop-res-1',
      propertyTitle: 'The Worli Horizon Triplex Penthouse',
      visitDate: '2026-03-05',
      timeSlot: '04:30 PM - 06:00 PM (Sunset Viewing)',
      numberOfVisitors: 3,
      pickupRequired: true,
      status: 'Confirmed',
      notes: 'Guest requested security pre-clearance with society gate.',
      createdAt: '2026-02-26T14:30:00Z'
    },
    {
      id: 'visit-2',
      fullName: 'Meenakshi Sundaram',
      phone: '+91 98450 98765',
      email: 'meenakshi.s@techhorizon.co',
      propertyId: 'prop-res-2',
      propertyTitle: 'The Camellias Signature 4 BHK',
      visitDate: '2026-03-07',
      timeSlot: '11:00 AM - 12:30 PM',
      numberOfVisitors: 2,
      pickupRequired: false,
      status: 'Pending',
      notes: 'Visiting with DLF Golf Club member reference.',
      createdAt: '2026-02-27T09:30:00Z'
    }
  ];

  const store: DatabaseStore = {
    properties: [...SAMPLE_PROPERTIES],
    leads: initialLeads,
    siteVisits: initialVisits,
    projects: [...SAMPLE_PROJECTS],
    locations: [...SAMPLE_LOCATIONS],
    testimonials: [...SAMPLE_TESTIMONIALS],
    businessSettings: { ...BUSINESS_CONFIG }
  };

  global.__realEstateDb = store;
  return store;
}

export const db = initDatabase();

// --- PROPERTY OPERATIONS ---

export function getProperties(filter?: {
  listingType?: 'buy' | 'rent';
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  searchQuery?: string;
  onlyPublished?: boolean;
  onlyFeatured?: boolean;
}): Property[] {
  let list = [...db.properties];

  if (filter?.onlyPublished !== false) {
    list = list.filter(p => p.isPublished);
  }

  if (filter?.onlyFeatured) {
    list = list.filter(p => p.isFeatured);
  }

  if (filter?.listingType) {
    list = list.filter(p => p.listingType === filter.listingType);
  }

  if (filter?.category && filter.category !== 'all') {
    list = list.filter(p => p.category === filter.category);
  }

  if (filter?.propertyType && filter.propertyType !== 'all') {
    list = list.filter(p => p.propertyType === filter.propertyType);
  }

  if (filter?.city && filter.city !== 'all') {
    const targetCity = filter.city.toLowerCase();
    list = list.filter(p => 
      p.location.city.toLowerCase().includes(targetCity) ||
      p.location.locality.toLowerCase().includes(targetCity)
    );
  }

  if (filter?.minPrice !== undefined && filter.minPrice > 0) {
    list = list.filter(p => p.price >= filter.minPrice!);
  }

  if (filter?.maxPrice !== undefined && filter.maxPrice > 0) {
    list = list.filter(p => p.price <= filter.maxPrice!);
  }

  if (filter?.bedrooms !== undefined && filter.bedrooms > 0) {
    list = list.filter(p => p.bedrooms >= filter.bedrooms!);
  }

  if (filter?.searchQuery && filter.searchQuery.trim() !== '') {
    const q = filter.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.location.city.toLowerCase().includes(q) ||
      p.location.locality.toLowerCase().includes(q) ||
      p.propertyType.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.amenities.some(a => a.toLowerCase().includes(q))
    );
  }

  return list;
}

export function getPropertyBySlug(slug: string): Property | undefined {
  return db.properties.find(p => p.slug === slug || p.id === slug);
}

export function getSimilarProperties(property: Property, limit = 3): Property[] {
  return db.properties
    .filter(p => p.id !== property.id && p.isPublished)
    .filter(p => p.location.city === property.location.city || p.category === property.category || p.listingType === property.listingType)
    .slice(0, limit);
}

export function createProperty(propertyData: Omit<Property, 'id' | 'createdAt'>): Property {
  const newProperty: Property = {
    ...propertyData,
    id: `prop-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.properties.unshift(newProperty);
  return newProperty;
}

export function updateProperty(id: string, updates: Partial<Property>): Property | null {
  const index = db.properties.findIndex(p => p.id === id);
  if (index === -1) return null;
  db.properties[index] = { ...db.properties[index], ...updates };
  return db.properties[index];
}

export function deleteProperty(id: string): boolean {
  const initialLen = db.properties.length;
  db.properties = db.properties.filter(p => p.id !== id);
  return db.properties.length < initialLen;
}

// --- LEADS OPERATIONS ---

export function getLeads(): Lead[] {
  return [...db.leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createLead(data: {
  fullName: string;
  phone: string;
  email: string;
  leadSource: LeadSource;
  propertyId?: string;
  propertyTitle?: string;
  budget?: string;
  preferredLocation?: string;
  message: string;
  preferredVisitDate?: string;
}): Lead {
  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    leadSource: data.leadSource,
    propertyId: data.propertyId,
    propertyTitle: data.propertyTitle,
    budget: data.budget,
    preferredLocation: data.preferredLocation,
    message: data.message,
    leadStatus: 'New',
    preferredVisitDate: data.preferredVisitDate,
    internalNotes: [`Lead received via ${data.leadSource} on ${new Date().toLocaleDateString('en-IN')}`],
    createdAt: new Date().toISOString()
  };

  db.leads.unshift(newLead);

  // Asynchronous Supabase Persistence
  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase.from('leads').insert({
        id: newLead.id,
        full_name: newLead.fullName,
        phone: newLead.phone,
        email: newLead.email,
        lead_source: newLead.leadSource,
        property_id: newLead.propertyId,
        property_title: newLead.propertyTitle,
        budget: newLead.budget,
        preferred_location: newLead.preferredLocation,
        message: newLead.message,
        lead_status: newLead.leadStatus,
        preferred_visit_date: newLead.preferredVisitDate ? newLead.preferredVisitDate : null,
        internal_notes: newLead.internalNotes
      })
    ).then((res) => {
      if (res && 'error' in res && res.error) console.error('Supabase lead sync notice:', res.error.message);
    }).catch(err => console.error('Supabase connection notice:', err));
  }

  return newLead;
}

export function updateLeadStatus(id: string, status: LeadStatus, note?: string): Lead | null {
  const lead = db.leads.find(l => l.id === id);
  if (!lead) return null;
  lead.leadStatus = status;
  if (note) {
    if (!lead.internalNotes) lead.internalNotes = [];
    lead.internalNotes.push(`[${new Date().toLocaleDateString('en-IN')}] ${note}`);
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase.from('leads').update({
        lead_status: status,
        internal_notes: lead.internalNotes,
        updated_at: new Date().toISOString()
      }).eq('id', id)
    ).then((res) => {
      if (res && 'error' in res && res.error) console.error('Supabase lead update notice:', res.error.message);
    }).catch(err => console.error('Supabase connection notice:', err));
  }

  return lead;
}

// --- SITE VISITS OPERATIONS ---

export function getSiteVisits(): SiteVisit[] {
  return [...db.siteVisits].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createSiteVisit(data: {
  fullName: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  visitDate: string;
  timeSlot: string;
  numberOfVisitors?: number;
  pickupRequired?: boolean;
  notes?: string;
}): SiteVisit {
  const visit: SiteVisit = {
    id: `visit-${Date.now()}`,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    propertyId: data.propertyId,
    propertyTitle: data.propertyTitle,
    visitDate: data.visitDate,
    timeSlot: data.timeSlot,
    numberOfVisitors: data.numberOfVisitors || 1,
    pickupRequired: !!data.pickupRequired,
    status: 'Pending',
    notes: data.notes,
    createdAt: new Date().toISOString()
  };

  db.siteVisits.unshift(visit);

  // Asynchronous Supabase Persistence
  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase.from('site_visits').insert({
        id: visit.id,
        full_name: visit.fullName,
        phone: visit.phone,
        email: visit.email,
        property_id: visit.propertyId,
        property_title: visit.propertyTitle,
        visit_date: visit.visitDate,
        time_slot: visit.timeSlot,
        number_of_visitors: visit.numberOfVisitors,
        pickup_required: visit.pickupRequired,
        status: visit.status,
        notes: visit.notes
      })
    ).then((res) => {
      if (res && 'error' in res && res.error) console.error('Supabase site visit sync notice:', res.error.message);
    }).catch(err => console.error('Supabase connection notice:', err));
  }

  // Also auto-record a Lead entry for this site visit
  createLead({
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    leadSource: 'site_visit_booking',
    propertyId: data.propertyId,
    propertyTitle: data.propertyTitle,
    message: `Scheduled site visit on ${data.visitDate} (${data.timeSlot}). ${data.pickupRequired ? 'Requested Chauffeur Pick-up.' : ''} ${data.notes || ''}`.trim(),
    preferredVisitDate: data.visitDate
  });

  return visit;
}

export function updateSiteVisitStatus(id: string, status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'): SiteVisit | null {
  const visit = db.siteVisits.find(v => v.id === id);
  if (!visit) return null;
  visit.status = status;

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase.from('site_visits').update({
        status,
      }).eq('id', id)
    ).then((res) => {
      if (res && 'error' in res && res.error) console.error('Supabase site visit update notice:', res.error.message);
    }).catch(err => console.error('Supabase connection notice:', err));
  }

  return visit;
}

// --- BUSINESS SETTINGS ---

export function getBusinessSettings(): BusinessConfig {
  return db.businessSettings;
}

export function updateBusinessSettings(updates: Partial<BusinessConfig>): BusinessConfig {
  db.businessSettings = { ...db.businessSettings, ...updates };
  return db.businessSettings;
}

// --- PROJECTS & LOCATIONS & TESTIMONIALS ---

export function getProjects(): ProjectDevelopment[] {
  return db.projects;
}

export function getProjectBySlug(slug: string): ProjectDevelopment | undefined {
  return db.projects.find(p => p.slug === slug || p.id === slug);
}

export function getLocations(): CityLocation[] {
  return db.locations;
}

export function getLocationBySlug(slug: string): CityLocation | undefined {
  return db.locations.find(l => l.slug === slug || l.id === slug);
}

export function getTestimonials(): Testimonial[] {
  return db.testimonials;
}
