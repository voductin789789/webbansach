/**
 * ACCOUNT.JS - BookStore
 * Logic trang tài khoản: tab switching, profile, đơn hàng, đổi mật khẩu
 * FE3: Trang /account, /my-orders, profile
 */

document.addEventListener('DOMContentLoaded', () => {
  // Bảo vệ route - yêu cầu đăng nhập
  if (typeof protectRoute === 'function' && !protectRoute()) return;

  initAccountPage();
});

/* ==========================================================================
   1. KHỞI TẠO TRANG TÀI KHOẢN
   ========================================================================== */
function initAccountPage() {
  loadUserProfile();
  loadOrderHistory();
  initAccountTabs();
  initProfileForm();
  initPasswordForm();
  initCancelOrderButtons();
}

/* ==========================================================================
   2. HIỂN THỊ THÔNG TIN USER LÊN SIDEBAR
   ========================================================================== */
function loadUserProfile() {
  const user = tokenStorage.getUser();
  if (!user) return;

  // Avatar (chữ cái đầu)
  const avatarEl = document.querySelector('.user-avatar');
  if (avatarEl) {
    avatarEl.textContent = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
  }

  // Tên & email
  const nameEl = document.querySelector('.user-name');
  if (nameEl) nameEl.textContent = user.fullName || 'Người dùng';

  const emailEl = document.querySelector('.user-email');
  if (emailEl) emailEl.textContent = user.email || '';

  // Điền sẵn form profile
  const profileName = document.querySelector('#profileFullName');
  const profileEmail = document.querySelector('#profileEmail');
  const profilePhone = document.querySelector('#profilePhone');
  const profileAddress = document.querySelector('#profileAddress');

  if (profileName) profileName.value = user.fullName || '';
  if (profileEmail) profileEmail.value = user.email || '';
  if (profilePhone) profilePhone.value = user.phone || '';
  if (profileAddress) profileAddress.value = user.address || '';
}

/* ==========================================================================
   3. TAB SWITCHING
   ========================================================================== */
function initAccountTabs() {
  const navLinks = document.querySelectorAll('.account-nav-list li a[data-tab]');
  const cards = document.querySelectorAll('.account-card[id^="tab-"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');

      // Active link
      navLinks.forEach(a => a.classList.remove('active'));
      link.classList.add('active');

      // Hiện card tương ứng
      cards.forEach(card => card.style.display = 'none');
      const targetCard = document.getElementById('tab-' + tabName);
      if (targetCard) targetCard.style.display = 'block';
    });
  });

  // Check hash URL
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const targetLink = document.querySelector(`.account-nav-list li a[data-tab="${hash}"]`);
    if (targetLink) targetLink.click();
  }
}

/* ==========================================================================
   4. LOAD LỊCH SỬ ĐƠN HÀNG
   ========================================================================== */
