import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { awardXP, checkAndAwardAchievements, XP_CONFIG } from '@/lib/gamification';

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
    const { name, difficulty, progress, status, notes } = body;

    const chapter = await prisma.chapter.findUnique({
      where: { id: params.id },
      include: { subject: true },
    });

    if (!chapter || chapter.subject.userId !== user.id) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    let nextProgress = progress !== undefined ? Math.max(0, Math.min(100, Number(progress))) : chapter.progress;
    let nextStatus = status || chapter.status;

    // Synchronize status and progress logically
    if (progress !== undefined && status === undefined) {
      if (nextProgress === 100) nextStatus = 'COMPLETED';
      else if (nextProgress > 0) nextStatus = 'IN_PROGRESS';
      else nextStatus = 'NOT_STARTED';
    } else if (status !== undefined && progress === undefined) {
      if (status === 'COMPLETED') nextProgress = 100;
      else if (status === 'NOT_STARTED') nextProgress = 0;
    }

    const wasCompleted = chapter.status === 'COMPLETED' || chapter.progress === 100;
    const isNowCompleted = nextStatus === 'COMPLETED' || nextProgress === 100;

    const updated = await prisma.chapter.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        difficulty: difficulty || undefined,
        progress: nextProgress,
        status: nextStatus,
        notes: notes !== undefined ? notes : undefined,
        completedAt: isNowCompleted ? new Date() : null,
      },
    });

    let xpResult = null;
    let unlockedAchievements: Array<{ id: string; name: string; description: string; icon: string; xpReward: number }> = [];

    // Award XP if newly completed
    if (!wasCompleted && isNowCompleted) {
      xpResult = await awardXP(
        user.id,
        XP_CONFIG.CHAPTER_COMPLETED,
        'CHAPTER_COMPLETED',
        `Completed Chapter: ${chapter.name}`
      );
      unlockedAchievements = await checkAndAwardAchievements(user.id);
    }

    return NextResponse.json({
      success: true,
      chapter: updated,
      xpEarned: !wasCompleted && isNowCompleted ? XP_CONFIG.CHAPTER_COMPLETED : 0,
      xpResult,
      unlockedAchievements,
    });
  } catch (error) {
    console.error('Chapter PUT error:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
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

    const chapter = await prisma.chapter.findUnique({
      where: { id: params.id },
      include: { subject: true },
    });

    if (!chapter || chapter.subject.userId !== user.id) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    await prisma.chapter.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Chapter DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
