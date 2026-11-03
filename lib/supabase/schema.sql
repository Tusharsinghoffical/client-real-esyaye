-- ==============================================================================
-- AURA PRIME ESTATES - PRODUCTION POSTGRESQL & SUPABASE DATABASE SCHEMA
-- Normalized relational schema with Row-Level Security (RLS) policies and indexes
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles (Admin & Staff)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'agent' CHECK (role IN ('super_admin', 'admin', 'agent')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agents
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  photo_url TEXT,
  experience_years INT DEFAULT 5,
  rating NUMERIC(3,2) DEFAULT 4.9,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Locations (Cities & Key Regions)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  tagline TEXT,
  avg_price_per_sqft TEXT,
  active_listings_count INT DEFAULT 0,
  hero_image TEXT,
  description TEXT,
  popular_localities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Projects (New Developments & Luxury Compounds)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  developer TEXT NOT NULL,
  tagline TEXT,
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  status TEXT CHECK (status IN ('Pre-Launch', 'Under Construction', 'Ready to Move')),
  completion_date TEXT,
  price_starting_from TEXT,
  configurations TEXT,
  rera_number TEXT,
  hero_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  overview TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,
  brochure_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Properties
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  price BIGINT NOT NULL, -- in INR
  price_display TEXT NOT NULL,
  price_per_sqft INT NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('buy', 'rent')),
  category TEXT NOT NULL CHECK (category IN ('residential', 'commercial', 'luxury_penthouse', 'villa', 'office')),
  property_type TEXT NOT NULL,
  bedrooms INT NOT NULL DEFAULT 0,
  bathrooms INT NOT NULL DEFAULT 0,
  balconies INT NOT NULL DEFAULT 0,
  carpet_area_sqft INT NOT NULL,
  super_area_sqft INT NOT NULL,
  furnishing TEXT CHECK (furnishing IN ('Furnished', 'Semi-Furnished', 'Bare Shell')),
  floor INT DEFAULT 1,
  total_floors INT DEFAULT 1,
  parking TEXT,
  property_age TEXT,
  ownership TEXT,
  availability TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  is_rera_approved BOOLEAN DEFAULT TRUE,
  rera_number TEXT,
  location_data JSONB NOT NULL,
  description TEXT,
  highlight_features JSONB DEFAULT '[]'::jsonb,
  nearby_facilities JSONB DEFAULT '[]'::jsonb,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Property Images
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Property Amenities
CREATE TABLE IF NOT EXISTS public.property_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  lead_source TEXT NOT NULL CHECK (lead_source IN ('property_enquiry', 'contact_form', 'whatsapp', 'callback_modal', 'ai_assistant', 'site_visit_booking')),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  property_title TEXT,
  budget TEXT,
  preferred_location TEXT,
  message TEXT,
  lead_status TEXT DEFAULT 'New' CHECK (lead_status IN ('New', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Converted', 'Lost')),
  preferred_visit_date DATE,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  assigned_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Site Visits
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  property_title TEXT NOT NULL,
  visit_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  number_of_visitors INT DEFAULT 1,
  pickup_required BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  designation TEXT,
  city TEXT,
  rating INT DEFAULT 5,
  quote TEXT NOT NULL,
  avatar_url TEXT,
  property_purchased TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Chatbot Conversations
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  lead_captured BOOLEAN DEFAULT FALSE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Chatbot Messages
CREATE TABLE IF NOT EXISTS public.chatbot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  properties_recommended JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Business Settings
CREATE TABLE IF NOT EXISTS public.business_settings (
  id INT PRIMARY KEY DEFAULT 1,
  company_name TEXT NOT NULL,
  tagline TEXT,
  logo_text TEXT,
  phone_number TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT NOT NULL,
  office_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  rera_registration TEXT NOT NULL,
  announcement_bar_text TEXT,
  business_hours TEXT,
  google_maps_url TEXT,
  socials JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Saved Properties (Visitor Favorites)
CREATE TABLE IF NOT EXISTS public.saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_token TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(visitor_token, property_id)
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(listing_type, category);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_date ON public.site_visits(visit_date);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

-- Properties: Public can only view published listings
CREATE POLICY "Public can view published properties" 
  ON public.properties FOR SELECT 
  USING (is_published = TRUE);

-- Properties: Authenticated Admins can perform full CRUD
CREATE POLICY "Admins have full access to properties" 
  ON public.properties FOR ALL 
  TO authenticated 
  USING (TRUE);

-- Leads: Anyone can insert (enquiry submissions), but only authenticated admins can select/update
CREATE POLICY "Public can submit leads" 
  ON public.leads FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (TRUE);

CREATE POLICY "Admins have full access to leads" 
  ON public.leads FOR ALL 
  TO authenticated 
  USING (TRUE);

-- Site Visits: Anyone can submit a booking
CREATE POLICY "Public can book site visits" 
  ON public.site_visits FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (TRUE);

CREATE POLICY "Admins can manage site visits" 
  ON public.site_visits FOR ALL 
  TO authenticated 
  USING (TRUE);

-- Business Settings: Public can read settings
CREATE POLICY "Public can read business settings" 
  ON public.business_settings FOR SELECT 
  USING (TRUE);

CREATE POLICY "Admins can update business settings" 
  ON public.business_settings FOR UPDATE 
  TO authenticated 
  USING (TRUE);
