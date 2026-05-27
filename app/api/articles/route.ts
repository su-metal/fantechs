import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { generateId, parseDbArticle, type DbArticle } from "@/lib/db";
import { cookies } from "next/headers";

// GET /api/articles?category=xxx
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  try {
    const { env } = await getCloudflareContext({ async: true }) as unknown as { env: { DB: D1Database } };
    const db = env.DB;
    const query = category
      ? "SELECT * FROM articles WHERE category = ? ORDER BY created_at DESC"
      : "SELECT * FROM articles ORDER BY created_at DESC";
    const result = category
      ? await db.prepare(query).bind(category).all<DbArticle>()
      : await db.prepare(query).all<DbArticle>();
    return NextResponse.json(result.results.map(parseDbArticle));
  } catch {
    return NextResponse.json([]);
  }
}

// POST /api/articles  (admin only)
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  try {
    const { env } = await getCloudflareContext({ async: true }) as unknown as { env: { DB: D1Database; ADMIN_PASSWORD: string } };
    if (token !== env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { category, title, tags, content } = await req.json() as { category: string; title: string; tags: string[]; content: string };
    const id = generateId();
    await env.DB.prepare(
      "INSERT INTO articles (id, category, title, tags, content) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, category, title, JSON.stringify(tags), content).run();
    return NextResponse.json({ id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
