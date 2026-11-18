import React from 'react';
import { Link } from 'react-router-dom';

export interface StoreCategory { id: number; name: string; slug: string; description?: string; _count?: { books: number } }
const motifs = ['✦', '◇', '◎', '✳', '◈'];
export default function CategoryGrid({ categories }: { categories: StoreCategory[] }) {
  return <div className="category-pills">{categories.map((category, index) => (
    <Link key={category.id} to={`/categories/${encodeURIComponent(category.slug)}`} className={`category-pill category-${index % 5}`}>
      <span className="category-icon" aria-hidden="true">{motifs[index % motifs.length]}</span>
      <b>{category.name}</b><small>{category._count?.books ?? 0} đầu sách</small>
    </Link>
  ))}</div>;
}
