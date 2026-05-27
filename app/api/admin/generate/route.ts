import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { cookies } from "next/headers";

const SYSTEM_PROMPT = `あなたは電気・音響・照明・映像の業務知識を記事化するアシスタントです。
ユーザーのリクエストに基づいて、現場スタッフ向けの業務知識記事を生成してください。

必ず以下のJSON形式のみで返答してください（他のテキストは一切含めないこと）：
{
  "title": "記事タイトル",
  "category": "electrical | audio | lighting | video のいずれか",
  "tags": ["タグ1", "タグ2"],
  "content": "## 見出し\\n\\n本文（Markdown形式）"
}

カテゴリの選択基準：
- electrical: 電気・電源・ケーブル（電力系）
- audio: 音響・PA・マイク・スピーカー・アンプ
- lighting: 照明・LED・DMX・照明卓
- video: 映像・カメラ・プロジェクター・スイッチャー

contentはMarkdownで記述。## 見出し、### 小見出し、**太字**、箇条書き（-）、表（|）を活用してください。`;

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  const adminPassword = process.env.ADMIN_PASSWORD;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!adminPassword || token !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEYが未設定です" }, { status: 500 });
  }

  try {
    const { messages } = await req.json() as { messages: OpenAI.Chat.ChatCompletionMessageParam[] };
    const openai = new OpenAI({ apiKey });

    const res = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      max_completion_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    });

    const raw = res.choices[0]?.message?.content ?? "{}";
    const article = JSON.parse(raw);
    return NextResponse.json({ article });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
  }
}
