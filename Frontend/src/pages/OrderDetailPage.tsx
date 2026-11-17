import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Order } from '../types';
import { getOrder } from '../api/orders';
import { getApiErrorMessage } from '../api/response';
import { formatVND } from '../types/formatVND';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const OrderDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getOrder(id)
      .then((result) => { if (active) setOrder(result); })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason, 'Không tải được chi tiết đơn hàng.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '48px 16px' }}><Spinner size="lg" /></div>;
  if (error || !order) return <div className="container" role="alert" style={{ padding: '36px 16px', color: '#B91C1C' }}>{error || 'Không tìm thấy đơn hàng.'}</div>;

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ color: '#2C3E50' }}>Chi tiết đơn hàng {order.orderCode}</h1>
      <p><Badge status={order.status} /></p>
      <p>Người nhận: <strong>{order.recipientName}</strong> · {order.recipientPhone}</p>
      <p>Địa chỉ: {order.shippingAddress}</p>
      {order.shippingProvider && order.trackingCode && <p>Vận chuyển: <strong>{order.shippingProvider}</strong> · Mã vận đơn: <strong>{order.trackingCode}</strong></p>}
      {order.paymentMethod && <p>Thanh toán: {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : `${order.paymentMethod} (sandbox)`} · Trạng thái: {order.paymentStatus || 'Chưa cập nhật'}</p>}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '18px' }}>
        {order.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span>{item.title} × {item.quantity}</span><strong>{formatVND(item.price * item.quantity)}</strong>
          </div>
        ))}
        {order.subtotalPrice !== undefined && <p style={{ textAlign: 'right' }}>Tạm tính: {formatVND(order.subtotalPrice)}</p>}
        {order.shippingFee !== undefined && <p style={{ textAlign: 'right' }}>Phí vận chuyển: {formatVND(order.shippingFee)}</p>}
        {order.discountAmount ? <p style={{ textAlign: 'right', color: '#15803D' }}>Ưu đãi: -{formatVND(order.discountAmount)}</p> : null}
        <p style={{ textAlign: 'right', fontWeight: 800, color: '#E74C3C' }}>Tổng cộng: {formatVND(order.totalPrice)}</p>
      </div>
      <Link to="/my-orders" style={{ display: 'inline-block', marginTop: '18px', color: '#2C3E50' }}>← Quay lại đơn hàng</Link>
    </div>
  );
};

export default OrderDetailPage;
