'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeeklyStudyChart } from '@/components/dashboard/WeeklyStudyChart';
import { SubjectDonutChart } from '@/components/dashboard/SubjectDonutChart';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  Clock,
  Flame,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalMinutes: number;
    totalHoursFormatted: string;
    todayMinutes: number;
    todayHoursFormatted: string;
    weeklyMinutes: number;
    weeklyHoursFormatted: string;
    monthlyMinutes: number;
    monthlyHoursFormatted: string;
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
    totalTasks: number;
    completedTasks: number;
    taskCompletionRate: number;
    totalXp: number;
  };
  weeklyBarData: Array<{ day: string; date: string; minutes: number; hours: number }>;
  subjectDistribution: Array<{
    name: string;
    color: string;
    minutes: number;
    percentage: number;
    hours: number;
  }>;
  recentSessions: Array<{
    id: string;
    durationMinutes: number;
    xpEarned: number;
    sessionDate: string;
    subjectName: string;
    subjectColor: string;
    chapterName?: string;
  }>;
  recentXp: Array<{
    id: string;
    amount: number;
    type: string;
    description?: string;
    createdAt: string;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[#F3ECE7] dark:bg-[#252832] rounded-3xl" />
            ))}
          </div>
          <div className="h-96 bg-[#F3ECE7] dark:bg-[#252832] rounded-3xl" />
        </div>
      </AppLayout>
    );
  }

  const { overview, weeklyBarData, subjectDistribution, recentSessions, recentXp } = data;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Study Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 font-medium mt-1">
            Track your focus duration, subject balance, and productivity momentum.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Today's Focus */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-5 md:p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF0EB] dark:bg-coral-950/60 flex items-center justify-center text-coral-500 dark:text-coral-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-400 dark:text-gray-400">Today</p>
                <h3 className="text-2xl font-black text-charcoal-900 dark:text-white">{overview.todayHoursFormatted}</h3>
              </div>
            </div>
          </div>

          {/* This Week */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-5 md:p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#F0EDFF] dark:bg-lavender-950/60 flex items-center justify-center text-lavender-500 dark:text-lavender-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-400 dark:text-gray-400">This Week</p>
                <h3 className="text-2xl font-black text-charcoal-900 dark:text-white">{overview.weeklyHoursFormatted}</h3>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-5 md:p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF5EB] dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
                <Flame className="w-5 h-5 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-400 dark:text-gray-400">Streak (Best {overview.longestStreak}d)</p>
                <h3 className="text-2xl font-black text-charcoal-900 dark:text-white">{overview.currentStreak} Days</h3>
              </div>
            </div>
          </div>

          {/* Task Completion Rate */}
          <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-3xl p-5 md:p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 flex items-center justify-center text-mint-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal-400 dark:text-gray-400">Task Completion</p>
                <h3 className="text-2xl font-black text-charcoal-900 dark:text-white">{overview.taskCompletionRate}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <WeeklyStudyChart data={weeklyBarData} />
          </div>

          <div className="lg:col-span-5">
            <SubjectDonutChart
              data={subjectDistribution}
              totalFormatted={overview.weeklyHoursFormatted}
            />
          </div>
        </div>

        {/* Subject Breakdown Detailed Bars */}
        <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-8 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-charcoal-900 dark:text-white">Subject Time Distribution</h2>
              <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-0.5">Total focus hours logged per subject</p>
            </div>
            <span className="text-xs font-black text-charcoal-700 dark:text-gray-300 bg-[#FCFAF8] dark:bg-[#212328] px-3 py-1.5 rounded-xl border border-[#EFE7E1] dark:border-[#2e313a]">
              Total {overview.totalHoursFormatted}
            </span>
          </div>

          <div className="space-y-4">
            {subjectDistribution.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-charcoal-800 dark:text-white">{item.name}</span>
                  <span className="text-charcoal-500 dark:text-gray-400">
                    {item.hours} hrs ({item.percentage}%)
                  </span>
                </div>
                <ProgressBar
                  value={item.percentage}
                  variant="custom"
                  color={item.color}
                  height="md"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Study Sessions Table */}
        <div className="bg-white dark:bg-[#1a1b20] border border-[#F3ECE7] dark:border-[#2e313a] rounded-4xl p-6 sm:p-8 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-charcoal-900 dark:text-white">Recent Focus Sessions</h2>
              <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-0.5">Detailed history of completed study sessions</p>
            </div>
            <span className="text-xs font-bold text-coral-600 dark:text-coral-400">
              {recentSessions.length} sessions logged
            </span>
          </div>

          {recentSessions.length === 0 ? (
            <p className="text-xs text-charcoal-400 dark:text-gray-400 py-6 text-center">No focus sessions completed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F5EBE4] dark:border-[#2e313a] text-charcoal-400 dark:text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Subject / Chapter</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3 text-right">XP Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F2ED] dark:divide-[#2e313a]">
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-[#FAF7F4] dark:hover:bg-[#212328] transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: session.subjectColor }}
                          />
                          <span className="font-bold text-charcoal-900 dark:text-white">{session.subjectName}</span>
                          {session.chapterName && (
                            <span className="text-charcoal-400 dark:text-gray-400 font-medium"> – {session.chapterName}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 text-charcoal-500 dark:text-gray-400 font-medium">
                        {new Date(session.sessionDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 font-bold text-charcoal-800 dark:text-gray-200">
                        {session.durationMinutes} mins
                      </td>
                      <td className="py-3.5 text-right font-black text-amber-600 dark:text-amber-400">
                        +{session.xpEarned} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
