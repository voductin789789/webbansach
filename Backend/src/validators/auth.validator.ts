import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Tên người dùng phải có ít nhất 2 ký tự'),
  email: z.string().trim().email('Email không đúng định dạng').toLowerCase(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email không đúng định dạng').toLowerCase(),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Tên người dùng phải có ít nhất 2 ký tự').optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  avatar: z.string().trim().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

