import assert from 'node:assert/strict';
import test from 'node:test';
import { signVnpay } from '../src/services/payment-signatures';

const loadPaymentsService = async () => {
  process.env.DATABASE_URL ??= 'mysql://root:password@localhost:3306/bookstore_test';
  process.env.JWT_SECRET ??= 'test-secret-with-more-than-thirty-two-characters';
  process.env.VNPAY_TMN_CODE = 'TESTCODE';
  process.env.VNPAY_HASH_SECRET = 'test-vnpay-secret';
  process.env.VNPAY_RETURN_URL = 'https://api.example.test/api/payments/vnpay/return';
  const { PaymentsService } = await import('../src/services/payments.service');
  return PaymentsService;
};

const createPendingOrder = () => ({
  id: 12,
  userId: 7,
  orderCode: 'ORD-12',
  totalPrice: 25000,
  paymentMethod: 'VNPAY',
  paymentStatus: 'UNPAID',
  orderStatus: 'PENDING',
});

const createDatabase = () => {
  const state = createPendingOrder();
  let updateCalls = 0;
  const database = {
    order: {
      findUnique: async () => ({ ...state }),
      updateMany: async ({ where, data }: {
        where: { id: number; paymentMethod: string; orderStatus: string; paymentStatus: { in: string[] } };
        data: { paymentStatus: string; paymentReference: string };
      }) => {
        if (where.id !== state.id || where.paymentMethod !== state.paymentMethod ||
            where.orderStatus !== state.orderStatus || !where.paymentStatus.in.includes(state.paymentStatus)) {
          return { count: 0 };
        }
        state.paymentStatus = data.paymentStatus;
        updateCalls += 1;
        return { count: 1 };
      },
    },
  };
  return { database, state, getUpdateCalls: () => updateCalls };
};

const signedCallback = (amount: string) => {
  const params = {
    vnp_TmnCode: 'TESTCODE',
    vnp_TxnRef: '12_1710000000000',
    vnp_Amount: amount,
    vnp_CurrCode: 'VND',
    vnp_ResponseCode: '00',
    vnp_TransactionStatus: '00',
    vnp_TransactionNo: 'TXN-12',
  };
  return { ...params, vnp_SecureHash: signVnpay(params, 'test-vnpay-secret') };
};

test('VNPay callback marks an order paid only after signature and amount checks', async () => {
  const PaymentsService = await loadPaymentsService();
  const fake = createDatabase();
  const service = new PaymentsService(fake.database as never);

  const result = await service.handleVnpayCallback(signedCallback('2500000'));

  assert.deepEqual(result, { orderId: 12, paid: true });
  assert.equal(fake.state.paymentStatus, 'PAID');
  assert.equal(fake.getUpdateCalls(), 1);
});

test('VNPay callback rejects a validly signed but incorrect amount without changing the order', async () => {
  const PaymentsService = await loadPaymentsService();
  const fake = createDatabase();
  const service = new PaymentsService(fake.database as never);

  await assert.rejects(
    service.handleVnpayCallback(signedCallback('1')),
    (error: unknown) => typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 400
  );
  assert.equal(fake.state.paymentStatus, 'UNPAID');
  assert.equal(fake.getUpdateCalls(), 0);
});

test('VNPay callback rejects a modified signature without changing the order', async () => {
  const PaymentsService = await loadPaymentsService();
  const fake = createDatabase();
  const service = new PaymentsService(fake.database as never);
  const callback = signedCallback('2500000');

  await assert.rejects(
    service.handleVnpayCallback({ ...callback, vnp_Amount: '1' }),
    (error: unknown) => typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 401
  );
  assert.equal(fake.state.paymentStatus, 'UNPAID');
  assert.equal(fake.getUpdateCalls(), 0);
});
