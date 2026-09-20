'use client';

import React from 'react';
import { Flame, Zap, Sparkles, Clock, ArrowUp } from 'lucide-react';
import { LevelInfo } from '@/types';

interface QuickStatsProps {
  currentStreak: number;
  totalXp: number;
  todayXp: number;
  levelInfo?: LevelInfo;
  weeklyStudyTimeFormatted: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  currentStreak,
  totalXp,
  todayXp,
  levelInfo,
  weeklyStudyTimeFormatted,
}) => {
  const level = levelInfo?.level ?? 1;
  const currentLevelXp = levelInfo?.currentLevelXp ?? 0;
  const nextLevelTotalXp = levelInfo?.nextLevelTotalXp ?? 100;
  const progressPercent = levelInfo?.progressPercent ?? 0;
  const levelTitle = levelInfo?.title || 'Curious Novice';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-3.5 mb-4">
      {/* 1. Day Streak Card */}
      <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft hover:border-[#EBD9CE] dark:hover:border-[#404452] transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF0EB] dark:bg-coral-950/60 flex items-center justify-center text-coral-500 shrink-0 shadow-inner">
            <Flame className="w-4 h-4 fill-coral-500 text-coral-500 animate-pulse-subtle" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-extrabold text-charcoal-900 dark:text-white leading-tight">
              {currentStreak}
            </div>
            <div className="text-[11px] font-semibold text-charcoal-500 dark:text-gray-400">Day Streak</div>
          </div>
        </div>
        <div className="mt-2.5 pt-1.5 border-t border-[#F8F2ED] dark:border-[#2a2c34] text-[11px] font-medium text-coral-500 flex items-center gap-1">
          <span>Keep it up!</span>
        </div>
      </div>

      {/* 2. Current Level Card */}
      <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft hover:border-[#EBD9CE] dark:hover:border-[#404452] transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F0EDFF] dark:bg-lavender-950/60 flex items-center justify-center text-lavender-500 shrink-0 shadow-inner">
            <Zap className="w-4 h-4 fill-lavender-500 text-lavender-500" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-extrabold text-charcoal-900 dark:text-white leading-tight">
              Level {level}
            </div>
            <div className="text-[11px] font-semibold text-charcoal-500 dark:text-gray-400">
              {levelTitle}
            </div>
          </div>
        </div>
        <div className="mt-2.5">
          <div className="w-full bg-[#F0EDFF] dark:bg-[#252832] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#B4A6FF] to-[#8C7CFF] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-1 text-[9px] font-semibold text-charcoal-400 dark:text-gray-400 text-right">
            {totalXp.toLocaleString()} / {nextLevelTotalXp.toLocaleString()} XP
          </div>
        </div>
      </div>

      {/* 3. Total XP Card */}
      <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft hover:border-[#EBD9CE] dark:hover:border-[#404452] transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] dark:bg-amber-950/60 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
            <Sparkles className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <div className="text-lg md:text-xl font-extrabold text-charcoal-900 dark:text-white leading-tight">
              {totalXp.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-charcoal-500 dark:text-gray-400">Total XP</div>
          </div>
        </div>
        <div className="mt-2.5 pt-1.5 border-t border-[#F8F2ED] dark:border-[#2a2c34] text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <ArrowUp className="w-3 h-3" />
          <span>{todayXp} today</span>
        </div>
      </div>

      {/* 4. Weekly Study Time Card */}
      <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-2xl p-3.5 md:p-4 shadow-soft hover:border-[#EBD9CE] dark:hover:border-[#404452] transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F0EDFF] dark:bg-lavender-950/60 flex items-center justify-center text-lavender-500 shrink-0 shadow-inner">
            <Clock className="w-4 h-4 text-lavender-500" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold text-charcoal-900 dark:text-white leading-tight">
              {weeklyStudyTimeFormatted}
            </div>
            <div className="text-xs font-semibold text-charcoal-500 dark:text-gray-400">Study Time (This Week)</div>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-[#F8F2ED] dark:border-[#2a2c34] text-xs font-semibold text-lavender-600 dark:text-lavender-400 flex items-center gap-1">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>+2h 45m vs last week</span>
        </div>
      </div>
    </div>
  );
};
