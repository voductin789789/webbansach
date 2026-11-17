import { createHmac, timingSafeEqual } from 'node:crypto';

type PaymentParams = Record<string, string>;

const safeEqualHex = (expected: string, received: string): boolean => {
  if (!/^[\da-f]+$/i.test(received) || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
};

const sign = (algorithm: 'sha256' | 'sha512', secret: string, data: string): string =>
  createHmac(algorithm, secret).update(data, 'utf8').digest('hex');

export const vnpayHashData = (params: PaymentParams): string =>
  new URLSearchParams(
    Object.entries(params)
      .filter(([key, value]) => key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType' && value !== '')
      .sort(([left], [right]) => left.localeCompare(right))
  ).toString();

export const signVnpay = (params: PaymentParams, secret: string): string =>
  sign('sha512', secret, vnpayHashData(params));

export const verifyVnpay = (params: PaymentParams, secret: string): boolean => {
  const received = params.vnp_SecureHash ?? '';
  return safeEqualHex(signVnpay(params, secret), received);
};

const momoFields = [
  'accessKey',
  'amount',
  'extraData',
  'message',
  'orderId',
  'orderInfo',
  'orderType',
  'partnerCode',
  'payType',
  'requestId',
  'responseTime',
  'resultCode',
  'transId',
] as const;

export const momoHashData = (params: PaymentParams, accessKey = params.accessKey ?? ''): string =>
  momoFields.map((key) => `${key}=${key === 'accessKey' ? accessKey : params[key] ?? ''}`).join('&');

export const signMomo = (params: PaymentParams, secret: string, accessKey?: string): string =>
  sign('sha256', secret, momoHashData(params, accessKey));

export const verifyMomo = (params: PaymentParams, secret: string, accessKey?: string): boolean =>
  safeEqualHex(signMomo(params, secret, accessKey), params.signature ?? '');

export const signMomoCreate = (params: PaymentParams, secret: string, accessKey: string): string => {
  const data = [
    `accessKey=${accessKey}`,
    `amount=${params.amount ?? ''}`,
    `extraData=${params.extraData ?? ''}`,
    `ipnUrl=${params.ipnUrl ?? ''}`,
    `orderId=${params.orderId ?? ''}`,
    `orderInfo=${params.orderInfo ?? ''}`,
    `partnerCode=${params.partnerCode ?? ''}`,
    `redirectUrl=${params.redirectUrl ?? ''}`,
    `requestId=${params.requestId ?? ''}`,
    `requestType=${params.requestType ?? ''}`,
  ].join('&');
  return sign('sha256', secret, data);
};
