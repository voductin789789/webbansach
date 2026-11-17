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
  PAYMENT_RESULT_URL: z.string().url().default('http://localhost:5173/order-success'),
  VNPAY_TMN_CODE: z.string().trim().optional(),
  VNPAY_HASH_SECRET: z.string().trim().optional(),
  VNPAY_URL: z.string().url().refine((value) => new URL(value).protocol === 'https:').default('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
  VNPAY_RETURN_URL: z.string().url().optional(),
  MOMO_PARTNER_CODE: z.string().trim().optional(),
  MOMO_ACCESS_KEY: z.string().trim().optional(),
  MOMO_SECRET_KEY: z.string().trim().optional(),
  MOMO_API_URL: z.string().url().refine((value) => new URL(value).protocol === 'https:').default('https://test-payment.momo.vn/v2/gateway/api/create'),
  MOMO_RETURN_URL: z.string().url().optional(),
  MOMO_NOTIFY_URL: z.string().url().optional(),
});

export const config = envSchema.parse(process.env);

export const allowedClientOrigins = config.CLIENT_URL.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
