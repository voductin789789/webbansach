/**
 * ADMIN-BOOKS.JS - BookStore
 * AdminBooks: Quản lý sách (CRUD), tìm kiếm, phân trang
 * FE3: Trang quản trị sách cho Admin
 */

document.addEventListener('DOMContentLoaded', () => {
  // Bảo vệ route Admin
  if (typeof protectAdminRoute === 'function' && !protectAdminRoute()) return;

  initAdminBooks();
});

/* ==========================================================================
   1. DỮ LIỆU MOCK SÁCH
   ========================================================================== */
function getMockBooks() {
  const defaultBooks = [
    {
      id: 1, title: 'Đắc Nhân Tâm (Khổ Lớn 2024)', author: 'Dale Carnegie',
      category: 'Kỹ năng sống', price: 79000, oldPrice: 110000, stock: 185,
      publisher: 'NXB Tổng Hợp TP.HCM', year: 2024, pages: 320,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp'
    },
    {
      id: 2, title: 'Nhà Giả Kim (Kinh Điển)', author: 'Paulo Coelho',
      category: 'Văn học', price: 65000, oldPrice: 86000, stock: 230,
      publisher: 'NXB Trẻ', year: 2023, pages: 228,
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      description: 'Hành trình theo đuổi giấc mơ của chàng chăn cừu'
    },
    {
      id: 3, title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu?', author: 'Rosie Nguyễn',
      category: 'Kỹ năng sống', price: 85000, oldPrice: 105000, stock: 142,
      publisher: 'NXB Hội Nhà Văn', year: 2023, pages: 285,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
      description: 'Trả lời câu hỏi lớn của tuổi trẻ'
    },
    {
      id: 4, title: 'Cây Cam Ngọt Của Tôi', author: 'José Mauro de Vasconcelos',
      category: 'Văn học', price: 92000, oldPrice: 130000, stock: 95,
      publisher: 'NXB Hội Nhà Văn', year: 2024, pages: 244,
      image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=400&q=80',
      description: 'Câu chuyện cảm động về cậu bé 5 tuổi'
    },
    {
      id: 5, title: 'Cha Giàu Cha Nghèo', author: 'Robert Kiyosaki',
      category: 'Kinh tế', price: 115000, oldPrice: 150000, stock: 67,
      publisher: 'NXB Trẻ', year: 2023, pages: 400,
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80',
      description: 'Những bài học tài chính không có trong trường học'
    },
    {
      id: 6, title: 'Sapiens: Lược Sử Loài Người', author: 'Yuval Noah Harari',
      category: 'Lịch sử', price: 189000, oldPrice: 235000, stock: 53,
      publisher: 'NXB Tổng Hợp TP.HCM', year: 2023, pages: 560,
      image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
      description: 'Lịch sử phát triển của loài người'
    },
    {
      id: 7, title: 'Tư Duy Nhanh Và Chậm', author: 'Daniel Kahneman',
      category: 'Tâm lý học', price: 145000, oldPrice: 180000, stock: 12,
      publisher: 'NXB Thế Giới', year: 2022, pages: 496,
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
      description: 'Hai hệ thống tư duy của con người'
    },
    {
      id: 8, title: 'Đi Tìm Lẽ Sống', author: 'Viktor Frankl',
      category: 'Kỹ năng sống', price: 75000, oldPrice: 98000, stock: 0,
      publisher: 'NXB Phụ Nữ Việt Nam', year: 2024, pages: 190,
      image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80',
      description: 'Ý nghĩa cuộc sống từ trại tập trung'
    }
  ];

  try {
    const stored = localStorage.getItem('bookstore_admin_books');
    if (stored) return JSON.parse(stored);
  } catch {}

  localStorage.setItem('bookstore_admin_books', JSON.stringify(defaultBooks));
  return defaultBooks;
}

function saveBooks(books) {
  localStorage.setItem('bookstore_admin_books', JSON.stringify(books));
}

/* ==========================================================================
   2. BIẾN TOÀN CỤC
   ========================================================================== */
