import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, subjectId, chapterId, pinned } = body;

    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const updated = await prisma.note.update({
      where: { id: params.id },
      data: {
        title: title || undefined,
        content: content !== undefined ? content : undefined,
        subjectId: subjectId !== undefined ? subjectId : undefined,
        chapterId: chapterId !== undefined ? chapterId : undefined,
        pinned: pinned !== undefined ? Boolean(pinned) : undefined,
      },
      include: {
        subject: true,
        chapter: true,
      },
    });

    return NextResponse.json({ success: true, note: updated });
  } catch (error) {
    console.error('Note PUT error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.note.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Note DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
