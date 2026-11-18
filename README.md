# WEBSITE BÁN SÁCH TRỰC TUYẾN — BOOKSTORE

> **Tài liệu duy nhất của dự án.** Gộp thông tin từ các README và hướng dẫn trong bản ZIP. Mã nguồn: `Backend` (Node.js, Express, TypeScript, Prisma, MySQL) và `Frontend` (React, Vite, TypeScript).

## 1. Tổng quan

Website hỗ trợ khách xem/tìm sách, giỏ hàng, mua ngay, thanh toán khi nhận hàng (COD), đăng ký/đăng nhập, xem đơn mua và theo dõi tiến trình giao hàng. Admin quản lý sách, danh mục, đơn hàng, tình trạng tồn kho và xem Dashboard.

- Dữ liệu gốc: **1.000 đầu sách / 9 danh mục** trong `Backend/src/data/books.json`.
- Bìa trong `Backend/upload/covers/`: khoảng **1.000 SVG minh họa**, **không phải ảnh bìa nhà xuất bản**. Chỉ thay bằng bìa xác thực đúng sách.
- Một số tên tác giả/mô tả chưa được xác minh (tài liệu trước ghi **778 sách** có tác giả “Đang cập nhật”). Không tự suy ra tác giả thật từ bìa minh họa. Admin có thể chỉnh tác giả trong Quản lý sách.
- **Kết nối:** React (`localhost:5173`) → REST API Express (`localhost:3000/api`) → Prisma → MySQL (`bookstore`). **Frontend không kết nối MySQL trực tiếp.**
- Giỏ hàng và trạng thái đăng nhập được lưu theo phiên tab trong `sessionStorage`; sách, tài khoản, đơn hàng, lịch sử trạng thái và tin nhắn liên hệ được lưu trên MySQL thông qua Backend.

## 2. Yêu cầu môi trường

- Windows + PowerShell, Node.js 22+ (khuyến nghị 24), npm và MySQL Server đang chạy.
- Chuẩn bị database `bookstore` và tài khoản MySQL có quyền trên database đó.
- Tạo/chỉnh `Backend/.env` từ `Backend/.env.example` hoặc sao chép từ bản đang chạy; không đưa `.env` hay mật khẩu lên GitHub. Tối thiểu cần `DATABASE_URL`, `JWT_SECRET` và cấu hình `CLIENT_URL` theo file mẫu.
- `DATABASE_URL` có cấu trúc: `mysql://root:<MAT_KHAU_MYSQL>@localhost:3306/bookstore` (thay `<MAT_KHAU_MYSQL>` bằng mật khẩu trên máy; các ký tự đặc biệt phải được URL-encode).
- Nếu cần, tạo `Frontend/.env` từ `Frontend/.env.example`, kiểm tra `VITE_API_URL` trỏ đến `http://localhost:3000/api`.

## 3. Cài đặt và chạy

### Bước 1 — Backend (terminal PowerShell thứ nhất)

```powershell
cd Backend
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

**Chú ý:** Trước khi chạy `prisma:push`, sao lưu database đang có dữ liệu. Lệnh này đồng bộ schema, bao gồm `categories.isActive`, `orders.clientRequestId`, `order_status_history`, `contact_messages` theo các bản cập nhật trước. **Không dùng `--force-reset`.** Nếu database đã đồng bộ và có sẵn 1.000 sách, thường chỉ cần `npm install`, `npm run prisma:generate`, `npm run dev`; **không cần chạy seed lại** mỗi lần. Seed có thể cập nhật một số trường mẫu; hãy sao lưu nếu đã chỉnh dữ liệu thủ công.

Kiểm tra API: `http://localhost:3000/api/health`.

### Bước 2 — Frontend (terminal PowerShell thứ hai)

```powershell
cd Frontend
npm install
npm run dev
```

Truy cập URL Vite in ra, thường là `http://localhost:5173`. Nếu làm việc từ thư mục gốc của dự án, các lệnh `cd Backend` và `cd Frontend` được chạy trong **hai terminal độc lập**.

