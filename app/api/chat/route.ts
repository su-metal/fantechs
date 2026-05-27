import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT =
  "あなたは電気・音響・照明・映像の業務知識に詳しい先輩スタッフです。新人スタッフの質問にわかりやすく答えてください。専門用語には簡単な補足を添えてください。回答は簡潔にまとめ、必要に応じて箇条書きや表を使ってください。日本語で答えてください。";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { content: "APIキーが設定されていません。.env.localにANTHROPIC_API_KEYを設定してください。" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await res.json();
    const content =
      data.content?.find((b: { type: string }) => b.type === "text")?.text ??
      "回答を取得できませんでした。";

    return NextResponse.json({ content });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { content: "エラーが発生しました。" },
      { status: 500 }
    );
  }
}
