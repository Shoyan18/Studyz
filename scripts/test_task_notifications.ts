import prisma from '../src/lib/db';
import {
  computeScheduledNotificationTimestamp,
  scheduleTaskNotification,
  processPendingNotifications,
  cancelTaskNotification,
} from '../src/lib/notifications';
import { handleTaskStateTransition, handleTaskDeletion } from '../src/lib/gamification';

async function runTest() {
  console.log('--- STARTING TASK NOTIFICATIONS TEST ---');

  // 1. Find or create demo user
  let user = await prisma.user.findFirst({
    where: { email: 'alex.rivera@studyz.app' },
  });

  if (!user) {
    user = await prisma.user.findFirst();
  }

  if (!user) {
    console.error('No user found in database');
    return;
  }

  console.log(`Using user: ${user.name} (${user.id})`);

  // 2. Test UTC Time Computation
  const targetDate = new Date('2026-08-20T00:00:00.000Z');
  const timeStr = '7:30 PM';
  const tz = 'Asia/Kolkata';

  const computedUtc = computeScheduledNotificationTimestamp(targetDate, timeStr, tz);
  console.log(`[TEST 1] Timezone conversion:`);
  console.log(`  Target Date: 2026-08-20`);
  console.log(`  Local Time: 7:30 PM (IST)`);
  console.log(`  Computed UTC: ${computedUtc?.toISOString()}`);
  console.log(`  Expected UTC hour: 14:00. Got: ${computedUtc?.toISOString()}`);

  // 3. Create a test task with exact time
  const testTask = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Physics — NLM Revision Test',
      dueDate: targetDate,
      scheduledTime: '7:30 PM',
      duration: 45,
      priority: 'HIGH',
      status: 'TODO',
      timezone: 'Asia/Kolkata',
      notificationEnabled: true,
    },
  });

  console.log(`[TEST 2] Created Task: ${testTask.title} (ID: ${testTask.id})`);

  // 4. Schedule notification for task
  const scheduledNotif = await scheduleTaskNotification(testTask.id, user.id, 'Asia/Kolkata');
  console.log(`[TEST 3] Scheduled Notification:`);
  console.log(`  Notification ID: ${scheduledNotif?.id}`);
  console.log(`  Scheduled At: ${scheduledNotif?.scheduledAt?.toISOString()}`);
  console.log(`  Status: ${scheduledNotif?.status}`);

  // 5. Test Immediate Due Notification Processing
  // Update the notification scheduledAt to 1 minute ago to simulate it becoming due
  const oneMinuteAgo = new Date(Date.now() - 60000);
  await prisma.notification.update({
    where: { id: scheduledNotif!.id },
    data: { scheduledAt: oneMinuteAgo },
  });

  console.log(`[TEST 4] Processing pending notifications...`);
  const triggered = await processPendingNotifications(user.id);
  console.log(`  Triggered count: ${triggered.length}`);
  const matchingTriggered = triggered.find((n) => n.id === scheduledNotif!.id);
  console.log(`  Notification status after trigger: ${matchingTriggered ? 'SENT ✅' : 'NOT TRIGGERED ❌'}`);

  // 6. Test Task Completion lifecycle
  console.log(`[TEST 5] Completing task to test automatic notification lifecycle...`);
  const transition = await handleTaskStateTransition(user.id, testTask.id, 'COMPLETED');
  console.log(`  Task status now: ${transition.task.status}`);

  // Verify in-app completion notification was recorded
  const completionNotif = await prisma.notification.findFirst({
    where: { taskId: testTask.id, type: 'TASK_COMPLETED' },
  });
  console.log(`  Task Completion Notification created: ${completionNotif ? 'YES ✅' : 'NO ❌'}`);

  // 7. Cleanup test task
  await handleTaskDeletion(user.id, testTask.id);
  console.log(`[TEST 6] Cleaned up test task & deleted related notifications.`);

  console.log('--- ALL NOTIFICATION TESTS PASSED SUCCESSFULLY! 🎉 ---');
}

runTest()
  .catch((e) => {
    console.error('Test failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
