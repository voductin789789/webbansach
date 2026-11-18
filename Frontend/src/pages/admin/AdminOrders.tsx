import React,{useCallback,useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '../../api/httpClient';
import {toast} from '../../components/ui/Toast';
import {formatVND} from '../../types/formatVND';
import {Status, labels, displayDate} from '../../components/orders/orderTracking';
import '../../components/orders/OrderTracking.css';
interface Order{id:number;orderCode:string;orderStatus:Status;recipientName:string;recipientPhone:string;createdAt:string;totalPrice:number}
const next:Record<Status,Status[]>={PENDING:['PROCESSING','CANCELLED'],PROCESSING:['SHIPPED'],SHIPPED:['DELIVERED'],DELIVERED:[],CANCELLED:[]};
export default function AdminOrders(){
 const [orders,setOrders]=useState<Order[]>([]),[page,setPage]=useState(1),[pages,setPages]=useState(1),[loading,setLoading]=useState(false),[busyId,setBusyId]=useState<number|null>(null),[error,setError]=useState(''),[pendingTotal,setPendingTotal]=useState(0),[confirmingAll,setConfirmingAll]=useState(false);
 const load=useCallback(async()=>{setLoading(true);setError('');try{const r=await api.get('/orders',{params:{page,limit:10}});setOrders(r.data.data);setPages(r.data.pagination?.totalPages||1);const pending=await api.get('/orders',{params:{page:1,limit:1,status:'PENDING'}});setPendingTotal(pending.data.pagination?.total??0)}catch{setError('Không thể tải đơn hàng. Kiểm tra tài khoản Admin và kết nối Backend.')}finally{setLoading(false)}},[page]);
 useEffect(()=>{void load()},[load]);
 const move=async(o:Order,status:Status)=>{if(busyId!==null||!window.confirm(`Chuyển đơn ${o.orderCode} sang "${labels[status]}"?`))return;setBusyId(o.id);try{await api.patch(`/orders/${o.id}/status`,{status});toast.success('Đã cập nhật trạng thái và ghi lịch sử');await load()}catch{toast.error('Không cập nhật được. Hãy tải lại trạng thái hiện tại.');await load()}finally{setBusyId(null)}};
 const confirmAll=async()=>{
  if(confirmingAll||busyId!==null||pendingTotal===0) return;
  if(!window.confirm(`Xác nhận TOÀN BỘ ${pendingTotal} đơn đang chờ xác nhận? Đơn sẽ chuyển sang "Chờ lấy hàng".`))return;
  setConfirmingAll(true);
  try {const r=await api.patch('/orders/confirm-all');toast.success(`Đã xác nhận ${r.data.data?.confirmed ?? 0} đơn và lưu lịch sử MySQL`);setPage(1);await load();}
  catch {toast.error('Xác nhận tất cả thất bại. Vui lòng tải lại danh sách.');await load();}
  finally {setConfirmingAll(false);}
 };
 return <main style={{padding:24}}><h1>Quản lý đơn hàng</h1><p style={{margin:'9px 0 21px',color:'#64748b'}}>Xác nhận, chuẩn bị, giao hàng và xem lịch sử trạng thái. Mỗi lần chuyển được lưu vào MySQL.</p>
 <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap',padding:'17px 20px',marginBottom:20,background:'#fff',border:'1px solid #dce6ec',borderRadius:14}}><div><strong>Đơn chờ xác nhận: {pendingTotal}</strong><p style={{margin:'4px 0',fontSize:13,color:'#64748b'}}>Xác nhận tất cả đơn PENDING, kể cả ở các trang khác. Không tác động đơn đã hủy hoặc đã giao.</p></div><button type="button" onClick={()=>void confirmAll()} disabled={loading||busyId!==null||confirmingAll||pendingTotal===0} style={{padding:'12px 18px',border:0,borderRadius:10,color:'#fff',background:'#e8533e',fontWeight:800,cursor:'pointer',opacity:(loading||confirmingAll||pendingTotal===0)?0.55:1}}>{confirmingAll?'Đang xác nhận...':`Xác nhận tất cả (${pendingTotal})`}</button></div>
 {error&&<p role="alert" style={{color:'#b42318'}}>{error}</p>}{loading&&<p>Đang tải...</p>}
 <div style={{overflowX:'auto',borderRadius:12,border:'1px solid #e2e8f0',background:'#fff'}}><table style={{borderCollapse:'collapse',minWidth:850,width:'100%',textAlign:'left'}}><thead style={{background:'#eff4f8'}}><tr>{['Đơn hàng','Khách nhận','Ngày tạo','Tổng cộng','Trạng thái','Thao tác'].map(x=><th key={x} style={{padding:'15px 13px'}}>{x}</th>)}</tr></thead><tbody>{orders.map(o=><tr key={o.id} style={{borderTop:'1px solid #e2e8f0'}}><td style={{padding:13,maxWidth:210,overflowWrap:'anywhere'}}><Link style={{color:'#1b657b',fontWeight:700}} to={`/my-orders/${o.id}`}>{o.orderCode}</Link></td><td style={{padding:13}}>{o.recipientName}<br/><small>{o.recipientPhone}</small></td><td style={{padding:13}}>{displayDate(o.createdAt)}</td><td style={{padding:13}}>{formatVND(o.totalPrice)}</td><td style={{padding:13}}><strong>{labels[o.orderStatus]}</strong></td><td style={{padding:13}}><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{next[o.orderStatus].map(s=><button key={s} style={{padding:'7px 10px',borderRadius:7,border:'1px solid #b8c8d4',background:s==='CANCELLED'?'#fff0ef':'#e9f4f1',color:s==='CANCELLED'?'#a7281d':'#174f46',fontWeight:700,cursor:'pointer'}} disabled={busyId!==null||confirmingAll} onClick={()=>void move(o,s)}>{busyId===o.id?'Đang lưu...':labels[s]}</button>)}<Link to={`/my-orders/${o.id}`} style={{display:'inline-flex',alignItems:'center',padding:'7px 10px',border:'1px solid #d8e1ea',borderRadius:7}}>Lịch sử</Link></div></td></tr>)}</tbody></table>{!loading&&!orders.length&&<p style={{padding:20}}>Không có đơn hàng nào.</p>}</div>
 <div style={{display:'flex',gap:12,alignItems:'center',marginTop:20}}><button disabled={page<=1||loading} onClick={()=>setPage(p=>p-1)}>Trang trước</button><span>Trang {page}/{pages}</span><button disabled={page>=pages||loading} onClick={()=>setPage(p=>p+1)}>Trang sau</button><button onClick={()=>void load()} disabled={loading}>Làm mới</button></div></main>;
}
