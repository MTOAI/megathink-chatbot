import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import tutorsData from "@/data/tutors.json";
import siteData from "@/data/site.json";

// --- System Prompt Setup (Keep your original logic) ---
const SYSTEM_PROMPT = `...`; // Insert your full buildSystemPrompt() output here

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid message format." }, { status: 400 });
    }

    // 1. SANITIZATION LAYER: Ensure the first message is ALWAYS from the user
    // This ignores any 'assistant' or 'system' messages that might have been sent first.
    const validMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
    const firstUserIndex = validMessages.findIndex(m => m.role === 'user');

    if (firstUserIndex === -1) {
      return NextResponse.json({ error: "Conversation must start with a user message." }, { status: 400 });
    }

    // Strip everything before the first user message
    const cleanMessages = validMessages.slice(firstUserIndex);

    // 2. PREPARE HISTORY: Everything except the very last message
    const history = cleanMessages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // 3. INITIALIZE MODEL
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
    });

    // 4. SEND MESSAGE
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(cleanMessages[cleanMessages.length - 1].content);

    return NextResponse.json(
      { reply: result.response.text() },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );

  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json({ error: "Failed to connect to AI." }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
