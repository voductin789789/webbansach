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
  stock?: number; // Tồn kho gần nhất được lấy từ Backend/MySQL
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
}

export enum OrderStatus {
  PENDING = 'PENDING',       // Chờ xác nhận
  CONFIRMED = 'CONFIRMED',   // Đã xác nhận / Đã thanh toán
  SHIPPING = 'SHIPPING',     // Đang giao hàng
  COMPLETED = 'COMPLETED',   // Hoàn thành
  CANCELLED = 'CANCELLED',   // Đã hủy
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  itemsCount: number;
}
