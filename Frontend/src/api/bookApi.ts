import { api } from './httpClient';
const backendOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '');
const coverUrl = (url?: string | null) => url?.startsWith('/uploads/') ? `${backendOrigin}${url}` : (url ?? '');
import type { Book } from '../types';
export interface ApiEnvelope<T> { success: boolean; message: string; data: T; pagination?: { page: number; limit: number; total: number; totalPages: number } }
export interface BackendBook { id: number; title: string; author: string; price: number; discountPrice?: number | null; coverImage?: string | null; description?: string | null; categoryId: number; category?: { name: string }; stock: number; publisher?: string | null; pages?: number | null; publicationYear?: number | null }
export const mapBook = (b: BackendBook): Book => ({
 id: String(b.id), title: b.title, author: b.author, price: b.discountPrice ?? b.price,
 originalPrice: b.discountPrice ? b.price : undefined, categoryId: String(b.categoryId),
 categoryName: b.category?.name, coverImage: coverUrl(b.coverImage), description: b.description ?? '',
 stock: b.stock, rating: 0, publisher: b.publisher ?? undefined, pages: b.pages ?? undefined,
 publishYear: b.publicationYear ?? undefined,
});
export async function fetchBooks(params: Record<string, string | number | undefined> = {}) {
 const { data } = await api.get<ApiEnvelope<BackendBook[]>>('/books', { params });
 return { books: data.data.map(mapBook), pagination: data.pagination };
}
export async function fetchBook(id: string) {
 const { data } = await api.get<ApiEnvelope<BackendBook>>(`/books/${id}`);
 return mapBook(data.data);
}
