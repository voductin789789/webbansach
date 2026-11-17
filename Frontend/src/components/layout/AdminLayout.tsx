// src/components/layout/AdminLayout.tsx
import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import {
  LayoutDashboard,
  FolderTree,
  BookOpen,
  ShoppingBag,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  Boxes,
  Newspaper,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Bảng Điều Khiển', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Quản Lý Danh Mục', path: '/admin/categories', icon: <FolderTree size={20} /> },
    { label: 'Quản Lý Sách', path: '/admin/books', icon: <BookOpen size={20} /> },
    { label: 'Quản Lý Đơn Hàng', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { label: 'Kho & Ưu đãi', path: '/admin/operations', icon: <Boxes size={20} /> },
    { label: 'Blog / Điểm sách', path: '/admin/blog', icon: <Newspaper size={20} /> },
  ];

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#2C3E50',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
        }}
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        {/* Brand */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #34495E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#E74C3C',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 800,
                  fontSize: '18px',
                  display: 'block',
                  color: '#FFFFFF',
                }}
              >
                ADMIN<span style={{ color: '#E74C3C' }}>PANEL</span>
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>BookStore Management</span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
            className="mobile-close-btn"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu Nav Links */}
        <nav style={{ flex: 1, padding: '20px 14px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700, padding: '0 12px 10px', letterSpacing: '0.5px' }}>
            Quản trị viên
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    backgroundColor: isActive ? '#E74C3C' : 'transparent',
                    transition: 'all 0.2s ease',
                  })}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer / View Store & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #34495E', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: '#34495E',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Về Website Khách Hàng</span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#F87171',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <LogOut size={16} />
            <span>Đăng Xuất Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main" style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Admin Top Header */}
        <header
          className="admin-header"
          style={{
            height: '65px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#2C3E50',
              }}
              className="mobile-sidebar-toggle"
            >
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#2C3E50' }}>
              Hệ Thống Quản Trị Website Bán Sách
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                position: 'relative',
              }}
              title="Thông báo"
            >
              <Bell size={20} />
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#E74C3C',
                  borderRadius: '50%',
                }}
              />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#2C3E50',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#2C3E50', display: 'block', lineHeight: 1.2 }}>
                  {user?.name || 'Quản trị viên'}
                </span>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Page Content */}
        <main className="admin-content" style={{ padding: '28px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
