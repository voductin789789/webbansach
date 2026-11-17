import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';
import { HttpError } from '../utils/httpError';
import type { CouponInput, InventoryInput } from '../validators/storefront.validator';

export class AdminFeaturesService {
  constructor(private readonly database: PrismaClient = prisma) {}

  listCoupons() {
    return this.database.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createCoupon(data: CouponInput) {
    return this.database.coupon.create({ data });
  }

  async updateCoupon(id: number, data: Partial<CouponInput>) {
    const result = await this.database.coupon.updateMany({ where: { id }, data });
    if (!result.count) throw new HttpError(404, 'Không tìm thấy mã giảm giá');
    return this.database.coupon.findUniqueOrThrow({ where: { id } });
  }

  async deleteCoupon(id: number) {
    const result = await this.database.coupon.deleteMany({ where: { id } });
    if (!result.count) throw new HttpError(404, 'Không tìm thấy mã giảm giá');
  }

  receiveInventory(data: InventoryInput) {
    return this.database.$transaction(async (transaction) => {
      const book = await transaction.book.findUnique({
        where: { id: data.bookId },
        select: { id: true, title: true },
      });
      if (!book) throw new HttpError(404, 'Không tìm thấy sách');

      const batch = await transaction.inventoryBatch.create({
        data: {
          bookId: book.id,
          batchCode: `IN-${randomUUID()}`,
          receivedQuantity: data.quantity,
          remainingQuantity: data.quantity,
          unitCost: data.unitCost,
          note: data.note,
        },
      });
      const updatedBook = await transaction.book.update({
        where: { id: book.id },
        data: { stock: { increment: data.quantity } },
        select: { id: true, title: true, stock: true },
      });
      return { batch, book: updatedBook };
    });
  }

  getLowStock(threshold = 5) {
    return this.database.book.findMany({
      where: { stock: { lte: threshold } },
      orderBy: { stock: 'asc' },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async getSalesReport(from: Date, to: Date) {
    const orders = await this.database.order.findMany({
      where: { createdAt: { gte: from, lt: to }, orderStatus: 'DELIVERED' },
      select: {
        totalPrice: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            book: { select: { id: true, title: true } },
          },
        },
      },
    });

    const dailyRevenue = new Map<string, number>();
    const bestsellers = new Map<number, { bookId: number; title: string; quantity: number; revenue: number }>();
    let revenue = 0;

    for (const order of orders) {
      revenue += order.totalPrice;
      const day = order.createdAt.toISOString().slice(0, 10);
      dailyRevenue.set(day, (dailyRevenue.get(day) ?? 0) + order.totalPrice);

      for (const item of order.items) {
        const current = bestsellers.get(item.book.id) ?? {
          bookId: item.book.id,
          title: item.book.title,
          quantity: 0,
          revenue: 0,
        };
        current.quantity += item.quantity;
        current.revenue += item.price * item.quantity;
        bestsellers.set(item.book.id, current);
      }
    }

    const [orderCount, customerCount, lowStockCount, staleBooks] = await Promise.all([
      this.database.order.count({ where: { createdAt: { gte: from, lt: to } } }),
      this.database.user.count({ where: { role: 'CUSTOMER' } }),
      this.database.book.count({ where: { stock: { lte: 5 } } }),
      this.database.book.findMany({
        where: { stock: { gt: 0 } },
        orderBy: [{ stock: 'asc' }, { updatedAt: 'asc' }],
        take: 10,
        select: { id: true, title: true, stock: true, updatedAt: true },
      }),
    ]);

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      revenue,
      deliveredOrderCount: orders.length,
      orderCount,
      customerCount,
      lowStockCount,
      dailyRevenue: Array.from(dailyRevenue, ([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      bestsellers: Array.from(bestsellers.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10),
      lowTurnoverCandidates: staleBooks,
    };
  }
}

export const adminFeaturesService = new AdminFeaturesService();
