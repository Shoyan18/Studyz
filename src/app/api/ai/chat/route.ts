import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  AI_CONFIG,
  getEffectiveGeminiApiKey,
  checkRateLimit,
  buildStudyContext,
  buildSystemInstruction,
  streamGeminiChat,
  recordAIUsage,
  ChatHistoryItem,
} from '@/lib/ai/provider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user securely
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to use STUDYZ AI.' },
        { status: 401 }
      );
    }

    // 2. Server-side Rate Limiting
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason || 'Rate limit exceeded. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds || 60) } }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json(
        { error: 'Message content cannot be empty.' },
        { status: 400 }
      );
    }

    const messageContent = body.message.trim();
    if (messageContent.length > AI_CONFIG.MAX_INPUT_CHARS) {
      return NextResponse.json(
        { error: `Message exceeds maximum allowed length of ${AI_CONFIG.MAX_INPUT_CHARS} characters.` },
        { status: 400 }
      );
    }

    let conversationId = body.conversationId as string | undefined;

    // 4. Conversation ownership & creation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id, // Strictly user-owned
        },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found or access denied.' },
          { status: 403 }
        );
      }
    } else {
      // Deterministically generate a concise initial title from first prompt
      let generatedTitle = messageContent
        .replace(/[^\w\s\-\+\=]/gi, '')
        .trim()
        .slice(0, 32);
      if (generatedTitle.length > 0) {
        generatedTitle = generatedTitle.charAt(0).toUpperCase() + generatedTitle.slice(1);
      } else {
        generatedTitle = 'Study Session';
      }

      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: generatedTitle,
          lastMessagePreview: messageContent.slice(0, 80),
        },
      });
      conversationId = conversation.id;
    }

    // 5. Save user message to database
    await prisma.message.create({
      data: {
        conversationId,
        role: 'USER',
        content: messageContent,
      },
    });

    // 6. Load bounded conversation history for context continuity
    const previousDbMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: AI_CONFIG.MAX_HISTORY_MESSAGES,
    });

    // Format previous messages (excluding the one we just created)
    const historyItems: ChatHistoryItem[] = previousDbMessages
      .slice(0, -1)
      .map((m) => ({
        role: (m.role === 'ASSISTANT' ? 'ASSISTANT' : 'USER') as 'USER' | 'ASSISTANT',
        content: m.content,
      }));

    // 7. Assemble system prompt with student study context
    const studyContext = await buildStudyContext(user.id);
    const systemInstruction = buildSystemInstruction(studyContext);

    const requestedModel = typeof body.model === 'string' ? body.model : AI_CONFIG.DEFAULT_MODEL;

    // 8. Stream Gemini response
    const { stream, onComplete } = await streamGeminiChat({
      history: historyItems,
      prompt: messageContent,
      systemInstruction,
      modelName: requestedModel,
    });


    // 9. Asynchronously handle database persistence once stream finishes
    onComplete
      .then(async (result) => {
        if (result.text && result.text.trim()) {
          // Persist assistant message
          await prisma.message.create({
            data: {
              conversationId: conversationId!,
              role: 'ASSISTANT',
              content: result.text.trim(),
            },
          });

          // Update conversation lastMessagePreview and updatedAt
          await prisma.conversation.update({
            where: { id: conversationId },
            data: {
              lastMessagePreview: result.text.trim().slice(0, 100),
              updatedAt: new Date(),
            },
          });

          // Record token telemetry
          await recordAIUsage({
            userId: user.id,
            conversationId,
            model: AI_CONFIG.DEFAULT_MODEL,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to persist complete AI message:', err);
      });

    // 10. Return streaming response with custom conversation ID header
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Conversation-Id': conversationId,
        'X-Conversation-Title': encodeURIComponent(conversation.title),
      },
    });
  } catch (err: any) {
    console.error('AI Chat API Error:', err);
    const message =
      err?.message ||
      "STUDYZ AI couldn't respond right now. Please verify your GEMINI_API_KEY and network connection.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

