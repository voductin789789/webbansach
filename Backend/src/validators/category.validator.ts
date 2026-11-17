import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Tên danh mục không được để trống'),
  slug: z.string().trim().min(1, 'Slug không được để trống'),
  description: z.string().optional(),
});

export const updateCategorySchema = categorySchema.partial().refine(
  (category) => Object.keys(category).length > 0,
  { message: 'Cần cung cấp ít nhất một thông tin để cập nhật' }
);

export const categoryIdSchema = z.coerce.number().int().positive();
