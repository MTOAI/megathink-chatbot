import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import tutorsData from "@/data/tutors.json";
import siteData from "@/data/site.json";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Build system prompt once at startup ──────────────────────────────────────
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

SUBJECT COVERAGE (${tutors.length} verified tutors):
- Maths (10 tutors): Mr Ricky Ng, Ms Nicole Pang, Ms Sanko Tsang, Ms Glory Tsui, Ms Polly Lam, Mr Anson Wong, Mr Edmond Wong, Mr HY Cheung, Ms Bella Ng, Ms Michelle Yeung
- English (6 tutors): Ms Pamela Tsui, Ms Michelle Yeung, Ms Natasha Lui, Ms Chloe Wong, Ms Pui Leung, Ms Tiffany Yau
- Chinese (5 tutors): Ms Mavis Au Yeung, Ms Canny Chan, Ms Boey Fok, Ms Bella Wu, Ms Bella Ng
- Economics (2 tutors): Mr Eddie Fong, Ms Tiffany Yau
- Chemistry (2 tutors): Mr Toby Kwong, Ms Sabrina Cheng
- Physics: Mr Jason Ip
- History: Mr William Cheng | Chinese History: Ms Boey Fok
- Geography: Ms Bella Wu | Science: Ms Sabrina Cheng | Music: Ms Tina Mak

FULL TUTOR DATABASE:
${tutorBlock}

PLATFORM INFORMATION:
${siteBlock}

MATCHING RULES — when recommending tutors:
1. Match by SUBJECT first (mandatory)
2. Then filter by CURRICULUM (IB/DSE/IGCSE/A-Level) if mentioned
3. Then filter by LEVEL (Primary/Secondary) if mentioned
4. Always include the tutor's profile link (permalink) so the user can book
5. Mention 1–3 tutors max per recommendation; don't overwhelm
6. Explain WHY each tutor is a good match based on their bio

STRICT SCOPE:
- Only answer about tutoring, courses, tutors, or Mega Think Online services
- Off-topic questions: "I'm here to help you find the perfect course or tutor! What subject are you looking for? 😊"
- Never invent tutors, prices, or facts not in the database
- Always end with a clear next step (visit profile link, or "Contact us at megathinkonline.com")
- Respond in the same language as the user (English or Traditional Chinese)
- Keep replies friendly, concise, and encouraging`;
}

const SYSTEM_PROMPT = buildSystemPrompt();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ─── CORS preflight ───────────────────────────────────────────────────────────
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

// ─── Chat endpoint ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: { role: string; content: string }[] };

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
    });

    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(messages[messages.length - 1].content);

    return NextResponse.json(
      { reply: result.response.text() },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: "AI error — please try again." }, { status: 500 });
  }
}
