import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../providers/CartProvider';
import { useAuth } from '../providers/AuthProvider';
import { formatVND } from '../types/formatVND';
import { Button, Input } from '../components/ui';
import { api } from '../api/httpClient';
import { ApiEnvelope, getApiErrorMessage, getResponseData } from '../api/response';
import { toast } from '../components/ui/Toast';
import { getOrderQuote } from '../api/storefront';
import { ShippingQuote } from '../types';
import { Address, getAddresses } from '../api/storefront';

interface CreatedOrder {
  id: number | string;
  orderCode: string;
}

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [shippingProvince, setShippingProvince] = useState('Hồ Chí Minh');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressError, setAddressError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getAddresses()
      .then((result) => {
        if (!active) return;
        setSavedAddresses(result);
        const defaultAddress = result.find((item) => item.isDefault);
        if (defaultAddress) {
          setName(user?.name || defaultAddress.recipientName);
          setPhone(user?.phone || defaultAddress.phone);
          setAddress(`${defaultAddress.addressLine}, ${defaultAddress.ward}, ${defaultAddress.district}`);
          setShippingProvince(defaultAddress.province);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setSavedAddresses([]);
          setAddressError(getApiErrorMessage(reason, 'Không thể tải sổ địa chỉ.'));
        }
      });
    return () => { active = false; };
  }, [user?.name, user?.phone]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setQuoteLoading(true);
      setQuoteError('');
      getOrderQuote({
        items: items.map((item) => ({ bookId: Number(item.bookId), quantity: item.quantity })),
        couponCode: couponCode.trim() || undefined,
        shippingProvince,
      })
        .then((result) => { if (active) setQuote(result); })
        .catch((reason: unknown) => {
          if (!active) return;
          setQuote(null);
          setQuoteError(getApiErrorMessage(reason, 'Không thể tính phí vận chuyển hoặc mã giảm giá.'));
        })
        .finally(() => { if (active) setQuoteLoading(false); });
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [items, couponCode, shippingProvince]);

  const handleOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast.error('Giỏ hàng đang trống.');
      return;
    }
    if (!/^0\d{9}$/.test(phone.trim())) {
      toast.error('Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.');
      return;
    }
    const orderItems = items.map((item) => ({
      bookId: Number(item.bookId),
      quantity: item.quantity,
    }));
    if (orderItems.some((item) => !Number.isSafeInteger(item.bookId) || item.bookId <= 0)) {
      toast.error('Giỏ hàng có sản phẩm không hợp lệ. Vui lòng tải lại sách rồi thử lại.');
      return;
    }

    setSubmitting(true);
    try {
      if (!quote) {
        toast.error(quoteError || 'Vui lòng đợi hệ thống tính lại đơn hàng.');
        return;
      }
      const response = await api.post<ApiEnvelope<CreatedOrder>>('/orders', {
        recipientName: name.trim(),
        recipientPhone: phone.trim(),
        shippingAddress: `${address.trim()}, ${shippingProvince.trim()}`,
        shippingProvince: shippingProvince.trim(),
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
        items: orderItems,
      });
      const order = getResponseData(response);
      clearCart();
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tạo đơn hàng. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  const selectAddress = (id: string) => {
    const selected = savedAddresses.find((item) => String(item.id) === id);
    if (!selected) return;
    setName(selected.recipientName);
    setPhone(selected.phone);
    setAddress(`${selected.addressLine}, ${selected.ward}, ${selected.district}`);
    setShippingProvince(selected.province);
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '48px 16px', textAlign: 'center' }}>
        <p>Giỏ hàng đang trống.</p><Link to="/books">Quay lại chọn sách</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', marginBottom: '24px' }}>Thanh toán</h1>
      <form onSubmit={handleOrder} style={{ maxWidth: '680px', background: '#FFFFFF', padding: '28px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        {addressError && <p role="alert" style={{ color: '#B91C1C' }}>{addressError} Bạn vẫn có thể nhập địa chỉ bên dưới.</p>}
        {savedAddresses.length > 0 && (
          <label style={{ display: 'block', marginBottom: 16, fontWeight: 700 }}>
            Chọn địa chỉ đã lưu
            <select defaultValue="" onChange={(event) => selectAddress(event.target.value)} style={{ display: 'block', width: '100%', padding: 10, marginTop: 6, border: '1px solid #CBD5E1', borderRadius: 6 }}>
              <option value="">Nhập địa chỉ khác</option>
              {savedAddresses.map((saved) => <option key={saved.id} value={saved.id}>{saved.label} — {saved.addressLine}, {saved.province}</option>)}
            </select>
          </label>
        )}
        <Input label="Họ và tên người nhận" value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
        <Input label="Số điện thoại" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} pattern="0[0-9]{9}" required />
        <Input label="Địa chỉ, phường/xã, quận/huyện" value={address} onChange={(event) => setAddress(event.target.value)} minLength={5} required />
        <Input label="Tỉnh/thành phố (dùng để ước tính phí vận chuyển)" value={shippingProvince} onChange={(event) => setShippingProvince(event.target.value)} minLength={2} required />
        <div style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px' }}><Input label="Mã ưu đãi" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} /></div>
          <span style={{ paddingBottom: 14, color: quoteLoading ? '#64748B' : quoteError ? '#B91C1C' : '#15803D' }}>
            {quoteLoading ? 'Đang kiểm tra…' : quoteError ? 'Mã chưa hợp lệ' : couponCode ? 'Mã đã được áp dụng' : 'Nhập mã để kiểm tra'}
          </span>
        </div>
        <p><Link to="/addresses">Quản lý sổ địa chỉ</Link></p>
        {quoteError && <p role="alert" style={{ color: '#B91C1C' }}>{quoteError}</p>}
        <label style={{ display: 'block', margin: '16px 0', fontWeight: 700 }}>
          Phương thức thanh toán
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} style={{ display: 'block', width: '100%', padding: 10, marginTop: 6, border: '1px solid #CBD5E1', borderRadius: 6 }}>
            <option value="COD">Thanh toán khi nhận hàng (COD)</option>
            <option value="BANKING">Chuyển khoản thử nghiệm (sandbox)</option>
            <option value="VNPAY">VNPay thử nghiệm (sandbox)</option>
            <option value="MOMO">MoMo thử nghiệm (sandbox)</option>
            <option value="CARD">Thẻ thử nghiệm (sandbox)</option>
          </select>
        </label>
        {paymentMethod !== 'COD' && <p style={{ color: '#92400E', background: '#FFFBEB', padding: 10, borderRadius: 6 }}>Chế độ sandbox chỉ mô phỏng kết quả thanh toán; không kết nối ngân hàng và không thu tiền thật.</p>}
        <div style={{ margin: '20px 0', padding: '16px', background: '#F8FAFC', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Tạm tính ({items.length} sản phẩm)</span><span>{formatVND(quote?.subtotalPrice ?? totalPrice)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}><span>Vận chuyển ({quote?.shippingWeightGrams ?? 0} g)</span><span>{quote ? formatVND(quote.shippingFee) : 'Đang tính...'}</span></div>
          {quote?.discountAmount ? <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: '#15803D' }}><span>Ưu đãi</span><span>-{formatVND(quote.discountAmount)}</span></div> : null}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 800 }}><span>Tổng cộng</span><span>{quote ? formatVND(quote.totalPrice) : 'Đang tính...'}</span></div>
          <p style={{ margin: '10px 0 0', color: '#64748B', fontSize: '13px' }}>Phí ship demo tính theo tỉnh/thành và khối lượng; Backend xác nhận lại tồn kho và tổng tiền khi đặt.</p>
        </div>
        <Button type="submit" fullWidth size="lg" loading={submitting} disabled={quoteLoading || !quote || Boolean(quoteError)}>
          {paymentMethod === 'COD' ? 'Đặt hàng và thanh toán khi nhận hàng' : 'Tạo đơn và mở thanh toán thử'}
        </Button>
      </form>
    </div>
  );
};

export default CheckoutPage;
