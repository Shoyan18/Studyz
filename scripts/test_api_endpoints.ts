import prisma from '../src/lib/db';
import { createInAppNotification, processPendingNotifications } from '../src/lib/notifications';

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user');
    return;
  }

  console.log('Testing with user:', user.id);

  try {
    const notif = await createInAppNotification(user.id, {
      type: 'TASK_REMINDER',
      title: 'Time to study 📚',
      message: 'Physics • Newton\'s Laws of Motion Practice is scheduled now.',
      link: '/tasks',
    });
    console.log('Created notif:', notif);

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

    console.log('Fetched successfully:');
    console.log('Count:', notifications.length);
    console.log('Unread:', unreadCount);
    console.log('Pending:', pendingCount);
  } catch (e) {
    console.error('Error during test:', e);
  }
}

test().finally(() => prisma.$disconnect());
