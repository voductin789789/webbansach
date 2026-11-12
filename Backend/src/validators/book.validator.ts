import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Tên sách không được để trống'),
  author: z.string().min(1, 'Tên tác giả không được để trống'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Giá sách phải lớn hơn 0'),
  discountPrice: z.coerce.number().positive('Giá khuyến mãi phải lớn hơn 0').optional(),
  stock: z.coerce.number().int().nonnegative('Số lượng tồn kho không được âm').default(0),
  coverImage: z.string().optional(),
  pages: z.coerce.number().int().positive().optional(),
  publisher: z.string().optional(),
  publicationYear: z.coerce.number().int().optional(),
  categoryId: z.coerce.number().int().positive('Danh mục không hợp lệ'),
});

export const updateBookSchema = createBookSchema.partial();

export const queryBookSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['createdAt', 'price', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type QueryBookInput = z.infer<typeof queryBookSchema>;

