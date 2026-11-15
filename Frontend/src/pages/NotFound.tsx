// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, BookX } from 'lucide-react';
import Button from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
      }}
    >
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E74C3C',
          marginBottom: '24px',
        }}
      >
        <BookX size={54} />
      </div>

      <h1 style={{ fontSize: '72px', fontWeight: 900, color: '#2C3E50', margin: '0 0 10px 0', lineHeight: 1 }}>
        404
      </h1>

      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#374151', margin: '0 0 12px 0' }}>
        Trang Bạn Tìm Kiếm Không Tồn Tại!
      </h2>

      <p style={{ maxWidth: '480px', color: '#6B7280', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
        Có vẻ như đường dẫn đã bị thay đổi hoặc cuốn sách bạn đang tìm không còn lưu hành trên hệ thống.
      </p>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/">
          <Button variant="primary" icon={<Home size={18} />}>
            Về Trang Chủ
          </Button>
        </Link>
        <Link to="/books">
          <Button variant="outline" icon={<Search size={18} />}>
            Tìm Kiếm Sách
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

