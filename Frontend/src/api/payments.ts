import { api } from './httpClient';
import { ApiEnvelope, getResponseData } from './response';

interface PaymentSession {
  paymentUrl: string;
}

export const createPaymentSession = async (orderId: string): Promise<PaymentSession> => {
  const response = await api.post<ApiEnvelope<PaymentSession>>(
    `/payments/orders/${encodeURIComponent(orderId)}/session`
  );
  return getResponseData(response);
};
