import prisma from './db';

export interface CurriculumChapter {
  name: string;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const DEFAULT_CURRICULUM: Record<string, CurriculumChapter[]> = {
  Physics: [
    { name: 'Units & Dimensions', order: 1, difficulty: 'EASY' },
    { name: 'Vectors', order: 2, difficulty: 'EASY' },
    { name: 'Kinematics', order: 3, difficulty: 'MEDIUM' },
    { name: "Newton's Laws of Motion (NLM)", order: 4, difficulty: 'HARD' },
    { name: 'Work, Power & Energy', order: 5, difficulty: 'MEDIUM' },
    { name: 'Rotational Motion', order: 6, difficulty: 'HARD' },
    { name: 'Gravitation', order: 7, difficulty: 'MEDIUM' },
  ],
  Chemistry: [
    { name: 'Mole Concept', order: 1, difficulty: 'MEDIUM' },
    { name: 'Atomic Structure', order: 2, difficulty: 'MEDIUM' },
    { name: 'Periodic Classification', order: 3, difficulty: 'EASY' },
    { name: 'Chemical Bonding', order: 4, difficulty: 'HARD' },
    { name: 'Thermodynamics', order: 5, difficulty: 'HARD' },
    { name: 'Organic Chemistry Basics', order: 6, difficulty: 'MEDIUM' },
  ],
  Mathematics: [
    { name: 'Sets & Relations', order: 1, difficulty: 'EASY' },
    { name: 'Quadratic Equations', order: 2, difficulty: 'MEDIUM' },
    { name: 'Sequences & Series', order: 3, difficulty: 'MEDIUM' },
    { name: 'Complex Numbers', order: 4, difficulty: 'HARD' },
    { name: 'Coordinate Geometry', order: 5, difficulty: 'HARD' },
    { name: 'Limits & Derivatives', order: 6, difficulty: 'HARD' },
  ],
  Biology: [
    { name: 'Cell: The Unit of Life', order: 1, difficulty: 'EASY' },
    { name: 'Biomolecules', order: 2, difficulty: 'MEDIUM' },
    { name: 'Plant Physiology', order: 3, difficulty: 'HARD' },
    { name: 'Human Physiology', order: 4, difficulty: 'HARD' },
    { name: 'Genetics & Evolution', order: 5, difficulty: 'HARD' },
  ],
  'Computer Science': [
    { name: 'Computational Thinking & Python', order: 1, difficulty: 'EASY' },
    { name: 'Data Structures', order: 2, difficulty: 'MEDIUM' },
    { name: 'Computer Networks', order: 3, difficulty: 'MEDIUM' },
    { name: 'Database Management Systems', order: 4, difficulty: 'HARD' },
  ],
};

export const DEFAULT_STARTER_SUBJECTS = [
  { name: 'Physics', code: 'PHY', color: '#8C7CFF', icon: 'atom' },
  { name: 'Chemistry', code: 'CHEM', color: '#FF8E72', icon: 'flask-conical' },
  { name: 'Mathematics', code: 'MATH', color: '#FDBA74', icon: 'calculator' },
];

/**
 * Creates clean starter subjects and chapters for a newly initialized user.
 * CRITICAL GUARANTEE:
 * - Every chapter is initialized with status 'NOT_STARTED' and progress 0.
 * - NO study sessions, tasks, XP, or completed progress are created.
 * - Subject progress starts strictly at 0%.
 */
export async function createCleanStarterSubjects(
  userId: string,
  selectedSubjects?: Array<{ name: string; code?: string; color?: string; icon?: string }>
) {
  const existingCount = await prisma.subject.count({ where: { userId } });
  if (existingCount > 0) {
    return [];
  }

  const subjectsToCreate =
    Array.isArray(selectedSubjects) && selectedSubjects.length > 0
      ? selectedSubjects
      : DEFAULT_STARTER_SUBJECTS;

  const createdSubjects = [];

  for (let i = 0; i < subjectsToCreate.length; i++) {
    const sub = subjectsToCreate[i];
    const curriculumChapters = DEFAULT_CURRICULUM[sub.name] || [];

    const subject = await prisma.subject.create({
      data: {
        userId,
        name: sub.name,
        code: sub.code || sub.name.substring(0, 4).toUpperCase(),
        color: sub.color || '#8C7CFF',
        icon: sub.icon || 'book-open',
        order: i + 1,
        chapters: {
          create: curriculumChapters.map((c) => ({
            name: c.name,
            order: c.order,
            difficulty: c.difficulty,
            status: 'NOT_STARTED',
            progress: 0,
            notes: null,
            completedAt: null,
          })),
        },
      },
      include: {
        chapters: true,
      },
    });

    createdSubjects.push(subject);
  }

  return createdSubjects;
}
