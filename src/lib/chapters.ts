import prisma from '@/lib/db';

export interface CreateChapterInput {
  userId: string;
  subjectId: string;
  title?: string;
  name?: string;
  difficulty?: string;
  notes?: string | null;
}

export interface CreateChapterResult {
  success: boolean;
  chapter?: any;
  error?: string;
  status: number;
}

export async function createChapter(input: CreateChapterInput): Promise<CreateChapterResult> {
  const { userId, subjectId, title, name, difficulty, notes } = input;

  // 1. Resolve and validate title / name
  const rawTitle = title || name;
  if (!rawTitle || typeof rawTitle !== 'string') {
    return {
      success: false,
      error: 'Chapter title is required',
      status: 400,
    };
  }

  const trimmedTitle = rawTitle.trim();
  if (trimmedTitle.length === 0) {
    return {
      success: false,
      error: 'Chapter title cannot be empty',
      status: 400,
    };
  }

  if (trimmedTitle.length > 150) {
    return {
      success: false,
      error: 'Chapter title cannot exceed 150 characters',
      status: 400,
    };
  }

  // 2. Validate Difficulty
  const allowedDifficulties = ['EASY', 'MEDIUM', 'HARD'];
  const normalizedDifficulty = difficulty ? difficulty.toUpperCase() : 'MEDIUM';
  const validatedDifficulty = allowedDifficulties.includes(normalizedDifficulty)
    ? normalizedDifficulty
    : 'MEDIUM';

  // 3. Authenticate & Verify Subject Ownership
  if (!subjectId) {
    return {
      success: false,
      error: 'Subject ID is required',
      status: 400,
    };
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });

  if (!subject) {
    return {
      success: false,
      error: 'Subject not found or access denied',
      status: 404,
    };
  }

  // 4. Case-insensitive Duplicate Check
  const existingChapters = await prisma.chapter.findMany({
    where: { subjectId },
    select: { id: true, name: true },
  });

  const isDuplicate = existingChapters.some(
    (c) => c.name.trim().toLowerCase() === trimmedTitle.toLowerCase()
  );

  if (isDuplicate) {
    return {
      success: false,
      error: 'This chapter already exists.',
      status: 400,
    };
  }

  // 5. Database Insertion with initial values
  const currentCount = existingChapters.length;
  const initialProgress = 0;
  const initialStatus = 'NOT_STARTED';

  const chapter = await prisma.chapter.create({
    data: {
      subjectId,
      name: trimmedTitle,
      order: currentCount + 1,
      difficulty: validatedDifficulty,
      status: initialStatus,
      progress: initialProgress,
      notes: notes || null,
      completedAt: null,
    },
  });

  return {
    success: true,
    chapter,
    status: 201,
  };
}
