import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Review } from '../../types';
import { createReview, markReviewHelpful, uploadReviewImage } from '../../api/storefront';
import { getApiErrorMessage } from '../../api/response';
import { useAuth } from '../../providers/AuthProvider';
import { Button } from '../ui';
import { toast } from '../ui/Toast';

interface ReviewSectionProps {
  bookId: string;
  initialReviews: Review[];
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ bookId, initialReviews }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [helpfulIds, setHelpfulIds] = useState<string[]>([]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const imageUrls = await Promise.all(images.map(uploadReviewImage));
      const review = await createReview(bookId, { rating, comment: comment.trim(), imageUrls });
      setReviews((current) => [review, ...current]);
      setComment('');
      setImages([]);
      toast.success('Đã gửi đánh giá sách.');
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Chỉ khách đã nhận sách mới có thể đánh giá.'));
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (review: Review) => {
    if (helpfulIds.includes(review.id)) return;
    try {
      await markReviewHelpful(review.id);
      setHelpfulIds((current) => [...current, review.id]);
      setReviews((current) => current.map((item) =>
        item.id === review.id ? { ...item, helpfulCount: item.helpfulCount + 1 } : item
      ));
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể ghi nhận đánh giá hữu ích.'));
    }
  };

  return (
    <section style={{ marginTop: 32, padding: 24, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10 }}>
      <h2 style={{ marginTop: 0, color: '#2C3E50' }}>Đánh giá của độc giả ({reviews.length})</h2>
      {isAuthenticated ? (
        <form onSubmit={submitReview} style={{ padding: 16, background: '#F8FAFC', borderRadius: 8, marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
            Chấm điểm
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))} style={{ display: 'block', padding: 8, marginTop: 6 }}>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} sao</option>)}
            </select>
          </label>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: 12 }}>
            Cảm nhận
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows={4} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 6, padding: 10, border: '1px solid #CBD5E1', borderRadius: 6 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Ảnh chụp sách (tối đa 4 ảnh, 5 MB/ảnh)
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 4))} style={{ display: 'block', marginTop: 6 }} />
          </label>
          <Button type="submit" loading={submitting}>Gửi đánh giá</Button>
          <p style={{ color: '#64748B', fontSize: 13, marginBottom: 0 }}>Chỉ khách đã nhận sách mới được đánh giá. Mỗi tài khoản đánh giá một lần cho mỗi sách.</p>
        </form>
      ) : (
        <p><Link to="/login">Đăng nhập</Link> để gửi đánh giá sau khi nhận sách.</p>
      )}

      {reviews.length === 0 && <p style={{ color: '#64748B' }}>Chưa có đánh giá cho sách này.</p>}
      <div style={{ display: 'grid', gap: 14 }}>
        {reviews.map((review) => (
          <article key={review.id} style={{ paddingTop: 14, borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <strong>{review.userName}</strong>
              <span aria-label={`${review.rating} trên 5 sao`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            </div>
            <small style={{ color: '#64748B' }}>
              {review.verifiedPurchase ? 'Đã mua hàng · ' : ''}{review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
            </small>
            {review.comment && <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{review.comment}</p>}
            {review.imageUrls.map((url) => <img key={url} src={url} alt="Ảnh sách từ độc giả" loading="lazy" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6, marginRight: 8 }} />)}
            {user?.id !== review.userId && isAuthenticated && (
              <button type="button" onClick={() => void markHelpful(review)} disabled={helpfulIds.includes(review.id)} style={{ border: 0, background: 'transparent', color: '#475569', cursor: 'pointer', padding: '8px 0' }}>
                {helpfulIds.includes(review.id) ? 'Đã ghi nhận' : 'Đánh giá này hữu ích'} ({review.helpfulCount})
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default ReviewSection;
