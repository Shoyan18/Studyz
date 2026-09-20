import prisma from '../src/lib/db';
import bcrypt from 'bcryptjs';

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'ach_first_focus',
    code: 'first_focus',
    name: 'First Step',
    description: 'Complete your very first focus session',
    icon: 'flame',
    category: 'FOCUS',
    requirementType: 'FOCUS_SESSIONS',
    requirementValue: 1,
    xpReward: 50,
  },
  {
    id: 'ach_xp_100',
    code: 'xp_100',
    name: 'XP Spark',
    description: 'Earn 100 total XP points',
    icon: 'sparkles',
    category: 'XP',
    requirementType: 'TOTAL_XP',
    requirementValue: 100,
    xpReward: 50,
  },
  {
    id: 'ach_xp_1000',
    code: 'xp_1000',
    name: 'Centurion',
    description: 'Earn 1,000 total XP points',
    icon: 'crown',
    category: 'XP',
    requirementType: 'TOTAL_XP',
    requirementValue: 1000,
    xpReward: 100,
  },
  {
    id: 'ach_streak_3',
    code: 'streak_3',
    name: 'Momentum',
    description: 'Maintain a 3-day study streak',
    icon: 'zap',
    category: 'STREAK',
    requirementType: 'STREAK_DAYS',
    requirementValue: 3,
    xpReward: 60,
  },
  {
    id: 'ach_streak_7',
    code: 'streak_7',
    name: 'Unstoppable',
    description: 'Maintain a 7-day study streak',
    icon: 'flame',
    category: 'STREAK',
    requirementType: 'STREAK_DAYS',
    requirementValue: 7,
    xpReward: 150,
  },
  {
    id: 'ach_focus_10h',
    code: 'focus_10h',
    name: 'Deep Thinker',
    description: 'Accumulate 10 hours of focused study time',
    icon: 'clock',
    category: 'FOCUS',
    requirementType: 'STUDY_MINUTES',
    requirementValue: 600,
    xpReward: 150,
  },
  {
    id: 'ach_focus_25h',
    code: 'focus_25h',
    name: 'Flow State Titan',
    description: 'Accumulate 25 hours of focused study time',
    icon: 'hourglass',
    category: 'FOCUS',
    requirementType: 'STUDY_MINUTES',
    requirementValue: 1500,
    xpReward: 250,
  },
  {
    id: 'ach_tasks_10',
    code: 'tasks_10',
    name: 'Task Slayer',
    description: 'Complete 10 study tasks',
    icon: 'check-circle-2',
    category: 'TASKS',
    requirementType: 'TASKS_COMPLETED',
    requirementValue: 10,
    xpReward: 80,
  },
  {
    id: 'ach_chapter_first',
    code: 'chapter_first',
    name: 'Chapter Conqueror',
    description: 'Fully complete your first chapter (100% progress)',
    icon: 'book-open',
    category: 'CHAPTERS',
    requirementType: 'CHAPTERS_COMPLETED',
    requirementValue: 1,
    xpReward: 75,
  },
  {
    id: 'ach_chapter_5',
    code: 'chapter_5',
    name: 'Syllabus Crusher',
    description: 'Complete 5 chapters across your subjects',
    icon: 'award',
    category: 'CHAPTERS',
    requirementType: 'CHAPTERS_COMPLETED',
    requirementValue: 5,
    xpReward: 150,
  }
];

