import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, Percent, Truck, ShieldCheck, Flame } from 'lucide-react';
import { Book, Category } from '../types';
import { getBooks, getCategories } from '../api/catalog';
import { getApiErrorMessage } from '../api/response';
import BookCard from '../components/common/BookCard';
import { BookCardSkeleton } from '../components/ui/Skeleton';

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bestsellers, setBestsellers] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      getCategories(),
      getBooks({ page: 1, limit: 100, sortBy: 'createdAt' }),
      getBooks({ page: 1, limit: 4, sortBy: 'bestselling' }),
    ])
      .then(([categoryResult, bookResult, bestsellerResult]) => {
        if (!active) return;
        setCategories(categoryResult);
        setBooks(bookResult.books);
        setBestsellers(bestsellerResult.books);
      })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason, 'Không tải được dữ liệu cửa hàng.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const newBooks = books.filter((book) => book.isNew).slice(0, 4);
  const discountBooks = books.filter((book) => book.originalPrice && book.price < book.originalPrice).slice(0, 4);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container home-hero-content">
          <div className="home-hero-copy">
            <span className="home-hero-kicker">BOOKSTORE · THẾ GIỚI TRI THỨC</span>
            <h1 className="home-hero-title">
              Mở trang sách mới,<br /><span>đón vạn chân trời</span>
            </h1>
            <p className="home-hero-description">
              Tìm kiếm sách theo tên, tác giả và danh mục. Giá bán và tình trạng hàng được cập nhật từ cửa hàng.
            </p>
            <Link to="/books" className="home-hero-cta">
              Khám phá sách <ArrowRight size={18} />
            </Link>
          </div>
          <aside className="home-hero-notes" aria-label="Thông tin mua sách">
            <div className="home-hero-note">
              <BookOpen size={23} color="#F87171" /><span>Sách và tồn kho được cập nhật từ cửa hàng</span>
            </div>
            <div className="home-hero-note">
              <Truck size={23} color="#F87171" /><span>Thanh toán khi nhận sách (COD)</span>
            </div>
            <div className="home-hero-note">
              <ShieldCheck size={23} color="#F87171" /><span>Theo dõi đơn hàng trong tài khoản</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="container home-section">
        <div className="home-section-heading">
          <div>
            <h2 style={{ color: '#2C3E50', margin: 0 }}>Danh mục sách</h2>
            <p style={{ color: '#64748B', margin: '6px 0 0' }}>Chọn chủ đề bạn muốn khám phá.</p>
          </div>
          <Link to="/categories" style={{ color: '#E74C3C', fontWeight: 700 }}>Tất cả danh mục →</Link>
        </div>
        {error && <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>}
        {!loading && !error && categories.length === 0 && <p style={{ color: '#64748B' }}>Chưa có danh mục sách.</p>}
        <div className="category-grid">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.id} to={`/categories/${category.slug}`} className="home-category-link">
              <strong>{category.name}</strong>
              <span style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: '#64748B' }}>{category.bookCount ?? 0} đầu sách</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container home-section">
        <div className="home-section-heading">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2C3E50', margin: 0 }}><Flame color="#E74C3C" /> Sách bán chạy</h2>
          <Link to="/books?sort=bestselling" style={{ color: '#E74C3C', fontWeight: 700 }}>Xem tất cả →</Link>
        </div>
        <div className="book-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <BookCardSkeleton key={index} />)
            : bestsellers.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
        {!loading && bestsellers.length === 0 && !error && <p style={{ color: '#64748B' }}>Chưa có sách đã giao để xếp hạng bán chạy.</p>}
      </section>

      <section className="container home-section">
        <div className="home-section-heading">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2C3E50', margin: 0 }}><Sparkles color="#2563EB" /> Sách mới cập nhật</h2>
          <Link to="/books" style={{ color: '#2C3E50', fontWeight: 600 }}>Xem tất cả →</Link>
        </div>
        <div className="book-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <BookCardSkeleton key={index} />)
            : newBooks.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
        {!loading && newBooks.length === 0 && !error && <p style={{ color: '#64748B' }}>Chưa có thông tin sách mới.</p>}
      </section>

      <section className="container home-section home-section-last">
        <div className="home-section-heading">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E74C3C', margin: 0 }}><Percent /> Sách đang giảm giá</h2>
          <Link to="/books" style={{ color: '#E74C3C', fontWeight: 700 }}>Xem tất cả →</Link>
        </div>
        <div className="book-grid">
          {discountBooks.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
        {!loading && discountBooks.length === 0 && !error && <p style={{ color: '#64748B' }}>Hiện chưa có sách áp dụng giá khuyến mãi.</p>}
      </section>
    </div>
  );
};

export default HomePage;
