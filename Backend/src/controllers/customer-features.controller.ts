import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';
import { customerFeaturesService } from '../services/customer-features.service';
import { addressSchema, createReviewSchema, newsletterSchema, numericIdSchema, updateAddressSchema } from '../validators/storefront.validator';
import { sendSuccess } from '../utils/response';
import { HttpError } from '../utils/httpError';

export class CustomerFeaturesController {
  async getWishlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await customerFeaturesService.getWishlist(req.user!.id));
    } catch (error) {
      next(error);
    }
  }

  async addToWishlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookId = numericIdSchema.parse(req.params.bookId);
      sendSuccess(res, await customerFeaturesService.addToWishlist(req.user!.id, bookId), 'Đã thêm vào danh sách yêu thích', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeFromWishlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookId = numericIdSchema.parse(req.params.bookId);
      await customerFeaturesService.removeFromWishlist(req.user!.id, bookId);
      sendSuccess(res, null, 'Đã xóa khỏi danh sách yêu thích');
    } catch (error) {
      next(error);
    }
  }

  async getAddresses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await customerFeaturesService.listAddresses(req.user!.id));
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = addressSchema.parse(req.body);
      sendSuccess(res, await customerFeaturesService.createAddress(req.user!.id, data), 'Đã lưu địa chỉ', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = numericIdSchema.parse(req.params.id);
      const data = updateAddressSchema.parse(req.body);
      sendSuccess(res, await customerFeaturesService.updateAddress(req.user!.id, id, data));
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = numericIdSchema.parse(req.params.id);
      await customerFeaturesService.deleteAddress(req.user!.id, id);
      sendSuccess(res, null, 'Đã xóa địa chỉ');
    } catch (error) {
      next(error);
    }
  }

  async createReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookId = numericIdSchema.parse(req.params.bookId);
      const data = createReviewSchema.parse(req.body);
      sendSuccess(res, await customerFeaturesService.createReview(req.user!.id, bookId, data), 'Đã gửi đánh giá', 201);
    } catch (error) {
      next(error);
    }
  }

  uploadReviewImage(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      if (!req.file) throw new HttpError(400, 'Vui lòng chọn ảnh đánh giá');
      sendSuccess(res, { url: `/uploads/${req.file.filename}` }, 'Đã tải ảnh đánh giá');
    } catch (error) {
      next(error);
    }
  }

  async markReviewHelpful(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewId = numericIdSchema.parse(req.params.reviewId);
      sendSuccess(res, await customerFeaturesService.markReviewHelpful(req.user!.id, reviewId), 'Đã ghi nhận đánh giá hữu ích');
    } catch (error) {
      next(error);
    }
  }

  async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = newsletterSchema.parse(req.body);
      sendSuccess(res, await customerFeaturesService.subscribe(email), 'Đã đăng ký nhận tin');
    } catch (error) {
      next(error);
    }
  }
}

export const customerFeaturesController = new CustomerFeaturesController();
