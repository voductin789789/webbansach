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

const coverIllustrations: Record<string, React.ReactNode> = {
  'cat-1': <g fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="110" cy="72" r="42" opacity=".35" />
    <path d="M52 119c19-20 35-20 54 0 20-21 39-21 62 0M64 132c16-14 29-14 43 0 16-14 31-14 48 0" />
    <path d="M110 32v80M95 48l15-16 15 16" opacity=".8" />
  </g>,
  'cat-2': <g fill="currentColor">
    <rect x="57" y="95" width="22" height="43" rx="4" opacity=".42" />
    <rect x="91" y="73" width="22" height="65" rx="4" opacity=".65" />
    <rect x="125" y="48" width="22" height="90" rx="4" opacity=".9" />
    <path d="m55 77 35-19 28 7 39-35 5 5-42 38-29-7-33 18z" />
  </g>,
  'cat-3': <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M110 140V76m0 26c-31 0-48-18-48-48 30 0 48 17 48 48zm0-16c0-31 18-48 48-48 0 30-17 48-48 48z" />
    <path d="M80 139h60" opacity=".6" />
  </g>,
  'cat-4': <g fill="currentColor">
    <circle cx="110" cy="83" r="34" opacity=".45" />
    <path d="m57 122 9-18 9 18zm91-42 6-12 6 12 13 2-10 9 2 13-11-6-11 6 2-13-10-9zm-92-31 5-10 5 10 11 2-8 7 2 11-10-5-9 5 2-11-8-7z" />
    <circle cx="111" cy="83" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
  </g>,
  'cat-5': <g fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="110" cy="85" rx="62" ry="25" transform="rotate(-28 110 85)" opacity=".55" />
    <ellipse cx="110" cy="85" rx="62" ry="25" transform="rotate(28 110 85)" opacity=".8" />
    <circle cx="110" cy="85" r="11" fill="currentColor" />
    <circle cx="57" cy="55" r="5" fill="currentColor" />
    <circle cx="163" cy="115" r="5" fill="currentColor" />
  </g>,
  'cat-6': <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
    <path d="M55 137V83a55 55 0 0 1 110 0v54M74 137V86a36 36 0 0 1 72 0v51" opacity=".7" />
    <path d="M45 137h130M94 108h32v29H94zM110 108V83" />
  </g>,
  'cat-7': <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
    <path d="M50 49h80a17 17 0 0 1 17 17v31a17 17 0 0 1-17 17H89l-24 18v-18h-15a17 17 0 0 1-17-17V66a17 17 0 0 1 17-17z" opacity=".8" />
    <path d="M97 71h73a16 16 0 0 1 16 16v22a16 16 0 0 1-16 16h-9v17l-23-17h-9" opacity=".5" />
    <circle cx="70" cy="82" r="3" fill="currentColor" /><circle cx="88" cy="82" r="3" fill="currentColor" /><circle cx="106" cy="82" r="3" fill="currentColor" />
  </g>,
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
        role="img"
        aria-label={`${book.title}, bìa minh họa mô phỏng`}
        style={{
          width: '100%',
          height: '100%',
          background: theme.bg,
          position: 'relative',
          overflow: 'hidden',
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
        <svg aria-hidden="true" viewBox="0 0 220 170" style={{ position: 'absolute', zIndex: 0, top: '19%', left: 0, width: '100%', height: '58%', color: theme.accent, opacity: 0.72 }}>
          {coverIllustrations[themeId] || coverIllustrations['cat-1']}
        </svg>
        {/* Center: Book Title & Book Icon */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '6px 0' }}>
          <span style={{ display: 'inline-block', marginBottom: 5, padding: '2px 6px', border: `1px solid ${theme.accent}88`, borderRadius: 999, color: theme.accent, fontSize: 8, lineHeight: 1.2 }}>
            Bìa minh họa
          </span>
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
            position: 'relative',
            zIndex: 1,
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
