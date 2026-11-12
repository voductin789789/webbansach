import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './config/prisma';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

// Xử lý đóng kết nối an toàn khi tắt server
const handleShutdown = async (signal: string) => {
  console.log(`\nNhận tín hiệu ${signal}. Đang đóng các kết nối...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Đã ngắt kết nối Prisma Database và dừng server.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

