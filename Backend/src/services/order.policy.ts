import type { UserRole } from '../types';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ForwardOrderStatus = Exclude<OrderStatus, 'CANCELLED' | 'PENDING'>;

const nextOrderStatus: Partial<Record<OrderStatus, ForwardOrderStatus>> = {
  PENDING: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

export const getNextOrderStatus = (status: OrderStatus): ForwardOrderStatus | undefined =>
  nextOrderStatus[status];

export const canCancelOrder = (status: OrderStatus, role: UserRole): boolean => {
  if (role === 'ADMIN') {
    return status === 'PENDING' || status === 'PROCESSING';
  }
  return status === 'PENDING';
};
