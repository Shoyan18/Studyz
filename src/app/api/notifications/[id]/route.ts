import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notif = await prisma.notification.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!notif) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    await prisma.notification.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Notification removed' });
  } catch (error) {
    console.error('Notification DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}