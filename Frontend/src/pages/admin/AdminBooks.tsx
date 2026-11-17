import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { Book, Category } from '../../types';
import { getBooks, getCategories } from '../../api/catalog';
import { api } from '../../api/httpClient';
import { ApiEnvelope, getApiErrorMessage } from '../../api/response';
import { formatVND } from '../../types/formatVND';
import { toast } from '../../components/ui/Toast';
import { Button, Input, Modal, Spinner } from '../../components/ui';
import BookCover from '../../components/common/BookCover';
import { PlusCircle, Edit2, Trash2, RefreshCw } from 'lucide-react';

interface BookForm {
  title: string;
  author: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  coverImage: string;
  pages: string;
  publisher: string;
  publicationYear: string;
  isbn: string;
  translator: string;
  binding: '' | 'PAPERBACK' | 'HARDCOVER' | 'DUST_JACKET';
  weightGrams: string;
  widthMm: string;
  heightMm: string;
  lengthMm: string;
  backImage: string;
  samplePdfUrl: string;
  quote: string;
  categoryId: string;
}

const emptyForm: BookForm = {
  title: '', author: '', description: '', price: '', discountPrice: '',
  stock: '0', coverImage: '', pages: '', publisher: '', publicationYear: '', categoryId: '',
  isbn: '', translator: '', binding: '', weightGrams: '', widthMm: '', heightMm: '', lengthMm: '',
  backImage: '', samplePdfUrl: '', quote: '',
};

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookForm>(emptyForm);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bookResult, categoryResult] = await Promise.all([
        getBooks({ page: 1, limit: 100 }),
        getCategories(),
      ]);
      setBooks(bookResult.books);
      setCategories(categoryResult);
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'Không tải được dữ liệu sách.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingBook(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description || '',
      price: String(book.originalPrice ?? book.price),
      discountPrice: book.originalPrice ? String(book.price) : '',
      stock: String(book.stock ?? 0),
      coverImage: book.coverImage,
      pages: book.pages ? String(book.pages) : '',
      publisher: book.publisher || '',
      publicationYear: book.publishYear ? String(book.publishYear) : '',
      isbn: book.isbn || '',
      translator: book.translator || '',
      binding: book.binding || '',
      weightGrams: book.weightGrams ? String(book.weightGrams) : '',
      widthMm: book.widthMm ? String(book.widthMm) : '',
      heightMm: book.heightMm ? String(book.heightMm) : '',
      lengthMm: book.lengthMm ? String(book.lengthMm) : '',
      backImage: book.backImage || '',
      samplePdfUrl: book.samplePdfUrl || '',
      quote: book.quote || '',
      categoryId: book.categoryId,
    });
    setModalOpen(true);
  };

  const saveBook = async (event: FormEvent) => {
    event.preventDefault();
    const categoryId = Number(form.categoryId);
    const price = Number(form.price);
    const stock = Number(form.stock);
    const discountPrice = form.discountPrice ? Number(form.discountPrice) : undefined;
    if (!Number.isSafeInteger(categoryId) || categoryId <= 0 || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
      toast.error('Vui lòng kiểm tra giá, tồn kho và danh mục.');
      return;
    }
    if (discountPrice !== undefined && (!Number.isFinite(discountPrice) || discountPrice <= 0 || discountPrice > price)) {
      toast.error('Giá khuyến mãi phải lớn hơn 0 và không vượt giá gốc.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim() || undefined,
      price,
      discountPrice,
      stock,
      coverImage: form.coverImage.trim() || undefined,
      pages: form.pages ? Number(form.pages) : undefined,
      publisher: form.publisher.trim() || undefined,
      publicationYear: form.publicationYear ? Number(form.publicationYear) : undefined,
      isbn: form.isbn.trim() || undefined,
      translator: form.translator.trim() || undefined,
      binding: form.binding || undefined,
      weightGrams: form.weightGrams ? Number(form.weightGrams) : undefined,
      widthMm: form.widthMm ? Number(form.widthMm) : undefined,
      heightMm: form.heightMm ? Number(form.heightMm) : undefined,
      lengthMm: form.lengthMm ? Number(form.lengthMm) : undefined,
      backImage: form.backImage.trim() || undefined,
      samplePdfUrl: form.samplePdfUrl.trim() || undefined,
      quote: form.quote.trim() || undefined,
      categoryId,
    };

    setSaving(true);
    try {
      if (editingBook) await api.put<ApiEnvelope<Book>>(`/books/${editingBook.id}`, payload);
      else await api.post<ApiEnvelope<Book>>('/books', payload);
      setModalOpen(false);
      toast.success(editingBook ? 'Đã cập nhật sách.' : 'Đã thêm sách.');
      await fetchData();
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể lưu sách.'));
    } finally {
      setSaving(false);
    }
  };

  const deleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await api.delete(`/books/${bookToDelete.id}`);
      setBooks((current) => current.filter((book) => book.id !== bookToDelete.id));
      toast.success('Đã xóa sách.');
      setBookToDelete(null);
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể xóa sách.'));
    }
  };

  const updateForm = (key: keyof BookForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div><h1 style={{ color: '#2C3E50', margin: 0 }}>Quản lý sách</h1><p style={{ color: '#64748B' }}>Danh sách và thao tác được kết nối API Backend.</p></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={() => void fetchData()} icon={<RefreshCw size={15} />}>Làm mới</Button>
          <Button onClick={openCreate} icon={<PlusCircle size={15} />}>Thêm sách</Button>
        </div>
      </div>
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflowX: 'auto' }}>
        {loading ? <div style={{ padding: '48px', textAlign: 'center' }}><Spinner size="lg" /></div> : error ? (
          <p role="alert" style={{ padding: '24px', color: '#B91C1C' }}>{error}</p>
        ) : books.length === 0 ? <p style={{ padding: '32px', color: '#64748B' }}>Chưa có sách.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead><tr style={{ background: '#F8FAFC', color: '#64748B' }}>
              <th style={{ padding: '14px 18px' }}>Bìa</th><th style={{ padding: '14px 18px' }}>Tên sách</th><th style={{ padding: '14px 18px' }}>Tác giả</th><th style={{ padding: '14px 18px' }}>Danh mục</th><th style={{ padding: '14px 18px' }}>Giá bán</th><th style={{ padding: '14px 18px' }}>Tồn kho</th><th style={{ padding: '14px 18px', textAlign: 'right' }}>Thao tác</th>
            </tr></thead>
            <tbody>{books.map((book) => (
              <tr key={book.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 18px', width: '58px', height: '72px' }}><BookCover book={book} /></td>
                <td style={{ padding: '12px 18px', fontWeight: 700 }}>{book.title}</td>
                <td style={{ padding: '12px 18px' }}>{book.author}</td>
                <td style={{ padding: '12px 18px' }}>{book.categoryName || categories.find((category) => category.id === book.categoryId)?.name}</td>
                <td style={{ padding: '12px 18px', color: '#E74C3C', fontWeight: 700 }}>{formatVND(book.price)}</td>
                <td style={{ padding: '12px 18px' }}>{book.stock ?? 0}</td>
                <td style={{ padding: '12px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Button size="sm" variant="outline" onClick={() => openEdit(book)} icon={<Edit2 size={13} />}>Sửa</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => setBookToDelete(book)} icon={<Trash2 size={13} />}>Xóa</Button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingBook ? 'Cập nhật sách' : 'Thêm sách'} footer={null}>
        <form onSubmit={saveBook}>
          <Input label="Tên sách" value={form.title} onChange={(event) => updateForm('title', event.target.value)} required />
          <Input label="Tác giả" value={form.author} onChange={(event) => updateForm('author', event.target.value)} required />
          <label style={{ display: 'block', marginBottom: '16px', color: '#334155', fontSize: '14px', fontWeight: 600 }}>Danh mục
            <select value={form.categoryId} onChange={(event) => updateForm('categoryId', event.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginTop: '6px', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
              <option value="">Chọn danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Giá gốc" type="number" min="1" value={form.price} onChange={(event) => updateForm('price', event.target.value)} required />
            <Input label="Giá khuyến mãi" type="number" min="1" value={form.discountPrice} onChange={(event) => updateForm('discountPrice', event.target.value)} />
            <Input label="Tồn kho" type="number" min="0" value={form.stock} onChange={(event) => updateForm('stock', event.target.value)} required />
            <Input label="Số trang" type="number" min="1" value={form.pages} onChange={(event) => updateForm('pages', event.target.value)} />
            <Input label="Nhà xuất bản" value={form.publisher} onChange={(event) => updateForm('publisher', event.target.value)} />
            <Input label="Năm xuất bản" type="number" value={form.publicationYear} onChange={(event) => updateForm('publicationYear', event.target.value)} />
            <Input label="ISBN" value={form.isbn} onChange={(event) => updateForm('isbn', event.target.value)} />
            <Input label="Dịch giả" value={form.translator} onChange={(event) => updateForm('translator', event.target.value)} />
            <Input label="Khối lượng (g)" type="number" min="1" value={form.weightGrams} onChange={(event) => updateForm('weightGrams', event.target.value)} />
            <Input label="Chiều rộng (mm)" type="number" min="1" value={form.widthMm} onChange={(event) => updateForm('widthMm', event.target.value)} />
            <Input label="Chiều cao (mm)" type="number" min="1" value={form.heightMm} onChange={(event) => updateForm('heightMm', event.target.value)} />
            <Input label="Độ dày (mm)" type="number" min="1" value={form.lengthMm} onChange={(event) => updateForm('lengthMm', event.target.value)} />
          </div>
          <label style={{ display: 'block', marginBottom: 16, color: '#334155', fontSize: 14, fontWeight: 600 }}>Hình thức bìa
            <select value={form.binding} onChange={(event) => updateForm('binding', event.target.value as BookForm['binding'])} style={{ display: 'block', width: '100%', padding: 10, marginTop: 6, border: '1px solid #CBD5E1', borderRadius: 6 }}>
              <option value="">Chưa cập nhật</option><option value="PAPERBACK">Bìa mềm</option><option value="HARDCOVER">Bìa cứng</option><option value="DUST_JACKET">Bìa áo</option>
            </select>
          </label>
          <Input label="URL ảnh bìa" type="url" value={form.coverImage} onChange={(event) => updateForm('coverImage', event.target.value)} />
          <Input label="URL ảnh bìa sau" type="url" value={form.backImage} onChange={(event) => updateForm('backImage', event.target.value)} />
          <Input label="URL PDF đọc thử (chỉ dùng bản 5–10 trang được phép chia sẻ)" type="url" value={form.samplePdfUrl} onChange={(event) => updateForm('samplePdfUrl', event.target.value)} />
          <Input label="Trích dẫn nổi bật" value={form.quote} onChange={(event) => updateForm('quote', event.target.value)} />
          <Input label="Mô tả" value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" loading={saving}>{editingBook ? 'Lưu thay đổi' : 'Tạo sách'}</Button>
          </div>
        </form>
      </Modal>
      <Modal open={Boolean(bookToDelete)} onClose={() => setBookToDelete(null)} title="Xác nhận xóa" footer={null}>
        <p>Bạn có chắc muốn xóa sách <strong>{bookToDelete?.title}</strong> không?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="ghost" onClick={() => setBookToDelete(null)}>Hủy</Button>
          <Button variant="danger" onClick={() => void deleteBook()}>Xóa</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBooks;
