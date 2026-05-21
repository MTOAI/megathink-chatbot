import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import tutorsData from "@/data/tutors.json";
import siteData from "@/data/site.json";

interface Tutor {
  id: string;
  name: string;
  subjects: string[];
  curriculum: string[];
  level: string[];
  university: string[];
  bio: string;
  permalink: string;
}

interface SitePage {
  url: string;
  content: string;
}

function buildSystemPrompt(): string {
  const tutors = tutorsData as Tutor[];
  const pages  = siteData  as SitePage[];

  const tutorBlock = tutors.map(t =>
    `• ${t.name} | Subjects: ${t.subjects.join(", ")} | Curriculum: ${t.curriculum.join("/")} ` +
    `| Level: ${t.level.join(", ")} | University: ${t.university.join(", ") || "N/A"} ` +
    `| Profile: ${t.permalink} | Bio: ${t.bio}`
  ).join("\n");

  const siteBlock = pages.map(p => `[${p.url}]\n${p.content}`).join("\n\n---\n\n");

  return `You are MegaBot, the friendly AI assistant for Mega Think Online (megathinkonline.com) — Hong Kong's leading online tutoring platform for IB, DSE, IGCSE, and Primary students.

YOUR ONLY PURPOSE is to help users:
1. Find the right tutor based on subject, curriculum, level, and needs
2. Understand what subjects and courses are available
3. Learn how Mega Think Online works and how to get started

FULL TUTOR DATABASE (${tutors.length} tutors):
${tutorBlock}

PLATFORM INFORMATION:
${siteBlock}

MATCHING RULES:
1. Match by SUBJECT first (mandatory)
2. Then filter by CURRICULUM (IB/DSE/IGCSE/A-Level) if mentioned
3. Then filter by LEVEL (Primary/Secondary) if mentioned
4. Always include the tutor profile link so the user can book
5. Recommend 1-3 tutors max; explain WHY each one fits
6. Always end with a next step (visit profile or contact megathinkonline.com)

STRICT SCOPE:
- Only answer about tutoring, courses, tutors, or Mega Think Online services
- Off-topic: reply "I'm here to help you find the perfect tutor! What subject are you looking for?"
- Never invent tutors or facts not in the database above
- Respond in the same language as the user (English or Traditional Chinese)
- Keep replies friendly, concise, and encouraging`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

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

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: { role: string; content: string }[];
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return NextResponse.json({ error: "API key not configured." }, { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content,
      })),
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I could not generate a response.";

    return NextResponse.json(
      { reply },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json({ error: "AI error — please try again." }, { status: 500 });
  }
}
