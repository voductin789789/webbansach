import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Thành công',
  statusCode: number = 200,
  pagination?: ApiResponse['pagination']
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(responseBody);
};

export const sendError = (
  res: Response,
  message: string = 'Đã có lỗi xảy ra',
  statusCode: number = 500,
  error?: any
): Response => {
  const responseBody: ApiResponse = {
    success: false,
    message,
    ...(error && { error: typeof error === 'string' ? error : error.message || error }),
  };
  return res.status(statusCode).json(responseBody);
};

