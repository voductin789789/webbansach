// src/types/index.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bookCount?: number;
  icon?: string;
  isActive?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  translator?: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  coverImage: string;
  rating: number;
  reviewCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  description?: string;
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  pages?: number;
  stock?: number;
  binding?: 'PAPERBACK' | 'HARDCOVER' | 'DUST_JACKET';
  weightGrams?: number;
  widthMm?: number;
  heightMm?: number;
  lengthMm?: number;
  backImage?: string;
  samplePdfUrl?: string;
  quote?: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  imageUrls: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ShippingQuote {
  subtotalPrice: number;
  shippingFee: number;
  discountAmount: number;
  totalPrice: number;
  shippingWeightGrams: number;
  couponCode?: string;
}

export interface CartItem {
  id?: string;
  bookId: string;
  title: string;
  author?: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  quantity: number;
  stock?: number;
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  loyaltyPoints?: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Order {
  id: string;
  orderCode: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  totalPrice: number;
  subtotalPrice?: number;
  shippingFee?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  trackingCode?: string;
  shippingProvider?: string;
  pointsAwarded?: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  bookId: string;
  title: string;
  coverImage?: string;
  price: number;
  quantity: number;
}
