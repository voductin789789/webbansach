import { Request, Response, NextFunction } from 'express';
import { contentService } from '../services/content.service';
import { blogPostSchema, numericIdSchema, updateBlogPostSchema } from '../validators/storefront.validator';
import { sendSuccess } from '../utils/response';

export class ContentController {
  async listPublished(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await contentService.listPublished()); } catch (error) { next(error); }
  }

  async getPublished(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      if (!slug) {
        res.status(400).json({ success: false, message: 'Slug không hợp lệ' });
        return;
      }
      sendSuccess(res, await contentService.getPublished(slug));
    } catch (error) { next(error); }
  }

  async listAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await contentService.listAll()); } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await contentService.create(blogPostSchema.parse(req.body)), 'Đã tạo bài viết', 201);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = numericIdSchema.parse(req.params.id);
      sendSuccess(res, await contentService.update(id, updateBlogPostSchema.parse(req.body)));
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = numericIdSchema.parse(req.params.id);
      await contentService.delete(id);
      sendSuccess(res, null, 'Đã xóa bài viết');
    } catch (error) { next(error); }
  }
}

export const contentController = new ContentController();
