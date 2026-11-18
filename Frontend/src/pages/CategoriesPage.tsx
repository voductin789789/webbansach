import React, { useEffect, useState } from 'react';
import { api } from '../api/httpClient';
import CategoryGrid, { type StoreCategory } from '../components/common/CategoryGrid';
export default function CategoriesPage() {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true;
    api.get('/categories').then(response => { if (active) setCategories(response.data.data || []); })
      .catch(() => { if (active) setError('Không tải được danh mục. Hãy kiểm tra kết nối Backend.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <main className="container categories-page">
    <div className="page-heading"><span className="eyebrow">CHỌN SÁCH THEO THỂ LOẠI</span><h1>Danh mục sách</h1><p>Chọn một danh mục để xem các đầu sách hiện có trong cửa hàng.</p></div>
    {loading ? <p>Đang tải danh mục...</p> : error ? <p role="alert" className="error-text">{error}</p> :
      categories.length ? <CategoryGrid categories={categories}/> : <p>Chưa có danh mục sách.</p>}
  </main>;
}
