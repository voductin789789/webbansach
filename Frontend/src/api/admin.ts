import { api } from './httpClient';
import { ApiEnvelope, getResponseData } from './response';

export type CouponType = 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  minimumOrder: number;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  active: boolean;
}

export interface SalesReport {
  period: { from: string; to: string };
  revenue: number;
  deliveredOrderCount: number;
  orderCount: number;
  customerCount: number;
  lowStockCount: number;
  dailyRevenue: Array<{ date: string; amount: number }>;
  bestsellers: Array<{ bookId: number; title: string; quantity: number; revenue: number }>;
  lowTurnoverCandidates: Array<{ id: number; title: string; stock: number; updatedAt: string }>;
}

export const getAdminCoupons = async (): Promise<Coupon[]> =>
  getResponseData(await api.get<ApiEnvelope<Coupon[]>>('/admin/coupons'));

export const createAdminCoupon = async (data: Omit<Coupon, 'id' | 'usedCount'>) =>
  getResponseData(await api.post<ApiEnvelope<Coupon>>('/admin/coupons', data));

export const updateAdminCoupon = async (id: number, data: Partial<Coupon>) =>
  getResponseData(await api.put<ApiEnvelope<Coupon>>(`/admin/coupons/${id}`, data));

export const deleteAdminCoupon = (id: number) => api.delete(`/admin/coupons/${id}`);

export const getLowStockBooks = async (threshold = 5) =>
  getResponseData(await api.get<ApiEnvelope<Array<{ id: number; title: string; stock: number }>>>(
    '/admin/inventory/low-stock', { params: { threshold } }
  ));

export const receiveInventory = async (data: { bookId: number; quantity: number; unitCost?: number; note?: string }) =>
  getResponseData(await api.post<ApiEnvelope<unknown>>('/admin/inventory/receive', data));

export const getSalesReport = async (from?: string, to?: string) =>
  getResponseData(await api.get<ApiEnvelope<SalesReport>>('/admin/reports/sales', { params: { from, to } }));

export interface AdminBlogPost {
  id: number;
  title: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  authorName: string;
  published: boolean;
}

export const getAdminBlogPosts = async () =>
  getResponseData(await api.get<ApiEnvelope<AdminBlogPost[]>>('/admin/blog'));

export const createAdminBlogPost = async (data: Omit<AdminBlogPost, 'id'>) =>
  getResponseData(await api.post<ApiEnvelope<AdminBlogPost>>('/admin/blog', data));

export const updateAdminBlogPost = async (id: number, data: Partial<AdminBlogPost>) =>
  getResponseData(await api.put<ApiEnvelope<AdminBlogPost>>(`/admin/blog/${id}`, data));

export const deleteAdminBlogPost = (id: number) => api.delete(`/admin/blog/${id}`);
