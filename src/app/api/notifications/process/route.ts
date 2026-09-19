import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { processPendingNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const triggered = await processPendingNotifications(user.id);

    return NextResponse.json({
      success: true,
      count: triggered.length,
      triggered,
    });
  } catch (error) {
    console.error('Notifications process error:', error);
    return NextResponse.json({ error: 'Failed to process notifications' }, { status: 500 });
  }
}
