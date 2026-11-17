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

## Chuẩn bị triển khai Backend trên Railway

1. Tạo project Railway và thêm dịch vụ **MySQL**.
2. Thêm dịch vụ Node.js từ repository này, đặt **Root Directory** là `/Backend`.
3. Đặt Build Command là `npm ci --include=dev && npm run prisma:generate && npm run build`, Start Command là `npm start`, và Healthcheck Path là `/api/health`.
4. Thêm các biến cho dịch vụ Backend:
   - `NODE_ENV=production`
   - `DATABASE_URL`: tham chiếu biến `MYSQL_URL` của dịch vụ MySQL trong cùng project.
   - `JWT_SECRET`: chuỗi ngẫu nhiên riêng dài tối thiểu 32 ký tự; tạo trong Railway, không gửi hoặc commit.
   - `CLIENT_URL=https://voductin789789.github.io`
   - `PORT` do Railway tự cấp.
5. Ở **Pre-deploy Command**, chạy `npm run prisma:push && npm run seed:catalog` để tạo schema và nạp danh mục/sách mẫu. Dùng `seed:catalog` thay cho `seed` trên môi trường công khai để không tạo tài khoản Admin bằng mật khẩu demo. Lệnh pre-deploy chạy mỗi lần deploy; sau lần đầu thành công, xóa lệnh này khỏi Settings. Không chạy `prisma:push` về sau nếu chưa kiểm tra thay đổi schema và có backup.
6. Sau khi Backend có domain công khai, đặt GitHub Actions variable `VITE_API_URL` bằng `https://<domain-backend>/api`, rồi chạy lại workflow **Deploy frontend to GitHub Pages**.
7. Để bật cổng thanh toán sandbox, cấu hình các biến `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_RETURN_URL`, `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_RETURN_URL` và `MOMO_NOTIFY_URL` trong Railway. Đặt `PAYMENT_RESULT_URL` tới route `/order-success` của GitHub Pages; đăng ký IPN URL VNPay `https://<domain-backend>/api/payments/vnpay/ipn` trong tài khoản merchant. Không đưa khóa vào repository hoặc gửi qua chat. VNPay/MoMo chỉ dùng sandbox tới khi merchant được cấp thông tin production.

Seed hiện có giá và tồn kho mẫu, nhưng chưa có ảnh bìa thật: đa số `coverImage` rỗng và một vài đường dẫn `/uploads/...` không có file trong repository. Giao diện sẽ dùng bìa minh họa thay thế cho tới khi cập nhật ảnh hợp lệ. Không dùng các dữ liệu giá mẫu để bán hàng thật.

Để tạo Admin production, hãy đăng ký tài khoản của bạn trên website rồi đổi vai trò đúng email trong Railway MySQL query editor; không dùng tài khoản/mật khẩu demo từ `users.json`.

## API chính

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/profile`
- `GET /books`, `GET /books/:id`, `GET /books/slug/:slug`; tạo/sửa/xóa sách cần quyền Admin
- `GET /categories`; tạo/sửa/xóa danh mục cần quyền Admin. Không thể xóa danh mục còn sách.
- `POST /orders` tạo đơn; `GET /orders/my-orders`, `GET /orders/:id`. Đơn online chỉ được đánh dấu đã thanh toán khi callback VNPay/MoMo có chữ ký hợp lệ và khớp mã đơn/số tiền.
- `PATCH /orders/:id/cancel` hủy đơn của khách khi `PENDING`; Admin có thể hủy khi `PENDING` hoặc `PROCESSING`. Hủy và hoàn tồn kho dùng chung transaction, không thể hoàn kho hai lần.
- `GET /orders` và `PATCH /orders/:id/status` dành cho Admin. Trạng thái chỉ chuyển lần lượt `PENDING → PROCESSING → SHIPPED → DELIVERED`; không thể dùng endpoint này để hủy.
- `POST /payments/orders/:id/session` tạo URL thanh toán VNPay/MoMo sau khi kiểm tra chủ đơn; các callback `/payments/vnpay/{return,ipn}` và `/payments/momo/{return,ipn}` xác thực chữ ký và đối chiếu mã đơn/số tiền trước khi cập nhật trạng thái.

Phản hồi thành công theo dạng `{ success, message, data, pagination? }`; lỗi nghiệp vụ trả mã HTTP cụ thể, gồm `400`, `401`, `403`, `404` và `409`.

## Kiểm tra

```bash
npm test
npm run build
```
