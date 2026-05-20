"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

// ─── Quick-start suggestion chips ─────────────────────────────────────────────
const CHIPS = [
  "Find a Maths tutor",
  "DSE English tutors",
  "Chemistry or Physics tutor",
  "Primary school tutors",
  "Chinese language tutors",
  "How does it work?",
];

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#94a3b8",
            display: "inline-block",
            animation: "bounce 1.2s infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Bot avatar ───────────────────────────────────────────────────────────────
function BotAvatar() {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #0f2a6e 0%, #2563eb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 800,
        color: "#fbbf24",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(26,60,143,0.35)",
        fontFamily: "'DM Serif Display', serif",
      }}
    >
      M
    </div>
  );
}

// ─── Render markdown-lite (bold + line breaks) ────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n•/g, "<br/>•")
    .replace(/\n-\s/g, "<br/>• ")
    .replace(/\n/g, "<br/>");
}

// ─── Main Chat Widget ─────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there! 👋 I'm **MegaBot**, your guide to finding the perfect tutor or course at Mega Think Online.\n\nTell me:\n• What subject do you need help with?\n• Which curriculum? (IB / DSE / IGCSE / Primary)\n• Any language or schedule preference?\n\nI'll find the right match for you!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    setShowChips(false);
    setInput("");

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const reply: string =
        data.reply ?? data.error ?? "Sorry, something went wrong.";

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect. Please check your internet and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#f8fafc",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f2a6e 0%, #1a3c8f 60%, #1d4ed8 100%)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "rgba(251,191,36,0.15)",
            border: "2px solid rgba(251,191,36,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontFamily: "'DM Serif Display', serif",
            color: "#fbbf24",
          }}
        >
          M
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 14.5,
              fontFamily: "'DM Serif Display', serif",
              letterSpacing: "0.02em",
            }}
          >
            MegaBot
          </p>
          <p
            style={{
              color: "#93c5fd",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                boxShadow: "0 0 6px #4ade80",
                animation: "pulse-dot 2s infinite",
              }}
            />
            Course &amp; Tutor Finder · Mega Think Online
          </p>
        </div>
        <a
          href="https://www.megathinkonline.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            padding: "4px 10px",
            color: "#e0e7ff",
            fontSize: 11,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Visit ↗
        </a>
      </div>

      {/* ── Curriculum strip ── */}
      <div
        style={{
          background: "linear-gradient(90deg, #1a3c8f 0%, #2563eb 100%)",
          padding: "5px 14px",
          display: "flex",
          gap: 7,
          overflowX: "auto",
          flexShrink: 0,
        }}
      >
        {["IB", "DSE", "IGCSE", "Primary", "A-Level"].map((c) => (
          <span
            key={c}
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 10,
              color: "#e0e7ff",
              fontWeight: 600,
              whiteSpace: "nowrap",
              letterSpacing: "0.05em",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className="msg-animate"
            style={{
              display: "flex",
              flexDirection: m.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            {m.role === "assistant" && <BotAvatar />}
            <div
              style={{
                maxWidth: "78%",
                padding: "10px 14px",
                borderRadius:
                  m.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                fontSize: 13.5,
                lineHeight: 1.65,
                color: m.role === "user" ? "#fff" : "#1e293b",
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg, #1a3c8f 0%, #2563eb 100%)"
                    : "#ffffff",
                boxShadow:
                  m.role === "user"
                    ? "0 2px 12px rgba(26,60,143,0.3)"
                    : "0 1px 6px rgba(0,0,0,0.08)",
                border: m.role === "assistant" ? "1px solid #f1f5f9" : "none",
                whiteSpace: "pre-wrap",
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
            />
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div
            className="msg-animate"
            style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
          >
            <BotAvatar />
            <div
              style={{
                background: "#fff",
                border: "1px solid #f1f5f9",
                borderRadius: "18px 18px 18px 4px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}

        {/* Suggestion chips — shown on first load only */}
        {showChips && !loading && (
          <div
            className="msg-animate"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              paddingLeft: 38,
            }}
          >
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => send(chip)}
                style={{
                  background: "#fff",
                  border: "1.5px solid #dbeafe",
                  borderRadius: 20,
                  padding: "5px 13px",
                  fontSize: 12,
                  color: "#1a3c8f",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#1a3c8f";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                  (e.currentTarget as HTMLButtonElement).style.color = "#1a3c8f";
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        style={{
          padding: "12px 14px 16px",
          background: "#fff",
          borderTop: "1px solid #f1f5f9",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about subjects, tutors, availability…"
            disabled={loading}
            style={{
              flex: 1,
              border: "1.5px solid #e2e8f0",
              borderRadius: 14,
              padding: "10px 14px",
              fontSize: 13.5,
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              color: "#1e293b",
              background: "#f8fafc",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) =>
              ((e.target as HTMLInputElement).style.borderColor = "#1a3c8f")
            }
            onBlur={(e) =>
              ((e.target as HTMLInputElement).style.borderColor = "#e2e8f0")
            }
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #1a3c8f 0%, #2563eb 100%)",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(26,60,143,0.35)",
              flexShrink: 0,
              opacity: loading || !input.trim() ? 0.45 : 1,
              transition: "opacity 0.18s, transform 0.18s",
            }}
            onMouseEnter={(e) => {
              if (!loading && input.trim())
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
            }}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: 10,
            color: "#94a3b8",
            marginTop: 8,
            letterSpacing: "0.03em",
          }}
        >
          Powered by Gemini AI · megathinkonline.com
        </p>
      </div>
    </div>
  );
}
