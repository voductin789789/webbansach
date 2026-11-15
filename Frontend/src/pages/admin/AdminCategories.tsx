// src/pages/admin/AdminCategories.tsx
import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { mockCategories } from '../../data/mockData';
import { api } from '../../api/httpClient';
import { toast } from '../../components/ui/Toast';
import { Button, Input, Modal, Spinner } from '../../components/ui';
import {
  FolderPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  FolderTree,
  RefreshCw,
} from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    icon: '📚',
    isActive: true,
  });

  // Delete Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch Categories từ API backend (BE2) hoặc dùng mock data
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get<Category[]>('/categories');
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch {
      // Khi BE2 chưa sẵn sàng, giữ mockCategories làm dữ liệu demo
      console.log('BE2 API chưa kết nối, sử dụng danh mục mẫu (mockCategories)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter Categories
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // Sinh slug tự động từ tên tiếng Việt
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setCurrentCategory((prev) => ({
      ...prev,
      name,
      slug: modalMode === 'create' ? generateSlug(name) : prev.slug,
    }));
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentCategory({
      name: '',
      slug: '',
      description: '',
      icon: '📚',
      isActive: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setModalMode('edit');
    setCurrentCategory({ ...category });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!currentCategory.name?.trim()) {
      errors.name = 'Vui lòng nhập tên danh mục';
    }
    if (!currentCategory.slug?.trim()) {
      errors.slug = 'Vui lòng nhập đường dẫn (slug)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) return;

    try {
      if (modalMode === 'create') {
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name: currentCategory.name!.trim(),
          slug: currentCategory.slug!.trim(),
          description: currentCategory.description?.trim(),
          icon: currentCategory.icon || '📚',
          bookCount: 0,
          isActive: currentCategory.isActive ?? true,
        };

        // Gửi API BE2 nếu có
        try {
          await api.post('/categories', newCat);
        } catch {
          // Fallback cập nhật local state
        }

        setCategories((prev) => [newCat, ...prev]);
        toast.success(`Đã thêm danh mục "${newCat.name}" thành công!`);
      } else {
        // Edit mode
        const updatedCat = currentCategory as Category;
        try {
          await api.put(`/categories/${updatedCat.id}`, updatedCat);
        } catch {
          // Fallback cập nhật local state
        }

        setCategories((prev) =>
          prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
        );
        toast.success(`Đã cập nhật danh mục "${updatedCat.name}"!`);
      }

      setIsModalOpen(false);
    } catch {
      toast.error('Có lỗi xảy ra khi lưu danh mục.');
    }
  };

  const handleToggleStatus = async (cat: Category) => {
    const updatedStatus = !cat.isActive;
    try {
      await api.patch(`/categories/${cat.id}/status`, { isActive: updatedStatus });
    } catch {
      // Fallback
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isActive: updatedStatus } : c))
    );
    toast.info(`Đã ${updatedStatus ? 'kích hoạt' : 'ẩn'} danh mục "${cat.name}".`);
  };

  const confirmDeleteCategory = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
    } catch {
      // Fallback
    }

    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    toast.success(`Đã xóa danh mục "${categoryToDelete.name}" thành công!`);
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div>
      {/* Page Title & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2C3E50', margin: '0 0 6px 0' }}>
            Quản Lý Danh Mục Sách
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
            Quản lý các thể loại, phân loại sách và cấu hình hiển thị ra trang chủ. Sẵn sàng tích hợp API BE2.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" onClick={fetchCategories} icon={<RefreshCw size={16} />}>
            Làm Mới
          </Button>
          <Button variant="primary" onClick={handleOpenCreateModal} icon={<FolderPlus size={16} />}>
            Thêm Danh Mục Mới
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #E2E8F0',
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <Input
            placeholder="Tìm danh mục theo tên hoặc slug..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            leftIcon={<Search size={18} />}
            style={{ marginBottom: 0 }}
          />
        </div>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
          Tổng cộng: <strong style={{ color: '#2C3E50' }}>{filteredCategories.length}</strong> danh mục
        </div>
      </div>

      {/* Categories Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Spinner size="lg" color="primary" />
            <p style={{ marginTop: '12px', color: '#64748B' }}>Đang tải danh mục từ hệ thống...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
            <FolderTree size={48} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>Không tìm thấy danh mục nào phù hợp!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 20px' }}>Icon</th>
                  <th style={{ padding: '14px 20px' }}>Tên Danh Mục</th>
                  <th style={{ padding: '14px 20px' }}>Đường dẫn (Slug)</th>
                  <th style={{ padding: '14px 20px' }}>Mô Tả</th>
                  <th style={{ padding: '14px 20px' }}>Số Lượng Sách</th>
                  <th style={{ padding: '14px 20px' }}>Trạng Thái</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 20px', fontSize: '22px' }}>
                      {cat.icon || '📚'}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#2C3E50' }}>
                      {cat.name}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748B', fontFamily: 'monospace' }}>
                      /{cat.slug}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748B', maxWidth: '280px' }}>
                      {cat.description || 'Chưa có mô tả'}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#334155' }}>
                      {cat.bookCount || 0} cuốn
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: cat.isActive !== false ? '#10B981' : '#94A3B8',
                        }}
                      >
                        {cat.isActive !== false ? (
                          <>
                            <CheckCircle size={16} /> Hoạt động
                          </>
                        ) : (
                          <>
                            <XCircle size={16} /> Đang ẩn
                          </>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={13} /> Sửa
                        </button>
                        <button
                          onClick={() => confirmDeleteCategory(cat)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#FEF2F2',
                            color: '#B91C1C',
                            border: '1px solid #FECACA',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                          title="Xóa danh mục"
                        >
                          <Trash2 size={13} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm / Chỉnh Sửa Danh Mục */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Thêm Danh Mục Sách Mới' : 'Cập Nhật Danh Mục Sách'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy Bỏ
            </Button>
            <Button variant="primary" onClick={handleSaveCategory}>
              {modalMode === 'create' ? 'Tạo Danh Mục' : 'Lưu Thay Đổi'}
            </Button>
          </>
        }
      >
        <div>
          <Input
            label="Tên Danh Mục *"
            placeholder="Ví dụ: Kinh tế - Quản trị"
            value={currentCategory.name || ''}
            onChange={(e) => handleNameChange(e.target.value)}
            error={formErrors.name}
          />

          <Input
            label="Đường Dẫn Slug *"
            placeholder="kinh-te"
            value={currentCategory.slug || ''}
            onChange={(e) => setCurrentCategory((prev) => ({ ...prev, slug: e.target.value }))}
            error={formErrors.slug}
            helperText="Đường dẫn thân thiện cho SEO (VD: /categories/kinh-te)"
          />

          <Input
            label="Biểu Tượng Emoji/Icon"
            placeholder="📚, 💼, 🌱, 🧸..."
            value={currentCategory.icon || ''}
            onChange={(e) => setCurrentCategory((prev) => ({ ...prev, icon: e.target.value }))}
          />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 600, color: '#2C3E50' }}>
              Mô Tả Ngắn
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                minHeight: '80px',
              }}
              placeholder="Mô tả tóm tắt nội dung các đầu sách thuộc danh mục này..."
              value={currentCategory.description || ''}
              onChange={(e) => setCurrentCategory((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={currentCategory.isActive ?? true}
              onChange={(e) => setCurrentCategory((prev) => ({ ...prev, isActive: e.target.checked }))}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="isActiveCheck" style={{ fontSize: '14px', fontWeight: 600, color: '#2C3E50', cursor: 'pointer' }}>
              Hiển thị danh mục ra website bán hàng
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal Xác Nhận Xóa */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác Nhận Xóa Danh Mục"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteCategory}>
              Đồng Ý Xóa
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '15px' }}>
          Bạn có chắc chắn muốn xóa danh mục{' '}
          <strong style={{ color: '#E74C3C' }}>"{categoryToDelete?.name}"</strong> không? Thao tác này sẽ không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
};

export default AdminCategories;

