"use client";
import { useState } from "react";
import Link from "next/link";
import { KNOWLEDGE } from "@/lib/knowledge";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults =
    searchQuery.trim().length > 1
      ? Object.entries(KNOWLEDGE).flatMap(([catKey, cat]) =>
          cat.articles
            .filter(
              (a) =>
                a.title.includes(searchQuery) ||
                a.content.includes(searchQuery) ||
                a.tags.some((t) => t.includes(searchQuery))
            )
            .map((a) => ({
              ...a,
              catKey,
              catLabel: cat.label,
              catColor: cat.color,
              catIcon: cat.icon,
            }))
        )
      : [];

  const noSearch = searchQuery.trim().length <= 1;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="text-white px-4 pt-6 pb-7"
        style={{
          background: "linear-gradient(135deg, #1e293b, #334155)",
        }}
      >
        <p className="text-xs opacity-60 tracking-widest mb-1 uppercase">
          Field Knowledge
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">
          現場の業務知識
        </h1>
        <p className="text-sm opacity-70">電気・音響・照明・映像</p>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キーワードで検索..."
            className="w-full border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm bg-white outline-none focus:border-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Search Results */}
      {!noSearch && (
        <div className="px-4 pt-3">
          <p className="text-xs text-slate-400 mb-2">
            検索結果 {searchResults.length} 件
          </p>
          {searchResults.length === 0 ? (
            <div className="bg-white rounded-xl p-4 text-center text-slate-400 text-sm shadow-sm">
              見つかりませんでした
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {searchResults.map((a) => (
                <Link
                  key={a.id}
                  href={`/${a.catKey}/${a.id}`}
                  className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xl">{a.catIcon}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{a.title}</p>
                    <p className="text-xs text-slate-400">{a.catLabel}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      {noSearch && (
        <>
          <div className="px-4 pt-4">
            <p className="text-xs text-slate-400 font-semibold tracking-widest mb-2.5 uppercase">
              カテゴリ
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(KNOWLEDGE).map(([key, c]) => (
                <Link
                  key={key}
                  href={`/${key}`}
                  className="bg-white rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-all relative overflow-hidden block"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                    style={{ background: c.color }}
                  />
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <p className="font-bold text-slate-800 text-base mb-0.5">
                    {c.label}
                  </p>
                  <p className="text-xs text-slate-400">{c.articles.length} 記事</p>
                </Link>
              ))}
            </div>
          </div>

          {/* AI Chat */}
          <div className="px-4 pt-4">
            <p className="text-xs text-slate-400 font-semibold tracking-widest mb-2.5 uppercase">
              AIアシスタント
            </p>
            <Link
              href="/chat"
              className="w-full text-white rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-opacity block"
              style={{
                background: "linear-gradient(135deg, #1e293b, #334155)",
              }}
            >
              <span className="text-4xl">🤖</span>
              <div className="flex-1">
                <p className="font-bold text-base mb-0.5">AIに質問する</p>
                <p className="text-xs opacity-70">業務の疑問を何でも聞いてみよう</p>
              </div>
              <span className="text-2xl opacity-50">›</span>
            </Link>
          </div>

          {/* Admin */}
          <div className="px-4 pt-3 pb-8">
            <Link
              href="/admin"
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors block"
            >
              <span className="text-2xl">🔧</span>
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-700">記事を追加する</p>
                <p className="text-xs text-slate-400">AIで新しい業務知識を追加</p>
              </div>
              <span className="text-slate-300 text-xl">›</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
