import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
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
import { realtime } from '@/lib/realtime';

// -----------------------------------------------------------------------------
// LOCAL SQLITE DATABASE CONNECTION & INITIALIZATION
// -----------------------------------------------------------------------------

declare global {
  var __sqliteDbInstance: DatabaseSync | undefined;
}

export function getDatabase(): DatabaseSync {
  if (global.__sqliteDbInstance) {
    return global.__sqliteDbInstance;
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'signature_aura.db');
  const database = new DatabaseSync(dbPath);

  // Performance optimizations
  database.exec('PRAGMA journal_mode = WAL;');
  database.exec('PRAGMA foreign_keys = ON;');

  // Schema creation
  database.exec(`
    CREATE TABLE IF NOT EXISTS admin_auth (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      listing_type TEXT NOT NULL,
      category TEXT NOT NULL,
      property_type TEXT NOT NULL,
      city TEXT NOT NULL,
      bedrooms INTEGER NOT NULL,
      is_featured INTEGER NOT NULL,
      is_published INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
    CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(is_published);
    CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      lead_source TEXT NOT NULL,
      property_id TEXT,
      property_title TEXT,
      budget TEXT,
      preferred_location TEXT,
      message TEXT NOT NULL,
      lead_status TEXT NOT NULL,
      preferred_visit_date TEXT,
      internal_notes TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

    CREATE TABLE IF NOT EXISTS site_visits (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      property_id TEXT NOT NULL,
      property_title TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      number_of_visitors INTEGER NOT NULL,
      pickup_required INTEGER NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_visits_created ON site_visits(created_at DESC);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
  `);

  // Seed Admin Auth if empty
  const authCountRow = database.prepare('SELECT COUNT(*) as count FROM admin_auth').get() as { count: number };
  if (authCountRow.count === 0) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Signature@2026';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(defaultPassword, salt, 64).toString('hex');
    database.prepare(`
      INSERT INTO admin_auth (id, username, password_hash, salt, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin-1', 'admin', hash, salt, new Date().toISOString());
  }

  // Seed Properties if empty
  const propCountRow = database.prepare('SELECT COUNT(*) as count FROM properties').get() as { count: number };
  if (propCountRow.count === 0) {
    const insertProp = database.prepare(`
      INSERT OR REPLACE INTO properties (
        id, slug, title, price, listing_type, category, property_type, city, bedrooms, is_featured, is_published, data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of SAMPLE_PROPERTIES) {
      insertProp.run(
        p.id,
        p.slug,
        p.title,
        p.price,
        p.listingType,
        p.category,
        p.propertyType,
        p.location.city,
        p.bedrooms,
        p.isFeatured ? 1 : 0,
        p.isPublished ? 1 : 0,
        JSON.stringify(p),
        p.createdAt || new Date().toISOString()
      );
    }
  }

  // Seed Leads if empty
  const leadsCountRow = database.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
  if (leadsCountRow.count === 0) {
    const insertLead = database.prepare(`
      INSERT OR REPLACE INTO leads (
        id, full_name, phone, email, lead_source, property_id, property_title, budget, preferred_location, message, lead_status, preferred_visit_date, internal_notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

    for (const l of initialLeads) {
      insertLead.run(
        l.id,
        l.fullName,
        l.phone,
        l.email,
        l.leadSource,
        l.propertyId || null,
        l.propertyTitle || null,
        l.budget || null,
        l.preferredLocation || null,
        l.message,
        l.leadStatus,
        l.preferredVisitDate || null,
        JSON.stringify(l.internalNotes || []),
        l.createdAt
      );
    }
  }

  // Seed Site Visits if empty
  const visitsCountRow = database.prepare('SELECT COUNT(*) as count FROM site_visits').get() as { count: number };
  if (visitsCountRow.count === 0) {
    const insertVisit = database.prepare(`
      INSERT OR REPLACE INTO site_visits (
        id, full_name, phone, email, property_id, property_title, visit_date, time_slot, number_of_visitors, pickup_required, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

    for (const v of initialVisits) {
      insertVisit.run(
        v.id,
        v.fullName,
        v.phone,
        v.email,
        v.propertyId,
        v.propertyTitle,
        v.visitDate,
        v.timeSlot,
        v.numberOfVisitors,
        v.pickupRequired ? 1 : 0,
        v.status,
        v.notes || null,
        v.createdAt
      );
    }
  }

  // Seed Settings if empty
  const settingsCountRow = database.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCountRow.count === 0) {
    database.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run('business_config', JSON.stringify(BUSINESS_CONFIG));
  }

  // Seed Projects if empty
  const projCountRow = database.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (projCountRow.count === 0) {
    const insertProj = database.prepare('INSERT OR REPLACE INTO projects (id, slug, data) VALUES (?, ?, ?)');
    for (const pr of SAMPLE_PROJECTS) {
      insertProj.run(pr.id, pr.slug, JSON.stringify(pr));
    }
  }

  // Seed Locations if empty
  const locCountRow = database.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number };
  if (locCountRow.count === 0) {
    const insertLoc = database.prepare('INSERT OR REPLACE INTO locations (id, slug, data) VALUES (?, ?, ?)');
    for (const lc of SAMPLE_LOCATIONS) {
      insertLoc.run(lc.id, lc.slug, JSON.stringify(lc));
    }
  }

  // Seed Testimonials if empty
  const testCountRow = database.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };
  if (testCountRow.count === 0) {
    const insertTest = database.prepare('INSERT OR REPLACE INTO testimonials (id, data) VALUES (?, ?)');
    for (const t of SAMPLE_TESTIMONIALS) {
      insertTest.run(t.id, JSON.stringify(t));
    }
  }

  global.__sqliteDbInstance = database;
  return database;
}

