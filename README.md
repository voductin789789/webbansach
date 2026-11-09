# 📖 WEBSITE BÁN SÁCH TRỰC TUYẾN - BOOKSTORE
> **Đồ Án Cuối Kỳ Môn Lập Trình Web**  
> Nền tảng thương mại điện tử chuyên nghiệp, áp dụng các quy tắc thiết kế UI/UX hiện đại, Responsive đa nền tảng và kiến trúc mã nguồn chuẩn mực.

---

<!-- BADGES -->
<p align="left">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Responsive-100%25-brightgreen?style=for-the-badge" alt="Responsive" />
  <img src="https://img.shields.io/badge/UI%2FUX-Chuẩn_60--30--10-orange?style=for-the-badge" alt="UI/UX" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 📌 MỤC LỤC
1. [Giới Thiệu Dự Án](#-1-giới-thiệu-dự-án)
2. [Các Quy Tắc Thiết Kế Áp Dụng](#-2-các-quy-tắc-thiết-kế-áp-dụng)
3. [Danh Sách Trang & Tính Năng Giao Diện](#-3-danh-sách-trang--tính-năng-giao-diện)
4. [Bảng Phân Công Nhiệm Vụ Nhóm 6 Thành Viên](#-4-bảng-phân-công-nhiệm-vụ-nhóm-6-thành-viên)
5. [Cấu Trúc Thư Mục Dự Án](#-5-cấu-trúc-thư-mục-dự-án)
6. [Hướng Dẫn Cài Đặt & Chạy Thử](#-6-hướng-dẫn-cài-đặt--chạy-thử)
7. [Lộ Trình Phát Triển Tiếp Theo (Backend Roadmap)](#-7-lộ-trình-phát-triển-tiếp-theo-backend-roadmap)

---

## 🎯 1. GIỚI THIỆU DỰ ÁN
- **Tên dự án:** Website Bán Sách Trực Tuyến (**BookStore**)
- **Mục tiêu:** Xây dựng hệ thống thương mại điện tử giúp độc giả dễ dàng tìm kiếm, xem thông tin chi tiết và đặt mua sách trực tuyến với quy trình đơn giản, giao diện đẹp mắt và tốc độ phản hồi nhanh.
- **Đối tượng người dùng:**
  - **Học sinh, sinh viên:** Tìm sách giáo trình, tài liệu tham khảo, sách ngoại ngữ.
  - **Người yêu sách:** Theo dõi các đầu sách bán chạy, tiểu thuyết, tác phẩm kinh điển.
  - **Giáo viên, nhà nghiên cứu:** Tra cứu sách chuyên ngành, công nghệ, kinh tế.
- **Công nghệ nền tảng:**
  - **HTML5 Semantic:** Bố cục thẻ rõ ràng (`header`, `nav`, `main`, `section`, `article`, `footer`), tối ưu SEO & Accessibility.
  - **CSS3 Hiện Đại:** Tận dụng CSS Grid, Flexbox, CSS Custom Properties (Variables), Transition & Animation mượt mà.
  - **JavaScript ES6+:** Tương tác tìm kiếm gợi ý thông minh, Slider tự động, Quản lý Giỏ hàng bằng `localStorage`, Modal & Toast notifications.

---

## 🎨 2. CÁC QUY TẮC THIẾT KẾ ÁP DỤNG

### 2.1. Quy Tắc Phối Màu 60 - 30 - 10
Dự án tuân thủ nghiêm ngặt bảng màu thương mại điện tử chuyên nghiệp:
- ⚪ **Màu chủ đạo (60%):** Trắng (`#FFFFFF`) và Xám sáng (`#F8FAFC`) – tạo cảm giác thoáng đãng, dễ đọc văn bản và tôn vinh bìa sách.
- 🔵 **Màu phụ (30%):** Xanh dương đậm (`#2C3E50`) – áp dụng cho Header, Navigation, Footer và các tiêu đề chính; tạo độ uy tín, trang nhã và tri thức.
- 🔴 **Màu nhấn (10%):** Cam / Đỏ rực rỡ (`#E74C3C`) – dùng cho các nút chuyển đổi hành động Call-To-Action (*Mua ngay*, *Thêm vào giỏ*, *Khuyến mãi*, *Giá bán giảm*, *Badge Hot*).

### 2.2. Kiểu Chữ (Typography)
- **Tiêu đề (Headings):** Font `Montserrat` (Sans-serif hiện đại, độ dày 600 - 800, thể hiện sự vững chãi).
- **Nội dung (Body):** Font `Open Sans` (Kích thước 14px - 16px, `line-height: 1.6`, chống mỏi mắt khi đọc lâu).
- Giữ nguyên tắc vàng: Không dùng quá 2 họ font chữ trên toàn bộ giao diện.

### 2.3. Bố Cục & Tính Nhất Quán (Layout & Consistency)
- **Hệ thống Grid 12 cột Responsive:**
  - **Desktop (>1024px):** 4 thẻ sách/hàng (Trang chủ) và 3 thẻ/hàng kèm Sidebar (Cửa hàng).
  - **Tablet (768px - 1024px):** 2 thẻ sách/hàng.
  - **Mobile (<768px):** 1 thẻ sách/hàng, tối ưu diện tích chạm ngón tay.
- **Card sách chuẩn mực:** Đồng nhất tỷ lệ khung ảnh bìa, vị trí tên sách, tác giả, giá tiền, số sao và nút giỏ hàng.
- **Trang chi tiết sách chuẩn tỷ lệ 40/60:** 40% bên trái là khung ảnh bìa zoom + thư viện thumbnail; 60% bên phải là khu vực thông tin mua hàng.

---

## 🖥️ 3. DANH SÁCH TRANG & TÍNH NĂNG GIAO DIỆN

| Tên Trang | Tệp HTML | Tính Năng Nổi Bật Đã Hoàn Thiện |
| :--- | :--- | :--- |
| **Trang Chủ** | `index.html` | Topbar, Thanh tìm kiếm gợi ý tự động (Auto-suggest), Hero Slider tự chuyển ảnh, Khối danh mục, Sách bán chạy, Khối cam kết dịch vụ, Modal đăng nhập/đăng ký. |
| **Chi Tiết Sách** | `product-detail.html` | Breadcrumbs định vị, Ảnh lớn có zoom khi hover, Album ảnh nhỏ, Đánh giá sao, Chọn số lượng (+/-), Bảng thông số kỹ thuật (ISBN, NXB, Kích thước, Số trang), Bình luận độc giả, Sách cùng thể loại. |
| **Cửa Hàng / Lọc** | `shop.html` | Sidebar lọc đa tiêu chí (Thể loại, khoảng giá, NXB, sao đánh giá), Thanh sắp xếp giá/bán chạy, Phân trang Pagination. |
| **Giỏ Hàng** | `cart.html` | Hiển thị danh sách sách từ `localStorage`, Tăng/giảm số lượng tự tính lại tiền, Nhập mã giảm giá voucher (`GIAM10`, `FREESHIP`), Xóa sản phẩm. |
| **Thanh Toán** | `checkout.html` | Quy trình 3 bước chuẩn: Điền thông tin giao hàng ➔ Chọn hình thức thanh toán (COD, MoMo, VNPay, Thẻ ngân hàng) ➔ Xác nhận đơn hàng. |
| **Tài Khoản** | `account.html` | Hồ sơ cá nhân, Theo dõi lịch sử mua hàng, Trạng thái đơn hàng (*Đang giao*, *Đã nhận*), Danh sách sách yêu thích (Wishlist). |
| **Giới Thiệu** | `about.html` | Giới thiệu dự án BTL, tầm nhìn, sứ mệnh và tài liệu phân tích thiết kế. |
| **Liên Hệ** | `contact.html` | Bản đồ/địa chỉ nhà sách, hotline, email, form gửi lời nhắn phản hồi có validate. |

---

