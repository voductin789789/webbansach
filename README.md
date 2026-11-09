# 📖 WEBSITE BÁN SÁCH TRỰC TUYẾN - BOOKSTORE
> **Đồ Án Môn Lập Trình Web**  
> Dự án đã hoàn thiện 100% Giao diện ngoài (Frontend). Dưới đây là danh sách chi tiết các phần việc còn thiếu để nhóm tiếp tục phát triển hoàn thiện đồ án.

---

<p align="left">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Frontend-Đã_Xong-brightgreen?style=for-the-badge" alt="Frontend Done" />
  <img src="https://img.shields.io/badge/Backend-Cần_Làm-orange?style=for-the-badge" alt="Backend Needed" />
</p>

---

## 📌 DANH SÁCH CÁC CÔNG VIỆC CẦN LÀM TIẾP THEO

Website hiện tại đã có đầy đủ khung giao diện tĩnh (HTML/CSS/JS). Để trở thành một web động hoàn chỉnh nộp cho thầy cô, nhóm cần làm tiếp **6 Module nghiệp vụ** sau:

---

### 🗄️ MODULE 1: Xây Dựng Cơ Sở Dữ Liệu (Database)
- [ ] **Mô tả:** Thiết kế CSDL (dùng MySQL / phpMyAdmin) để lưu trữ toàn bộ dữ liệu của website.
- [ ] **Các bảng cần tạo:**
  1. `users`: Lưu tài khoản (id, họ tên, email, mật khẩu, số điện thoại, địa chỉ, vai trò: `user` hoặc `admin`).
  2. `categories`: Lưu danh mục sách (Văn học, Kinh tế, Kỹ năng sống, Thiếu nhi...).
  3. `books`: Lưu thông tin sách (tên sách, tác giả, nhà xuất bản, năm xuất bản, giá bán, giá gốc, số trang, số lượng trong kho, mô tả, ảnh bìa).
  4. `orders`: Lưu thông tin đơn đặt hàng (mã đơn, id người mua, tên người nhận, địa chỉ nhận, số điện thoại, tổng tiền, phương thức thanh toán, trạng thái đơn hàng).
  5. `order_details`: Lưu các cuốn sách trong từng đơn hàng (id đơn hàng, id sách, số lượng mua, đơn giá lúc mua).
  6. `reviews`: Lưu đánh giá số sao và bình luận của độc giả.
- [ ] **Đầu ra:** File `database.sql` có sẵn dữ liệu mẫu khoảng 15-20 cuốn sách để import vào chạy ngay.

---

### 🔐 MODULE 2: Đăng Ký, Đăng Nhập & Phân Quyền (Authentication)
- [ ] **Mô tả:** Kết nối các form trên giao diện với cơ sở dữ liệu để quản lý tài khoản người dùng.
- [ ] **Các chức năng cần viết:**
  1. **Đăng ký:** Người dùng nhập họ tên, email, mật khẩu ➔ Kiểm tra nếu email đã tồn tại thì báo lỗi ➔ Mã hóa mật khẩu (dùng `bcrypt` hoặc `md5`) rồi lưu vào bảng `users`.
  2. **Đăng nhập:** Kiểm tra đúng tài khoản/mật khẩu ➔ Lưu phiên làm việc (Session/Cookie) ➔ Hiển thị tên người dùng lên Header thay cho chữ "Tài khoản".
  3. **Đăng xuất:** Xóa session và quay về trang chủ.
  4. **Phân quyền (Rất quan trọng):** 
     - Nếu tài khoản có quyền `user` ➔ Chỉ được mua hàng và xem đơn của chính mình.
     - Nếu tài khoản có quyền `admin` ➔ Cho phép truy cập vào trang quản trị (Admin). Người thường gõ link Admin sẽ bị chặn.

---

### 📚 MODULE 3: Đổ Dữ Liệu Sách Ra Web & Bộ Lọc Tìm Kiếm (Product & Search)
- [ ] **Mô tả:** Thay thế các dữ liệu sách đang viết cứng trong HTML bằng dữ liệu thật lấy từ Database.
- [ ] **Các chức năng cần viết:**
  1. **Trang chủ (`index.html`):** Viết truy vấn lấy top 4 sách bán chạy nhất và 4 sách mới nhất từ bảng `books` đổ ra thẻ sách.
  2. **Trang chi tiết (`product-detail.html`):** Lấy chi tiết cuốn sách theo ID (ví dụ: `product-detail.html?id=1`) hiển thị đúng tên, giá, tác giả, bảng thông số ISBN và ảnh.
  3. **Trang danh mục (`shop.html`):**
     - Hiển thị danh sách tất cả sách có phân trang (ví dụ mỗi trang 8 cuốn).
     - Xử lý bộ lọc: Bấm chọn danh mục nào thì chỉ hiện sách danh mục đó; Lọc theo mức giá (Dưới 100k, 100k - 200k...); Sắp xếp giá tăng/giảm dần.
  4. **Thanh tìm kiếm:** Lấy từ khóa người dùng nhập để tìm trong Database theo tên sách hoặc tên tác giả (`WHERE title LIKE %keyword%`).

---

