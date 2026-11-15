// src/pages/HomePage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockCategories, mockBooks } from '../data/mockData';
import BookCard from '../components/common/BookCard';
import { BookCardSkeleton } from '../components/ui/Skeleton';
import {
  Sparkles,
  TrendingUp,
  Percent,
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [loading] = useState(false);

  // Lọc sách theo tiêu chí
  const bestSellers = mockBooks.filter((b) => b.isBestSeller);
  const newBooks = mockBooks.filter((b) => b.isNew);
  const discountBooks = mockBooks.filter((b) => b.discountPercent && b.discountPercent >= 20);

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* 1. HERO BANNER SECTION (Slider / Khuyến mãi nổi bật) */}
      <section
        style={{
          background: 'linear-gradient(135deg, #2C3E50 0%, #1A252F 100%)',
          color: '#FFFFFF',
          padding: '50px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            {/* Left Banner Text */}
            <div>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#E74C3C',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                Hội Sách Tri Thức 2026
              </span>

              <h1
                style={{
                  fontSize: '38px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.25,
                  marginBottom: '18px',
                }}
              >
                Mở Trang Sách Mới, <br />
                <span style={{ color: '#E74C3C' }}>Đón Vạn Chân Trời</span>
              </h1>

              <p
                style={{
                  fontSize: '16px',
                  color: '#CBD5E1',
                  marginBottom: '28px',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                }}
              >
                Khám phá hàng ngàn đầu sách chọn lọc từ các nhà xuất bản hàng đầu với ưu đãi giảm giá lên tới 40%. Đọc sách để nâng tầm tư duy mỗi ngày!
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link
                  to="/books"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#E74C3C',
                    color: '#FFFFFF',
                    padding: '12px 26px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '15px',
                    boxShadow: '0 4px 14px rgba(231,76,60,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>Khám Phá Sách Ngay</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/categories"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.25)',
                    padding: '12px 22px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '15px',
                  }}
                >
                  Xem Danh Mục
                </Link>
              </div>
            </div>

            {/* Right Banner Visual */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '420px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9' }}>Sách Nổi Bật Tuần Này</span>
                  <span style={{ fontSize: '12px', color: '#E74C3C', fontWeight: 700 }}>HOT DEAL</span>
                </div>
                <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '110px',
                      height: '150px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #065F46 0%, #022C22 100%)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '12px 10px',
                      borderLeft: '3px solid rgba(0,0,0,0.3)',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '9px', color: '#6EE7B7', fontWeight: 700, textTransform: 'uppercase' }}>Kỹ Năng</span>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#FFFFFF', display: 'block', lineHeight: 1.2 }}>Đắc Nhân Tâm</strong>
                      <span style={{ fontSize: '10px', color: '#CBD5E1' }}>Dale Carnegie</span>
                    </div>
                    <span style={{ fontSize: '8px', color: '#94A3B8', textAlign: 'center' }}>BEST SELLER</span>
                  </div>
                  <div>
                    <h3 style={{ color: '#FFFFFF', fontSize: '17px', margin: '0 0 6px 0' }}>Đắc Nhân Tâm</h3>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 10px 0' }}>Dale Carnegie</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#E74C3C' }}>86.000₫</span>
                      <span style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'line-through' }}>115.000₫</span>
                    </div>
                    <span style={{ fontSize: '12px', backgroundColor: '#E74C3C', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      -25% TIẾT KIỆM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION BAR */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '20px 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Truck size={24} color="#E74C3C" />
              <div>
                <strong style={{ fontSize: '14px', color: '#2C3E50', display: 'block' }}>Giao Hàng Siêu Tốc</strong>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Toàn quốc từ 1-3 ngày</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={24} color="#E74C3C" />
              <div>
                <strong style={{ fontSize: '14px', color: '#2C3E50', display: 'block' }}>Đổi Trả Dễ Dàng</strong>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Trong vòng 7 ngày</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={24} color="#E74C3C" />
              <div>
                <strong style={{ fontSize: '14px', color: '#2C3E50', display: 'block' }}>100% Sách Thật</strong>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Bảo hành chất lượng in ấn</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Headphones size={24} color="#E74C3C" />
              <div>
                <strong style={{ fontSize: '14px', color: '#2C3E50', display: 'block' }}>Hỗ Trợ 24/7</strong>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Hotline: 1900 6868</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KHỐI DANH MỤC NỔI BẬT */}
      <section style={{ padding: '48px 0 32px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', margin: 0 }}>
                Danh Mục Sách Nổi Bật
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>
                Khám phá các thể loại sách được yêu thích và tìm đọc nhiều nhất
              </p>
            </div>
            <Link
              to="/categories"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#E74C3C',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              <span>Xem tất cả</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="category-grid">
            {mockCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '20px 12px',
                  textAlign: 'center',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#E74C3C';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '32px' }}>{cat.icon || '📖'}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#2C3E50', lineHeight: 1.3 }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>{cat.bookCount || 0} cuốn</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. KHỐI SÁCH MỚI PHÁT HÀNH */}
      <section style={{ padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#EBF5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <Sparkles size={18} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#2C3E50', margin: 0 }}>
                Sách Mới Phát Hành
              </h2>
            </div>
            <Link to="/books?filter=new" style={{ color: '#2C3E50', fontSize: '14px', fontWeight: 600 }}>
              Xem thêm →
            </Link>
          </div>

          <div className="book-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)
            ) : (
              newBooks.slice(0, 4).map((book) => <BookCard key={book.id} book={book} />)
            )}
          </div>
        </div>
      </section>

      {/* 5. KHỐI SÁCH BÁN CHẠY & GIẢM GIÁ ĐẶC BIỆT */}
      <section style={{ padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E74C3C',
                }}
              >
                <TrendingUp size={18} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#2C3E50', margin: 0 }}>
                Sách Bán Chạy Nhất (Best Sellers)
              </h2>
            </div>
            <Link to="/books?filter=best-seller" style={{ color: '#E74C3C', fontSize: '14px', fontWeight: 700 }}>
              Xem tất cả →
            </Link>
          </div>

          <div className="book-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)
            ) : (
              bestSellers.slice(0, 4).map((book) => <BookCard key={book.id} book={book} />)
            )}
          </div>
        </div>
      </section>

      {/* 6. KHỐI SÁCH GIẢM GIÁ SHOCK */}
      <section style={{ padding: '32px 0' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: '#FFF5F5',
              border: '2px dashed #FECACA',
              borderRadius: '12px',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Percent size={22} color="#E74C3C" />
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#E74C3C', margin: 0 }}>
                  Khuyến Mãi Đặc Biệt - Giảm Đến 40%
                </h2>
              </div>
              <Link to="/books?filter=discount" style={{ color: '#E74C3C', fontSize: '14px', fontWeight: 700 }}>
                Xem thêm khuyến mãi →
              </Link>
            </div>

            <div className="book-grid">
              {discountBooks.slice(0, 4).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
