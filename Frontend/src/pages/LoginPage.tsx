import './AuthPages.css';
// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/httpClient';
import { useAuth } from '../providers/AuthProvider';
import { toast } from '../components/ui/Toast';
import { Button, Input } from '../components/ui';
import { BookOpen, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as {from?:string} | null)?.from;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      login({ ...user, id: String(user.id), role: user.role.toLowerCase() }, token);
      toast.success('Đăng nhập thành công');
      navigate(redirectTo?.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : (user.role === 'ADMIN' ? '/admin/dashboard' : '/'), {replace:true});
    } catch { toast.error('Đăng nhập thất bại, vui lòng kiểm tra tài khoản'); }
    finally { setSubmitting(false); }
  };

  return (
    <div
      style={{
        minHeight: '70vh', background: 'radial-gradient(ellipse at 10% 15%,#fcebe7 0,transparent 36%),#f6f8fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '44px',
          width: '100%',
          maxWidth: '465px',
          boxShadow: '0 24px 64px rgba(42,58,80,0.1)',
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

          <Button type="submit" variant="primary" fullWidth size="lg">
            {submitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </Button>
        </form>
        <p style={{ textAlign: 'center' }}>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;