function loadOrderHistory() {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  // GIẢ LẬP: gọi API GET /api/orders/my-orders
  // Khi BE sẵn sàng, thay bằng fetch('/api/orders/my-orders', ...)
  const mockOrders = getMockOrders();

  if (mockOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-orders">
        <i class="fa-solid fa-box-open"></i>
        <h3>Chưa có đơn hàng nào</h3>
        <p>Hãy khám phá hàng ngàn đầu sách hay và đặt mua ngay nhé!</p>
        <a href="shop.html" class="btn-primary">
          <i class="fa-solid fa-book-open"></i> Mua sắm ngay
        </a>
      </div>
    `;
    return;
  }

  // Cập nhật đếm đơn hàng
  const countEl = document.querySelector('.order-count');
  if (countEl) countEl.textContent = `Tổng: ${mockOrders.length} đơn hàng`;

  container.innerHTML = mockOrders.map(order => `
    <div class="order-item" data-order-id="${order.id}">
      <div class="order-header">
        <div>
          <span class="order-code">Mã đơn: #${order.code}</span>
          <span class="order-date">Đặt ngày: ${order.date}</span>
        </div>
        <span class="order-status-badge ${getStatusClass(order.status)}">
          <i class="${getStatusIcon(order.status)}"></i> ${getStatusLabel(order.status)}
        </span>
      </div>
      <div class="order-body">
        <div class="order-product">
          <img src="${order.items[0].image}" alt="${order.items[0].name}">
          <div>
            <div class="order-product-name">${order.items[0].name}</div>
            <div class="order-product-qty">
              Số lượng: ${order.items[0].quantity} &bull; Giá: ${formatVND(order.items[0].price)}
              ${order.items.length > 1 ? `<br>và ${order.items.length - 1} sản phẩm khác` : ''}
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <div class="order-total-label">Tổng thanh toán:</div>
          <div class="order-total-price">${formatVND(order.total)}</div>
        </div>
      </div>
      <div class="order-actions">
        <button class="btn-order-detail" onclick="viewOrderDetail('${order.id}')">
          <i class="fa-solid fa-eye"></i> Xem chi tiết
        </button>
        ${order.status === 'pending' ? `
          <button class="btn-cancel-order" data-order-id="${order.id}">
            <i class="fa-solid fa-xmark"></i> Hủy đơn
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');

  // Gán lại sự kiện hủy đơn
  initCancelOrderButtons();
}

/* ==========================================================================
   5. STATUS HELPERS
   ========================================================================== */
function getStatusClass(status) {
  const map = {
    'pending': 'status-pending',
    'processing': 'status-processing',
    'shipping': 'status-shipping',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  };
  return map[status] || 'status-pending';
}

function getStatusIcon(status) {
  const map = {
    'pending': 'fa-solid fa-clock',
    'processing': 'fa-solid fa-gear',
    'shipping': 'fa-solid fa-truck',
    'completed': 'fa-solid fa-circle-check',
    'cancelled': 'fa-solid fa-ban'
  };
  return map[status] || 'fa-solid fa-clock';
}

function getStatusLabel(status) {
  const map = {
    'pending': 'Chờ xác nhận',
    'processing': 'Đang xử lý',
    'shipping': 'Đang giao hàng',
    'completed': 'Đã giao thành công',
    'cancelled': 'Đã hủy'
  };
  return map[status] || 'Chờ xác nhận';
}

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

/* ==========================================================================
   6. XEM CHI TIẾT ĐƠN HÀNG
   ========================================================================== */
function viewOrderDetail(orderId) {
  const orders = getMockOrders();
  const order = orders.find(o => o.id == orderId);
  if (!order) return;

  const overlay = document.getElementById('orderDetailOverlay');
  if (!overlay) return;

  const modal = overlay.querySelector('.order-detail-modal');
  modal.innerHTML = `
    <button class="modal-close" onclick="closeOrderDetail()">&times;</button>
    <h3 class="order-detail-title">
      <i class="fa-solid fa-receipt"></i> Chi Tiết Đơn Hàng #${order.code}
    </h3>

    <div class="order-info-grid">
      <div class="order-info-item">
        <label>Ngày đặt:</label>
        <span>${order.date}</span>
      </div>
      <div class="order-info-item">
        <label>Trạng thái:</label>
        <span class="order-status-badge ${getStatusClass(order.status)}">
          ${getStatusLabel(order.status)}
        </span>
      </div>
      <div class="order-info-item">
        <label>Người nhận:</label>
        <span>${order.receiver || 'Nguyễn Văn A'}</span>
      </div>
      <div class="order-info-item">
        <label>Thanh toán:</label>
        <span>${order.payment || 'COD - Tiền mặt'}</span>
      </div>
      <div class="order-info-item" style="grid-column: 1 / -1;">
        <label>Địa chỉ nhận:</label>
        <span>${order.address || 'Số 123 Đường Nguyễn Huệ, Q.1, TP.HCM'}</span>
      </div>
    </div>

    <div class="order-products-list">
      <h4 style="font-size: 15px; color: var(--primary-color); margin-bottom: 10px;">
        Danh sách sách đã mua:
      </h4>
      ${order.items.map(item => `
        <div class="order-product-row">
          <div style="display: flex; gap: 10px; align-items: center;">
            <img src="${item.image}" style="width: 40px; height: 55px; object-fit: cover; border-radius: 4px;" alt="${item.name}">
            <div>
              <div style="font-weight: 700; font-size: 13px; color: var(--primary-color);">${item.name}</div>
              <div style="font-size: 12px; color: var(--text-muted);">SL: ${item.quantity}</div>
            </div>
          </div>
          <div style="font-weight: 700; color: var(--accent-color);">${formatVND(item.price * item.quantity)}</div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 15px;">
      <div class="order-summary-row">
        <span>Tạm tính:</span>
        <span>${formatVND(order.subtotal || order.total - 25000)}</span>
      </div>
      <div class="order-summary-row">
        <span>Phí vận chuyển:</span>
        <span>25.000₫</span>
      </div>
      <div class="order-summary-row total">
        <span>Tổng thanh toán:</span>
        <span>${formatVND(order.total)}</span>
      </div>
    </div>
  `;

  overlay.classList.add('active');
}

function closeOrderDetail() {
  const overlay = document.getElementById('orderDetailOverlay');
  if (overlay) overlay.classList.remove('active');
}

/* ==========================================================================
   7. HỦY ĐƠN HÀNG (chỉ khi PENDING)
   ========================================================================== */
function initCancelOrderButtons() {
  document.querySelectorAll('.btn-cancel-order').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

      // GIẢ LẬP: gọi API hủy đơn
      // Khi BE2 sẵn sàng, thay bằng fetch('/api/orders/' + orderId + '/cancel', ...)
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang hủy...';
      btn.disabled = true;

      setTimeout(() => {
        // Cập nhật mock data
        const orders = getMockOrders();
        const order = orders.find(o => o.id == orderId);
        if (order) {
          order.status = 'cancelled';
          localStorage.setItem('bookstore_mock_orders', JSON.stringify(orders));
        }

        showToast('Hủy đơn thành công', `Đơn hàng #${order ? order.code : orderId} đã được hủy.`);
        loadOrderHistory(); // reload
      }, 600);
    });
  });
}

