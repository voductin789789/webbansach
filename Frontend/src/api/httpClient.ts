// src/api/httpClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from '../components/ui/Toast';
import { tokenStorage } from './tokenStorage';

// URL cơ sở của backend API (hỗ trợ biến môi trường Vite VITE_API_URL)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm JWT token vào header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý tập trung các mã phản hồi, đặc biệt là 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 401: {
          if (tokenStorage.getToken()) {
            tokenStorage.clear();
            window.dispatchEvent(new Event('auth:expired'));
            toast.error(message || 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!');
            if (!['/login', '/register'].includes(window.location.pathname)) {
              window.location.assign('/login');
            }
          }
          break;
        }

        case 403:
          toast.error(message || 'Bạn không có quyền truy cập chức năng này.');
          break;

        case 404:
          // Không toast cho mọi 404 để component tự xử lý nếu cần
          break;

        case 500:
          toast.error('Lỗi hệ thống máy chủ. Vui lòng thử lại sau!');
          break;

        default:
          if (message) {
            toast.error(message);
          }
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
