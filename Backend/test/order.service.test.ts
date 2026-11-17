import assert from 'node:assert/strict';
import test from 'node:test';

type TestOrder = {
  id: number;
  userId: number;
  orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: Array<{
    bookId: number;
    quantity: number;
    allocations: Array<{ batchId: number; quantity: number }>;
  }>;
};

const loadOrderService = async () => {
  process.env.DATABASE_URL ??= 'mysql://root:password@localhost:3306/bookstore_test';
  process.env.JWT_SECRET ??= 'test-secret-with-more-than-thirty-two-characters';
  const { OrderService } = await import('../src/services/order.service');
  return OrderService;
};

const createDatabase = (order: TestOrder, stockByBook: Map<number, number>, failingBookId?: number) => {
  const state = {
    order: {
      ...order,
      items: order.items.map((item) => ({ ...item, allocations: [...item.allocations] })),
    },
    batchStock: new Map([[101, 2]]),
  };
  let restockCalls = 0;
  const cloneOrder = () => ({
    ...state.order,
    items: state.order.items.map((item) => ({ ...item, allocations: [...item.allocations] })),
  });

  const transaction = {
    order: {
      findUnique: async () => cloneOrder(),
      updateMany: async ({ where, data }: {
        where: { id: number; orderStatus: TestOrder['orderStatus'] };
        data: { orderStatus: TestOrder['orderStatus'] };
      }) => {
        if (state.order.id !== where.id || state.order.orderStatus !== where.orderStatus) {
          return { count: 0 };
        }
        state.order.orderStatus = data.orderStatus;
        return { count: 1 };
      },
      findUniqueOrThrow: async () => cloneOrder(),
    },
    book: {
      update: async ({ where, data }: {
        where: { id: number };
        data: { stock: { increment: number } };
      }) => {
        restockCalls += 1;
        stockByBook.set(
          where.id,
          (stockByBook.get(where.id) ?? 0) + data.stock.increment
        );
        if (where.id === failingBookId) {
          throw new Error('Simulated stock update failure');
        }
        return { id: where.id };
      },
    },
    inventoryBatch: {
      update: async ({ where, data }: {
        where: { id: number };
        data: { remainingQuantity: { increment: number } };
      }) => {
        state.batchStock.set(
          where.id,
          (state.batchStock.get(where.id) ?? 0) + data.remainingQuantity.increment
        );
      },
    },
  };

  const database = {
    $transaction: async <T>(run: (tx: typeof transaction) => Promise<T>): Promise<T> => {
      const previousStatus = state.order.orderStatus;
      const previousStock = new Map(stockByBook);
      const previousBatchStock = new Map(state.batchStock);
      try {
        return await run(transaction);
      } catch (error) {
        state.order.orderStatus = previousStatus;
        stockByBook.clear();
        previousStock.forEach((stock, bookId) => stockByBook.set(bookId, stock));
        state.batchStock.clear();
        previousBatchStock.forEach((stock, batchId) => state.batchStock.set(batchId, stock));
        throw error;
      }
    },
  };

  return { database, state, getRestockCalls: () => restockCalls, getBatchStock: (id: number) => state.batchStock.get(id) };
};

const createPendingOrder = (): TestOrder => ({
  id: 21,
  userId: 7,
  orderStatus: 'PENDING',
  items: [
    { bookId: 2, quantity: 2, allocations: [{ batchId: 101, quantity: 2 }] },
    { bookId: 3, quantity: 1, allocations: [] },
  ],
});

test('cancellation restores stock once and rejects a repeated cancellation', async () => {
  const OrderService = await loadOrderService();
  const stocks = new Map([[2, 4], [3, 5]]);
  const fake = createDatabase(createPendingOrder(), stocks);
  const service = new OrderService(fake.database as never);

  const cancelled = await service.cancelOrder(21, 7, 'CUSTOMER');

  assert.equal(cancelled.orderStatus, 'CANCELLED');
  assert.equal(stocks.get(2), 6);
  assert.equal(stocks.get(3), 6);
  assert.equal(fake.getRestockCalls(), 2);
  assert.equal(fake.getBatchStock(101), 4);

  await assert.rejects(
    service.cancelOrder(21, 7, 'CUSTOMER'),
    (error: unknown) => typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409
  );
  assert.equal(stocks.get(2), 6);
  assert.equal(fake.getRestockCalls(), 2);
});

test('a failed stock restoration rolls the order status and all stock back', async () => {
  const OrderService = await loadOrderService();
  const stocks = new Map([[2, 4], [3, 5]]);
  const fake = createDatabase(createPendingOrder(), stocks, 3);
  const service = new OrderService(fake.database as never);

  await assert.rejects(service.cancelOrder(21, 7, 'CUSTOMER'));

  assert.equal(fake.state.order.orderStatus, 'PENDING');
  assert.equal(stocks.get(2), 4);
  assert.equal(stocks.get(3), 5);
});

test('customers cannot cancel another user order; admins cannot cancel shipped orders', async () => {
  const OrderService = await loadOrderService();
  const stocks = new Map([[2, 4], [3, 5]]);
  const pending = createDatabase(createPendingOrder(), stocks);
  const service = new OrderService(pending.database as never);

  await assert.rejects(
    service.cancelOrder(21, 8, 'CUSTOMER'),
    (error: unknown) => typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 404
  );

  const shipped = createDatabase({ ...createPendingOrder(), orderStatus: 'SHIPPED' }, stocks);
  const adminService = new OrderService(shipped.database as never);
  await assert.rejects(
    adminService.cancelOrder(21, 0, 'ADMIN'),
    (error: unknown) => typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409
  );

  assert.equal(shipped.state.order.orderStatus, 'SHIPPED');
});
