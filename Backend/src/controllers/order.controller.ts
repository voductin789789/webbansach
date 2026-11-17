
import { Response, NextFunction } from 'express';

import { orderService } from '../services/order.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import {
  createOrderSchema,
  orderIdSchema,
  orderQuerySchema,
  orderQuoteSchema,
  shippingUpdateSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';

// ============================================================
// ORDER CONTROLLER
// ============================================================

export class OrderController {

  async quoteOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = orderQuoteSchema.parse(req.body);
      sendSuccess(res, await orderService.quoteOrder(validatedData), 'Đã tính phí vận chuyển và ưu đãi');
    } catch (error) {
      next(error);
    }
  }

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

  async cancelOrder(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const orderId = orderIdSchema.parse(req.params.id);
      const { id: userId, role } = req.user!;
      const order = await orderService.cancelOrder(orderId, userId, role);
      sendSuccess(res, order, 'Hủy đơn hàng và hoàn tồn kho thành công');
    } catch (error) {
      next(error);
    }
  }

  async simulatePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = orderIdSchema.parse(req.params.id);
      const { id: userId, role } = req.user!;
      sendSuccess(res, await orderService.simulatePayment(orderId, userId, role), 'Thanh toán thử nghiệm thành công');
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

  async updateTracking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = orderIdSchema.parse(req.params.id);
      const { shippingProvider, trackingCode } = shippingUpdateSchema.parse(req.body);
      sendSuccess(res, await orderService.updateTracking(orderId, shippingProvider, trackingCode), 'Đã cập nhật mã vận đơn');
    } catch (error) {
      next(error);
    }
  }
}

// ============================================================
// EXPORT CONTROLLER
// ============================================================

export const orderController = new OrderController();
