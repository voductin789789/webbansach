import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Book, Category } from '../types';
import { getBooks, getCategories } from '../api/catalog';
import { getApiErrorMessage } from '../api/response';
import BookCard from '../components/common/BookCard';
import { BookCardSkeleton } from '../components/ui/Skeleton';
import { Button, Input, Spinner } from '../components/ui';

const BooksPage: React.FC = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'title' | 'bestselling' | 'rating'>(() => {
    const requestedSort = searchParams.get('sort');
    return requestedSort === 'price' || requestedSort === 'title' || requestedSort === 'bestselling' || requestedSort === 'rating'
      ? requestedSort
      : 'createdAt';
  });
  const [translator, setTranslator] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');
  const [binding, setBinding] = useState<Book['binding'] | ''>('');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    let active = true;
    getCategories()
      .then((result) => { if (active) setCategories(result); })
      .catch((reason: unknown) => {
        if (active) setCategoryError(getApiErrorMessage(reason, 'Không tải được danh mục.'));
      });
    return () => { active = false; };
  }, []);

  const categoryId = useMemo(() => {
    if (!slug) return undefined;
    return categories.find((category) => category.slug === slug)?.id;
  }, [categories, slug]);

  useEffect(() => {
    if (slug && categories.length > 0 && !categoryId) {
      setError('Danh mục không tồn tại.');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');
    getBooks({
      page,
      limit: 12,
      search: searchParams.get('search') || undefined,
      categoryId,
      minPrice: appliedMinPrice || undefined,
      maxPrice: appliedMaxPrice || undefined,
      translator: translator.trim() || undefined,
      publisher: publisher.trim() || undefined,
      isbn: isbn.trim() || undefined,
      binding: binding || undefined,
      sortBy,
      sortOrder: sortBy === 'price' || sortBy === 'title' ? 'asc' : 'desc',
    })
      .then((result) => {
        if (!active) return;
        setBooks(result.books);
        setTotalPages(Math.max(result.totalPages, 1));
      })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason, 'Không tải được danh sách sách.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, searchParams, categoryId, slug, categories.length, appliedMinPrice, appliedMaxPrice, sortBy, translator, publisher, isbn, binding]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearchParams(search.trim() ? { search: search.trim(), page: '1' } : {});
  };

  const applyPriceFilter = () => {
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (min !== undefined && max !== undefined && min > max) {
      setError('Giá tối thiểu không được lớn hơn giá tối đa.');
      return;
    }
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setError('');
    setPage(1);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('page', '1');
      return next;
    });
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('page', String(nextPage));
      return next;
    });
  };

  const selectedCategory = categories.find((category) => category.slug === slug);

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', marginBottom: '20px' }}>
        {selectedCategory?.name || 'Tất cả sách'}
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <form onSubmit={submitSearch} style={{ display: 'flex', gap: '8px', gridColumn: 'span 2' }}>
          <Input aria-label="Tìm sách" placeholder="Tên sách, tác giả, ISBN, dịch giả hoặc NXB" value={search} onChange={(event) => setSearch(event.target.value)} style={{ marginBottom: 0 }} />
          <Button type="submit">Tìm kiếm</Button>
        </form>
        <Input aria-label="Giá từ" type="number" min="0" placeholder="Giá từ" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} style={{ marginBottom: 0 }} />
        <Input aria-label="Giá đến" type="number" min="1" placeholder="Giá đến" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} style={{ marginBottom: 0 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px' }}>
          Sắp xếp
          <select value={sortBy} onChange={(event) => { setSortBy(event.target.value as typeof sortBy); setPage(1); }} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
            <option value="createdAt">Mới nhất</option>
            <option value="price">Giá thấp trước</option>
            <option value="title">Tên sách</option>
            <option value="bestselling">Bán chạy</option>
            <option value="rating">Đánh giá cao</option>
          </select>
        </label>
        <Button type="button" variant="outline" onClick={applyPriceFilter}>Lọc giá</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Input aria-label="Dịch giả" placeholder="Dịch giả" value={translator} onChange={(event) => { setTranslator(event.target.value); setPage(1); }} style={{ marginBottom: 0 }} />
        <Input aria-label="Nhà xuất bản" placeholder="Nhà xuất bản" value={publisher} onChange={(event) => { setPublisher(event.target.value); setPage(1); }} style={{ marginBottom: 0 }} />
        <Input aria-label="ISBN" placeholder="ISBN" value={isbn} onChange={(event) => { setIsbn(event.target.value); setPage(1); }} style={{ marginBottom: 0 }} />
        <select aria-label="Hình thức bìa" value={binding} onChange={(event) => { setBinding(event.target.value as Book['binding'] | ''); setPage(1); }} style={{ padding: 10, borderRadius: 6, border: '1px solid #CBD5E1' }}>
          <option value="">Mọi hình thức bìa</option><option value="PAPERBACK">Bìa mềm</option><option value="HARDCOVER">Bìa cứng</option><option value="DUST_JACKET">Bìa áo</option>
        </select>
      </div>
      {categoryError && <p role="alert" style={{ color: '#B91C1C' }}>{categoryError}</p>}
      {loading ? (
        <div className="book-grid">{Array.from({ length: 4 }).map((_, index) => <BookCardSkeleton key={index} />)}</div>
      ) : error ? (
        <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>
      ) : books.length === 0 ? (
        <p style={{ color: '#64748B' }}>Không tìm thấy sách phù hợp.</p>
      ) : (
        <>
          <div className="book-grid">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '28px' }}>
            <Button variant="outline" disabled={page <= 1} onClick={() => changePage(page - 1)}>Trước</Button>
            <span>Trang {page} / {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Tiếp</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default BooksPage;
