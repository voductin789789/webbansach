import React, { useCallback, useEffect, useState } from 'react';
import { AdminBlogPost, createAdminBlogPost, deleteAdminBlogPost, getAdminBlogPosts, updateAdminBlogPost } from '../../api/admin';
import { getApiErrorMessage } from '../../api/response';
import { Button, Input, Spinner } from '../../components/ui';
import { toast } from '../../components/ui/Toast';

const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', coverImage: '', authorName: '', published: false });

  const load = useCallback(async () => {
    setError('');
    try { setPosts(await getAdminBlogPosts()); }
    catch (reason) { setError(getApiErrorMessage(reason, 'Không tải được bài viết.')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createAdminBlogPost({
        ...form,
        excerpt: form.excerpt.trim() || undefined,
        coverImage: form.coverImage.trim() || undefined,
      });
      setForm({ title: '', excerpt: '', content: '', coverImage: '', authorName: '', published: false });
      toast.success('Đã tạo bài viết.');
      await load();
    } catch (reason) { toast.error(getApiErrorMessage(reason, 'Không thể tạo bài viết.')); }
    finally { setSaving(false); }
  };

  const togglePublished = async (post: AdminBlogPost) => {
    try {
      await updateAdminBlogPost(post.id, { published: !post.published });
      await load();
    } catch (reason) { toast.error(getApiErrorMessage(reason, 'Không thể cập nhật bài viết.')); }
  };

  const remove = async (post: AdminBlogPost) => {
    if (!window.confirm(`Xóa bài "${post.title}"?`)) return;
    try {
      await deleteAdminBlogPost(post.id);
      await load();
    } catch (reason) { toast.error(getApiErrorMessage(reason, 'Không thể xóa bài viết.')); }
  };

  return (
    <div>
      <h1 style={{ color: '#2C3E50' }}>Blog / Điểm sách</h1>
      <p style={{ color: '#64748B' }}>Bài chưa xuất bản chỉ hiển thị trong khu vực quản trị.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20 }}>
        <form onSubmit={create} style={{ background: '#FFFFFF', padding: 20, border: '1px solid #E2E8F0', borderRadius: 8 }}>
          <h2>Tạo bài viết</h2>
          <Input label="Tiêu đề" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} minLength={3} required />
          <Input label="Tác giả bài viết" value={form.authorName} onChange={(event) => setForm({ ...form, authorName: event.target.value })} minLength={2} required />
          <Input label="Ảnh bìa URL" type="url" value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} />
          <label style={{ display: 'block', marginBottom: 12 }}>Tóm tắt
            <textarea maxLength={1000} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} rows={3} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 6, padding: 10 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>Nội dung
            <textarea minLength={20} required value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={10} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 6, padding: 10 }} />
          </label>
          <label style={{ display: 'flex', gap: 8, marginBottom: 16 }}><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Xuất bản ngay</label>
          <Button type="submit" loading={saving}>Lưu bài</Button>
        </form>

        <section>
          <h2>Danh sách bài</h2>
          {loading && <Spinner />}
          {error && <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>}
          {!loading && posts.length === 0 && <p>Chưa có bài viết.</p>}
          <div style={{ display: 'grid', gap: 12 }}>
            {posts.map((post) => <article key={post.id} style={{ padding: 16, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8 }}>
              <strong>{post.title}</strong><p style={{ color: '#64748B' }}>{post.published ? 'Đã xuất bản' : 'Bản nháp'} · {post.authorName}</p>
              <Button size="sm" variant="outline" onClick={() => void togglePublished(post)}>{post.published ? 'Ẩn bài' : 'Xuất bản'}</Button>{' '}
              <Button size="sm" variant="danger" onClick={() => void remove(post)}>Xóa</Button>
            </article>)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminBlog;
