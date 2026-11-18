/**
 * Khởi tạo/khôi phục tài khoản Admin demo mặc định khi người dùng chủ động chạy lệnh.
 * Chỉ sử dụng trong môi trường development. Không dùng cho production.
 * Chạy: npm run admin:default
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma';

const EMAIL = 'admin@example.com';
const PASSWORD = 'BookStore@2026';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Không được khôi phục Admin mặc định ở môi trường production.');
  }
  const oldUser = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (oldUser && oldUser.role !== 'ADMIN') {
    throw new Error('Email mặc định đang thuộc tài khoản không phải Admin; từ chối nâng quyền tự động.');
  }
  const hashed = await bcrypt.hash(PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { password: hashed, name: 'Quản trị BookStore' },
    create: { email: EMAIL, name: 'Quản trị BookStore', password: hashed, role: 'ADMIN', cart: { create: {} } },
    select: { email: true, role: true },
  });
  console.log(`Đã thiết lập tài khoản mặc định: ${user.email} (${user.role}).`);
  console.log('Mật khẩu demo: BookStore@2026 — Hãy đổi ngay trước khi triển khai công khai.');
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
