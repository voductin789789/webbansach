import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '../api/httpClient';
import {fetchBooks} from '../api/bookApi';
import type {Book} from '../types';
import BookCard from '../components/common/BookCard';
import CategoryGrid, { type StoreCategory } from '../components/common/CategoryGrid';
import {ArrowRight,BookOpen,ShoppingBag,PackageCheck} from 'lucide-react';

export default function HomePage(){const [books,setBooks]=useState<Book[]>([]),[cats,setCats]=useState<StoreCategory[]>([]),[total,setTotal]=useState<number|null>(null),[err,setErr]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{Promise.all([fetchBooks({page:1,limit:8}),api.get('/categories')]).then(([b,c])=>{setBooks(b.books);setTotal(b.pagination?.total??null);setCats(c.data.data||[])}).catch(()=>setErr('Không thể tải sách. Vui lòng kiểm tra Backend.')).finally(()=>setLoading(false))},[]);
 return <main>
 <div className="home-hero"><div className="container hero-inner"><div className="hero-copy"><span className="hero-kicker">KHÔNG GIAN DÀNH CHO NGƯỜI YÊU SÁCH</span><h1>Mở một trang sách.<br/><em>Mở ngàn ý tưởng.</em></h1><p>Khám phá nhiều thể loại, chọn sách theo sở thích và đặt mua trực tiếp tại cửa hàng.</p><div className="hero-cta"><Link className="hero-button" to="/books">Khám phá sách <ArrowRight size={18}/></Link><Link className="hero-secondary" to="/categories">Xem danh mục</Link></div><div className="hero-metrics"><span><b>{total===null?'—':total.toLocaleString('vi-VN')}</b> đầu sách</span><span><b>{cats.length||'—'}</b> danh mục</span></div></div><div className="hero-art" aria-hidden="true"><div className="hero-circle"/><div className="hero-book book-one">VĂN HỌC<span>Những câu chuyện<br/>đáng đọc</span></div><div className="hero-book book-two">TRI THỨC<span>Mỗi ngày<br/>một khám phá</span></div><div className="hero-book book-three">CẢM HỨNG<span>Tìm thấy điều<br/>bạn yêu thích</span></div></div></div></div>
 <div className="container home-content"><section className="benefit-strip"><div><BookOpen size={22}/><span><b>Nhiều thể loại</b><small>Chọn theo sở thích</small></span></div><div><ShoppingBag size={22}/><span><b>Mua sắm thuận tiện</b><small>Giỏ hàng và Mua ngay</small></span></div><div><PackageCheck size={22}/><span><b>Kiểm tra tồn kho</b><small>Thông tin cập nhật từ hệ thống</small></span></div></section>
 <section className="home-section"><div className="section-heading"><div><span className="eyebrow">CHỌN THEO SỞ THÍCH</span><h2>Danh mục sách</h2></div><Link to="/categories">Xem tất cả <ArrowRight size={16}/></Link></div><CategoryGrid categories={cats}/></section>
 <section className="home-section"><div className="section-heading"><div><span className="eyebrow">GỢI Ý CHO BẠN</span><h2>Sách mới cập nhật</h2></div><Link to="/books">Xem tất cả <ArrowRight size={16}/></Link></div>{loading?<p>Đang tải sách...</p>:err?<p role="alert">{err}</p>:<div className="book-grid">{books.map(b=><BookCard key={b.id} book={b}/>)}</div>}</section>
 <section className="reading-banner"><div><span className="eyebrow">SÁCH CHO MỌI NGƯỜI</span><h2>Cuốn sách tiếp theo đang chờ bạn</h2><p>Khám phá toàn bộ kho sách đang bán tại cửa hàng.</p></div><Link className="hero-button" to="/books">Chọn sách <ArrowRight size={17}/></Link></section>
 </div></main>}
