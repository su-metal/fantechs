import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";

type Params = { params: Promise<{ id: string }> };

async function getAuthedEnv(token: string | undefined) {
  const { env } = await getCloudflareContext({ async: true }) as unknown as {
    env: { DB: D1Database; ADMIN_PASSWORD: string };
  };
  if (env.ADMIN_PASSWORD && token !== env.ADMIN_PASSWORD) return null;
  return env;
}

// PUT /api/articles/[id]  — edit article (admin only)
export async function PUT(req: NextRequest, { params }: Params) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  try {
    const env = await getAuthedEnv(token);
    if (!env) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { title, tags, content } = await req.json() as {
      title: string;
      tags: string[];
      content: string;
    };
    await env.DB.prepare(
      "UPDATE articles SET title = ?, tags = ?, content = ? WHERE id = ?"
    ).bind(title, JSON.stringify(tags), content, id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/articles/[id]  — delete article (admin only)
export async function DELETE(req: NextRequest, { params }: Params) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  try {
    const env = await getAuthedEnv(token);
    if (!env) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await env.DB.prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
