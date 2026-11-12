import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      sendSuccess(res, result, 'Đăng ký tài khoản thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      sendSuccess(res, result, 'Đăng nhập thành công', 200);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await authService.getProfile(userId);
      sendSuccess(res, user, 'Lấy thông tin người dùng thành công');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await authService.updateProfile(userId, validatedData);
      sendSuccess(res, updatedUser, 'Cập nhật thông tin thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

