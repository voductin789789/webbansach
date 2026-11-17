// src/components/common/BookCover.tsx
import React, { useState } from 'react';
import { Book } from '../../types';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  book: Partial<Book> & { title: string; author?: string; categoryId?: string; categoryName?: string };
  className?: string;
  style?: React.CSSProperties;
}

// Bảng màu bìa sách chuẩn theo từng thể loại
const categoryThemes: Record<string, { bg: string; accent: string }> = {
  'cat-1': {
    // Văn học
    bg: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
    accent: '#93C5FD',
  },
  'cat-2': {
    // Kinh tế - Quản trị
    bg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    accent: '#FCD34D',
  },
  'cat-3': {
    // Kỹ năng sống
    bg: 'linear-gradient(135deg, #065F46 0%, #022C22 100%)',
    accent: '#6EE7B7',
  },
  'cat-4': {
    // Thiếu nhi
    bg: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
    accent: '#FDE68A',
  },
  'cat-5': {
    // Khoa học - Công nghệ (Clean Code, Hackers...)
    bg: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)',
    accent: '#A5B4FC',
  },
  'cat-6': {
    // Lịch sử - Địa lý
    bg: 'linear-gradient(135deg, #7C2D12 0%, #431407 100%)',
    accent: '#FED7AA',
  },
  'cat-7': {
    // Ngoại ngữ
    bg: 'linear-gradient(135deg, #0F766E 0%, #134E4A 100%)',
    accent: '#99F6E4',
  },
};

const themeByCategoryName: Record<string, string> = {
  'van hoc': 'cat-1',
  'kinh te': 'cat-2',
  'ky nang song': 'cat-3',
  'tam ly': 'cat-3',
  'thieu nhi': 'cat-4',
  'khoa hoc': 'cat-5',
  'cong nghe': 'cat-5',
  'lich su': 'cat-6',
  'ngoai ngu': 'cat-7',
};

export const BookCover: React.FC<BookCoverProps> = ({
  book,
  className = '',
  style,
}) => {
  const [imgError, setImgError] = useState(false);

  const catId = book.categoryId || 'cat-1';
  const normalizedCategoryName = (book.categoryName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const themeId = categoryThemes[catId] ? catId : themeByCategoryName[normalizedCategoryName];
  const theme = categoryThemes[themeId] || {
    bg: 'linear-gradient(135deg, #2C3E50 0%, #1A252F 100%)',
    accent: '#E74C3C',
  };
  const isMissingPlaceholder = /\/uploads\/placeholder\d*\.jpe?g(?:[?#]|$)/i.test(book.coverImage || '');

  // Nếu ảnh online bị lỗi -> Render bìa sách vector đồ họa đẹp chuẩn kích thước
  if (imgError || !book.coverImage || isMissingPlaceholder) {
    return (
      <div
        className={`book-mockup-cover ${className}`}
        style={{
          width: '100%',
          height: '100%',
          background: theme.bg,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '14px 12px',
          boxSizing: 'border-box',
          color: '#FFFFFF',
          userSelect: 'none',
          boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.4), inset -1px 0 2px rgba(255,255,255,0.2)',
          borderLeft: '4px solid rgba(0,0,0,0.3)',
          ...style,
        }}
      >
        {/* Top category label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: theme.accent,
              backgroundColor: 'rgba(0,0,0,0.35)',
              padding: '2px 6px',
              borderRadius: '3px',
              maxWidth: '80%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {book.categoryName || 'BOOKSTORE'}
          </span>
          <BookOpen size={15} color={theme.accent} />
        </div>

        {/* Center: Book Title & Book Icon */}
        <div style={{ textAlign: 'center', padding: '6px 0' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              border: `1.5px solid ${theme.accent}`,
            }}
          >
            <BookOpen size={16} color="#FFFFFF" />
          </div>

          <h4
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 4px 0',
              lineHeight: 1.3,
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {book.title}
          </h4>

          <div
            style={{
              width: '26px',
              height: '2px',
              backgroundColor: theme.accent,
              margin: '6px auto',
            }}
          />
        </div>

        {/* Bottom Author */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.18)',
            paddingTop: '6px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#E2E8F0',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {book.author || 'Tác giả'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={book.coverImage}
      alt={book.title}
      className={`book-card-image ${className}`}
      loading="lazy"
      onError={() => setImgError(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...style,
      }}
    />
  );
};

export default BookCover;
