import Link from "next/link";
import { notFound } from "next/navigation";
import { KNOWLEDGE } from "@/lib/knowledge";

type Props = { params: Promise<{ category: string }> };

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = KNOWLEDGE[category];
  if (!cat) notFound();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="text-white px-4 pt-4 pb-6"
        style={{ background: cat.color }}
      >
        <Link
          href="/"
          className="inline-block bg-white/20 text-white px-3 py-1.5 rounded-full text-xs mb-3 hover:bg-white/30 transition-colors"
        >
          ← ホーム
        </Link>
        <div className="text-4xl mb-1">{cat.icon}</div>
        <h1 className="text-2xl font-bold mb-1">{cat.label}</h1>
        <p className="text-sm opacity-85">{cat.articles.length} 件の記事</p>
      </div>

      {/* Article List */}
      <div className="p-4 flex flex-col gap-2.5">
        {cat.articles.map((a) => (
          <Link
            key={a.id}
            href={`/${category}/${a.id}`}
            className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all"
          >
            <div
              className="w-1 h-10 rounded-full flex-shrink-0"
              style={{ background: cat.color }}
            />
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-sm mb-1">{a.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {a.tags.map((t) => (
                  <span
                    key={t}
                    className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-slate-300 text-xl">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(KNOWLEDGE).map((category) => ({ category }));
}
