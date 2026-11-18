/**
 * Tạo thêm tài khoản ADMIN mà không sửa tài khoản hiện có.
 * Chạy: npm run admin:create
 * Cần Backend/.env có DATABASE_URL hợp lệ và đã chạy prisma:push.
 */
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma';

async function main() {
  const rl = createInterface({ input, output });
  let email = '';
  let name = '';
  let password = '';
  try {
    console.log('=== TAO TAI KHOAN ADMIN THU HAI ===');
    email = (await rl.question('Email Admin moi: ')).trim().toLowerCase();
    name = (await rl.question('Ten hien thi: ')).trim();
    password = await rl.question('Mat khau moi (hien khi go, khong chia se man hinh): ');
  } finally {
    rl.close();
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email khong hop le.');
  if (name.length < 2 || name.length > 100) throw new Error('Ten phai tu 2 den 100 ky tu.');
  if (password.length < 12 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('Mat khau can tu 12 ky tu, co chu va so.');
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existing) {
    throw new Error(`Email ${email} da ton tai (vai tro: ${existing.role}). Khong tu dong nang quyen tai khoan cu.`);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword, role: 'ADMIN', cart: { create: {} } },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log(`Da tao thanh cong: ${user.email} | ${user.name} | ${user.role} | ID ${user.id}`);
  console.log('Dang nhap bang email va mat khau vua nhap. Khong can chay lai seed.');
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
