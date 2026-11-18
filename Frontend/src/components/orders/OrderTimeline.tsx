import React from 'react';
import { Check, Clock3, Package, Truck, CircleCheck, XCircle, History } from 'lucide-react';
import { Status, HistoryEvent, stages, labels, descriptions, roles, displayDate } from './orderTracking';
import './OrderTracking.css';

const icons = [Clock3, Package, Truck, CircleCheck];
type Props = { status: Status; createdAt: string; history?: HistoryEvent[] };
export default function OrderTimeline({status, createdAt, history = []}: Props) {
  const cancelled = status === 'CANCELLED';
  const active = stages.indexOf(status);
  const events = [...history].sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime() || a.id-b.id);
  const dateFor = (stage: Status) => events.find(e=>e.toStatus===stage)?.createdAt ?? (stage==='PENDING'?createdAt:undefined);
  return <section className="tracking-panel" aria-label="Tiến trình đơn hàng">
    <div className="tracking-heading"><h2>Tiến trình đơn hàng</h2><span className={'tracking-state '+(cancelled?'cancelled':'')}>{cancelled?<XCircle size={17}/>:<Clock3 size={17}/>} {labels[status]}</span></div>
    <div className="order-timeline">
      {stages.map((step,index)=>{
        const Icon=icons[index]; const complete=!cancelled && index<active; const current=!cancelled && index===active;
        const historical=cancelled && events.some(e=>e.toStatus===step);
        return <div key={step} className={'tracking-step '+(complete||current||historical?'tracking-reached ':'')+(current?'tracking-current':'')}>
          <div className="tracking-dot">{complete?<Check size={18}/>:<Icon size={18}/>}</div>
          <div><strong>{labels[step]}</strong><p>{descriptions[step]}</p>{dateFor(step)&&<time>{displayDate(dateFor(step))}</time>}</div>
        </div>;
      })}
      {cancelled&&<div className="tracking-step tracking-reached tracking-cancelled"><div className="tracking-dot"><XCircle size={18}/></div><div><strong>Đã hủy đơn</strong><p>Đơn dừng xử lý. Nếu trước đó đã trừ kho, hệ thống hoàn tồn kho theo quy định.</p>{dateFor('CANCELLED')&&<time>{displayDate(dateFor('CANCELLED'))}</time>}</div></div>}
    </div>
    <div className="tracking-history"><h3><History size={19}/> Lịch sử cập nhật</h3>
      {events.length ? <ol>{events.map(e=><li key={e.id}><div><strong>{labels[e.toStatus]}</strong><time>{displayDate(e.createdAt)}</time></div><p>{e.note || `Cập nhật bởi ${roles[e.changedByRole]||'hệ thống'}`}</p><small>Người thực hiện: {roles[e.changedByRole]||e.changedByRole}</small></li>)}</ol> : <p className="tracking-legacy">Đơn tạo trước khi bổ sung lịch sử: thời điểm đặt đơn được ghi nhận là {displayDate(createdAt)}. Các mốc xử lý cũ không có dữ liệu thời gian, nên không được suy đoán.</p>}
    </div>
  </section>;
}
