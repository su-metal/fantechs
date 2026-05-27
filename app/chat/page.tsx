"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string };

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "こんにちは！電気・音響・照明・映像に関する業務上の疑問に答えます。何でも聞いてください。",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: msg }],
        }),
      });
      const data = await res.json();
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: data.content ?? "回答を取得できませんでした。",
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "エラーが発生しました。もう一度お試しください。" },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div
        className="text-white px-4 pt-4 pb-5 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #1e293b, #334155)" }}
      >
        <Link
          href="/"
          className="inline-block bg-white/20 text-white px-3 py-1.5 rounded-full text-xs mb-3 hover:bg-white/30 transition-colors"
        >
          ← ホーム
        </Link>
        <h1 className="text-lg font-bold mb-0.5">🤖 AIに質問する</h1>
        <p className="text-xs opacity-70">電気・音響・照明・映像の疑問を何でも</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-slate-800 rounded-2xl rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-sm shadow-sm text-xl text-slate-400">
              …
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-3 py-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="質問を入力..."
          className="flex-1 border border-slate-200 rounded-3xl px-4 py-2.5 text-sm outline-none bg-slate-50 focus:bg-white focus:border-slate-400 transition-colors"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className={`w-11 h-11 rounded-full text-white flex items-center justify-center flex-shrink-0 transition-colors ${
            loading || !input.trim()
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
