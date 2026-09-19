import prisma from '@/lib/db';
import { calculateUserStreak } from '@/lib/gamification';

/**
 * Builds comprehensive, real-time academic analytics & study context
 * empowering STUDYZ AI to track focus hours (today, week, month), syllabus completion, tasks, and streaks.
 */
export async function buildStudyContext(userId: string, _intent?: string): Promise<string> {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Calculate start of week (Monday)
    const currentDayIndex = now.getDay();
    const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch user, profile, subjects with chapters, tasks, and completed focus sessions
    const [user, sessions, tasks] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          subjects: {
            include: {
              chapters: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      }),
      prisma.studySession.findMany({
        where: { userId, completed: true },
        include: { subject: true, chapter: true },
        orderBy: { sessionDate: 'desc' },
      }),
      prisma.task.findMany({
        where: { userId },
        include: { subject: true, chapter: true },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      }),
    ]);

    if (!user) return '';

    const { currentStreak, longestStreak } = await calculateUserStreak(user.id);

    // Focus Duration Aggregations
    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    const todayMinutes = sessions
      .filter((s) => new Date(s.sessionDate).toISOString().split('T')[0] === todayStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    const weeklyMinutes = sessions
      .filter((s) => new Date(s.sessionDate) >= startOfWeek)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    const monthlyMinutes = sessions
      .filter((s) => new Date(s.sessionDate) >= startOfMonth)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    const formatMins = (m: number) => {
      const hrs = (m / 60).toFixed(1);
      return `${m} mins (${hrs} hrs)`;
    };

    // Task Analytics
    const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter((t) => t.status === 'TODO');
    const taskRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

    const lines: string[] = [];

    lines.push(`### 1. STUDENT PROFILE & GAMIFICATION STATS`);
    lines.push(`- Student Name: ${user.name}`);
    if (user.profile) {
      lines.push(`- Academic Grade: ${user.profile.grade}`);
      lines.push(`- Target Exam / Goal: ${user.profile.examGoal}`);
      lines.push(`- Daily Focus Target: ${user.profile.dailyStudyGoalHours} hours/day`);
    }
    lines.push(`- Current Level: Level ${user.currentLevel} | Total XP: ${user.totalXp} XP`);
    lines.push(`- Study Streak: ${currentStreak} Days Active (Longest: ${longestStreak} Days)`);

    lines.push(`\n### 2. REAL-TIME FOCUS TIME ANALYTICS`);
    lines.push(`- Focus Time TODAY: ${formatMins(todayMinutes)}`);
    lines.push(`- Focus Time THIS WEEK (Mon - Sun): ${formatMins(weeklyMinutes)}`);
    lines.push(`- Focus Time THIS MONTH: ${formatMins(monthlyMinutes)}`);
    lines.push(`- All-Time Total Focus: ${formatMins(totalMinutes)} logged across ${sessions.length} sessions`);

    lines.push(`\n### 3. SUBJECT SYLLABUS & CHAPTER COMPLETION`);
    if (user.subjects && user.subjects.length > 0) {
      user.subjects.forEach((sub) => {
        const totalCh = sub.chapters.length;
        const completedCh = sub.chapters.filter((c) => c.status === 'COMPLETED').length;
        const inProgressCh = sub.chapters.filter((c) => c.status === 'IN_PROGRESS').length;
        const subPct = totalCh > 0 ? Math.round((completedCh / totalCh) * 100) : 0;

        const subMins = sessions
          .filter((s) => s.subjectId === sub.id)
          .reduce((acc, s) => acc + s.durationMinutes, 0);

        lines.push(`- Subject: ${sub.name} (${sub.code || 'ID:' + sub.id})`);
        lines.push(`  * Syllabus Progress: ${subPct}% (${completedCh}/${totalCh} chapters completed, ${inProgressCh} in progress)`);
        lines.push(`  * Total Focus Logged for Subject: ${formatMins(subMins)}`);

        const completedNames = sub.chapters.filter((c) => c.status === 'COMPLETED').map((c) => c.name);
        const inProgressNames = sub.chapters.filter((c) => c.status === 'IN_PROGRESS').map((c) => c.name);
        const notStartedNames = sub.chapters.filter((c) => c.status === 'NOT_STARTED').map((c) => c.name);

        if (completedNames.length > 0) lines.push(`  * Completed Chapters: ${completedNames.join(', ')}`);
        if (inProgressNames.length > 0) lines.push(`  * In-Progress Chapters: ${inProgressNames.join(', ')}`);
        if (notStartedNames.length > 0) lines.push(`  * Remaining Chapters: ${notStartedNames.join(', ')}`);
      });
    } else {
      lines.push(`- No subjects enrolled yet.`);
    }

    lines.push(`\n### 4. TASKS & DEADLINES STATUS`);
    lines.push(`- Overall Tasks: ${completedTasksCount}/${tasks.length} completed (${taskRate}% completion rate)`);
    if (pendingTasks.length > 0) {
      const topTasks = pendingTasks.slice(0, 8).map((t) => {
        const subName = t.subject ? ` [${t.subject.name}]` : '';
        const dueStr = t.dueDate ? ` (Due: ${new Date(t.dueDate).toLocaleDateString()})` : '';
        return `"${t.title}"${subName}${dueStr}`;
      });
      lines.push(`- Pending Tasks: ${topTasks.join(' | ')}`);
    } else {
      lines.push(`- Pending Tasks: All tasks caught up!`);
    }

    if (sessions.length > 0) {
      lines.push(`\n### 5. RECENT FOCUS SESSIONS`);
      const recent = sessions.slice(0, 5).map((s) => {
        const subName = s.subject?.name || 'General';
        const chName = s.chapter ? ` (${s.chapter.name})` : '';
        const dateStr = new Date(s.sessionDate).toLocaleDateString();
        return `${s.durationMinutes}m on ${subName}${chName} on ${dateStr}`;
      });
      lines.push(`- Recent activity log: ${recent.join('; ')}`);
    }

    return lines.join('\n');
  } catch (err) {
    console.error('Error compiling study context for AI:', err);
    return '';
  }
}

