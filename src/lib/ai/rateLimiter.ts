import { AI_CONFIG } from './config';

interface RateLimitRecord {
  timestamps: number[];
  dayCount: number;
  lastResetDay: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Checks if a user has exceeded AI request limits (per minute and per day)
 */
export function checkRateLimit(userId: string): { allowed: boolean; retryAfterSeconds?: number; reason?: string } {
  const now = Date.now();
  const currentDay = Math.floor(now / (1000 * 60 * 60 * 24));

  let record = rateLimitStore.get(userId);

  if (!record) {
    record = {
      timestamps: [now],
      dayCount: 1,
      lastResetDay: currentDay,
    };
    rateLimitStore.set(userId, record);
    return { allowed: true };
  }

  // Check daily reset
  if (record.lastResetDay !== currentDay) {
    record.dayCount = 0;
    record.lastResetDay = currentDay;
  }

  // Daily limit check
  if (record.dayCount >= AI_CONFIG.RATE_LIMIT_PER_DAY) {
    return {
      allowed: false,
      reason: `Daily AI study limit of ${AI_CONFIG.RATE_LIMIT_PER_DAY} questions reached. Please resume tomorrow.`,
    };
  }

  // 1-minute sliding window check
  const oneMinuteAgo = now - 60 * 1000;
  record.timestamps = record.timestamps.filter((ts) => ts > oneMinuteAgo);

  if (record.timestamps.length >= AI_CONFIG.RATE_LIMIT_PER_MINUTE) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + 60000 - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
      reason: `Too many rapid requests. Please wait ${retryAfterSeconds} seconds before sending another question.`,
    };
  }

  // Allowed: Record current timestamp and increment daily count
  record.timestamps.push(now);
  record.dayCount += 1;
  return { allowed: true };
}
