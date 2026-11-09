/**
 * CART JAVASCRIPT - BOOKSTORE
 * Quản lý giỏ hàng với LocalStorage & tính toán giá
 */

// Lấy danh sách giỏ hàng
function getCart() {
  return JSON.parse(localStorage.getItem('bookstore_cart') || '[]');
}

// Lưu danh sách giỏ hàng
function saveCart(cart) {
  localStorage.setItem('bookstore_cart', JSON.stringify(cart));
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

// Thêm sản phẩm vào giỏ
function addToCart(book) {
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.id === book.id);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += book.quantity || 1;
  } else {
    cart.push({
      id: book.id,
      title: book.title,
      author: book.author || 'Tác giả',
      price: book.price,
      priceNumber: book.priceNumber || parsePriceToNumber(book.price),
      image: book.image,
      quantity: book.quantity || 1
    });
  }

  saveCart(cart);

  if (typeof showToast === 'function') {
    showToast('Đã thêm vào giỏ!', `"${book.title}" đã được thêm.`);
  }
}

// Chuyển đổi định dạng giá chuỗi (ví dụ '79.000₫') sang số (79000)
function parsePriceToNumber(priceStr) {
  if (typeof priceStr === 'number') return priceStr;
  return parseInt(String(priceStr).replace(/[^0-9]/g, '')) || 0;
}

// Định dạng số thành tiền tệ VNĐ
function formatCurrency(number) {
  return new Intl.NumberFormat('vi-VN').format(number) + '₫';
}

// Gắn sự kiện cho các nút "Thêm vào giỏ hàng"
document.addEventListener('DOMContentLoaded', () => {
  // Bắt sự kiện click các nút thêm vào giỏ trên trang chủ & danh mục
  document.querySelectorAll('.btn-add-cart').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const card = button.closest('.book-card');
      if (!card) return;

      const id = card.getAttribute('data-id') || Date.now().toString();
      const title = card.querySelector('.book-title')?.textContent?.trim() || 'Sách Hay';
      const author = card.querySelector('.book-author')?.textContent?.trim() || '';
      const price = card.querySelector('.current-price')?.textContent?.trim() || '80.000₫';
      const image = card.querySelector('.book-cover img')?.getAttribute('src') || '';

      addToCart({
        id: id,
        title: title,
        author: author,
        price: price,
        image: image,
        quantity: 1
      });
    });
  });

  // Bắt sự kiện nút thêm giỏ trên trang chi tiết sách
  const btnDetailAdd = document.querySelector('.btn-add-to-cart-large');
  if (btnDetailAdd) {
    btnDetailAdd.addEventListener('click', (e) => {
      e.preventDefault();
      const title = document.querySelector('.detail-title')?.textContent?.trim() || 'Sách Hay';
      const price = document.querySelector('.detail-price')?.textContent?.trim() || '79.000₫';
      const image = document.getElementById('mainProductImage')?.getAttribute('src') || '';
      const qtyInput = document.querySelector('.qty-input');
      const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

      addToCart({
        id: 'detail-dac-nhan-tam',
        title: title,
        author: 'Dale Carnegie',
        price: price,
        image: image,
        quantity: quantity
      });
    });
  }

  // Khởi tạo hiển thị nếu đang ở trang Cart
  if (document.querySelector('.cart-table-card')) {
    renderCartPage();
  }
});

// Render trang Giỏ hàng
function renderCartPage() {
  const cart = getCart();
  const tableBody = document.querySelector('.cart-table tbody');
  const emptyNotice = document.getElementById('cartEmptyNotice');
  const cartContent = document.querySelector('.cart-layout');

  if (!tableBody) return;

  if (cart.length === 0) {
    if (emptyNotice) emptyNotice.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    return;
  } else {
    if (emptyNotice) emptyNotice.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';
  }

  tableBody.innerHTML = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = (item.priceNumber || parsePriceToNumber(item.price)) * item.quantity;
    subtotal += itemTotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="cart-item-info">
          <img src="${item.image}" alt="${item.title}" class="cart-item-img">
          <div>
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-author">${item.author}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="cart-price">${item.price}</span>
      </td>
      <td>
        <div class="qty-spinner" style="width: 110px;">
          <button type="button" class="qty-btn" onclick="updateItemQuantity(${index}, -1)">-</button>
          <input type="text" class="qty-input" value="${item.quantity}" readonly>
          <button type="button" class="qty-btn" onclick="updateItemQuantity(${index}, 1)">+</button>
        </div>
      </td>
      <td>
        <span class="cart-price" style="color: var(--primary-color);">${formatCurrency(itemTotal)}</span>
      </td>
      <td style="text-align: center;">
        <button type="button" class="cart-remove-btn" onclick="removeCartItem(${index})" title="Xoá sách">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Cập nhật tổng tiền
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const shippingFee = 25000; // Phí ship cố định 25.000đ

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (totalEl) totalEl.textContent = formatCurrency(subtotal + shippingFee);
}

// Cập nhật số lượng trong giỏ hàng
window.updateItemQuantity = function (index, delta) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
    renderCartPage();
  }
};

// Xoá sản phẩm khỏi giỏ hàng
window.removeCartItem = function (index) {
  const cart = getCart();
  if (confirm(`Bạn có chắc muốn xoá "${cart[index]?.title}" khỏi giỏ hàng?`)) {
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
    if (typeof showToast === 'function') {
      showToast('Đã xoá', 'Sản phẩm đã được loại khỏi giỏ hàng.');
    }
  }
};

// Áp dụng mã giảm giá Demo
window.applyCoupon = function () {
  const input = document.getElementById('couponCode');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'GIAM10') {
    alert('Áp dụng thành công mã GIAM10! Giảm 10% tổng hóa đơn.');
  } else if (code === 'FREESHIP') {
    alert('Áp dụng thành công mã FREESHIP! Miễn phí vận chuyển 25.000₫.');
  } else {
    alert('Mã giảm giá không hợp lệ. Bạn thử mã "GIAM10" hoặc "FREESHIP" nhé!');
  }
};

