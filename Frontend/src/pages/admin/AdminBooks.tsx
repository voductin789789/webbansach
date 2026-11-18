import React,{useEffect,useState} from 'react';
import {api} from '../../api/httpClient';import {fetchBooks} from '../../api/bookApi';import type {Book} from '../../types';import {formatVND} from '../../types/formatVND';import {toast} from '../../components/ui/Toast';
type Category={id:number;name:string};
const empty={title:'',author:'',price:0,stock:0,categoryId:0,description:'',coverImage:''};
export default function AdminBooks(){const [books,setBooks]=useState<Book[]>([]),[categories,setCategories]=useState<Category[]>([]),[page,setPage]=useState(1),[pages,setPages]=useState(1),[loading,setLoading]=useState(false),[editing,setEditing]=useState<number|null>(null),[form,setForm]=useState(empty),[show,setShow]=useState(false);
 const load=async()=>{setLoading(true);try{const x=await fetchBooks({page,limit:12});setBooks(x.books);setPages(x.pagination?.totalPages||1)}catch{toast.error('Không thể tải danh sách sách')}finally{setLoading(false)}};
 useEffect(()=>{load()},[page]);useEffect(()=>{api.get('/categories').then(r=>setCategories(r.data.data)).catch(()=>{})},[]);
 const add=()=>{setEditing(null);setForm(empty);setShow(true)};
 const change=(key:keyof typeof empty,value:string)=>setForm(f=>({...f,[key]:['price','stock','categoryId'].includes(key)?Number(value):value}));
 const startEdit=async(id:string)=>{try{const r=await api.get(`/books/${id}`);const b=r.data.data;setEditing(b.id);setForm({title:b.title,author:b.author,price:b.price,stock:b.stock,categoryId:b.categoryId,description:b.description||'',coverImage:b.coverImage||''});setShow(true)}catch{toast.error('Không thể tải chi tiết sách')}};
 const save=async(e:React.FormEvent)=>{e.preventDefault();try{if(editing)await api.put(`/books/${editing}`,form);else await api.post('/books',form);setShow(false);await load();toast.success('Đã lưu sách')}catch{toast.error('Không thể lưu sách')}};
 const remove=async(b:Book)=>{if(!window.confirm(`Xóa sách "${b.title}"?`))return;try{await api.delete(`/books/${b.id}`);await load();toast.success('Đã xóa sách')}catch{toast.error('Không thể xóa sách (có thể đã phát sinh đơn hàng)')}};
 return <div style={{padding:20}}><h1>Quản lý sách</h1><button onClick={add}>Thêm sách mới</button>
 {show&&<form onSubmit={save} style={{border:'1px solid #ddd',padding:16,display:'grid',gap:8,maxWidth:550,marginTop:16}}>
 <h2>{editing?'Sửa sách':'Thêm sách'}</h2>
 <label>Tên sách <input required value={form.title} onChange={e=>change('title',e.target.value)}/></label>
 <label>Tác giả (nhập đúng theo thông tin trên bìa sách thật) <input required value={form.author} onChange={e=>change('author',e.target.value)}/><small style={{display:"block",color:"#64748b"}}>Ảnh bìa SVG trong dự án chỉ là minh họa. Cần điền tác giả thật đã xác minh.</small></label>
 <label>Giá <input required type="number" min="1" value={form.price} onChange={e=>change('price',e.target.value)}/></label>
 <label>Tồn kho <input required type="number" min="0" value={form.stock} onChange={e=>change('stock',e.target.value)}/></label>
 <label>Danh mục <select required value={form.categoryId} onChange={e=>change('categoryId',e.target.value)}><option value={0}>Chọn danh mục</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
 <label>Ảnh bìa (URL) <input value={form.coverImage} onChange={e=>change('coverImage',e.target.value)}/></label>
 <label>Mô tả <textarea value={form.description} onChange={e=>change('description',e.target.value)}/></label>
 <div><button type="submit">Lưu</button> <button type="button" onClick={()=>setShow(false)}>Hủy</button></div></form>}
 {loading?<p>Đang tải...</p>:<table style={{width:'100%',marginTop:20,textAlign:'left'}}><thead><tr><th>Tên sách</th><th>Tác giả</th><th>Giá</th><th>Kho</th><th>Thao tác</th></tr></thead><tbody>{books.map(b=><tr key={b.id}><td>{b.title}</td><td>{b.author && b.author !== "Đang cập nhật" ? b.author : <span style={{color:"#a16207"}}>Chưa xác minh — nhấn Sửa</span>}</td><td>{formatVND(b.price)}</td><td>{b.stock}</td><td><button onClick={()=>startEdit(b.id)}>Sửa</button> <button onClick={()=>remove(b)}>Xóa</button></td></tr>)}</tbody></table>}
 <p><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Trước</button> {page}/{pages} <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Sau</button></p></div>;
}
