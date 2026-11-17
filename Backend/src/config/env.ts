import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().trim().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().trim().min(32, 'JWT_SECRET must contain at least 32 characters'),
  JWT_EXPIRES_IN: z.string().trim().min(1).default('7d'),
  CLIENT_URL: z.string().trim().min(1).default('http://localhost:5173,http://127.0.0.1:5173'),
});

export const config = envSchema.parse(process.env);

export const allowedClientOrigins = config.CLIENT_URL.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
