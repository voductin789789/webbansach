import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services/book.service';
import { createBookSchema, updateBookSchema, queryBookSchema } from '../validators/book.validator';
import { sendSuccess } from '../utils/response';

export class BookController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = queryBookSchema.parse(req.query);
      const { books, pagination } = await bookService.getAll(query);
      sendSuccess(res, books, 'Lấy danh sách sách thành công', 200, pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const book = await bookService.getById(id);
      sendSuccess(res, book, 'Lấy thông tin sách thành công');
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      if (!slug) {
        throw new Error('Slug không hợp lệ');
      }
      const book = await bookService.getBySlug(slug);
      sendSuccess(res, book, 'Lấy thông tin sách thành công');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = { ...req.body };
      if (req.file) {
        body.coverImage = `/uploads/${req.file.filename}`;
      }
      const validatedData = createBookSchema.parse(body);
      const newBook = await bookService.create(validatedData);
      sendSuccess(res, newBook, 'Thêm sách mới thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const body = { ...req.body };
      if (req.file) {
        body.coverImage = `/uploads/${req.file.filename}`;
      }
      const validatedData = updateBookSchema.parse(body);
      const updatedBook = await bookService.update(id, validatedData);
      sendSuccess(res, updatedBook, 'Cập nhật sách thành công');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await bookService.delete(id);
      sendSuccess(res, null, 'Xóa sách thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const bookController = new BookController();
