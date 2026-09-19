import { PrismaClient } from '@prisma/client';
import { handleTaskStateTransition, handleTaskDeletion, getLevelInfo, XP_CONFIG } from '../src/lib/gamification';

const prisma = new PrismaClient();

async function runTests() {
  console.log('=====================================================');
  console.log('  STUDYZ: TASK COMPLETION XP STATE MACHINE TEST SUITE');
  console.log('=====================================================\n');

  // Create a clean test user
  const testEmail = `test_xp_${Date.now()}@studyz.app`;
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      password: 'testpassword',
      name: 'Tester',
      totalXp: 100, // starting at 100 XP (Level 2)
      currentLevel: 2,
    },
  });

  // Create 2 test tasks
  const task1 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Physics Mechanics Practice',
      dueDate: new Date(),
      status: 'TODO',
    },
  });

  const task2 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Chemistry Thermodynamics Problems',
      dueDate: new Date(),
      status: 'TODO',
    },
  });

  console.log(`Initial User: XP=${user.totalXp}, Level=${user.currentLevel}`);
  console.log(`Task 1: ID=${task1.id}, Status=${task1.status}`);
  console.log(`Task 2: ID=${task2.id}, Status=${task2.status}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}${detail ? ` (${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  // TEST 1: Complete task once
  const res1 = await handleTaskStateTransition(user.id, task1.id, 'COMPLETED');
  const u1 = await prisma.user.findUnique({ where: { id: user.id } });
  assert(
    res1.xpDelta === 20 && u1?.totalXp === 120 && res1.task.status === 'COMPLETED',
    'Test 1: Complete task once',
    `Expected XP: 120, Actual: ${u1?.totalXp}, Delta: ${res1.xpDelta}`
  );

  // TEST 2: Uncomplete task
  const res2 = await handleTaskStateTransition(user.id, task1.id, 'TODO');
  const u2 = await prisma.user.findUnique({ where: { id: user.id } });
  assert(
    res2.xpDelta === -20 && u2?.totalXp === 100 && res2.task.status === 'TODO',
    'Test 2: Uncomplete task (reverse XP)',
    `Expected XP: 100, Actual: ${u2?.totalXp}, Delta: ${res2.xpDelta}`
  );

  // TEST 3: Complete again
  const res3 = await handleTaskStateTransition(user.id, task1.id, 'COMPLETED');
  const u3 = await prisma.user.findUnique({ where: { id: user.id } });
  assert(
    res3.xpDelta === 20 && u3?.totalXp === 120 && res3.task.status === 'COMPLETED',
    'Test 3: Complete again',
    `Expected XP: 120, Actual: ${u3?.totalXp}, Delta: ${res3.xpDelta}`
  );

  // TEST 4: Toggle 10 times
  console.log('\nRunning Test 4: Toggling 10 times in rapid succession...');
  let currentToggleState = 'COMPLETED';
  for (let i = 1; i <= 10; i++) {
    currentToggleState = currentToggleState === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    await handleTaskStateTransition(user.id, task1.id, currentToggleState);
  }
  const u4 = await prisma.user.findUnique({ where: { id: user.id } });
  const expectedXpToggled = currentToggleState === 'COMPLETED' ? 120 : 100;
  assert(
    u4?.totalXp === expectedXpToggled,
    'Test 4: Toggle 10 times produces accurate final state without XP leakage',
    `Final State: ${currentToggleState}, Expected XP: ${expectedXpToggled}, Actual: ${u4?.totalXp}`
  );

  // TEST 5 & 6: User XP and Level integrity
  const levelInfo = getLevelInfo(u4!.totalXp);
  assert(
    u4?.currentLevel === levelInfo.level,
    'Test 5 & 6: Level calculation matches formula after reversals',
    `XP: ${u4?.totalXp}, Level: ${u4?.currentLevel}`
  );

  // TEST 7: Complete multiple different tasks
  await handleTaskStateTransition(user.id, task1.id, 'COMPLETED');
  await handleTaskStateTransition(user.id, task2.id, 'COMPLETED');
  const u7 = await prisma.user.findUnique({ where: { id: user.id } });
  assert(
    u7?.totalXp === 140, // 100 base + 20 (task1) + 20 (task2)
    'Test 7: Complete multiple different tasks gives independent rewards',
    `Expected XP: 140, Actual: ${u7?.totalXp}`
  );

  // TEST 8: Rapid duplicate clicks (Idempotency)
  console.log('\nRunning Test 8: Rapid duplicate calls to complete already completed task...');
  const res8a = await handleTaskStateTransition(user.id, task1.id, 'COMPLETED');
  const res8b = await handleTaskStateTransition(user.id, task1.id, 'COMPLETED');
  const u8 = await prisma.user.findUnique({ where: { id: user.id } });
  assert(
    res8a.xpDelta === 0 && res8b.xpDelta === 0 && u8?.totalXp === 140,
    'Test 8: Duplicate COMPLETED -> COMPLETED calls do not award duplicate XP (Idempotent)',
    `Expected XP: 140, Actual: ${u8?.totalXp}`
  );

  // TEST 9: Database integrity check (No orphan active transactions)
  const task1ActiveTransactions = await prisma.xPTransaction.findMany({
    where: { userId: user.id, taskId: task1.id, source: 'TASK_COMPLETED', reversed: false },
  });
  const task2ActiveTransactions = await prisma.xPTransaction.findMany({
    where: { userId: user.id, taskId: task2.id, source: 'TASK_COMPLETED', reversed: false },
  });
  assert(
    task1ActiveTransactions.length === 1 && task2ActiveTransactions.length === 1,
    'Test 9: Database has exactly 1 active completion record per completed task',
    `Task1 Active: ${task1ActiveTransactions.length}, Task2 Active: ${task2ActiveTransactions.length}`
  );

  // TEST 10: Non-negative XP safety
  console.log('\nRunning Test 10: Non-negative XP boundary test...');
  const zeroUser = await prisma.user.create({
    data: {
      email: `zero_${Date.now()}@studyz.app`,
      password: 'password',
      name: 'ZeroTester',
      totalXp: 10, // 10 XP
      currentLevel: 1,
    },
  });
  const zeroTask = await prisma.task.create({
    data: {
      userId: zeroUser.id,
      title: 'Zero Task',
      dueDate: new Date(),
      status: 'COMPLETED',
    },
  });
  // Manually log completion tx
  await prisma.xPTransaction.create({
    data: {
      userId: zeroUser.id,
      amount: 20,
      source: 'TASK_COMPLETED',
      description: 'Completed Task: Zero Task',
      taskId: zeroTask.id,
      reversed: false,
    },
  });
  // Now uncomplete when user only had 10 totalXp
  await handleTaskStateTransition(zeroUser.id, zeroTask.id, 'TODO');
  const u10 = await prisma.user.findUnique({ where: { id: zeroUser.id } });
  assert(
    u10?.totalXp === 0,
    'Test 10: XP never drops below 0 when reversed',
    `Expected: 0, Actual: ${u10?.totalXp}`
  );

  // Clean up test data
  await prisma.xPTransaction.deleteMany({ where: { userId: { in: [user.id, zeroUser.id] } } });
  await prisma.task.deleteMany({ where: { userId: { in: [user.id, zeroUser.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: [user.id, zeroUser.id] } } });

  console.log('\n=====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
