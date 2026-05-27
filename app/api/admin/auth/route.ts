import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password: string };
  try {
    const { env } = await getCloudflareContext({ async: true }) as unknown as { env: { ADMIN_PASSWORD: string } };
    if (password !== env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", env.ADMIN_PASSWORD, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7日
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
