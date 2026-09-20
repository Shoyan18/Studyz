'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ChevronRight, Flame, Sparkles, Zap, Clock, BookOpen, Award } from 'lucide-react';

interface UnlockedBadge {
  id: string;
  code?: string;
  name: string;
  description: string;
  icon?: string;
}

interface DashboardAchievementsProps {
  achievements?: UnlockedBadge[];
}

export const DashboardAchievements: React.FC<DashboardAchievementsProps> = ({
  achievements = [],
}) => {
  const getBadgeIcon = (icon?: string) => {
    switch (icon) {
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-coral-500" />;
      case 'sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'zap':
        return <Zap className="w-3.5 h-3.5 text-lavender-500" />;
      case 'clock':
      case 'hourglass':
        return <Clock className="w-3.5 h-3.5 text-lavender-500" />;
      case 'book-open':
        return <BookOpen className="w-3.5 h-3.5 text-coral-500" />;
      default:
        return <Award className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getBadgeBg = (index: number) => {
    const backgrounds = [
      'bg-[#FFF0EB] dark:bg-coral-950/80 border-[#FFD6CB] dark:border-coral-800/60',
      'bg-[#F0EDFF] dark:bg-lavender-950/80 border-[#DFD7FE] dark:border-lavender-800/60',
      'bg-[#FFF8E6] dark:bg-amber-950/80 border-[#FDE68A] dark:border-amber-800/60',
    ];
    return backgrounds[index % backgrounds.length];
  };

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
      {achievements.length > 0 ? (
        <div className="space-y-2">
          {achievements.slice(0, 3).map((badge, idx) => (
            <Link
              key={badge.id}
              href="/achievements"
              className="flex items-center justify-between p-2 rounded-xl border border-[#F3ECE7] dark:border-[#2e313a] hover:border-[#EBD9CE] dark:hover:border-[#404452] hover:bg-[#FAF7F4] dark:hover:bg-[#212328] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm shrink-0 ${getBadgeBg(
                    idx
                  )}`}
                >
                  {getBadgeIcon(badge.icon)}
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900 dark:text-white group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors leading-tight">
                    {badge.name}
                  </p>
                  <p className="text-[11px] text-charcoal-400 dark:text-gray-400 font-medium line-clamp-1">
                    {badge.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-charcoal-300 dark:text-gray-500 group-hover:text-coral-500 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center bg-[#FAF6F3] dark:bg-[#212328] rounded-xl border border-dashed border-[#EAE0D8] dark:border-[#2e313a] p-3">
          <p className="text-xs font-semibold text-charcoal-700 dark:text-gray-300">No achievements unlocked yet</p>
          <p className="text-[11px] text-charcoal-400 dark:text-gray-400 mt-0.5">
            Complete focus sessions and tasks to earn badges!
          </p>
        </div>
      )}
    </div>
  );
};
