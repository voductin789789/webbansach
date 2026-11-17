import type { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { CreateBookInput, UpdateBookInput, QueryBookInput } from '../validators/book.validator';
import { HttpError } from '../utils/httpError';

export class BookService {
  async getAll(query: QueryBookInput) {
    const {
      page, limit, search, categoryId, minPrice, maxPrice, sortBy, sortOrder,
      translator, publisher, isbn, binding,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { translator: { contains: search } },
        { publisher: { contains: search } },
        { isbn: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (translator) where.translator = { contains: translator };
    if (publisher) where.publisher = { contains: publisher };
    if (isbn) where.isbn = { contains: isbn };
    if (binding) where.binding = binding;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (sortBy === 'bestselling') {
      const soldItems = await prisma.orderItem.findMany({
        where: {
          order: { is: { orderStatus: 'DELIVERED' } },
          book: { is: where },
        },
        select: { bookId: true, quantity: true },
      });
      const soldQuantities = new Map<number, number>();
      for (const item of soldItems) {
        soldQuantities.set(item.bookId, (soldQuantities.get(item.bookId) ?? 0) + item.quantity);
      }
      const sortedBookIds = Array.from(soldQuantities.keys()).sort((left, right) => {
        const difference = soldQuantities.get(left)! - soldQuantities.get(right)!;
        return (sortOrder === 'asc' ? difference : -difference) || left - right;
      });
      const pageIds = sortedBookIds.slice(skip, skip + limit);
      const books = await prisma.book.findMany({
        where: { id: { in: pageIds } },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
      });
      const booksById = new Map(books.map((book) => [book.id, book]));
      return {
        books: pageIds.flatMap((id) => {
          const book = booksById.get(id);
          return book ? [book] : [];
        }),
        pagination: {
          page,
          limit,
          total: sortedBookIds.length,
          totalPages: Math.ceil(sortedBookIds.length / limit),
        },
      };
    }

    if (sortBy === 'rating') {
      const ratings = await prisma.review.findMany({
        where: { book: { is: where } },
        select: { bookId: true, rating: true },
      });
      const averages = new Map<number, { total: number; count: number }>();
      for (const review of ratings) {
        const current = averages.get(review.bookId) ?? { total: 0, count: 0 };
        current.total += review.rating;
        current.count += 1;
        averages.set(review.bookId, current);
      }
      const sortedBookIds = Array.from(averages.keys()).sort((left, right) => {
        const leftAverage = averages.get(left)!.total / averages.get(left)!.count;
        const rightAverage = averages.get(right)!.total / averages.get(right)!.count;
        return (sortOrder === 'asc' ? leftAverage - rightAverage : rightAverage - leftAverage) || left - right;
      });
      const pageIds = sortedBookIds.slice(skip, skip + limit);
      const books = await prisma.book.findMany({
        where: { id: { in: pageIds } },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
      });
      const booksById = new Map(books.map((book) => [book.id, book]));
      return {
        books: pageIds.flatMap((id) => {
          const book = booksById.get(id);
          return book ? [book] : [];
        }),
        pagination: {
          page,
          limit,
          total: sortedBookIds.length,
          totalPages: Math.ceil(sortedBookIds.length / limit),
        },
      };
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
          reviews: { select: { rating: true } },
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
      throw new HttpError(404, 'Không tìm thấy thông tin sách');
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
      throw new HttpError(404, 'Không tìm thấy thông tin sách');
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
    const existing = await prisma.book.findUnique({
      where: { id },
      select: { id: true, price: true, discountPrice: true },
    });

    if (!existing) {
      throw new HttpError(404, 'Không tìm thấy thông tin sách');
    }

    const price = data.price ?? existing.price;
    const discountPrice = data.discountPrice ?? existing.discountPrice;
    if (discountPrice !== null && discountPrice !== undefined && discountPrice >= price) {
      throw new HttpError(400, 'Giá khuyến mãi phải thấp hơn giá gốc');
    }

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

