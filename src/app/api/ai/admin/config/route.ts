import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  getEffectiveGeminiApiKey,
  getEffectiveAIModel,
  maskApiKey,
  AI_AVAILABLE_MODELS,
} from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

// GET /api/ai/admin/config — Fetch masked AI configuration (Admin only)
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required.' },
        { status: 403 }
      );
    }

    const { key, source } = await getEffectiveGeminiApiKey();
    const currentModel = await getEffectiveAIModel();

    return NextResponse.json({
      isConfigured: !!key,
      maskedKey: maskApiKey(key),
      source,
      provider: 'gemini',
      model: currentModel,
      availableModels: AI_AVAILABLE_MODELS,
    });
  } catch (err) {
    console.error('Error fetching admin AI configuration:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve AI configuration.' },
      { status: 500 }
    );
  }
}

// POST /api/ai/admin/config — Save AI configuration (Admin only)
export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { apiKey, model, provider } = body;

    // Save API key if provided
    if (typeof apiKey === 'string' && apiKey.trim().length > 0) {
      const trimmedKey = apiKey.trim();
      await prisma.systemSetting.upsert({
        where: { key: 'gemini_api_key' },
        create: { key: 'gemini_api_key', value: trimmedKey },
        update: { value: trimmedKey },
      });
    }

    // Save Model if provided
    if (typeof model === 'string' && model.trim().length > 0) {
      const trimmedModel = model.trim();
      // Verify against whitelisted models
      const isValid = AI_AVAILABLE_MODELS.some((m) => m.id === trimmedModel);
      if (!isValid) {
        return NextResponse.json(
          { error: `Invalid model "${trimmedModel}". Must be a supported Gemini model.` },
          { status: 400 }
        );
      }

      await prisma.systemSetting.upsert({
        where: { key: 'ai_model' },
        create: { key: 'ai_model', value: trimmedModel },
        update: { value: trimmedModel },
      });
    }

    // Save Provider if provided
    if (typeof provider === 'string' && provider.trim().length > 0) {
      await prisma.systemSetting.upsert({
        where: { key: 'ai_provider' },
        create: { key: 'ai_provider', value: provider.trim().toLowerCase() },
        update: { value: provider.trim().toLowerCase() },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'AI configuration saved successfully.',
    });
  } catch (err) {
    console.error('Error saving admin AI configuration:', err);
    return NextResponse.json(
      { error: 'Failed to save AI configuration.' },
      { status: 500 }
    );
  }
}
