"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "ログインに失敗しました");
      }
    } catch {
      setError("エラーが発生しました");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔒</div>
          <h1 className="text-xl font-bold text-slate-800">管理画面</h1>
          <p className="text-sm text-slate-500 mt-1">パスワードを入力してください</p>
        </div>
        <div className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="パスワード"
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-400 bg-slate-50"
          />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button
            onClick={login}
            disabled={loading || !password.trim()}
            className={`py-3 rounded-xl text-sm font-bold text-white transition-colors ${
              loading || !password.trim() ? "bg-slate-300" : "bg-slate-700 hover:bg-slate-800"
            }`}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </div>
      </div>
    </div>
  );
}
