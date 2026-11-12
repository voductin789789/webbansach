import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { sendSuccess } from '../utils/response';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  slug: z.string().min(1, 'Slug không được để trống'),
  description: z.string().optional(),
});

export class CategoryController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getAll();
      sendSuccess(res, categories, 'Lấy danh sách danh mục thành công');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const category = await categoryService.getById(id);
      sendSuccess(res, category, 'Lấy thông tin danh mục thành công');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = categorySchema.parse(req.body);
      const newCategory = await categoryService.create(validatedData);
      sendSuccess(res, newCategory, 'Tạo danh mục mới thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const validatedData = categorySchema.partial().parse(req.body);
      const updatedCategory = await categoryService.update(id, validatedData);
      sendSuccess(res, updatedCategory, 'Cập nhật danh mục thành công');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await categoryService.delete(id);
      sendSuccess(res, null, 'Xóa danh mục thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();

