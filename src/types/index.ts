export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  onboarded: boolean;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  levelInfo?: LevelInfo;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  grade: string;
  examGoal: string;
  dailyStudyGoalHours: number;
  preferredFocusMinutes: number;
  themePreference: string;
  timezone?: string;
  taskRemindersEnabled?: boolean;
  browserNotificationsEnabled?: boolean;
  bio?: string | null;
}

export interface LevelInfo {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  totalXp: number;
  progressPercent: number;
  title: string;
  nextLevelTotalXp: number;
}

export interface Subject {
  id: string;
  name: string;
  code?: string | null;
  color: string;
  icon: string;
  order: number;
  totalChapters?: number;
  completedChapters?: number;
  progress?: number;
  studyMinutes?: number;
  studyHoursFormatted?: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  notes?: string | null;
  completedAt?: string | null;
}

export interface Task {
  id: string;
  title: string;
  subjectId?: string | null;
  subjectName?: string | null;
  subjectColor?: string | null;
  subjectIcon?: string | null;
  chapterId?: string | null;
  chapterName?: string | null;
  dueDate?: string;
  scheduledTime?: string | null;
  duration: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  description?: string | null;
  timezone?: string;
  notificationEnabled?: boolean;
  notificationSent?: boolean;
  scheduledNotificationAt?: string | null;
  subject?: Subject | null;
  chapter?: Chapter | null;
}

export interface StudyzNotification {
  id: string;
  userId: string;
  taskId?: string | null;
  type: 'TASK_REMINDER' | 'TASK_COMPLETED' | 'TASK_MISSED' | 'ACHIEVEMENT' | 'SYSTEM';
  title: string;
  message: string;
  link?: string | null;
  scheduledAt?: string | null;
  sentAt?: string | null;
  isRead: boolean;
  status: 'PENDING' | 'SENT' | 'CANCELLED' | 'MISSED';
  channel: string;
  createdAt: string;
  task?: Task | null;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string | null;
  subjectName?: string | null;
  subjectColor?: string | null;
  chapterId?: string | null;
  chapterName?: string | null;
  durationMinutes: number;
  plannedDurationMinutes: number;
  xpEarned: number;
  completed: boolean;
  notes?: string | null;
  sessionDate: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  requirementType: string;
  requirementValue: number;
  currentValue: number;
  isUnlocked: boolean;
  unlockedAt?: string | null;
  progressPercent: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId?: string | null;
  chapterId?: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  subject?: Subject | null;
  chapter?: Chapter | null;
}

export type ChatMessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';
export type AttachmentStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';
export type AttachmentCategory = 'PDF' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'OTHER';

export interface ChatAttachment {
  id: string;
  userId?: string;
  conversationId?: string;
  messageId?: string;
  fileName: string;
  mimeType: string;
  size: number;
  category: AttachmentCategory;
  storageReference?: string;
  previewUrl?: string;
  status: AttachmentStatus;
  createdAt: string;
}

export interface ChatActionSuggestion {
  id: string;
  label: string;
  actionType: 'START_FOCUS' | 'ADD_TASK' | 'VIEW_CHAPTER' | 'CREATE_NOTE' | 'TAKE_QUIZ';
  payload?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatMessageRole;
  content: string;
  attachments?: ChatAttachment[];
  suggestedActions?: ChatActionSuggestion[];
  isStreaming?: boolean;
  isError?: boolean;
  feedback?: 'HELPFUL' | 'UNHELPFUL' | null;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}
