import React, { useCallback, useEffect, useState } from 'react';
import { Address, deleteAddress, getAddresses, saveAddress } from '../api/storefront';
import { getApiErrorMessage } from '../api/response';
import { Button, Input, Spinner } from '../components/ui';
import { toast } from '../components/ui/Toast';

type AddressForm = Omit<Address, 'id'>;
const emptyAddress: AddressForm = {
  label: 'Nhà riêng',
  recipientName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  addressLine: '',
  isDefault: false,
};

const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyAddress);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadAddresses = useCallback(async () => {
    setError('');
    try { setAddresses(await getAddresses()); }
    catch (reason) { setError(getApiErrorMessage(reason, 'Không tải được sổ địa chỉ.')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadAddresses(); }, [loadAddresses]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveAddress(form, editingId);
      setForm(emptyAddress);
      setEditingId(undefined);
      toast.success('Đã lưu địa chỉ nhận hàng.');
      await loadAddresses();
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể lưu địa chỉ.'));
    } finally { setSaving(false); }
  };

  const edit = (address: Address) => {
    setEditingId(address.id);
    const { id: _id, ...values } = address;
    setForm(values);
  };

  const remove = async (id: number) => {
    try {
      await deleteAddress(id);
      toast.success('Đã xóa địa chỉ.');
      await loadAddresses();
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể xóa địa chỉ.'));
    }
  };

  return (
    <main className="container" style={{ maxWidth: 900, padding: '36px 16px' }}>
      <h1 style={{ color: '#2C3E50' }}>Sổ địa chỉ nhận hàng</h1>
      {error && <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>}
      {loading ? <div style={{ padding: 32, textAlign: 'center' }}><Spinner size="lg" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
          <form onSubmit={submit} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</h2>
            <Input label="Nhãn địa chỉ" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} required />
            <Input label="Người nhận" value={form.recipientName} onChange={(event) => setForm({ ...form, recipientName: event.target.value })} required />
            <Input label="Số điện thoại" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} pattern="0[0-9]{9}" required />
            <Input label="Tỉnh/thành phố" value={form.province} onChange={(event) => setForm({ ...form, province: event.target.value })} required />
            <Input label="Quận/huyện" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} required />
            <Input label="Phường/xã" value={form.ward} onChange={(event) => setForm({ ...form, ward: event.target.value })} required />
            <Input label="Số nhà, tên đường" value={form.addressLine} onChange={(event) => setForm({ ...form, addressLine: event.target.value })} required />
            <label style={{ display: 'flex', gap: 8, marginBottom: 16 }}><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} /> Đặt làm địa chỉ mặc định</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="submit" loading={saving}>{editingId ? 'Lưu địa chỉ' : 'Thêm địa chỉ'}</Button>
              {editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(undefined); setForm(emptyAddress); }}>Hủy sửa</Button>}
            </div>
          </form>
          <section>
            <h2 style={{ marginTop: 0 }}>Địa chỉ đã lưu</h2>
            {addresses.length === 0 && <p style={{ color: '#64748B' }}>Chưa có địa chỉ nào.</p>}
            <div style={{ display: 'grid', gap: 12 }}>
              {addresses.map((address) => (
                <article key={address.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16 }}>
                  <strong>{address.label}{address.isDefault ? ' · Mặc định' : ''}</strong>
                  <p style={{ margin: '8px 0', lineHeight: 1.55 }}>{address.recipientName} · {address.phone}<br />{address.addressLine}, {address.ward}, {address.district}, {address.province}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Button size="sm" variant="outline" onClick={() => edit(address)}>Sửa</Button>
                    {!address.isDefault && <Button size="sm" variant="outline" onClick={() => void saveAddress({ ...address, isDefault: true }, address.id).then(loadAddresses).catch((reason: unknown) => toast.error(getApiErrorMessage(reason, 'Không thể đặt địa chỉ mặc định.')))}>Đặt mặc định</Button>}
                    <Button size="sm" variant="danger" onClick={() => void remove(address.id)}>Xóa</Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default AddressesPage;
