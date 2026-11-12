import prisma from '../config/prisma';
import { CreateBookInput, UpdateBookInput, QueryBookInput } from '../validators/book.validator';

export class BookService {
  async getAll(query: QueryBookInput) {
    const { page, limit, search, categoryId, minPrice, maxPrice, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
    ]);

    return {
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!book) {
      throw new Error('Không tìm thấy thông tin sách');
    }

    return book;
  }

  async getBySlug(slug: string) {
    const book = await prisma.book.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!book) {
      throw new Error('Không tìm thấy thông tin sách');
    }

    return book;
  }

  async create(data: CreateBookInput) {
    const slug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') + `-${Date.now()}`;

    return prisma.book.create({
      data: {
        ...data,
        slug,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: number, data: UpdateBookInput) {
    await this.getById(id);
    return prisma.book.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: number) {
    await this.getById(id);
    return prisma.book.delete({
      where: { id },
    });
  }
}

export const bookService = new BookService();

