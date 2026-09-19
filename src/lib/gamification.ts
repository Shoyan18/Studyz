import prisma from './db';

// Centralized XP Rewards Configuration
export const XP_CONFIG = {
  PER_MINUTE_FOCUSED: 1, // 1 XP per minute
  BONUS_FULL_SESSION: 10, // bonus for completing the timer
  TASK_COMPLETED: 20,
  DAILY_GOAL_COMPLETED: 100,
  CHAPTER_COMPLETED: 50,
  STREAK_BONUS_BASE: 15,
};

export interface LevelInfo {
  level: number;
  currentLevelXp: number; // XP within current level
  xpForNextLevel: number; // Total XP needed for next level from current level base
  totalXp: number;
  progressPercent: number; // 0 to 100
  title: string;
  nextLevelTotalXp: number;
}

/**
 * Calculates level from total XP using a scalable curve calibrated so that
 * Level 1 = 0 XP
 * Level 2 = 100 XP
 * Level 5 = 500 XP
 * Level 10 = 1,200 XP
 * Level 18 = 2,450 XP (next at 3,000 XP)
 */
export function getLevelInfo(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, totalXp);

  // Dynamic levels threshold table & scalable formula
  // Base levels:
  const baseLevels = [
    0,     // Level 1
    100,   // Level 2
    220,   // Level 3
    360,   // Level 4
    520,   // Level 5
    700,   // Level 6
    900,   // Level 7
    1120,  // Level 8
    1360,  // Level 9
    1620,  // Level 10
    1900,  // Level 11
    2050,  // Level 12
    2150,  // Level 13
    2250,  // Level 14
    2350,  // Level 15
    2400,  // Level 16
    2425,  // Level 17
    2450,  // Level 18 (Reference: 2,450 XP)
    3000,  // Level 19 (Reference: 3,000 XP)
    3600,  // Level 20
    4300,  // Level 21
    5100,  // Level 22
    6000,  // Level 23
    7000,  // Level 24
    8100,  // Level 25
    9300,  // Level 26
    10600, // Level 27
    12000, // Level 28
    13500, // Level 29
    15000, // Level 30
  ];

  let level = 1;
  while (level < baseLevels.length && safeXp >= baseLevels[level]) {
    level++;
  }

  // If beyond level 30, scale mathematically with 1500 XP per level
  if (level >= baseLevels.length) {
    const extraLevels = Math.floor((safeXp - baseLevels[baseLevels.length - 1]) / 1500);
    level = baseLevels.length + extraLevels;
  }

  const currentLevelBase = level <= baseLevels.length ? baseLevels[level - 1] : baseLevels[baseLevels.length - 1] + (level - baseLevels.length) * 1500;
  const nextLevelTotal = level < baseLevels.length ? baseLevels[level] : currentLevelBase + 1500;
  const xpNeededInLevel = nextLevelTotal - currentLevelBase;
  const xpGainedInLevel = safeXp - currentLevelBase;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpGainedInLevel / xpNeededInLevel) * 100)));

  const titles = [
    'Curious Novice',
    'Dedicated Learner',
    'Focused Scholar',
    'Knowledge Seeker',
    'Study Enthusiast',
    'Concept Explorer',
    'Problem Solver',
    'Deep Thinker',
    'Academic Crusader',
    'Discipline Master',
    'Mindful Strategist',
    'Syllabus Conqueror',
    'Flow State Practitioner',
    'Intellectual Pioneer',
    'Exam Strategist',
    'Elite Student',
    'Master of Focus',
    'Grand Scholar',
    'Knowledge Luminary',
    'Academic Sage',
  ];

  const titleIndex = Math.min(Math.floor((level - 1) / 1.5), titles.length - 1);
  const title = titles[titleIndex] || 'Grand Scholar';

  return {
    level,
    currentLevelXp: xpGainedInLevel,
    xpForNextLevel: xpNeededInLevel,
    totalXp: safeXp,
    progressPercent,
    title,
    nextLevelTotalXp: nextLevelTotal,
  };
}

/**
 * Calculates current streak from actual study sessions in the database.
 * Formats dates by calendar day YYYY-MM-DD.
 */
