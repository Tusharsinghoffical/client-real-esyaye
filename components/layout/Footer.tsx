import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';
import { BUSINESS_CONFIG } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-[#FAF9F5] pt-16 pb-24 md:pb-16 border-t border-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-[#2D2D2D]">
          
          {/* Brand & Advisory Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-11 h-11 shrink-0 overflow-hidden rounded-xl bg-white p-0.5 border border-[#B99A63]/50 shadow-md">
                <Image
                  src="/assets/aistudio/Navy_and_Gold_SA_Emblem_5fd307f4.png"
                  alt="Signature Aura Emblem"
                  fill
                  className="object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl tracking-[0.15em] font-normal text-white group-hover:text-[#E8DFD0] transition-colors uppercase flex items-center">
                  Signature Aura<span className="text-xs text-[#B99A63] ml-1">™</span>
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.28em] text-[#B99A63] uppercase -mt-0.5 font-sans">
                  Pvt. Ltd. · Real Estate Advisory
                </span>
              </div>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md font-normal">
              Signature Aura Pvt. Ltd. represents private clients, corporate leaders, and family offices in the acquisition, leasing, and strategic management of distinguished residential penthouses, luxury villas, and Grade-A commercial properties.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest text-[#B99A63] uppercase">
              Portfolio
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link href="/properties?listingType=buy" className="hover:text-white transition-colors">
                  Buy Residences
                </Link>
              </li>
              <li>
                <Link href="/properties?listingType=rent" className="hover:text-white transition-colors">
                  Luxury Rentals
                </Link>
              </li>
              <li>
                <Link href="/properties?category=commercial" className="hover:text-white transition-colors">
                  Commercial & Offices
                </Link>
              </li>
              <li>
                <Link href="/properties?category=luxury_penthouse" className="hover:text-white transition-colors">
                  Penthouse Collection
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Featured Developments
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Private Advisory Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Key Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest text-[#B99A63] uppercase">
              Prime Markets
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link href="/locations/mumbai" className="hover:text-white transition-colors">
                  Mumbai (Worli, BKC, Bandra)
                </Link>
              </li>
              <li>
                <Link href="/locations/delhi-ncr" className="hover:text-white transition-colors">
                  Delhi NCR (Golf Course Rd)
                </Link>
              </li>
              <li>
                <Link href="/locations/goa" className="hover:text-white transition-colors">
                  Goa (Assagao, Candolim)
                </Link>
              </li>
              <li>
                <Link href="/locations/bengaluru" className="hover:text-white transition-colors">
                  Bengaluru (CBD & Indiranagar)
                </Link>
              </li>
              <li>
                <Link href="/locations/hyderabad" className="hover:text-white transition-colors">
                  Hyderabad (Jubilee Hills)
                </Link>
              </li>
              <li>
                <Link href="/locations/pune" className="hover:text-white transition-colors">
                  Pune (Koregaon Park)
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest text-[#B99A63] uppercase">
              Advisory Desk
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B99A63] flex-shrink-0 mt-0.5" />
                <span>{BUSINESS_CONFIG.officeAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B99A63] flex-shrink-0" />
                <a href={`tel:${BUSINESS_CONFIG.phoneRaw}`} className="hover:text-[#B99A63] transition-colors">
                  {BUSINESS_CONFIG.phoneNumber}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B99A63] flex-shrink-0" />
                <a href={`mailto:${BUSINESS_CONFIG.email}`} className="hover:text-[#B99A63] transition-colors">
                  {BUSINESS_CONFIG.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#B99A63] flex-shrink-0 mt-0.5" />
                <span>{BUSINESS_CONFIG.businessHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="text-center sm:text-left">
            <p>© {new Date().getFullYear()} Signature Aura Pvt. Ltd. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Advisor Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
