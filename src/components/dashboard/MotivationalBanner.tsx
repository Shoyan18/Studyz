'use client';

import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const MotivationalBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#FFF5F2] via-[#FFF9F6] to-[#FFEFEA] dark:from-[#212328] dark:via-[#1a1b20] dark:to-[#212328] border border-[#FFD9CE]/70 dark:border-[#2e313a] rounded-xl p-2.5 md:p-3 shadow-sm mt-4">
      {/* Background soft mountain/sun curve silhouette */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-40">
        <svg width="220" height="60" viewBox="0 0 220 60" fill="none">
          <circle cx="180" cy="18" r="8" fill="#FF8E72" />
          <path
            d="M50 60 C80 30 110 45 140 25 C170 10 200 35 220 60 Z"
            fill="#FFC5B4"
            className="dark:fill-[#402e2a]"
          />
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-charcoal-800 dark:text-gray-200">
        <Sparkles className="w-4 h-4 text-coral-500 fill-coral-400" />
        <span>Stay consistent. Stay focused. You&apos;ve got this!</span>
        <Heart className="w-4 h-4 text-coral-500 fill-coral-400" />
      </div>
    </div>
  );
};
