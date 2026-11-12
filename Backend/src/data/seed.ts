
import prisma from '../config/prisma';
import { hash } from 'bcrypt';
import fs from 'fs';
import path from 'path';

// ============================================================
// HELPER: Đọc dữ liệu từ file JSON
// ============================================================

function loadJson<T>(filename: string): T {
    const filePath = path.resolve(__dirname, filename);

    if (!fs.existsSync(filePath)) {
        throw new Error(`Không tìm thấy file: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
}

// ============================================================
// TYPES
// ============================================================

interface SeedUser {
    name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'ADMIN';
}

interface SeedCategory {
    name: string;
    slug: string;
    description?: string | null;
}

interface SeedBook {
    title: string;
    slug: string;
    author: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    description?: string | null;
    coverImage?: string | null;
    categorySlug: string;
}

// ============================================================
// 1. SEED USERS
// ============================================================

async function seedUsers(): Promise<void> {
    console.log('Seeding users...');

    const users = loadJson<SeedUser[]>('users.json');

    for (const user of users) {
        const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (existingUser) {
            console.log(`User đã tồn tại: ${user.email}`);
            continue;
        }

        const hashedPassword = await hash(user.password, 10);

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role,
            },
        });
    }

    console.log('Seed users hoàn tất.');
}

// ============================================================
// 2. SEED CATEGORIES
// ============================================================

async function seedCategories(): Promise<void> {
    console.log('Seeding categories...');

    const categories = loadJson<SeedCategory[]>('categories.json');

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: {
                name: category.name,
                slug: category.slug,
                description: category.description ?? null,
            },
        });
    }

    console.log('Seed categories hoàn tất.');
}

// ============================================================
// 3. SEED BOOKS
// ============================================================

async function seedBooks(): Promise<void> {
    console.log('Seeding books...');

    const books = loadJson<SeedBook[]>('books.json');

    const categories = await prisma.category.findMany({
        select: {
            id: true,
            slug: true,
        },
    });

    
const categoryMap = new Map<string, number>(
    categories.map((category: { id: number; slug: string }) => [
        category.slug,
        category.id,
    ])
);


    for (const book of books) {
        const categoryId = categoryMap.get(book.categorySlug);

        if (categoryId === undefined) {
            console.warn(
                `Không tìm thấy danh mục "${book.categorySlug}" cho sách "${book.title}".`
            );
            continue;
        }

        await prisma.book.upsert({
            where: { slug: book.slug },
            update: {},
            create: {
                title: book.title,
                slug: book.slug,
                author: book.author,
                price: book.price,
                discountPrice: book.discountPrice ?? null,
                stock: book.stock,
                description: book.description ?? null,
                coverImage: book.coverImage ?? null,
                categoryId,
            },
        });
    }

    console.log('Seed books hoàn tất.');
}

// ============================================================
// 4. SEED CARTS
// ============================================================

async function seedCarts(): Promise<void> {
    console.log('Seeding carts...');

    const users = await prisma.user.findMany({
        select: { id: true },
    });

    for (const user of users) {
        await prisma.cart.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
            },
        });
    }

    console.log('Seed carts hoàn tất.');
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
    console.log('Bắt đầu seed dữ liệu Website Bán Sách...');

    await seedUsers();
    await seedCategories();
    await seedBooks();
    await seedCarts();

    console.log('Seed dữ liệu hoàn tất!');
}

// ============================================================
// EXECUTION
// ============================================================

main()
    .catch((error: unknown) => {
        console.error('Lỗi khi seed dữ liệu:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
