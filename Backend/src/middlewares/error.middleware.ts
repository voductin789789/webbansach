import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[ErrorMiddleware]:', err);

  // Lỗi xác thực dữ liệu từ Zod
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    sendError(res, 'Dữ liệu không hợp lệ', 400, formattedErrors);
    return;
  }

  // Lỗi cú pháp JSON trong request body
  if (err.type === 'entity.parse.failed') {
    sendError(res, 'Định dạng JSON gửi lên không hợp lệ', 400);
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Lỗi hệ thống máy chủ';
  sendError(res, message, statusCode, err);
};

