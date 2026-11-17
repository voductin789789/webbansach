import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { sendError } from '../utils/response';

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Chưa xác thực người dùng', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Bạn không có quyền thực hiện hành động này', 403);
      return;
    }

    next();
  };
};

