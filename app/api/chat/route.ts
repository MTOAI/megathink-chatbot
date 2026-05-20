import { NextRequest, NextResponse } from "next/server";
import tutorsData from "@/data/tutors.json";
import siteData from "@/data/site.json";

// ─── Types ────────────────────────────────────────────────
interface Tutor {
  name: string;
  subjects: string[];
  curriculum: string[];
  level: string[];
  bio: string;
  permalink: string;
}

interface SitePage {
  url: string;
  content: string;
}

// ─── Build lighter system prompt (IMPORTANT: keep small!) ──
function buildSystemPrompt(): string {
  const tutors = (tutorsData as Tutor[]).slice(0, 15); // ✅ limit size
  const pages = (siteData as SitePage[]).slice(0, 5);

  const tutorBlock = tutors
    .map(t => `${t.name} | ${t.subjects.join(", ")} | ${t.permalink}`)
    .join("\n");

  const siteBlock = pages
    .map(p => `[${p.url}] ${p.content.substring(0, 200)}`)
    .join("\n");

  return `
You are MegaBot, the AI assistant for Mega Think Online.

Help users:
- Find tutors
- Recommend subjects
- Explain courses

TUTORS:
${tutorBlock}

SITE:
${siteBlock}

Rules:
- Be concise and helpful
- Recommend max 3 tutors
- Always include tutor link
- If off-topic → redirect to tutoring
`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

// ─── SIMPLE CACHE (free performance boost) ────────────────
const cache = new Map<string, string>();

// ─── OpenRouter FREE AI ───────────────────────────────────
async function generateReply(prompt: string) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free", // ✅ FREE
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("OpenRouter error:", data);
    throw new Error("AI failed");
  }

  return data.choices?.[0]?.message?.content || "No response";
}

// ─── API Route ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    console.log("✅ FREE AI VERSION RUNNING");

    const { messages } = await req.json();

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Convert chat history → simple text
    const conversation = messages
      .map((m: any) =>
        (m.role === "assistant" ? "MegaBot" : "User") + ": " + m.content
      )
      .join("\n\n");

    // ✅ Cache check
    const cacheKey = conversation.slice(-500);
    if (cache.has(cacheKey)) {
      return NextResponse.json({
        reply: cache.get(cacheKey),
        cached: true,
      });
    }

    // ✅ Generate AI reply
    const reply = await generateReply(conversation);

    // ✅ Store cache
    cache.set(cacheKey, reply);

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("[/api/chat]", err);

    return NextResponse.json({
      reply: "⚠️ AI is busy right now. Please try again 😊",
    });
  }
}

// ─── CORS (optional) ──────────────────────────────────────
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
