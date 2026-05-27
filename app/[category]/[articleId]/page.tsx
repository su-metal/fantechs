import Link from "next/link";
import { notFound } from "next/navigation";
import { KNOWLEDGE } from "@/lib/knowledge";
import ContentRenderer from "@/components/ContentRenderer";
import OhmCalculator from "@/components/OhmCalculator";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { parseDbArticle, type DbArticle, type ArticleRow } from "@/lib/db";

export const dynamicParams = true;

type Props = { params: Promise<{ category: string; articleId: string }> };

async function fetchDbArticle(category: string, id: string): Promise<ArticleRow | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { env } = await getCloudflareContext({ async: true }) as unknown as { env: { DB: any } };
    const row = await env.DB.prepare(
      "SELECT * FROM articles WHERE id = ? AND category = ?"
    ).bind(id, category).first() as DbArticle | null;
    return row ? parseDbArticle(row) : null;
  } catch {
    return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { category, articleId } = await params;
  const cat = KNOWLEDGE[category];
  if (!cat) notFound();

  // Check static articles first
  const staticArticle = cat.articles.find((a) => a.id === articleId);

  // For DB articles (ids starting with "db_"), fetch from D1
  const dbArticle = !staticArticle && articleId.startsWith("db_")
    ? await fetchDbArticle(category, articleId)
    : null;

  const article = staticArticle ?? dbArticle;
  if (!article) notFound();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="text-white px-4 pt-4 pb-5"
        style={{ background: cat.color }}
      >
        <Link
          href={`/${category}`}
          className="inline-block bg-white/20 text-white px-3 py-1.5 rounded-full text-xs mb-3 hover:bg-white/30 transition-colors"
        >
          ← 戻る
        </Link>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {article.tags.map((t) => (
            <span
              key={t}
              className="bg-white/25 px-2.5 py-0.5 rounded-full text-xs"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="text-xl font-bold leading-snug">{article.title}</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          {article.content === "CALCULATOR" ? (
            <OhmCalculator />
          ) : (
            <ContentRenderer content={article.content} />
          )}
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.entries(KNOWLEDGE).flatMap(([category, cat]) =>
    cat.articles.map((a) => ({ category, articleId: a.id }))
  );
}
