import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, HelpCircle, Mail, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { api } from '../api/httpClient';
import './InfoPages.css';

type ContactForm = { name: string; email: string; subject: string; message: string };
const initial: ContactForm = { name: '', email: '', subject: 'Tư vấn chọn sách', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initial);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSuccess(false);
    setError('');
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    setError('');
    setSuccess(false);
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.'); return;
    }
    setPending(true);
    try {
      await api.post('/contact', {
        name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim(),
      });
      setSuccess(true);
      setForm(initial);
    } catch (err: unknown) {
      const fallback = 'Không thể gửi liên hệ. Hãy kiểm tra Backend hoặc thử lại sau.';
      const data = (err as {response?: {data?: {message?: string}}})?.response?.data;
      setError(data?.message || fallback);
    } finally { setPending(false); }
  };

  return (
    <main className="info-page contact-page">
      <section className="info-hero info-hero-compact"><div className="container"><span className="info-eyebrow">KẾT NỐI VỚI BOOKSTORE</span><h1>Chúng mình có thể <span>giúp gì cho bạn?</span></h1><p>Hỏi về sách, đặt hàng hoặc gửi ý kiến để giúp website ngày càng tốt hơn.</p></div></section>
      <div className="container info-main">
        <div className="contact-layout">
          <section className="contact-form-panel" aria-labelledby="contact-form-heading">
            <div className="contact-panel-heading"><span className="contact-icon"><MessageCircle size={26}/></span><div><h2 id="contact-form-heading">Gửi lời nhắn</h2><p>Điền thông tin bên dưới. Nội dung sẽ được lưu vào hệ thống để người quản trị xem xét.</p></div></div>
            {success && <div className="contact-status success" role="status"><CheckCircle2 size={21}/> Đã tiếp nhận lời nhắn của bạn. Cảm ơn bạn đã liên hệ!</div>}
            {error && <div className="contact-status error" role="alert">{error}</div>}
            <form onSubmit={submit} className="contact-form">
              <div className="contact-form-row">
                <label>Họ và tên <span>*</span><input required maxLength={100} autoComplete="name" value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Nhập họ và tên" /></label>
                <label>Email <span>*</span><input required maxLength={160} type="email" autoComplete="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="tenban@example.com" /></label>
              </div>
              <label>Chủ đề <span>*</span><select required value={form.subject} onChange={e=>update('subject',e.target.value)}><option>Tư vấn chọn sách</option><option>Hỗ trợ đặt hàng</option><option>Thông tin sản phẩm</option><option>Góp ý website</option><option>Vấn đề khác</option></select></label>
              <label>Nội dung <span>*</span><textarea required minLength={10} maxLength={3000} rows={6} value={form.message} onChange={e=>update('message',e.target.value)} placeholder="Bạn muốn nhắn gửi điều gì? (ít nhất 10 ký tự)" /><small>{form.message.length}/3000 ký tự</small></label>
              <button type="submit" disabled={pending} className="info-btn info-btn-primary contact-submit"><Send size={18}/>{pending ? 'Đang gửi...' : 'Gửi liên hệ'}</button>
              <p className="contact-privacy"><ShieldCheck size={16}/> Thông tin bạn nhập chỉ dùng để xử lý yêu cầu liên hệ. Không gửi mật khẩu hoặc dữ liệu thanh toán qua biểu mẫu.</p>
            </form>
          </section>
          <aside className="contact-side">
            <div className="contact-side-card"><span className="contact-side-icon"><Mail size={25}/></span><h3>Hỗ trợ trực tuyến</h3><p>Hãy gửi lời nhắn bằng biểu mẫu bên cạnh để cửa hàng ghi nhận yêu cầu. Đây là website đồ án, chưa công bố số điện thoại hay địa chỉ kinh doanh chính thức.</p></div>
            <div className="contact-side-card"><span className="contact-side-icon"><HelpCircle size={25}/></span><h3>Bạn cần hỗ trợ đặt hàng?</h3><p>Nếu đã đặt mua sách, hãy đăng nhập để kiểm tra chi tiết và trạng thái đơn hàng của mình.</p><Link to="/my-orders">Xem đơn hàng của tôi <ArrowRight size={16}/></Link></div>
            <div className="contact-side-card contact-side-accent"><h3>Muốn tìm sách trước?</h3><p>Khám phá danh mục sách hiện có để chọn cuốn phù hợp với bạn.</p><Link to="/books">Khám phá sách <ArrowRight size={16}/></Link></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
