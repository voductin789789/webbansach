import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../providers/CartProvider';
import {formatVND} from '../types/formatVND';
import {Trash2, ArrowLeft, ShoppingBag, AlertTriangle, RefreshCw} from 'lucide-react';
import './CartPage.css';
function QuantityEditor({bookId, title, quantity, stock, stockLoading, updateQuantity}:{bookId:string;title:string;quantity:number;stock?:number;stockLoading:boolean;updateQuantity:(id:string,amount:number)=>void}){
 const [draft,setDraft]=useState(String(quantity));
 useEffect(()=>setDraft(String(quantity)),[quantity]);
 const commit=()=>{
   const next=Number(draft);
   if(!/^\d+$/.test(draft)||!Number.isSafeInteger(next)||next<1){setDraft(String(quantity));return;}
   if(stock===undefined||stockLoading){setDraft(String(quantity));return;}
   updateQuantity(bookId,next);
   setDraft(String(Math.min(next,Math.max(1,stock))));
 };
 return <div className="cart-qty">
  <button type="button" aria-label={`Giảm ${title}`} disabled={stockLoading||quantity<=1} onClick={()=>updateQuantity(bookId,quantity-1)}>−</button>
  <input type="number" min={1} max={stock} step={1} aria-label={`Nhập số lượng ${title}`} inputMode="numeric" value={draft} disabled={stockLoading||stock===undefined||stock<=0} onChange={e=>setDraft(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur();}}}/>
  <button type="button" aria-label={`Tăng ${title}`} disabled={stockLoading||stock===undefined||stock===0||quantity>=stock} onClick={()=>updateQuantity(bookId,quantity+1)}>+</button>
 </div>;
}
export default function CartPage(){
 const {items,updateQuantity,removeItem,totalPrice,totalItems,refreshStock,stockLoading}=useCart();
 useEffect(()=>{void refreshStock()},[refreshStock]);
 const invalid=items.some(i=>i.stock===undefined||i.stock<=0||i.quantity>i.stock);
 return <main className="container cart-shell"><div className="cart-heading"><div><span className="cart-eyebrow">BOOKSTORE / GIỎ HÀNG</span><h1>Giỏ hàng của bạn</h1><p>{totalItems} cuốn sách đang được chọn</p></div><Link to="/books"><ArrowLeft size={16}/> Tiếp tục mua sắm</Link></div>
 {!items.length?<section className="cart-empty"><ShoppingBag size={48}/><h2>Giỏ hàng đang trống</h2><Link to="/books">Khám phá sách</Link></section>:<div className="cart-layout"><section className="cart-items">{items.map(i=><article key={i.bookId} className="cart-book"><div className="cart-book-main"><h2><Link to={`/books/${i.bookId}`}>{i.title}</Link></h2><p>{i.author && i.author!=='Đang cập nhật'?i.author:'Sách'}</p><strong>{formatVND(i.price)}</strong><small className={i.stock===0?'stock-warning':'stock-ok'}>{i.stock===undefined?'Đang xác minh tồn kho':i.stock===0?'Hết hàng':`Kho còn ${i.stock} cuốn`}</small></div><div className="cart-book-controls"><QuantityEditor bookId={i.bookId} title={i.title} quantity={i.quantity} stock={i.stock} stockLoading={stockLoading} updateQuantity={updateQuantity}/><button className="cart-remove" aria-label={`Xóa ${i.title}`} onClick={()=>removeItem(i.bookId)}><Trash2 size={19}/></button></div></article>)}</section><aside className="cart-summary"><h2>Thông tin đơn hàng</h2><div><span>Tổng số lượng</span><strong>{totalItems} cuốn</strong></div><div><span>Tạm tính</span><strong>{formatVND(totalPrice)}</strong></div><div className="cart-summary-total"><span>Tổng cộng</span><strong>{formatVND(totalPrice)}</strong></div>{invalid&&<p className="cart-stock-alert"><AlertTriangle size={17}/> Tồn kho có thay đổi hoặc chưa tải được. Vui lòng kiểm tra trước khi đặt.</p>}<button className="cart-refresh" disabled={stockLoading} onClick={()=>void refreshStock()}><RefreshCw size={16}/> {stockLoading?'Đang kiểm tra...':'Kiểm tra lại tồn kho'}</button>{invalid||stockLoading?<button className="cart-checkout-disabled" disabled>Chưa thể đặt hàng</button>:<Link className="cart-checkout" to="/checkout">Tiến hành đặt hàng →</Link>}</aside></div>}</main>
}