export async function calculateUserStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const sessions = await prisma.studySession.findMany({
    where: {
      userId,
      completed: true,
    },
    select: {
      sessionDate: true,
    },
    orderBy: {
      sessionDate: 'desc',
    },
  });

  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique sorted date strings (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      sessions.map((s) => {
        const d = new Date(s.sessionDate);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    )
  ).sort().reverse(); // newest first

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const hasStudiedToday = uniqueDates.includes(todayStr);
  const hasStudiedYesterday = uniqueDates.includes(yesterdayStr);

  if (!hasStudiedToday && !hasStudiedYesterday) {
    // Streak broken
    // Calculate longest streak historically
    const longestStreak = computeHistoricalLongestStreak(uniqueDates);
    return { currentStreak: 0, longestStreak };
  }

  // Count consecutive days backward
  let currentStreak = 0;
  let cursorDate = new Date(hasStudiedToday ? todayStr : yesterdayStr);

  for (let i = 0; i < 365; i++) {
    const checkStr = `${cursorDate.getFullYear()}-${String(cursorDate.getMonth() + 1).padStart(2, '0')}-${String(cursorDate.getDate()).padStart(2, '0')}`;
    if (uniqueDates.includes(checkStr)) {
      currentStreak++;
      cursorDate.setDate(cursorDate.getDate() - 1);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(currentStreak, computeHistoricalLongestStreak(uniqueDates));

  return { currentStreak, longestStreak };
}

function computeHistoricalLongestStreak(sortedDatesNewestFirst: string[]): number {
  if (sortedDatesNewestFirst.length === 0) return 0;
  
  // Sort oldest to newest
  const datesAsc = [...sortedDatesNewestFirst].reverse();
  let maxStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < datesAsc.length; i++) {
    const prev = new Date(datesAsc[i - 1]);
    const curr = new Date(datesAsc[i]);
    
    // Difference in calendar days
    const diffTime = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > maxStreak) maxStreak = currentRun;
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  return maxStreak;
}

/**
 * Awards XP to user, logs transaction, updates user totalXp, level, and returns new state
 */
export async function awardXP(
  userId: string,
  amount: number,
  source: string,
  description: string,
  taskId?: string
) {
  if (amount === 0) return null;

  // 1. Create XP transaction
  const transaction = await prisma.xPTransaction.create({
    data: {
      userId,
      amount,
      source,
      description,
      taskId: taskId || null,
      reversed: false,
    },
  });

  // 2. Fetch user & calculate new level
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXp: true, currentLevel: true },
  });

  if (!user) return null;

  const newTotalXp = Math.max(0, user.totalXp + amount);
  const levelInfo = getLevelInfo(newTotalXp);

  // 3. Update user record
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: newTotalXp,
      currentLevel: levelInfo.level,
    },
  });

  return {
    transaction,
    newTotalXp,
    levelInfo,
    leveledUp: levelInfo.level > user.currentLevel,
  };
}

export interface TaskStateTransitionResult {
  task: any;
  previousStatus: string;
  newStatus: string;
  xpDelta: number;
  transactionRecord: any;
  userState: {
    totalXp: number;
    levelInfo: LevelInfo;
    leveledUp: boolean;
  } | null;
}

/**
 * Handles atomic task status updates and XP state machine transitions.
 * Ensures idempotent transitions and prevents duplicate / infinite XP exploits.
 */
