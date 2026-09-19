'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Trophy, Sparkles, Lock, CheckCircle2, Flame, Star } from 'lucide-react';
import { Achievement } from '@/types';
import confetti from 'canvas-confetti';
import { soundManager } from '@/lib/sound';

interface AchievementStats {
  unlockedCount: number;
  totalCount: number;
  completionPercent: number;
  totalXp: number;
  level: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    fetch('/api/achievements')
      .then((res) => res.json())
      .then((data) => {
        setAchievements(data.achievements || []);
        setStats(data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = achievements.filter((a) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'UNLOCKED') return a.isUnlocked;
    if (filterCategory === 'LOCKED') return !a.isUnlocked;
    const cat = (a.category || '').toUpperCase();
    if (filterCategory === 'STREAK' || filterCategory === 'STREAKS') return cat === 'STREAK';
    if (filterCategory === 'CHAPTERS' || filterCategory === 'MASTERY') return cat === 'CHAPTERS';
    return cat === filterCategory;
  });

  const handleBadgeClick = (ach: Achievement) => {
    if (ach.isUnlocked) {
      soundManager.playComplete();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF704E', '#8C7CFF', '#FDBA74', '#34D399'],
      });
    }
  };

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
      case '⚡':
        return <span className="text-2xl">⚡</span>;
      case 'flame':
      case '🔥':
        return <span className="text-2xl">🔥</span>;
      case 'hourglass':
      case 'clock':
      case '⏱️':
        return <span className="text-2xl">⏱️</span>;
      case 'book-open':
      case '📚':
        return <span className="text-2xl">📚</span>;
      case 'award':
      case 'trophy':
      case '🏆':
        return <span className="text-2xl">🏆</span>;
      case 'check-circle-2':
      case 'target':
      case '🎯':
        return <span className="text-2xl">🎯</span>;
      case 'star':
      case '⭐':
        return <span className="text-2xl">⭐</span>;
      case 'crown':
      case '👑':
        return <span className="text-2xl">👑</span>;
      case 'rocket':
      case '🚀':
        return <span className="text-2xl">🚀</span>;
      default:
        return <span className="text-2xl">{iconName.length <= 4 ? iconName : '🏆'}</span>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-[#FFF5F1] via-[#FFF9F6] to-[#F5F2FF] dark:from-[#1a1b20] dark:via-[#212328] dark:to-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-8 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-coral-400 flex items-center justify-center text-white shadow-coral-glow shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight">
                Achievements & Badges
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 font-medium mt-1">
                Unlock honors as you focus, maintain streaks, and master chapters.
              </p>
            </div>
          </div>

          {stats && (
            <div className="flex items-center gap-4 bg-white dark:bg-[#1a1b20] p-4 rounded-3xl border border-[#F3ECE7] dark:border-[#2e313a] shadow-sm">
              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal-400 dark:text-gray-400">Unlocked</span>
                <p className="text-lg font-black text-charcoal-900 dark:text-white">
                  {stats.unlockedCount} / {stats.totalCount}
                </p>
              </div>
              <div className="w-24">
                <ProgressBar value={stats.completionPercent} variant="amber" height="sm" />
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1 block text-right">
                  {stats.completionPercent}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { label: 'All Badges', value: 'ALL' },
            { label: 'Unlocked 🏆', value: 'UNLOCKED' },
            { label: 'In Progress ⏳', value: 'LOCKED' },
            { label: 'Streaks 🔥', value: 'STREAK' },
            { label: 'Focus ⏱️', value: 'FOCUS' },
            { label: 'Chapters 📚', value: 'CHAPTERS' },
            { label: 'Tasks ✅', value: 'TASKS' },
            { label: 'XP & Level ⚡', value: 'XP' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterCategory(tab.value)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                filterCategory === tab.value
                  ? 'btn-coral text-white shadow-coral-glow'
                  : 'bg-white dark:bg-[#1a1b20] text-charcoal-600 dark:text-gray-300 border border-[#EFE7E1] dark:border-[#2e313a] hover:border-coral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-[#F3ECE7] dark:bg-[#252832] rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ach) => {
              return (
                <div
                  key={ach.id}
                  onClick={() => handleBadgeClick(ach)}
                  className={`border rounded-4xl p-6 shadow-soft transition-all flex flex-col justify-between ${
                    ach.isUnlocked
                      ? 'border-[#FFD9CE] dark:border-coral-900/60 ring-1 ring-coral-200/50 dark:ring-coral-900/40 bg-gradient-to-b from-white to-[#FFF9F6] dark:from-[#1a1b20] dark:to-[#212328] cursor-pointer hover:scale-[1.01]'
                      : 'bg-white dark:bg-[#1a1b20] border-[#F3ECE7] dark:border-[#2e313a] opacity-80'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon + XP Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl shadow-inner ${
                          ach.isUnlocked
                            ? 'bg-gradient-to-tr from-[#FFF0EB] to-[#FFF8E6] dark:from-coral-950/40 dark:to-amber-950/40 border border-[#FFD6CB] dark:border-coral-900/40'
                            : 'bg-[#F9F6F3] dark:bg-[#252832] border border-[#EFE7E1] dark:border-[#2e313a] grayscale'
                        }`}
                      >
                        {renderBadgeIcon(ach.icon)}
                      </div>

                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-[#FFF8E6] dark:bg-amber-950/60 border border-[#FDE68A] dark:border-amber-900/60 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +{ach.xpReward} XP
                      </span>
                    </div>

                    <h2 className="text-base font-extrabold text-charcoal-900 dark:text-white flex items-center gap-1.5">
                      <span>{ach.name}</span>
                      {ach.isUnlocked && (
                        <CheckCircle2 className="w-4 h-4 text-mint-500 fill-mint-100 dark:fill-emerald-950" />
                      )}
                    </h2>
                    <p className="text-xs text-charcoal-500 dark:text-gray-400 font-medium mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  {/* Footer Status */}
                  <div className="mt-5 pt-4 border-t border-[#F8F2ED] dark:border-[#2e313a]">
                    {ach.isUnlocked ? (
                      <div className="flex items-center justify-between text-xs font-bold text-coral-600 dark:text-coral-400">
                        <span>Unlocked</span>
                        <span className="text-[11px] font-medium text-charcoal-400 dark:text-gray-400">
                          {ach.unlockedAt
                            ? new Date(ach.unlockedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Completed'}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-charcoal-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3 text-charcoal-400 dark:text-gray-500" />
                            Progress
                          </span>
                          <span>
                            {ach.currentValue} / {ach.requirementValue}
                          </span>
                        </div>
                        <ProgressBar
                          value={ach.progressPercent}
                          variant="amber"
                          height="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
