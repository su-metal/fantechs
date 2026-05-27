import Link from "next/link";
import { notFound } from "next/navigation";
import { KNOWLEDGE } from "@/lib/knowledge";
import ContentRenderer from "@/components/ContentRenderer";
import OhmCalculator from "@/components/OhmCalculator";

type Props = { params: Promise<{ category: string; articleId: string }> };

export default async function ArticlePage({ params }: Props) {
  const { category, articleId } = await params;
  const cat = KNOWLEDGE[category];
  if (!cat) notFound();

  const article = cat.articles.find((a) => a.id === articleId);
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
