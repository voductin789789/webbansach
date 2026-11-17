import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';
import { config } from '../config/env';
import type { UserRole } from '../types';
import { HttpError } from '../utils/httpError';
import { signMomoCreate, signVnpay, verifyMomo, verifyVnpay } from './payment-signatures';

type PaymentParams = Record<string, string>;

const toPaymentParams = (input: unknown): PaymentParams => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'Dữ liệu phản hồi thanh toán không hợp lệ');
  }
  return Object.fromEntries(
    Object.entries(input).flatMap(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') return [[key, String(value)]];
      return [];
    })
  );
};

const vnpayDate = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
};

export class PaymentsService {
  constructor(private readonly database: PrismaClient = prisma) {}

  private requireVnpayConfig() {
    if (!config.VNPAY_TMN_CODE || !config.VNPAY_HASH_SECRET || !config.VNPAY_RETURN_URL) {
      throw new HttpError(503, 'VNPay sandbox chưa được cấu hình đầy đủ trên Backend');
    }
    return {
      tmnCode: config.VNPAY_TMN_CODE,
      hashSecret: config.VNPAY_HASH_SECRET,
      returnUrl: config.VNPAY_RETURN_URL,
    };
  }

  private requireMomoConfig() {
    if (!config.MOMO_PARTNER_CODE || !config.MOMO_ACCESS_KEY || !config.MOMO_SECRET_KEY ||
        !config.MOMO_RETURN_URL || !config.MOMO_NOTIFY_URL) {
      throw new HttpError(503, 'MoMo sandbox chưa được cấu hình đầy đủ trên Backend');
    }
    return {
      partnerCode: config.MOMO_PARTNER_CODE,
      accessKey: config.MOMO_ACCESS_KEY,
      secretKey: config.MOMO_SECRET_KEY,
      returnUrl: config.MOMO_RETURN_URL,
      notifyUrl: config.MOMO_NOTIFY_URL,
    };
  }

