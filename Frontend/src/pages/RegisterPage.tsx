import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Mail, UserRound } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { getApiErrorMessage } from '../api/response';
import { mapApiUser, registerAccount } from '../api/auth';
import { useAuth } from '../providers/AuthProvider';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerAccount({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      login(mapApiUser(result.user), result.token);
      toast.success('Đăng ký tài khoản thành công.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tạo tài khoản. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <BookOpen size={32} color="#E74C3C" />
          <h1 style={{ fontSize: '24px', color: '#2C3E50', margin: '10px 0 4px' }}>Tạo tài khoản</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Đăng ký để đặt hàng và theo dõi đơn hàng.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <Input label="Họ và tên" value={name} onChange={(event) => setName(event.target.value)} leftIcon={<UserRound size={16} />} minLength={2} required />
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} leftIcon={<Mail size={16} />} required />
          <Input label="Số điện thoại" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Input label="Mật khẩu" type="password" value={password} onChange={(event) => setPassword(event.target.value)} leftIcon={<Lock size={16} />} minLength={6} required />
          <Input label="Xác nhận mật khẩu" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} required />
          <Button type="submit" fullWidth size="lg" loading={submitting}>Đăng ký</Button>
        </form>
        <p style={{ textAlign: 'center', margin: '18px 0 0', color: '#64748B', fontSize: '14px' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#E74C3C', fontWeight: 700 }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
