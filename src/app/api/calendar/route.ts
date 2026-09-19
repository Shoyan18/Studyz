import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get('month'); // e.g. "2026-08"

    let startDate: Date;
    let endDate: Date;

    if (monthStr) {
      const [year, month] = monthStr.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const [tasks, sessions] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId: user.id,
          dueDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          subject: true,
          chapter: true,
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.studySession.findMany({
        where: {
          userId: user.id,
          completed: true,
          sessionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          subject: true,
          chapter: true,
        },
        orderBy: { sessionDate: 'asc' },
      }),
    ]);

    return NextResponse.json({
      tasks: tasks.map((t) => ({
        id: t.id,
        type: 'task',
        title: t.title,
        date: t.dueDate.toISOString().split('T')[0],
        scheduledTime: t.scheduledTime,
        duration: t.duration,
        priority: t.priority,
        status: t.status,
        subjectName: t.subject?.name,
        subjectColor: t.subject?.color || '#8C7CFF',
      })),
      sessions: sessions.map((s) => ({
        id: s.id,
        type: 'session',
        title: `Focused ${s.durationMinutes}m`,
        date: new Date(s.sessionDate).toISOString().split('T')[0],
        duration: s.durationMinutes,
        xpEarned: s.xpEarned,
        subjectName: s.subject?.name || 'General',
        subjectColor: s.subject?.color || '#8C7CFF',
        chapterName: s.chapter?.name,
      })),
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}
