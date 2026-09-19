import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subjects = await prisma.subject.findMany({
      where: { userId: user.id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
        },
        studySessions: {
          where: { completed: true },
          select: { durationMinutes: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    const enriched = subjects.map((sub) => {
      const totalChapters = sub.chapters.length;
      const completedChapters = sub.chapters.filter((c) => c.status === 'COMPLETED' || c.progress === 100).length;
      const avgProgress =
        totalChapters > 0
          ? Math.round(sub.chapters.reduce((acc, c) => acc + c.progress, 0) / totalChapters)
          : 0;
      const totalMinutes = sub.studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        color: sub.color,
        icon: sub.icon,
        order: sub.order,
        totalChapters,
        completedChapters,
        progress: avgProgress,
        studyMinutes: totalMinutes,
        studyHoursFormatted: `${(totalMinutes / 60).toFixed(1)}h`,
        chapters: sub.chapters,
      };
    });

    return NextResponse.json({ subjects: enriched });
  } catch (error) {
    console.error('Subjects GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, code, color, icon } = body;

    if (!name) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
    }

    const currentCount = await prisma.subject.count({ where: { userId: user.id } });

    const subject = await prisma.subject.create({
      data: {
        userId: user.id,
        name: name.trim(),
        code: code?.trim() || name.substring(0, 4).toUpperCase(),
        color: color || '#8C7CFF',
        icon: icon || 'book-open',
        order: currentCount + 1,
      },
      include: {
        chapters: true,
      },
    });

    return NextResponse.json({ success: true, subject });
  } catch (error) {
    console.error('Subjects POST error:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
