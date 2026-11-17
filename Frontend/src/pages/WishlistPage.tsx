import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { Book } from '../types';
import { getWishlist, removeFromWishlist } from '../api/storefront';
import { getApiErrorMessage } from '../api/response';
import { useCart } from '../providers/CartProvider';
import { Button, Spinner } from '../components/ui';
import BookCard from '../components/common/BookCard';
import { toast } from '../components/ui/Toast';

const WishlistPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    getWishlist()
      .then((result) => { if (active) setBooks(result); })
      .catch((reason: unknown) => { if (active) setError(getApiErrorMessage(reason, 'Không tải được tủ sách yêu thích.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const remove = async (book: Book) => {
    try {
      await removeFromWishlist(book.id);
      setBooks((current) => current.filter((item) => item.id !== book.id));
      toast.success('Đã xóa sách khỏi tủ yêu thích.');
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'Không thể cập nhật tủ sách.'));
    }
  };

  return (
    <main className="container" style={{ padding: '36px 16px' }}>
      <h1 style={{ color: '#2C3E50' }}><Heart size={24} fill="#E74C3C" color="#E74C3C" /> Tủ sách yêu thích</h1>
      {loading && <div style={{ padding: 48, textAlign: 'center' }}><Spinner size="lg" /></div>}
      {error && <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>}
      {!loading && !error && books.length === 0 && (
        <p style={{ color: '#64748B' }}>Tủ sách chưa có cuốn nào. <Link to="/books">Khám phá sách</Link> để lưu sách bạn muốn đọc.</p>
      )}
      <div className="book-grid">
        {books.map((book) => (
          <div key={book.id}>
            <BookCard book={book} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button size="sm" onClick={() => addToCart(book, 1)} disabled={!book.stock}>Thêm vào giỏ</Button>
              <Button size="sm" variant="outline" onClick={() => void remove(book)} icon={<Trash2 size={14} />}>Bỏ lưu</Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default WishlistPage;
