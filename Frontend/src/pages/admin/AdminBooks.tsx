// src/pages/admin/AdminBooks.tsx
import React from 'react';
import { mockBooks } from '../../data/mockData';
import { formatVND } from '../../types/formatVND';
import Button from '../../components/ui/Button';
import { PlusCircle, Edit2, Trash2, BookOpen } from 'lucide-react';

export const AdminBooks: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', margin: '0 0 6px 0' }}>
            Quản Lý Sách (Kho Sách)
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
            Quản lý thông tin đầu sách, giá bán, số lượng tồn kho (Placeholder cho FE2).
          </p>
        </div>
        <Button variant="primary" icon={<PlusCircle size={16} />}>
          Thêm Sách Mới
        </Button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '14px 20px' }}>Bìa</th>
              <th style={{ padding: '14px 20px' }}>Tên Sách</th>
              <th style={{ padding: '14px 20px' }}>Tác Giả</th>
              <th style={{ padding: '14px 20px' }}>Danh Mục</th>
              <th style={{ padding: '14px 20px' }}>Giá Bán</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {mockBooks.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ width: '38px', height: '52px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#2C3E50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <BookOpen size={16} color="#94A3B8" />
                  </div>
                </td>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: '#2C3E50' }}>{b.title}</td>
                <td style={{ padding: '12px 20px', color: '#64748B' }}>{b.author}</td>
                <td style={{ padding: '12px 20px' }}>{b.categoryName}</td>
                <td style={{ padding: '12px 20px', fontWeight: 700, color: '#E74C3C' }}>{formatVND(b.price)}</td>
                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <Button variant="outline" size="sm" icon={<Edit2 size={13} />}>Sửa</Button>
                    <Button variant="danger" size="sm" icon={<Trash2 size={13} />}>Xóa</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBooks;

