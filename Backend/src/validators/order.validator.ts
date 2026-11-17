import { z } from 'zod';

export const createOrderSchema = z.object({
  recipientName: z.string().trim().min(2, 'Tên người nhận phải có ít nhất 2 ký tự'),
  recipientPhone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'),
  shippingAddress: z.string().trim().min(5, 'Địa chỉ giao hàng phải có ít nhất 5 ký tự'),
  paymentMethod: z.enum(['COD', 'VNPAY', 'MOMO', 'BANKING', 'CARD']).default('COD'),
  couponCode: z.string().trim().min(3).max(32).optional(),
  shippingProvince: z.string().trim().max(100).default(''),
  note: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        bookId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm'),
});

export const orderQuoteSchema = z.object({
  items: z.array(z.object({
    bookId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
  })).min(1),
  couponCode: z.string().trim().min(3).max(32).optional(),
  shippingProvince: z.string().trim().max(100).default(''),
});

export const shippingUpdateSchema = z.object({
  shippingProvider: z.string().trim().min(2).max(60),
  trackingCode: z.string().trim().min(2).max(100),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED']),
});

export const orderIdSchema = z.coerce.number().int().positive();

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});
