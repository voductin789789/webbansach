# 📚 Dự Án Website Bán Sách Trực Tuyến - BookStore - Nhóm 9

Khung nền tảng dùng chung (Core Platform), Trang chủ (Home Page) và Quản trị Admin của **Nhóm 9**.

---

## 🎨 Quy Tắc Thiết Kế Áp Dụng (Design System)
- **Màu sắc chuẩn tỉ lệ 60 - 30 - 10**:
  - **60% Nền**: Trắng `#FFFFFF` / Sáng `#F8FAFC`
  - **30% Phụ & Điều hướng**: Xanh dương đậm `#2C3E50` (Header, Footer, Navigation, Headings)
  - **10% Nhấn & Kêu gọi hành động (CTA)**: Đỏ/Cam `#E74C3C` (Nút Mua ngay, Thêm giỏ, Giá sale, Badge)
- **Typography**: Font `Montserrat` (Tiêu đề) và `Open Sans` (Nội dung).
- **Responsive Grid 12 cột**:
  - Desktop (> 1024px): 4 sách/hàng
  - Tablet (768px - 1024px): 2 sách/hàng
  - Mobile (< 768px): 1 sách/hàng

---

## 🏗️ Cấu Trúc Thư Mục Dùng Chung

```
src/
├── api/
│   └── httpClient.ts          # Axios instance dùng chung, tự động gắn Bearer Token & bắt lỗi 401
├── components/
│   ├── common/
│   │   └── BookCard.tsx       # Thẻ sách dùng chung (hình ảnh zoom, giá, badge, thêm giỏ hàng)
│   ├── layout/
│   │   ├── Header.tsx         # Header, logo, thanh tìm kiếm thông minh, giỏ hàng, menu điều hướng
│   │   ├── Footer.tsx         # Chân trang đầy đủ thông tin liên hệ, chính sách, thanh toán
│   │   ├── MainLayout.tsx     # Khung layout cho khách hàng (Header + Content + Footer)
│   │   └── AdminLayout.tsx    # Khung layout cho Admin (Sidebar + Header + Content)
│   └── ui/                    # Bộ UI Component dùng chung (Skeleton)
│       ├── Button.tsx         # Button chuẩn 5 biến thể (primary, secondary, outline, danger, ghost), loading spinner
│       ├── Input.tsx          # Input có label, error message, left/right icon
│       ├── Modal.tsx          # Modal dialog popup
│       ├── Toast.tsx          # Toast thông báo (success, error, warning, info)
│       ├── Spinner.tsx        # Vòng xoay tải dữ liệu (sm, md, lg)
│       ├── Badge.tsx          # Nhãn hiển thị trạng thái đơn hàng và các tag
│       └── Skeleton.tsx       # Hiệu ứng shimmer loading chờ tải dữ liệu
├── data/
│   └── mockData.ts            # Dữ liệu mẫu (Categories, Books, Orders)
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx # Bảng điều khiển admin thống kê doanh thu, đơn hàng
│   │   ├── AdminCategories.tsx# Quản lý danh mục (CRUD, modal, tìm kiếm, sẵn sàng nối BE2)
│   │   ├── AdminBooks.tsx     # Placeholder Quản lý sách
│   │   └── AdminOrders.tsx    # Placeholder Quản lý đơn hàng
│   ├── HomePage.tsx           # Trang chủ hoàn chỉnh (Banner, Danh mục, Sách mới, Sách sale)
│   ├── BooksPage.tsx          # Trang danh sách tất cả sách
│   ├── BookDetailPage.tsx     # Trang chi tiết sản phẩm 40/60
│   ├── CategoriesPage.tsx     # Trang danh sách thể loại sách
│   ├── CartPage.tsx           # Trang giỏ hàng
│   ├── CheckoutPage.tsx       # Trang thanh toán
│   ├── LoginPage.tsx          # Trang đăng nhập (chọn role Admin hoặc Khách)
│   └── NotFound.tsx           # Trang lỗi 404
├── providers/
│   ├── AuthProvider.tsx       # Quản lý tài khoản đăng nhập, token, role (admin/customer)
│   └── CartProvider.tsx       # Quản lý giỏ hàng (thêm, sửa, xóa, tổng tiền, persist localStorage)
└── types/
    ├── index.ts               # Interface chuẩn: Book, Category, CartItem, User, Order, OrderStatus
    ├── badgeStatus.ts         # Mapping nhãn & màu sắc cho từng trạng thái đơn hàng
    └── formatVND.ts           # Hàm format tiền Việt (VD: 120.000 ₫)
```

---

## 🚀 Hướng Dẫn Chạy Website

```bash
# 1. Cài đặt các thư viện (đã cài đặt sẵn)
npm install

# 2. Chạy môi trường phát triển (Development)
npm run dev

# 3. Kiểm tra build production
npm run build
```
Truy cập trình duyệt tại: `http://localhost:5173`
