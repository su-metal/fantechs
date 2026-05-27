"use client";
import { useState, useEffect } from "react";
import { KNOWLEDGE } from "@/lib/knowledge";

type Article = {
  id: string;
  category: string;
  title: string;
  tags: string[];
  content: string;
  sort_order: number;
  created_at: string;
};

const categoryKeys = Object.keys(KNOWLEDGE);

export default function ArticleManager() {
  const [selectedCategory, setSelectedCategory] = useState(categoryKeys[0]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [fetchedFor, setFetchedFor] = useState({ category: "", key: -1 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", tags: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const loading = fetchedFor.category !== selectedCategory || fetchedFor.key !== refreshKey;
  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let active = true;
    const cat = selectedCategory;
    const key = refreshKey;
    fetch(`/api/articles?category=${cat}`)
      .then((r) => r.json() as Promise<Article[]>)
      .then((data) => {
        if (active) {
          setArticles(data);
          setFetchedFor({ category: cat, key });
        }
      })
      .catch(() => {
        if (active) {
          setArticles([]);
          setFetchedFor({ category: cat, key });
        }
      });
    return () => {
      active = false;
    };
  }, [selectedCategory, refreshKey]);

  const startEdit = (a: Article) => {
    setEditingId(a.id);
    setEditForm({ title: a.title, tags: a.tags.join(", "), content: a.content });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
          content: editForm.content.trim(),
        }),
      });
      if (res.ok) {
        setEditingId(null);
        refresh();
      } else {
        alert("保存に失敗しました");
      }
    } catch {
      alert("保存に失敗しました");
    }
    setSaving(false);
  };

  const deleteArticle = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert("削除に失敗しました");
      }
    } catch {
      alert("削除に失敗しました");
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= articles.length) return;
    const newArticles = [...articles];
    [newArticles[index], newArticles[target]] = [newArticles[target], newArticles[index]];
    setArticles(newArticles);
    setReordering(true);
    try {
      await fetch("/api/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newArticles.map((a) => a.id) }),
      });
    } catch {
      refresh();
    }
    setReordering(false);
  };

  const cat = KNOWLEDGE[selectedCategory];
  const staticCount = cat.articles.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Category selector */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-widest">カテゴリ</p>
        <div className="flex flex-wrap gap-2">
          {categoryKeys.map((key) => {
            const c = KNOWLEDGE[key];
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => { setSelectedCategory(key); setEditingId(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  isSelected ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={isSelected ? { background: c.color } : {}}
              >
                {c.icon} {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* DB article list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div
          className="px-4 py-2.5 flex items-center justify-between text-white text-sm font-bold"
          style={{ background: cat.color }}
        >
          <span>{cat.icon} {cat.label} — 追加記事</span>
          {loading && <span className="text-xs opacity-75">読み込み中…</span>}
          {reordering && !loading && <span className="text-xs opacity-75">並び替え中…</span>}
        </div>

        {!loading && articles.length === 0 && (
          <div className="p-6 text-center text-slate-400 text-sm">
            AIで追加された記事はありません
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {articles.map((a, i) =>
            editingId === a.id ? (
              <div key={a.id} className="p-4 bg-amber-50 flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">タイトル</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">タグ（カンマ区切り）</label>
                  <input
                    value={editForm.tags}
                    onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="例: 基礎, 機器"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">内容（Markdown）</label>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                    rows={10}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white font-mono resize-y"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold text-white transition-colors ${
                      saving ? "bg-slate-300" : "bg-amber-500 hover:bg-amber-600"
                    }`}
                  >
                    {saving ? "保存中…" : "保存する"}
                  </button>
                </div>
              </div>
            ) : (
              <div key={a.id} className="px-3 py-3 flex items-center gap-2">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || reordering}
                    className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors text-[10px]"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === articles.length - 1 || reordering}
                    className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors text-[10px]"
                  >
                    ▼
                  </button>
                </div>

                {/* Article info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{a.title}</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {a.tags.map((t) => (
                      <span key={t} className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(a)}
                    title="編集"
                    className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteArticle(a.id, a.title)}
                    title="削除"
                    className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-lg text-sm transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Static articles note */}
      {staticCount > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold">静的記事について：</span>{" "}
          {cat.label}カテゴリには他に <strong>{staticCount}件</strong> の静的記事があります。
          静的記事を編集するには{" "}
          <code className="bg-slate-200 px-1 rounded">lib/knowledge.ts</code>{" "}
          を直接編集してください。
        </div>
      )}
    </div>
  );
}
