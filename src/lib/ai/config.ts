import prisma from '@/lib/db';

export const AI_AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Fast & Recommended)', provider: 'gemini' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash (High Intelligence)', provider: 'gemini' },
] as const;

export const AI_CONFIG = {
  DEFAULT_PROVIDER: 'gemini',
  DEFAULT_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  MAX_HISTORY_MESSAGES: 20,
  RATE_LIMIT_PER_MINUTE: Number(process.env.AI_REQUESTS_PER_MINUTE) || 30,
  RATE_LIMIT_PER_DAY: Number(process.env.AI_REQUESTS_PER_DAY) || 500,
  MAX_INPUT_CHARS: 8000,
};

/**
 * Retrieves the effective Gemini API key:
 * 1. Checks runtime SystemSetting database value (configured by admin via UI)
 * 2. Fallbacks to server environment variable GEMINI_API_KEY / GOOGLE_API_KEY
 */
export async function getEffectiveGeminiApiKey(): Promise<{ key: string | null; source: 'DATABASE' | 'ENV' | 'NONE' }> {
  try {
    const dbKeySetting = await prisma.systemSetting.findUnique({
      where: { key: 'gemini_api_key' },
    });

    if (dbKeySetting && dbKeySetting.value && dbKeySetting.value.trim() !== '') {
      return { key: dbKeySetting.value.trim(), source: 'DATABASE' };
    }
  } catch (err) {
    console.error('Error fetching system setting for Gemini API key:', err);
  }

  const envKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (envKey && envKey.trim() !== '' && envKey !== 'your-gemini-api-key-here') {
    return { key: envKey.trim(), source: 'ENV' };
  }

  return { key: null, source: 'NONE' };
}

/**
 * Retrieves the configured AI model from SystemSetting or fallback to env/default
 */
export async function getEffectiveAIModel(): Promise<string> {
  try {
    const dbModelSetting = await prisma.systemSetting.findUnique({
      where: { key: 'ai_model' },
    });

    if (dbModelSetting && dbModelSetting.value) {
      return dbModelSetting.value.trim();
    }
  } catch (err) {
    console.error('Error fetching system setting for AI model:', err);
  }

  return process.env.GEMINI_MODEL || AI_CONFIG.DEFAULT_MODEL;
}

/**
 * Helper to produce a secure, masked string representation of an API key
 * e.g. "••••••••••••••••••••••••ab12"
 */
export function maskApiKey(key: string | null): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 6) return '••••••••••••';
  const lastChars = trimmed.slice(-4);
  return `••••••••••••••••••••••••${lastChars}`;
}