let allBooks = [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 6;
let editingBookId = null;

/* ==========================================================================
   3. KHỞI TẠO TRANG
   ========================================================================== */
function initAdminBooks() {
  allBooks = getMockBooks();
  filteredBooks = [...allBooks];

  renderStats();
  renderBooksTable();
  initSearch();
  initFilterCategory();
  initBookFormModal();
  initDeleteConfirmModal();

  // Hiển thị tên admin
  const user = tokenStorage.getUser();
  const adminNameEl = document.querySelector('.admin-user-name');
  if (adminNameEl && user) {
    adminNameEl.textContent = user.fullName || 'Admin';
  }
}

/* ==========================================================================
   4. THỐNG KÊ
   ========================================================================== */
function renderStats() {
  const totalBooks = allBooks.length;
  const totalCategories = [...new Set(allBooks.map(b => b.category))].length;
  const inStock = allBooks.filter(b => b.stock > 0).length;
  const outOfStock = allBooks.filter(b => b.stock === 0).length;

  const statEls = document.querySelectorAll('.stat-card .stat-value');
  if (statEls.length >= 4) {
    statEls[0].textContent = totalBooks;
    statEls[1].textContent = totalCategories;
    statEls[2].textContent = inStock;
    statEls[3].textContent = outOfStock;
  }
}

/* ==========================================================================
   5. RENDER BẢNG SÁCH
   ========================================================================== */
function renderBooksTable() {
  const tbody = document.getElementById('booksTableBody');
  if (!tbody) return;

  const startIdx = (currentPage - 1) * booksPerPage;
  const endIdx = startIdx + booksPerPage;
  const pageBooks = filteredBooks.slice(startIdx, endIdx);

  if (pageBooks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-search" style="font-size: 32px; margin-bottom: 10px; display: block; color: #CBD5E0;"></i>
          Không tìm thấy sách nào phù hợp
        </td>
      </tr>
    `;
    renderPagination();
    return;
  }

  tbody.innerHTML = pageBooks.map((book, idx) => `
    <tr>
      <td>${startIdx + idx + 1}</td>
      <td>
        <div class="book-cell">
          <img src="${book.image}" alt="${book.title}">
          <div>
            <div class="book-cell-title" title="${book.title}">${book.title}</div>
            <div class="book-cell-author">${book.author}</div>
          </div>
        </div>
      </td>
      <td><span class="badge-category">${book.category}</span></td>
      <td class="price-cell">
        ${formatVNDAdmin(book.price)}
        ${book.oldPrice ? `<span class="old">${formatVNDAdmin(book.oldPrice)}</span>` : ''}
      </td>
      <td>
        <span class="badge-stock ${book.stock === 0 ? 'out-stock' : book.stock <= 20 ? 'low-stock' : 'in-stock'}">
          ${book.stock === 0 ? 'Hết hàng' : book.stock + ' cuốn'}
        </span>
      </td>
      <td>${book.year || '-'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action edit" title="Sửa" onclick="openEditBook(${book.id})">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-action delete" title="Xóa" onclick="openDeleteConfirm(${book.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination();
}

function formatVNDAdmin(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

/* ==========================================================================
   6. PHÂN TRANG
   ========================================================================== */
function renderPagination() {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const pageInfo = document.querySelector('.page-info');
  const pageBtns = document.querySelector('.page-btns');

  if (pageInfo) {
    const start = Math.min((currentPage - 1) * booksPerPage + 1, filteredBooks.length);
    const end = Math.min(currentPage * booksPerPage, filteredBooks.length);
    pageInfo.textContent = `Hiển thị ${start}-${end} trong tổng số ${filteredBooks.length} sách`;
  }

  if (pageBtns) {
    let btnsHTML = '';

    // Nút Previous
    btnsHTML += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
      <i class="fa-solid fa-chevron-left"></i>
    </button>`;

    // Các số trang
    for (let i = 1; i <= totalPages; i++) {
      btnsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    // Nút Next
    btnsHTML += `<button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
      <i class="fa-solid fa-chevron-right"></i>
    </button>`;

    pageBtns.innerHTML = btnsHTML;
  }
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderBooksTable();
}

/* ==========================================================================
   7. TÌM KIẾM
   ========================================================================== */
function initSearch() {
  const searchInput = document.getElementById('adminSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    filterBooks(query);
  });
}

function filterBooks(query) {
  const categoryFilter = document.getElementById('filterCategory');
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

  filteredBooks = allBooks.filter(book => {
    const matchSearch = !query ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query);

    const matchCategory = selectedCategory === 'all' ||
      book.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  currentPage = 1;
  renderBooksTable();
}

/* ==========================================================================
   8. LỌC DANH MỤC
   ========================================================================== */
function initFilterCategory() {
  const categoryFilter = document.getElementById('filterCategory');
  if (!categoryFilter) return;

  // Populate categories
  const categories = [...new Set(allBooks.map(b => b.category))];
  categoryFilter.innerHTML = '<option value="all">Tất cả danh mục</option>';
  categories.forEach(cat => {
    categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  categoryFilter.addEventListener('change', () => {
    const searchInput = document.getElementById('adminSearchInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    filterBooks(query);
  });
}

/* ==========================================================================
   9. MODAL THÊM / SỬA SÁCH
   ========================================================================== */
function initBookFormModal() {
  const overlay = document.getElementById('bookFormOverlay');
  if (!overlay) return;

  // Nút mở form thêm
  const addBtn = document.querySelector('.btn-add-new');
  if (addBtn) {
    addBtn.addEventListener('click', () => openAddBook());
  }

  // Nút đóng
  overlay.querySelector('.modal-close').addEventListener('click', () => closeBookForm());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeBookForm();
  });

  // Nút hủy
  overlay.querySelector('.btn-admin-cancel').addEventListener('click', () => closeBookForm());

  // Submit form
  const form = document.getElementById('bookForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveBookForm();
    });
  }

  // Image preview
  const imageInput = document.getElementById('bookImageUrl');
  if (imageInput) {
    imageInput.addEventListener('input', () => {
      const preview = document.getElementById('imagePreview');
      if (preview && imageInput.value) {
        preview.src = imageInput.value;
        preview.style.display = 'block';
      }
    });
  }
}

function openAddBook() {
  editingBookId = null;
  const form = document.getElementById('bookForm');
  if (form) form.reset();

  const preview = document.getElementById('imagePreview');
  if (preview) preview.style.display = 'none';

  const title = document.querySelector('.admin-modal-title span');
  if (title) title.innerHTML = '<i class="fa-solid fa-plus"></i> Thêm Sách Mới';

  const overlay = document.getElementById('bookFormOverlay');
  if (overlay) overlay.classList.add('active');
}

function openEditBook(bookId) {
  const book = allBooks.find(b => b.id === bookId);
  if (!book) return;

  editingBookId = bookId;

  document.getElementById('bookTitle').value = book.title;
  document.getElementById('bookAuthor').value = book.author;
  document.getElementById('bookCategory').value = book.category;
  document.getElementById('bookPrice').value = book.price;
  document.getElementById('bookOldPrice').value = book.oldPrice || '';
  document.getElementById('bookStock').value = book.stock;
  document.getElementById('bookPublisher').value = book.publisher || '';
  document.getElementById('bookYear').value = book.year || '';
  document.getElementById('bookPages').value = book.pages || '';
  document.getElementById('bookImageUrl').value = book.image || '';
  document.getElementById('bookDescription').value = book.description || '';

  const preview = document.getElementById('imagePreview');
  if (preview && book.image) {
    preview.src = book.image;
    preview.style.display = 'block';
  }

  const title = document.querySelector('.admin-modal-title span');
  if (title) title.innerHTML = '<i class="fa-solid fa-pen"></i> Chỉnh Sửa Sách';

  const overlay = document.getElementById('bookFormOverlay');
  if (overlay) overlay.classList.add('active');
}

function closeBookForm() {
  const overlay = document.getElementById('bookFormOverlay');
  if (overlay) overlay.classList.remove('active');
  editingBookId = null;
}

function saveBookForm() {
  const title = document.getElementById('bookTitle').value.trim();
  const author = document.getElementById('bookAuthor').value.trim();
  const category = document.getElementById('bookCategory').value.trim();
  const price = parseInt(document.getElementById('bookPrice').value) || 0;
  const oldPrice = parseInt(document.getElementById('bookOldPrice').value) || 0;
  const stock = parseInt(document.getElementById('bookStock').value) || 0;
  const publisher = document.getElementById('bookPublisher').value.trim();
  const year = parseInt(document.getElementById('bookYear').value) || new Date().getFullYear();
  const pages = parseInt(document.getElementById('bookPages').value) || 0;
  const image = document.getElementById('bookImageUrl').value.trim();
  const description = document.getElementById('bookDescription').value.trim();

  // Validate
  if (!title) { alert('Vui lòng nhập tên sách!'); return; }
  if (!author) { alert('Vui lòng nhập tác giả!'); return; }
  if (!category) { alert('Vui lòng nhập danh mục!'); return; }
  if (price <= 0) { alert('Vui lòng nhập giá bán hợp lệ!'); return; }

  if (editingBookId) {
    // SỬA sách
    const idx = allBooks.findIndex(b => b.id === editingBookId);
    if (idx !== -1) {
      allBooks[idx] = {
        ...allBooks[idx],
        title, author, category, price, oldPrice, stock,
        publisher, year, pages, image, description
      };
    }
    showToast('Cập nhật thành công', `Sách "${title}" đã được sửa.`);
  } else {
    // THÊM sách mới
    const newBook = {
      id: Date.now(),
      title, author, category, price, oldPrice, stock,
      publisher, year, pages,
      image: image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      description
    };
    allBooks.push(newBook);
    showToast('Thêm thành công', `Sách "${title}" đã được thêm vào danh sách.`);
  }

  saveBooks(allBooks);
  filteredBooks = [...allBooks];
  renderStats();
  renderBooksTable();
  closeBookForm();
}

/* ==========================================================================
   10. MODAL XÁC NHẬN XÓA
   ========================================================================== */
let deletingBookId = null;

function initDeleteConfirmModal() {
  const overlay = document.getElementById('deleteConfirmOverlay');
  if (!overlay) return;

  overlay.querySelector('.modal-close').addEventListener('click', () => closeDeleteConfirm());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDeleteConfirm();
  });

  const cancelBtn = overlay.querySelector('.btn-admin-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeDeleteConfirm());

  const confirmBtn = overlay.querySelector('.btn-confirm-delete');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (deletingBookId) {
        deleteBook(deletingBookId);
      }
    });
  }
}

function openDeleteConfirm(bookId) {
  deletingBookId = bookId;
  const book = allBooks.find(b => b.id === bookId);

  const nameEl = document.getElementById('deleteBookName');
  if (nameEl && book) nameEl.textContent = book.title;

  const overlay = document.getElementById('deleteConfirmOverlay');
  if (overlay) overlay.classList.add('active');
}

function closeDeleteConfirm() {
  const overlay = document.getElementById('deleteConfirmOverlay');
  if (overlay) overlay.classList.remove('active');
  deletingBookId = null;
}

function deleteBook(bookId) {
  const book = allBooks.find(b => b.id === bookId);
  allBooks = allBooks.filter(b => b.id !== bookId);
  saveBooks(allBooks);
  filteredBooks = allBooks.filter(b => filteredBooks.some(fb => fb.id === b.id));
  if (filteredBooks.length === 0) filteredBooks = [...allBooks];

  renderStats();
  renderBooksTable();
  closeDeleteConfirm();

  showToast('Xóa thành công', `Sách "${book ? book.title : ''}" đã được xóa.`);
}
