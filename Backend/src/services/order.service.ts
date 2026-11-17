
import type { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';
import { randomUUID } from 'node:crypto';
import { HttpError } from '../utils/httpError';
import { canCancelOrder, getNextOrderStatus } from './order.policy';
import type { ForwardOrderStatus, OrderStatus } from './order.policy';
import type { UserRole } from '../types';
import { config } from '../config/env';

// =====================================================
// TYPES
// =====================================================

export interface CreateOrderItemInput {
  bookId: number;
  quantity: number;
}

export interface CreateOrderInput {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentMethod?: 'COD' | 'VNPAY' | 'MOMO' | 'BANKING' | 'CARD';
  couponCode?: string;
  shippingProvince?: string;
  note?: string;
  items: CreateOrderItemInput[];
}

// Khai báo kiểu dữ liệu sách cần dùng trong Service
interface BookRow {
  id: number;
  title: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  weightGrams: number | null;
}

interface OrderItemData {
  bookId: number;
  quantity: number;
  price: number;
}

// =====================================================
// ORDER SERVICE
// =====================================================

export class OrderService {
  constructor(private readonly database: PrismaClient = prisma) {}

  private async buildQuote(
    transaction: Prisma.TransactionClient,
    items: CreateOrderItemInput[],
    shippingProvince = '',
    couponCode?: string
  ) {
    const quantityByBook = new Map<number, number>();
    for (const item of items) {
      if (!Number.isSafeInteger(item.bookId) || item.bookId <= 0 ||
          !Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
        throw new HttpError(400, 'Thông tin sản phẩm không hợp lệ');
      }
      const quantity = (quantityByBook.get(item.bookId) ?? 0) + item.quantity;
      if (!Number.isSafeInteger(quantity)) throw new HttpError(400, 'Số lượng sách vượt giới hạn cho phép');
      quantityByBook.set(item.bookId, quantity);
    }

    const books = await transaction.book.findMany({
      where: { id: { in: Array.from(quantityByBook.keys()) } },
      select: { id: true, title: true, price: true, discountPrice: true, stock: true, weightGrams: true },
    });
    if (books.length !== quantityByBook.size) throw new HttpError(404, 'Một số sách không tồn tại');

    let subtotalPrice = 0;
    let shippingWeightGrams = 0;
    for (const book of books) {
      const quantity = quantityByBook.get(book.id)!;
      if (book.stock < quantity) throw new HttpError(409, `Sách "${book.title}" không đủ tồn kho`);
      subtotalPrice += (book.discountPrice ?? book.price) * quantity;
      shippingWeightGrams += (book.weightGrams ?? 350) * quantity;
    }

    const normalizedProvince = shippingProvince
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const baseShipping = normalizedProvince.includes('ho chi minh')
      ? 20000
      : normalizedProvince.includes('ha noi')
        ? 25000
        : 35000;
    const shippingFee = baseShipping + Math.ceil(Math.max(0, shippingWeightGrams - 500) / 500) * 5000;

    let discountAmount = 0;
    let finalShippingFee = shippingFee;
    let couponId: number | undefined;
    let normalizedCouponCode: string | undefined;
    if (couponCode) {
      const coupon = await transaction.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });
      const now = new Date();
      if (!coupon || !coupon.active ||
          (coupon.startsAt && coupon.startsAt > now) ||
          (coupon.expiresAt && coupon.expiresAt < now) ||
          (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)) {
        throw new HttpError(400, 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }
      if (subtotalPrice < coupon.minimumOrder) {
        throw new HttpError(400, `Đơn hàng chưa đạt giá trị tối thiểu ${coupon.minimumOrder}`);
      }
      couponId = coupon.id;
      normalizedCouponCode = coupon.code;
      if (coupon.type === 'FREE_SHIPPING') {
        finalShippingFee = 0;
      } else {
        discountAmount = coupon.type === 'PERCENT'
          ? subtotalPrice * Math.min(coupon.value, 100) / 100
          : Math.min(subtotalPrice, coupon.value);
        if (coupon.maximumDiscount !== null) {
          discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
        }
      }
    }

    return {
      items: Array.from(quantityByBook, ([bookId, quantity]) => ({ bookId, quantity })),
      books,
      subtotalPrice,
      shippingWeightGrams,
      shippingFee: finalShippingFee,
      discountAmount,
      totalPrice: Math.max(0, subtotalPrice - discountAmount + finalShippingFee),
      couponId,
      couponCode: normalizedCouponCode,
    };
  }

  async quoteOrder(data: Pick<CreateOrderInput, 'items' | 'couponCode' | 'shippingProvince'>) {
    return this.database.$transaction((transaction) =>
      this.buildQuote(transaction, data.items, data.shippingProvince, data.couponCode)
    );
  }

  // ===================================================
  // 1. TẠO ĐƠN HÀNG
  // ===================================================

  async createOrder(userId: number, data: CreateOrderInput) {

    if (!data.items || data.items.length === 0) {
      throw new HttpError(400, 'Đơn hàng phải có ít nhất một sản phẩm');
    }

    const orderCode = `ORD-${randomUUID()}`;

    // Transaction đảm bảo tất cả thành công hoặc rollback
    const order = await this.database.$transaction(
      async (tx) => {

        const quote = await this.buildQuote(tx, data.items, data.shippingProvince, data.couponCode);
        const bookMap = new Map<number, BookRow>(quote.books.map((book) => [book.id, book]));
        const orderItemsData: OrderItemData[] = [];

        for (const item of quote.items) {
          const book = bookMap.get(item.bookId);
          if (!book) throw new HttpError(404, `Không tìm thấy sách ID ${item.bookId}`);

          const result = await tx.book.updateMany({
            where: {
              id: item.bookId,
              stock: {
                gte: item.quantity
              }
            },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });

          if (result.count !== 1) {
            throw new HttpError(409, `Sách "${book.title}" không đủ tồn kho`);
          }

          const unitPrice = book.discountPrice ?? book.price;
          orderItemsData.push({
            bookId: item.bookId,
            quantity: item.quantity,
            price: unitPrice
          });
        }

        const newOrder = await tx.order.create({
          data: {
            orderCode,
            userId,
            recipientName: data.recipientName,
            recipientPhone: data.recipientPhone,
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod ?? 'COD',
            subtotalPrice: quote.subtotalPrice,
            shippingFee: quote.shippingFee,
            discountAmount: quote.discountAmount,
            shippingWeightGrams: quote.shippingWeightGrams,
            totalPrice: quote.totalPrice,
            couponId: quote.couponId,
            note: data.note,
            items: {
              create: orderItemsData
            }
          },
          include: {
            items: {
              include: {
                book: true
              }
            }
          }
        });

        for (const orderItem of newOrder.items) {
          let remaining = orderItem.quantity;
          const batches = await tx.inventoryBatch.findMany({
            where: { bookId: orderItem.bookId, remainingQuantity: { gt: 0 } },
            orderBy: { receivedAt: 'asc' },
            select: { id: true, remainingQuantity: true },
          });
          for (const batch of batches) {
            if (remaining === 0) break;
            const allocated = Math.min(remaining, batch.remainingQuantity);
            const result = await tx.inventoryBatch.updateMany({
              where: { id: batch.id, remainingQuantity: { gte: allocated } },
              data: { remainingQuantity: { decrement: allocated } },
            });
            if (result.count !== 1) {
              throw new HttpError(409, 'Tồn kho theo lô vừa thay đổi; vui lòng thử lại');
            }
            await tx.inventoryAllocation.create({
              data: { batchId: batch.id, orderItemId: orderItem.id, quantity: allocated },
            });
            remaining -= allocated;
          }
        }

        if (quote.couponId) {
          const coupon = await tx.coupon.findUniqueOrThrow({ where: { id: quote.couponId } });
          const result = await tx.coupon.updateMany({
            where: {
              id: coupon.id,
              ...(coupon.usageLimit !== null ? { usedCount: { lt: coupon.usageLimit } } : {}),
            },
            data: { usedCount: { increment: 1 } },
          });
          if (result.count !== 1) throw new HttpError(409, 'Mã giảm giá vừa được sử dụng hết');
        }

        const customer = await tx.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });
        if (customer) {
          const summary = orderItemsData.map((item) => {
            const book = bookMap.get(item.bookId)!;
            return `${book.title} x ${item.quantity}`;
          }).join('\n');
          await tx.emailOutbox.create({
            data: {
              recipient: customer.email,
              subject: `Xác nhận đơn hàng ${orderCode}`,
              body: `${summary}\nTạm tính: ${quote.subtotalPrice}\nPhí vận chuyển: ${quote.shippingFee}\nGiảm giá: ${quote.discountAmount}\nTổng thanh toán: ${quote.totalPrice}`,
            },
          });
        }

        const userCart = await tx.cart.findUnique({
          where: {
            userId
          }
        });

        if (userCart) {
          await tx.cartItem.deleteMany({
            where: {
              cartId: userCart.id,
              bookId: {
                in: quote.items.map((item) => item.bookId)
              }
            }
          });
        }

        return newOrder;
      }
    );

    return order;
  }

  // ===================================================
  // 2. LẤY ĐƠN HÀNG CỦA KHÁCH HÀNG
  // ===================================================

  async getMyOrders(userId: number) {
    return this.database.order.findMany({
      where: {
        userId
      },
      include: {
        items: {
          include: {
            book: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // ===================================================
  // 3. XEM CHI TIẾT ĐƠN HÀNG
  // ===================================================

  async getOrderById(
    id: number,
    userId: number,
    role: UserRole
  ) {

    const order = await this.database.order.findUnique({
      where: {
        id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            book: true
          }
        }
      }
    });

    if (!order) {
      throw new HttpError(404, 'Không tìm thấy đơn hàng');
    }

    // Chỉ Admin hoặc chủ đơn hàng được xem
    if (
      role !== 'ADMIN' &&
      order.userId !== userId
    ) {
      throw new HttpError(403, 'Bạn không có quyền xem đơn hàng này');
    }

    return order;
  }

  // ===================================================
  // 4. ADMIN - DANH SÁCH ĐƠN HÀNG
  // ===================================================

  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus
  ) {

    const skip = (page - 1) * limit;

    const where: {
      orderStatus?: OrderStatus;
    } = {};

    if (status) {
      where.orderStatus = status;
    }

    // Dùng Promise.all, tránh lỗi overload Transaction
    const [total, orders] = await Promise.all([
      this.database.order.count({
        where
      }),
      this.database.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              book: true
            }
          }
        }
      })
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ===================================================
  // 5. ADMIN - CẬP NHẬT TRẠNG THÁI ĐƠN
  // ===================================================

  async cancelOrder(id: number, userId: number, role: UserRole) {
    return this.database.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            select: {
              bookId: true,
              quantity: true,
              allocations: { select: { batchId: true, quantity: true } },
            },
          },
        },
      });

      if (!existingOrder || (role !== 'ADMIN' && existingOrder.userId !== userId)) {
        throw new HttpError(404, 'Không tìm thấy đơn hàng');
      }

      if (!canCancelOrder(existingOrder.orderStatus, role)) {
        throw new HttpError(
          409,
          role === 'ADMIN'
            ? 'Chỉ có thể hủy đơn đang chờ xử lý hoặc đang xử lý'
            : 'Chỉ có thể hủy đơn hàng đang chờ xác nhận'
        );
      }

      const result = await tx.order.updateMany({
        where: { id, orderStatus: existingOrder.orderStatus },
        data: { orderStatus: 'CANCELLED' },
      });

      if (result.count !== 1) {
        throw new HttpError(409, 'Đơn hàng đã được cập nhật bởi thao tác khác');
      }

      await Promise.all(
        existingOrder.items.map((item: { bookId: number; quantity: number }) =>
          tx.book.update({
            where: { id: item.bookId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
      for (const item of existingOrder.items) {
        for (const allocation of item.allocations) {
          await tx.inventoryBatch.update({
            where: { id: allocation.batchId },
            data: { remainingQuantity: { increment: allocation.quantity } },
          });
        }
      }

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: { items: { include: { book: true } } },
      });
    });
  }

  async updateOrderStatus(id: number, status: ForwardOrderStatus) {
    return this.database.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({ where: { id } });

      if (!existingOrder) {
        throw new HttpError(404, 'Không tìm thấy đơn hàng');
      }

      if (getNextOrderStatus(existingOrder.orderStatus) !== status) {
        throw new HttpError(409, 'Trạng thái đơn hàng không thể chuyển theo thứ tự này');
      }

      const result = await tx.order.updateMany({
        where: { id, orderStatus: existingOrder.orderStatus },
        data: { orderStatus: status },
      });

      if (result.count !== 1) {
        throw new HttpError(409, 'Đơn hàng đã được cập nhật bởi thao tác khác');
      }

      if (status === 'DELIVERED') {
        const order = await tx.order.findUniqueOrThrow({
          where: { id },
          select: { userId: true, totalPrice: true },
        });
        const pointsAwarded = Math.floor(order.totalPrice / 10000);
        await tx.user.update({
          where: { id: order.userId },
          data: { loyaltyPoints: { increment: pointsAwarded } },
        });
        await tx.order.update({ where: { id }, data: { pointsAwarded } });
      }

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });
    });
  }

  async simulatePayment(id: number, userId: number, role: UserRole) {
    if (config.NODE_ENV === 'production') {
      throw new HttpError(404, 'Không tìm thấy endpoint');
    }

    return this.database.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order || (role !== 'ADMIN' && order.userId !== userId)) {
        throw new HttpError(404, 'Không tìm thấy đơn hàng');
      }
      if (order.paymentMethod === 'COD') {
        throw new HttpError(400, 'Đơn COD không cần thanh toán sandbox');
      }
      if (order.paymentStatus !== 'UNPAID') {
        throw new HttpError(409, 'Đơn hàng không còn ở trạng thái chờ thanh toán');
      }
      const updated = await tx.order.updateMany({
        where: { id, paymentStatus: 'UNPAID', orderStatus: 'PENDING' },
        data: {
          paymentStatus: 'PAID',
          paymentReference: `TEST-${randomUUID()}`,
        },
      });
      if (updated.count !== 1) throw new HttpError(409, 'Trạng thái thanh toán vừa thay đổi');
      return tx.order.findUniqueOrThrow({
        where: { id },
        include: { items: { include: { book: true } } },
      });
    });
  }

  async updateTracking(id: number, shippingProvider: string, trackingCode: string) {
    const result = await this.database.order.updateMany({
      where: { id, orderStatus: { in: ['PROCESSING', 'SHIPPED'] } },
      data: { shippingProvider, trackingCode },
    });
    if (!result.count) {
      throw new HttpError(409, 'Chỉ có thể cập nhật vận đơn cho đơn đang xử lý hoặc đang giao');
    }
    return this.database.order.findUniqueOrThrow({ where: { id } });
  }
}

// =====================================================
// EXPORT
// =====================================================

export const orderService = new OrderService();
