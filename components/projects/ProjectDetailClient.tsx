'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Building, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  Phone,
  MessageSquare,
  FileDown,
  CheckCircle2,
  Send
} from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingContactSystem from '@/components/floating/FloatingContactSystem';
import { SAMPLE_PROJECTS } from '@/lib/data/sample-data';
import { getWhatsAppLink } from '@/lib/config';

import { ProjectDevelopment } from '@/types/real-estate';

export default function ProjectDetailClient({ 
  slug, 
  initialProject 
}: { 
  slug: string; 
  initialProject?: ProjectDevelopment;
}) {
  const project = initialProject || SAMPLE_PROJECTS.find(p => p.slug === slug);

  if (!project) {
    notFound();
  }

  const [brochureRequested, setBrochureRequested] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBrochureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.name,
          phone: form.phone,
          email: form.email,
          leadSource: 'contact_form',
          propertyTitle: project.title,
          message: `Requested Digital Brochure for development: ${project.title} (${project.locality}, ${project.city})`
        })
      });
      setBrochureRequested(true);
    } catch {
      // Ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171717] font-sans flex flex-col">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 pt-6 pb-24 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/projects" className="hover:text-stone-900">Projects</Link>
          <span aria-hidden="true">/</span>
          <span className="text-stone-900 font-medium truncate">{project.title}</span>
        </div>

        {/* Hero Banner */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-stone-900 shadow-xl border border-[#E8E5DF] mb-10">
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            priority
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 text-white max-w-3xl">
            <span className="text-xs tracking-widest text-[#B99A63] uppercase block mb-1">
              {project.developer} · {project.city}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl">{project.title}</h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 font-light">{project.tagline}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Info (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white border border-[#E8E5DF] rounded-xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-2xl text-[#171717] mb-4">Masterplan Overview</h2>
              <p className="text-sm text-stone-600 leading-relaxed font-light mb-6">
                {project.overview}
              </p>

              <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-900 mb-3">
                Architectural Highlights
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
                {project.highlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#B99A63] flex-shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Gallery Images */}
            {project.galleryImages && project.galleryImages.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-serif text-2xl text-[#171717]">Development Gallery</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {project.galleryImages.map((img, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-200">
                      <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E8E5DF] rounded-xl p-6 shadow-md space-y-5">
              <h3 className="font-serif text-xl text-[#171717]">Project Dossier</h3>
              
              <div className="space-y-3 text-xs border-b border-[#E8E5DF] pb-4">
                <div className="flex justify-between">
                  <span className="text-stone-500">Status</span>
                  <span className="font-medium text-[#B99A63]">{project.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Pricing</span>
                  <span className="font-medium text-[#171717]">{project.priceStartingFrom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Handover</span>
                  <span>{project.completionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">RERA No.</span>
                  <span className="font-mono text-[11px] text-stone-700">{project.reraNumber}</span>
                </div>
              </div>

              {brochureRequested ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-serif text-base text-[#171717]">Dossier Dispatched</h4>
                  <p className="text-xs text-stone-600">The floor plans and masterplan brochure have been sent to your email.</p>
                </div>
              ) : (
                <form onSubmit={handleBrochureSubmit} className="space-y-3">
                  <span className="text-[11px] font-semibold text-stone-600 uppercase block">
                    Download Confidential Brochure
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    suppressHydrationWarning
                    className="w-full bg-[#FAF9F5] border border-[#E8E5DF] px-3 py-2 rounded text-base sm:text-xs"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="+91 Contact Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    suppressHydrationWarning
                    className="w-full bg-[#FAF9F5] border border-[#E8E5DF] px-3 py-2 rounded text-base sm:text-xs"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Official Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    suppressHydrationWarning
                    className="w-full bg-[#FAF9F5] border border-[#E8E5DF] px-3 py-2 rounded text-base sm:text-xs"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#171717] hover:bg-[#B99A63] text-white py-2.5 rounded text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Brochure</span>
                  </button>
                </form>
              )}

              <a
                href={getWhatsAppLink(`Hello Signature Aura, I would like to schedule a private viewing for ${project.title}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded text-xs uppercase tracking-wider font-medium transition-all"
              >
                Inquire on WhatsApp
              </a>
            </div>
          </div>

        </div>

      </main>

      <Footer />
      <FloatingContactSystem />
    </div>
  );
}
