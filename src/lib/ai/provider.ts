/**
 * Unified Server-Side AI Provider Architecture for STUDYZ
 */

import { streamGeminiChat, testGeminiConnection, StreamResponse, TestConnectionResult, ChatHistoryItem } from './gemini';

export interface IAIProvider {
  id: string;
  name: string;
  streamChat: (options: {
    history: ChatHistoryItem[];
    prompt: string;
    systemInstruction: string;
    modelName?: string;
  }) => Promise<StreamResponse>;
  testConnection: (apiKey?: string, modelName?: string) => Promise<TestConnectionResult>;
}

export class GeminiProvider implements IAIProvider {
  id = 'gemini';
  name = 'Google Gemini';

  async streamChat(options: {
    history: ChatHistoryItem[];
    prompt: string;
    systemInstruction: string;
    modelName?: string;
  }): Promise<StreamResponse> {
    return streamGeminiChat(options);
  }

  async testConnection(apiKey?: string, modelName?: string): Promise<TestConnectionResult> {
    return testGeminiConnection(apiKey, modelName);
  }
}

/**
 * AI Provider Registry / Factory
 */
const providers: Record<string, IAIProvider> = {
  gemini: new GeminiProvider(),
};

export function getAIProvider(providerId = 'gemini'): IAIProvider {
  const provider = providers[providerId.toLowerCase()];
  if (!provider) {
    return providers.gemini;
  }
  return provider;
}

export * from './config';
export * from './prompts';
export * from './context';
export * from './rateLimiter';
export * from './usage';
export * from './gemini';
