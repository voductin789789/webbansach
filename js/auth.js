/**
 * AUTH.JS - BookStore
 * AuthContext, tokenStorage, xác thực, bảo vệ route
 * FE3: Quản lý đăng nhập, đăng ký, phiên làm việc, phân quyền
 */

/* ==========================================================================
   1. TOKEN STORAGE - Lưu trữ phiên đăng nhập
   ========================================================================== */
const tokenStorage = {
  TOKEN_KEY: 'bookstore_token',
  USER_KEY: 'bookstore_user',

  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  },

  setUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  getUser() {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  removeUser() {
    localStorage.removeItem(this.USER_KEY);
  },

  clear() {
    this.removeToken();
    this.removeUser();
  },

  isLoggedIn() {
    return !!this.getToken() && !!this.getUser();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }
};

/* ==========================================================================
   2. AUTH CONTEXT - Quản lý trạng thái đăng nhập trên UI
   ========================================================================== */
const AuthContext = {
  init() {
    this.updateHeaderUI();
    this.setupLogoutHandlers();
  },

  /**
   * Cập nhật Header hiển thị tên người dùng hoặc "Tài khoản"
   */
  updateHeaderUI() {
    const actionItems = document.querySelectorAll('.action-item');
    const user = tokenStorage.getUser();

    actionItems.forEach(item => {
      const textEl = item.querySelector('.action-text');
      const iconEl = item.querySelector('.action-icon i');

      // Tìm link tài khoản (có class open-auth-modal hoặc href chứa account/login)
      const href = item.getAttribute('href') || '';
      const isAuthLink = item.classList.contains('open-auth-modal') ||
                          href.includes('account') || href.includes('login');

      if (isAuthLink && textEl) {
        if (user) {
          // Đã đăng nhập
          textEl.innerHTML = `<span>Xin chào,</span><span>${user.fullName || user.email}</span>`;
          item.href = 'account.html';
          item.classList.remove('open-auth-modal');
          if (iconEl) {
            iconEl.className = 'fa-solid fa-user-check';
          }
        } else {
          // Chưa đăng nhập
          textEl.innerHTML = '<span>Xin chào!</span><span>Tài khoản</span>';
          item.href = 'login.html';
          if (iconEl) {
            iconEl.className = 'fa-regular fa-user';
          }
        }
      }
    });
  },

  /**
   * Gán sự kiện cho nút đăng xuất
   */
  setupLogoutHandlers() {
    document.querySelectorAll('.btn-logout, .logout-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    });
  },

  /**
   * Đăng xuất
   */
  logout() {
    tokenStorage.clear();
    showToast('Đăng xuất', 'Bạn đã đăng xuất thành công!');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  }
};

/* ==========================================================================
   3. FORM VALIDATION HELPERS
   ========================================================================== */
const Validator = {
  isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isPhone(phone) {
    return /^(0[3-9])\d{8}$/.test(phone.replace(/\s/g, ''));
  },

  minLength(str, min) {
    return str.length >= min;
  },

  isMatch(str1, str2) {
    return str1 === str2;
  },

  isEmpty(str) {
    return !str || str.trim() === '';
  },

  showError(input, message) {
    input.classList.add('invalid');
    let errorEl = input.parentElement.querySelector('.form-error-text');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error-text';
      input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  },

  clearError(input) {
    input.classList.remove('invalid');
    const errorEl = input.parentElement.querySelector('.form-error-text');
    if (errorEl) errorEl.style.display = 'none';
  },

  clearAllErrors(form) {
    form.querySelectorAll('.form-control').forEach(input => {
      this.clearError(input);
    });
  }
};

/* ==========================================================================
   4. ĐĂNG NHẬP
   ========================================================================== */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    Validator.clearAllErrors(form);

    const email = form.querySelector('#loginEmail');
    const password = form.querySelector('#loginPassword');
    let isValid = true;

    if (Validator.isEmpty(email.value)) {
      Validator.showError(email, 'Vui lòng nhập email');
      isValid = false;
    } else if (!Validator.isEmail(email.value)) {
      Validator.showError(email, 'Email không đúng định dạng');
      isValid = false;
    }

    if (Validator.isEmpty(password.value)) {
      Validator.showError(password, 'Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (!Validator.minLength(password.value, 6)) {
      Validator.showError(password, 'Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    if (!isValid) return;

    // Hiện loading
    const btn = form.querySelector('.btn-auth');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...';
    btn.disabled = true;

    // GIẢ LẬP: gọi API POST /api/auth/login
    // Khi BE sẵn sàng, thay bằng fetch('/api/auth/login', ...)
    setTimeout(() => {
      // --- Fake response (thay bằng API thực) ---
      const mockUsers = getMockUsers();
      const foundUser = mockUsers.find(u =>
        u.email === email.value.trim() && u.password === password.value
      );

      if (foundUser) {
        const fakeToken = 'jwt_' + Date.now() + '_' + Math.random().toString(36).substr(2);
        const userData = {
          id: foundUser.id,
          fullName: foundUser.fullName,
          email: foundUser.email,
          phone: foundUser.phone || '',
          address: foundUser.address || '',
          role: foundUser.role
        };

        tokenStorage.setToken(fakeToken);
        tokenStorage.setUser(userData);

        showAuthAlert('success', 'Đăng nhập thành công! Đang chuyển hướng...');

        setTimeout(() => {
          if (userData.role === 'admin') {
            window.location.href = 'admin-books.html';
          } else {
            window.location.href = 'account.html';
          }
        }, 1000);
      } else {
        showAuthAlert('error', 'Email hoặc mật khẩu không đúng!');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }, 800);
  });
}

/* ==========================================================================
   5. ĐĂNG KÝ
   ========================================================================== */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    Validator.clearAllErrors(form);

    const fullName = form.querySelector('#regFullName');
    const email = form.querySelector('#regEmail');
    const phone = form.querySelector('#regPhone');
    const password = form.querySelector('#regPassword');
    const confirmPass = form.querySelector('#regConfirmPassword');
    let isValid = true;

    if (Validator.isEmpty(fullName.value)) {
      Validator.showError(fullName, 'Vui lòng nhập họ và tên');
      isValid = false;
    }

    if (Validator.isEmpty(email.value)) {
      Validator.showError(email, 'Vui lòng nhập email');
      isValid = false;
    } else if (!Validator.isEmail(email.value)) {
      Validator.showError(email, 'Email không đúng định dạng');
      isValid = false;
    }

    if (!Validator.isEmpty(phone.value) && !Validator.isPhone(phone.value)) {
      Validator.showError(phone, 'Số điện thoại không hợp lệ (VD: 0901234567)');
      isValid = false;
    }

    if (Validator.isEmpty(password.value)) {
      Validator.showError(password, 'Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (!Validator.minLength(password.value, 6)) {
      Validator.showError(password, 'Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    if (Validator.isEmpty(confirmPass.value)) {
      Validator.showError(confirmPass, 'Vui lòng xác nhận mật khẩu');
      isValid = false;
    } else if (!Validator.isMatch(password.value, confirmPass.value)) {
      Validator.showError(confirmPass, 'Mật khẩu xác nhận không khớp');
      isValid = false;
    }

    if (!isValid) return;

    const btn = form.querySelector('.btn-auth');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo tài khoản...';
    btn.disabled = true;

    // GIẢ LẬP: gọi API POST /api/auth/register
    setTimeout(() => {
      // Kiểm tra email trùng
      const mockUsers = getMockUsers();
      if (mockUsers.find(u => u.email === email.value.trim())) {
        showAuthAlert('error', 'Email đã được sử dụng! Vui lòng dùng email khác.');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
      }

      // Tạo user mới mock
      const newUser = {
        id: Date.now(),
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        password: password.value,
        role: 'user'
      };
      mockUsers.push(newUser);
      localStorage.setItem('bookstore_mock_users', JSON.stringify(mockUsers));

      showAuthAlert('success', 'Đăng ký thành công! Vui lòng đăng nhập.');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    }, 800);
  });
}

/* ==========================================================================
   6. MOCK DATA USERS (thay bằng API thực khi BE sẵn sàng)
   ========================================================================== */
function getMockUsers() {
  const defaultUsers = [
    {
      id: 1,
      fullName: 'Nguyễn Văn A',
      email: 'user@bookstore.vn',
      phone: '0901234567',
      address: 'Số 123 Đường Nguyễn Huệ, Q.1, TP.HCM',
      password: '123456',
      role: 'user'
    },
    {
      id: 2,
      fullName: 'Admin BookStore',
      email: 'admin@bookstore.vn',
      phone: '0909999888',
      address: 'Số 1 Đường Lê Lợi, Q.1, TP.HCM',
      password: 'admin123',
      role: 'admin'
    }
  ];

  try {
    const stored = localStorage.getItem('bookstore_mock_users');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}

  localStorage.setItem('bookstore_mock_users', JSON.stringify(defaultUsers));
  return defaultUsers;
}

/* ==========================================================================
   7. AUTH ALERT
   ========================================================================== */
function showAuthAlert(type, message) {
  const alertBox = document.querySelector('.auth-alert');
  if (!alertBox) return;

  alertBox.className = 'auth-alert ' + type;
  alertBox.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
    <span>${message}</span>
  `;
}

/* ==========================================================================
   8. TOGGLE PASSWORD VISIBILITY
   ========================================================================== */
function initTogglePassword() {
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-icon-wrap').querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
      } else {
        input.type = 'password';
        btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
      }
    });
  });
}

/* ==========================================================================
   9. PASSWORD STRENGTH INDICATOR
   ========================================================================== */
function initPasswordStrength() {
  const passwordInput = document.querySelector('#regPassword');
  const strengthBar = document.querySelector('.password-strength-bar');
  if (!passwordInput || !strengthBar) return;

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    let strength = 0;

    if (val.length >= 6) strength++;
    if (val.length >= 10) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    strengthBar.className = 'password-strength-bar';
    if (val.length === 0) {
      strengthBar.style.width = '0';
    } else if (strength <= 2) {
      strengthBar.classList.add('weak');
    } else if (strength <= 3) {
      strengthBar.classList.add('medium');
    } else {
      strengthBar.classList.add('strong');
    }
  });
}

/* ==========================================================================
   10. PROTECTED ROUTE & ADMIN ROUTE
   ========================================================================== */
function protectRoute() {
  // Kiểm tra nếu trang yêu cầu đăng nhập
  if (!tokenStorage.isLoggedIn()) {
    showToast('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để truy cập trang này.');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
    return false;
  }
  return true;
}

function protectAdminRoute() {
  if (!tokenStorage.isLoggedIn()) {
    showToast('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để truy cập.');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
    return false;
  }
  if (!tokenStorage.isAdmin()) {
    showToast('Không có quyền truy cập', 'Bạn không có quyền truy cập trang quản trị.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
    return false;
  }
  return true;
}

/* ==========================================================================
   11. KHỞI TẠO AUTH
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Luôn cập nhật header theo trạng thái đăng nhập
  AuthContext.init();

  // Khởi tạo form nếu có
  initLoginForm();
  initRegisterForm();
  initTogglePassword();
  initPasswordStrength();
});
