
import { Response, NextFunction } from 'express';
import { z } from 'zod';

import { orderService } from '../services/order.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

// ============================================================
// VALIDATION: TẠO ĐƠN HÀNG
// ============================================================

const createOrderSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(2, 'Tên người nhận phải có ít nhất 2 ký tự'),

  recipientPhone: z
    .string()
    .trim()
    .regex(
      /^0\d{9}$/,
      'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'
    ),

  shippingAddress: z
    .string()
    .trim()
    .min(5, 'Địa chỉ giao hàng phải có ít nhất 5 ký tự'),

  paymentMethod: z
    .enum(['COD', 'VNPAY', 'MOMO', 'BANKING'])
    .default('COD'),

  note: z.string().trim().optional(),

  items: z
    .array(
      z.object({
        bookId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm'),
});

// ============================================================
// VALIDATION: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
// ============================================================

const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]),
});

// ============================================================
// VALIDATION: ID ĐƠN HÀNG
// ============================================================

const orderIdSchema = z.coerce.number().int().positive();

// ============================================================
// VALIDATION: PHÂN TRANG
// ============================================================

const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  status: z.enum([
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]).optional(),
});

// ============================================================
// ORDER CONTROLLER
// ============================================================

export class OrderController {

  // ----------------------------------------------------------
  // 1. TẠO ĐƠN HÀNG
  // POST /api/orders
  // ----------------------------------------------------------

  async createOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;

      const validatedData = createOrderSchema.parse(req.body);

      const order = await orderService.createOrder(
        userId,
        validatedData
      );

      sendSuccess(
        res,
        order,
        'Đặt hàng thành công',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // ----------------------------------------------------------
  // 2. LẤY DANH SÁCH ĐƠN HÀNG CỦA KHÁCH HÀNG
  // GET /api/orders/my-orders
  // ----------------------------------------------------------

  async getMyOrders(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;

      const orders = await orderService.getMyOrders(userId);

      sendSuccess(
        res,
        orders,
        'Lấy danh sách đơn hàng thành công'
      );
    } catch (error) {
      next(error);
    }
  }

  // ----------------------------------------------------------
  // 3. XEM CHI TIẾT ĐƠN HÀNG
  // GET /api/orders/:id
  // ----------------------------------------------------------

  async getOrderById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const orderId = orderIdSchema.parse(req.params.id);

      const userId = req.user!.id;
      const role = req.user!.role;

      const order = await orderService.getOrderById(
        orderId,
        userId,
        role
      );

      sendSuccess(
        res,
        order,
        'Lấy chi tiết đơn hàng thành công'
      );
    } catch (error) {
      next(error);
    }
  }

  // ----------------------------------------------------------
  // 4. ADMIN: LẤY TẤT CẢ ĐƠN HÀNG
  // GET /api/orders
  // ----------------------------------------------------------

  async getAllOrders(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, status } =
        orderQuerySchema.parse(req.query);

      const { orders, pagination } =
        await orderService.getAllOrders(
          page,
          limit,
          status
        );

      sendSuccess(
        res,
        orders,
        'Lấy tất cả đơn hàng thành công',
        200,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // ----------------------------------------------------------
  // 5. ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
  // PATCH /api/orders/:id/status
  // ----------------------------------------------------------

  async updateOrderStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const orderId = orderIdSchema.parse(req.params.id);

      const { status } =
        updateOrderStatusSchema.parse(req.body);

      const updatedOrder =
        await orderService.updateOrderStatus(
          orderId,
          status
        );

      sendSuccess(
        res,
        updatedOrder,
        'Cập nhật trạng thái đơn hàng thành công'
      );
    } catch (error) {
      next(error);
    }
  }
}

// ============================================================
// EXPORT CONTROLLER
// ============================================================

export const orderController = new OrderController();