// -----------------------------------------------------------------------------
// DATABASE RESET FUNCTION
// -----------------------------------------------------------------------------

export function resetDatabase(): void {
  try {
    if (global.__sqliteDbInstance) {
      try {
        global.__sqliteDbInstance.close();
      } catch {}
      global.__sqliteDbInstance = undefined;
    }

    const dbDir = path.join(process.cwd(), 'data');
    const files = ['signature_aura.db', 'signature_aura.db-wal', 'signature_aura.db-shm'];
    for (const f of files) {
      const p = path.join(dbDir, f);
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch {}
      }
    }

    // Re-initialize fresh database with clean seeds
    getDatabase();

    // Broadcast reset event to all realtime clients
    realtime.emit('change', { table: 'all', action: 'reset', timestamp: Date.now() });
  } catch (err) {
    console.error('Database reset error:', err);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// ENCRYPTED AUTHENTICATION & PASSWORD SECURITY
// -----------------------------------------------------------------------------

export function verifyAdminPassword(password: string): boolean {
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT password_hash, salt FROM admin_auth WHERE username = ? LIMIT 1')
      .get('admin') as { password_hash: string; salt: string } | undefined;

    if (!row) return false;

    const computedHash = crypto.scryptSync(password, row.salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(row.password_hash, 'hex'));
  } catch {
    return false;
  }
}

export function setAdminPassword(newPassword: string): void {
  const db = getDatabase();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
  db.prepare(`
    INSERT INTO admin_auth (id, username, password_hash, salt, updated_at)
    VALUES ('admin-1', 'admin', ?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
      password_hash = excluded.password_hash,
      salt = excluded.salt,
      updated_at = excluded.updated_at
  `).run(hash, salt, new Date().toISOString());

  realtime.emit('change', { table: 'admin_auth', action: 'password_updated', timestamp: Date.now() });
}

