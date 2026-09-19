import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { calculateUserStreak, getLevelInfo } from '@/lib/gamification';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentStreak } = await calculateUserStreak(user.id);
    const levelInfo = getLevelInfo(user.totalXp);

    const [allAchievements, userUnlocks, sessionStats, taskCount, completedChapters] = await Promise.all([
      prisma.achievement.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.userAchievement.findMany({ where: { userId: user.id } }),
      prisma.studySession.aggregate({
        where: { userId: user.id, completed: true },
        _count: { id: true },
        _sum: { durationMinutes: true },
      }),
      prisma.task.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      prisma.chapter.count({
        where: { subject: { userId: user.id }, status: 'COMPLETED' },
      }),
    ]);

    const unlockMap = new Map(userUnlocks.map((u) => [u.achievementId, u.unlockedAt]));
    const totalSessions = sessionStats._count.id || 0;
    const totalMinutes = sessionStats._sum.durationMinutes || 0;

    const enriched = allAchievements.map((ach) => {
      const isUnlocked = unlockMap.has(ach.id);
      const unlockedAt = unlockMap.get(ach.id) || null;

      let currentValue = 0;
      switch (ach.requirementType) {
        case 'FOCUS_SESSIONS':
          currentValue = totalSessions;
          break;
        case 'TOTAL_XP':
          currentValue = user.totalXp;
          break;
        case 'STREAK_DAYS':
          currentValue = currentStreak;
          break;
        case 'STUDY_MINUTES':
          currentValue = totalMinutes;
          break;
        case 'TASKS_COMPLETED':
          currentValue = taskCount;
          break;
        case 'CHAPTERS_COMPLETED':
          currentValue = completedChapters;
          break;
        default:
          currentValue = 0;
      }

      const progressPercent = isUnlocked
        ? 100
        : Math.min(100, Math.round((currentValue / ach.requirementValue) * 100));

      return {
        id: ach.id,
        code: ach.code,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        category: ach.category,
        xpReward: ach.xpReward,
        requirementType: ach.requirementType,
        requirementValue: ach.requirementValue,
        currentValue,
        isUnlocked,
        unlockedAt,
        progressPercent,
      };
    });

    const unlockedCount = enriched.filter((a) => a.isUnlocked).length;
    const totalCount = enriched.length;

    return NextResponse.json({
      achievements: enriched,
      stats: {
        unlockedCount,
        totalCount,
        completionPercent: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0,
        totalXp: user.totalXp,
        level: levelInfo.level,
      },
    });
  } catch (error) {
    console.error('Achievements API error:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
