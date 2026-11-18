import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Search, ShoppingBag, PackageCheck, CreditCard, Heart, ShieldCheck } from 'lucide-react';
import './InfoPages.css';

const steps = [
  { icon: Search, title: 'Tìm cuốn sách phù hợp', text: 'Tìm kiếm theo tên hoặc tác giả, duyệt danh mục và xem chi tiết từng đầu sách.' },
  { icon: ShoppingBag, title: 'Chọn cách mua', text: 'Thêm sách vào giỏ để mua nhiều cuốn hoặc chọn Mua ngay để tiến hành đặt hàng.' },
  { icon: PackageCheck, title: 'Theo dõi đơn hàng', text: 'Đăng nhập để xem lịch sử và trạng thái đơn hàng được cập nhật trên hệ thống.' },
];

export default function AboutPage() {
  return (
    <main className="info-page about-page">
      <section className="info-hero">
        <div className="container info-hero-inner">
          <div className="info-hero-copy">
            <span className="info-eyebrow">VỀ BOOKSTORE</span>
            <h1>Mỗi cuốn sách, <span>một hành trình khám phá.</span></h1>
            <p>BookStore là website bán sách trực tuyến được xây dựng trong khuôn khổ đồ án nhóm. Chúng mình mong muốn mang đến trải nghiệm tìm sách, chọn sách và đặt hàng dễ dàng trên một giao diện rõ ràng, thân thiện.</p>
            <div className="info-actions">
              <Link to="/books" className="info-btn info-btn-primary">Khám phá sách <ArrowRight size={18}/></Link>
              <Link to="/contact" className="info-btn info-btn-outline">Liên hệ với cửa hàng</Link>
            </div>
          </div>
          <div className="info-hero-visual" aria-hidden="true">
            <div className="info-visual-glow" />
            <div className="info-visual-book info-visual-book-left"><span>ĐỌC</span><strong>Khơi nguồn<br/>tri thức</strong></div>
            <div className="info-visual-book info-visual-book-center"><BookOpen size={42} /><strong>BOOKSTORE</strong><small>Thế giới tri thức</small></div>
            <div className="info-visual-book info-visual-book-right"><span>KHÁM PHÁ</span><strong>Mỗi ngày<br/>một trang mới</strong></div>
          </div>
        </div>
      </section>
      <div className="container info-main">
        <section className="info-section">
          <div className="info-section-heading"><span className="info-eyebrow">CHÚNG MÌNH MANG ĐẾN ĐIỀU GÌ?</span><h2>Mua sách thuận tiện, thông tin rõ ràng</h2><p>Những tính năng đang được xây dựng và sử dụng trên website.</p></div>
          <div className="info-feature-grid">
            <article className="info-feature"><BookOpen size={26}/><h3>Kho sách theo danh mục</h3><p>Khám phá sách ở nhiều lĩnh vực như văn học, kinh tế, ngoại ngữ, công nghệ và hơn thế nữa.</p></article>
            <article className="info-feature"><ShieldCheck size={26}/><h3>Thông tin minh bạch</h3><p>Xem giá bán và tồn kho từ hệ thống. Thông tin chưa xác thực được ghi rõ, không gán sai tác giả hay bìa xuất bản.</p></article>
            <article className="info-feature"><CreditCard size={26}/><h3>Đặt hàng trực tuyến</h3><p>Chọn số lượng, kiểm tra thông tin nhận hàng và đặt mua theo phương thức thanh toán khi nhận hàng (COD).</p></article>
            <article className="info-feature"><Heart size={26}/><h3>Trải nghiệm dễ sử dụng</h3><p>Giao diện hỗ trợ tìm kiếm, lọc danh mục, xem chi tiết và quản lý đơn hàng trong tài khoản.</p></article>
          </div>
        </section>
        <section className="info-section info-process">
          <div className="info-section-heading"><span className="info-eyebrow">QUY TRÌNH MUA SÁCH</span><h2>Ba bước đơn giản</h2></div>
          <div className="info-step-grid">{steps.map(({icon: Icon,title,text},index) => <article className="info-step" key={title}><span className="info-step-number">0{index+1}</span><Icon size={26}/><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>
        <section className="info-cta"><div><span className="info-eyebrow">CÙNG BẮT ĐẦU</span><h2>Tìm cuốn sách tiếp theo của bạn</h2><p>Khám phá các đầu sách đang có trên hệ thống BookStore.</p></div><Link to="/books" className="info-btn info-btn-primary">Xem danh sách sách <ArrowRight size={18}/></Link></section>
      </div>
    </main>
  );
}
