import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';
import { HttpError } from '../utils/httpError';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const errorMiddleware = (
  err: unknown,
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

  if (err instanceof HttpError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Lỗi cú pháp JSON trong request body
  if (isRecord(err) && err.type === 'entity.parse.failed') {
    sendError(res, 'Định dạng JSON gửi lên không hợp lệ', 400);
    return;
  }

  if (isRecord(err) && err.type === 'entity.too.large') {
    sendError(res, 'Dung lượng dữ liệu gửi lên vượt giới hạn', 413);
    return;
  }

  if (isRecord(err) && err.code === 'LIMIT_FILE_SIZE') {
    sendError(res, 'Kích thước ảnh không được vượt quá 5MB', 413);
    return;
  }

  if (isRecord(err) && typeof err.code === 'string') {
    if (err.code === 'P2002') {
      sendError(res, 'Dữ liệu đã tồn tại', 409);
      return;
    }
    if (err.code === 'P2003' || err.code === 'P2014') {
      sendError(res, 'Không thể thực hiện do dữ liệu đang được sử dụng', 409);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Không tìm thấy dữ liệu cần cập nhật', 404);
      return;
    }
  }

  sendError(res, 'Lỗi hệ thống máy chủ', 500);
};

