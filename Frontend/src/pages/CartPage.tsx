// src/pages/CartPage.tsx
// ========================================================
// PLACEHOLDER DÀNH CHO THÀNH VIÊN FE3 TRIỂN KHAI
// Nhiệm vụ FE3: Chi tiết giỏ hàng, mã giảm giá voucher, tính phí ship, chuyển bước thanh toán
// ========================================================
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../providers/CartProvider';
import { formatVND } from '../types/formatVND';
import Button from '../components/ui/Button';
import { Trash2, ArrowLeft } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#92400E', margin: '0 0 6px 0' }}>📌 Placeholder: Trang Giỏ Hàng</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#B45309' }}>
          FE1 đã dựng sẵn CartProvider và khung UI. Thành viên <strong>FE3</strong> sẽ tiếp quản trang này để tích hợp áp mã giảm giá (Voucher), chọn địa chỉ nhận hàng và quy trình Checkout.
        </p>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', marginBottom: '20px' }}>
        Giỏ Hàng Của Bạn ({totalItems} món)
      </h1>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: '#64748B', marginBottom: '16px' }}>Giỏ hàng đang trống.</p>
          <Link to="/"><Button variant="primary" icon={<ArrowLeft size={16} />}>Về Trang Chủ Chọn Sách</Button></Link>
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '20px' }}>
          {items.map((item) => (
            <div key={item.bookId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#2C3E50' }}>{item.title}</h4>
                <span style={{ fontSize: '14px', color: '#E74C3C', fontWeight: 700 }}>{formatVND(item.price)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>SL: {item.quantity}</span>
                <button onClick={() => removeItem(item.bookId)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 700 }}>Tổng tiền: <strong style={{ color: '#E74C3C' }}>{formatVND(totalPrice)}</strong></span>
            <Link to="/checkout"><Button variant="primary">Tiến Hành Đặt Hàng →</Button></Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
