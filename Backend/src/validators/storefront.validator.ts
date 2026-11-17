import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).default('Nhà riêng'),
  recipientName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^0\d{9}$/),
  province: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  ward: z.string().trim().min(2).max(100),
  addressLine: z.string().trim().min(5).max(255),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressSchema.partial();
export const numericIdSchema = z.coerce.number().int().positive();

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
  imageUrls: z.array(z.string().url()).max(4).default([]),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

const couponFieldsSchema = z.object({
  code: z.string().trim().min(3).max(32).transform((value) => value.toUpperCase()),
  type: z.enum(['PERCENT', 'FIXED', 'FREE_SHIPPING']),
  value: z.coerce.number().positive(),
  minimumOrder: z.coerce.number().nonnegative().default(0),
  maximumDiscount: z.coerce.number().positive().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  active: z.boolean().default(true),
});

export const couponSchema = couponFieldsSchema.refine(
  (coupon) => coupon.type !== 'PERCENT' || coupon.value <= 100,
  { message: 'Ưu đãi theo phần trăm không được vượt quá 100%', path: ['value'] }
).refine(
  (coupon) => !coupon.startsAt || !coupon.expiresAt || coupon.startsAt <= coupon.expiresAt,
  { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['expiresAt'] }
);

export const updateCouponSchema = couponFieldsSchema.partial().refine(
  (coupon) => coupon.type !== 'PERCENT' || coupon.value === undefined || coupon.value <= 100,
  { message: 'Ưu đãi theo phần trăm không được vượt quá 100%', path: ['value'] }
).refine(
  (coupon) => !coupon.startsAt || !coupon.expiresAt || coupon.startsAt <= coupon.expiresAt,
  { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['expiresAt'] }
);

export const receiveInventorySchema = z.object({
  bookId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().max(100000),
  unitCost: z.coerce.number().positive().optional(),
  note: z.string().trim().max(500).optional(),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().max(1000).optional(),
  content: z.string().trim().min(20),
  coverImage: z.string().url().optional(),
  authorName: z.string().trim().min(2).max(100),
  published: z.boolean().default(false),
});

export const updateBlogPostSchema = blogPostSchema.partial();

export type AddressInput = z.infer<typeof addressSchema>;
export type ReviewInput = z.infer<typeof createReviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type InventoryInput = z.infer<typeof receiveInventorySchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
