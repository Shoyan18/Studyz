'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

export const FocusHeroCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft text-center relative overflow-hidden">
      <div className="w-full text-left">
        <h2 className="text-sm font-bold text-charcoal-900 dark:text-white tracking-tight">Focus Now</h2>
      </div>

      {/* Center Plant Illustration */}
      <div className="my-2 relative flex flex-col items-center justify-center">
        {/* Soft Peach Circle Backdrop */}
        <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-gradient-to-b from-[#FFF5F1] to-[#FFE8DE] dark:from-[#2a2c35] dark:to-[#21232a] border border-[#FFD9CE]/60 dark:border-[#2e313a] flex items-center justify-center shadow-inner relative">
          {/* Plant Graphic */}
          <svg className="w-10 h-10 md:w-12 md:h-12 text-coral-400" viewBox="0 0 100 100" fill="currentColor">
            <ellipse cx="50" cy="85" rx="16" ry="5" className="text-coral-200 dark:text-coral-950" fill="currentColor" />
            <path
              d="M50 82 C50 82 46 65 46 50 C46 35 50 25 50 25 C50 25 54 35 54 50 C54 65 50 82 50 82 Z"
              className="text-coral-400"
            />
            {/* Left Leaf 1 */}
            <path
              d="M48 55 C35 50 25 40 30 30 C38 25 48 40 48 55 Z"
              className="text-coral-300"
            />
            {/* Right Leaf 1 */}
            <path
              d="M52 45 C65 40 75 30 70 20 C62 15 52 30 52 45 Z"
              className="text-coral-400"
            />
            {/* Left Leaf 2 */}
            <path
              d="M49 32 C38 28 32 18 39 12 C47 8 49 20 49 32 Z"
              className="text-coral-300"
            />
            {/* Top Sprout */}
            <path
              d="M50 25 C46 15 52 8 55 10 C58 13 54 20 50 25 Z"
              className="text-coral-400"
            />
          </svg>
        </div>
      </div>

      <div className="w-full">
        <p className="text-[11px] text-charcoal-500 dark:text-gray-400 font-medium mb-3 max-w-[200px] mx-auto">
          Start a focus session and get things done.
        </p>

        <Link
          href="/focus"
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF704E] via-[#FF8E72] to-[#FF704E] hover:from-[#F05834] hover:to-[#FF704E] text-white text-xs font-bold tracking-wide shadow-md hover:shadow-lg shadow-coral-500/20 hover:shadow-coral-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-white/20"
        >
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Play className="w-2.5 h-2.5 fill-white text-white translate-x-[0.5px]" />
          </div>
          <span>Start Focus</span>
        </Link>
      </div>
    </div>
  );
};
