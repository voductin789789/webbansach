// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { toast } from '../components/ui/Toast';
import { Button, Input } from '../components/ui';
import { BookOpen, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@bookstore.vn');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<'admin' | 'customer'>('admin');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      {
        id: 'user-1',
        name: role === 'admin' ? 'Quản Trị Viên (Admin)' : 'Nguyễn Khách Hàng',
        email,
        role,
      },
      'mock_jwt_token_secret_123'
    );
    toast.success(`Đăng nhập thành công với vai trò ${role.toUpperCase()}!`);
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '36px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2C3E50',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '12px',
            }}
          >
            <BookOpen size={26} color="#E74C3C" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#2C3E50', margin: '0 0 6px 0' }}>
            Đăng Nhập Tài Khoản
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Hệ thống website bán sách trực tuyến BookStore
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} />}
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={16} />}
            required
          />

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#2C3E50', marginBottom: '8px' }}>
              Vai trò trải nghiệm:
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                />
                Quản trị viên (Admin)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                />
                Khách hàng
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg">
            Đăng Nhập
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

