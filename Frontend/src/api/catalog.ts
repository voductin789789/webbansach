import { Book, Category, Review } from '../types';
import { API_BASE_URL, api } from './httpClient';
import { ApiEnvelope, getResponseData } from './response';

interface ApiCategory {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { books: number };
}

export interface ApiBook {
  id: number | string;
  title: string;
  author: string;
  translator?: string | null;
  categoryId: number | string;
  category?: ApiCategory;
  price: number;
  discountPrice?: number | null;
  coverImage?: string | null;
  stock: number;
  description?: string | null;
  pages?: number | null;
  publisher?: string | null;
  publicationYear?: number | null;
  isbn?: string | null;
  binding?: Book['binding'] | null;
  weightGrams?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  lengthMm?: number | null;
  backImage?: string | null;
  samplePdfUrl?: string | null;
  quote?: string | null;
  createdAt?: string;
  reviews?: Array<{
    id?: number;
    userId?: number;
    rating: number;
    comment?: string | null;
    imageUrls?: string[] | null;
    verifiedPurchase?: boolean;
    helpfulCount?: number;
    createdAt?: string;
    user?: { id?: number; name?: string };
  }>;
}

export interface BookQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: 'createdAt' | 'price' | 'title' | 'bestselling' | 'rating';
  sortOrder?: 'asc' | 'desc';
  translator?: string;
  publisher?: string;
  isbn?: string;
  binding?: Book['binding'];
}

export interface BookPage {
  books: Book[];
  page: number;
  totalPages: number;
  total: number;
}

const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');

export const assetUrl = (path?: string | null): string => {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return path.startsWith('/') ? `${apiOrigin}${path}` : path;
};

const mapCategory = (category: ApiCategory): Category => ({
  id: String(category.id),
  name: category.name,
  slug: category.slug,
  description: category.description || undefined,
  bookCount: category._count?.books ?? 0,
});

export const mapApiBook = (book: ApiBook): Book => {
  const discountPrice = book.discountPrice ?? undefined;
  const originalPrice = discountPrice ? book.price : undefined;
  const price = discountPrice ?? book.price;

  return {
    id: String(book.id),
    title: book.title,
    author: book.author,
    translator: book.translator || undefined,
    categoryId: String(book.categoryId),
    categoryName: book.category?.name,
    price,
    originalPrice,
    discountPercent: originalPrice
      ? Math.round((1 - price / originalPrice) * 100)
      : undefined,
    coverImage: assetUrl(book.coverImage),
    rating: book.reviews?.length
      ? book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length
      : 0,
    reviewCount: book.reviews?.length ?? 0,
    reviews: book.reviews?.flatMap((review): Review[] =>
      review.id && review.user
        ? [{
            id: String(review.id),
            userId: String(review.user.id ?? review.userId ?? ''),
            userName: review.user.name ?? 'Độc giả',
            rating: review.rating,
            comment: review.comment || undefined,
            imageUrls: review.imageUrls || [],
            verifiedPurchase: review.verifiedPurchase ?? false,
            helpfulCount: review.helpfulCount ?? 0,
            createdAt: review.createdAt ?? '',
          }]
        : []
    ),
    description: book.description || undefined,
    isbn: book.isbn || undefined,
    publisher: book.publisher || undefined,
    publishYear: book.publicationYear ?? undefined,
    pages: book.pages ?? undefined,
    stock: book.stock,
    binding: book.binding || undefined,
    weightGrams: book.weightGrams ?? undefined,
    widthMm: book.widthMm ?? undefined,
    heightMm: book.heightMm ?? undefined,
    lengthMm: book.lengthMm ?? undefined,
    backImage: assetUrl(book.backImage),
    samplePdfUrl: assetUrl(book.samplePdfUrl),
    quote: book.quote || undefined,
    isNew: book.createdAt
      ? Date.now() - new Date(book.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
      : false,
  };
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<ApiEnvelope<ApiCategory[]>>('/categories');
  return getResponseData(response).map(mapCategory);
};

export const getBooks = async (query: BookQuery = {}): Promise<BookPage> => {
  const params = {
    ...query,
    categoryId: query.categoryId ? Number(query.categoryId) : undefined,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
  };
  const response = await api.get<ApiEnvelope<ApiBook[]>>('/books', { params });
  return {
    books: getResponseData(response).map(mapApiBook),
    page: response.data.pagination?.page ?? 1,
    totalPages: response.data.pagination?.totalPages ?? 1,
    total: response.data.pagination?.total ?? 0,
  };
};

export const getBook = async (id: string): Promise<Book> => {
  const response = await api.get<ApiEnvelope<ApiBook>>(`/books/${encodeURIComponent(id)}`);
  return mapApiBook(getResponseData(response));
};

