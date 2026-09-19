import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const { messageId, feedback } = body;

    // Verify the message belongs to a conversation owned by the user
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message || message.conversation.userId !== user.id) {
      return NextResponse.json({ error: 'Message not found or unauthorized' }, { status: 403 });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        feedback: feedback === 'HELPFUL' || feedback === 'UNHELPFUL' ? feedback : null,
      },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (err) {
    console.error('Error saving message feedback:', err);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}