### Lỗi MySQL P1000

Nếu báo `P1000 Authentication failed`, kiểm tra mật khẩu/tên người dùng trong `Backend/.env`, cổng `3306`, dịch vụ MySQL đang chạy và quyền truy cập vào `bookstore`. Nếu Windows không nhận lệnh `mysql`, có thể chạy client bằng đường dẫn MySQL Server cài sẵn hoặc dùng MySQL Workbench. Đừng đăng công khai nội dung `.env`.

## 4. Tài khoản và phân quyền

### Admin mặc định (chỉ phục vụ đồ án/demo nội bộ)

- Trang: `http://localhost:5173/login`
- Email: `admin@example.com`
- Mật khẩu demo: `BookStore@2026`
- Quyền: `ADMIN`

`npm run seed` tạo tài khoản mặc định nếu chưa có; **không đổi mật khẩu tài khoản đã tồn tại**. Nếu cần chủ động khôi phục mật khẩu cho đúng Admin mặc định trong môi trường phát triển:

```powershell
cd Backend
npm run admin:default
```

Theo tài liệu gốc, lệnh này không chạy khi `NODE_ENV=production` và không tự nâng CUSTOMER thành ADMIN. **Không dùng tài khoản/mật khẩu demo khi triển khai công khai; phải đổi mật khẩu và `JWT_SECRET`.**

### Tạo Admin bổ sung (tùy chọn)

```powershell
cd Backend
npm run prisma:generate
npm run admin:create
```

Nhập email mới, tên và mật khẩu >= 12 ký tự có chữ + số. Mật khẩu hiện khi nhập ở terminal nên tránh chia sẻ màn hình. Đăng ký công khai chỉ tạo CUSTOMER, không tự chọn ADMIN.

### Hai tab, hai tài khoản

JWT và thông tin phiên nằm trong `sessionStorage`, HTTP interceptor lấy token từ **tab hiện tại**. Để demo: `Ctrl+T` mở hai tab mới, tab 1 đăng nhập Admin, tab 2 đăng nhập Customer, rồi tải lại cả hai. Tránh **Duplicate Tab** vì có thể sao chép trạng thái ban đầu. Đăng xuất một tab không đăng xuất tab kia. Giỏ hàng cũng tách theo tab và người dùng, không lưu trong MySQL.

## 5. Các trang và tính năng khách hàng

| Đường dẫn | Chức năng |
| --- | --- |
| `/` | Trang chủ: banner, sách, danh mục từ API |
| `/books` | Danh sách sách: tìm kiếm/gợi ý, lọc theo tên danh mục, sắp xếp, phân trang |
| `/books/:id` | Chi tiết sách, chọn số lượng, Thêm vào giỏ, Mua ngay, sách liên quan |
| `/categories` | 9 danh mục chung với trang chủ |
| `/register`, `/login` | Đăng ký/đăng nhập thật qua API |
| `/profile` | Chỉnh hồ sơ và khối Đơn mua với ba mục |
| `/cart` | Giỏ hàng có ô nhập số lượng cùng nút +/-; đối chiếu tồn kho |
| `/checkout` | Thanh toán COD, mặc định thông tin người nhận từ tài khoản |
| `/my-orders` | Lịch sử và lọc theo trạng thái |
| `/my-orders/:id` | Chi tiết đơn, timeline, lịch sử trạng thái và hủy đơn khi được phép |
| `/about` | Giới thiệu cửa hàng |
| `/contact` | Biểu mẫu liên hệ lưu MySQL |

### Giỏ hàng, tồn kho và Mua ngay

