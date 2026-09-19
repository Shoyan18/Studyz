import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { seedDefaults } from '../../../../../prisma/seed';

export async function POST() {
  try {
    let demoUser = await prisma.user.findUnique({
      where: { email: 'shoyan@studyz.app' },
      include: { profile: true },
    });

    if (!demoUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      demoUser = await prisma.user.create({
        data: {
          email: 'shoyan@studyz.app',
          password: hashedPassword,
          name: 'Shoyan',
          avatarUrl: '/avatars/avatar-1.svg',
          onboarded: true,
          currentLevel: 18,
          totalXp: 2450,
          currentStreak: 12,
          longestStreak: 15,
          profile: {
            create: {
              grade: 'Class 12',
              examGoal: 'JEE Main & Advanced',
              dailyStudyGoalHours: 4.5,
              preferredFocusMinutes: 50,
              themePreference: 'light',
              bio: 'Aiming for top 500 AIR in JEE Advanced! Focused on Physics & Maths mastery.',
            },
          },
        },
        include: { profile: true },
      });

      await seedDefaults(demoUser.id);
    }

    const token = await createSessionToken({ userId: demoUser.id, email: demoUser.email });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        onboarded: demoUser.onboarded,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Failed to authenticate demo user' }, { status: 500 });
  }
}
