import prisma from '../config/prisma';

const fail = (message: string, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const validId = (value: unknown) => Number.isSafeInteger(value) && Number(value) > 0;
const validQty = (value: unknown) => Number.isSafeInteger(value) && Number(value) > 0;

export class CartService {
  async get(userId: number) {
    const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { book: true }, orderBy: { createdAt: 'asc' } } } });
    return (cart?.items ?? []).map(({ book, quantity }) => ({
      bookId: String(book.id), title: book.title, author: book.author,
      coverImage: book.coverImage ?? '', price: book.discountPrice ?? book.price,
      quantity, stock: book.stock,
    }));
  }

  async add(userId: number, bookId: unknown, quantity: unknown) {
    if (!validId(bookId) || !validQty(quantity)) throw fail('Sách hoặc số lượng không hợp lệ');
    const id = Number(bookId), count = Number(quantity);
    await prisma.$transaction(async tx => {
      const book = await tx.book.findUnique({ where: { id }, select: { stock: true, title: true } });
      if (!book) throw fail('Không tìm thấy sách', 404);
      if (book.stock < count) throw fail(`Sách "${book.title}" chỉ còn ${book.stock} cuốn`, 409);
      const cart = await tx.cart.upsert({ where: { userId }, create: { userId }, update: {} });
      const item = await tx.cartItem.findUnique({ where: { cartId_bookId: { cartId: cart.id, bookId: id } } });
      if ((item?.quantity ?? 0) + count > book.stock) throw fail(`Sách "${book.title}" chỉ còn ${book.stock} cuốn`, 409);
      await tx.cartItem.upsert({ where: { cartId_bookId: { cartId: cart.id, bookId: id } },
        create: { cartId: cart.id, bookId: id, quantity: count }, update: { quantity: { increment: count } } });
    });
    return this.get(userId);
  }

  async setQuantity(userId: number, bookId: unknown, quantity: unknown) {
    if (!validId(bookId) || !validQty(quantity)) throw fail('Sách hoặc số lượng không hợp lệ');
    const id = Number(bookId), count = Number(quantity);
    await prisma.$transaction(async tx => {
      const book = await tx.book.findUnique({ where: { id }, select: { stock: true, title: true } });
      if (!book) throw fail('Không tìm thấy sách', 404);
      if (count > book.stock) throw fail(`Sách "${book.title}" chỉ còn ${book.stock} cuốn`, 409);
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (!cart) throw fail('Sách không có trong giỏ', 404);
      const result = await tx.cartItem.updateMany({ where: { cartId: cart.id, bookId: id }, data: { quantity: count } });
      if (!result.count) throw fail('Sách không có trong giỏ', 404);
    });
    return this.get(userId);
  }

  async remove(userId: number, bookId: unknown) {
    if (!validId(bookId)) throw fail('ID sách không hợp lệ');
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, bookId: Number(bookId) } });
    return this.get(userId);
  }

  async clear(userId: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return [];
  }

  // Giỏ khách vãng lai đồng bộ sau đăng nhập: gộp, không ghi đè giỏ hiện có.
  async merge(userId: number, requested: unknown) {
    if (!Array.isArray(requested) || requested.length > 100) throw fail('Giỏ cần đồng bộ không hợp lệ');
    const combined = new Map<number, number>();
    for (const item of requested) {
      if (!item || !validId(item.bookId) || !validQty(item.quantity)) throw fail('Dữ liệu giỏ không hợp lệ');
      const id = Number(item.bookId), qty = Number(item.quantity);
      if (!Number.isSafeInteger((combined.get(id) ?? 0) + qty)) throw fail('Số lượng vượt giới hạn');
      combined.set(id, (combined.get(id) ?? 0) + qty);
    }
    await prisma.$transaction(async tx => {
      const cart = await tx.cart.upsert({ where: { userId }, create: { userId }, update: {} });
      for (const [bookId, quantity] of combined) {
        const book = await tx.book.findUnique({ where: { id: bookId }, select: { stock: true } });
        if (!book || book.stock <= 0) continue;
        const existing = await tx.cartItem.findUnique({ where: { cartId_bookId: { cartId: cart.id, bookId } } });
        const next = Math.min(book.stock, (existing?.quantity ?? 0) + quantity);
        await tx.cartItem.upsert({ where: { cartId_bookId: { cartId: cart.id, bookId } },
          create: { cartId: cart.id, bookId, quantity: next }, update: { quantity: next } });
      }
    });
    return this.get(userId);
  }
}

export const cartService = new CartService();
