import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { cancelOrder, getMyOrders } from '../api/orders';
import { getApiErrorMessage } from '../api/response';
import { formatVND } from '../types/formatVND';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toast';

const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyOrders()
      .then((result) => {
        if (active) setOrders(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason, 'Không tải được lịch sử đơn hàng.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đơn ${order.orderCode}?`)) return;

    setCancellingId(order.id);
    try {
      const updatedOrder = await cancelOrder(order.id);
      setOrders((current) =>
        current.map((item) => item.id === updatedOrder.id ? updatedOrder : item)
      );
      toast.success(`Đã hủy đơn ${order.orderCode}. Tồn kho đã được hoàn lại.`);
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể hủy đơn hàng.'));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ color: '#2C3E50' }}>Đơn hàng của tôi</h1>
      {loading ? <Spinner size="lg" /> : error ? (
        <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#64748B' }}>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {orders.map((order) => (
            <article key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', background: '#FFFFFF', padding: '18px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <Link to={`/orders/${order.id}`} style={{ flex: 1, color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <strong>{order.orderCode}</strong><Badge status={order.status} />
                </div>
                <p style={{ margin: '10px 0 4px', color: '#64748B' }}>{new Date(order.createdAt).toLocaleString('vi-VN')} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</p>
                <strong style={{ color: '#E74C3C' }}>{formatVND(order.totalPrice)}</strong>
              </Link>
              {order.status === OrderStatus.PENDING && (
                <Button
                  variant="outline"
                  size="sm"
                  loading={cancellingId === order.id}
                  disabled={Boolean(cancellingId)}
                  onClick={() => void handleCancelOrder(order)}
                >
                  Hủy đơn
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
