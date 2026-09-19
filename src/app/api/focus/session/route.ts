import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { awardXP, calculateUserStreak, checkAndAwardAchievements, XP_CONFIG } from '@/lib/gamification';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subjectId, chapterId, durationMinutes, plannedDurationMinutes, notes } = body;

    const safeDuration = Math.max(1, Number(durationMinutes) || 25);
    const safePlanned = Math.max(1, Number(plannedDurationMinutes) || safeDuration);

    // Calculate XP
    let xpEarned = safeDuration * XP_CONFIG.PER_MINUTE_FOCUSED;
    if (safeDuration >= safePlanned) {
      xpEarned += XP_CONFIG.BONUS_FULL_SESSION;
    }

    // Save study session
    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        subjectId: subjectId || null,
        chapterId: chapterId || null,
        durationMinutes: safeDuration,
        plannedDurationMinutes: safePlanned,
        xpEarned,
        completed: true,
        notes: notes || null,
        sessionDate: new Date(),
      },
      include: {
        subject: true,
        chapter: true,
      },
    });

    // Update DailyProgress
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyGoalHours = user.profile?.dailyStudyGoalHours || 4.0;
    const dailyGoalMinutes = dailyGoalHours * 60;

    const dailyProgress = await prisma.dailyProgress.upsert({
      where: { userId_date: { userId: user.id, date: todayStr } },
      create: {
        userId: user.id,
        date: todayStr,
        studyMinutes: safeDuration,
        xpEarned,
        goalReached: safeDuration >= dailyGoalMinutes,
      },
      update: {
        studyMinutes: { increment: safeDuration },
        xpEarned: { increment: xpEarned },
      },
    });

    // Check if daily goal was just reached
    let dailyGoalBonusAwarded = false;
    if (!dailyProgress.goalReached && (dailyProgress.studyMinutes >= dailyGoalMinutes)) {
      await prisma.dailyProgress.update({
        where: { id: dailyProgress.id },
        data: { goalReached: true },
      });
      await awardXP(user.id, XP_CONFIG.DAILY_GOAL_COMPLETED, 'DAILY_GOAL', `Achieved daily study goal of ${dailyGoalHours}h!`);
      dailyGoalBonusAwarded = true;
    }

    // Award session XP
    const xpResult = await awardXP(
      user.id,
      xpEarned,
      'FOCUS_SESSION',
      `Focused for ${safeDuration}m in ${session.subject?.name || 'General Study'}`
    );

    // Recalculate streak
    const { currentStreak, longestStreak } = await calculateUserStreak(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak,
        longestStreak,
        lastStudyDate: new Date(),
      },
    });

    // Check achievements
    const newlyUnlocked = await checkAndAwardAchievements(user.id);

    return NextResponse.json({
      success: true,
      session,
      xpEarned,
      dailyGoalBonusAwarded,
      xpResult,
      streak: currentStreak,
      longestStreak,
      unlockedAchievements: newlyUnlocked,
    });
  } catch (error) {
    console.error('Focus session API error:', error);
    return NextResponse.json({ error: 'Failed to record focus session' }, { status: 500 });
  }
}
