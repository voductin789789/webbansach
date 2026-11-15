// src/pages/CheckoutPage.tsx
import React, { useState } from 'react';
import { useCart } from '../providers/CartProvider';
import { formatVND } from '../types/formatVND';
import { toast } from '../components/ui/Toast';
import { Button, Input } from '../components/ui';
import { useNavigate } from 'react-router-dom';

export const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }
    toast.success('Đặt hàng thành công! Mã đơn: ORD-' + Math.floor(1000 + Math.random() * 9000));
    clearCart();
    navigate('/');
  };

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', marginBottom: '24px' }}>
        Thanh Toán & Đặt Hàng (Placeholder)
      </h1>

      <form onSubmit={handleOrder} style={{ maxWidth: '600px', backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        <Input label="Họ và tên người nhận *" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Số điện thoại liên hệ *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Input label="Địa chỉ nhận hàng *" value={address} onChange={(e) => setAddress(e.target.value)} required />

        <div style={{ margin: '20px 0', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px' }}>
            <span>Tổng thanh toán:</span>
            <span style={{ color: '#E74C3C' }}>{formatVND(totalPrice >= 250000 ? totalPrice : totalPrice + 30000)}</span>
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg">
          XÁC NHẬN ĐẶT HÀNG
        </Button>
      </form>
    </div>
  );
};

export default CheckoutPage;

