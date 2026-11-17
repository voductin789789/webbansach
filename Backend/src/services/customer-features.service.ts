import type { PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';
import { HttpError } from '../utils/httpError';
import type { AddressInput, ReviewInput } from '../validators/storefront.validator';

export class CustomerFeaturesService {
  constructor(private readonly database: PrismaClient = prisma) {}

  getWishlist(userId: number) {
    return this.database.wishlistItem.findMany({
      where: { userId },
      include: { book: { include: { category: true, reviews: { select: { rating: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToWishlist(userId: number, bookId: number) {
    const book = await this.database.book.findUnique({ where: { id: bookId }, select: { id: true } });
    if (!book) throw new HttpError(404, 'Không tìm thấy sách');

    return this.database.wishlistItem.upsert({
      where: { userId_bookId: { userId, bookId } },
      update: {},
      create: { userId, bookId },
    });
  }

  async removeFromWishlist(userId: number, bookId: number) {
    const result = await this.database.wishlistItem.deleteMany({ where: { userId, bookId } });
    if (result.count === 0) throw new HttpError(404, 'Sách không có trong danh sách yêu thích');
  }

  listAddresses(userId: number) {
    return this.database.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  createAddress(userId: number, data: AddressInput) {
    return this.database.$transaction(async (transaction) => {
      if (data.isDefault) {
        await transaction.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }

      const current = await transaction.address.count({ where: { userId } });
      return transaction.address.create({
        data: { ...data, isDefault: data.isDefault || current === 0, userId },
      });
    });
  }

  async updateAddress(userId: number, addressId: number, data: Partial<AddressInput>) {
    return this.database.$transaction(async (transaction) => {
      const address = await transaction.address.findFirst({ where: { id: addressId, userId } });
      if (!address) throw new HttpError(404, 'Không tìm thấy địa chỉ');
      if (data.isDefault) {
        await transaction.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return transaction.address.update({
        where: { id: addressId },
        data: { ...data, ...(data.isDefault ? { isDefault: true } : {}) },
      });
    });
  }

  async deleteAddress(userId: number, addressId: number) {
    return this.database.$transaction(async (transaction) => {
      const address = await transaction.address.findFirst({ where: { id: addressId, userId } });
      if (!address) throw new HttpError(404, 'Không tìm thấy địa chỉ');
      await transaction.address.delete({ where: { id: addressId } });
      if (address.isDefault) {
        const nextAddress = await transaction.address.findFirst({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
        });
        if (nextAddress) {
          await transaction.address.update({ where: { id: nextAddress.id }, data: { isDefault: true } });
        }
      }
    });
  }

  async createReview(userId: number, bookId: number, data: ReviewInput) {
    const purchased = await this.database.order.findFirst({
      where: {
        userId,
        orderStatus: 'DELIVERED',
        items: { some: { bookId } },
      },
      select: { id: true },
    });
    if (!purchased) throw new HttpError(403, 'Chỉ khách đã nhận sách mới có thể đánh giá');

    return this.database.review.create({
      data: {
        userId,
        bookId,
        rating: data.rating,
        comment: data.comment,
        imageUrls: data.imageUrls,
        verifiedPurchase: true,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async markReviewHelpful(userId: number, reviewId: number) {
    return this.database.$transaction(async (transaction) => {
      const review = await transaction.review.findUnique({ where: { id: reviewId } });
      if (!review) throw new HttpError(404, 'Không tìm thấy đánh giá');
      if (review.userId === userId) throw new HttpError(400, 'Bạn không thể tự đánh dấu đánh giá của mình');

      await transaction.reviewHelpful.create({ data: { userId, reviewId } });
      return transaction.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
        select: { id: true, helpfulCount: true },
      });
    });
  }

  async subscribe(email: string) {
    return this.database.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email },
      select: { id: true, email: true, active: true },
    });
  }
}

export const customerFeaturesService = new CustomerFeaturesService();
