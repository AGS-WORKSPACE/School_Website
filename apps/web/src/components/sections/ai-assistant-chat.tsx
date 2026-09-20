"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Textarea } from "@tau/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTED_PROMPTS = [
  "When are the application deadlines?",
  "What is the tuition fee structure?",
  "Which programmes does NAU offer?",
  "How can I apply for a scholarship?",
  "Tell me about campus life and hostels.",
  "What research does NAU do?",
];

function answerFor(query: string) {
  const text = query.toLowerCase();
  if (/(deadline|apply|admission|entrance|jamb|requirements)/.test(text)) {
    return "Admission dates and requirements vary by programme. Check the Admissions page or contact the Registrar for current details.";
  }
  if (/(tuition|fee|cost|scholarship|bursary|finance)/.test(text)) {
    return "Fees and funding depend on the programme and session. Check the Tuition page for the latest published information.";
  }
  if (/(programme|program|course|medicine|nursing|pharmacy|degree)/.test(text)) {
    return "Explore the Study menu for programmes and entry routes at Nnamdi Azikiwe University.";
  }
  if (/(campus|hostel|accommodation|life|sport|club|dining)/.test(text)) {
    return "The main university campus is in Awka, Anambra State. See Student Life for facilities and accommodation information.";
  }
  if (/(research|lab|publication|grant|innovation)/.test(text)) {
    return "Visit Research & Innovation for information about research activity and opportunities.";
  }
  if (/(contact|email|phone|location|where|visit)/.test(text)) {
    return "Nnamdi Azikiwe University is in Awka, Anambra State. Contact the Registrar at registrar@unizik.edu.ng or +234 816 495 8768.";
  }
  return "I can help you find admissions, programmes, campus, research and contact pages. Try a suggested question below.";
}

export function AiAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Hello, I am the NAU Virtual Assistant. Ask me anything about admissions, programmes, tuition, campus life, or research at NAU.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (raw: string) => {
    const value = raw.trim();
    if (!value || typing) return;
    const reply = answerFor(value);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text: value }]);
    setDraft("");
    setTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: reply }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b bg-gradient-to-r from-navy to-medical px-6 py-4 text-white">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Sparkles className="size-5 text-gold-light" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="font-display font-bold">NAU Virtual Assistant</p>
            <p className="text-xs text-white/70">University information · Available 24/7</p>
          </div>
        </div>

        <div ref={scrollRef} className="h-[26rem] space-y-4 overflow-y-auto p-6" role="log" aria-label="Assistant conversation">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex items-start gap-3", message.role === "user" && "flex-row-reverse")}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  message.role === "assistant" ? "bg-medical/10 text-medical" : "bg-navy text-white",
                )}
              >
                {message.role === "assistant" ? <Bot className="size-4" aria-hidden="true" /> : <UserRound className="size-4" aria-hidden="true" />}
              </span>
              <p
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "assistant"
                    ? "rounded-tl-sm bg-muted text-foreground"
                    : "rounded-tr-sm bg-medical text-white",
                )}
              >
                {message.text}
              </p>
            </div>
          ))}
          {typing ? (
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-medical/10 text-medical">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3" aria-label="Assistant is typing">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t bg-muted/40 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                disabled={typing}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-medical/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Type your question…"
              rows={1}
              className="min-h-[3.25rem] resize-none rounded-2xl py-3"
            />
            <Button type="submit" size="icon" className="size-13 shrink-0 rounded-2xl" aria-label="Send message">
              <Send aria-hidden="true" />
            </Button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            The assistant provides general guidance based on official university information. For personal matters,
            contact the relevant office directly.
          </p>
        </div>
      </div>
    </div>
  );
}
