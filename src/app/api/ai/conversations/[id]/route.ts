import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

// GET /api/ai/conversations/[id] — Fetch conversation and messages
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: user.id, // Strictly user-owned
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            attachments: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (err) {
    console.error('Error fetching conversation details:', err);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

// PATCH /api/ai/conversations/[id] — Rename conversation
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ error: 'Valid title is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.conversation.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    const updated = await prisma.conversation.update({
      where: { id: params.id },
      data: {
        title: body.title.trim().slice(0, 80),
      },
    });

    return NextResponse.json({ conversation: updated });
  } catch (err) {
    console.error('Error renaming conversation:', err);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

// DELETE /api/ai/conversations/[id] — Delete conversation
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.conversation.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    await prisma.conversation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, id: params.id });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