### 🛒 MODULE 4: Giỏ Hàng & Xử Lý Đặt Hàng (Cart & Checkout)
- [ ] **Mô tả:** Xử lý quy trình mua hàng từ khi chọn sách đến khi tạo đơn hàng thành công.
- [ ] **Các chức năng cần viết:**
  1. **Giỏ hàng:**
     - Lưu giỏ hàng vào Session (hoặc Database).
     - Bấm "Thêm vào giỏ" ➔ Thêm sách và số lượng vào giỏ.
     - Trong trang `cart.html`: Có thể bấm tăng `+`, giảm `-`, xóa sách, tự động tính lại tổng tiền.
  2. **Đặt hàng (`checkout.html`):**
     - Nhận thông tin người nhận (Họ tên, SĐT, Địa chỉ, Ghi chú, Phương thức thanh toán COD / Chuyển khoản).
     - Khi bấm "Xác nhận đặt hàng" ➔ Lưu 1 dòng vào bảng `orders` và lưu từng món sách vào bảng `order_details`.
     - Tự động trừ số lượng sách tương ứng trong kho ở bảng `books`.
     - Xóa sạch giỏ hàng và chuyển khách hàng đến trang thông báo đặt hàng thành công.
  3. **Lịch sử mua hàng (`account.html`):**
     - Khách đăng nhập vào có thể xem lại danh sách các đơn hàng mình đã từng mua và trạng thái đơn hàng (*Đang xử lý, Đang giao, Đã giao*).

---

### ⚙️ MODULE 5: Trang Quản Trị Viên (Admin Panel)
- [ ] **Mô tả:** Xây dựng giao diện và chức năng dành riêng cho Admin quản lý cửa hàng (thầy cô chấm điểm phần này rất kỹ).
- [ ] **Các chức năng cần viết:**
  1. **Quản lý sách (CRUD Sách):**
     - Bảng danh sách tất cả sách (có phân trang, tìm kiếm).
     - Form thêm sách mới: Nhập tên, giá, chọn danh mục, chọn tác giả, tải file ảnh bìa từ máy tính lưu vào thư mục `images/`.
     - Sửa thông tin sách.
     - Xóa sách.
  2. **Quản lý danh mục:** Thêm, sửa, xóa các thể loại sách (Văn học, Kinh tế, Thiếu nhi...).
  3. **Quản lý đơn hàng:**
     - Xem danh sách tất cả đơn hàng khách vừa đặt.
     - Bấm xem chi tiết đơn: Khách mua những cuốn nào, tổng tiền bao nhiêu.
     - Cập nhật trạng thái đơn: *Chờ xác nhận ➔ Đang giao ➔ Hoàn thành ➔ Hủy đơn*.
  4. **Quản lý người dùng:** Xem danh sách khách hàng đã đăng ký.

---

### 🌟 MODULE 6: Thống Kê Doanh Thu & Báo Cáo Đồ Án (Hoàn Thiện)
- [ ] **Mô tả:** Hoàn thiện các tính năng nâng cao ghi điểm 10 và làm tài liệu nộp khoa.
- [ ] **Các chức năng cần viết:**
  1. **Thống kê Dashboard:** Vẽ biểu đồ doanh thu theo tháng hoặc top sách bán chạy nhất (dùng thư viện `Chart.js`).
  2. **Đánh giá / Bình luận:** Khách mua sách xong có thể để lại số sao và lời nhận xét lưu vào CSDL.
  3. **Kiểm thử (Test):** Kiểm tra các trường hợp nhập sai (để trống ô, nhập chữ vào ô số điện thoại, đặt hàng khi giỏ trống...) để hiển thị thông báo lỗi rõ ràng.
  4. **Tài liệu nộp:**
     - Soạn file báo cáo Đồ án (Word) theo mẫu của trường: Giới thiệu đề tài, phân tích quy tắc thiết kế (60-30-10, Responsive), sơ đồ CSDL, hình ảnh minh họa các chức năng.
     - Làm Slide thuyết trình (PowerPoint/Canva) để chuẩn bị bảo vệ trước thầy cô.

---

## 📁 CẤU TRÚC GIAO DIỆN HIỆN CÓ CỦA DỰ ÁN

```
Dự Án Cuối Kì/
├── index.html              # Giao diện Trang chủ (Banner, danh mục, sách nổi bật)
├── product-detail.html     # Giao diện Chi tiết sách (Chuẩn tỷ lệ 40/60, thông số ISBN)
├── shop.html               # Giao diện Cửa hàng (Sidebar bộ lọc đa năng)
├── cart.html               # Giao diện Giỏ hàng
├── checkout.html           # Giao diện Đặt hàng & Thanh toán
├── account.html            # Giao diện Tài khoản & Lịch sử đơn mua
├── about.html              # Giao diện Giới thiệu
├── contact.html            # Giao diện Liên hệ
├── css/
│   ├── style.css           # Toàn bộ CSS chuẩn bảng màu 60-30-10
│   └── responsive.css      # CSS tương thích màn hình Desktop, Tablet, Mobile
├── js/
│   ├── main.js             # Logic slider, tìm kiếm gợi ý, tabs
│   └── cart.js             # Logic giỏ hàng localStorage
└── README.md               # Bản mô tả công việc này
```