export async function seedDefaults(userId: string) {
  // 1. Create standard subjects for this user
  const physics = await prisma.subject.create({
    data: {
      userId,
      name: 'Physics',
      code: 'PHY',
      color: '#8C7CFF', // Lavender
      icon: 'atom',
      order: 1,
      chapters: {
        create: [
          { name: 'Units & Dimensions', order: 1, difficulty: 'EASY', status: 'COMPLETED', progress: 100 },
          { name: 'Vectors', order: 2, difficulty: 'EASY', status: 'IN_PROGRESS', progress: 80 },
          { name: 'Kinematics', order: 3, difficulty: 'MEDIUM', status: 'IN_PROGRESS', progress: 65 },
          { name: 'Newton\'s Laws of Motion (NLM)', order: 4, difficulty: 'HARD', status: 'IN_PROGRESS', progress: 30 },
          { name: 'Work, Power & Energy', order: 5, difficulty: 'MEDIUM', status: 'NOT_STARTED', progress: 0 },
          { name: 'Rotational Motion', order: 6, difficulty: 'HARD', status: 'NOT_STARTED', progress: 0 },
          { name: 'Gravitation', order: 7, difficulty: 'MEDIUM', status: 'NOT_STARTED', progress: 0 },
        ]
      }
    },
    include: { chapters: true }
  });

  const chemistry = await prisma.subject.create({
    data: {
      userId,
      name: 'Chemistry',
      code: 'CHEM',
      color: '#FF8E72', // Coral / Peach
      icon: 'flask-conical',
      order: 2,
      chapters: {
        create: [
          { name: 'Mole Concept', order: 1, difficulty: 'MEDIUM', status: 'IN_PROGRESS', progress: 50 },
          { name: 'Atomic Structure', order: 2, difficulty: 'MEDIUM', status: 'COMPLETED', progress: 100 },
          { name: 'Periodic Classification', order: 3, difficulty: 'EASY', status: 'IN_PROGRESS', progress: 80 },
          { name: 'Chemical Bonding', order: 4, difficulty: 'HARD', status: 'IN_PROGRESS', progress: 40 },
          { name: 'Thermodynamics', order: 5, difficulty: 'HARD', status: 'NOT_STARTED', progress: 0 },
          { name: 'Organic Chemistry Basics', order: 6, difficulty: 'MEDIUM', status: 'NOT_STARTED', progress: 0 },
        ]
      }
    },
    include: { chapters: true }
  });

  const math = await prisma.subject.create({
    data: {
      userId,
      name: 'Mathematics',
      code: 'MATH',
      color: '#FDBA74', // Soft Amber / Yellow
      icon: 'calculator',
      order: 3,
      chapters: {
        create: [
          { name: 'Sets & Relations', order: 1, difficulty: 'EASY', status: 'COMPLETED', progress: 100 },
          { name: 'Quadratic Equations', order: 2, difficulty: 'MEDIUM', status: 'IN_PROGRESS', progress: 80 },
          { name: 'Sequences & Series', order: 3, difficulty: 'MEDIUM', status: 'COMPLETED', progress: 100 },
          { name: 'Complex Numbers', order: 4, difficulty: 'HARD', status: 'IN_PROGRESS', progress: 60 },
          { name: 'Coordinate Geometry', order: 5, difficulty: 'HARD', status: 'IN_PROGRESS', progress: 20 },
          { name: 'Limits & Derivatives', order: 6, difficulty: 'HARD', status: 'NOT_STARTED', progress: 0 },
        ]
      }
    },
    include: { chapters: true }
  });

  // Today's tasks (matching reference image)
  const today = new Date();
  const nlmChapter = physics.chapters.find(c => c.name.includes('NLM'));
  const moleChapter = chemistry.chapters.find(c => c.name.includes('Mole'));
  const quadChapter = math.chapters.find(c => c.name.includes('Quadratic'));

  await prisma.task.createMany({
    data: [
      {
        userId,
        subjectId: physics.id,
        chapterId: nlmChapter?.id,
        title: "Physics – NLM Problem Solving",
        scheduledTime: "5:00 PM – 6:30 PM",
        duration: 90,
        priority: "HIGH",
        status: "TODO",
        dueDate: today,
      },
      {
        userId,
        subjectId: chemistry.id,
        chapterId: moleChapter?.id,
        title: "Chemistry – Mole Concept Practice",
        scheduledTime: "7:00 PM – 8:00 PM",
        duration: 60,
        priority: "MEDIUM",
        status: "TODO",
        dueDate: today,
      },
      {
        userId,
        subjectId: math.id,
        chapterId: quadChapter?.id,
        title: "Maths – Quadratic Equations PYQs",
        scheduledTime: "8:30 PM – 9:30 PM",
        duration: 60,
        priority: "HIGH",
        status: "TODO",
        dueDate: today,
      },
    ]
  });

  // Recent Study Sessions for past 7 days to give rich analytics matching reference (18h 30m this week)
  const pastDays = [
    { dayOffset: 6, mins: 150, subj: physics },    // Mon: 2.5h
    { dayOffset: 5, mins: 360, subj: chemistry },  // Tue: 6h
    { dayOffset: 4, mins: 210, subj: math },       // Wed: 3.5h
    { dayOffset: 3, mins: 120, subj: physics },    // Thu: 2h
    { dayOffset: 2, mins: 240, subj: chemistry },  // Fri: 4h
    { dayOffset: 1, mins: 420, subj: math },       // Sat: 7h
    { dayOffset: 0, mins: 180, subj: physics },    // Sun/Today: 3h
  ];

  for (const session of pastDays) {
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() - session.dayOffset);
    const xp = Math.round(session.mins * 1.2);

    await prisma.studySession.create({
      data: {
        userId,
        subjectId: session.subj.id,
        durationMinutes: session.mins,
        plannedDurationMinutes: session.mins,
        xpEarned: xp,
        completed: true,
        sessionDate,
      }
    });

    const dateStr = sessionDate.toISOString().split('T')[0];
    await prisma.dailyProgress.upsert({
      where: { userId_date: { userId, date: dateStr } },
      create: {
        userId,
        date: dateStr,
        studyMinutes: session.mins,
        tasksCompleted: 2,
        xpEarned: xp,
        goalReached: session.mins >= 180,
      },
      update: {
        studyMinutes: { increment: session.mins },
        xpEarned: { increment: xp },
      }
    });

    await prisma.xPTransaction.create({
      data: {
        userId,
        amount: xp,
        source: 'FOCUS_SESSION',
        description: `Completed ${session.mins}m study session in ${session.subj.name}`,
        createdAt: sessionDate,
      }
    });
  }

  // Unlock some initial achievements for demo user
  const initialToUnlock = ['ach_first_focus', 'ach_xp_100', 'ach_xp_1000', 'ach_streak_3', 'ach_streak_7', 'ach_focus_10h'];
  for (const code of initialToUnlock) {
    const ach = await prisma.achievement.findUnique({ where: { code } });
    if (ach) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: ach.id } },
        create: { userId, achievementId: ach.id },
        update: {}
      });
    }
  }

  // Create initial notes
  await prisma.note.create({
    data: {
      userId,
      subjectId: physics.id,
      title: "Newton's 2nd Law & Friction Notes",
      content: "Key formulas:\n- F_net = m * a\n- f_s <= mu_s * N (Static friction)\n- f_k = mu_k * N (Kinetic friction)\n\nRemember: Tension is uniform along an ideal massless string.",
      pinned: true,
    }
  });

  await prisma.note.create({
    data: {
      userId,
      subjectId: math.id,
      title: "Roots of Quadratic Equations Shortcuts",
      content: "For ax^2 + bx + c = 0:\n- Sum of roots = -b/a\n- Product of roots = c/a\n- Discriminant D = b^2 - 4ac (D > 0: real & distinct, D = 0: real & equal, D < 0: complex conjugates)",
      pinned: false,
    }
  });
}

