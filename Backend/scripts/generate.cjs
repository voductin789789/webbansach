
const fs = require("fs");
const path = require("path");

const dataDir = path.resolve(__dirname, "../src/data");
const booksPath = path.join(dataDir, "books.json");
const categoriesPath = path.join(dataDir, "categories.json");

const TARGET = 1000;

// Đọc dữ liệu JSON
function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Kiểm tra file dữ liệu
if (!fs.existsSync(booksPath)) {
    throw new Error("Không tìm thấy books.json");
}

if (!fs.existsSync(categoriesPath)) {
    throw new Error("Không tìm thấy categories.json");
}

const books = readJson(booksPath);
const categories = readJson(categoriesPath);

if (!Array.isArray(books) || !Array.isArray(categories)) {
    throw new Error("Dữ liệu JSON phải là một mảng.");
}

if (categories.length === 0) {
    throw new Error("Chưa có danh mục sách.");
}

if (categories.some(c => !c.slug)) {
    throw new Error("Danh mục phải có slug hợp lệ.");
}

// Giữ nguyên toàn bộ sách đã có
const existingSlugs = new Set(books.map(b => b.slug));

if (existingSlugs.size !== books.length) {
    throw new Error("books.json đang có slug bị trùng.");
}

if (books.length >= TARGET) {
    console.log(`Đã có ${books.length} sách, không cần thêm.`);
    process.exit(0);
}

const originalCount = books.length;
let number = 1;

// Tạo sách mới đến khi đủ 1000
while (books.length < TARGET) {
    const slug = `sach-mau-${String(number).padStart(4, "0")}`;

    if (existingSlugs.has(slug)) {
        number++;
        continue;
    }

    const category = categories[(number - 1) % categories.length];
    const price = 45000 + (number % 25) * 10000;

    const book = {
        title: `Sách mẫu số ${String(number).padStart(4, "0")}`,
        slug,
        author: `Tác giả mẫu ${(number % 80) + 1}`,
        description: `Sách mẫu phục vụ kiểm thử website bán sách, mã ${number}.`,
        price,
        discountPrice: Math.round(price * 0.9),
        stock: 10 + (number % 91),
        coverImage: null,
        pages: 100 + (number % 400),
        publisher: "Nhà xuất bản mẫu",
        publicationYear: 2015 + (number % 12),
        categorySlug: category.slug
    };

    books.push(book);
    existingSlugs.add(slug);
    number++;
}

// Ghi lại dữ liệu, giữ nguyên sách ban đầu
fs.writeFileSync(
    booksPath,
    JSON.stringify(books, null, 2),
    "utf8"
);

console.log("=================================");
console.log(`Sách ban đầu: ${originalCount}`);
console.log(`Sách đã thêm: ${books.length - originalCount}`);
console.log(`Tổng số sách: ${books.length}`);
console.log("=================================");
