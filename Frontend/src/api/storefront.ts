import { Book, Review, ShippingQuote } from '../types';
import { ApiEnvelope, getResponseData } from './response';
import { ApiBook, assetUrl, mapApiBook } from './catalog';
import { api } from './httpClient';

export interface Address {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressLine: string;
  isDefault: boolean;
}

interface ApiWishlistItem {
  book: ApiBook;
}

interface ApiReview {
  id: number;
  userId: number;
  rating: number;
  comment?: string | null;
  imageUrls?: string[] | null;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  user: { name: string };
}

export const getWishlist = async (): Promise<Book[]> => {
  const response = await api.get<ApiEnvelope<ApiWishlistItem[]>>('/storefront/wishlist');
  return getResponseData(response).map((item) => mapApiBook(item.book));
};

export const addToWishlist = (bookId: string) =>
  api.post(`/storefront/wishlist/${encodeURIComponent(bookId)}`);

export const removeFromWishlist = (bookId: string) =>
  api.delete(`/storefront/wishlist/${encodeURIComponent(bookId)}`);

export const getAddresses = async (): Promise<Address[]> => {
  const response = await api.get<ApiEnvelope<Address[]>>('/storefront/addresses');
  return getResponseData(response);
};

export const saveAddress = async (address: Omit<Address, 'id'>, id?: number): Promise<Address> => {
  const response = id
    ? await api.put<ApiEnvelope<Address>>(`/storefront/addresses/${id}`, address)
    : await api.post<ApiEnvelope<Address>>('/storefront/addresses', address);
  return getResponseData(response);
};

export const deleteAddress = (id: number) => api.delete(`/storefront/addresses/${id}`);

export const createReview = async (
  bookId: string,
  input: { rating: number; comment: string; imageUrls: string[] }
): Promise<Review> => {
  const response = await api.post<ApiEnvelope<ApiReview>>(
    `/storefront/books/${encodeURIComponent(bookId)}/reviews`,
    input
  );
  const review = getResponseData(response);
  return {
    id: String(review.id),
    userId: String(review.userId),
    userName: review.user.name,
    rating: review.rating,
    comment: review.comment || undefined,
    imageUrls: (review.imageUrls || []).map((image) => assetUrl(image)),
    verifiedPurchase: review.verifiedPurchase,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt,
  };
};

export const markReviewHelpful = (reviewId: string) =>
  api.post(`/storefront/reviews/${encodeURIComponent(reviewId)}/helpful`);

export const uploadReviewImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('reviewImage', file);
  const response = await api.post<ApiEnvelope<{ url: string }>>('/storefront/review-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return assetUrl(getResponseData(response).url);
};

export const getOrderQuote = async (input: {
  items: Array<{ bookId: number; quantity: number }>;
  couponCode?: string;
  shippingProvince: string;
}): Promise<ShippingQuote> => {
  const response = await api.post<ApiEnvelope<ShippingQuote>>('/orders/quote', input);
  return getResponseData(response);
};

export const subscribeNewsletter = (email: string) =>
  api.post('/newsletter', { email });

export const validateCoupon = async (code: string, input: {
  items: Array<{ bookId: number; quantity: number }>;
  shippingProvince: string;
}): Promise<ShippingQuote> => getOrderQuote({ ...input, couponCode: code });
