'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';

export const DashboardAchievements: React.FC = () => {
  const recentBadges = [
    {
      id: 'ach-streak-7',
      name: '7-Day Streak',
      desc: 'Consistent daily focus',
      emoji: '🔥',
      bg: 'bg-[#FFF0EB] dark:bg-coral-950/80 border-[#FFD6CB] dark:border-coral-800/60',
    },
    {
      id: 'ach-task-10',
      name: 'Task Slayer',
      desc: 'Completed 10 tasks',
      emoji: '🎯',
      bg: 'bg-[#F0EDFF] dark:bg-lavender-950/80 border-[#DFD7FE] dark:border-lavender-800/60',
    },
    {
      id: 'ach-focus-1',
      name: 'Deep Worker',
      desc: 'Finished 50m session',
      emoji: '⚡',
      bg: 'bg-[#FFF8E6] dark:bg-amber-950/80 border-[#FDE68A] dark:border-amber-800/60',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <h2 className="text-sm font-bold text-charcoal-900 dark:text-white tracking-tight">Achievements</h2>
        </div>
        <Link
          href="/achievements"
          className="text-xs font-bold text-charcoal-500 dark:text-gray-400 hover:text-coral-600 dark:hover:text-coral-400 transition-colors px-2 py-1 rounded-lg hover:bg-[#FFF5F2] dark:hover:bg-[#252832]"
        >
          View all
        </Link>
      </div>

      {/* Mini Badges List */}
      <div className="space-y-2">
        {recentBadges.map((badge) => (
          <Link
            key={badge.id}
            href="/achievements"
            className="flex items-center justify-between p-2 rounded-xl border border-[#F3ECE7] dark:border-[#2e313a] hover:border-[#EBD9CE] dark:hover:border-[#404452] hover:bg-[#FAF7F4] dark:hover:bg-[#212328] transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm shrink-0 ${badge.bg}`}
              >
                <span>{badge.emoji}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal-900 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors leading-tight">
                  {badge.name}
                </p>
                <p className="text-[11px] text-charcoal-400 dark:text-gray-400 font-medium">{badge.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-charcoal-300 dark:text-gray-500 group-hover:text-coral-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
};
