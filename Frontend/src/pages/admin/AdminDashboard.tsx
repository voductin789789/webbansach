import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Category, Order } from '../../types';
import { getBooks, getCategories } from '../../api/catalog';
import { getAdminOrders } from '../../api/orders';
import { getApiErrorMessage } from '../../api/response';
import { formatVND } from '../../types/formatVND';
import Badge from '../../components/ui/Badge';
import { BookOpen, FolderTree, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [bookCount, setBookCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getAdminOrders(1, 5), getBooks({ page: 1, limit: 5 }), getCategories()])
      .then(([orderResult, bookResult, categoryResult]) => {
        if (!active) return;
        setOrders(orderResult.orders);
        setOrderCount(orderResult.pagination?.total ?? orderResult.orders.length);
        setBooks(bookResult.books);
        setBookCount(bookResult.total);
        setCategories(categoryResult);
      })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason, 'Không tải được dữ liệu dashboard.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const stats = [
    { title: 'Tổng số đơn hàng', value: `${orderCount}`, icon: <ShoppingBag size={24} color="#3B82F6" />, bg: '#EFF6FF' },
    { title: 'Tổng đầu sách', value: `${bookCount}`, icon: <BookOpen size={24} color="#F59E0B" />, bg: '#FFFBEB' },
    { title: 'Danh mục', value: `${categories.length}`, icon: <FolderTree size={24} color="#8B5CF6" />, bg: '#F5F3FF' },
  ];

  if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}><Spinner size="lg" /></div>;
  if (error) return <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div><h1 style={{ color: '#2C3E50', margin: 0 }}>Tổng quan hệ thống</h1><p style={{ color: '#64748B' }}>Số liệu hiện tại từ API.</p></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/categories"><Button variant="secondary">Quản lý danh mục</Button></Link>
          <Link to="/admin/books"><Button>Quản lý sách</Button></Link>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '26px' }}>
        {stats.map((stat) => (
          <div key={stat.title} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span style={{ color: '#64748B', fontSize: '13px' }}>{stat.title}</span><strong style={{ display: 'block', marginTop: '8px', color: '#2C3E50', fontSize: '24px' }}>{stat.value}</strong></div>
            <span style={{ padding: '12px', borderRadius: '12px', background: stat.bg }}>{stat.icon}</span>
          </div>
        ))}
      </div>
      <section style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflowX: 'auto' }}>
        <div style={{ padding: '18px', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '17px', color: '#2C3E50', margin: 0 }}>Đơn hàng gần đây</h2>
          <Link to="/admin/orders" style={{ color: '#E74C3C' }}>Tất cả đơn hàng <ArrowRight size={14} /></Link>
        </div>
        {orders.length === 0 ? <p style={{ padding: '18px', color: '#64748B' }}>Chưa có đơn hàng.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead><tr style={{ background: '#F8FAFC', color: '#64748B' }}><th style={{ padding: '12px 18px' }}>Mã đơn</th><th style={{ padding: '12px 18px' }}>Người nhận</th><th style={{ padding: '12px 18px' }}>Tổng tiền</th><th style={{ padding: '12px 18px' }}>Trạng thái</th></tr></thead>
            <tbody>{orders.map((order) => <tr key={order.id} style={{ borderTop: '1px solid #F1F5F9' }}>
              <td style={{ padding: '13px 18px', fontWeight: 700 }}>{order.orderCode}</td><td style={{ padding: '13px 18px' }}>{order.recipientName}</td><td style={{ padding: '13px 18px', color: '#E74C3C', fontWeight: 700 }}>{formatVND(order.totalPrice)}</td><td style={{ padding: '13px 18px' }}><Badge status={order.status} /></td>
            </tr>)}</tbody>
          </table>
        )}
      </section>
      <div style={{ marginTop: '20px' }}>
        <Link to="/admin/books">Sách gần đây ({books.length}) →</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
