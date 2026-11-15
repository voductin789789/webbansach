// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../providers/CartProvider';
import { useAuth } from '../../providers/AuthProvider';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  BookOpen,
  Menu,
  X,
  Phone,
  ShieldCheck,
  Truck,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Danh mục sách', path: '/categories' },
    { label: 'Sách mới', path: '/books?filter=new' },
    { label: 'Khuyến mãi', path: '/books?filter=discount' },
    { label: 'Tác giả', path: '/authors' },
    { label: 'Giới thiệu', path: '/about' },
    { label: 'Liên hệ', path: '/contact' },
  ];

  return (
    <header style={{ width: '100%', backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {/* Top Bar / Announcement */}
      <div
        style={{
          backgroundColor: '#1E2B37',
          color: '#E2E8F0',
          fontSize: '13px',
          padding: '6px 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} color="#E74C3C" /> Hotline: <strong>1900 6868</strong> (8:00 - 21:00)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} color="#E74C3C" /> Miễn phí vận chuyển cho đơn từ 250.000₫
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#E74C3C" /> 100% Sách Thật - Đổi trả 7 ngày
            </span>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#E74C3C',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <LayoutDashboard size={12} /> Trang Quản Trị
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header (Logo + Search + Cart + Account) */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: '#2C3E50',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <BookOpen size={24} color="#E74C3C" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#2C3E50',
                  letterSpacing: '-0.5px',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                BOOK<span style={{ color: '#E74C3C' }}>STORE</span>
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', letterSpacing: '1px' }}>
                THẾ GIỚI TRI THỨC
              </span>
            </div>
          </Link>

          {/* Search Bar - Center */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: '560px',
              display: 'flex',
              position: 'relative',
            }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm sách theo tên tác phẩm, tác giả, nhà xuất bản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                paddingRight: '100px',
                borderRadius: '6px',
                border: '2px solid #2C3E50',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '3px',
                top: '3px',
                bottom: '3px',
                backgroundColor: '#2C3E50',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                padding: '0 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              <Search size={16} />
              <span>Tìm</span>
            </button>
          </form>

          {/* Right Actions: Cart & Account */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Cart Button */}
            <Link
              to="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                position: 'relative',
                color: '#2C3E50',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={22} color="#2C3E50" />
                {totalItems > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-10px',
                      backgroundColor: '#E74C3C',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(231,76,60,0.4)',
                    }}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="hidden-mobile">Giỏ hàng</span>
            </Link>

            {/* Account / Login */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2C3E50',
                  }}
                >
                  <UserIcon size={18} color="#2C3E50" />
                  <span>{user?.name || 'Tài khoản'}</span>
                </div>
                <button
                  onClick={logout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#2C3E50',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                }}
              >
                <UserIcon size={18} />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#2C3E50',
              }}
              className="mobile-menu-toggle"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar (Desktop) */}
      <nav
        style={{
          backgroundColor: '#2C3E50',
          color: '#FFFFFF',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
              margin: 0,
              flexWrap: 'wrap',
            }}
          >
            {navLinks.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    transition: 'background-color 0.2s',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#34495E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#2C3E50',
            color: '#FFFFFF',
            padding: '16px 20px',
            borderTop: '1px solid #34495E',
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {navLinks.map((item) => (
              <li key={item.path} style={{ marginBottom: '8px' }}>
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '8px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    borderBottom: '1px solid #34495E',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li style={{ marginTop: '12px' }}>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    backgroundColor: '#E74C3C',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  Đến Trang Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
