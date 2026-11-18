import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ArrowUpRight, Layers } from 'lucide-react';
import { api } from '../../api/httpClient';
import { fetchBooks } from '../../api/bookApi';
import type { Book } from '../../types';
import type { StoreCategory } from './CategoryGrid';

export default function SearchSuggestions() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const keyword = query.trim();
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);
  useEffect(() => {
    let live = true;
    if (keyword.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const timer = window.setTimeout(() => {
      fetchBooks({ search: keyword, page: 1, limit: 5 }).then(r => {
        if (live) setResults(r.books);
      }).catch(() => { if (live) setResults([]); }).finally(() => { if (live) setLoading(false); });
    }, 280);
    return () => { live = false; window.clearTimeout(timer); };
  }, [keyword]);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);
  const matchingCategories = keyword.length >= 2 ? categories.filter(c => c.name.toLocaleLowerCase('vi-VN').includes(keyword.toLocaleLowerCase('vi-VN'))).slice(0, 3) : [];
  const searchAll = () => { if (keyword) { setOpen(false); navigate(`/books?search=${encodeURIComponent(keyword)}`); } };
  return <div className="search-box" ref={wrapRef}>
    <form className="global-search" role="search" onSubmit={e => { e.preventDefault(); searchAll(); }}>
      <input aria-label="Tìm kiếm sách" autoComplete="off" placeholder="Tìm tên sách, tác giả..." value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }} />
      <button type="submit"><Search size={16}/> <span>Tìm</span></button>
    </form>
    {open && keyword.length >= 2 && <div className="search-dropdown" role="region" aria-label="Gợi ý tìm kiếm">
      <div className="suggestions-heading">Gợi ý tìm kiếm</div>
      {loading ? <p className="suggestion-note">Đang tìm sách...</p> : <>
        {results.map(book => <button type="button" className="suggestion-item" key={book.id} onClick={() => { setOpen(false); navigate(`/books/${book.id}`); }}>
          <BookOpen size={17}/><span><strong>{book.title}</strong><small>{book.author && book.author !== 'Đang cập nhật' ? book.author : book.categoryName || 'Sách'}</small></span><ArrowUpRight size={16}/>
        </button>)}
        {matchingCategories.map(c => <button type="button" className="suggestion-item" key={`cat-${c.id}`} onClick={() => { setOpen(false); navigate(`/categories/${c.slug}`); }}>
          <Layers size={17}/><span><strong>Danh mục: {c.name}</strong><small>{c._count?.books ?? 0} đầu sách</small></span><ArrowUpRight size={16}/>
        </button>)}
        {!results.length && !matchingCategories.length && <p className="suggestion-note">Không có sách trùng từ khóa. Thử tìm một từ ngắn hơn.</p>}
      </>}
      <button type="button" className="suggestion-all" onClick={searchAll}><Search size={16}/> Xem tất cả kết quả cho “{keyword}”</button>
    </div>}
  </div>;
}
