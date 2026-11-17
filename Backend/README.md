# Backend BookStore

## Chạy local

1. Bật MySQL và tạo database `bookstore`.
2. Tạo `Backend/.env` từ `.env.example`, rồi cập nhật `DATABASE_URL` và `JWT_SECRET` bằng giá trị riêng cho máy local. Không dùng JWT secret mẫu ở production; file `.env` đã được gitignore.
3. Chạy các lệnh tại thư mục `Backend`:

```bash
npm ci
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

API mặc định chạy tại `http://localhost:5000/api`, cùng cổng mặc định Frontend. `CLIENT_URL` nhận một hoặc nhiều origin, phân cách bằng dấu phẩy.

### Nếu dùng XAMPP trên Windows

1. Nếu `root` không có mật khẩu, giới hạn MySQL chỉ lắng nghe tại `127.0.0.1` trong `C:\xampp\mysql\bin\my.ini` (`bind-address=127.0.0.1` dưới `[mysqld]`), rồi khởi động MySQL trong XAMPP Control Panel. Không để tài khoản không mật khẩu truy cập được từ mạng.
2. Tạo database:

```sql
CREATE DATABASE bookstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Nếu tài khoản `root` không có mật khẩu, đặt `DATABASE_URL=mysql://root@127.0.0.1:3306/bookstore`. Nếu có mật khẩu, cập nhật URL theo thông tin MySQL của bạn và URL-encode các ký tự đặc biệt trong mật khẩu.
4. Tạo JWT secret ngẫu nhiên dài tối thiểu 32 ký tự; không chia sẻ hoặc commit secret này.

`npm run seed` chỉ dùng cho môi trường local/demo; lệnh này thêm dữ liệu mẫu và không thay thế các bản ghi đã tồn tại.

## API chính

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/profile`
- `GET /books`, `GET /books/:id`, `GET /books/slug/:slug`; tạo/sửa/xóa sách cần quyền Admin
- `GET /categories`; tạo/sửa/xóa danh mục cần quyền Admin. Không thể xóa danh mục còn sách.
- `POST /orders` tạo đơn COD; `GET /orders/my-orders`, `GET /orders/:id`
- `PATCH /orders/:id/cancel` hủy đơn của khách khi `PENDING`; Admin có thể hủy khi `PENDING` hoặc `PROCESSING`. Hủy và hoàn tồn kho dùng chung transaction, không thể hoàn kho hai lần.
- `GET /orders` và `PATCH /orders/:id/status` dành cho Admin. Trạng thái chỉ chuyển lần lượt `PENDING → PROCESSING → SHIPPED → DELIVERED`; không thể dùng endpoint này để hủy.

Phản hồi thành công theo dạng `{ success, message, data, pagination? }`; lỗi nghiệp vụ trả mã HTTP cụ thể, gồm `400`, `401`, `403`, `404` và `409`.

## Kiểm tra

```bash
npm test
npm run build
```
