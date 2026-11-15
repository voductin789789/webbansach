// src/pages/BooksPage.tsx
// ========================================================
// PLACEHOLDER DÀNH CHO THÀNH VIÊN FE2 TRIỂN KHAI
// Nhiệm vụ FE2: Bộ lọc theo giá/thể loại, phân trang, danh sách sách
// ========================================================
import React from 'react';
import { mockBooks } from '../data/mockData';
import BookCard from '../components/common/BookCard';

export const BooksPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#1D4ED8', margin: '0 0 6px 0' }}>📌 Placeholder: Danh Sách Sách & Bộ Lọc</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#1E40AF' }}>
          Trang này được FE1 dựng khung sẵn (Skeleton). Thành viên <strong>FE2</strong> sẽ triển khai logic bộ lọc nâng cao (Giá, NXB, Thể loại, Sắp xếp) và phân trang tại đây.
        </p>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', marginBottom: '20px' }}>
        Tất Cả Sách
      </h1>

      <div className="book-grid">
        {mockBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default BooksPage;
