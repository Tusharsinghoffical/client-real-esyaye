import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
      <div className="text-center flex flex-col items-center space-y-4">
        {/* Glowing circular logo container */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 animate-pulse">
          <Image
            src="/assets/branding/logo-circle.png"
            alt="Signature Aura Developers"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>

        {/* Text Logo */}
        <div className="relative h-8 sm:h-9 w-44 sm:w-52">
          <Image
            src="/assets/branding/logo-text-dark.png"
            alt="Signature Aura Developers"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#B99A63] animate-ping" />
          <span className="text-[10px] tracking-widest text-stone-500 uppercase font-mono">
            Loading Luxury Experience...
          </span>
        </div>
      </div>
    </div>
  );
}
