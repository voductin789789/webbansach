import prisma from '../config/prisma';
import { HttpError } from '../utils/httpError';

export class CategoryService {
  async getAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { books: true },
    });

    if (!category) {
      throw new HttpError(404, 'Không tìm thấy danh mục');
    }

    return category;
  }

  async create(data: { name: string; slug: string; description?: string }) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new HttpError(409, 'Tên danh mục này đã tồn tại');
    }

    return prisma.category.create({ data });
  }

  async update(id: number, data: { name?: string; slug?: string; description?: string }) {
    await this.getById(id);
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      throw new HttpError(404, 'Không tìm thấy danh mục');
    }

    const bookCount = await prisma.book.count({ where: { categoryId: id } });
    if (bookCount > 0) {
      throw new HttpError(409, 'Không thể xóa danh mục đang có sách');
    }

    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryService = new CategoryService();

