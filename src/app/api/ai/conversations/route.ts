import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/ai/conversations — Fetch user's conversations
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        userId: true,
        title: true,
        lastMessagePreview: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/ai/conversations — Create new conversation
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = (body.title && typeof body.title === 'string' && body.title.trim())
      ? body.title.trim()
      : 'New conversation';

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title,
        lastMessagePreview: null,
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (err) {
    console.error('Error creating conversation:', err);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
