'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { TodaysPlan } from '@/components/dashboard/TodaysPlan';
import { SubjectProgressList } from '@/components/dashboard/SubjectProgressList';
import { FocusHeroCard } from '@/components/dashboard/FocusHeroCard';
import { WeeklyStudyChart } from '@/components/dashboard/WeeklyStudyChart';
import { SubjectDonutChart } from '@/components/dashboard/SubjectDonutChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardAchievements } from '@/components/dashboard/DashboardAchievements';
import { MotivationalBanner } from '@/components/dashboard/MotivationalBanner';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import { Task, LevelInfo } from '@/types';

interface SubjectSummary {
  id: string;
  name: string;
  code?: string | null;
  color: string;
  icon: string;
  progress: number;
}

interface DashboardData {
  user: {
    name: string;
    totalXp: number;
    currentStreak: number;
    levelInfo: LevelInfo;
  };
  stats: {
    todayMinutes: number;
    weeklyMinutes: number;
    weeklyHoursFormatted: string;
    todayXp: number;
  };
  todaysTasks: Task[];
  subjects: SubjectSummary[];
  weeklyHours: Array<{ day: string; date: string; minutes: number; hours: number }>;
  subjectDistribution: Array<{ name: string; color: string; minutes: number; percentage: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';

    // Optimistically update UI
    if (data) {
      setData({
        ...data,
        todaysTasks: data.todaysTasks.map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t
        ),
      });
    }

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      // Refresh telemetry
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update task:', err);
      fetchDashboardData();
    }
  };

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[#F3ECE7] rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-80 bg-[#F3ECE7] rounded-3xl" />
            <div className="lg:col-span-4 h-80 bg-[#F3ECE7] rounded-3xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* 1. Top Compact Stats Row */}
      <QuickStats
        currentStreak={data.user.currentStreak}
        totalXp={data.user.totalXp}
        todayXp={data.stats.todayXp}
        levelInfo={data.user.levelInfo}
        weeklyStudyTimeFormatted={data.stats.weeklyHoursFormatted}
      />

      {/* 2. Main Dashboard Multi-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left / Larger Area (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Top Row: Today's Plan + Subject Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <TodaysPlan
              tasks={data.todaysTasks}
              onToggleComplete={handleToggleTask}
              onOpenAddTask={() => setIsAddTaskOpen(true)}
            />

            <SubjectProgressList subjects={data.subjects} />
          </div>

          {/* Bottom Analytics Row: Study Time Chart + Subject Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <WeeklyStudyChart data={data.weeklyHours} />

            <SubjectDonutChart
              data={data.subjectDistribution}
              totalFormatted={data.stats.weeklyHoursFormatted}
            />
          </div>
        </div>

        {/* Right / Smaller Area (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Focus Now */}
          <FocusHeroCard />

          {/* Quick Actions */}
          <QuickActions onOpenAddTask={() => setIsAddTaskOpen(true)} />

          {/* Achievements Preview */}
          <DashboardAchievements />
        </div>
      </div>

      {/* 3. Motivational Banner */}
      <MotivationalBanner />

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onTaskCreated={fetchDashboardData}
      />
    </AppLayout>
  );
}
