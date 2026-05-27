import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const SYSTEM_PROMPT =
  "あなたは電気・音響・照明・映像の業務知識に詳しい先輩スタッフです。新人スタッフの質問にわかりやすく答えてください。専門用語には簡単な補足を添えてください。回答は簡潔にまとめ、必要に応じて箇条書きや表を使ってください。日本語で答えてください。";

export async function POST(req: NextRequest) {
  const { messages } = await req.json() as { messages: ChatCompletionMessageParam[] };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { content: "APIキーが設定されていません。Cloudflareダッシュボードの環境変数にOPENAI_API_KEYを設定してください。" },
      { status: 500 }
    );
  }

  try {
    const openai = new OpenAI({ apiKey });

    const res = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    });

    const content = res.choices[0]?.message?.content ?? "回答を取得できませんでした。";
    return NextResponse.json({ content });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { content: `エラー: ${message}` },
      { status: 500 }
    );
  }
}
