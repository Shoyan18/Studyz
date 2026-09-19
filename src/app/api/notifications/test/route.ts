import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createInAppNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notification = await createInAppNotification(user.id, {
      type: 'TASK_REMINDER',
      title: 'Time to study 📚',
      message: 'Physics • Newton\'s Laws of Motion Practice is scheduled now.',
      link: '/tasks',
    });

    return NextResponse.json({
      success: true,
      message: 'Test notification created',
      notification,
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: 'Failed to create test notification' }, { status: 500 });
  }
}