export async function handleTaskStateTransition(
  userId: string,
  taskId: string,
  targetStatus: string,
  otherUpdates: Partial<{
    title: string;
    subjectId: string | null;
    chapterId: string | null;
    dueDate: Date;
    scheduledTime: string | null;
    duration: number;
    priority: string;
    description: string | null;
  }> = {}
): Promise<TaskStateTransitionResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current task state inside transaction
    const existingTask = await tx.task.findFirst({
      where: { id: taskId, userId },
      include: { subject: true, chapter: true },
    });

    if (!existingTask) {
      throw new Error('TASK_NOT_FOUND');
    }

    const previousStatus = existingTask.status;
    const isTransitionToCompleted = previousStatus !== 'COMPLETED' && targetStatus === 'COMPLETED';
    const isTransitionFromCompleted = previousStatus === 'COMPLETED' && targetStatus !== 'COMPLETED';

    // 2. Perform task update
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        ...otherUpdates,
        status: targetStatus,
        completedAt: isTransitionToCompleted ? new Date() : (isTransitionFromCompleted ? null : existingTask.completedAt),
      },
      include: {
        subject: true,
        chapter: true,
      },
    });

    let xpDelta = 0;
    let transactionRecord = null;
    let userState = null;

    const todayStr = new Date().toISOString().split('T')[0];

    // Case 1: Transition TODO/IN_PROGRESS -> COMPLETED (Award XP)
    if (isTransitionToCompleted) {
      // Check if there is already an active (unreversed) transaction for this task
      const activeTx = await tx.xPTransaction.findFirst({
        where: {
          userId,
          taskId,
          source: 'TASK_COMPLETED',
          reversed: false,
        },
      });

      if (!activeTx) {
        xpDelta = XP_CONFIG.TASK_COMPLETED; // +20

        transactionRecord = await tx.xPTransaction.create({
          data: {
            userId,
            amount: xpDelta,
            source: 'TASK_COMPLETED',
            description: `Completed Task: ${existingTask.title}`,
            taskId: existingTask.id,
            reversed: false,
          },
        });

        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { totalXp: true, currentLevel: true },
        });

        if (currentUser) {
          const newTotalXp = Math.max(0, currentUser.totalXp + xpDelta);
          const levelInfo = getLevelInfo(newTotalXp);

          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              totalXp: newTotalXp,
              currentLevel: levelInfo.level,
            },
          });

          userState = {
            totalXp: updatedUser.totalXp,
            levelInfo,
            leveledUp: levelInfo.level > currentUser.currentLevel,
          };
        }

        // Daily progress increment
        const existingProgress = await tx.dailyProgress.findUnique({
          where: { userId_date: { userId, date: todayStr } },
        });

        if (existingProgress) {
          await tx.dailyProgress.update({
            where: { userId_date: { userId, date: todayStr } },
            data: {
              tasksCompleted: { increment: 1 },
              xpEarned: { increment: xpDelta },
            },
          });
        } else {
          await tx.dailyProgress.create({
            data: {
              userId,
              date: todayStr,
              tasksCompleted: 1,
              xpEarned: xpDelta,
            },
          });
        }

        // Cancel any pending scheduled notifications for this completed task
        await tx.notification.updateMany({
          where: {
            taskId: existingTask.id,
            userId,
            status: 'PENDING',
          },
          data: {
            status: 'CANCELLED',
          },
        });

        // Create completed task in-app notification
        await tx.notification.create({
          data: {
            userId,
            taskId: existingTask.id,
            type: 'TASK_COMPLETED',
            title: 'Task Completed! ✨',
            message: `${existingTask.title} (+20 XP awarded)`,
            link: '/tasks',
            status: 'SENT',
            sentAt: new Date(),
            channel: 'IN_APP',
          },
        });
      }
    }
    // Case 2: Transition COMPLETED -> TODO/IN_PROGRESS (Reverse XP)
    else if (isTransitionFromCompleted) {
      // Find the most recent active (unreversed) completion transaction for this task
      const activeTx = await tx.xPTransaction.findFirst({
        where: {
          userId,
          taskId,
          source: 'TASK_COMPLETED',
          reversed: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (activeTx) {
        xpDelta = -activeTx.amount; // -20

        // Mark the active transaction as reversed
        await tx.xPTransaction.update({
          where: { id: activeTx.id },
          data: { reversed: true },
        });

        // Record the reversal transaction
        transactionRecord = await tx.xPTransaction.create({
          data: {
            userId,
            amount: xpDelta,
            source: 'TASK_UNCOMPLETED',
            description: `Reversed Task Completion: ${existingTask.title}`,
            taskId: existingTask.id,
            reversed: true,
          },
        });

        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { totalXp: true, currentLevel: true },
        });

        if (currentUser) {
          const newTotalXp = Math.max(0, currentUser.totalXp + xpDelta);
          const levelInfo = getLevelInfo(newTotalXp);

          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              totalXp: newTotalXp,
              currentLevel: levelInfo.level,
            },
          });

          userState = {
            totalXp: updatedUser.totalXp,
            levelInfo,
            leveledUp: false,
          };
        }

        // Daily progress decrement
        const existingProgress = await tx.dailyProgress.findUnique({
          where: { userId_date: { userId, date: todayStr } },
        });

        if (existingProgress) {
          await tx.dailyProgress.update({
            where: { userId_date: { userId, date: todayStr } },
            data: {
              tasksCompleted: Math.max(0, existingProgress.tasksCompleted - 1),
              xpEarned: Math.max(0, existingProgress.xpEarned - activeTx.amount),
            },
          });
        }
      }
    }

    return {
      task: updatedTask,
      previousStatus,
      newStatus: targetStatus,
      xpDelta,
      transactionRecord,
      userState,
    };
  });
}

