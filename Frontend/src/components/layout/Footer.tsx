// src/components/layout/Footer.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Phone, Mail, Clock, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { subscribeNewsletter } from '../../api/storefront';
import { getApiErrorMessage } from '../../api/response';
import { toast } from '../ui/Toast';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubscribing(true);
    try {
      await subscribeNewsletter(newsletterEmail.trim());
      setNewsletterEmail('');
      toast.success('Đã đăng ký nhận tin phát hành sách.');
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể đăng ký nhận tin.'));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer style={{ backgroundColor: '#1E2B37', color: '#CBD5E1', marginTop: '60px' }}>
      {/* Policy Banner */}
      <div style={{ backgroundColor: '#2C3E50', borderBottom: '1px solid #34495E', padding: '24px 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(231,76,60,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Truck size={24} color="#E74C3C" />
              </div>
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '15px', margin: 0 }}>ĐẶT HÀNG COD</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Thanh toán khi nhận sách</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(231,76,60,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <RefreshCw size={24} color="#E74C3C" />
              </div>
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '15px', margin: 0 }}>THEO DÕI ĐƠN HÀNG</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Tra cứu trong tài khoản</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(231,76,60,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} color="#E74C3C" />
              </div>
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '15px', margin: 0 }}>THÔNG TIN RÕ RÀNG</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Giá và tồn kho từ hệ thống</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div style={{ padding: '48px 0 32px' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '32px',
            }}
          >
            {/* Col 1: Store Intro */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <BookOpen size={28} color="#E74C3C" />
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}
                >
                  BOOK<span style={{ color: '#E74C3C' }}>STORE</span>
                </span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#94A3B8', marginBottom: '16px' }}>
                Nền tảng thương mại điện tử chuyên cung cấp các đầu sách bản quyền uy tín, đa dạng từ văn học, kinh tế, kỹ năng sống cho đến giáo trình học tập.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="#E74C3C" /> Số 123 Đường Sách, Q. 1, TP. Hồ Chí Minh
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} color="#E74C3C" /> 1900 6868 - 028 3822 5555
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color="#E74C3C" /> hotro@bookstore.vn
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#E74C3C" /> Giờ làm việc: 8:00 - 21:00 (Thứ 2 - CN)
                </div>
              </div>
            </div>

            {/* Col 2: Categories */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '18px', borderLeft: '3px solid #E74C3C', paddingLeft: '8px' }}>
                DANH MỤC PHỔ BIẾN
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <li><Link to="/categories/van-hoc" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Văn học kinh điển & Hiện đại</Link></li>
                <li><Link to="/categories/kinh-te" style={{ color: '#94A3B8' }}>Kinh tế & Quản trị kinh doanh</Link></li>
                <li><Link to="/categories/ky-nang-song" style={{ color: '#94A3B8' }}>Kỹ năng sống & Phát triển bản thân</Link></li>
                <li><Link to="/categories/thieu-nhi" style={{ color: '#94A3B8' }}>Sách thiếu nhi & Truyện tranh</Link></li>
                <li><Link to="/categories/khoa-hoc-cong-nghe" style={{ color: '#94A3B8' }}>Khoa học & Công nghệ thông tin</Link></li>
                <li><Link to="/categories/ngoai-ngu" style={{ color: '#94A3B8' }}>Sách học ngoại ngữ & Từ điển</Link></li>
              </ul>
            </div>

            {/* Col 3: Customer Care & Policies */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '18px', borderLeft: '3px solid #E74C3C', paddingLeft: '8px' }}>
                HỖ TRỢ KHÁCH HÀNG
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <li><Link to="/my-orders" style={{ color: '#94A3B8' }}>Tra cứu đơn hàng</Link></li>
                <li><Link to="/profile" style={{ color: '#94A3B8' }}>Thông tin tài khoản</Link></li>
                <li><Link to="/cart" style={{ color: '#94A3B8' }}>Giỏ hàng</Link></li>
              </ul>
            </div>

            {/* Col 4: Payment & App */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '18px', borderLeft: '3px solid #E74C3C', paddingLeft: '8px' }}>
                PHƯƠNG THỨC THANH TOÁN
              </h4>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px' }}>
                Phương thức thanh toán hiện được hỗ trợ: tiền mặt khi nhận hàng (COD).
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <span style={{ backgroundColor: '#2C3E50', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>COD</span>
              </div>
              <form onSubmit={handleNewsletterSubmit} aria-label="Đăng ký nhận tin sách mới">
                <label htmlFor="newsletter-email" style={{ display: 'block', marginBottom: 8, color: '#FFFFFF', fontSize: 14 }}>Nhận tin sách mới</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="Email của bạn"
                    style={{ minWidth: 0, flex: 1, padding: '9px 10px', borderRadius: 4, border: '1px solid #475569' }}
                  />
                  <button type="submit" disabled={subscribing} style={{ border: 0, borderRadius: 4, padding: '0 12px', background: '#E74C3C', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>
                    {subscribing ? 'Đang gửi' : 'Đăng ký'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ borderTop: '1px solid #334155', padding: '18px 0', fontSize: '13px', textAlign: 'center', color: '#64748B' }}>
        <div className="container">
          <p style={{ margin: 0 }}>
            © 2026 <strong>BookStore</strong> - Dự án Lập Trình Web - Nhóm 9. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
