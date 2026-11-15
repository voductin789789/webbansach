// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { mockOrders, mockBooks, mockCategories } from '../../data/mockData';
import { formatVND } from '../../types/formatVND';
import Badge from '../../components/ui/Badge';
import {
  DollarSign,
  ShoppingBag,
  BookOpen,
  FolderTree,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    {
      title: 'Tổng Doanh Thu',
      value: formatVND(totalRevenue * 15), // Mock revenue
      change: '+12.5%',
      icon: <DollarSign size={24} color="#10B981" />,
      bg: '#ECFDF5',
    },
    {
      title: 'Đơn Hàng Hôm Nay',
      value: '28 đơn',
      change: '+8.2%',
      icon: <ShoppingBag size={24} color="#3B82F6" />,
      bg: '#EFF6FF',
    },
    {
      title: 'Tổng Số Đầu Sách',
      value: `${mockBooks.length * 45} cuốn`,
      change: '+5 mới',
      icon: <BookOpen size={24} color="#F59E0B" />,
      bg: '#FFFBEB',
    },
    {
      title: 'Danh Mục Hoạt Động',
      value: `${mockCategories.length} danh mục`,
      change: '100% active',
      icon: <FolderTree size={24} color="#8B5CF6" />,
      bg: '#F5F3FF',
    },
  ];

  return (
    <div>
      {/* Top Welcome & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', margin: '0 0 6px 0' }}>
            Tổng Quan Hệ Thống (Dashboard)
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
            Cập nhật tình hình kinh doanh, doanh số và vận hành cửa hàng sách trực tuyến.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/categories">
            <Button variant="secondary" icon={<FolderTree size={16} />}>
              Quản Lý Danh Mục
            </Button>
          </Link>
          <Link to="/admin/books/new">
            <Button variant="primary" icon={<PlusCircle size={16} />}>
              Thêm Sách Mới
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {stats.map((s, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                {s.title}
              </span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#2C3E50', display: 'block', marginBottom: '6px' }}>
                {s.value}
              </span>
              <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <TrendingUp size={14} /> {s.change} so với tháng trước
              </span>
            </div>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: s.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 2 Columns: Recent Orders & Top Selling Books */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Recent Orders Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#2C3E50' }}>
              Đơn Hàng Gần Đây
            </h3>
            <Link to="/admin/orders" style={{ fontSize: '13px', color: '#E74C3C', fontWeight: 600 }}>
              Xem tất cả →
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px' }}>Mã Đơn</th>
                  <th style={{ padding: '12px 16px' }}>Khách Hàng</th>
                  <th style={{ padding: '12px 16px' }}>Tổng Tiền</th>
                  <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#2C3E50' }}>
                      {order.id}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{order.customerName}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>{order.customerPhone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#E74C3C' }}>
                      {formatVND(order.totalAmount)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Books in Store */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#2C3E50' }}>
              Sách Bán Chạy Trong Kho
            </h3>
            <Link to="/admin/books" style={{ fontSize: '13px', color: '#2C3E50', fontWeight: 600 }}>
              Kho sách →
            </Link>
          </div>

          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockBooks.slice(0, 4).map((book) => (
              <div
                key={book.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '58px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#2C3E50', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <BookOpen size={18} color="#94A3B8" />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#2C3E50' }}>
                      {book.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      {book.author} • {book.categoryName}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#E74C3C', display: 'block' }}>
                    {formatVND(book.price)}
                  </span>
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                    ★ {book.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