- Trên chi tiết/thẻ sách có **Thêm vào giỏ** và **Mua ngay**; khi hết hàng hoặc đã đạt số lượng tối đa trong giỏ, không cho thêm vượt kho.
- `/cart`: khách nhập số lượng trực tiếp hoặc bấm +/-; khi nhập xong (Enter/rời ô), FE kiểm tra số nguyên dương và tồn kho từ API; cập nhật tổng tiền. Giỏ cũ vượt tồn kho được đối chiếu lại. Sách hết hàng không thể thanh toán.
- `/checkout`: điều chỉnh số lượng, đối chiếu kho lại trước khi gửi đơn. **Backend** vẫn tính giá từ DB và trừ kho có kiểm tra trong **transaction**; kiểm tra trên FE không thay thế bảo vệ Backend.
- **Mua ngay**: `/checkout?mode=buy-now`, chỉ mua mặt hàng vừa chọn, không làm mất giỏ hàng khác; nếu chưa đăng nhập thì trở lại sau khi login.
- Thông tin nhận hàng (tên, số điện thoại, địa chỉ nếu có) lấy từ hồ sơ qua `GET /api/auth/me`; khách có thể sửa *riêng trên đơn đó* mà không cập nhật ngược hồ sơ.

### Đơn mua và lịch sử trạng thái

- Ba mục trong `/profile`: **Chờ xác nhận** (`PENDING`), **Chờ lấy hàng** (`PROCESSING`), **Chờ giao hàng** (`SHIPPED`); số đếm là dữ liệu đơn thật của tài khoản từ API.
- `/my-orders` còn có bộ lọc Tất cả, Đã giao (`DELIVERED`), Đã hủy (`CANCELLED`), nút Quay lại và thông báo riêng cho danh sách trống ở từng bộ lọc.
- Timeline trạng thái hiển thị các mốc đã biết. Lịch sử được ghi trong `order_status_history` khi tạo/chuyển/hủy đơn. Đơn cũ tạo trước khi thêm bảng có thể **không có đầy đủ lịch sử cũ**.
- Không có GPS shipper hay bản đồ giao hàng thực tế.

### Liên hệ

- `POST /api/contact` nhận họ tên, email, chủ đề, nội dung và lưu `contact_messages` trong MySQL. **Chưa có** gửi email tự động, trang quản trị phản hồi liên hệ, hoặc thông tin liên hệ chính thức đã xác minh.

## 6. Quản trị Admin

| Đường dẫn | Chức năng |
| --- | --- |
| `/admin/dashboard` | Thẻ KPI, đơn gần đây, đơn cần xử lý từ API |
| `/admin/books` | Quản lý sách, ảnh, giá, tồn kho, tác giả |
| `/admin/categories` | Quản lý danh mục, trạng thái danh mục |
| `/admin/orders` | Danh sách/xử lý đơn, xem lịch sử, **Xác nhận tất cả** |

- Trạng thái: `PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED`; `PENDING` có thể → `CANCELLED` (khách hủy chỉ khi `PENDING`). Không cho chuyển ngược từ trạng thái kết thúc.
- Hủy đơn được hoàn tồn kho một lần trong transaction; hủy lại phải bị từ chối.
- **Xác nhận tất cả:** Nút trên `/admin/orders` hiển thị số đơn `PENDING`, hỏi xác nhận và gọi `PATCH /api/orders/confirm-all` (ADMIN). Chỉ cập nhật các đơn còn `PENDING` → `PROCESSING`, ghi lịch sử trong cùng transaction; không ảnh hưởng đơn `CANCELLED`, `SHIPPED`, `DELIVERED`.
- Số liệu doanh thu Dashboard theo tài liệu cũ chỉ tổng hợp trên **tối đa 100 đơn được tải**, chưa phải báo cáo doanh thu toàn hệ thống. Đơn đã hủy không được tính là doanh thu giao thành công.

## 7. API chính

Các API dùng tiền tố `http://localhost:3000/api` và thường trả `{ "success": true, "message": "...", "data": ... }`; danh sách có thể kèm `pagination`.

