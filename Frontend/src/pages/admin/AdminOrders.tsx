// src/pages/admin/AdminOrders.tsx
import React from 'react';
import { mockOrders } from '../../data/mockData';
import { formatVND } from '../../types/formatVND';
import Badge from '../../components/ui/Badge';

export const AdminOrders: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', margin: '0 0 6px 0' }}>
          Quản Lý Đơn Hàng
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
          Theo dõi trạng thái đơn đặt mua sách và tiến độ giao hàng (Placeholder cho FE3).
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '14px 20px' }}>Mã Đơn</th>
              <th style={{ padding: '14px 20px' }}>Khách Hàng</th>
              <th style={{ padding: '14px 20px' }}>Số Điện Thoại</th>
              <th style={{ padding: '14px 20px' }}>Ngày Đặt</th>
              <th style={{ padding: '14px 20px' }}>Tổng Tiền</th>
              <th style={{ padding: '14px 20px' }}>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#2C3E50' }}>{o.id}</td>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>{o.customerName}</td>
                <td style={{ padding: '14px 20px', color: '#64748B' }}>{o.customerPhone}</td>
                <td style={{ padding: '14px 20px', color: '#64748B' }}>{o.createdAt}</td>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#E74C3C' }}>{formatVND(o.totalAmount)}</td>
                <td style={{ padding: '14px 20px' }}><Badge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;

