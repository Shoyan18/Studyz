import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { calculateUserStreak } from '@/lib/gamification';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentStreak, longestStreak } = await calculateUserStreak(user.id);

    // Fetch all completed study sessions for user
    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id, completed: true },
      include: { subject: true, chapter: true },
      orderBy: { sessionDate: 'desc' },
    });

    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    // Today's minutes
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayMinutes = sessions
      .filter((s) => new Date(s.sessionDate).toISOString().split('T')[0] === todayStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    // Weekly minutes (this week Mon - Sun)
    const currentDayIndex = now.getDay();
    const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklySessions = sessions.filter((s) => new Date(s.sessionDate) >= startOfWeek);
    const weeklyMinutes = weeklySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    // Monthly minutes (this calendar month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlySessions = sessions.filter((s) => new Date(s.sessionDate) >= startOfMonth);
    const monthlyMinutes = monthlySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    // Daily breakdown for past 7 days
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyBarData = daysOfWeek.map((dayName, index) => {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + index);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const dayMins = sessions
        .filter((s) => new Date(s.sessionDate).toISOString().split('T')[0] === targetDateStr)
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      return {
        day: dayName,
        date: targetDateStr,
        minutes: dayMins,
        hours: Number((dayMins / 60).toFixed(1)),
      };
    });

    // Subject distribution
    const safeTotal = Math.max(1, totalMinutes);
    const subjectMap: Record<string, { name: string; color: string; minutes: number }> = {};

    sessions.forEach((s) => {
      const name = s.subject?.name || 'General';
      const color = s.subject?.color || '#8C7CFF';
      if (!subjectMap[name]) {
        subjectMap[name] = { name, color, minutes: 0 };
      }
      subjectMap[name].minutes += s.durationMinutes;
    });

    const subjectDistribution = Object.values(subjectMap).map((item) => ({
      name: item.name,
      color: item.color,
      minutes: item.minutes,
      percentage: Math.round((item.minutes / safeTotal) * 100),
      hours: Number((item.minutes / 60).toFixed(1)),
    }));

    // Task Analytics
    const [totalTasks, completedTasks] = await Promise.all([
      prisma.task.count({ where: { userId: user.id } }),
      prisma.task.count({ where: { userId: user.id, status: 'COMPLETED' } }),
    ]);

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Recent XP Transactions
    const recentXp = await prisma.xPTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    return NextResponse.json({
      overview: {
        totalMinutes,
        totalHoursFormatted: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        todayMinutes,
        todayHoursFormatted: `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`,
        weeklyMinutes,
        weeklyHoursFormatted: `${Math.floor(weeklyMinutes / 60)}h ${weeklyMinutes % 60}m`,
        monthlyMinutes,
        monthlyHoursFormatted: `${Math.floor(monthlyMinutes / 60)}h ${monthlyMinutes % 60}m`,
        currentStreak,
        longestStreak,
        totalSessions: sessions.length,
        totalTasks,
        completedTasks,
        taskCompletionRate,
        totalXp: user.totalXp,
      },
      weeklyBarData,
      subjectDistribution,
      recentSessions: sessions.slice(0, 10).map((s) => ({
        id: s.id,
        durationMinutes: s.durationMinutes,
        xpEarned: s.xpEarned,
        sessionDate: s.sessionDate,
        subjectName: s.subject?.name || 'General Study',
        subjectColor: s.subject?.color || '#8C7CFF',
        chapterName: s.chapter?.name,
      })),
      recentXp,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
