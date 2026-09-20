import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { createCleanStarterSubjects } from '@/lib/curriculum';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatarUrl, grade, examGoal, subjects, dailyStudyGoalHours, preferredFocusMinutes } = body;

    // Update User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        avatarUrl: avatarUrl || user.avatarUrl,
        onboarded: true,
      },
    });

    // Update Profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        grade: grade || 'Class 12',
        examGoal: examGoal || 'JEE Main & Advanced',
        dailyStudyGoalHours: Number(dailyStudyGoalHours) || 3.0,
        preferredFocusMinutes: Number(preferredFocusMinutes) || 25,
        themePreference: 'light',
      },
      update: {
        grade: grade || undefined,
        examGoal: examGoal || undefined,
        dailyStudyGoalHours: dailyStudyGoalHours ? Number(dailyStudyGoalHours) : undefined,
        preferredFocusMinutes: preferredFocusMinutes ? Number(preferredFocusMinutes) : undefined,
      },
    });

    // Initialize clean starter subjects and 0% chapters for this user
    await createCleanStarterSubjects(user.id, subjects);

    return NextResponse.json({ success: true, message: 'Onboarding complete' });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
