import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { seedDefaults } from '../../../../../prisma/seed';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        onboarded: false,
        currentLevel: 1,
        totalXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        profile: {
          create: {
            grade: 'Class 12',
            examGoal: 'JEE Main & Advanced',
            dailyStudyGoalHours: 3.0,
            preferredFocusMinutes: 25,
            themePreference: 'light',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Seed default starter subjects & chapters
    try {
      await seedDefaults(user.id);
    } catch (seedErr) {
      console.warn('Seed error for new user:', seedErr);
    }

    const token = await createSessionToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        onboarded: user.onboarded,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong during signup. Please try again.' },
      { status: 500 }
    );
  }
}
