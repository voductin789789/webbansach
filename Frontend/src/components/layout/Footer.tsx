// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Phone, Mail, Clock, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
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
                <h4 style={{ color: '#FFFFFF', fontSize: '15px', margin: 0 }}>GIAO HÀNG TẬN NƠI</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Miễn phí vận chuyển từ 250k</p>
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
                <h4 style={{ color: '#FFFFFF', fontSize: '15px', margin: 0 }}>ĐỔI TRẢ TRONG 7 NGÀY</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Nếu sách có lỗi từ nhà xuất bản</p>
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
                <h4 style={{ color: '#FFFFFF', fontSize: '15px', margin: 0 }}>100% SÁCH THẬT CHÍNH HÃNG</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Cam kết hoàn tiền 200% nếu giả</p>
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
                <li><Link to="/categories?slug=van-hoc" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>Văn học kinh điển & Hiện đại</Link></li>
                <li><Link to="/categories?slug=kinh-te" style={{ color: '#94A3B8' }}>Kinh tế & Quản trị kinh doanh</Link></li>
                <li><Link to="/categories?slug=ky-nang-song" style={{ color: '#94A3B8' }}>Kỹ năng sống & Phát triển bản thân</Link></li>
                <li><Link to="/categories?slug=thieu-nhi" style={{ color: '#94A3B8' }}>Sách thiếu nhi & Truyện tranh</Link></li>
                <li><Link to="/categories?slug=khoa-hoc-cong-nghe" style={{ color: '#94A3B8' }}>Khoa học & Công nghệ thông tin</Link></li>
                <li><Link to="/categories?slug=ngoai-ngu" style={{ color: '#94A3B8' }}>Sách học ngoại ngữ & Từ điển</Link></li>
              </ul>
            </div>

            {/* Col 3: Customer Care & Policies */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '18px', borderLeft: '3px solid #E74C3C', paddingLeft: '8px' }}>
                HỖ TRỢ KHÁCH HÀNG
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <li><Link to="/policy/shipping" style={{ color: '#94A3B8' }}>Chính sách giao hàng & Cước phí</Link></li>
                <li><Link to="/policy/return" style={{ color: '#94A3B8' }}>Chính sách đổi trả & Hoàn tiền</Link></li>
                <li><Link to="/policy/privacy" style={{ color: '#94A3B8' }}>Chính sách bảo mật thông tin</Link></li>
                <li><Link to="/policy/terms" style={{ color: '#94A3B8' }}>Điều khoản & Quy định sử dụng</Link></li>
                <li><Link to="/faq" style={{ color: '#94A3B8' }}>Câu hỏi thường gặp (FAQ)</Link></li>
                <li><Link to="/contact" style={{ color: '#94A3B8' }}>Liên hệ hỗ trợ khiếu nại</Link></li>
              </ul>
            </div>

            {/* Col 4: Payment & App */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '18px', borderLeft: '3px solid #E74C3C', paddingLeft: '8px' }}>
                PHƯƠNG THỨC THANH TOÁN
              </h4>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px' }}>
                Hỗ trợ thanh toán linh hoạt bằng Tiền mặt (COD), Chuyển khoản ngân hàng, Thẻ tín dụng/ghi nợ (Visa, Master), Ví điện tử Momo, VNPay.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <span style={{ backgroundColor: '#2C3E50', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>COD</span>
                <span style={{ backgroundColor: '#2C3E50', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>VNPay</span>
                <span style={{ backgroundColor: '#2C3E50', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Momo</span>
                <span style={{ backgroundColor: '#2C3E50', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Visa / Master</span>
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '10px' }}>KẾT NỐI VỚI CHÚNG TÔI</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="#facebook" style={{ color: '#38BDF8', fontSize: '14px' }}>Facebook</a>
                <span style={{ color: '#64748B' }}>•</span>
                <a href="#youtube" style={{ color: '#F87171', fontSize: '14px' }}>YouTube</a>
                <span style={{ color: '#64748B' }}>•</span>
                <a href="#tiktok" style={{ color: '#F472B6', fontSize: '14px' }}>TikTok</a>
              </div>
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
