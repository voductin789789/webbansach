// src/types/badgeStatus.ts
import { OrderStatus } from './index';

export interface StatusBadgeConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const orderStatusMap: Record<OrderStatus, StatusBadgeConfig> = {
  [OrderStatus.PENDING]: {
    label: 'Chờ xác nhận',
    bgColor: '#FFFBEB',
    textColor: '#B45309',
    borderColor: '#FDE68A',
  },
  [OrderStatus.PROCESSING]: {
    label: 'Đang xử lý',
    bgColor: '#EFF6FF',
    textColor: '#1D4ED8',
    borderColor: '#BFDBFE',
  },
  [OrderStatus.SHIPPED]: {
    label: 'Đang giao hàng',
    bgColor: '#F0FDF4',
    textColor: '#15803D',
    borderColor: '#BBF7D0',
  },
  [OrderStatus.DELIVERED]: {
    label: 'Hoàn thành',
    bgColor: '#ECFDF5',
    textColor: '#047857',
    borderColor: '#A7F3D0',
  },
  [OrderStatus.CANCELLED]: {
    label: 'Đã hủy',
    bgColor: '#FEF2F2',
    textColor: '#B91C1C',
    borderColor: '#FECACA',
  },
};
