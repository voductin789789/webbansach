
import prisma from '../config/prisma';
import { randomUUID } from 'node:crypto';

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
  paymentMethod?: 'COD' | 'VNPAY' | 'MOMO' | 'BANKING';
  note?: string;
  clientRequestId?: string;
  items: CreateOrderItemInput[];
}

type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

// Khai báo kiểu dữ liệu sách cần dùng trong Service
interface BookRow {
  id: number;
  title: string;
  price: number;
  discountPrice: number | null;
  stock: number;
}

interface OrderItemData {
  bookId: number;
  quantity: number;
  price: number;
}

// Tạo lỗi nghiệp vụ
function createHttpError(
  message: string,
  statusCode: number
): Error {
  return Object.assign(new Error(message), { statusCode });
}

// =====================================================
// ORDER SERVICE
// =====================================================

export class OrderService {

  // ===================================================
  // 1. TẠO ĐƠN HÀNG
  // ===================================================

  async createOrder(userId: number, data: CreateOrderInput) {

    if (!data.items || data.items.length === 0) {
      throw createHttpError(
        'Đơn hàng phải có ít nhất một sản phẩm',
        400
      );
    }

    // Cùng một khóa yêu cầu => trả lại đơn cũ, không trừ kho lần 2.
    if (data.clientRequestId) {
      const existing = await prisma.order.findUnique({
        where: { clientRequestId: data.clientRequestId }, include: { items: { include: { book: true } } },
      });
      if (existing) {
        if (existing.userId !== userId) throw createHttpError('Khóa yêu cầu đã được sử dụng', 409);
        return existing;
      }
    }

    // Gộp những sách có cùng bookId
    const quantityMap = new Map<number, number>();

    for (const item of data.items) {

      if (
        !Number.isSafeInteger(item.bookId) ||
        item.bookId <= 0 ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw createHttpError(
          'Thông tin sản phẩm không hợp lệ',
          400
        );
      }

      const oldQuantity = quantityMap.get(item.bookId) ?? 0;

      const newQuantity = oldQuantity + item.quantity;

      if (!Number.isSafeInteger(newQuantity)) {
        throw createHttpError(
          'Số lượng sách vượt giới hạn cho phép',
          400
        );
      }

      quantityMap.set(item.bookId, newQuantity);
    }

    const items = Array.from(
      quantityMap,
      ([bookId, quantity]) => ({
        bookId,
        quantity
      })
    );

    const bookIds = items.map(item => item.bookId);

    const orderCode = `ORD-${randomUUID()}`;

    // Transaction đảm bảo tất cả thành công hoặc rollback
    let order;
    try { order = await prisma.$transaction(
      async (tx: any) => {

        // Lấy sách từ MySQL
        const books: BookRow[] = await tx.book.findMany({
          where: {
            id: {
              in: bookIds
            }
          }
        });

        if (books.length !== bookIds.length) {
          throw createHttpError(
            'Một số sách không tồn tại',
            404
          );
        }

        const bookMap = new Map<number, BookRow>(
          books.map((book: BookRow) => [
            book.id,
            book
          ])
        );

        let totalPrice = 0;

        const orderItemsData: OrderItemData[] = [];

        // Kiểm tra và giảm tồn kho
        for (const item of items) {

          const book = bookMap.get(item.bookId);

          if (!book) {
            throw createHttpError(
              `Không tìm thấy sách ID ${item.bookId}`,
              404
            );
          }

          // Kiểm tra số lượng ngay lúc cập nhật
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
            throw createHttpError(
              `Sách "${book.title}" không đủ tồn kho`,
              409
            );
          }

          // Giá lấy trực tiếp từ Database
          const unitPrice =
            book.discountPrice ?? book.price;

          totalPrice += unitPrice * item.quantity;

          orderItemsData.push({
            bookId: item.bookId,
            quantity: item.quantity,
            price: unitPrice
          });
        }

        // Tạo đơn hàng và chi tiết đơn
        const newOrder = await tx.order.create({
          data: {
            orderCode,
            clientRequestId: data.clientRequestId,
            userId,
            recipientName: data.recipientName,
            recipientPhone: data.recipientPhone,
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod ?? 'COD',
            totalPrice,
            note: data.note,
            items: {
              create: orderItemsData
            },
            statusHistory: {
              create: {
                toStatus: 'PENDING',
                changedById: userId,
                changedByRole: 'CUSTOMER',
                note: 'Khách hàng đặt hàng thành công'
              }
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

        // Chỉ trừ các số lượng vừa mua khỏi giỏ MySQL.
        // Nếu Mua ngay 1 cuốn trong khi giỏ có 3 cuốn, giữ lại 2 cuốn.
        const userCart = await tx.cart.findUnique({ where: { userId } });
        if (userCart) {
          for (const purchased of items) {
            const entry = await tx.cartItem.findUnique({
              where: { cartId_bookId: { cartId: userCart.id, bookId: purchased.bookId } }
            });
            if (!entry) continue;
            if (entry.quantity <= purchased.quantity) {
              await tx.cartItem.delete({ where: { id: entry.id } });
            } else {
              await tx.cartItem.update({
                where: { id: entry.id },
                data: { quantity: { decrement: purchased.quantity } }
              });
            }
          }
        }

        return newOrder;
      }
    );

    } catch (error: any) {
      // Nếu hai request cùng khóa chạy đồng thời, unique constraint bảo vệ tồn kho.
      if (data.clientRequestId && error?.code === 'P2002') {
        const previous = await prisma.order.findUnique({
          where: { clientRequestId: data.clientRequestId }, include: { items: { include: { book: true } } },
        });
        if (previous && previous.userId === userId) return previous;
      }
      throw error;
    }
    return order;
  }

  // ===================================================
  // 2. LẤY ĐƠN HÀNG CỦA KHÁCH HÀNG
  // ===================================================

  async getMyOrders(userId: number) {
    return prisma.order.findMany({
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
    userId?: number,
    role?: string
  ) {

    const order = await prisma.order.findUnique({
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
        },
        statusHistory: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }
      }
    });

    if (!order) {
      throw createHttpError(
        'Không tìm thấy đơn hàng',
        404
      );
    }

    // Chỉ Admin hoặc chủ đơn hàng được xem
    if (
      role !== 'ADMIN' &&
      order.userId !== userId
    ) {
      throw createHttpError(
        'Bạn không có quyền xem đơn hàng này',
        403
      );
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
      prisma.order.count({
        where
      }),
      prisma.order.findMany({
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

  // Chuyển trạng thái có điều kiện trong transaction để ngăn tranh chấp.
  // Hoàn tồn kho chỉ khi chuyển lần đầu từ PENDING sang CANCELLED.
  async updateOrderStatus(id: number, status: OrderStatus, adminId: number) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!current) throw createHttpError('Không tìm thấy đơn hàng', 404);
      const allowed: Record<OrderStatus, OrderStatus[]> = {
        PENDING: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPED'],
        SHIPPED: ['DELIVERED'],
        DELIVERED: [],
        CANCELLED: [],
      };
      if (!allowed[current.orderStatus as OrderStatus].includes(status)) {
        throw createHttpError(`Không thể chuyển từ ${current.orderStatus} sang ${status}`, 409);
      }
      const changed = await tx.order.updateMany({
        where: { id, orderStatus: current.orderStatus },
        data: { orderStatus: status },
      });
      if (changed.count !== 1) throw createHttpError('Đơn hàng vừa được thay đổi, hãy tải lại', 409);
      if (status === 'CANCELLED') {
        for (const item of current.items) {
          await tx.book.update({ where: { id: item.bookId }, data: { stock: { increment: item.quantity } } });
        }
      }
      await tx.orderStatusHistory.create({ data: {
        orderId: id, fromStatus: current.orderStatus, toStatus: status,
        changedById: adminId, changedByRole: 'ADMIN',
        note: status === 'CANCELLED' ? 'Người bán hủy đơn và hoàn tồn kho' : null
      }});
      return tx.order.findUnique({ where: { id }, include: { items: true, statusHistory: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } } });
    });
  }

  // Chỉ xác nhận PENDING -> PROCESSING. Một transaction chung cho trạng thái và lịch sử.
  async confirmAllPendingOrders(adminId: number) {
    return prisma.$transaction(async (tx) => {
      const pending = await tx.order.findMany({ where: { orderStatus: 'PENDING' }, select: { id: true } });
      if (pending.length === 0) return { confirmed: 0 };
      const ids = pending.map(order => order.id);
      const changed = await tx.order.updateMany({
        where: { id: { in: ids }, orderStatus: 'PENDING' },
        data: { orderStatus: 'PROCESSING' }
      });
      if (changed.count !== ids.length) {
        throw createHttpError('Có đơn vừa thay đổi trạng thái. Hãy tải lại và thử lại.', 409);
      }
      await tx.orderStatusHistory.createMany({ data: ids.map(orderId => ({
        orderId, fromStatus: 'PENDING', toStatus: 'PROCESSING',
        changedById: adminId, changedByRole: 'ADMIN', note: 'Xác nhận hàng loạt bởi quản trị viên'
      })) });
      return { confirmed: ids.length };
    }, { timeout: 30000 });
  }

  async cancelMyOrder(id: number, userId: number) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!current || current.userId !== userId) throw createHttpError('Không tìm thấy đơn hàng của bạn', 404);
      if (current.orderStatus !== 'PENDING') throw createHttpError('Chỉ được hủy đơn đang chờ xác nhận', 409);
      const result = await tx.order.updateMany({
        where: { id, userId, orderStatus: 'PENDING' }, data: { orderStatus: 'CANCELLED' },
      });
      if (result.count !== 1) throw createHttpError('Đơn hàng đã được cập nhật', 409);
      for (const item of current.items) {
        await tx.book.update({ where: { id: item.bookId }, data: { stock: { increment: item.quantity } } });
      }
      await tx.orderStatusHistory.create({ data: {
        orderId: id, fromStatus: 'PENDING', toStatus: 'CANCELLED',
        changedById: userId, changedByRole: 'CUSTOMER', note: 'Khách hàng hủy đơn và hoàn tồn kho'
      }});
      return tx.order.findUnique({ where: { id }, include: { items: true, statusHistory: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } } });
    });
  }

}

// =====================================================
// EXPORT
// =====================================================

export const orderService = new OrderService();
