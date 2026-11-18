import React,{useCallback,useEffect,useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {RefreshCw, ArrowLeft} from 'lucide-react';
import {api} from '../api/httpClient';
import {formatVND} from '../types/formatVND';
import {toast} from '../components/ui/Toast';
import OrderTimeline from '../components/orders/OrderTimeline';
import {HistoryEvent,Status,labels,displayDate,validStatus} from '../components/orders/orderTracking';
interface Order {id:number;orderCode:string;orderStatus:Status;createdAt:string;recipientName:string;recipientPhone:string;shippingAddress:string;paymentMethod:string;paymentStatus:string;totalPrice:number;note?:string|null;statusHistory?:HistoryEvent[];items:{id:number;quantity:number;price:number;book:{title:string}}[]}
export default function OrderDetailPage(){
 const {id}=useParams();const [order,setOrder]=useState<Order|null>(null);const [err,setErr]=useState('');const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);
 const load=useCallback(async()=>{setLoading(true);setErr('');try{const r=await api.get(`/orders/${id}`);setOrder(r.data.data)}catch{setErr('Không thể tải đơn. Hãy thử lại hoặc kiểm tra quyền truy cập.')}finally{setLoading(false)}},[id]);
 useEffect(()=>{void load()},[load]);
 async function cancel(){if(!order||busy||!window.confirm('Bạn muốn hủy đơn đang chờ xác nhận?'))return;setBusy(true);try{await api.patch(`/orders/${id}/cancel`);await load();toast.success('Đã hủy đơn và hoàn tồn kho')}catch{toast.error('Không thể hủy. Đơn có thể đã được xử lý; hãy tải lại.');await load()}finally{setBusy(false)}}
 if(loading&&!order)return <div className="container tracking-page">Đang tải chi tiết đơn hàng...</div>;
 if(err&&!order)return <div className="container tracking-page"><p role="alert">{err}</p><button onClick={()=>void load()}>Thử lại</button></div>;
 if(!order)return null;
 return <main className="container tracking-page"><Link to="/my-orders" className="tracking-back"><ArrowLeft size={17}/> Đơn hàng của tôi</Link><h1 className="tracking-title">Đơn hàng {order.orderCode}</h1><p className="tracking-muted">Đặt ngày {displayDate(order.createdAt)} · <strong>{validStatus(order.orderStatus)?labels[order.orderStatus]:order.orderStatus}</strong></p>
 <div className="tracking-layout"><OrderTimeline status={order.orderStatus} createdAt={order.createdAt} history={order.statusHistory}/>
 <section className="tracking-detail-card"><h2>Thông tin đơn hàng</h2><div className="tracking-info"><p><strong>Người nhận:</strong> {order.recipientName}</p><p><strong>Số điện thoại:</strong> {order.recipientPhone}</p><p><strong>Địa chỉ giao hàng:</strong> {order.shippingAddress}</p><p><strong>Thanh toán:</strong> {order.paymentMethod==='COD'?'Thanh toán khi nhận hàng (COD)':order.paymentMethod} · {order.paymentStatus==='PAID'?'Đã thanh toán':'Chưa thanh toán'}</p>{order.note&&<p><strong>Ghi chú:</strong> {order.note}</p>}</div><div className="tracking-items">{order.items.map(i=><p key={i.id}><span>{i.book.title} × {i.quantity}</span><strong>{formatVND(i.price*i.quantity)}</strong></p>)}</div><div className="tracking-total"><span>Tổng cộng</span><strong>{formatVND(order.totalPrice)}</strong></div>
 <button className="tracking-cancel-button" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/> {loading?'Đang cập nhật...':'Cập nhật trạng thái'}</button>{order.orderStatus==='PENDING'&&<button className="tracking-cancel-button" style={{marginLeft:9}} disabled={busy} onClick={cancel}>{busy?'Đang hủy...':'Hủy đơn hàng'}</button>}
 <p className="tracking-muted" style={{fontSize:12,marginTop:14}}>Đây là tiến trình theo trạng thái do cửa hàng cập nhật, không phải vị trí GPS của người giao hàng.</p></section></div></main>;
}
