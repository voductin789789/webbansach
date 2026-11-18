// Chạy chỉ trên DB TEST đã seed: TEST_CONFIRM=1 TEST_EMAIL=... TEST_PASSWORD=... TEST_BOOK_ID=... npm run test:integration
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const base = process.env.TEST_BASE_URL || 'http://localhost:3000/api';
const enabled = process.env.TEST_CONFIRM === '1' && !!process.env.TEST_EMAIL && !!process.env.TEST_PASSWORD && !!process.env.TEST_BOOK_ID;

async function call(path, method='GET', token, body) {
  const res = await fetch(base+path, {method, headers:{'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{})}, body:body?JSON.stringify(body):undefined});
  const json = await res.json();
  return {status:res.status, body:json};
}

test('Tạo đơn idempotent, hủy đơn hoàn tồn kho đúng một lần', {skip:!enabled}, async () => {
  const login = await call('/auth/login','POST',undefined,{email:process.env.TEST_EMAIL,password:process.env.TEST_PASSWORD});
  assert.equal(login.status,200,'Không đăng nhập được tài khoản TEST');
  const token = login.body.data.token;
  const bookId = Number(process.env.TEST_BOOK_ID);
  const before = await call(`/books/${bookId}`);
  assert.ok(before.body.data.stock >= 1,'Sách test phải còn ít nhất một cuốn');
  const stockBefore = before.body.data.stock;
  const request = { clientRequestId:randomUUID(),recipientName:'Khách kiểm thử',recipientPhone:'0900000000',shippingAddress:'Địa chỉ kiểm thử số 123',paymentMethod:'COD',items:[{bookId,quantity:1}]};
  const first = await call('/orders','POST',token,request);
  assert.equal(first.status,201,'Tạo đơn thất bại');
  const twice = await call('/orders','POST',token,request);
  assert.equal(twice.status,201);
  assert.equal(first.body.data.id,twice.body.data.id,'Lặp yêu cầu phải trả cùng đơn');
  const detailBefore = await call(`/orders/${first.body.data.id}`, 'GET', token);
  assert.equal(detailBefore.status, 200);
  assert.equal(detailBefore.body.data.orderStatus, 'PENDING');
  assert.ok(detailBefore.body.data.statusHistory.some(e => e.toStatus === 'PENDING'), 'Phải có mốc đặt đơn');
  const afterCreate = await call(`/books/${bookId}`);
  assert.equal(afterCreate.body.data.stock,stockBefore-1,'Chỉ giảm kho một lần');
  const cancelled = await call(`/orders/${first.body.data.id}/cancel`,'PATCH',token);
  assert.equal(cancelled.status,200);
  const again = await call(`/orders/${first.body.data.id}/cancel`,'PATCH',token);
  assert.equal(again.status,409,'Hủy lần hai phải bị chặn');
  const detailAfter = await call(`/orders/${first.body.data.id}`, 'GET', token);
  assert.equal(detailAfter.status, 200);
  assert.deepEqual(detailAfter.body.data.statusHistory.map(e => e.toStatus), ['PENDING','CANCELLED'], 'Lịch sử chỉ được ghi một lần cho mỗi trạng thái');
  const afterCancel = await call(`/books/${bookId}`);
  assert.equal(afterCancel.body.data.stock,stockBefore,'Kho phải trở về ban đầu');
});
