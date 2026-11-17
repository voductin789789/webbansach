import { z } from 'zod';

const bookFieldsSchema = z.object({
  title: z.string().trim().min(1, 'Tên sách không được để trống'),
  author: z.string().trim().min(1, 'Tên tác giả không được để trống'),
  translator: z.string().trim().optional(),
  description: z.string().optional(),
  quote: z.string().optional(),
  price: z.coerce.number().positive('Giá sách phải lớn hơn 0'),
  discountPrice: z.coerce.number().positive('Giá khuyến mãi phải lớn hơn 0').optional(),
  stock: z.coerce.number().int().nonnegative('Số lượng tồn kho không được âm').default(0),
  coverImage: z.string().optional(),
  backImage: z.string().optional(),
  samplePdfUrl: z.string().url().optional(),
  isbn: z.string().trim().min(10).max(20).optional(),
  pages: z.coerce.number().int().positive().optional(),
  publisher: z.string().optional(),
  publicationYear: z.coerce.number().int().optional(),
  binding: z.enum(['PAPERBACK', 'HARDCOVER', 'DUST_JACKET']).optional(),
  weightGrams: z.coerce.number().int().positive().optional(),
  widthMm: z.coerce.number().int().positive().optional(),
  heightMm: z.coerce.number().int().positive().optional(),
  lengthMm: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive('Danh mục không hợp lệ'),
});

export const createBookSchema = bookFieldsSchema.refine(
  (book) => book.discountPrice === undefined || book.discountPrice < book.price,
  {
    message: 'Giá khuyến mãi phải thấp hơn giá gốc',
    path: ['discountPrice'],
  }
);

export const updateBookSchema = bookFieldsSchema.partial();
export const bookIdSchema = z.coerce.number().int().positive();

export const queryBookSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['createdAt', 'price', 'title', 'bestselling', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  translator: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
  isbn: z.string().trim().optional(),
  binding: z.enum(['PAPERBACK', 'HARDCOVER', 'DUST_JACKET']).optional(),
}).refine(
  (query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice,
  { message: 'Giá thấp nhất không được lớn hơn giá cao nhất', path: ['maxPrice'] }
);

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type QueryBookInput = z.infer<typeof queryBookSchema>;