async function main() {
  console.log("Seeding base achievements...");
  for (const ach of INITIAL_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: ach.id },
      create: ach,
      update: ach,
    });
  }

  console.log("Creating default demo user (Shoyan)...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'shoyan@studyz.app' },
    create: {
      email: 'shoyan@studyz.app',
      password: hashedPassword,
      name: 'Shoyan',
      avatarUrl: '/avatars/avatar-1.png',
      role: 'ADMIN',
      onboarded: true,
      currentLevel: 18,
      totalXp: 2450,
      currentStreak: 12,
      longestStreak: 15,
      lastStudyDate: new Date(),
      profile: {
        create: {
          grade: 'Class 12',
          examGoal: 'JEE Main & Advanced',
          dailyStudyGoalHours: 4.5,
          preferredFocusMinutes: 50,
          themePreference: 'light',
          bio: 'Aiming for top 500 AIR in JEE Advanced! Focused on Physics & Maths mastery.',
        }
      }
    },
    update: {
      currentLevel: 18,
      totalXp: 2450,
      currentStreak: 12,
      onboarded: true,
    }
  });

  // Seed default subjects/tasks/sessions if not already present
  const countSubjects = await prisma.subject.count({ where: { userId: demoUser.id } });
  if (countSubjects === 0) {
    console.log("Seeding subjects and initial data for Shoyan...");
    await seedDefaults(demoUser.id);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
