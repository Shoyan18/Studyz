import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { createChapter } from '@/lib/chapters';

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
      where: { id: params.id, userId: user.id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, chapters: subject.chapters });
  } catch (error) {
    console.error('Subject chapters GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, title, difficulty, notes } = body;

    const result = await createChapter({
      userId: user.id,
      subjectId: params.id,
      title: title || name,
      name: name || title,
      difficulty,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, chapter: result.chapter }, { status: 201 });
  } catch (error) {
    console.error('Subject chapters POST error:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