| Method | API | Phân quyền / mục đích |
| --- | --- | --- |
| `POST` | `/auth/register`, `/auth/login` | Public |
| `GET`, `PUT` | `/auth/me`, `/auth/profile` | Người dùng đăng nhập |
| `GET` | `/books`, `/books/:id`, `/categories` | Public |
| `POST`, `PUT`, `DELETE` | `/books`, `/books/:id` | ADMIN |
| `POST`, `PUT`, `DELETE`, `PATCH` | `/categories`, `/categories/:id`, `/categories/:id/status` | ADMIN |
| `POST` | `/orders` | Đăng nhập, tạo đơn COD (có thể gửi `clientRequestId` UUID để chống request lặp) |
| `GET` | `/orders/my-orders`, `/orders/:id` | Chủ đơn; Admin có thể xem chi tiết theo quyền Backend |
| `PATCH` | `/orders/:id/cancel` | Chủ đơn, chỉ `PENDING` |
| `GET` | `/orders` | ADMIN |
| `PATCH` | `/orders/:id/status` | ADMIN |
| `PATCH` | `/orders/confirm-all` | ADMIN, xác nhận hàng loạt |
| `POST` | `/contact` | Form liên hệ |

## 8. Kiểm tra chức năng sau khi chạy

1. **API/Database:** mở `/api/health`; kiểm tra `books`, `categories`, đăng nhập từ dữ liệu MySQL.
2. **Tìm sách:** `/books` tìm kiếm, chọn danh mục, phân trang; thử chi tiết, Thêm vào giỏ, Mua ngay.
3. **Giới hạn kho:** Admin đặt tồn kho một sách là `1`; Customer không thể thêm/tăng lên `2`. Đặt `0` thì nút thêm/mua bị khóa và checkout chặn. Nhập số `0`, `1.5`, số vượt kho vào giỏ phải bị xử lý.
4. **Checkout:** tên/điện thoại tự điền từ hồ sơ; sửa ở checkout không làm thay đổi hồ sơ. Tạo đơn COD và mở `/my-orders`.
5. **Đơn mua:** ba ô trên `/profile` và bộ lọc `/my-orders?status=PENDING` / `PROCESSING` / `SHIPPED`; kiểm tra nút Quay lại, timeline `/my-orders/:id`.
6. **Admin:** ở tab riêng, vào `/admin/orders` xác nhận từng đơn hoặc **Xác nhận tất cả**. Customer tải lại trang và thấy lịch sử/trạng thái mới.
7. **Hủy đơn:** thử hủy đơn `PENDING`, tồn kho trả lại; thử hủy lần hai phải bị từ chối (thường 409).
8. **Liên hệ:** gửi ở `/contact`, xem bảng trong MySQL Workbench:

```sql
USE bookstore;
SELECT id, name, email, subject, createdAt
FROM contact_messages
ORDER BY id DESC LIMIT 10;
```

> Bảng liên hệ chứa dữ liệu cá nhân, chỉ kiểm tra trong môi trường quản trị.

### Kiểm thử tích hợp (CHỈ database thử nghiệm riêng)

Bài test có thể tạo/hủy đơn và thay đổi tồn kho. **Không chạy trên DB `bookstore` đang sử dụng thật hoặc production.** Thiết lập DB test riêng, Customer thử nghiệm và một sách thử nghiệm:

```powershell
cd Backend
$env:TEST_CONFIRM="1"
$env:TEST_EMAIL="customer@example.com"
$env:TEST_PASSWORD="mat_khau_test"
$env:TEST_BOOK_ID="1"
npm run test:integration
```

Theo các hướng dẫn ban đầu, bài test kiểm tra tạo đơn trùng `clientRequestId` không trừ kho hai lần, hủy trả kho và hủy tiếp bị từ chối. Nếu thiếu biến `TEST_*`, test có thể được skip.

## 9. Giới hạn và lưu ý khi bàn giao