/* ==========================================================================
   8. CẬP NHẬT THÔNG TIN CÁ NHÂN
   ========================================================================== */
function initProfileForm() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = form.querySelector('#profileFullName').value.trim();
    const phone = form.querySelector('#profilePhone').value.trim();
    const address = form.querySelector('#profileAddress').value.trim();

    if (!fullName) {
      alert('Vui lòng nhập họ tên!');
      return;
    }

    // GIẢ LẬP: gọi API PUT /api/auth/profile
    const user = tokenStorage.getUser();
    user.fullName = fullName;
    user.phone = phone;
    user.address = address;
    tokenStorage.setUser(user);

    showToast('Cập nhật thành công', 'Thông tin cá nhân đã được lưu.');
    loadUserProfile(); // reload sidebar
    AuthContext.updateHeaderUI(); // reload header
  });
}

/* ==========================================================================
   9. ĐỔI MẬT KHẨU
   ========================================================================== */
function initPasswordForm() {
  const form = document.getElementById('passwordForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentPass = form.querySelector('#currentPassword').value;
    const newPass = form.querySelector('#newPassword').value;
    const confirmPass = form.querySelector('#confirmNewPassword').value;

    if (!currentPass || !newPass || !confirmPass) {
      alert('Vui lòng điền đầy đủ các trường!');
      return;
    }

    if (newPass.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (newPass !== confirmPass) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    // GIẢ LẬP: gọi API đổi mật khẩu
    showToast('Đổi mật khẩu thành công', 'Mật khẩu mới đã được cập nhật.');
    form.reset();
  });
}

/* ==========================================================================
   10. MOCK DATA ĐƠN HÀNG
   ========================================================================== */
function getMockOrders() {
  const defaultOrders = [
    {
      id: 1,
      code: 'BS-98234',
      date: '08/11/2024',
      status: 'shipping',
      receiver: 'Nguyễn Văn A',
      payment: 'COD - Thanh toán khi nhận hàng',
      address: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Q.1, TP.HCM',
      subtotal: 79000,
      total: 104000,
      items: [
        {
          name: 'Đắc Nhân Tâm (Khổ Lớn 2024)',
          quantity: 1,
          price: 79000,
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'
        }
      ]
    },
    {
      id: 2,
      code: 'BS-87112',
      date: '20/10/2024',
      status: 'completed',
      receiver: 'Nguyễn Văn A',
      payment: 'COD - Thanh toán khi nhận hàng',
      address: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Q.1, TP.HCM',
      subtotal: 65000,
      total: 90000,
      items: [
        {
          name: 'Nhà Giả Kim (Tác Phẩm Kinh Điển)',
          quantity: 1,
          price: 65000,
          image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80'
        }
      ]
    },
    {
      id: 3,
      code: 'BS-75501',
      date: '15/09/2024',
      status: 'pending',
      receiver: 'Nguyễn Văn A',
      payment: 'COD - Thanh toán khi nhận hàng',
      address: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Q.1, TP.HCM',
      subtotal: 200000,
      total: 225000,
      items: [
        {
          name: 'Tuổi Trẻ Đáng Giá Bao Nhiêu?',
          quantity: 1,
          price: 85000,
          image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=150&q=80'
        },
        {
          name: 'Cha Giàu Cha Nghèo',
          quantity: 1,
          price: 115000,
          image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=150&q=80'
        }
      ]
    }
  ];

  try {
    const stored = localStorage.getItem('bookstore_mock_orders');
    if (stored) return JSON.parse(stored);
  } catch {}

  localStorage.setItem('bookstore_mock_orders', JSON.stringify(defaultOrders));
  return defaultOrders;
}
