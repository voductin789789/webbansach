// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { toast } from '../components/ui/Toast';
import { Button, Input } from '../components/ui';
import { BookOpen, Lock, Mail } from 'lucide-react';
import { getApiErrorMessage } from '../api/response';
import { loginWithPassword, mapApiUser } from '../api/auth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await loginWithPassword(email.trim(), password);
      const user = mapApiUser(result.user);
      login(user, result.token);
      toast.success('Đăng nhập thành công.');
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(destination || (user.role === 'admin' ? '/admin/dashboard' : '/'), { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể đăng nhập. Vui lòng kiểm tra thông tin và thử lại.'));
    } finally {
      setSubmitting(false);
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

          <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
            Đăng Nhập
          </Button>
        </form>
        <p style={{ textAlign: 'center', margin: '18px 0 0', color: '#64748B', fontSize: '14px' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: '#E74C3C', fontWeight: 700 }}>Đăng ký</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

