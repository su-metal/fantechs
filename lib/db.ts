export type DbArticle = {
  id: string;
  category: string;
  title: string;
  tags: string; // JSON string
  content: string;
  sort_order: number;
  created_at: string;
};

export type ArticleRow = {
  id: string;
  category: string;
  title: string;
  tags: string[];
  content: string;
  sort_order: number;
  created_at: string;
};

export function parseDbArticle(row: DbArticle): ArticleRow {
  return {
    ...row,
    tags: JSON.parse(row.tags),
  };
}

export function generateId(): string {
  return `db_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
