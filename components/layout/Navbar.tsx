'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Phone, 
  Heart, 
  Search, 
  ShieldCheck, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { BUSINESS_CONFIG } from '@/lib/config';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const pathname = usePathname();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateSaved = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = JSON.parse(localStorage.getItem('aura_saved_properties') || '[]');
          setSavedCount(saved.length);
        } catch {
          setSavedCount(0);
        }
      }
    };
    updateSaved();
    window.addEventListener('storage', updateSaved);
    window.addEventListener('aura_favorites_updated', updateSaved);
    return () => {
      window.removeEventListener('storage', updateSaved);
      window.removeEventListener('aura_favorites_updated', updateSaved);
    };
  }, []);

  const navLinks = [
    { name: 'Properties', href: '/properties' },
    { name: 'Projects', href: '/projects' },
    { name: 'Locations', href: '/locations' },
    { name: 'Services', href: '/services' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header 
      style={{ position: 'sticky', top: 0, zIndex: 30 }}
      className={`sticky top-0 left-0 right-0 w-full z-30 transition-colors duration-200 ${
        isScrolled
          ? 'bg-[#FAF9F5] shadow-sm border-b border-[#E8E5DF]' 
          : 'bg-[#FAF9F5] border-b border-[#E8E5DF]/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo with SA Emblem */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group py-1 min-w-0 flex-1 mr-2 sm:mr-0">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 shrink-0 overflow-hidden rounded-xl bg-white p-0.5 border border-[#B99A63]/40 shadow-2xs group-hover:border-[#B99A63] transition-colors">
              <Image
                src="/assets/aistudio/Navy_and_Gold_SA_Emblem_5fd307f4.png"
                alt="Signature Aura Logo"
                fill
                className="object-contain"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-base sm:text-xl md:text-2xl tracking-[0.08em] sm:tracking-[0.16em] font-normal text-[#171717] group-hover:text-[#B99A63] transition-colors uppercase truncate flex items-center">
                Signature Aura<span className="text-xs text-[#B99A63] ml-0.5">™</span>
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.18em] sm:tracking-[0.3em] text-[#777777] uppercase font-sans -mt-0.5 group-hover:text-[#171717] transition-colors truncate">
                Pvt. Ltd. · Real Estate Advisory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs xl:text-sm tracking-wide transition-colors relative py-1.5 font-normal ${
                    isActive 
                      ? 'text-[#171717] font-medium' 
                      : 'text-[#555555] hover:text-[#171717]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#B99A63]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5">
            {/* Saved properties button */}
            <Link 
              href="/properties?filter=saved"
              className="relative p-2.5 text-[#555555] hover:text-[#171717] transition-colors touch-target"
              title="Saved Properties"
              aria-label={`View saved properties (${savedCount})`}
            >
              <Heart className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute 1 top-0 right-0 bg-[#B99A63] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Admin Portal link */}
            <Link 
              href="/admin" 
              className="text-xs tracking-wider text-[#777777] hover:text-[#171717] px-2.5 py-1.5 border border-[#E8E5DF] hover:border-[#171717] rounded transition-all uppercase"
            >
              Portal
            </Link>

            {/* Direct Call Concierge CTA */}
            <a
              href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
              className="inline-flex items-center gap-2 bg-[#171717] text-[#FAF9F5] hover:bg-[#B99A63] text-xs font-medium tracking-wider uppercase px-4 py-2.5 rounded transition-all shadow-sm hover:shadow min-h-[40px]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Schedule Call</span>
            </a>
          </div>

          {/* Mobile & Tablet Header Controls (Touch targets >= 44x44px) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
            <Link
              href="/properties?filter=saved"
              className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-[#171717] border border-[#E8E5DF] rounded-lg"
              aria-label={`Saved properties (${savedCount})`}
            >
              <Heart className="w-4 h-4 text-[#B99A63]" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B99A63] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </Link>

            <a
              href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
              aria-label="Call concierge desk"
              className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-[#171717] border border-[#E8E5DF] rounded-lg"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-[#171717] hover:text-[#B99A63] transition-colors border border-[#E8E5DF] rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Overlay: Higher z-index (z-50) than navbar (z-30) */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 pointer-events-auto"
          aria-modal="true"
          role="dialog"
          aria-label="Mobile Navigation Menu"
        >
          {/* Backdrop below dropdown */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)} 
            aria-hidden="true"
          />

          {/* Absolute positioning for the mobile menu content */}
          <div className="absolute top-0 left-0 right-0 w-full bg-[#FAF9F5] border-b border-[#E8E5DF] shadow-2xl max-h-[92dvh] overflow-y-auto overscroll-contain animate-in slide-in-from-top-1 duration-200 z-50">
            {/* Header row inside menu overlay aligned with top bar */}
            <div className="flex items-center justify-between h-20 px-4 sm:px-6 border-b border-[#E8E5DF] bg-[#FAF9F5]">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2.5 group py-1 min-w-0 flex-1 mr-2"
              >
                <div className="relative w-9 h-9 shrink-0 overflow-hidden rounded-lg bg-white p-0.5 border border-[#B99A63]/40">
                  <Image
                    src="/assets/aistudio/Navy_and_Gold_SA_Emblem_5fd307f4.png"
                    alt="Signature Aura Logo"
                    fill
                    className="object-contain"
                    priority
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-serif text-base sm:text-xl tracking-[0.08em] font-normal text-[#171717] uppercase truncate flex items-center">
                    Signature Aura<span className="text-xs text-[#B99A63] ml-0.5">™</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] tracking-[0.18em] text-[#777777] uppercase font-sans -mt-0.5 truncate">
                    Pvt. Ltd. · Real Estate Advisory
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/properties?filter=saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-[#171717] border border-[#E8E5DF] rounded-lg"
                  aria-label={`Saved properties (${savedCount})`}
                >
                  <Heart className="w-4 h-4 text-[#B99A63]" />
                  {savedCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#B99A63] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {savedCount}
                    </span>
                  )}
                </Link>

                <a
                  href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
                  aria-label="Call concierge desk"
                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-[#171717] border border-[#E8E5DF] rounded-lg"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-[#171717] hover:text-[#B99A63] transition-colors border border-[#E8E5DF] rounded-lg bg-stone-100"
                >
                  <X className="w-5 h-5 text-[#171717]" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Links */}
            <div className="px-6 py-6 flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between min-h-[48px] py-2 px-2 text-base border-b border-[#E8E5DF]/60 transition-colors ${
                    pathname === link.href ? 'text-[#B99A63] font-semibold' : 'text-[#171717] hover:text-[#B99A63]'
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
              ))}

              <Link
                href="/properties?filter=saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between min-h-[48px] py-2 px-2 text-base text-[#171717] border-b border-[#E8E5DF]/60"
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-[#B99A63]" />
                  Saved Residences ({savedCount})
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between min-h-[48px] py-2 px-2 text-base text-stone-600 border-b border-[#E8E5DF]/60"
              >
                <span>Advisor & Console Portal</span>
                <ArrowUpRight className="w-4 h-4 text-stone-400" />
              </Link>

              <div className="pt-4 flex flex-col gap-3">
                <a
                  href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
                  className="w-full min-h-[48px] text-center bg-[#171717] text-white py-3 rounded-lg text-sm tracking-wide font-medium flex items-center justify-center gap-2 shadow"
                >
                  <Phone className="w-4 h-4 text-[#B99A63]" />
                  Call Concierge: {BUSINESS_CONFIG.phoneNumber}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
