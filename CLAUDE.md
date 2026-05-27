@AGENTS.md

# fantechs — 現場の業務知識アプリ

電気・音響・照明・映像の業務知識をまとめたナレッジベースアプリ。
現場スタッフ（特に新人）が業務中に素早く知識を参照できるモバイルファーストのWebアプリ。

## 技術スタック

- **フレームワーク**: Next.js 15.3.3 (App Router)
- **スタイリング**: Tailwind CSS v4
- **言語**: TypeScript
- **AIチャット**: OpenAI API (gpt-4o-mini) — バックエンドAPI Route経由
- **デプロイ**: Cloudflare Pages (`@cloudflare/next-on-pages` アダプター)
- **リポジトリ**: https://github.com/su-metal/fantechs

## ディレクトリ構成

```
app/
  page.tsx                        # ホーム（カテゴリ一覧・検索）
  [category]/page.tsx             # カテゴリ別記事一覧
  [category]/[articleId]/page.tsx # 記事詳細
  chat/page.tsx                   # AIチャット画面
  api/chat/route.ts               # OpenAI APIプロキシ（edge runtime）
components/
  OhmCalculator.tsx               # オームの法則計算機（音響カテゴリ）
  ContentRenderer.tsx             # Markdown風コンテンツレンダラー
lib/
  knowledge.ts                    # 全記事データ（31記事）
```

## カテゴリと記事数

| カテゴリ | キー | 記事数 |
|---------|------|--------|
| ⚡ 電気 | `electrical` | 6 |
| 🔊 音響 | `audio` | 11 |
| 💡 照明 | `lighting` | 5 |
| 📹 映像 | `video` | 9 |

## 開発コマンド

```bash
npm run dev        # 開発サーバー起動 → http://localhost:3001
npm run build      # 通常ビルド（動作確認用）
npm run build:cf   # Cloudflare Pages向けビルド
```

※ ポート3000は別アプリで使用中のため3001を使用。

## 環境変数

`.env.local` に以下を設定：

```
OPENAI_API_KEY=sk-...
```

Cloudflare Pages の環境変数にも同じキーを設定すること。

## デプロイ（Cloudflare Pages）

- **ビルドコマンド**: `npx @cloudflare/next-on-pages`
- **デプロイコマンド**: `npx wrangler pages deploy .vercel/output/static`
- GitHub の `main` ブランチへのプッシュで自動デプロイ

## 注意事項

- Next.js 16 は `@cloudflare/next-on-pages` 未対応のため **15.3.3 を維持すること**
- API Route は `export const runtime = "edge"` が必須（Cloudflare Pages要件）
- 記事の追加・編集は `lib/knowledge.ts` の `KNOWLEDGE` オブジェクトを編集する
- `id: "a8"` の記事は `content: "CALCULATOR"` で特殊扱い → OhmCalculator コンポーネントを表示
