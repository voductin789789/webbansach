import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star } from 'lucide-react';
import { Book } from '../types';
import { getBook } from '../api/catalog';
import { getApiErrorMessage } from '../api/response';
import { useCart } from '../providers/CartProvider';
import { formatVND } from '../types/formatVND';
import { Button, Spinner } from '../components/ui';
import BookCover from '../components/common/BookCover';
import ReviewSection from '../components/common/ReviewSection';
import { Modal } from '../components/ui';
import { addToWishlist } from '../api/storefront';
import { toast } from '../components/ui/Toast';
import { useAuth } from '../providers/AuthProvider';

const BookDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getBook(id)
      .then((result) => { if (active) setBook(result); })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason, 'Không tìm thấy thông tin sách.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '56px 16px', textAlign: 'center' }}><Spinner size="lg" /></div>;
  if (error || !book) return <div className="container" role="alert" style={{ padding: '36px 16px', color: '#B91C1C' }}>{error || 'Không tìm thấy sách.'}</div>;

  const saveToWishlist = async () => {
    if (!isAuthenticated) {
      toast.info('Đăng nhập để lưu sách yêu thích.');
      return;
    }
    try {
      await addToWishlist(book.id);
      toast.success('Đã lưu vào tủ sách yêu thích.');
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể lưu sách.'));
    }
  };

  return (
    <div className="container" style={{ padding: '36px 16px' }}>
      <Link to="/books" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2C3E50', marginBottom: '20px', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>
      <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '32px' }}>
        <div style={{ width: '100%', maxWidth: '320px', height: '420px', margin: '0 auto' }}>
          <BookCover book={book} style={{ borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
        </div>
        <div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{book.categoryName}</span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#2C3E50', margin: '6px 0 12px' }}>{book.title}</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Tác giả: <strong>{book.author}</strong></p>
          {book.rating > 0 && <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={16} fill="#F59E0B" color="#F59E0B" />{book.rating.toFixed(1)} ({book.reviewCount || 0} đánh giá)</p>}
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#E74C3C' }}>
            {formatVND(book.price)}
            {book.originalPrice && <del style={{ marginLeft: '10px', color: '#94A3B8', fontSize: '15px' }}>{formatVND(book.originalPrice)}</del>}
          </div>
          <p style={{ color: '#475569', lineHeight: 1.7, margin: '18px 0' }}>{book.description || 'Chưa có mô tả cho sách này.'}</p>
          {book.quote && <blockquote style={{ margin: '16px 0', padding: '12px 16px', borderLeft: '3px solid #E74C3C', background: '#F8FAFC', color: '#475569' }}>{book.quote}</blockquote>}
          <p style={{ color: book.stock ? '#15803D' : '#B91C1C' }}>{book.stock ? `Còn ${book.stock} cuốn` : 'Hết hàng'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Button variant="primary" icon={<ShoppingCart size={16} />} disabled={!book.stock} onClick={() => addToCart(book, 1)}>
              {book.stock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            </Button>
            <Button variant="outline" icon={<Heart size={16} />} onClick={() => void saveToWishlist()}>Yêu thích</Button>
            {book.samplePdfUrl && <Button variant="outline" onClick={() => setPreviewOpen(true)}>Đọc thử</Button>}
          </div>
          <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '8px 14px', color: '#64748B', fontSize: '14px', marginTop: '22px' }}>
            {book.isbn && <><dt>ISBN</dt><dd style={{ margin: 0 }}>{book.isbn}</dd></>}
            <dt>Tác giả</dt><dd style={{ margin: 0 }}>{book.author}</dd>
            {book.translator && <><dt>Dịch giả</dt><dd style={{ margin: 0 }}>{book.translator}</dd></>}
            {book.publisher && <><dt>Nhà xuất bản</dt><dd style={{ margin: 0 }}>{book.publisher}</dd></>}
            {book.publishYear && <><dt>Năm xuất bản</dt><dd style={{ margin: 0 }}>{book.publishYear}</dd></>}
            {book.pages && <><dt>Số trang</dt><dd style={{ margin: 0 }}>{book.pages}</dd></>}
            {book.binding && <><dt>Hình thức</dt><dd style={{ margin: 0 }}>{book.binding === 'HARDCOVER' ? 'Bìa cứng' : book.binding === 'DUST_JACKET' ? 'Bìa áo' : 'Bìa mềm'}</dd></>}
            {book.weightGrams && <><dt>Khối lượng</dt><dd style={{ margin: 0 }}>{book.weightGrams} g</dd></>}
            {(book.widthMm || book.heightMm || book.lengthMm) && <><dt>Kích thước</dt><dd style={{ margin: 0 }}>{[book.widthMm, book.heightMm, book.lengthMm].filter(Boolean).join(' × ')} mm</dd></>}
          </dl>
        </div>
      </div>
      {book.backImage && <img src={book.backImage} alt={`Bìa sau sách ${book.title}`} loading="lazy" style={{ width: 140, marginTop: 16, borderRadius: 6 }} />}
      <ReviewSection key={book.id} bookId={book.id} initialReviews={book.reviews ?? []} />
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title={`Đọc thử: ${book.title}`} maxWidth="900px">
        {book.samplePdfUrl && (
          <>
            <p>Bản đọc thử do nhà sách cung cấp. Bản xem trước được cấu hình tối đa 10 trang; quyền kiểm soát tệp gốc phụ thuộc nơi lưu trữ PDF.</p>
            <iframe title={`Bản đọc thử ${book.title}`} src={`${book.samplePdfUrl}#page=1&toolbar=0&navpanes=0`} style={{ width: '100%', height: '70vh', border: '1px solid #E2E8F0' }} />
          </>
        )}
      </Modal>
    </div>
  );
};

export default BookDetailPage;
