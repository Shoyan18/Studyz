import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createChapter } from '@/lib/chapters';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subjectId, name, title, difficulty, notes } = body;

    const result = await createChapter({
      userId: user.id,
      subjectId,
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
    console.error('Chapter POST error:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}

