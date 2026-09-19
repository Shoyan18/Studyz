import prisma from '@/lib/db';

interface RecordUsageParams {
  userId: string;
  conversationId?: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

/**
 * Persists AI token usage metadata for tracking and future telemetry
 */
export async function recordAIUsage(params: RecordUsageParams): Promise<void> {
  try {
    await prisma.aIUsage.create({
      data: {
        userId: params.userId,
        conversationId: params.conversationId || null,
        model: params.model,
        inputTokens: params.inputTokens || 0,
        outputTokens: params.outputTokens || 0,
      },
    });
  } catch (err) {
    console.error('Failed to log AI token usage:', err);
  }
}
