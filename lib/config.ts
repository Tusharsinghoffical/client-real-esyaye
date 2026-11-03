import { BusinessConfig } from '@/types/real-estate';

export const BUSINESS_CONFIG: BusinessConfig = {
  companyName: "Signature Aura Pvt. Ltd.",
  tagline: "Premier Luxury Real Estate Advisory & Living",
  logoText: "SIGNATURE AURA",
  phoneNumber: "+91 88056 21111",
  phoneRaw: "+918805621111",
  whatsappNumber: "918805621111",
  email: "Aura@gmail.com",
  officeAddress: "Office No. 812, Millennium Towers, Near Nanaware Bridge, Baner-Sus, Pune",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411021",
  reraRegistration: "MahaRERA: A52100039218 | CIN: U70109PN2023PTC221045",
  announcementBarText: "Signature Aura™ Exclusive Residences & Penthouses in Baner, Balewadi, Koregaon Park & Assagao now available.",
  businessHours: "Monday – Saturday: 9:30 AM – 7:30 PM IST (Sunday by VIP appointment)",
  googleMapsUrl: "https://maps.google.com/?q=Millennium+Towers+Baner+Sus+Road+Pune+411021",
  socials: {
    instagram: "https://instagram.com/signatureaurarealty",
    facebook: "https://facebook.com/signatureaurarealty",
    linkedin: "https://linkedin.com/company/signature-aura-pvt-ltd",
    youtube: "https://youtube.com/@signatureaura",
  },
};

export function getWhatsAppLink(customMessage?: string, propertyTitle?: string, propertyUrl?: string): string {
  let message = `Hello Signature Aura, I am interested in exploring properties with your advisory team.`;
  
  if (propertyTitle) {
    message = `Hello Signature Aura, I am interested in "${propertyTitle}". Could you share the detailed brochure, floor plans, and arrange a private site visit?`;
    if (propertyUrl) {
      message += ` (Link: ${propertyUrl})`;
    }
  } else if (customMessage) {
    message = customMessage;
  }
  
  return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹ ${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  } else if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹ ${lakh.toFixed(2).replace(/\.00$/, '')} Lakh`;
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