  async createSession(id: number, userId: number, role: UserRole, ipAddress: string) {
    const order = await this.database.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        orderCode: true,
        totalPrice: true,
        paymentMethod: true,
        paymentStatus: true,
        orderStatus: true,
      },
    });
    if (!order || (role !== 'ADMIN' && order.userId !== userId)) {
      throw new HttpError(404, 'Không tìm thấy đơn hàng');
    }
    if (order.orderStatus !== 'PENDING' || !['UNPAID', 'FAILED'].includes(order.paymentStatus)) {
      throw new HttpError(409, 'Đơn hàng không còn chờ thanh toán');
    }
    if (!Number.isSafeInteger(order.totalPrice) || order.totalPrice <= 0) {
      throw new HttpError(409, 'Tổng tiền đơn hàng không hợp lệ để thanh toán');
    }

    if (order.paymentMethod === 'VNPAY') {
      if (!Number.isSafeInteger(order.totalPrice * 100)) {
        throw new HttpError(409, 'Tổng tiền đơn hàng vượt giới hạn thanh toán VNPay');
      }
      return { paymentUrl: this.createVnpayUrl(order, ipAddress) };
    }
    if (order.paymentMethod === 'MOMO') {
      return { paymentUrl: await this.createMomoUrl(order) };
    }
    throw new HttpError(400, 'Phương thức thanh toán này chưa hỗ trợ thanh toán trực tuyến');
  }

  private createVnpayUrl(order: { id: number; orderCode: string; totalPrice: number }, ipAddress: string) {
    const { tmnCode, hashSecret, returnUrl } = this.requireVnpayConfig();
    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 60 * 1000);
    const params: PaymentParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(order.totalPrice * 100),
      vnp_CreateDate: vnpayDate(now),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: ipAddress.replace(/^::ffff:/, '').slice(0, 45),
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: `${order.id}_${now.getTime()}`,
      vnp_ExpireDate: vnpayDate(expires),
    };
    const url = new URL(config.VNPAY_URL);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('vnp_SecureHash', signVnpay(params, hashSecret));
    return url.toString();
  }

  private async createMomoUrl(order: { id: number; orderCode: string; totalPrice: number }) {
    const { partnerCode, accessKey, secretKey, returnUrl, notifyUrl } = this.requireMomoConfig();
    const params: PaymentParams = {
      partnerCode,
      requestId: randomUUID(),
      amount: String(order.totalPrice),
      orderId: String(order.id),
      orderInfo: `Thanh toan don hang ${order.orderCode}`,
      redirectUrl: returnUrl,
      ipnUrl: notifyUrl,
      requestType: 'payWithMethod',
      extraData: '',
    };
    params.signature = signMomoCreate(params, secretKey, accessKey);
    const response = await fetch(config.MOMO_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, accessKey, lang: 'vi', autoCapture: true }),
    });
    const body = await response.json() as { resultCode?: number; message?: string; payUrl?: string };
    if (!response.ok || body.resultCode !== 0 || !body.payUrl) {
      throw new HttpError(502, `MoMo không tạo được phiên thanh toán: ${body.message || response.statusText}`);
    }
    const paymentUrl = new URL(body.payUrl);
    if (paymentUrl.protocol !== 'https:') throw new HttpError(502, 'MoMo trả về đường dẫn thanh toán không an toàn');
    return paymentUrl.toString();
  }

  async handleVnpayCallback(input: unknown) {
    const params = toPaymentParams(input);
    const { tmnCode, hashSecret } = this.requireVnpayConfig();
    if (!verifyVnpay(params, hashSecret) || params.vnp_TmnCode !== tmnCode) {
      throw new HttpError(401, 'Chữ ký VNPay không hợp lệ');
    }
    const reference = params.vnp_TxnRef ?? '';
    const match = /^(\d+)_\d+$/.exec(reference);
    if (!match) throw new HttpError(400, 'Mã giao dịch VNPay không hợp lệ');
    const orderId = Number(match[1]);
    const order = await this.database.order.findUnique({ where: { id: orderId } });
    if (!order) throw new HttpError(404, 'Không tìm thấy đơn hàng VNPay');
    if (order.paymentMethod !== 'VNPAY' || params.vnp_CurrCode !== 'VND' ||
        Number(params.vnp_Amount) !== order.totalPrice * 100) {
      throw new HttpError(400, 'Số tiền hoặc phương thức thanh toán VNPay không khớp đơn hàng');
    }
    const paid = params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00';
    await this.finalizePayment(order.id, 'VNPAY', paid, params.vnp_TransactionNo || reference);
    return { orderId, paid };
  }

  async handleMomoCallback(input: unknown) {
    const params = toPaymentParams(input);
    const { partnerCode, accessKey, secretKey } = this.requireMomoConfig();
    if (params.partnerCode !== partnerCode || !verifyMomo(params, secretKey, accessKey)) {
      throw new HttpError(401, 'Chữ ký MoMo không hợp lệ');
    }
    const orderId = Number(params.orderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      throw new HttpError(400, 'Mã đơn hàng MoMo không hợp lệ');
    }
    const order = await this.database.order.findUnique({ where: { id: orderId } });
    if (!order) throw new HttpError(404, 'Không tìm thấy đơn hàng MoMo');
    if (order.paymentMethod !== 'MOMO' || Number(params.amount) !== order.totalPrice) {
      throw new HttpError(400, 'Số tiền hoặc phương thức thanh toán MoMo không khớp đơn hàng');
    }
    const paid = params.resultCode === '0';
    await this.finalizePayment(order.id, 'MOMO', paid, params.transId || params.requestId || '');
    return { orderId, paid };
  }

  private async finalizePayment(orderId: number, method: 'VNPAY' | 'MOMO', paid: boolean, reference: string) {
    const order = await this.database.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true, orderStatus: true },
    });
    if (!order) throw new HttpError(404, 'Không tìm thấy đơn hàng');
    if (order.paymentStatus === 'PAID') {
      if (paid) return;
      throw new HttpError(409, 'Đơn hàng đã thanh toán, không thể ghi nhận kết quả thất bại');
    }
    if (order.orderStatus !== 'PENDING') throw new HttpError(409, 'Đơn hàng không còn chờ thanh toán');

    const result = await this.database.order.updateMany({
      where: {
        id: orderId,
        paymentMethod: method,
        orderStatus: 'PENDING',
        paymentStatus: { in: ['UNPAID', 'FAILED'] },
      },
      data: {
        paymentStatus: paid ? 'PAID' : 'FAILED',
        paymentReference: reference,
      },
    });
    if (result.count !== 1) throw new HttpError(409, 'Trạng thái thanh toán vừa thay đổi');
  }
}

export const paymentsService = new PaymentsService();
