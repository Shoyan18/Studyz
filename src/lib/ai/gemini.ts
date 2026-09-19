import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AI_CONFIG,
  getEffectiveGeminiApiKey,
  getEffectiveAIModel,
} from './config';

export interface ChatHistoryItem {
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
}

export interface StreamResponse {
  stream: ReadableStream<Uint8Array>;
  onComplete: Promise<{ text: string; inputTokens?: number; outputTokens?: number }>;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  model: string;
  provider: string;
}

/**
 * Maps database message roles to Gemini API roles ('user' | 'model')
 */
function mapToGeminiContents(history: ChatHistoryItem[], currentPrompt: string) {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Add historical context
  for (const item of history) {
    if (item.role === 'USER') {
      contents.push({
        role: 'user',
        parts: [{ text: item.content }],
      });
    } else if (item.role === 'ASSISTANT') {
      contents.push({
        role: 'model',
        parts: [{ text: item.content }],
      });
    }
  }

  // Add current user prompt
  contents.push({
    role: 'user',
    parts: [{ text: currentPrompt }],
  });

  return contents;
}

/**
 * Tests connection to Google Gemini API
 */
export async function testGeminiConnection(
  explicitKey?: string,
  explicitModel?: string
): Promise<TestConnectionResult> {
  const { key: effectiveKey } = await getEffectiveGeminiApiKey();
  const apiKey = (explicitKey && explicitKey.trim() !== '') ? explicitKey.trim() : effectiveKey;
  const modelName = explicitModel || (await getEffectiveAIModel()) || AI_CONFIG.DEFAULT_MODEL;

  if (!apiKey) {
    return {
      success: false,
      message: 'No API key configured. Please enter and save a valid Gemini API key.',
      model: modelName,
      provider: 'Google Gemini',
    };
  }

  const startTime = Date.now();
  const fallbackModels = [modelName, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  const modelCandidates = Array.from(new Set(fallbackModels));
  const genAI = new GoogleGenerativeAI(apiKey);

  let text = '';
  let usedModel = modelName;
  let lastError: any = null;

  try {
    for (const candidate of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: candidate });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'Respond strictly with "OK".' }] }],
        });
        const response = await result.response;
        text = response.text();
        usedModel = candidate;
        if (text && text.trim().length > 0) break;
      } catch (err: any) {
        lastError = err;
      }
    }

    const latencyMs = Date.now() - startTime;

    if (text && text.trim().length > 0) {
      return {
        success: true,
        message: 'Gemini connection successful',
        latencyMs,
        model: usedModel,
        provider: 'Google Gemini',
      };
    } else if (lastError) {
      throw lastError;
    } else {
      return {
        success: false,
        message: 'Received empty response from Gemini API.',
        latencyMs,
        model: modelName,
        provider: 'Google Gemini',
      };
    }
  } catch (err: any) {
    console.error('Gemini connection test failed:', err);
    const rawError = err?.message || '';

    let friendlyError = 'Unable to connect to Google Gemini. Please check your API key.';
    if (rawError.includes('API_KEY_INVALID') || rawError.includes('API key not valid')) {
      friendlyError = 'Invalid Gemini API key. Please check your key in Google AI Studio.';
    } else if (rawError.includes('QUOTA_EXCEEDED') || rawError.includes('RESOURCE_EXHAUSTED')) {
      friendlyError = 'Gemini API quota exceeded or rate limit hit. Please check your billing/tier.';
    } else if (rawError.includes('PERMISSION_DENIED')) {
      friendlyError = 'Permission denied for this Gemini model. Verify your API key permissions.';
    } else if (rawError.includes('404') || rawError.includes('model not found')) {
      friendlyError = `Model "${modelName}" not found or unsupported for this API key.`;
    }

    return {
      success: false,
      message: friendlyError,
      latencyMs: Date.now() - startTime,
      model: modelName,
      provider: 'Google Gemini',
    };
  }
}

/**
 * Generates streaming AI content using Google Gemini SDK with automatic model fallbacks
 */
export async function streamGeminiChat(options: {
  history: ChatHistoryItem[];
  prompt: string;
  systemInstruction: string;
  modelName?: string;
}): Promise<StreamResponse> {
  const { key: apiKey } = await getEffectiveGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in .env.'
    );
  }

  const configuredModel = options.modelName || (await getEffectiveAIModel()) || AI_CONFIG.DEFAULT_MODEL;
  const fallbackModels = [configuredModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  // Unique model candidates list
  const modelCandidates = Array.from(new Set(fallbackModels));

  const genAI = new GoogleGenerativeAI(apiKey);
  const contents = mapToGeminiContents(options.history, options.prompt);

  let result: any = null;
  let usedModel = configuredModel;
  let lastError: any = null;

  // Try model candidates in order
  for (const modelCandidate of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelCandidate,
        systemInstruction: options.systemInstruction,
      });

      result = await model.generateContentStream({ contents });
      usedModel = modelCandidate;
      break;
    } catch (err: any) {
      console.warn(`Gemini model "${modelCandidate}" failed, trying fallback...`, err?.message || err);
      lastError = err;
    }
  }

  if (!result) {
    throw lastError || new Error(`Failed to generate content with model ${configuredModel}.`);
  }

  const encoder = new TextEncoder();
  let fullAccumulatedText = '';
  let resolveComplete: (val: { text: string; inputTokens?: number; outputTokens?: number }) => void;
  const onCompletePromise = new Promise<{ text: string; inputTokens?: number; outputTokens?: number }>(
    (resolve) => {
      resolveComplete = resolve;
    }
  );

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            fullAccumulatedText += chunkText;
            const sseData = `data: ${JSON.stringify({ chunk: chunkText })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
        }

        // Get usage metadata if available
        let inputTokens = 0;
        let outputTokens = 0;
        try {
          const response = await result.response;
          const usage = response.usageMetadata;
          if (usage) {
            inputTokens = usage.promptTokenCount || 0;
            outputTokens = usage.candidatesTokenCount || 0;
          }
        } catch {
          // Token extraction fallback
        }

        // Send completion event
        const endEvent = `data: ${JSON.stringify({ done: true, fullText: fullAccumulatedText, model: usedModel })}\n\n`;
        controller.enqueue(encoder.encode(endEvent));
        controller.close();

        resolveComplete({
          text: fullAccumulatedText,
          inputTokens,
          outputTokens,
        });
      } catch (err: any) {
        console.error('Error during Gemini stream generation:', err);
        const errorMessage = err?.message || 'Error occurred while streaming AI response.';
        const errorEvent = `data: ${JSON.stringify({ error: errorMessage })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
        controller.close();

        resolveComplete({
          text: fullAccumulatedText,
        });
      }
    },
  });

  return {
    stream,
    onComplete: onCompletePromise,
  };
}

