// src/types/formatVND.ts

/**
 * Format số tiền thành chuỗi tiền tệ Việt Nam (Ví dụ: 120.000 ₫)
 */
export const formatVND = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

export default formatVND;
