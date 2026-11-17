import { PrismaClient } from '@prisma/client';
import { config } from './env';

const prisma = new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prisma;