export function createSessionToken(username: string = 'admin'): string {
  const secret = process.env.ADMIN_SESSION_SECRET || 'aura_super_secure_secret_key_2026';
  const payload = JSON.stringify({
    user: username,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  });
  const b64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(b64Payload).digest('base64url');
  return `${b64Payload}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    if (!token || !token.includes('.')) return false;
    const [b64Payload, signature] = token.split('.');
    const secret = process.env.ADMIN_SESSION_SECRET || 'aura_super_secure_secret_key_2026';
    const expectedSig = crypto.createHmac('sha256', secret).update(b64Payload).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return false;
    }
    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// PROPERTY OPERATIONS (REALTIME)
// -----------------------------------------------------------------------------

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
  const db = getDatabase();
  let query = 'SELECT data FROM properties WHERE 1=1';
  const params: (string | number)[] = [];

  if (filter?.onlyPublished !== false) {
    query += ' AND is_published = 1';
  }

  if (filter?.onlyFeatured) {
    query += ' AND is_featured = 1';
  }

  if (filter?.listingType) {
    query += ' AND listing_type = ?';
    params.push(filter.listingType);
  }

  if (filter?.category && filter.category !== 'all') {
    query += ' AND category = ?';
    params.push(filter.category);
  }

  if (filter?.propertyType && filter.propertyType !== 'all') {
    query += ' AND property_type = ?';
    params.push(filter.propertyType);
  }

  if (filter?.city && filter.city !== 'all') {
    query += ' AND LOWER(city) LIKE ?';
    params.push(`%${filter.city.toLowerCase()}%`);
  }

  if (filter?.minPrice !== undefined && filter.minPrice > 0) {
    query += ' AND price >= ?';
    params.push(filter.minPrice);
  }

  if (filter?.maxPrice !== undefined && filter.maxPrice > 0) {
    query += ' AND price <= ?';
    params.push(filter.maxPrice);
  }

  if (filter?.bedrooms !== undefined && filter.bedrooms > 0) {
    query += ' AND bedrooms >= ?';
    params.push(filter.bedrooms);
  }

  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params) as { data: string }[];
  let list: Property[] = rows.map(r => JSON.parse(r.data));

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
  const db = getDatabase();
  const row = db.prepare('SELECT data FROM properties WHERE slug = ? OR id = ? LIMIT 1')
    .get(slug, slug) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : undefined;
}

export function getSimilarProperties(property: Property, limit = 3): Property[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT data FROM properties 
    WHERE id != ? AND is_published = 1 AND (city = ? OR category = ? OR listing_type = ?)
    LIMIT ?
  `).all(property.id, property.location.city, property.category, property.listingType, limit) as { data: string }[];
  return rows.map(r => JSON.parse(r.data));
}

