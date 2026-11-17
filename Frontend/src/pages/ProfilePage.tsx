import React, { useState } from 'react';
import { api } from '../api/httpClient';
import { ApiEnvelope, getApiErrorMessage, getResponseData } from '../api/response';
import { ApiUser, mapApiUser } from '../api/auth';
import { Button, Input } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { useAuth } from '../providers/AuthProvider';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.put<ApiEnvelope<ApiUser>>('/auth/profile', {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      updateUser(mapApiUser(getResponseData(response)));
      toast.success('Đã cập nhật thông tin tài khoản.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật thông tin.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ color: '#2C3E50' }}>Thông tin tài khoản</h1>
      <p style={{ color: '#475569' }}>Điểm thưởng hiện có: <strong>{user?.loyaltyPoints ?? 0}</strong></p>
      <p><a href="/addresses">Quản lý các địa chỉ nhận hàng</a></p>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', background: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
        <Input label="Họ và tên" value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
        <Input label="Email" type="email" value={user?.email || ''} disabled />
        <Input label="Số điện thoại" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <Input label="Địa chỉ" value={address} onChange={(event) => setAddress(event.target.value)} />
        <Button type="submit" loading={saving}>Lưu thay đổi</Button>
      </form>
    </div>
  );
};

export default ProfilePage;
