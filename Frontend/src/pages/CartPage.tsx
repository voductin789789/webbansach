import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { formatVND } from '../types/formatVND';
import { Button } from '../components/ui';
import BookCover from '../components/common/BookCover';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', marginBottom: '20px' }}>Giỏ hàng ({totalItems} sản phẩm)</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: '#64748B', marginBottom: '16px' }}>Giỏ hàng đang trống.</p>
          <Link to="/books"><Button icon={<ArrowLeft size={16} />}>Chọn sách</Button></Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', alignItems: 'start' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px' }}>
            {items.map((item) => (
              <div key={item.bookId} style={{ display: 'grid', gridTemplateColumns: '64px minmax(100px, 1fr) auto', gap: '14px', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ height: '82px' }}><BookCover book={{ title: item.title, author: item.author, coverImage: item.coverImage }} /></div>
                <div>
                  <Link to={`/books/${item.bookId}`} style={{ color: '#2C3E50', fontWeight: 700 }}>{item.title}</Link>
                  <p style={{ color: '#E74C3C', fontWeight: 700, margin: '6px 0' }}>{formatVND(item.price)}</p>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>Tạm tính: {formatVND(item.price * item.quantity)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button variant="outline" size="sm" aria-label="Giảm số lượng" onClick={() => updateQuantity(item.bookId, item.quantity - 1)}><Minus size={14} /></Button>
                  <span aria-label="Số lượng">{item.quantity}</span>
                  <Button variant="outline" size="sm" aria-label="Tăng số lượng" disabled={item.stock !== undefined && item.quantity >= item.stock} onClick={() => updateQuantity(item.bookId, item.quantity + 1)}><Plus size={14} /></Button>
                  <Button variant="ghost" size="sm" aria-label={`Xóa ${item.title}`} onClick={() => removeItem(item.bookId)}><Trash2 size={16} color="#DC2626" /></Button>
                </div>
              </div>
            ))}
          </div>
          <aside style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#2C3E50', marginTop: 0 }}>Tóm tắt đơn hàng</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Tạm tính</span><strong>{formatVND(totalPrice)}</strong>
            </div>
            <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5 }}>Giá và tồn kho cuối cùng sẽ được Backend xác nhận khi đặt hàng.</p>
            <Link to="/checkout"><Button fullWidth>Tiến hành đặt hàng</Button></Link>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;
