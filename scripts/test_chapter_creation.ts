import prisma from '../src/lib/db';
import { createChapter } from '../src/lib/chapters';

async function runTests() {
  console.log('=== RUNNING CHAPTER CREATION TEST SUITE ===\n');

  // 1. Setup test user and subject
  let testUser = await prisma.user.findFirst({
    where: { email: 'shoyan@studyz.app' },
  });

  if (!testUser) {
    console.log('Creating test user...');
    testUser = await prisma.user.create({
      data: {
        email: 'shoyan@studyz.app',
        password: 'hashed_password',
        name: 'Shoyan',
      },
    });
  }

  // Create another user to test security / cross-user boundary
  let otherUser = await prisma.user.findFirst({
    where: { email: 'otheruser@studyz.app' },
  });

  if (!otherUser) {
    otherUser = await prisma.user.create({
      data: {
        email: 'otheruser@studyz.app',
        password: 'hashed_password',
        name: 'Other User',
      },
    });
  }

  let physicsSubject = await prisma.subject.findFirst({
    where: { userId: testUser.id, name: 'Physics' },
  });

  if (!physicsSubject) {
    physicsSubject = await prisma.subject.create({
      data: {
        userId: testUser.id,
        name: 'Physics',
        code: 'PHY101',
        color: '#8C7CFF',
      },
    });
  }

  // Clean up any previous test chapters
  await prisma.chapter.deleteMany({
    where: {
      subjectId: physicsSubject.id,
      name: {
        in: [
          'Testing Chapter',
          'Easy Chapter Test',
          'Medium Chapter Test',
          'Hard Chapter Test',
          'Whitespace Chapter',
          'Duplicate Test Chapter',
        ],
      },
    },
  });

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // Test 1: Create Easy chapter
  const resEasy = await createChapter({
    userId: testUser.id,
    subjectId: physicsSubject.id,
    title: 'Easy Chapter Test',
    difficulty: 'EASY',
  });
  assert(resEasy.success && resEasy.chapter?.difficulty === 'EASY', 'Create Easy chapter');

  // Test 2: Create Medium chapter
  const resMed = await createChapter({
    userId: testUser.id,
    subjectId: physicsSubject.id,
    title: 'Medium Chapter Test',
    difficulty: 'MEDIUM',
  });
  assert(resMed.success && resMed.chapter?.difficulty === 'MEDIUM', 'Create Medium chapter');

  // Test 3: Create Hard chapter
  const resHard = await createChapter({
    userId: testUser.id,
    subjectId: physicsSubject.id,
    title: 'Hard Chapter Test',
    difficulty: 'HARD',
  });
  assert(resHard.success && resHard.chapter?.difficulty === 'HARD', 'Create Hard chapter');

  // Test 4: Verify Initial Progress = 0 & Status = NOT_STARTED
  assert(
    resHard.chapter?.progress === 0 && resHard.chapter?.status === 'NOT_STARTED',
    'Verify initial progress = 0 and status = NOT_STARTED'
  );

  // Test 5: Verify Chapter belongs to correct subject
  assert(
    resHard.chapter?.subjectId === physicsSubject.id,
    'Verify chapter belongs to correct subject'
  );

  // Test 6: Create chapter with empty title
  const resEmpty = await createChapter({
    userId: testUser.id,
    subjectId: physicsSubject.id,
    title: '',
    difficulty: 'MEDIUM',
  });
  assert(!resEmpty.success && resEmpty.status === 400, 'Reject empty title');

  // Test 7: Create chapter with spaces only
  const resSpaces = await createChapter({
    userId: testUser.id,
    subjectId: physicsSubject.id,
    title: '     ',
    difficulty: 'MEDIUM',
  });
  assert(!resSpaces.success && resSpaces.status === 400, 'Reject title with spaces only');

  // Test 8: Duplicate Chapter Creation (Exact match)
  const resDup1 = await createChapter({
    userId: testUser.id,
    subjectId: physicsSubject.id,
    title: 'Duplicate Test Chapter',
    difficulty: 'EASY',
  });
  assert(resDup1.success, 'First creation of Duplicate Test Chapter succeeds');

  const resDup2 = await createChapter({
    userId: testUser.id,
    subjectId: physicsSubject.id,
    title: 'Duplicate Test Chapter',
    difficulty: 'HARD',
  });
  assert(!resDup2.success && resDup2.error === 'This chapter already exists.', 'Reject duplicate chapter (exact match)');

  // Test 9: Duplicate Chapter Creation (Case-insensitive & whitespace match)
  const resDup3 = await createChapter({
    userId: testUser.id,
    subjectId: physicsSubject.id,
    title: '  duplicate test chapter  ',
    difficulty: 'MEDIUM',
  });
  assert(!resDup3.success && resDup3.error === 'This chapter already exists.', 'Reject duplicate chapter (case-insensitive & trimmed match)');

  // Test 10: Security - Cannot create chapter in another user\'s subject
  const resCrossUser = await createChapter({
    userId: otherUser.id,
    subjectId: physicsSubject.id,
    title: 'Hacked Chapter',
    difficulty: 'HARD',
  });
  assert(!resCrossUser.success && (resCrossUser.status === 404 || resCrossUser.status === 403), 'Security: Prevent modifying another user\'s subject');

  // Test 11: Database Persistence Check
  const dbChapter = await prisma.chapter.findFirst({
    where: {
      subjectId: physicsSubject.id,
      name: 'Hard Chapter Test',
    },
  });
  assert(dbChapter !== null && dbChapter.name === 'Hard Chapter Test', 'Verify chapter is persisted in database');

  // Test 12: Creating "Testing Chapter" with Hard difficulty as specified in prompt
  const resTestingChapter = await createChapter({
    userId: testUser.id,
    subjectId: physicsSubject.id,
    title: 'Testing Chapter',
    difficulty: 'HARD',
  });
  assert(resTestingChapter.success && resTestingChapter.chapter?.name === 'Testing Chapter', 'Create Testing Chapter with Hard difficulty');

  console.log(`\n=== ALL ${testsPassed}/${totalTests} TESTS PASSED SUCCESSFULLY ===\n`);
}

runTests()
  .catch((e) => {
    console.error('Test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
