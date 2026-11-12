import prisma from '../config/prisma';

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
      throw new Error('Không tìm thấy danh mục');
    }

    return category;
  }

  async create(data: { name: string; slug: string; description?: string }) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('Tên danh mục này đã tồn tại');
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
    await this.getById(id);
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryService = new CategoryService();

