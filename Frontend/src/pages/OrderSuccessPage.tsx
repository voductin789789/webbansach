import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { getOrder, simulatePayment } from '../api/orders';
import { Order } from '../types';
import { toast } from '../components/ui/Toast';
import { getApiErrorMessage } from '../api/response';

const OrderSuccessPage: React.FC = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getOrder(id).then((result) => { if (active) setOrder(result); }).catch((reason: unknown) => {
      if (active) toast.error(getApiErrorMessage(reason, 'Không tải được thông tin đơn hàng.'));
    });
    return () => { active = false; };
  }, [id]);

  const handleSandboxPayment = async () => {
    if (!id) return;
    setPaying(true);
    try {
      setOrder(await simulatePayment(id));
      toast.success('Thanh toán mô phỏng thành công. Không có tiền thật được thu.');
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể thanh toán thử.'));
    } finally { setPaying(false); }
  };

  return (
    <div className="container" style={{ minHeight: '55vh', padding: '56px 16px', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div>
        <CheckCircle2 size={56} color="#10B981" />
        <h1 style={{ color: '#2C3E50' }}>Đặt hàng thành công</h1>
        <p style={{ color: '#64748B' }}>Mã đơn hàng: <strong>{order?.orderCode || id}</strong>.</p>
        {order?.paymentMethod === 'COD' && <p style={{ color: '#64748B' }}>Bạn thanh toán khi nhận hàng (COD).</p>}
        {order && order.paymentMethod !== 'COD' && (
          <div style={{ margin: '14px auto', maxWidth: 520, padding: 14, background: '#FFFBEB', color: '#92400E', borderRadius: 8 }}>
            <p style={{ marginTop: 0 }}>Phương thức thử nghiệm: {order.paymentMethod}. Không kết nối ngân hàng và không thu tiền thật.</p>
            {order.paymentStatus === 'PAID'
              ? <strong>Đã thanh toán mô phỏng.</strong>
              : <Button onClick={() => void handleSandboxPayment()} loading={paying}>Mô phỏng thanh toán thành công</Button>}
          </div>
        )}
        <p style={{ color: '#64748B', fontSize: 13 }}>Email xác nhận được đưa vào hộp thư sandbox nội bộ; hệ thống local chưa gửi email ra ngoài.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link to={`/orders/${id}`}><Button variant="primary">Xem đơn hàng</Button></Link>
          <Link to="/books"><Button variant="outline">Tiếp tục mua sách</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
