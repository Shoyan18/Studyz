import { NextResponse } from 'next/server';
import { getAuthenticatedUser, isUserAdmin } from '@/lib/auth';
import { getLevelInfo, calculateUserStreak } from '@/lib/gamification';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const { currentStreak, longestStreak } = await calculateUserStreak(user.id);
    const levelInfo = getLevelInfo(user.totalXp);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        onboarded: user.onboarded,
        totalXp: user.totalXp,
        currentStreak,
        longestStreak,
        levelInfo,
        profile: user.profile,
        role: isUserAdmin(user) ? 'ADMIN' : (user.role || 'USER'),
        isAdmin: isUserAdmin(user),
      },
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
