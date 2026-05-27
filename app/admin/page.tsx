import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import AdminClient from "./AdminClient";
import LoginForm from "./LoginForm";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  let isAuthenticated = false;
  try {
    const { env } = await getCloudflareContext({ async: true }) as unknown as { env: { ADMIN_PASSWORD: string } };
    isAuthenticated = !!token && token === env.ADMIN_PASSWORD;
  } catch {
    // Local dev without wrangler — skip auth
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-800 text-white px-4 pt-4 pb-5">
        <Link
          href="/"
          className="inline-block bg-white/20 text-white px-3 py-1.5 rounded-full text-xs mb-3 hover:bg-white/30 transition-colors"
        >
          ← ホーム
        </Link>
        <h1 className="text-xl font-bold">🔧 管理画面</h1>
        <p className="text-sm opacity-75 mt-0.5">AIで記事を生成・追加</p>
      </div>
      <div className="p-4">
        <AdminClient />
      </div>
    </div>
  );
}
