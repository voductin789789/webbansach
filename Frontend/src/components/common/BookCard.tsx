import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Book } from '../../types';
import { formatVND } from '../../types/formatVND';
import { useCart } from '../../providers/CartProvider';
import { ShoppingCart, Zap } from 'lucide-react';
import BookCover from './BookCover';

export default function BookCard({ book }: {book: Book}) {
 const {addItem}=useCart(); const navigate=useNavigate(); const available=(book.stock??0)>0;
 const item={bookId:book.id,title:book.title,author:book.author,price:book.price,originalPrice:book.originalPrice,coverImage:book.coverImage,stock:book.stock};
 const buy=()=>{if(!available)return;sessionStorage.setItem('bookstore_buy_now',JSON.stringify({...item,quantity:1}));navigate('/checkout?mode=buy-now')};
 return <article className="book-card">
  <Link to={`/books/${book.id}`} className="book-card-link">
   <div className="book-card-image-wrap"><BookCover book={book}/>{!available&&<span className="book-soldout">Hết hàng</span>}</div>
   <div className="book-card-info">
    <span className="book-category">{book.categoryName||'Sách'}</span>
    <h3 className="book-card-title">{book.title}</h3>
    {book.author&&!/đang cập nhật|mô phỏng/i.test(book.author)&&<p className="book-card-author">{book.author}</p>}
    <div className="book-card-price"><strong>{formatVND(book.price)}</strong>{book.originalPrice&&book.originalPrice>book.price&&<del>{formatVND(book.originalPrice)}</del>}</div>
   </div>
  </Link>
  <div className="book-card-actions">
   <button type="button" className="outline-action" title="Thêm vào giỏ hàng" disabled={!available} onClick={()=>addItem(item,1)}><ShoppingCart size={16}/><span>Thêm giỏ</span></button>
   <button type="button" className="solid-action" disabled={!available} onClick={buy}><Zap size={16}/><span>Mua ngay</span></button>
  </div>
 </article>;
}
