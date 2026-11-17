import { Order, OrderItem, OrderStatus } from '../types';
import { api } from './httpClient';
import { ApiEnvelope, getResponseData } from './response';

interface ApiOrder {
  id: number | string;
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
  trackingCode?: string | null;
  shippingProvider?: string | null;
  pointsAwarded?: number;
  orderStatus: OrderStatus;
  createdAt: string;
  items: Array<{
    id: number | string;
    bookId: number | string;
    quantity: number;
    price: number;
    book?: {
      title: string;
      coverImage?: string | null;
    };
  }>;
}

const mapOrderItem = (item: ApiOrder['items'][number]): OrderItem => ({
  id: String(item.id),
  bookId: String(item.bookId),
  title: item.book?.title || 'Sách',
  coverImage: item.book?.coverImage || undefined,
  price: item.price,
  quantity: item.quantity,
});

export const mapApiOrder = (order: ApiOrder): Order => ({
  id: String(order.id),
  orderCode: order.orderCode,
  recipientName: order.recipientName,
  recipientPhone: order.recipientPhone,
  shippingAddress: order.shippingAddress,
  totalPrice: order.totalPrice,
  subtotalPrice: order.subtotalPrice,
  shippingFee: order.shippingFee,
  discountAmount: order.discountAmount,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  trackingCode: order.trackingCode || undefined,
  shippingProvider: order.shippingProvider || undefined,
  pointsAwarded: order.pointsAwarded,
  status: order.orderStatus,
  createdAt: order.createdAt,
  items: order.items.map(mapOrderItem),
});

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get<ApiEnvelope<ApiOrder[]>>('/orders/my-orders');
  return getResponseData(response).map(mapApiOrder);
};

export const simulatePayment = async (id: string): Promise<Order> => {
  const response = await api.post<ApiEnvelope<ApiOrder>>(
    `/orders/${encodeURIComponent(id)}/sandbox-payment`
  );
  return mapApiOrder(getResponseData(response));
};

export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get<ApiEnvelope<ApiOrder>>(`/orders/${encodeURIComponent(id)}`);
  return mapApiOrder(getResponseData(response));
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const response = await api.patch<ApiEnvelope<ApiOrder>>(
    `/orders/${encodeURIComponent(id)}/cancel`
  );
  return mapApiOrder(getResponseData(response));
};

export const updateOrderTracking = async (id: string, shippingProvider: string, trackingCode: string): Promise<Order> => {
  const response = await api.patch<ApiEnvelope<ApiOrder>>(
    `/orders/${encodeURIComponent(id)}/tracking`,
    { shippingProvider, trackingCode }
  );
  return mapApiOrder(getResponseData(response));
};

export const getAdminOrders = async (page = 1, limit = 20) => {
  const response = await api.get<ApiEnvelope<ApiOrder[]>>('/orders', { params: { page, limit } });
  return {
    orders: getResponseData(response).map(mapApiOrder),
    pagination: response.data.pagination,
  };
};
