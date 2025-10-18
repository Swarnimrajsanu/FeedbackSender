// src/app/api/gpt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      message, 
      conversationHistory = [], 
      model = 'gpt-4o-mini',
      systemPrompt = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you recently started? || If you could have dinner with any historical figure, who would it be? || What's a book or movie that had a significant impact on you and why?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.` // Default to question generator prompt
    } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt, // Use custom prompt
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract response
    const aiResponse = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      success: true,
      response: aiResponse,
      usage: completion.usage,
    });

  } catch (error: any) {
    console.error('Error in GPT API route:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.status === 500) {
      return NextResponse.json(
        { error: 'OpenAI service error. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Optional: Streaming response
export async function POST_STREAM(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory = [], model = 'gpt-4o-mini' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    const stream = await openai.chat.completions.create({
      model: model,
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Create a readable stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Error in streaming GPT API route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}