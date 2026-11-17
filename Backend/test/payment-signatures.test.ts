import assert from 'node:assert/strict';
import test from 'node:test';
import { signMomo, signMomoCreate, signVnpay, verifyMomo, verifyVnpay } from '../src/services/payment-signatures';

test('VNPay signatures verify only the unchanged sorted payment parameters', () => {
  const params = {
    vnp_Amount: '10000000',
    vnp_Command: 'pay',
    vnp_OrderInfo: 'Thanh toan don hang ORD-123',
    vnp_TmnCode: 'TESTCODE',
  };
  const signature = signVnpay(params, 'test-secret');

  assert.equal(verifyVnpay({ ...params, vnp_SecureHash: signature }, 'test-secret'), true);
  assert.equal(verifyVnpay({ ...params, vnp_Amount: '1', vnp_SecureHash: signature }, 'test-secret'), false);
});

test('MoMo signatures use the documented result fields and reject tampering', () => {
  const params = {
    accessKey: 'access',
    amount: '100000',
    extraData: '',
    message: 'Success',
    orderId: '12',
    orderInfo: 'Thanh toan don hang ORD-12',
    orderType: 'momo_wallet',
    partnerCode: 'partner',
    payType: 'qr',
    requestId: 'request-12',
    responseTime: '1710000000000',
    resultCode: '0',
    transId: 'transaction-12',
  };
  const signature = signMomo(params, 'test-secret');

  assert.equal(verifyMomo({ ...params, signature }, 'test-secret'), true);
  assert.equal(verifyMomo({ ...params, amount: '1', signature }, 'test-secret'), false);
});

test('MoMo create signatures cover the redirect and notify URLs', () => {
  const params = {
    amount: '100000',
    extraData: '',
    ipnUrl: 'https://api.example.test/api/payments/momo/ipn',
    orderId: '12',
    orderInfo: 'Thanh toan don hang 12',
    partnerCode: 'partner',
    redirectUrl: 'https://api.example.test/api/payments/momo/return',
    requestId: 'request-12',
    requestType: 'payWithMethod',
  };
  const signature = signMomoCreate(params, 'test-secret', 'access');

  assert.notEqual(signature, signMomoCreate({ ...params, redirectUrl: 'https://attacker.example/' }, 'test-secret', 'access'));
});

test('gateway signature verification rejects malformed signatures without throwing', () => {
  assert.equal(verifyVnpay({ vnp_SecureHash: 'invalid' }, 'test-secret'), false);
  assert.equal(verifyMomo({ signature: 'invalid' }, 'test-secret'), false);
});
