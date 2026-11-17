import assert from 'node:assert/strict';
import test from 'node:test';
import { canCancelOrder, getNextOrderStatus } from '../src/services/order.policy';
import { createOrderSchema, updateOrderStatusSchema } from '../src/validators/order.validator';

test('order status can only move forward one step', () => {
  assert.equal(getNextOrderStatus('PENDING'), 'PROCESSING');
  assert.equal(getNextOrderStatus('PROCESSING'), 'SHIPPED');
  assert.equal(getNextOrderStatus('SHIPPED'), 'DELIVERED');
  assert.equal(getNextOrderStatus('DELIVERED'), undefined);
  assert.equal(getNextOrderStatus('CANCELLED'), undefined);
});

test('customers may cancel pending orders; admins may also cancel processing orders', () => {
  assert.equal(canCancelOrder('PENDING', 'CUSTOMER'), true);
  assert.equal(canCancelOrder('PROCESSING', 'CUSTOMER'), false);
  assert.equal(canCancelOrder('PENDING', 'ADMIN'), true);
  assert.equal(canCancelOrder('PROCESSING', 'ADMIN'), true);
  assert.equal(canCancelOrder('SHIPPED', 'ADMIN'), false);
});

test('checkout accepts supported COD and sandbox methods and rejects unknown payment methods', () => {
  const validOrder = {
    recipientName: 'Nguyen Van A',
    recipientPhone: '0912345678',
    shippingAddress: '123 Duong Sach, Quan 1',
    items: [{ bookId: 1, quantity: 1 }],
  };

  assert.equal(createOrderSchema.safeParse(validOrder).success, true);
  assert.equal(createOrderSchema.safeParse({ ...validOrder, paymentMethod: 'VNPAY' }).success, true);
  assert.equal(createOrderSchema.safeParse({ ...validOrder, paymentMethod: 'PAYPAL' }).success, false);
  assert.equal(updateOrderStatusSchema.safeParse({ status: 'CANCELLED' }).success, false);
});