- **Chưa xác nhận end-to-end trên MySQL máy người dùng** trong các lần chỉnh sửa trước; cần kiểm tra thực tế bằng các bước ở mục 8.
- Không có thanh toán trực tuyến MoMo, VNPay hay chuyển khoản tự động: chỉ COD.
- Không có GPS giao hàng, trang quản trị khách hàng hoàn chỉnh hoặc hệ thống thống kê doanh thu đầy đủ theo thời gian.
- Ảnh bìa và nhiều dữ liệu sách vẫn mang tính minh họa; phải xác minh với nguồn xuất bản trước khi dùng thương mại.
- Khi chỉnh sửa `.env`, bảo mật mật khẩu MySQL và JWT secret. Không dùng tài khoản Admin demo trên Internet.
- **Dự án bàn giao chỉ giữ `README.md` làm tài liệu Markdown duy nhất.** Các thư mục `node_modules` (cài lại bằng `npm install`) và `.agents` (hướng dẫn trợ lý phát triển, không bắt buộc để chạy) không nằm trong ZIP gọn này.

## Giỏ hàng lưu MySQL (bản cập nhật mới)

Khi khách **đã đăng nhập**, giỏ hàng được lưu vào hai bảng Prisma có sẵn: `carts` và `cart_items`. Không cần tạo bảng mới. Giỏ của khách **chưa đăng nhập** được lưu tạm trong `sessionStorage` của tab; sau khi đăng nhập, FE gộp các sách này vào giỏ MySQL của tài khoản (giới hạn theo tồn kho). Giỏ của hai tài khoản không bị gộp lẫn, và cùng một tài khoản đăng nhập trên máy khác sẽ lấy giỏ từ MySQL.

### Các endpoint (đều cần `Authorization: Bearer <JWT>`)

| Phương thức | Endpoint | Chức năng / Body |
| --- | --- | --- |
| GET | `/api/cart` | Xem giỏ của người đang đăng nhập |
| POST | `/api/cart/items` | Thêm sách: `{ "bookId": 1, "quantity": 1 }` |
| PATCH | `/api/cart/items/1` | Đặt số lượng chính xác: `{ "quantity": 2 }` |
| DELETE | `/api/cart/items/1` | Xóa sách ID 1 khỏi giỏ |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ (API, nếu cần) |
| POST | `/api/cart/merge` | Gộp giỏ khách sau đăng nhập: `{ "items": [{ "bookId": 1, "quantity": 2 }] }` |

**Đặt hàng** qua `POST /api/orders` vẫn kiểm tra/trừ tồn kho trong transaction và trừ số lượng sách vừa mua khỏi `cart_items` (hoặc xóa dòng khi số lượng về 0) trong cùng transaction. Bước Mua ngay không được xóa hết những sách còn lại trong giỏ. `clearCart()` ở FE sau đặt hàng chỉ tải lại trạng thái giỏ do Backend đã cập nhật.

**Chạy bản cập nhật:** giữ `Backend/.env` chứa `DATABASE_URL`, chạy `npm install`, `npm run prisma:generate`, `npm run prisma:push` nếu hai bảng chưa tồn tại, rồi `npm run dev` ở Backend; mở terminal khác chạy `npm install` và `npm run dev` ở Frontend. Không chạy seed nếu MySQL đã có sẵn 1.000 cuốn sách. Không cần đặt mật khẩu MySQL ở FE.

**Kiểm tra thủ công:** đăng nhập Customer A, thêm hai sách, tải lại trang; đăng nhập Customer A ở một trình duyệt khác thì giỏ phải xuất hiện. Đăng nhập Customer B thì không thấy giỏ của A. Tạo đơn với một cuốn trong giỏ, xác nhận bảng `cart_items` đã xóa cuốn được mua nhưng giữ cuốn khác. Thử thêm vượt kho để xác minh API trả 409. Nếu giỏ chưa đăng nhập có sách, đăng nhập rồi kiểm tra việc gộp giỏ.

**Lưu ý:** JWT vẫn nằm ở `sessionStorage` để Admin và Customer có thể đăng nhập ở hai tab. Dữ liệu giỏ của tài khoản chỉ lưu ở MySQL; giữa các tab cùng tài khoản cần làm mới giỏ để thấy thay đổi từ tab khác. Chưa xác nhận kiểm thử tích hợp với MySQL thật trong môi trường tạo ZIP.
