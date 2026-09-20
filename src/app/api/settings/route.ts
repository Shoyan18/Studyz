import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      profile: user.profile,
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      avatarUrl,
      currentPassword,
      newPassword,
      dailyStudyGoalHours,
      preferredFocusMinutes,
      themePreference,
      timezone,
      taskRemindersEnabled,
      browserNotificationsEnabled,
    } = body;

    // Password change check
    if (newPassword) {
      if (user.password) {
        if (!currentPassword) {
          return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
        }
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    if (name || avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name ? name.trim() : undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        },
      });
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        dailyStudyGoalHours: dailyStudyGoalHours ? Number(dailyStudyGoalHours) : 4.0,
        preferredFocusMinutes: preferredFocusMinutes ? Number(preferredFocusMinutes) : 25,
        themePreference: themePreference || 'light',
        timezone: timezone || 'Asia/Kolkata',
        taskRemindersEnabled: taskRemindersEnabled !== undefined ? Boolean(taskRemindersEnabled) : true,
        browserNotificationsEnabled: browserNotificationsEnabled !== undefined ? Boolean(browserNotificationsEnabled) : true,
      },
      update: {
        dailyStudyGoalHours: dailyStudyGoalHours ? Number(dailyStudyGoalHours) : undefined,
        preferredFocusMinutes: preferredFocusMinutes ? Number(preferredFocusMinutes) : undefined,
        themePreference: themePreference || undefined,
        timezone: timezone || undefined,
        taskRemindersEnabled: taskRemindersEnabled !== undefined ? Boolean(taskRemindersEnabled) : undefined,
        browserNotificationsEnabled: browserNotificationsEnabled !== undefined ? Boolean(browserNotificationsEnabled) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
