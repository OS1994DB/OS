"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Msg = { id: string; body: string; createdAt: string; author: { id: string; name: string } };

export function ChatRoom({ meId }: { meId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const lastId = useRef("");

  async function load() {
    try {
      const res = await fetch("/api/chat", { cache: "no-store" });
      if (res.ok) setMessages(await res.json());
    } catch {
      /* transient network error: next poll retries */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const last = messages[messages.length - 1]?.id ?? "";
    if (last !== lastId.current) {
      lastId.current = last;
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not send.");
      return;
    }
    setText("");
    load();
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-ink-600">No messages yet — say hello.</p>}
        {messages.map((m) => {
          const mine = m.author.id === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl2 px-3 py-2 text-sm ${mine ? "bg-brand-50 text-brand-700" : "bg-ink-700/10 text-ink-800"}`}>
                <p className="mb-0.5 text-xs text-ink-600">
                  {mine ? "You" : m.author.name} · {new Date(m.createdAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="border-t border-ink-700/10 p-3">
        {error && <p className="mb-2 text-sm text-coral-700">{error}</p>}
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Message the team…" className="field flex-1" />
          <button type="submit" className="btn-primary">Send</button>
        </div>
      </form>
    </div>
  );
}