/**
 * Handles atomic task deletion and cleans up any unreversed XP to prevent exploit.
 */
export async function handleTaskDeletion(userId: string, taskId: string) {
  return await prisma.$transaction(async (tx) => {
    const existingTask = await tx.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      throw new Error('TASK_NOT_FOUND');
    }

    if (existingTask.status === 'COMPLETED') {
      const activeTx = await tx.xPTransaction.findFirst({
        where: {
          userId,
          taskId,
          source: 'TASK_COMPLETED',
          reversed: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (activeTx) {
        await tx.xPTransaction.update({
          where: { id: activeTx.id },
          data: { reversed: true },
        });

        await tx.xPTransaction.create({
          data: {
            userId,
            amount: -activeTx.amount,
            source: 'TASK_UNCOMPLETED',
            description: `Deleted Completed Task: ${existingTask.title}`,
            taskId: existingTask.id,
            reversed: true,
          },
        });

        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { totalXp: true, currentLevel: true },
        });

        if (currentUser) {
          const newTotalXp = Math.max(0, currentUser.totalXp - activeTx.amount);
          const levelInfo = getLevelInfo(newTotalXp);
          await tx.user.update({
            where: { id: userId },
            data: {
              totalXp: newTotalXp,
              currentLevel: levelInfo.level,
            },
          });
        }
      }
    }

    // Cancel all pending notifications for this task
    await tx.notification.updateMany({
      where: {
        taskId,
        userId,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    await tx.task.delete({
      where: { id: taskId },
    });

    return { success: true };
  });
}

/**
 * Checks all achievement conditions for a user and unlocks any unearned ones.
 * Returns array of newly unlocked achievements.
 */
export async function checkAndAwardAchievements(userId: string) {
  const [user, allAchievements, existingUnlocks, sessionStats, taskCount, completedChapters] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId } }),
    prisma.studySession.aggregate({
      where: { userId, completed: true },
      _count: { id: true },
      _sum: { durationMinutes: true },
    }),
    prisma.task.count({
      where: { userId, status: 'COMPLETED' },
    }),
    prisma.chapter.count({
      where: {
        subject: { userId },
        status: 'COMPLETED',
      },
    }),
  ]);

  if (!user) return [];

  const unlockedIds = new Set(existingUnlocks.map((u) => u.achievementId));
  const newlyUnlocked: Array<{ id: string; name: string; description: string; icon: string; xpReward: number }> = [];

  const totalSessions = sessionStats._count.id || 0;
  const totalMinutes = sessionStats._sum.durationMinutes || 0;
  const totalXp = user.totalXp;
  const currentStreak = user.currentStreak;

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue;

    let qualifies = false;

    switch (ach.requirementType) {
      case 'FOCUS_SESSIONS':
        qualifies = totalSessions >= ach.requirementValue;
        break;
      case 'TOTAL_XP':
        qualifies = totalXp >= ach.requirementValue;
        break;
      case 'STREAK_DAYS':
        qualifies = currentStreak >= ach.requirementValue;
        break;
      case 'STUDY_MINUTES':
        qualifies = totalMinutes >= ach.requirementValue;
        break;
      case 'TASKS_COMPLETED':
        qualifies = taskCount >= ach.requirementValue;
        break;
      case 'CHAPTERS_COMPLETED':
        qualifies = completedChapters >= ach.requirementValue;
        break;
      default:
        break;
    }

    if (qualifies) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: ach.id,
        },
      });

      // Award XP for achievement
      if (ach.xpReward > 0) {
        await awardXP(userId, ach.xpReward, 'ACHIEVEMENT', `Unlocked Achievement: ${ach.name}`);
      }

      newlyUnlocked.push({
        id: ach.id,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        xpReward: ach.xpReward,
      });
    }
  }

  return newlyUnlocked;
}
