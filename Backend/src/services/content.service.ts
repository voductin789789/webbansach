import type { PrismaClient } from '@prisma/client';
import prisma from '../config/prisma';
import { HttpError } from '../utils/httpError';
import type { BlogPostInput } from '../validators/storefront.validator';

const makeSlug = (title: string) => title
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-');

export class ContentService {
  constructor(private readonly database: PrismaClient = prisma) {}

  listPublished() {
    return this.database.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, slug: true, excerpt: true, coverImage: true,
        authorName: true, publishedAt: true, createdAt: true,
      },
    });
  }

  async getPublished(slug: string) {
    const post = await this.database.blogPost.findFirst({ where: { slug, published: true } });
    if (!post) throw new HttpError(404, 'Không tìm thấy bài viết');
    return post;
  }

  listAll() {
    return this.database.blogPost.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async create(data: BlogPostInput) {
    const slug = `${makeSlug(data.title)}-${Date.now()}`;
    return this.database.blogPost.create({
      data: {
        ...data,
        slug,
        publishedAt: data.published ? new Date() : null,
      },
    });
  }

  async update(id: number, data: Partial<BlogPostInput>) {
    const existing = await this.database.blogPost.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'Không tìm thấy bài viết');

    const published = data.published ?? existing.published;
    return this.database.blogPost.update({
      where: { id },
      data: {
        ...data,
        ...(data.title ? { slug: `${makeSlug(data.title)}-${Date.now()}` } : {}),
        publishedAt: published ? (existing.publishedAt ?? new Date()) : null,
      },
    });
  }

  async delete(id: number) {
    const result = await this.database.blogPost.deleteMany({ where: { id } });
    if (!result.count) throw new HttpError(404, 'Không tìm thấy bài viết');
  }
}

export const contentService = new ContentService();
