import React,{useCallback,useEffect,useState} from 'react';
import {Link,useSearchParams,useNavigate} from 'react-router-dom';
import {api} from '../api/httpClient';
import {formatVND} from '../types/formatVND';
import {Status,labels,displayDate,validStatus} from '../components/orders/orderTracking';
import '../components/orders/OrderTracking.css';
import '../components/orders/OrderPurchaseMenu.css';
interface Order {id:number;orderCode:string;orderStatus:Status;totalPrice:number;createdAt:string;items:{id:number}[]}
export default function OrdersPage(){
 const navigate=useNavigate();const [searchParams,setSearchParams]=useSearchParams();const selectedStatus=searchParams.get('status')||'ALL';const [orders,setOrders]=useState<Order[]>([]),[err,setErr]=useState(''),[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);setErr('');try{const r=await api.get('/orders/my-orders');setOrders(r.data.data)}catch{setErr('Không thể tải đơn hàng')}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 return <main className="container tracking-page"><button type="button" className="tracking-back" style={{border:0,background:"transparent",cursor:"pointer",padding:"0 0 16px",color:"#27435a",fontWeight:700}} onClick={()=>navigate(-1)}>← Quay lại</button><h1>Đơn mua của tôi</h1><p className="tracking-muted">Xem các đơn đã đặt và theo dõi từng bước xử lý của cửa hàng.</p><button className="tracking-cancel-button" onClick={()=>void load()} disabled={loading}>Làm mới danh sách</button>{err&&<p role="alert">{err}</p>}{loading&&!orders.length&&<p>Đang tải đơn hàng...</p>}
 <div className="order-filter-tabs">{[{s:'ALL',label:'Tất cả'},{s:'PENDING',label:'Chờ xác nhận'},{s:'PROCESSING',label:'Chờ lấy hàng'},{s:'SHIPPED',label:'Chờ giao hàng'},{s:'DELIVERED',label:'Đã giao'},{s:'CANCELLED',label:'Đã hủy'}].map(x=><button type="button" key={x.s} className={selectedStatus===x.s?'selected':''} onClick={()=>setSearchParams(x.s==='ALL'?{}:{status:x.s})}>{x.label} <span>{x.s==='ALL'?orders.length:orders.filter(o=>o.orderStatus===x.s).length}</span></button>)}</div><div className="tracking-card-grid">{orders.filter(o=>selectedStatus==='ALL'||o.orderStatus===selectedStatus).map(o=><article className="tracking-order-card" key={o.id}><div><Link className="tracking-order-code" to={`/my-orders/${o.id}`}>{o.orderCode}</Link><p>{displayDate(o.createdAt)} · {o.items.length} dòng sản phẩm</p><p><strong>{validStatus(o.orderStatus)?labels[o.orderStatus]:o.orderStatus}</strong></p></div><div className="tracking-order-actions"><strong>{formatVND(o.totalPrice)}</strong><Link to={`/my-orders/${o.id}`}>Theo dõi đơn hàng →</Link></div></article>)}</div>{!loading&&!err&&!orders.filter(o=>selectedStatus==='ALL'||o.orderStatus===selectedStatus).length&&<p>{selectedStatus==='ALL'?'Bạn chưa có đơn hàng.':'Không có đơn hàng trong trạng thái này.'} <Link to="/books">Khám phá sách ngay</Link></p>}</main>;
}
