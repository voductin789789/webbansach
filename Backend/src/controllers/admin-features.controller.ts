import { Request, Response, NextFunction } from 'express';
import { adminFeaturesService } from '../services/admin-features.service';
import {
  couponSchema,
  numericIdSchema,
  receiveInventorySchema,
  updateCouponSchema,
} from '../validators/storefront.validator';
import { z } from 'zod';
import { sendSuccess } from '../utils/response';

const reportQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  threshold: z.coerce.number().int().min(0).max(100000).default(5),
});

export class AdminFeaturesController {
  async listCoupons(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await adminFeaturesService.listCoupons()); } catch (error) { next(error); }
  }

  async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await adminFeaturesService.createCoupon(couponSchema.parse(req.body)), 'Đã tạo mã giảm giá', 201); } catch (error) { next(error); }
  }

  async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = numericIdSchema.parse(req.params.id);
      sendSuccess(res, await adminFeaturesService.updateCoupon(id, updateCouponSchema.parse(req.body)));
    } catch (error) { next(error); }
  }

  async deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = numericIdSchema.parse(req.params.id);
      await adminFeaturesService.deleteCoupon(id);
      sendSuccess(res, null, 'Đã xóa mã giảm giá');
    } catch (error) { next(error); }
  }

  async receiveInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await adminFeaturesService.receiveInventory(receiveInventorySchema.parse(req.body)), 'Đã nhập kho', 201);
    } catch (error) { next(error); }
  }

  async lowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { threshold } = reportQuerySchema.parse(req.query);
      sendSuccess(res, await adminFeaturesService.getLowStock(threshold));
    } catch (error) { next(error); }
  }

  async salesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to } = reportQuerySchema.parse(req.query);
      const now = new Date();
      const end = to ?? new Date(now.getTime() + 1);
      const start = from ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (start >= end) {
        res.status(400).json({ success: false, message: 'Khoảng thời gian báo cáo không hợp lệ' });
        return;
      }
      sendSuccess(res, await adminFeaturesService.getSalesReport(start, end));
    } catch (error) { next(error); }
  }
}

export const adminFeaturesController = new AdminFeaturesController();
