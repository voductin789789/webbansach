// src/components/common/BookCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../types';
import { formatVND } from '../../types/formatVND';
import { useCart } from '../../providers/CartProvider';
import { QrCode, ShoppingCart, Star } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import BookCover from './BookCover';

export interface BookCardProps {
  book: Book;
}

type DemoCheckoutStep = 'address' | 'qr';

const demoQrCells = Array.from({ length: 17 * 17 }, (_, index) => {
  const row = Math.floor(index / 17);
  const column = index % 17;

  for (const [top, left] of [[0, 0], [0, 12], [12, 0]]) {
    const rowInFinder = row - top;
    const columnInFinder = column - left;
    if (rowInFinder >= 0 && rowInFinder < 5 && columnInFinder >= 0 && columnInFinder < 5) {
      return rowInFinder === 0 || rowInFinder === 4 || columnInFinder === 0 || columnInFinder === 4
        || (rowInFinder === 2 && columnInFinder === 2);
    }
  }

  return (row * 17 + column * 7 + row * column) % 5 < 2;
});

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart } = useCart();
  const [demoCheckoutOpen, setDemoCheckoutOpen] = useState(false);
  const [demoCheckoutStep, setDemoCheckoutStep] = useState<DemoCheckoutStep>('address');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handlePurchase = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (book.isDemo) {
      setDemoCheckoutStep('address');
      setDemoCheckoutOpen(true);
      return;
    }

    addToCart(book, 1);
  };

  const closeDemoCheckout = () => {
    setDemoCheckoutOpen(false);
    setDemoCheckoutStep('address');
    setRecipientName('');
    setPhone('');
    setAddress('');
  };

  const submitDemoAddress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDemoCheckoutStep('qr');
  };

  return (
    <div className="book-card">
      <Link
        to={`/books/${book.id}`}
        className="book-card-link"
        tabIndex={book.isDemo ? -1 : undefined}
        onClick={(event) => { if (book.isDemo) event.preventDefault(); }}
      >
        {/* Cover Image Wrapper cố định chiều cao 240px */}
        <div className="book-card-image-wrap">
          <BookCover book={book} style={{ width: 'min(100%, 180px)' }} />

          {/* Discount Badge */}
          {book.discountPercent && book.discountPercent > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: '#E74C3C',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 2,
              }}
            >
              -{book.discountPercent}%
            </span>
          )}

          {/* New Tag */}
          {book.isNew && (
            <span
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 7px',
                borderRadius: '4px',
                zIndex: 2,
              }}
            >
              MỚI
            </span>
          )}
        </div>

        {/* Content Body đồng bộ chiều cao */}
        <div className="book-card-body">
          <div>
            {book.categoryName && (
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                {book.categoryName}
              </span>
            )}

            <h3 className="book-card-title" title={book.title}>
              {book.title}
            </h3>

            <p className="book-card-author">
              Tác giả: <strong style={{ color: '#4B5563' }}>{book.author}</strong>
            </p>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
              <Star size={14} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{book.rating}</span>
              {book.reviewCount && (
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({book.reviewCount})</span>
              )}
            </div>
          </div>

          <div>
            {/* Price section */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#E74C3C' }}>
                {formatVND(book.price)}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span style={{ fontSize: '13px', color: '#94A3AF', textDecoration: 'line-through' }}>
                  {formatVND(book.originalPrice)}
                </span>
              )}
            </div>

            {/* Action Button */}
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handlePurchase}
              disabled={!book.isDemo && book.stock === 0}
              icon={<ShoppingCart size={15} />}
            >
              {book.isDemo ? 'Mua' : book.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
            </Button>
          </div>
        </div>
      </Link>

      {book.isDemo && (
        <Modal
          open={demoCheckoutOpen}
          onClose={closeDemoCheckout}
          title={demoCheckoutStep === 'address' ? 'Địa chỉ nhận hàng mô phỏng' : 'Mã QR thanh toán'}
          maxWidth="480px"
        >
          {demoCheckoutStep === 'address' ? (
            <div>
              <p style={{ marginBottom: 16, color: '#475569' }}>
                Nhập thông tin để xem bước thanh toán. Thông tin chỉ dùng trong phiên này, không gửi đi hoặc lưu lại.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, padding: 12, background: '#F8FAFC', borderRadius: 8 }}>
                <span style={{ fontWeight: 700 }}>{book.title}</span>
                <strong style={{ color: '#C0392B', whiteSpace: 'nowrap' }}>{formatVND(book.price)}</strong>
              </div>
              <form onSubmit={submitDemoAddress}>
                <Input
                  label="Tên người nhận"
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
                <Input
                  label="Số điện thoại"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  pattern="0[0-9]{9}"
                  maxLength={10}
                  autoComplete="tel"
                  required
                />
                <Input
                  label="Địa chỉ nhận hàng"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  minLength={5}
                  maxLength={250}
                  autoComplete="street-address"
                  required
                />
                <Button type="submit" fullWidth icon={<QrCode size={16} />}>
                  Tạo mã QR
                </Button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: 16, color: '#475569' }}>
                Mã minh họa cho giao diện mô phỏng, không thể dùng để thanh toán thật.
              </p>
              <div
                role="img"
                aria-label="Mã QR minh họa, không thể dùng để thanh toán thật"
                style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(17, minmax(0, 1fr))',
                  width: 'min(100%, 238px)',
                  aspectRatio: '1',
                  gap: 2,
                  margin: '0 auto 16px',
                  padding: 12,
                  border: '1px solid #CBD5E1',
                  borderRadius: 10,
                  background: '#FFFFFF',
                }}
              >
                {demoQrCells.map((isDark, index) => (
                  <span key={index} aria-hidden="true" style={{ background: isDark ? '#17324D' : '#FFFFFF' }} />
                ))}
              </div>
              <div style={{ marginBottom: 18, padding: 12, borderRadius: 8, background: '#F8FAFC', textAlign: 'left', color: '#475569' }}>
                <p style={{ fontWeight: 700, color: '#17324D' }}>{book.title} · {formatVND(book.price)}</p>
                <p>Người nhận: {recipientName} · {phone}</p>
                <p>Địa chỉ: {address}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Button variant="outline" onClick={() => setDemoCheckoutStep('address')}>
                  Sửa địa chỉ
                </Button>
                <Button onClick={closeDemoCheckout}>
                  Đóng mô phỏng
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default BookCard;
