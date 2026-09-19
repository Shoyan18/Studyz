import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { calculateUserStreak, getLevelInfo } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentStreak, longestStreak } = await calculateUserStreak(user.id);
    const levelInfo = getLevelInfo(user.totalXp);

    const [sessionStats, taskCount, completedChapters] = await Promise.all([
      prisma.studySession.aggregate({
        where: { userId: user.id, completed: true },
        _count: { id: true },
        _sum: { durationMinutes: true },
      }),
      prisma.task.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      prisma.chapter.count({
        where: { subject: { userId: user.id }, status: 'COMPLETED' },
      }),
    ]);

    const totalMinutes = sessionStats._sum.durationMinutes || 0;
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      profile: user.profile,
      gamification: {
        totalXp: user.totalXp,
        currentStreak,
        longestStreak,
        levelInfo,
      },
      stats: {
        totalHours,
        totalSessions: sessionStats._count.id || 0,
        completedTasks: taskCount,
        completedChapters,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatarUrl, grade, examGoal, bio, dailyStudyGoalHours, preferredFocusMinutes } = body;

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      },
    });

    // Update Profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        grade: grade || 'Class 12',
        examGoal: examGoal || 'JEE Main & Advanced',
        bio: bio || null,
        dailyStudyGoalHours: dailyStudyGoalHours ? Number(dailyStudyGoalHours) : 4.0,
        preferredFocusMinutes: preferredFocusMinutes ? Number(preferredFocusMinutes) : 25,
      },
      update: {
        grade: grade !== undefined ? grade : undefined,
        examGoal: examGoal !== undefined ? examGoal : undefined,
        bio: bio !== undefined ? bio : undefined,
        dailyStudyGoalHours: dailyStudyGoalHours ? Number(dailyStudyGoalHours) : undefined,
        preferredFocusMinutes: preferredFocusMinutes ? Number(preferredFocusMinutes) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
