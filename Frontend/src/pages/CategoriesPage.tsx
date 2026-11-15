// src/pages/CategoriesPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { mockCategories } from '../data/mockData';

export const CategoriesPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#2C3E50', marginBottom: '8px' }}>
        Danh Mục Thể Loại Sách
      </h1>
      <p style={{ color: '#64748B', marginBottom: '32px' }}>
        Khám phá các thể loại sách đa dạng phù hợp cho mọi lứa tuổi và nhu cầu học tập, giải trí.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        {mockCategories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categories/${cat.slug}`}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>{cat.icon || '📚'}</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#2C3E50', marginBottom: '6px' }}>
              {cat.name}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '12px' }}>
              {cat.description}
            </p>
            <span style={{ fontSize: '13px', color: '#E74C3C', fontWeight: 600 }}>
              {cat.bookCount} đầu sách →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;

