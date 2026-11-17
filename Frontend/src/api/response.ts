import { AxiosError, AxiosResponse } from 'axios';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getResponseData = <T>(response: AxiosResponse<ApiEnvelope<T>>) =>
  response.data.data;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === 'string') return responseMessage;
    if (error.request && !error.response) {
      return 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
    }
  }
  return fallback;
};
