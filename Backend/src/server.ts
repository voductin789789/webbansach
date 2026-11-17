import { config } from './config/env';
import app from './app';
import prisma from './config/prisma';

const server = app.listen(config.PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${config.PORT}`);
  console.log(`Health check: http://localhost:${config.PORT}/api/health`);
});

let isShuttingDown = false;

const handleShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\nNhận tín hiệu ${signal}. Đang đóng các kết nối...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Đã ngắt kết nối Prisma Database và dừng server.');
    } catch (error) {
      console.error('Không thể đóng kết nối Prisma Database:', error);
      process.exitCode = 1;
    }
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

