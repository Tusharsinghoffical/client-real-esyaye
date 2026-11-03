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
  ChevronRight
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
      className={`sticky top-0 left-0 right-0 w-full z-30 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#121214]/95 backdrop-blur-md shadow-2xl border-b border-[#262629]' 
          : 'bg-[#121214]/90 backdrop-blur-sm border-b border-[#262629]/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] sm:h-[76px] md:h-20 lg:h-[84px] xl:h-[90px]">
          
          {/* Brand Logo with 3D SA Emblem & Text Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group py-1 shrink-0 mr-2 sm:mr-4">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-[52px] lg:h-[52px] xl:w-[58px] xl:h-[58px] shrink-0 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/assets/branding/logo-circle.png"
                alt="Signature Aura Developers Emblem"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="relative h-9 sm:h-10 md:h-11 lg:h-12 xl:h-13 w-[115px] sm:w-[135px] md:w-[155px] lg:w-[175px] xl:w-[195px] shrink-0">
              <Image
                src="/assets/branding/logo-text.png"
                alt="Signature Aura Developers"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs xl:text-[13px] uppercase tracking-[0.14em] transition-colors relative py-1.5 ${
                    isActive 
                      ? 'text-[#FAF9F5] font-bold' 
                      : 'text-stone-300 hover:text-[#E8D39E] font-medium'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-linear-to-r from-[#B99A63] to-[#E8D39E] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {/* Saved properties button */}
            <Link 
              href="/properties?filter=saved"
              className="relative p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-all touch-target"
              title="Saved Properties"
              aria-label={`View saved properties (${savedCount})`}
            >
              <Heart className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#B99A63] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Direct Call Concierge CTA */}
            <a
              href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
              className="inline-flex items-center gap-1.5 xl:gap-2 bg-[#202024] hover:bg-[#B99A63] text-[#FAF9F5] hover:text-[#121214] border border-[#B99A63]/50 text-xs font-semibold tracking-wider uppercase px-4 py-2.5 rounded-full transition-all shadow-sm hover:shadow min-h-[40px]"
            >
              <Phone className="w-3.5 h-3.5 text-[#B99A63]" />
              <span>Schedule Call</span>
            </a>
          </div>

          {/* Mobile & Tablet Header Controls (Touch targets >= 44x44px) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
            <Link
              href="/properties?filter=saved"
              className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-stone-300 border border-[#262629] bg-[#161619] rounded-lg"
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
              className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-stone-300 border border-[#262629] bg-[#161619] rounded-lg"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-stone-300 hover:text-white transition-colors border border-[#262629] bg-[#161619] rounded-lg focus:outline-hidden"
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
            className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)} 
            aria-hidden="true"
          />

          {/* Absolute positioning for the mobile menu content */}
          <div className="absolute top-0 left-0 right-0 w-full bg-[#121214] text-[#FAF9F5] border-b border-[#262629] shadow-2xl max-h-[92dvh] overflow-y-auto overscroll-contain animate-in slide-in-from-top-1 duration-200 z-50">
            {/* Header row inside menu overlay aligned with top bar */}
            <div className="flex items-center justify-between h-[72px] sm:h-[76px] md:h-20 px-4 sm:px-6 border-b border-[#262629] bg-[#121214]">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-2 sm:gap-3 group py-1 shrink-0 mr-2"
              >
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 shrink-0 drop-shadow-xs">
                  <Image
                    src="/assets/branding/logo-circle.png"
                    alt="Signature Aura Developers Emblem"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="relative h-9 sm:h-10 md:h-11 w-[115px] sm:w-[135px] md:w-[155px] shrink-0">
                  <Image
                    src="/assets/branding/logo-text.png"
                    alt="Signature Aura Developers"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/properties?filter=saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-stone-300 border border-[#262629] bg-[#1a1a1e] rounded-lg"
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
                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-stone-300 border border-[#262629] bg-[#1a1a1e] rounded-lg"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-stone-300 hover:text-white transition-colors border border-[#262629] rounded-lg bg-[#1a1a1e]"
                >
                  <X className="w-5 h-5 text-stone-300" />
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
                  className={`flex items-center justify-between min-h-[48px] py-2 px-2 text-base border-b border-[#262629]/60 transition-colors ${
                    pathname === link.href ? 'text-[#E8D39E] font-semibold' : 'text-stone-300 hover:text-[#E8D39E]'
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </Link>
              ))}

              <Link
                href="/properties?filter=saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between min-h-[48px] py-2 px-2 text-base text-stone-300 hover:text-[#E8D39E] border-b border-[#262629]/60"
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-[#B99A63]" />
                  Saved Residences ({savedCount})
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </Link>

              <div className="pt-4 flex flex-col gap-3">
                <a
                  href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
                  className="w-full min-h-[48px] text-center bg-[#202024] hover:bg-[#B99A63] text-white hover:text-[#121214] border border-[#B99A63]/50 py-3 rounded-lg text-sm tracking-wide font-medium flex items-center justify-center gap-2 shadow transition-colors"
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
