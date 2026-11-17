import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { Category } from '../../types';
import { api } from '../../api/httpClient';
import { ApiEnvelope, getApiErrorMessage } from '../../api/response';
import { getCategories } from '../../api/catalog';
import { toast } from '../../components/ui/Toast';
import { Button, Input, Modal, Spinner } from '../../components/ui';
import { FolderPlus, Search, Edit2, Trash2, FolderTree, RefreshCw } from 'lucide-react';

type CategoryInput = Pick<Category, 'name' | 'slug'> & { description?: string };

const emptyCategory: CategoryInput = { name: '', slug: '', description: '' };

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyCategory);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCategories(await getCategories());
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'Không tải được danh mục.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchCategories(); }, [fetchCategories]);

  const filteredCategories = categories.filter((category) =>
    `${category.name} ${category.slug}`.toLowerCase().includes(search.toLowerCase())
  );

  const makeSlug = (value: string) => value.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyCategory);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({ name: category.name, slug: category.slug, description: category.description || '' });
    setModalOpen(true);
  };

  const saveCategory = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description?.trim() || undefined,
      };
      if (editingCategory) {
        await api.put<ApiEnvelope<Category>>(`/categories/${editingCategory.id}`, payload);
      } else {
        await api.post<ApiEnvelope<Category>>('/categories', payload);
      }
      await fetchCategories();
      toast.success(editingCategory ? 'Đã cập nhật danh mục.' : 'Đã tạo danh mục.');
      setModalOpen(false);
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể lưu danh mục.'));
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      setCategories((current) => current.filter((category) => category.id !== categoryToDelete.id));
      toast.success('Đã xóa danh mục.');
      setCategoryToDelete(null);
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể xóa danh mục.'));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div><h1 style={{ color: '#2C3E50', margin: 0 }}>Quản lý danh mục</h1><p style={{ color: '#64748B' }}>Danh mục được đồng bộ trực tiếp với Backend.</p></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" onClick={() => void fetchCategories()} icon={<RefreshCw size={16} />}>Làm mới</Button>
          <Button onClick={openCreate} icon={<FolderPlus size={16} />}>Thêm danh mục</Button>
        </div>
      </div>
      <div style={{ maxWidth: '420px', marginBottom: '18px' }}>
        <Input aria-label="Tìm danh mục" placeholder="Tìm theo tên hoặc slug" value={search} onChange={(event) => setSearch(event.target.value)} leftIcon={<Search size={16} />} />
      </div>
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflowX: 'auto' }}>
        {loading ? <div style={{ padding: '48px', textAlign: 'center' }}><Spinner size="lg" /></div> : error ? (
          <p role="alert" style={{ padding: '24px', color: '#B91C1C' }}>{error}</p>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}><FolderTree size={36} /><p>Không có danh mục phù hợp.</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead><tr style={{ background: '#F8FAFC', color: '#64748B' }}>
              <th style={{ padding: '14px 18px' }}>Tên danh mục</th><th style={{ padding: '14px 18px' }}>Slug</th><th style={{ padding: '14px 18px' }}>Số sách</th><th style={{ padding: '14px 18px', textAlign: 'right' }}>Thao tác</th>
            </tr></thead>
            <tbody>{filteredCategories.map((category) => (
              <tr key={category.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '14px 18px', fontWeight: 700 }}>{category.name}</td>
                <td style={{ padding: '14px 18px', color: '#64748B' }}>{category.slug}</td>
                <td style={{ padding: '14px 18px' }}>{category.bookCount ?? 0}</td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <Button size="sm" variant="outline" onClick={() => openEdit(category)} icon={<Edit2 size={13} />}>Sửa</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => setCategoryToDelete(category)} icon={<Trash2 size={13} />}>Xóa</Button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingCategory ? 'Cập nhật danh mục' : 'Tạo danh mục'} footer={null}>
        <form onSubmit={saveCategory}>
          <Input label="Tên danh mục" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, slug: editingCategory ? current.slug : makeSlug(event.target.value) }))} minLength={1} required />
          <Input label="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} required />
          <Input label="Mô tả" value={form.description || ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" loading={saving}>{editingCategory ? 'Lưu' : 'Tạo danh mục'}</Button>
          </div>
        </form>
      </Modal>
      <Modal open={Boolean(categoryToDelete)} onClose={() => setCategoryToDelete(null)} title="Xác nhận xóa" footer={null}>
        <p>Bạn có chắc muốn xóa danh mục <strong>{categoryToDelete?.name}</strong> không?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="ghost" onClick={() => setCategoryToDelete(null)}>Hủy</Button>
          <Button variant="danger" onClick={() => void deleteCategory()}>Xóa</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCategories;
