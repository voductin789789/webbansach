import React, { useCallback, useEffect, useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { cancelOrder, getAdminOrders, updateOrderTracking } from '../../api/orders';
import { api } from '../../api/httpClient';
import { getApiErrorMessage } from '../../api/response';
import { formatVND } from '../../types/formatVND';
import { toast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import { Button, Input, Spinner } from '../../components/ui';
import { RefreshCw } from 'lucide-react';

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PENDING]: OrderStatus.PROCESSING,
  [OrderStatus.PROCESSING]: OrderStatus.SHIPPED,
  [OrderStatus.SHIPPED]: OrderStatus.DELIVERED,
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [trackingForm, setTrackingForm] = useState<Record<string, { provider: string; code: string }>>({});

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAdminOrders(1, 100);
      setOrders(result.orders);
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'Không tải được danh sách đơn hàng.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const advanceOrder = async (order: Order) => {
    const status = nextStatus[order.status];
    if (!status || updatingId) return;
    setUpdatingId(order.id);
    try {
      await api.patch(`/orders/${order.id}/status`, { status });
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
      toast.success(`Đã chuyển ${order.orderCode} sang ${status}.`);
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể cập nhật trạng thái đơn.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm(`Hủy đơn ${order.orderCode} và hoàn lại tồn kho?`)) return;

    setUpdatingId(order.id);
    setCancellingId(order.id);
    try {
      const updatedOrder = await cancelOrder(order.id);
      setOrders((current) =>
        current.map((item) => item.id === updatedOrder.id ? updatedOrder : item)
      );
      toast.success(`Đã hủy đơn ${order.orderCode}.`);
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể hủy đơn hàng.'));
    } finally {
      setUpdatingId(null);
      setCancellingId(null);
    }
  };

  const saveTracking = async (order: Order) => {
    const form = trackingForm[order.id] ?? {
      provider: order.shippingProvider || '',
      code: order.trackingCode || '',
    };
    if (!form.provider.trim() || !form.code.trim()) {
      toast.error('Vui lòng nhập đơn vị vận chuyển và mã vận đơn.');
      return;
    }
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderTracking(order.id, form.provider.trim(), form.code.trim());
      setOrders((current) => current.map((item) => item.id === order.id ? updated : item));
      toast.success(`Đã lưu vận đơn cho ${order.orderCode}.`);
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể cập nhật vận đơn.'));
    } finally { setUpdatingId(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <div><h1 style={{ color: '#2C3E50', margin: 0 }}>Quản lý đơn hàng</h1><p style={{ color: '#64748B' }}>Chuyển trạng thái theo luồng PENDING → PROCESSING → SHIPPED → DELIVERED.</p></div>
        <Button variant="outline" onClick={() => void loadOrders()} icon={<RefreshCw size={15} />}>Làm mới</Button>
      </div>
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflowX: 'auto' }}>
        {loading ? <div style={{ padding: '48px', textAlign: 'center' }}><Spinner size="lg" /></div> : error ? (
          <p role="alert" style={{ padding: '24px', color: '#B91C1C' }}>{error}</p>
        ) : orders.length === 0 ? <p style={{ padding: '30px', color: '#64748B' }}>Chưa có đơn hàng.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead><tr style={{ background: '#F8FAFC', color: '#64748B' }}>
              <th style={{ padding: '14px 18px' }}>Mã đơn</th><th style={{ padding: '14px 18px' }}>Người nhận</th><th style={{ padding: '14px 18px' }}>Ngày đặt</th><th style={{ padding: '14px 18px' }}>Tổng tiền</th><th style={{ padding: '14px 18px' }}>Trạng thái</th><th style={{ padding: '14px 18px' }}>Vận đơn</th><th style={{ padding: '14px 18px' }}>Thao tác</th>
            </tr></thead>
            <tbody>{orders.map((order) => {
              const next = nextStatus[order.status];
              const canCancel = order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING;
              const tracking = trackingForm[order.id] ?? {
                provider: order.shippingProvider || '',
                code: order.trackingCode || '',
              };
              return (
                <tr key={order.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700 }}>{order.orderCode}</td>
                  <td style={{ padding: '14px 18px' }}>{order.recipientName}<div style={{ fontSize: '12px', color: '#64748B' }}>{order.recipientPhone}</div></td>
                  <td style={{ padding: '14px 18px' }}>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                  <td style={{ padding: '14px 18px', color: '#E74C3C', fontWeight: 700 }}>{formatVND(order.totalPrice)}</td>
                  <td style={{ padding: '14px 18px' }}><Badge status={order.status} /></td>
                  <td style={{ padding: '14px 18px', minWidth: 210 }}>
                    {order.status === OrderStatus.PROCESSING || order.status === OrderStatus.SHIPPED ? <>
                      <Input aria-label={`Đơn vị vận chuyển ${order.orderCode}`} placeholder="Đơn vị vận chuyển" value={tracking.provider} onChange={(event) => setTrackingForm((current) => ({ ...current, [order.id]: { ...tracking, provider: event.target.value } }))} />
                      <Input aria-label={`Mã vận đơn ${order.orderCode}`} placeholder="Mã vận đơn" value={tracking.code} onChange={(event) => setTrackingForm((current) => ({ ...current, [order.id]: { ...tracking, code: event.target.value } }))} />
                      <Button size="sm" variant="outline" loading={updatingId === order.id} disabled={Boolean(updatingId)} onClick={() => void saveTracking(order)}>Lưu vận đơn</Button>
                    </> : <span style={{ color: '#64748B' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {next && <Button size="sm" loading={updatingId === order.id && cancellingId !== order.id} disabled={Boolean(updatingId)} onClick={() => void advanceOrder(order)}>Chuyển {next}</Button>}
                      {canCancel && <Button variant="danger" size="sm" loading={cancellingId === order.id} disabled={Boolean(updatingId)} onClick={() => void handleCancelOrder(order)}>Hủy</Button>}
                      {!next && !canCancel && <span style={{ color: '#64748B' }}>Không có thao tác</span>}
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
