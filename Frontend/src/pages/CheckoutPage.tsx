// src/pages/CheckoutPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import type { CartItem } from '../types';
import { api } from '../api/httpClient';
import { fetchBook } from '../api/bookApi';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';
import { formatVND } from '../types/formatVND';
import { toast } from '../components/ui/Toast';
import { Button, Input } from '../components/ui';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export const CheckoutPage: React.FC = () => {
  const { items: cartItems, clearCart, refreshStock, stockLoading, updateQuantity } = useCart();
  const [searchParams] = useSearchParams();
  const directPurchase = searchParams.get('mode') === 'buy-now';
  const [directItem, setDirectItem] = useState<CartItem | null>(() => {
    try {
      const data = sessionStorage.getItem('bookstore_buy_now');
      const item = data ? JSON.parse(data) as CartItem : null;
      return item && item.bookId && Number.isInteger(item.quantity) && item.quantity > 0 ? item : null;
    } catch { return null; }
  });
  const items = directPurchase ? (directItem ? [directItem] : []) : cartItems;
  const changeCheckoutQuantity = (item: CartItem, requested: number) => {
    if (!Number.isSafeInteger(requested) || requested < 1) return;
    const max = item.stock;
    if (max === undefined || max <= 0 || requested > max) {
      toast.error(`Số lượng vượt tồn kho hiện có (${max ?? 'chưa xác minh'}).`);
      return;
    }
    if (directPurchase) {
      const updated = { ...item, quantity: requested };
      setDirectItem(updated);
      sessionStorage.setItem('bookstore_buy_now', JSON.stringify(updated));
    } else updateQuantity(item.bookId, requested);
  };
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const requestId = useRef(crypto.randomUUID());
  // Khởi tạo ngay từ thông tin tài khoản của tab hiện tại.
  // Luôn tải /auth/me để lấy bản mới nhất từ MySQL (qua Backend).
  const [name, setName] = useState(() => user?.name ?? '');
  const [phone, setPhone] = useState(() => user?.phone ?? '');
  const [address, setAddress] = useState(() => user?.address ?? '');
  const [loadingProfile, setLoadingProfile] = useState(isAuthenticated);
  const [profileNotice, setProfileNotice] = useState('');
  const editedFields = useRef({ name: false, phone: false, address: false });

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setLoadingProfile(false);
      return;
    }
    let active = true;
    // Dùng JWT của tab hiện tại; không đọc tài khoản tab khác.
    api.get('/auth/me').then(response => {
      if (!active) return;
      const profile = response.data?.data;
      if (!profile) return;
      if (!editedFields.current.name) setName(profile.name ?? '');
      if (!editedFields.current.phone) setPhone(profile.phone ?? '');
      if (!editedFields.current.address) setAddress(profile.address ?? '');
      setProfileNotice('Thông tin được điền từ tài khoản của bạn. Có thể thay đổi riêng cho đơn hàng này.');
    }).catch(() => {
      if (active) setProfileNotice('Không tải được hồ sơ mới nhất; bạn vẫn có thể nhập hoặc sửa thông tin nhận hàng.');
    }).finally(() => { if (active) setLoadingProfile(false); });
    return () => { active = false; };
  }, [isAuthenticated, user?.id]);

  const handleNameChange = (value: string) => { editedFields.current.name = true; setName(value); };
  const handlePhoneChange = (value: string) => { editedFields.current.phone = true; setPhone(value); };
  const handleAddressChange = (value: string) => { editedFields.current.address = true; setAddress(value); };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || loadingProfile) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!items.length || !name.trim() || !/^0\d{9}$/.test(phone) || address.trim().length < 5) {
      toast.error('Kiểm tra giỏ hàng, tên, số điện thoại và địa chỉ giao hàng'); return;
    }
    setSubmitting(true);
    try {
      // Luôn tải tồn kho mới nhất từ MySQL qua API trước khi tạo đơn.
      const latest = await Promise.all(items.map(i => fetchBook(i.bookId)));
      const invalid = latest.find((book, index) => (book.stock ?? 0) < items[index].quantity);
      if (invalid) {
        toast.error(`Sách "${invalid.title}" chỉ còn ${invalid.stock ?? 0} cuốn. Vui lòng điều chỉnh giỏ hàng.`);
        if (!directPurchase) await refreshStock();
        return;
      }
      const response = await api.post('/orders', {
        recipientName: name, recipientPhone: phone, shippingAddress: address,
        paymentMethod: 'COD', clientRequestId: requestId.current, items: items.map(i => ({ bookId: Number(i.bookId), quantity: i.quantity }))
      });
      if (directPurchase) sessionStorage.removeItem('bookstore_buy_now');
      clearCart(); // Backend transaction đã xóa đúng các sách vừa đặt; tải lại giỏ MySQL
      toast.success('Đơn hàng đã được lưu: ' + response.data.data.orderCode);
      navigate(`/my-orders/${response.data.data.id}`);
    } catch { toast.error('Không thể đặt hàng. Giỏ hàng vẫn được giữ nguyên.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', marginBottom: '24px' }}>
        Thanh Toán & Đặt Hàng
      </h1>

      {items.length === 0 ? <p>Không có sách để đặt hàng. <Link to="/books">Chọn sách</Link></p> : <form onSubmit={handleOrder} style={{ maxWidth: '600px', backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        <div style={{ background: '#edf7ff', border: '1px solid #d4e9f8', padding: '12px 14px', borderRadius: 10, color: '#28506b', fontSize: 13, marginBottom: 20 }}>
          {loadingProfile ? 'Đang tải thông tin nhận hàng từ tài khoản...' : (profileNotice || 'Họ tên và số điện thoại được điền tự động từ tài khoản; bạn có thể sửa nếu cần.')}
        </div>
        <Input label="Họ và tên người nhận *" value={name} onChange={(e) => handleNameChange(e.target.value)} autoComplete="name" required />
        <Input label="Số điện thoại liên hệ *" type="tel" inputMode="tel" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} autoComplete="tel" required />
        <Input label="Địa chỉ nhận hàng *" value={address} onChange={(e) => handleAddressChange(e.target.value)} autoComplete="street-address" required />
        <p style={{ fontSize: 12, color: '#64748b', marginTop: -6, marginBottom: 20 }}>
          Thay đổi tại đây chỉ áp dụng cho đơn hàng này, không làm thay đổi hồ sơ tài khoản.
        </p>

        <div style={{marginBottom:16}}><h2 style={{fontSize:17}}>Sách đặt mua {directPurchase ? '(Mua ngay)' : '(Giỏ hàng)'}</h2>{items.map(i => <div key={i.bookId} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',padding:'10px 0',borderBottom:'1px solid #e2e8f0'}}>
          <span>{i.title} — {formatVND(i.price * i.quantity)}</span>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button type="button" aria-label={`Giảm số lượng ${i.title}`} disabled={submitting||i.quantity<=1} onClick={()=>changeCheckoutQuantity(i,i.quantity-1)}>−</button>
            <strong aria-label="Số lượng đã chọn">{i.quantity}</strong>
            <button type="button" aria-label={`Tăng số lượng ${i.title}`} disabled={submitting||i.stock===undefined||i.quantity>=i.stock} onClick={()=>changeCheckoutQuantity(i,i.quantity+1)}>+</button>
          </div>
        </div>)}</div>
        <div style={{ margin: '20px 0', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px' }}>
            <span>Tổng thanh toán:</span>
            <span style={{ color: '#E74C3C' }}>{formatVND(totalPrice)}</span>
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg" disabled={submitting || loadingProfile || stockLoading || items.some(i=>i.stock!==undefined && (i.stock<=0 || i.quantity>i.stock))}>
          {submitting ? 'ĐANG ĐẶT HÀNG...' : 'XÁC NHẬN ĐẶT HÀNG'}
        </Button>
      </form>}
    </div>
  );
};

export default CheckoutPage;

