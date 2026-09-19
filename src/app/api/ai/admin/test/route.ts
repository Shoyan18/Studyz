import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { getAIProvider } from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

// POST /api/ai/admin/test — Test AI Provider Connection (Admin only)
export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { apiKey, model, provider: providerId } = body;

    const provider = getAIProvider(providerId || 'gemini');
    const result = await provider.testConnection(apiKey, model);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error during AI admin test connection:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while testing provider connection.',
        provider: 'Google Gemini',
      },
      { status: 500 }
    );
  }
}