export function createProperty(propertyData: Omit<Property, 'id' | 'createdAt'>): Property {
  const db = getDatabase();
  const newProperty: Property = {
    ...propertyData,
    id: `prop-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO properties (
      id, slug, title, price, listing_type, category, property_type, city, bedrooms, is_featured, is_published, data, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newProperty.id,
    newProperty.slug,
    newProperty.title,
    newProperty.price,
    newProperty.listingType,
    newProperty.category,
    newProperty.propertyType,
    newProperty.location.city,
    newProperty.bedrooms,
    newProperty.isFeatured ? 1 : 0,
    newProperty.isPublished ? 1 : 0,
    JSON.stringify(newProperty),
    newProperty.createdAt
  );

  realtime.emit('change', { table: 'properties', action: 'create', data: newProperty });
  return newProperty;
}

export function updateProperty(id: string, updates: Partial<Property>): Property | null {
  const existing = getPropertyBySlug(id);
  if (!existing) return null;

  const merged: Property = { ...existing, ...updates };
  const db = getDatabase();

  db.prepare(`
    UPDATE properties SET
      slug = ?,
      title = ?,
      price = ?,
      listing_type = ?,
      category = ?,
      property_type = ?,
      city = ?,
      bedrooms = ?,
      is_featured = ?,
      is_published = ?,
      data = ?
    WHERE id = ?
  `).run(
    merged.slug,
    merged.title,
    merged.price,
    merged.listingType,
    merged.category,
    merged.propertyType,
    merged.location.city,
    merged.bedrooms,
    merged.isFeatured ? 1 : 0,
    merged.isPublished ? 1 : 0,
    JSON.stringify(merged),
    id
  );

  realtime.emit('change', { table: 'properties', action: 'update', data: merged });
  return merged;
}

export function deleteProperty(id: string): boolean {
  const db = getDatabase();
  const res = db.prepare('DELETE FROM properties WHERE id = ?').run(id);
  if (res.changes > 0) {
    realtime.emit('change', { table: 'properties', action: 'delete', id });
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// LEADS OPERATIONS (REALTIME)
// -----------------------------------------------------------------------------

export function getLeads(): Lead[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    leadSource: r.lead_source as LeadSource,
    propertyId: r.property_id || undefined,
    propertyTitle: r.property_title || undefined,
    budget: r.budget || undefined,
    preferredLocation: r.preferred_location || undefined,
    message: r.message,
    leadStatus: r.lead_status as LeadStatus,
    preferredVisitDate: r.preferred_visit_date || undefined,
    internalNotes: JSON.parse(r.internal_notes || '[]'),
    createdAt: r.created_at
  }));
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
  const db = getDatabase();
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

  db.prepare(`
    INSERT INTO leads (
      id, full_name, phone, email, lead_source, property_id, property_title, budget, preferred_location, message, lead_status, preferred_visit_date, internal_notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newLead.id,
    newLead.fullName,
    newLead.phone,
    newLead.email,
    newLead.leadSource,
    newLead.propertyId || null,
    newLead.propertyTitle || null,
    newLead.budget || null,
    newLead.preferredLocation || null,
    newLead.message,
    newLead.leadStatus,
    newLead.preferredVisitDate || null,
    JSON.stringify(newLead.internalNotes),
    newLead.createdAt
  );

  // Broadcast realtime event immediately
  realtime.emit('change', { table: 'leads', action: 'create', data: newLead });

  // Asynchronous Supabase Persistence if configured
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
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM leads WHERE id = ? LIMIT 1').get(id) as any;
  if (!row) return null;

  const notes: string[] = JSON.parse(row.internal_notes || '[]');
  if (note) {
    notes.push(`[${new Date().toLocaleDateString('en-IN')}] ${note}`);
  }

  db.prepare(`
    UPDATE leads SET
      lead_status = ?,
      internal_notes = ?
    WHERE id = ?
  `).run(status, JSON.stringify(notes), id);

  const updatedLead: Lead = {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    leadSource: row.lead_source as LeadSource,
    propertyId: row.property_id || undefined,
    propertyTitle: row.property_title || undefined,
    budget: row.budget || undefined,
    preferredLocation: row.preferred_location || undefined,
    message: row.message,
    leadStatus: status,
    preferredVisitDate: row.preferred_visit_date || undefined,
    internalNotes: notes,
    createdAt: row.created_at
  };

  realtime.emit('change', { table: 'leads', action: 'update', data: updatedLead });

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase.from('leads').update({
        lead_status: status,
        internal_notes: notes,
        updated_at: new Date().toISOString()
      }).eq('id', id)
    ).then((res) => {
      if (res && 'error' in res && res.error) console.error('Supabase lead update notice:', res.error.message);
    }).catch(err => console.error('Supabase connection notice:', err));
  }

  return updatedLead;
}

// -----------------------------------------------------------------------------
// SITE VISITS OPERATIONS (REALTIME)
// -----------------------------------------------------------------------------

