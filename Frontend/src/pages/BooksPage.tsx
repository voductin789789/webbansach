import React,{useEffect,useState} from 'react';
import {useNavigate,useParams,useSearchParams} from 'react-router-dom';
import {api} from '../api/httpClient';
import {fetchBooks} from '../api/bookApi';
import type {Book} from '../types';
import BookCard from '../components/common/BookCard';
import {Search,SlidersHorizontal} from 'lucide-react';
interface Category{id:number;name:string;slug:string}
export default function BooksPage(){
 const [params,setParams]=useSearchParams();const {slug}=useParams();const navigate=useNavigate();
 const [books,setBooks]=useState<Book[]>([]);const [categories,setCategories]=useState<Category[]>([]);
 const [pages,setPages]=useState(1),[count,setCount]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const page=Math.max(1,Number(params.get('page')||1));const search=params.get('search')||'';const categoryId=params.get('categoryId')||'';const sort=params.get('sort')||'newest';
 useEffect(()=>{api.get('/categories').then(r=>setCategories(r.data.data||[])).catch(()=>setCategories([]))},[]);
 useEffect(()=>{let active=true;setLoading(true);setError('');(async()=>{try{
  let id=categoryId;if(slug){const c=categories.find(c=>c.slug===slug);if(!c){if(!categories.length)return;throw Error('Không tìm thấy danh mục')}id=String(c.id)}
  const sorting:Record<string,{sortBy:string,sortOrder:string}>={newest:{sortBy:'createdAt',sortOrder:'desc'},priceAsc:{sortBy:'price',sortOrder:'asc'},priceDesc:{sortBy:'price',sortOrder:'desc'},title:{sortBy:'title',sortOrder:'asc'}};
  const result=await fetchBooks({page,limit:12,search:search||undefined,categoryId:id||undefined,...(sorting[sort]||sorting.newest)});
  if(active){setBooks(result.books);setPages(result.pagination?.totalPages||1);setCount(result.pagination?.total||0)}
 }catch{if(active)setError('Không thể tải danh sách sách. Hãy kiểm tra Backend.')}finally{if(active)setLoading(false)}})();return()=>{active=false}},[page,search,categoryId,slug,sort,categories]);
 const change=(k:string,v:string)=>{const next=new URLSearchParams(params);if(v)next.set(k,v);else next.delete(k);if(k!=='page')next.delete('page');setParams(next)};
 return <main className="container catalog-page">
 <div className="page-heading"><div><span className="eyebrow">TỦ SÁCH CỦA CHÚNG TÔI</span><h1>Khám phá sách</h1><p>Tìm cuốn sách bạn yêu thích từ kho sách hiện có.</p></div></div>
 <section className="catalog-tools" aria-label="Bộ lọc sách"><div className="catalog-search"><Search size={19}/><input aria-label="Tìm sách" placeholder="Tìm theo tên sách hoặc tác giả..." value={search} onChange={e=>change('search',e.target.value)}/></div>
 <label className="catalog-select"><SlidersHorizontal size={17}/><select aria-label="Danh mục sách" value={slug?categories.find(c=>c.slug===slug)?.id||'':categoryId} onChange={e=>{if(slug){navigate('/books'+(e.target.value?'?categoryId='+e.target.value:''))}else change('categoryId',e.target.value)}}><option value="">Tất cả danh mục</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <select className="sort-select" aria-label="Sắp xếp sách" value={sort} onChange={e=>change('sort',e.target.value)}><option value="newest">Mới cập nhật</option><option value="priceAsc">Giá thấp đến cao</option><option value="priceDesc">Giá cao đến thấp</option><option value="title">Tên A – Z</option></select></section>
 <div className="catalog-summary">{loading?'Đang tải sách...':error?'Không tải được sách':`${count.toLocaleString('vi-VN')} đầu sách phù hợp`}</div>
 {error?<p role="alert" className="error-text">{error}</p>:loading?<p>Đang tải dữ liệu...</p>:books.length?<div className="book-grid">{books.map(b=><BookCard key={b.id} book={b}/>)}</div>:<div className="empty-state">Không có cuốn sách nào phù hợp. Hãy thử từ khóa hoặc danh mục khác.</div>}
 {!loading&&!error&&pages>1&&<nav aria-label="Phân trang" className="pagination"><button disabled={page<=1} onClick={()=>change('page',String(page-1))}>← Trước</button><span>Trang {page} / {pages}</span><button disabled={page>=pages} onClick={()=>change('page',String(page+1))}>Sau →</button></nav>}
 </main>
}
