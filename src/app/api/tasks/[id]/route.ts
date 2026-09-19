import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  handleTaskStateTransition,
  handleTaskDeletion,
  checkAndAwardAchievements,
} from '@/lib/gamification';
import { scheduleTaskNotification } from '@/lib/notifications';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      subjectId,
      chapterId,
      dueDate,
      scheduledTime,
      duration,
      priority,
      status,
      description,
      timezone,
      notificationEnabled,
    } = body;

    const otherUpdates: any = {};
    if (title !== undefined) otherUpdates.title = title;
    if (subjectId !== undefined) otherUpdates.subjectId = subjectId;
    if (chapterId !== undefined) otherUpdates.chapterId = chapterId;
    if (dueDate) otherUpdates.dueDate = new Date(dueDate);
    if (scheduledTime !== undefined) otherUpdates.scheduledTime = scheduledTime;
    if (duration !== undefined) otherUpdates.duration = Number(duration);
    if (priority !== undefined) otherUpdates.priority = priority;
    if (description !== undefined) otherUpdates.description = description;
    if (timezone !== undefined) otherUpdates.timezone = timezone;
    if (notificationEnabled !== undefined) otherUpdates.notificationEnabled = Boolean(notificationEnabled);

    // Use atomic transaction state machine
    const transitionResult = await handleTaskStateTransition(
      user.id,
      params.id,
      status || 'TODO',
      otherUpdates
    );

    // If task is not completed and notifications are enabled, reschedule reminder
    if (transitionResult.task.status !== 'COMPLETED' && transitionResult.task.notificationEnabled) {
      await scheduleTaskNotification(params.id, user.id, transitionResult.task.timezone);
    }

    let unlockedAchievements: Array<{ id: string; name: string; description: string; icon: string; xpReward: number }> = [];
    if (transitionResult.xpDelta > 0) {
      unlockedAchievements = await checkAndAwardAchievements(user.id);
    }

    return NextResponse.json({
      success: true,
      task: transitionResult.task,
      xpEarned: transitionResult.xpDelta,
      xpResult: transitionResult.userState,
      unlockedAchievements,
    });
  } catch (error: any) {
    console.error('Task PUT error:', error);
    if (error.message === 'TASK_NOT_FOUND') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await handleTaskDeletion(user.id, params.id);

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Task DELETE error:', error);
    if (error.message === 'TASK_NOT_FOUND') {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
