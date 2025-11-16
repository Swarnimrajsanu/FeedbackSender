import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Try different model names - start with the most common ones
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-pro', 
      'gemini-pro',
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash'
    ];
    
    let result;
    let lastError: unknown;
    
    // Try each model until one works
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        console.log(`Successfully used model: ${modelName}`);
        break;
      } catch (modelError: unknown) {
        const error = modelError as { message?: string };
        console.log(`Model ${modelName} failed:`, error?.message);
        lastError = modelError;
        continue;
      }
    }
    
    if (!result) {
      const lastErr = lastError as { message?: string } | undefined;
      throw new Error(`All models failed. Last error: ${lastErr?.message || 'Unknown error'}. Available models to try: ${modelNames.join(', ')}`);
    }
    
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; statusText?: string; errorDetails?: unknown };
    console.error('Error generating suggestions with Gemini:', error);
    console.error('Error details:', {
      message: err?.message,
      status: err?.status,
      statusText: err?.statusText,
      errorDetails: err?.errorDetails,
    });
    
    const errorMessage = err?.message || 'Failed to generate suggestions';
    const errorStatus = err?.status || 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: err?.errorDetails || err?.statusText 
      },
      { status: errorStatus }
    );
  }
}
