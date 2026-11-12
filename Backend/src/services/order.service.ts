
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
    const order = await prisma.$transaction(
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
            userId,
            recipientName: data.recipientName,
            recipientPhone: data.recipientPhone,
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod ?? 'COD',
            totalPrice,
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

        // Xóa sách đã đặt khỏi giỏ hàng
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
                in: bookIds
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
        }
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

  async updateOrderStatus(
    id: number,
    status: OrderStatus
  ) {

    const existingOrder = await prisma.order.findUnique({
      where: {
        id
      }
    });

    if (!existingOrder) {
      throw createHttpError(
        'Không tìm thấy đơn hàng',
        404
      );
    }

    return prisma.order.update({
      where: {
        id
      },
      data: {
        orderStatus: status
      },
      include: {
        items: true
      }
    });
  }
}

// =====================================================
// EXPORT
// =====================================================

export const orderService = new OrderService();
