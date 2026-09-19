import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      include: {
        subject: true,
        chapter: true,
      },
      orderBy: [
        { pinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Notes GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, subjectId, chapterId, pinned } = body;

    if (!title) {
      return NextResponse.json({ error: 'Note title is required' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content: content || '',
        subjectId: subjectId || null,
        chapterId: chapterId || null,
        pinned: Boolean(pinned),
      },
      include: {
        subject: true,
        chapter: true,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Notes POST error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
