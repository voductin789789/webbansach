import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, getBlogPosts } from '../api/content';
import { getApiErrorMessage } from '../api/response';
import { Spinner } from '../components/ui';

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getBlogPosts()
      .then((result) => { if (active) setPosts(result); })
      .catch((reason: unknown) => { if (active) setError(getApiErrorMessage(reason, 'Không tải được bài viết.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ color: '#2C3E50' }}>Góc điểm sách</h1>
      <p style={{ color: '#64748B' }}>Bài viết và câu chuyện về sách từ nhà sách.</p>
      {loading && <div style={{ padding: 48, textAlign: 'center' }}><Spinner size="lg" /></div>}
      {error && <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>}
      {!loading && !error && posts.length === 0 && <p>Chưa có bài viết được xuất bản.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
        {posts.map((post) => (
          <article key={post.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
            {post.coverImage && <img src={post.coverImage} alt="" loading="lazy" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />}
            <div style={{ padding: 20 }}>
              <h2 style={{ fontSize: 20, marginTop: 0 }}><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2>
              <p style={{ color: '#64748B', lineHeight: 1.65 }}>{post.excerpt || 'Đọc bài viết để khám phá thêm về sách.'}</p>
              <small style={{ color: '#64748B' }}>{post.authorName}{post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString('vi-VN')}` : ''}</small>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export default BlogPage;
