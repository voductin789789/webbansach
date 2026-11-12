# webbansach
thiết kế web bán sách 
Cách chạy Website Bán Sách
1. Chạy Backend
Mở Terminal tại thư mục dự án:
cd Backend
npm install
npx prisma generate
npm run dev
Backend: http://localhost:3000
Kiểm tra: http://localhost:3000/api/health

Lưu ý: Trước khi chạy, cần có MySQL đang hoạt động và file Backend/.env với DATABASE_URL đúng tài khoản, mật khẩu và tên database trên máy.
2. Chạy Frontend
Mở Terminal khác tại thư mục dự án:
cd Frontend
npm install
npm run dev
Mở đường dẫn Vite hiển thị trong Terminal (thường là http://localhost:5173).

Lưu ý: Chỉ chạy được phần Frontend sau khi FE1 hoàn tất cấu hình React/Vite và package.json.