import React,{useState} from 'react';
import {Link,useNavigate,useLocation} from 'react-router-dom';
import {BookOpen,CheckCircle2,Eye,EyeOff,LockKeyhole,Mail,Phone,UserRound,ShieldCheck,Truck,LibraryBig} from 'lucide-react';
import {api} from '../api/httpClient';
import {useAuth} from '../providers/AuthProvider';
import {toast} from '../components/ui/Toast';
import './AuthPages.css';
export default function RegisterPage(){
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[phone,setPhone]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const {login}=useAuth();const navigate=useNavigate();const location=useLocation();const redirectTo=(location.state as {from?:string}|null)?.from;
 async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;setError('');
 if(name.trim().length<2){setError('Họ và tên phải có ít nhất 2 ký tự.');return}
 if(password.length<8){setError('Mật khẩu cần có ít nhất 8 ký tự.');return}
 if(password!==confirm){setError('Xác nhận mật khẩu không trùng khớp.');return}
 if(phone.trim()&&!/^(0|\+84)[0-9]{9,10}$/.test(phone.trim().replace(/[ .-]/g,''))){setError('Số điện thoại chưa đúng định dạng.');return}
 setBusy(true);try{const r=await api.post('/auth/register',{name:name.trim(),email:email.trim(),password,phone:phone.trim()||undefined});const {user,token}=r.data.data;login({...user,id:String(user.id),role:user.role.toLowerCase()},token);toast.success('Đăng ký thành công!');navigate(redirectTo?.startsWith('/')&&!redirectTo.startsWith('//')?redirectTo:'/',{replace:true});}
 catch(err:unknown){const e=err as {response?:{data?:{message?:string}}};setError(e.response?.data?.message||'Không thể đăng ký. Email có thể đã được sử dụng.');}finally{setBusy(false)}}
 return <main className="auth-page"><div className="auth-shell"><aside className="auth-intro"><Link to="/" className="auth-intro-brand"><BookOpen size={22}/> BOOK<span>STORE</span></Link><span className="auth-intro-brow">THƯ VIỆN CỦA BẠN, MỌI LÚC MỌI NƠI</span><h1>Mở cánh cửa đến thế giới tri thức.</h1><p>Tham gia BookStore để lựa chọn sách yêu thích, đặt hàng và theo dõi đơn mua thuận tiện.</p><div className="auth-benefits"><div><LibraryBig size={20}/><span>Khám phá hàng nghìn đầu sách</span></div><div><Truck size={20}/><span>Theo dõi tiến trình đơn mua</span></div><div><ShieldCheck size={20}/><span>Thông tin tài khoản được bảo vệ</span></div></div><div className="auth-intro-decor" aria-hidden="true"><BookOpen size={88}/></div></aside>
 <section className="auth-card"><div className="auth-card-tag"><CheckCircle2 size={15}/> TẠO TÀI KHOẢN KHÁCH HÀNG</div><h2>Đăng ký tài khoản</h2><p className="auth-caption">Điền thông tin để bắt đầu mua sách cùng BookStore.</p>
 <form onSubmit={submit} className="auth-form"><label>Họ và tên <span>*</span><span className="auth-input-wrap"><UserRound size={18}/><input autoComplete="name" placeholder="Nguyễn Văn A" required minLength={2} value={name} onChange={e=>setName(e.target.value)}/></span></label>
 <label>Email <span>*</span><span className="auth-input-wrap"><Mail size={18}/><input autoComplete="email" type="email" placeholder="email@example.com" required value={email} onChange={e=>setEmail(e.target.value)}/></span></label>
 <label>Số điện thoại <small>(không bắt buộc)</small><span className="auth-input-wrap"><Phone size={18}/><input autoComplete="tel" type="tel" placeholder="09xxxxxxxx" value={phone} onChange={e=>setPhone(e.target.value)}/></span></label>
 <label>Mật khẩu <span>*</span><span className="auth-input-wrap"><LockKeyhole size={18}/><input autoComplete="new-password" type={show?'text':'password'} placeholder="Ít nhất 8 ký tự" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" className="auth-eye" onClick={()=>setShow(v=>!v)} aria-label={show?'Ẩn mật khẩu':'Hiện mật khẩu'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
 <label>Xác nhận mật khẩu <span>*</span><span className="auth-input-wrap"><LockKeyhole size={18}/><input autoComplete="new-password" type={show?'text':'password'} placeholder="Nhập lại mật khẩu" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></span></label>
 {error&&<p className="auth-form-error" role="alert">{error}</p>}
 <button type="submit" className="auth-submit" disabled={busy}>{busy?'Đang tạo tài khoản...':'Tạo tài khoản'} <span aria-hidden="true">→</span></button></form>
 <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></section></div></main>
}
