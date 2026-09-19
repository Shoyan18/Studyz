import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
      },
      update: {
        userId: user.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Failed to save push subscription' }, { status: 500 });
  }
}
