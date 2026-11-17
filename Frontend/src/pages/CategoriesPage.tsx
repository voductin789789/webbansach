import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';
import { getCategories } from '../api/catalog';
import { getApiErrorMessage } from '../api/response';
import Spinner from '../components/ui/Spinner';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getCategories()
      .then((result) => { if (active) setCategories(result); })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason, 'Không tải được danh mục sách.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#2C3E50', marginBottom: '8px' }}>Danh mục sách</h1>
      <p style={{ color: '#64748B', marginBottom: '32px' }}>Khám phá các thể loại sách trong cửa hàng.</p>
      {loading ? <Spinner size="lg" /> : error ? (
        <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>
      ) : categories.length === 0 ? (
        <p style={{ color: '#64748B' }}>Chưa có danh mục sách.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {categories.map((category) => (
            <Link key={category.id} to={`/categories/${category.slug}`} style={{ background: '#FFFFFF', borderRadius: '10px', padding: '24px', border: '1px solid #E2E8F0', color: 'inherit' }}>
              <h2 style={{ fontSize: '18px', color: '#2C3E50', margin: '0 0 8px' }}>{category.name}</h2>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>{category.description || 'Xem sách trong danh mục này.'}</p>
              <span style={{ fontSize: '13px', color: '#E74C3C', fontWeight: 600 }}>{category.bookCount ?? 0} đầu sách →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
