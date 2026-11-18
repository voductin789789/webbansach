import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {fetchBook, fetchBooks} from '../api/bookApi';
import BookCard from '../components/common/BookCard';
import type {Book} from '../types';
import {useCart} from '../providers/CartProvider';
import {formatVND} from '../types/formatVND';
import BookCover from '../components/common/BookCover';
import {ShoppingCart, Zap, Minus, Plus, ArrowLeft} from 'lucide-react';

export default function BookDetailPage() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<Book[]>([]);
  const {addItem, items} = useCart();

  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setQuantity(1);
    fetchBook(id || '').then(value => {if(active) setBook(value);})
      .catch(() => {if(active) setError('Không tìm thấy sách.');})
      .finally(() => {if(active) setLoading(false);});
    return () => {active = false;};
  }, [id]);

  useEffect(() => {
    let active = true;
    setRelated([]);
    if (!book?.categoryId) return;
    fetchBooks({ categoryId: book.categoryId, page: 1, limit: 9 }).then(result => {
      if (active) setRelated(result.books.filter(item => item.id !== book.id).slice(0, 4));
    }).catch(() => { if (active) setRelated([]); });
    return () => { active = false; };
  }, [book?.id, book?.categoryId]);

  if (loading) return <div className="container" style={{padding:40}}>Đang tải chi tiết sách...</div>;
  if (error || !book) return <div className="container" style={{padding:40}}>{error || 'Không tìm thấy sách'}</div>;

  const available = Math.max(0, book.stock ?? 0);
  const alreadyInCart = items.find(i=>i.bookId===book.id)?.quantity ?? 0;
  const item = {bookId:book.id,title:book.title,author:book.author,price:book.price,coverImage:book.coverImage,stock:book.stock};
  const buyNow = () => {
    if (!available) return;
    sessionStorage.setItem('bookstore_buy_now', JSON.stringify({...item, quantity}));
    navigate('/checkout?mode=buy-now');
  };
  return (
    <div className="container" style={{padding:'34px 16px 64px'}}>
      <Link to="/books" style={{display:'inline-flex',alignItems:'center',gap:6,marginBottom:22}}><ArrowLeft size={17}/> Xem tất cả sách</Link>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:40,background:'#fff',border:'1px solid #e2e8f0',padding:'clamp(18px,4vw,40px)',borderRadius:16}}>
        <div style={{width:'100%',maxWidth:390,margin:'0 auto',aspectRatio:'3 / 4',boxShadow:'0 12px 28px #0f172a14',borderRadius:8,overflow:'hidden'}}><BookCover book={book}/></div>
        <div>
          <span style={{color:'#64748b',fontSize:14}}>{book.categoryName || 'Sách'}</span>
          <h1 style={{fontSize:'clamp(24px,3vw,34px)',lineHeight:1.25,margin:'12px 0 18px',color:'#1e293b'}}>{book.title}</h1>
          <p style={{margin:'8px 0',color:'#475569'}}>Tác giả: <strong>{book.author || 'Đang cập nhật'}</strong></p>
          <div style={{background:'#fff7ed',padding:'20px 18px',borderRadius:10,margin:'20px 0'}}>
            <strong style={{fontSize:30,color:'#dc2626'}}>{formatVND(book.price)}</strong>
            {book.originalPrice && book.originalPrice > book.price && <span style={{marginLeft:12,color:'#94a3b8',textDecoration:'line-through'}}>{formatVND(book.originalPrice)}</span>}
          </div>
          <p style={{color:available ? '#15803d' : '#b91c1c',fontWeight:600}}>{available ? `Còn ${available} cuốn` : 'Tạm hết hàng'}</p>
          <div style={{display:'flex',alignItems:'center',gap:16,margin:'24px 0'}}>
            <span>Số lượng</span>
            <div style={{display:'inline-flex',alignItems:'center',border:'1px solid #cbd5e1',borderRadius:8,overflow:'hidden'}}>
              <button type="button" aria-label="Giảm số lượng" disabled={quantity<=1} onClick={()=>setQuantity(q=>Math.max(1,q-1))} style={{padding:'10px 12px',border:0,background:'#f8fafc',cursor:'pointer'}}><Minus size={16}/></button>
              <span style={{minWidth:44,textAlign:'center',fontWeight:700}}>{quantity}</span>
              <button type="button" aria-label="Tăng số lượng" disabled={quantity>=available} onClick={()=>setQuantity(q=>Math.min(available,q+1))} style={{padding:'10px 12px',border:0,background:'#f8fafc',cursor:'pointer'}}><Plus size={16}/></button>
            </div>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <button type="button" disabled={!available || alreadyInCart>=available} onClick={()=>addItem(item,quantity)} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,padding:'14px 20px',border:'1px solid #dc2626',color:'#dc2626',background:'#fff',borderRadius:8,fontWeight:700,cursor:available?'pointer':'not-allowed'}}><ShoppingCart size={19}/> {alreadyInCart>=available && available>0 ? "Đã đạt giới hạn kho" : "Thêm vào giỏ"}</button>
            <button type="button" disabled={!available} onClick={buyNow} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,padding:'14px 30px',border:0,color:'#fff',background:available?'#dc2626':'#94a3b8',borderRadius:8,fontWeight:700,cursor:available?'pointer':'not-allowed'}}><Zap size={19}/> Mua ngay</button>
          </div>
          <div style={{borderTop:'1px solid #e2e8f0',marginTop:32,paddingTop:20}}><h2 style={{fontSize:21}}>Thông tin sách</h2><p style={{lineHeight:1.8,color:'#475569'}}>{book.description || 'Thông tin mô tả đang được cập nhật.'}</p></div>
        </div>
      </div>
      {related.length > 0 && <section className="related-books" aria-labelledby="related-title">
        <div className="section-heading"><div><span className="eyebrow">CÙNG CHỦ ĐỀ</span><h2 id="related-title">Sách liên quan</h2></div>
          <Link to={`/books?categoryId=${encodeURIComponent(book.categoryId)}`}>Xem sách cùng danh mục →</Link></div>
        <div className="book-grid">{related.map(item => <BookCard key={item.id} book={item}/>)}</div>
      </section>}
    </div>
  );
}
