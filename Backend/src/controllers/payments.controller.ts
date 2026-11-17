import { NextFunction, Request, Response } from 'express';
import { paymentsService } from '../services/payments.service';
import { AuthRequest } from '../types';
import { config } from '../config/env';
import { orderIdSchema } from '../validators/order.validator';
import { sendSuccess } from '../utils/response';
import { HttpError } from '../utils/httpError';

const paymentResultUrl = (orderId: number, paid: boolean): string => {
  const baseUrl = config.PAYMENT_RESULT_URL.replace(/\/+$/, '');
  const result = new URL(`${baseUrl}/${orderId}`);
  result.searchParams.set('payment', paid ? 'success' : 'failed');
  return result.toString();
};

export class PaymentsController {
  async createSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = orderIdSchema.parse(req.params.id);
      const { id: userId, role } = req.user!;
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
      sendSuccess(res, await paymentsService.createSession(orderId, userId, role, ipAddress), 'Đã tạo phiên thanh toán');
    } catch (error) {
      next(error);
    }
  }

  async vnpayReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentsService.handleVnpayCallback(req.query);
      res.redirect(303, paymentResultUrl(result.orderId, result.paid));
    } catch (error) {
      next(error);
    }
  }

  async vnpayIpn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await paymentsService.handleVnpayCallback(req.query);
      res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } catch (error) {
      console.error('[VNPay IPN]:', error);
      const code = error instanceof HttpError
        ? ({ 400: '04', 401: '97', 404: '01', 409: '02' }[error.statusCode] || '99')
        : '99';
      res.status(200).json({ RspCode: code, Message: 'Confirm Failed' });
    }
  }

  async momoReturn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentsService.handleMomoCallback(req.query);
      res.redirect(303, paymentResultUrl(result.orderId, result.paid));
    } catch (error) {
      next(error);
    }
  }

  async momoIpn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await paymentsService.handleMomoCallback(req.body);
      res.status(200).json({ resultCode: 0, message: 'Success' });
    } catch (error) {
      console.error('[MoMo IPN]:', error);
      res.status(200).json({ resultCode: 1, message: 'Payment callback rejected' });
    }
  }
}

export const paymentsController = new PaymentsController();
