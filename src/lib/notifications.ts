import prisma from './db';

/**
 * Parses user input date and time strings with a timezone offset
 * to compute the exact UTC Date for notification delivery.
 */
export function computeScheduledNotificationTimestamp(
  dateInput: Date | string,
  timeInput?: string | null,
  timezone: string = 'Asia/Kolkata'
): Date | null {
  try {
    if (!dateInput) return null;

    let baseDate: Date;
    if (typeof dateInput === 'string') {
      // Handles 'YYYY-MM-DD' or ISO strings
      const parts = dateInput.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        baseDate = new Date(year, month, day);
      } else {
        baseDate = new Date(dateInput);
      }
    } else {
      baseDate = new Date(dateInput);
    }

    if (isNaN(baseDate.getTime())) return null;

    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');

    let hours = 9; // Default 9:00 AM if no time specified
    let minutes = 0;

    if (timeInput && timeInput.trim()) {
      const cleanTime = timeInput.trim().toUpperCase();
      
      // Match "7:30 PM", "07:30 PM", "19:30", "7:30", "5:00 PM – 6:30 PM" (takes first)
      const rangeMatch = cleanTime.split(/[-–—]/)[0].trim();
      const match12 = rangeMatch.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      const matchSimple = rangeMatch.match(/(\d{1,2})\s*(AM|PM)/i);

      if (match12) {
        let h = parseInt(match12[1], 10);
        const m = parseInt(match12[2], 10);
        const meridian = match12[3] ? match12[3].toUpperCase() : null;

        if (meridian === 'PM' && h < 12) h += 12;
        if (meridian === 'AM' && h === 12) h = 0;

        hours = Math.min(23, Math.max(0, h));
        minutes = Math.min(59, Math.max(0, m));
      } else if (matchSimple) {
        let h = parseInt(matchSimple[1], 10);
        const meridian = matchSimple[2].toUpperCase();
        if (meridian === 'PM' && h < 12) h += 12;
        if (meridian === 'AM' && h === 12) h = 0;
        hours = Math.min(23, Math.max(0, h));
        minutes = 0;
      }
    }

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const targetLocalISO = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00`;

    // Accurate timezone conversion using Intl.DateTimeFormat
    // We construct the target local time and calculate the exact UTC equivalent
    try {
      const localDateInTz = new Date(
        new Date(targetLocalISO).toLocaleString('en-US', { timeZone: timezone })
      );
      const localDateStandard = new Date(targetLocalISO);
      const diffMs = localDateStandard.getTime() - localDateInTz.getTime();
      
      const exactUtcDate = new Date(localDateStandard.getTime() + diffMs);
      return exactUtcDate;
    } catch {
      // Fallback to local time conversion if timezone string is invalid
      return new Date(targetLocalISO);
    }
  } catch (err) {
    console.error('Error computing notification timestamp:', err);
    return null;
  }
}

/**
 * Creates or updates a scheduled notification for a task.
 */
export async function scheduleTaskNotification(
  taskId: string,
  userId: string,
  customTimezone?: string
) {
  try {
    // Fetch task with subject and user profile
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        subject: true,
        user: {
          include: { profile: true },
        },
      },
    });

    if (!task) return null;

    // First cancel any existing PENDING notifications for this task to avoid duplicates
    await prisma.notification.updateMany({
      where: {
        taskId,
        userId,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    // If task is completed or notifications are disabled for this task, do not schedule
    if (task.status === 'COMPLETED' || !task.notificationEnabled) {
      return null;
    }

    const userTimezone = customTimezone || task.user?.profile?.timezone || task.timezone || 'Asia/Kolkata';

    const scheduledDate = computeScheduledNotificationTimestamp(
      task.dueDate,
      task.scheduledTime,
      userTimezone
    );

    if (!scheduledDate) return null;

    // Update task's scheduledNotificationAt
    await prisma.task.update({
      where: { id: taskId },
      data: {
        scheduledNotificationAt: scheduledDate,
        timezone: userTimezone,
        notificationSent: false,
      },
    });

    const now = new Date();
    // Only schedule if time is in the future (with 1-minute grace margin)
    if (scheduledDate.getTime() > now.getTime() - 60000) {
      const subjectName = task.subject ? task.subject.name : '';
      const notificationTitle = 'Time to study 📚';
      const notificationMessage = subjectName
        ? `${subjectName} • ${task.title}`
        : `${task.title} is scheduled now.`;

      const notification = await prisma.notification.create({
        data: {
          userId,
          taskId,
          type: 'TASK_REMINDER',
          title: notificationTitle,
          message: notificationMessage,
          link: `/tasks?taskId=${task.id}`,
          scheduledAt: scheduledDate,
          status: 'PENDING',
          channel: 'ALL',
        },
      });

      return notification;
    }

    return null;
  } catch (error) {
    console.error('Error scheduling task notification:', error);
    return null;
  }
}

/**
 * Cancels all pending notifications for a task.
 */
export async function cancelTaskNotification(taskId: string, userId: string) {
  try {
    return await prisma.notification.updateMany({
      where: {
        taskId,
        userId,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });
  } catch (error) {
    console.error('Error cancelling task notification:', error);
    return null;
  }
}

/**
 * Processes all pending notifications that are due now.
 * Returns the list of newly triggered notifications.
 */
export async function processPendingNotifications(userId?: string) {
  try {
    const now = new Date();

    const whereClause: Record<string, unknown> = {
      status: 'PENDING',
      scheduledAt: { lte: now },
    };

    if (userId) {
      whereClause.userId = userId;
    }

    const pendingNotifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        task: true,
      },
      take: 50,
    });

    const triggeredNotifications = [];

    for (const notif of pendingNotifications) {
      // Check if task exists and is not completed
      if (notif.task && notif.task.status === 'COMPLETED') {
        // Task completed early, cancel this notification
        await prisma.notification.update({
          where: { id: notif.id },
          data: { status: 'CANCELLED' },
        });
        continue;
      }

      // Mark as SENT
      const updated = await prisma.notification.update({
        where: { id: notif.id },
        data: {
          status: 'SENT',
          sentAt: now,
        },
      });

      if (notif.taskId) {
        await prisma.task.update({
          where: { id: notif.taskId },
          data: { notificationSent: true },
        });
      }

      triggeredNotifications.push(updated);
    }

    return triggeredNotifications;
  } catch (error) {
    console.error('Error processing pending notifications:', error);
    return [];
  }
}

/**
 * Creates an in-app notification for a user (e.g. Task completed, Streak, Achievement).
 */
export async function createInAppNotification(
  userId: string,
  data: {
    type: 'TASK_REMINDER' | 'TASK_COMPLETED' | 'TASK_MISSED' | 'ACHIEVEMENT' | 'SYSTEM';
    title: string;
    message: string;
    link?: string;
    taskId?: string;
  }
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        taskId: data.taskId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || '/dashboard',
        status: 'SENT',
        sentAt: new Date(),
        channel: 'IN_APP',
      },
    });
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    return null;
  }
}
