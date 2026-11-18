import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Wallet,Package,Truck,ChevronRight} from 'lucide-react';
import {api} from '../../api/httpClient';
import './OrderPurchaseMenu.css';
interface OrderStatus {orderStatus:string}
const menus=[{label:'Chờ xác nhận',status:'PENDING',icon:Wallet},{label:'Chờ lấy hàng',status:'PROCESSING',icon:Package},{label:'Chờ giao hàng',status:'SHIPPED',icon:Truck}];
export default function OrderPurchaseMenu(){const [counts,setCounts]=useState<Record<string,number>>({}),[error,setError]=useState('');
 useEffect(()=>{let active=true;api.get('/orders/my-orders').then(r=>{if(!active)return;const rows:OrderStatus[]=Array.isArray(r.data.data)?r.data.data:[];setCounts(rows.reduce((a,o)=>({...a,[o.orderStatus]:(a[o.orderStatus]||0)+1}),{} as Record<string,number>))}).catch(()=>{if(active)setError('Chưa tải được số lượng đơn hàng')});return()=>{active=false}},[]);
 return <section className="purchase-panel"><div className="purchase-panel-head"><div><span className="purchase-overline">TÀI KHOẢN / ĐƠN HÀNG</span><h2>Đơn mua</h2><p>Theo dõi từng giai đoạn xử lý đơn sách của bạn</p></div><Link to="/my-orders" className="purchase-history">Xem lịch sử mua hàng <ChevronRight size={18}/></Link></div><div className="purchase-steps">{menus.map(({label,status,icon:Icon})=><Link to={`/my-orders?status=${status}`} key={status} className="purchase-step"><span className="purchase-step-icon"><Icon size={27} strokeWidth={1.8}/>{Boolean(counts[status])&&<span className="purchase-count">{counts[status]}</span>}</span><strong>{label}</strong><span className="purchase-step-caption">Xem đơn hàng <ChevronRight size={13}/></span></Link>)}</div>{error&&<p className="purchase-error">{error}</p>}</section>
}
