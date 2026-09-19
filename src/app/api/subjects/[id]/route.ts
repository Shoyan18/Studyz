import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subject = await prisma.subject.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
        },
        tasks: {
          where: { userId: user.id },
          orderBy: { dueDate: 'asc' },
        },
        studySessions: {
          where: { userId: user.id, completed: true },
          orderBy: { sessionDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const totalChapters = subject.chapters.length;
    const completedChapters = subject.chapters.filter((c) => c.status === 'COMPLETED' || c.progress === 100).length;
    const avgProgress =
      totalChapters > 0
        ? Math.round(subject.chapters.reduce((acc, c) => acc + c.progress, 0) / totalChapters)
        : 0;

    return NextResponse.json({
      subject: {
        ...subject,
        totalChapters,
        completedChapters,
        progress: avgProgress,
      },
    });
  } catch (error) {
    console.error('Subject details GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch subject details' }, { status: 500 });
  }
}

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
    const { name, code, color, icon } = body;

    const existing = await prisma.subject.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const updated = await prisma.subject.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        code: code || undefined,
        color: color || undefined,
        icon: icon || undefined,
      },
    });

    return NextResponse.json({ success: true, subject: updated });
  } catch (error) {
    console.error('Subject PUT error:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
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

    const existing = await prisma.subject.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    await prisma.subject.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Subject DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
