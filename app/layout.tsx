import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { BUSINESS_CONFIG } from '@/lib/config';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#171717',
};

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Signature Aura™ · Luxury Real Estate & Advisory | Signature Aura Pvt. Ltd.',
  description: 'Signature Aura Pvt. Ltd. provides bespoke real estate advisory, luxury residential penthouses, villas, and prime commercial spaces in Pune, Mumbai, Delhi NCR, and Goa. RERA Registered.',
  icons: {
    icon: '/assets/aistudio/Navy_and_Gold_SA_Emblem_5fd307f4.png',
    apple: '/assets/aistudio/Navy_and_Gold_SA_Emblem_5fd307f4.png',
  },
  keywords: [
    'signature aura real estate',
    'signature aura pvt ltd',
    'luxury real estate pune',
    'baner sus properties pune',
    'millennium towers baner sus',
    'luxury penthouses mumbai',
    'golf course road apartments gurgaon',
    'goa luxury villas',
    'rera verified properties india'
  ],
  authors: [{ name: 'Signature Aura Pvt. Ltd.' }],
  openGraph: {
    title: 'Signature Aura™ · Luxury Real Estate & Advisory',
    description: 'Bespoke real estate consultancy for discerning buyers, HNIs, and corporate leaders. Registered trademark of Signature Aura Pvt. Ltd.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Signature Aura',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Signature Aura™ Luxury Real Estate Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signature Aura™ · Luxury Real Estate & Advisory',
    description: 'Bespoke real estate consultancy for discerning buyers, HNIs, and corporate leaders. Signature Aura Pvt. Ltd.',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: BUSINESS_CONFIG.companyName,
    description: BUSINESS_CONFIG.tagline,
    telephone: BUSINESS_CONFIG.phoneNumber,
    email: BUSINESS_CONFIG.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Office No. 812, Millennium Towers, Near Nanaware Bridge, Baner-Sus',
      addressLocality: 'Pune',
      addressRegion: 'Maharashtra',
      postalCode: '411021',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '18.5529',
      longitude: '73.7785',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:30',
        closes: '19:30',
      },
    ],
    priceRange: '₹₹₹₹',
  };

  return (
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-[#B99A63]/25 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
