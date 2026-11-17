import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BlogPost, getBlogPost } from '../api/content';
import { getApiErrorMessage } from '../api/response';
import { Spinner } from '../components/ui';

const BlogPostPage: React.FC = () => {
  const { slug = '' } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getBlogPost(slug)
      .then((result) => { if (active) setPost(result); })
      .catch((reason: unknown) => { if (active) setError(getApiErrorMessage(reason, 'Không tìm thấy bài viết.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) return <div className="container" style={{ padding: 48, textAlign: 'center' }}><Spinner size="lg" /></div>;
  if (error || !post) return <main className="container" style={{ padding: 36 }}><p role="alert">{error || 'Không tìm thấy bài viết.'}</p><Link to="/blog">Về góc điểm sách</Link></main>;

  return (
    <article className="container" style={{ maxWidth: 820, padding: '36px 16px' }}>
      <Link to="/blog">← Tất cả bài viết</Link>
      <h1 style={{ color: '#2C3E50', lineHeight: 1.2 }}>{post.title}</h1>
      <p style={{ color: '#64748B' }}>{post.authorName}{post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString('vi-VN')}` : ''}</p>
      {post.coverImage && <img src={post.coverImage} alt="" style={{ width: '100%', maxHeight: 440, objectFit: 'cover', borderRadius: 10 }} />}
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#334155', marginTop: 24 }}>{post.content}</div>
    </article>
  );
};

export default BlogPostPage;
