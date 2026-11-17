/**
 * MAIN JAVASCRIPT - BOOKSTORE
 * Xử lý tương tác giao diện người dùng (UI/UX)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initAutoSuggestSearch();
  initMobileMenu();
  initAuthModal();
  initProductDetailTabs();
  initThumbnailGallery();
  initQuantityControls();
  updateCartBadge();
});

/* ==========================================================================
   1. HERO SLIDER TỰ ĐỘNG CHUYỂN SLIDE
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide-item');
  const dots = document.querySelectorAll('.slider-dot');
  if (!slides.length) return;

  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove('active'));
    dots.forEach((dot) => dot.classList.remove('active'));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
  }

  function startAutoplay() {
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 4500);
  }

  function stopAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      showSlide(index);
      startAutoplay();
    });
  });

  startAutoplay();
}

/* ==========================================================================
   2. TÌM KIẾM THÔNG MINH VỚI GỢI Ý TỰ ĐỘNG (AUTO-SUGGEST)
   ========================================================================== */
const sampleBooks = [
  {
    id: 1,
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    price: '79.000₫',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    link: 'product-detail.html'
  },
  {
    id: 2,
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    price: '65.000₫',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    link: 'product-detail.html'
  },
  {
    id: 3,
    title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu?',
    author: 'Rosie Nguyễn',
    price: '85.000₫',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    link: 'product-detail.html'
  },
  {
    id: 4,
    title: 'Cây Cam Ngọt Của Tôi',
    author: 'José Mauro de Vasconcelos',
    price: '92.000₫',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=400&q=80',
    link: 'product-detail.html'
  },
  {
    id: 5,
    title: 'Cha Giàu Cha Nghèo',
    author: 'Robert Kiyosaki',
    price: '115.000₫',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80',
    link: 'product-detail.html'
  }
];

function initAutoSuggestSearch() {
  const searchInput = document.querySelector('.search-input');
  const suggestBox = document.querySelector('.search-suggest-box');
  if (!searchInput || !suggestBox) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      suggestBox.classList.remove('active');
      suggestBox.innerHTML = '';
      return;
    }

    const matches = sampleBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query)
    );

    if (matches.length > 0) {
      suggestBox.innerHTML = `
        <div class="suggest-header">Gợi ý tìm kiếm (${matches.length})</div>
        ${matches
          .map(
            (item) => `
            <a href="${item.link}" class="suggest-item">
              <img src="${item.image}" alt="${item.title}">
              <div class="suggest-info">
                <div class="title">${item.title}</div>
                <div class="price">${item.price}</div>
              </div>
            </a>
          `
          )
          .join('')}
      `;
      suggestBox.classList.add('active');
    } else {
      suggestBox.innerHTML = `
        <div class="suggest-header" style="color: #e74c3c; text-align: center;">Không tìm thấy sách phù hợp</div>
      `;
      suggestBox.classList.add('active');
    }
  });

  // Đóng khi click ngoài
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-search')) {
      suggestBox.classList.remove('active');
    }
  });
}

/* ==========================================================================
   3. MOBILE MENU HAMBURGER & DROPDOWN
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (toggleBtn && mainNav) {
    toggleBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  const categoryBtn = document.querySelector('.category-btn');
  const categoryMenu = document.querySelector('.category-menu');
  if (categoryBtn && categoryMenu) {
    categoryBtn.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        categoryMenu.classList.toggle('show');
      }
    });
  }
}

/* ==========================================================================
   4. MODAL ĐĂNG NHẬP / ĐĂNG KÝ
   ========================================================================== */
function initAuthModal() {
  const modal = document.getElementById('authModal');
  const openBtns = document.querySelectorAll('.open-auth-modal');
  const closeBtn = document.querySelector('.modal-close');
  const tabBtns = document.querySelectorAll('.auth-tab-btn');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  if (!modal) return;

  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Chuyển tab Login / Register
  tabBtns.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabBtns.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-target');

      if (formLogin && formRegister) {
        if (target === 'login') {
          formLogin.style.display = 'block';
          formRegister.style.display = 'none';
        } else {
          formLogin.style.display = 'none';
          formRegister.style.display = 'block';
        }
      }
    });
  });
}

/* ==========================================================================
   5. TABS CHI TIẾT SẢN PHẨM (Mô tả, Thông số kỹ thuật, Đánh giá)
   ========================================================================== */
function initProductDetailTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content-item');
  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. GALLERY ĐỔI ẢNH THUMBNAIL
   ========================================================================== */
function initThumbnailGallery() {
  const mainImg = document.getElementById('mainProductImage');
  const thumbs = document.querySelectorAll('.thumb-item');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.getAttribute('data-image');
      if (newSrc) {
        mainImg.src = newSrc;
      }
    });
  });
}

/* ==========================================================================
   7. BỘ TĂNG GIẢM SỐ LƯỢNG
   ========================================================================== */
function initQuantityControls() {
  document.querySelectorAll('.qty-spinner').forEach((spinner) => {
    const btnMinus = spinner.querySelector('.qty-minus');
    const btnPlus = spinner.querySelector('.qty-plus');
    const input = spinner.querySelector('.qty-input');

    if (btnMinus && btnPlus && input) {
      btnMinus.addEventListener('click', () => {
        let val = parseInt(input.value) || 1;
        if (val > 1) {
          input.value = val - 1;
          input.dispatchEvent(new Event('change'));
        }
      });

      btnPlus.addEventListener('click', () => {
        let val = parseInt(input.value) || 1;
        input.value = val + 1;
        input.dispatchEvent(new Event('change'));
      });
    }
  });
}

/* ==========================================================================
   8. TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(title, message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check"></i>
    <div class="toast-msg">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

/* ==========================================================================
   9. CẬP NHẬT BADGE GIỎ HÀNG
   ========================================================================== */
function updateCartBadge() {
  const badge = document.querySelector('.badge-count');
  if (!badge) return;

  const cart = JSON.parse(localStorage.getItem('bookstore_cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  badge.textContent = totalItems;
}

