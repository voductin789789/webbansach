import React, {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {BookOpen, Layers3, ShoppingBag, Wallet, ArrowUpRight, PackageCheck, Clock3, Truck, RefreshCw} from 'lucide-react';
import {api} from '../../api/httpClient';
import {formatVND} from '../../types/formatVND';
import {labels,validStatus,displayDate} from '../../components/orders/orderTracking';
import './AdminDashboard.css';
interface Order {id:number;orderCode:string;orderStatus:string;totalPrice:number;createdAt?:string;recipientName?:string}
interface Stats {books:number;categories:number;orders:number;revenue:number;pending:number;processing:number;shipped:number}
const initial: Stats = {books:0,categories:0,orders:0,revenue:0,pending:0,processing:0,shipped:0};
export default function AdminDashboard(){
 const [data,setData]=useState<Stats>(initial),[orders,setOrders]=useState<Order[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 async function load(){setLoading(true);setError('');try{
  const [b,c,o]=await Promise.all([api.get('/books',{params:{limit:1}}),api.get('/categories'),api.get('/orders',{params:{limit:100,page:1}})]);
  const rows:Order[]=Array.isArray(o.data.data)?o.data.data:[];
  setOrders(rows);
  setData({books:b.data.pagination?.total||0,categories:Array.isArray(c.data.data)?c.data.data.length:0,orders:o.data.pagination?.total||rows.length,
   revenue:rows.filter(x=>x.orderStatus==='DELIVERED').reduce((s,x)=>s+Number(x.totalPrice),0),
   pending:rows.filter(x=>x.orderStatus==='PENDING').length,processing:rows.filter(x=>x.orderStatus==='PROCESSING').length,shipped:rows.filter(x=>x.orderStatus==='SHIPPED').length});
 }catch{setError('Không thể tải thống kê. Hãy kiểm tra Backend, MySQL và phiên Admin.')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 const kpis=[{name:'Tổng đầu sách',value:data.books.toLocaleString('vi-VN'),icon:BookOpen,tone:'navy',href:'/admin/books'},{name:'Danh mục',value:String(data.categories),icon:Layers3,tone:'blue',href:'/admin/categories'},{name:'Tổng đơn hàng',value:data.orders.toLocaleString('vi-VN'),icon:ShoppingBag,tone:'orange',href:'/admin/orders'},{name:'Doanh thu đã giao*',value:formatVND(data.revenue),icon:Wallet,tone:'green',href:'/admin/orders'}];
 return <div className="admin-dashboard">
  <div className="admin-dashboard-heading"><div><span className="admin-eyebrow">BOOKSTORE / QUẢN TRỊ</span><h1>Tổng quan cửa hàng</h1><p>Theo dõi hoạt động và quản lý công việc trong ngày.</p></div><button type="button" className="admin-refresh" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/>{loading?'Đang tải...':'Làm mới'}</button></div>
  {error&&<div className="admin-error" role="alert">{error}</div>}
  <div className="admin-kpi-grid">{kpis.map(({name,value,icon:Icon,tone,href})=><Link className="admin-kpi" to={href} key={name}><div className={`admin-kpi-icon ${tone}`}><Icon size={23}/></div><span className="admin-kpi-name">{name}</span><strong>{loading?'…':value}</strong><span className="admin-kpi-foot">Xem chi tiết <ArrowUpRight size={15}/></span></Link>)}</div>
  <div className="admin-dashboard-columns"><section className="admin-surface"><div className="admin-section-heading"><div><h2>Đơn hàng gần đây</h2><p>Trạng thái được đồng bộ từ cơ sở dữ liệu</p></div><Link to="/admin/orders">Xem tất cả <ArrowUpRight size={16}/></Link></div><div className="admin-table-scroll"><table className="admin-recent-table"><thead><tr><th>Mã đơn hàng</th><th>Ngày đặt</th><th>Trạng thái</th><th className="align-right">Giá trị</th></tr></thead><tbody>{orders.slice(0,8).map(o=><tr key={o.id}><td><Link to="/admin/orders" title={o.orderCode}>{o.orderCode.length>21?o.orderCode.slice(0,18)+'…':o.orderCode}</Link></td><td>{displayDate(o.createdAt)}</td><td><span className={`admin-status-pill status-${o.orderStatus.toLowerCase()}`}>{validStatus(o.orderStatus)?labels[o.orderStatus]:o.orderStatus}</span></td><td className="align-right">{formatVND(o.totalPrice)}</td></tr>)}{!loading&&!orders.length&&<tr><td colSpan={4} className="admin-empty">Chưa có đơn hàng nào trong hệ thống.</td></tr>}</tbody></table></div></section>
  <aside className="admin-side-stack"><section className="admin-surface admin-workbox"><h2>Cần xử lý</h2><p className="admin-subtitle">Số đơn theo trạng thái trong {orders.length} đơn đã tải</p><Link to="/admin/orders"><span className="admin-work-icon amber"><Clock3 size={20}/></span><span>Chờ xác nhận</span><strong>{data.pending}</strong></Link><Link to="/admin/orders"><span className="admin-work-icon blue"><PackageCheck size={20}/></span><span>Đang chuẩn bị</span><strong>{data.processing}</strong></Link><Link to="/admin/orders"><span className="admin-work-icon mint"><Truck size={20}/></span><span>Đang giao hàng</span><strong>{data.shipped}</strong></Link></section><section className="admin-helpbox"><strong>Quản lý cửa hàng thuận tiện hơn</strong><p>Cập nhật sách, tồn kho và xử lý đơn hàng ngay trong bảng quản trị.</p><Link to="/admin/books">Quản lý sách <ArrowUpRight size={15}/></Link></section></aside></div>
  <p className="admin-stats-note">* Doanh thu chỉ cộng đơn đã giao trong {orders.length} đơn được tải gần nhất, không phải báo cáo doanh thu toàn hệ thống nếu có hơn 100 đơn.</p>
 </div>
}
