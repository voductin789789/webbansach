// src/pages/BookDetailPage.tsx
// ========================================================
// PLACEHOLDER DÀNH CHO THÀNH VIÊN FE2 TRIỂN KHAI
// Nhiệm vụ FE2: Bìa sách zoom 40%, thông số kỹ thuật 60%, sách liên quan, đánh giá/bình luận
// ========================================================
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockBooks } from '../data/mockData';
import { formatVND } from '../types/formatVND';
import Button from '../components/ui/Button';
import BookCover from '../components/common/BookCover';
import { ArrowLeft, Star, ShoppingCart } from 'lucide-react';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const book = mockBooks.find((b) => b.id === id) || mockBooks[0];

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#1D4ED8', margin: '0 0 6px 0' }}>📌 Placeholder: Chi Tiết Sách (Tỷ lệ 40/60)</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#1E40AF' }}>
          Khung router và layout đã dựng sẵn bởi FE1. Thành viên <strong>FE2</strong> sẽ hoàn thiện: Zoom ảnh bìa, bảng thông số kỹ thuật (ISBN, số trang, kích thước), bình luận/đánh giá sao và gợi ý sách liên quan.
        </p>
      </div>

      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2C3E50', marginBottom: '20px', fontWeight: 600, fontSize: '14px' }}>
        <ArrowLeft size={16} /> Quay lại trang chủ
      </Link>

      <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        <div style={{ width: '100%', maxWidth: '320px', minHeight: '420px', display: 'flex' }}>
          <BookCover book={book} style={{ borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
        </div>
        <div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{book.categoryName}</span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', margin: '6px 0 12px 0' }}>{book.title}</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '16px' }}>Tác giả: <strong>{book.author}</strong></p>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#E74C3C', marginBottom: '20px' }}>{formatVND(book.price)}</div>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>{book.description}</p>
          <Button variant="primary" icon={<ShoppingCart size={16} />}>Thêm Vào Giỏ Hàng</Button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
