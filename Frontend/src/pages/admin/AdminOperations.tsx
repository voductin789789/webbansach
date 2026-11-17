import React, { useCallback, useEffect, useState } from 'react';
import { getBooks } from '../../api/catalog';
import {
  Coupon,
  CouponType,
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
  getLowStockBooks,
  getSalesReport,
  receiveInventory,
  SalesReport,
  updateAdminCoupon,
} from '../../api/admin';
import { getApiErrorMessage } from '../../api/response';
import { Book } from '../../types';
import { formatVND } from '../../types/formatVND';
import { Button, Input, Spinner } from '../../components/ui';
import { toast } from '../../components/ui/Toast';

type Tab = 'overview' | 'coupons' | 'inventory' | 'reports';

const AdminOperations: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [lowStock, setLowStock] = useState<Array<{ id: number; title: string; stock: number }>>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [couponForm, setCouponForm] = useState({ code: '', type: 'PERCENT' as CouponType, value: '10', minimumOrder: '0', maximumDiscount: '' });
  const [stockForm, setStockForm] = useState({ bookId: '', quantity: '1', unitCost: '', note: '' });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [couponResult, bookResult, stockResult, reportResult] = await Promise.all([
        getAdminCoupons(),
        getBooks({ page: 1, limit: 100 }),
        getLowStockBooks(),
        getSalesReport(),
      ]);
      setCoupons(couponResult);
      setBooks(bookResult.books);
      setLowStock(stockResult);
      setReport(reportResult);
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'Không tải được dữ liệu quản trị.'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const createCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createAdminCoupon({
        code: couponForm.code.trim().toUpperCase(),
        type: couponForm.type,
        value: Number(couponForm.value),
        minimumOrder: Number(couponForm.minimumOrder),
        maximumDiscount: couponForm.maximumDiscount ? Number(couponForm.maximumDiscount) : null,
        active: true,
      });
      setCouponForm({ ...couponForm, code: '' });
      toast.success('Đã tạo mã ưu đãi.');
      await loadData();
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể tạo mã ưu đãi.'));
    } finally { setSaving(false); }
  };

  const toggleCoupon = async (coupon: Coupon) => {
    try {
      await updateAdminCoupon(coupon.id, { active: !coupon.active });
      await loadData();
    } catch (reason) { toast.error(getApiErrorMessage(reason, 'Không thể cập nhật mã ưu đãi.')); }
  };

  const removeCoupon = async (coupon: Coupon) => {
    if (!window.confirm(`Xóa mã ${coupon.code}?`)) return;
    try {
      await deleteAdminCoupon(coupon.id);
      await loadData();
    } catch (reason) { toast.error(getApiErrorMessage(reason, 'Không thể xóa mã ưu đãi.')); }
  };

  const receive = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await receiveInventory({
        bookId: Number(stockForm.bookId),
        quantity: Number(stockForm.quantity),
        unitCost: stockForm.unitCost ? Number(stockForm.unitCost) : undefined,
        note: stockForm.note || undefined,
      });
      toast.success('Đã nhập lô hàng và cập nhật tồn kho.');
      setStockForm({ ...stockForm, quantity: '1', unitCost: '', note: '' });
      await loadData();
    } catch (reason) { toast.error(getApiErrorMessage(reason, 'Không thể nhập hàng.')); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spinner size="lg" /></div>;
  if (error) return <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>;

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'coupons', label: 'Mã ưu đãi' },
    { id: 'inventory', label: 'Nhập kho' },
    { id: 'reports', label: 'Báo cáo' },
  ];

  return (
    <div>
      <h1 style={{ color: '#2C3E50' }}>Vận hành cửa hàng</h1>
      <nav aria-label="Chức năng vận hành" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {tabs.map((item) => <Button key={item.id} variant={tab === item.id ? 'primary' : 'outline'} onClick={() => setTab(item.id)}>{item.label}</Button>)}
      </nav>

      {tab === 'overview' && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          {[
            ['Đơn đã giao', report?.deliveredOrderCount ?? 0],
            ['Doanh thu đã giao', formatVND(report?.revenue ?? 0)],
            ['Khách hàng', report?.customerCount ?? 0],
            ['Sách tồn thấp (≤5)', report?.lowStockCount ?? 0],
          ].map(([label, value]) => <article key={String(label)} style={{ background: '#FFFFFF', padding: 20, border: '1px solid #E2E8F0', borderRadius: 8 }}><span style={{ color: '#64748B' }}>{label}</span><strong style={{ display: 'block', marginTop: 8, fontSize: 22 }}>{value}</strong></article>)}
          <div style={{ gridColumn: '1 / -1', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20 }}>
            <h2>Sách cần chú ý tồn kho</h2>
            {lowStock.length === 0 ? <p>Không có sách dưới ngưỡng cảnh báo.</p> : lowStock.map((book) => <p key={book.id}>{book.title} — còn {book.stock} cuốn</p>)}
          </div>
        </section>
      )}

      {tab === 'coupons' && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
          <form onSubmit={createCoupon} style={{ background: '#FFFFFF', padding: 20, border: '1px solid #E2E8F0', borderRadius: 8 }}>
            <h2>Tạo ưu đãi</h2>
            <Input label="Mã" value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value })} required minLength={3} />
            <label style={{ display: 'block', marginBottom: 12 }}>Loại ưu đãi
              <select value={couponForm.type} onChange={(event) => setCouponForm({ ...couponForm, type: event.target.value as CouponType })} style={{ display: 'block', width: '100%', padding: 10, marginTop: 6 }}>
                <option value="PERCENT">Giảm theo phần trăm</option><option value="FIXED">Giảm số tiền</option><option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
              </select>
            </label>
            {couponForm.type !== 'FREE_SHIPPING' && <Input label={couponForm.type === 'PERCENT' ? 'Phần trăm giảm' : 'Số tiền giảm (VND)'} type="number" min="1" value={couponForm.value} onChange={(event) => setCouponForm({ ...couponForm, value: event.target.value })} required />}
            <Input label="Đơn tối thiểu (VND)" type="number" min="0" value={couponForm.minimumOrder} onChange={(event) => setCouponForm({ ...couponForm, minimumOrder: event.target.value })} />
            {couponForm.type === 'PERCENT' && <Input label="Mức giảm tối đa (VND)" type="number" min="1" value={couponForm.maximumDiscount} onChange={(event) => setCouponForm({ ...couponForm, maximumDiscount: event.target.value })} />}
            <Button type="submit" loading={saving}>Tạo mã</Button>
          </form>
          <div style={{ display: 'grid', gap: 10 }}>
            {coupons.map((coupon) => <article key={coupon.id} style={{ background: '#FFFFFF', padding: 16, border: '1px solid #E2E8F0', borderRadius: 8 }}>
              <strong>{coupon.code}</strong> · {coupon.type === 'FREE_SHIPPING' ? 'Miễn phí ship' : coupon.type === 'PERCENT' ? `${coupon.value}%` : formatVND(coupon.value)}
              <p style={{ margin: '6px 0', color: '#64748B' }}>Đã dùng {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''} · Đơn tối thiểu {formatVND(coupon.minimumOrder)}</p>
              <Button size="sm" variant="outline" onClick={() => void toggleCoupon(coupon)}>{coupon.active ? 'Tạm dừng' : 'Kích hoạt'}</Button>{' '}
              <Button size="sm" variant="danger" onClick={() => void removeCoupon(coupon)}>Xóa</Button>
            </article>)}
          </div>
        </section>
      )}

      {tab === 'inventory' && (
        <section style={{ maxWidth: 720, background: '#FFFFFF', padding: 20, border: '1px solid #E2E8F0', borderRadius: 8 }}>
          <h2>Nhập kho theo lô</h2>
          <form onSubmit={receive}>
            <label style={{ display: 'block', marginBottom: 12 }}>Sách
              <select required value={stockForm.bookId} onChange={(event) => setStockForm({ ...stockForm, bookId: event.target.value })} style={{ display: 'block', width: '100%', padding: 10, marginTop: 6 }}>
                <option value="">Chọn sách</option>{books.map((book) => <option key={book.id} value={book.id}>{book.title} (tồn {book.stock})</option>)}
              </select>
            </label>
            <Input label="Số lượng nhập" type="number" min="1" value={stockForm.quantity} onChange={(event) => setStockForm({ ...stockForm, quantity: event.target.value })} required />
            <Input label="Giá vốn mỗi cuốn (VND)" type="number" min="1" value={stockForm.unitCost} onChange={(event) => setStockForm({ ...stockForm, unitCost: event.target.value })} />
            <Input label="Ghi chú lô nhập" value={stockForm.note} onChange={(event) => setStockForm({ ...stockForm, note: event.target.value })} />
            <Button type="submit" loading={saving}>Ghi nhận lô nhập</Button>
          </form>
        </section>
      )}

      {tab === 'reports' && report && (
        <section style={{ display: 'grid', gap: 20 }}>
          <article style={{ background: '#FFFFFF', padding: 20, border: '1px solid #E2E8F0', borderRadius: 8 }}>
            <h2>Doanh thu theo ngày (30 ngày gần nhất)</h2>
            {report.dailyRevenue.length === 0 ? <p>Chưa có đơn đã giao trong kỳ.</p> : report.dailyRevenue.map((day) => <div key={day.date} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}><span>{day.date}</span><strong>{formatVND(day.amount)}</strong></div>)}
          </article>
          <article style={{ background: '#FFFFFF', padding: 20, border: '1px solid #E2E8F0', borderRadius: 8 }}>
            <h2>Sách bán chạy nhất</h2>
            {report.bestsellers.length === 0 ? <p>Chưa có dữ liệu đơn đã giao.</p> : report.bestsellers.map((book) => <p key={book.bookId}>{book.title} — {book.quantity} cuốn, {formatVND(book.revenue)}</p>)}
          </article>
          <article style={{ background: '#FFFFFF', padding: 20, border: '1px solid #E2E8F0', borderRadius: 8 }}>
            <h2>Tồn kho chậm luân chuyển (cần kiểm tra)</h2>
            {report.lowTurnoverCandidates.map((book) => <p key={book.id}>{book.title} — tồn {book.stock}, cập nhật {new Date(book.updatedAt).toLocaleDateString('vi-VN')}</p>)}
            <small>Danh sách gợi ý theo tồn kho và lần cập nhật, không phải dự báo bán hàng.</small>
          </article>
        </section>
      )}
    </div>
  );
};

export default AdminOperations;
