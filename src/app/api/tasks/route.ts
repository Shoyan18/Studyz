import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { scheduleTaskNotification } from '@/lib/notifications';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const subjectId = searchParams.get('subjectId');
    const filter = searchParams.get('filter'); // 'today', 'upcoming', 'all'

    const where: Record<string, unknown> = {
      userId: user.id,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (subjectId && subjectId !== 'ALL') {
      where.subjectId = subjectId;
    }

    if (filter === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        subject: true,
        chapter: true,
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      subjectId,
      chapterId,
      dueDate,
      scheduledTime,
      duration,
      priority,
      description,
      timezone,
      notificationEnabled,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const userTimezone = timezone || user.profile?.timezone || 'Asia/Kolkata';

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: title.trim(),
        subjectId: subjectId || null,
        chapterId: chapterId || null,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        scheduledTime: scheduledTime || null,
        duration: Number(duration) || 45,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        description: description || null,
        timezone: userTimezone,
        notificationEnabled: notificationEnabled !== undefined ? Boolean(notificationEnabled) : true,
      },
      include: {
        subject: true,
        chapter: true,
      },
    });

    // Schedule notification if task has a scheduled time
    let scheduledNotification = null;
    if (task.notificationEnabled && (task.scheduledTime || task.dueDate)) {
      scheduledNotification = await scheduleTaskNotification(task.id, user.id, userTimezone);
    }

    return NextResponse.json({
      success: true,
      task,
      scheduledNotification,
    });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
