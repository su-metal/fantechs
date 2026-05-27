"use client";
import { useState } from "react";
import ContentRenderer from "@/components/ContentRenderer";
import { KNOWLEDGE } from "@/lib/knowledge";

type Article = {
  title: string;
  category: string;
  tags: string[];
  content: string;
};

type Message = { role: "user" | "assistant"; content: string };

const categoryLabels: Record<string, string> = {
  electrical: "⚡ 電気",
  audio: "🔊 音響",
  lighting: "💡 照明",
  video: "📹 映像",
};

export default function AdminClient() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "どんな記事を追加しますか？\n例：「音響のEQの使い方について記事を作って」" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    setPreview(null);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json() as { article?: Article; error?: string };
      if (data.article) {
        setPreview(data.article);
        setMessages((p) => [
          ...p,
          { role: "assistant", content: `「${data.article!.title}」の記事を生成しました。下のプレビューを確認して保存してください。` },
        ]);
      } else {
        setMessages((p) => [...p, { role: "assistant", content: data.error ?? "生成に失敗しました" }]);
      }
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "エラーが発生しました" }]);
    }
    setLoading(false);
  };

  const save = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });
      if (res.ok) {
        setSaved(true);
        setMessages((p) => [...p, { role: "assistant", content: `✅ 保存しました！カテゴリ「${categoryLabels[preview.category]}」に追加されました。` }]);
        setPreview(null);
      } else {
        const data = await res.json() as { error?: string };
        alert(data.error ?? "保存に失敗しました");
      }
    } catch {
      alert("保存に失敗しました");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Chat */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-2.5 text-sm font-bold">💬 AIと会話して記事を生成</div>
        <div className="p-4 flex flex-col gap-2.5 max-h-72 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-4 py-2 rounded-xl text-slate-400 text-lg">…</div>
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && generate()}
            placeholder="例：DMXアドレスの設定方法について記事を作って"
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-400 bg-slate-50"
          />
          <button
            onClick={generate}
            disabled={loading || !input.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors ${
              loading || !input.trim() ? "bg-slate-300" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            生成
          </button>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-bold">📄 プレビュー</span>
            <span className="text-xs opacity-80">{categoryLabels[preview.category]}</span>
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">{preview.title}</h2>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {preview.tags.map((t) => (
                <span key={t} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">{t}</span>
              ))}
            </div>
            <div className="text-sm">
              <ContentRenderer content={preview.content} />
            </div>
          </div>
          <div className="border-t border-slate-100 p-3 flex gap-2">
            <button
              onClick={() => { setPreview(null); setInput("もう一度生成して"); }}
              className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
            >
              やり直し
            </button>
            <button
              onClick={save}
              disabled={saving || saved}
              className={`flex-1 py-2 rounded-xl text-sm font-bold text-white transition-colors ${
                saved ? "bg-emerald-400" : saving ? "bg-slate-300" : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {saved ? "✅ 保存済み" : saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-widest">カテゴリ</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(KNOWLEDGE).map(([key, c]) => (
            <div key={key} className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
              <span className="text-xl">{c.icon}</span>
              <div>
                <p className="text-sm font-bold text-slate-700">{c.label}</p>
                <p className="text-xs text-slate-400">{c.articles.length} 記事（静的）</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