export function getSiteVisits(): SiteVisit[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM site_visits ORDER BY created_at DESC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    propertyId: r.property_id,
    propertyTitle: r.property_title,
    visitDate: r.visit_date,
    timeSlot: r.time_slot,
    numberOfVisitors: r.number_of_visitors,
    pickupRequired: !!r.pickup_required,
    status: r.status as 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled',
    notes: r.notes || undefined,
    createdAt: r.created_at
  }));
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
  const db = getDatabase();
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

  db.prepare(`
    INSERT INTO site_visits (
      id, full_name, phone, email, property_id, property_title, visit_date, time_slot, number_of_visitors, pickup_required, status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    visit.id,
    visit.fullName,
    visit.phone,
    visit.email,
    visit.propertyId,
    visit.propertyTitle,
    visit.visitDate,
    visit.timeSlot,
    visit.numberOfVisitors,
    visit.pickupRequired ? 1 : 0,
    visit.status,
    visit.notes || null,
    visit.createdAt
  );

  realtime.emit('change', { table: 'site_visits', action: 'create', data: visit });

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
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM site_visits WHERE id = ? LIMIT 1').get(id) as any;
  if (!row) return null;

  db.prepare('UPDATE site_visits SET status = ? WHERE id = ?').run(status, id);

  const updatedVisit: SiteVisit = {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    propertyId: row.property_id,
    propertyTitle: row.property_title,
    visitDate: row.visit_date,
    timeSlot: row.time_slot,
    numberOfVisitors: row.number_of_visitors,
    pickupRequired: !!row.pickup_required,
    status,
    notes: row.notes || undefined,
    createdAt: row.created_at
  };

  realtime.emit('change', { table: 'site_visits', action: 'update', data: updatedVisit });

  const supabase = getSupabaseServerClient();
  if (supabase) {
    Promise.resolve(
      supabase.from('site_visits').update({ status }).eq('id', id)
    ).then((res) => {
      if (res && 'error' in res && res.error) console.error('Supabase site visit update notice:', res.error.message);
    }).catch(err => console.error('Supabase connection notice:', err));
  }

  return updatedVisit;
}

// -----------------------------------------------------------------------------
// BUSINESS SETTINGS (REALTIME)
// -----------------------------------------------------------------------------

export function getBusinessSettings(): BusinessConfig {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM settings WHERE key = ? LIMIT 1').get('business_config') as { value: string } | undefined;
  if (row) {
    return JSON.parse(row.value);
  }
  return { ...BUSINESS_CONFIG };
}

export function updateBusinessSettings(updates: Partial<BusinessConfig>): BusinessConfig {
  const db = getDatabase();
  const current = getBusinessSettings();
  const merged = { ...current, ...updates };
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    .run('business_config', JSON.stringify(merged));
  realtime.emit('change', { table: 'settings', action: 'update', data: merged });
  return merged;
}

// -----------------------------------------------------------------------------
// PROJECTS, LOCATIONS, TESTIMONIALS
// -----------------------------------------------------------------------------

export function getProjects(): ProjectDevelopment[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT data FROM projects').all() as { data: string }[];
  return rows.map(r => JSON.parse(r.data));
}

export function getProjectBySlug(slug: string): ProjectDevelopment | undefined {
  const db = getDatabase();
  const row = db.prepare('SELECT data FROM projects WHERE slug = ? OR id = ? LIMIT 1').get(slug, slug) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : undefined;
}

export function getLocations(): CityLocation[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT data FROM locations').all() as { data: string }[];
  return rows.map(r => JSON.parse(r.data));
}

export function getLocationBySlug(slug: string): CityLocation | undefined {
  const db = getDatabase();
  const row = db.prepare('SELECT data FROM locations WHERE slug = ? OR id = ? LIMIT 1').get(slug, slug) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : undefined;
}

export function getTestimonials(): Testimonial[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT data FROM testimonials').all() as { data: string }[];
  return rows.map(r => JSON.parse(r.data));
}

// Dynamic compatibility object for legacy direct property access
export const db = {
  get properties() { return getProperties({ onlyPublished: false }); },
  get leads() { return getLeads(); },
  get siteVisits() { return getSiteVisits(); },
  get projects() { return getProjects(); },
  get locations() { return getLocations(); },
  get testimonials() { return getTestimonials(); },
  get businessSettings() { return getBusinessSettings(); }
};
