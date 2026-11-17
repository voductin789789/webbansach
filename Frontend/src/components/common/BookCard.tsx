// src/components/common/BookCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../types';
import { formatVND } from '../../types/formatVND';
import { useCart } from '../../providers/CartProvider';
import { ShoppingCart, Star } from 'lucide-react';
import Button from '../ui/Button';
import BookCover from './BookCover';

export interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book, 1);
  };

  return (
    <div className="book-card">
      <Link to={`/books/${book.id}`} className="book-card-link">
        {/* Cover Image Wrapper cố định chiều cao 240px */}
        <div className="book-card-image-wrap">
          <BookCover book={book} />

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
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              icon={<ShoppingCart size={15} />}
            >
              {book.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BookCard;
