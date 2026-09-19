import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { processPendingNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process any due notifications first so state is up to date
    await processPendingNotifications(user.id);

    const [notifications, unreadCount, pendingCount, profile] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: user.id,
          status: { in: ['SENT', 'PENDING'] },
        },
        include: {
          task: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: [
          { isRead: 'asc' },
          { createdAt: 'desc' },
        ],
        take: 30,
      }),
      prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
          status: 'SENT',
        },
      }),
      prisma.notification.count({
        where: {
          userId: user.id,
          status: 'PENDING',
        },
      }),
      prisma.profile.findUnique({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      pendingCount,
      settings: {
        taskRemindersEnabled: profile?.taskRemindersEnabled ?? true,
        browserNotificationsEnabled: profile?.browserNotificationsEnabled ?? true,
        timezone: profile?.timezone || 'Asia/Kolkata',
      },
    });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, id, taskRemindersEnabled, browserNotificationsEnabled, timezone } = body;

    if (action === 'mark_all_read') {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (action === 'mark_read' && id) {
      await prisma.notification.updateMany({
        where: {
          id,
          userId: user.id,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    if (action === 'update_settings') {
      const updatedProfile = await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          taskRemindersEnabled: taskRemindersEnabled ?? true,
          browserNotificationsEnabled: browserNotificationsEnabled ?? true,
          timezone: timezone || 'Asia/Kolkata',
        },
        update: {
          taskRemindersEnabled: taskRemindersEnabled !== undefined ? taskRemindersEnabled : undefined,
          browserNotificationsEnabled: browserNotificationsEnabled !== undefined ? browserNotificationsEnabled : undefined,
          timezone: timezone || undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification settings updated',
        settings: {
          taskRemindersEnabled: updatedProfile.taskRemindersEnabled,
          browserNotificationsEnabled: updatedProfile.browserNotificationsEnabled,
          timezone: updatedProfile.timezone,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
