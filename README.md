# BookStore — Website bán sách trực tuyến

Frontend React/TypeScript được tổ chức theo các module FE1–FE4 trong tài liệu phân công. Mỗi trang, provider và API client giữ ở module riêng để các thành viên có thể tích hợp qua cùng hợp đồng dữ liệu.

## Cấu trúc Frontend

```text
Frontend/src/
├── api/                 # HTTP client, auth, catalog, orders, response và token storage
├── components/
│   ├── common/          # BookCard, BookCover, ProtectedRoute
│   ├── layout/          # Header/Footer, MainLayout, AdminLayout
│   └── ui/              # Button, Input, Modal, Toast, Spinner, Badge, Skeleton
├── pages/               # Home, books, categories, auth, cart/checkout, orders
│   └── admin/           # Dashboard, categories, books, orders
├── providers/           # AuthProvider và CartProvider
└── types/               # Book, Category, User, Order, trạng thái và format tiền
```

## Chạy dự án

Chạy Frontend trong terminal thứ nhất:

```bash
cd Frontend
npm install
npm run dev
npm run build
```

Frontend mặc định gọi API tại `http://localhost:5000/api`. Có thể cấu hình địa chỉ khác bằng cách sao chép `Frontend/.env.example` thành `Frontend/.env` và đặt biến `VITE_API_URL`.

Chạy Backend trong terminal khác theo hướng dẫn tại [Backend/README.md](./Backend/README.md); cần cấu hình MySQL và `JWT_SECRET` trước khi dùng các trang cần dữ liệu. Backend mặc định chạy ở cổng `5000`.

## Đưa mã nguồn lên GitHub

Không tải `node_modules`, `dist`, `.env` hoặc `.agents` lên GitHub. Các thư mục và tệp này đã được loại khỏi Git bằng `.gitignore`; giữ lại `package-lock.json`, mã nguồn và `.env.example`.

Để tránh giới hạn 100 tệp của nút **Upload files**, tạo repository trống trên GitHub (không thêm README), rồi mở terminal ngay tại thư mục dự án và chạy:

```bash
git init -b main
git add .
git status --short
git commit -m "Add bookstore application"
git remote add origin https://github.com/<username>/<repository>.git
git push -u origin main
```

Thay URL `origin` bằng địa chỉ repository của bạn. Trước khi commit, xác nhận `git status` không liệt kê `.env`, `node_modules` hoặc `dist`. Nếu vẫn dùng trang web để tải tệp thủ công, tải thành nhiều đợt, mỗi đợt dưới 100 tệp; không chọn các thư mục bị loại ở trên.

Không xóa `Frontend/src` hoặc `Backend/src` để giảm số lượng tệp: đây là mã nguồn ứng dụng. Tải mã nguồn lên GitHub cũng chưa tự triển khai website; cần cấu hình dịch vụ Frontend/Backend và biến môi trường theo nền tảng hosting.

## Hợp đồng tích hợp hiện tại

- Đăng ký/đăng nhập/hồ sơ: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/profile`.
- Sách/danh mục: `/api/books`, `/api/books/:id`, `/api/categories`. Danh sách sách hỗ trợ tìm kiếm, lọc danh mục/giá và phân trang từ Backend.
- Giỏ hàng được lưu ở `localStorage`; khi checkout, Frontend gửi `POST /api/orders` với phương thức COD. Backend là nguồn quyết định giá và tồn kho cuối cùng.
- Lịch sử/chi tiết đơn: `/api/orders/my-orders`, `/api/orders/:id`. Admin dùng `/api/orders` và `PATCH /api/orders/:id/status`; Backend chỉ cho phép chuyển trạng thái theo thứ tự.
- CRUD Admin sách/danh mục gọi các route hiện có dưới `/api/books` và `/api/categories`; quyền Admin vẫn do Backend kiểm tra.
- Khách có thể hủy đơn `PENDING`; Admin có thể hủy đơn `PENDING` hoặc `PROCESSING`. Backend hoàn tồn kho an toàn trong transaction.
- COD là phương thức thanh toán duy nhất được bật trong giao diện; các phương thức khác chưa được tích hợp.

Token và thông tin người dùng được quản lý tập trung bởi `AuthProvider`/`tokenStorage`; không có tài khoản mẫu hoặc JWT giả trong luồng đăng nhập.

## Tổ chức mã nguồn

Frontend TypeScript nằm theo vai trò trong `Frontend/src` (`api`, `components`, `pages`, `providers`, `types`); Backend nằm theo lớp trong `Backend/src` (`routes`, `controllers`, `services`, `validators`, `middlewares`, `config`, `utils`). Các script JavaScript cũ được gom riêng dưới `scripts/legacy` và không được nạp vào ứng dụng React hiện tại.
