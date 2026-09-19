import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { getLevelInfo, calculateUserStreak } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentStreak, longestStreak } = await calculateUserStreak(user.id);
    const levelInfo = getLevelInfo(user.totalXp);

    // Fetch user subjects with chapters
    const subjects = await prisma.subject.findMany({
      where: { userId: user.id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Calculate subject progress
    const subjectProgress = subjects.map((sub) => {
      const totalChapters = sub.chapters.length;
      const completedChapters = sub.chapters.filter((c) => c.status === 'COMPLETED' || c.progress === 100).length;
      const avgProgress =
        totalChapters > 0
          ? Math.round(sub.chapters.reduce((acc, c) => acc + c.progress, 0) / totalChapters)
          : 0;

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        color: sub.color,
        icon: sub.icon,
        totalChapters,
        completedChapters,
        progress: avgProgress,
      };
    });

    // Fetch today's tasks
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        dueDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        subject: true,
        chapter: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Fallback: If no tasks specifically due today, fetch latest active tasks
    let displayTasks = todayTasks;
    if (displayTasks.length === 0) {
      displayTasks = await prisma.task.findMany({
        where: {
          userId: user.id,
        },
        include: {
          subject: true,
          chapter: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    }

    // Weekly Study Analytics (past 7 days Mon - Sun)
    const now = new Date();
    const currentDayIndex = now.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklySessions = await prisma.studySession.findMany({
      where: {
        userId: user.id,
        completed: true,
        sessionDate: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        subject: true,
      },
    });

    // Calculate daily minutes for Mon - Sun
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyChartData = daysOfWeek.map((dayName, index) => {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + index);
      const targetDateStr = targetDate.toISOString().split('T')[0];
      const targetDayIndex = (index + 1) % 7; // Mon = 1, Tue = 2 ... Sun = 0

      const daySessions = weeklySessions.filter((s) => {
        const sDate = new Date(s.sessionDate);
        const sDateStr = sDate.toISOString().split('T')[0];
        return sDateStr === targetDateStr || sDate.getDay() === targetDayIndex;
      });

      const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      const hours = Number((totalMinutes / 60).toFixed(1));

      return {
        day: dayName,
        date: targetDateStr,
        minutes: totalMinutes,
        hours,
      };
    });

    const totalWeeklyMinutes = weeklySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const weeklyHours = Math.floor(totalWeeklyMinutes / 60);
    const weeklyMinsRemaining = totalWeeklyMinutes % 60;
    const weeklyStudyTimeFormatted = `${weeklyHours}h ${weeklyMinsRemaining > 0 ? `${weeklyMinsRemaining}m` : '0m'}`;

    // Subject distribution from all sessions
    const allSessions = await prisma.studySession.findMany({
      where: { userId: user.id, completed: true },
      include: { subject: true },
    });

    const totalAllMinutes = allSessions.reduce((acc, s) => acc + s.durationMinutes, 0) || 1;
    const subjectDistributionMap: Record<string, { name: string; color: string; minutes: number }> = {};

    allSessions.forEach((s) => {
      const subName = s.subject?.name || 'General';
      const subColor = s.subject?.color || '#8C7CFF';
      if (!subjectDistributionMap[subName]) {
        subjectDistributionMap[subName] = { name: subName, color: subColor, minutes: 0 };
      }
      subjectDistributionMap[subName].minutes += s.durationMinutes;
    });

    const subjectDistribution = Object.values(subjectDistributionMap).map((item) => ({
      name: item.name,
      color: item.color,
      minutes: item.minutes,
      percentage: Math.round((item.minutes / totalAllMinutes) * 100),
      hoursFormatted: `${(item.minutes / 60).toFixed(1)}h`,
    }));

    // Daily goal
    const goalHours = user.profile?.dailyStudyGoalHours || 4.0;
    const weeklyGoalHours = Math.round(goalHours * 6); // 6 study days target

    // Today's XP earned
    const todayDateStr = now.toISOString().split('T')[0];
    const todayProgress = await prisma.dailyProgress.findUnique({
      where: { userId_date: { userId: user.id, date: todayDateStr } },
    });
    const todayXp = todayProgress?.xpEarned || 120;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        totalXp: user.totalXp,
        currentStreak,
        longestStreak,
        levelInfo,
        profile: user.profile,
      },
      stats: {
        currentStreak,
        totalXp: user.totalXp,
        todayXp,
        level: levelInfo.level,
        levelInfo,
        weeklyStudyTimeFormatted,
        weeklyHoursFormatted: weeklyStudyTimeFormatted,
        totalWeeklyMinutes,
        weeklyGoalHours,
        weeklyStudyHours: Number((totalWeeklyMinutes / 60).toFixed(1)),
      },
      todayTasks: displayTasks.map((t) => ({
        id: t.id,
        title: t.title,
        scheduledTime: t.scheduledTime,
        duration: t.duration,
        priority: t.priority,
        status: t.status,
        subjectId: t.subjectId,
        subjectName: t.subject?.name,
        subjectColor: t.subject?.color || '#8C7CFF',
        subjectIcon: t.subject?.icon || 'book-open',
        chapterId: t.chapterId,
        chapterName: t.chapter?.name,
      })),
      todaysTasks: displayTasks.map((t) => ({
        id: t.id,
        title: t.title,
        scheduledTime: t.scheduledTime,
        duration: t.duration,
        priority: t.priority,
        status: t.status,
        subjectId: t.subjectId,
        subjectName: t.subject?.name,
        subjectColor: t.subject?.color || '#8C7CFF',
        subjectIcon: t.subject?.icon || 'book-open',
        chapterId: t.chapterId,
        chapterName: t.chapter?.name,
      })),
      subjectProgress,
      subjects: subjectProgress,
      weeklyChartData,
      weeklyHours: weeklyChartData,
      subjectDistribution,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
