/* WONDERLAB — full cart page, shares wonderlab_cart_v1 with main.js */
(function () {
  "use strict";
  var KEY = "wonderlab_cart_v1";
  var root = document.getElementById("cartPageContent");
  if (!root) return;
  var nf = new Intl.NumberFormat("vi-VN");
  function money(n) { return nf.format(Number(n) || 0) + "đ"; }
  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(data) ? data.filter(function (x) {
        return x && x.id && Number(x.qty) > 0;
      }) : [];
    } catch (e) { return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
    // Keep the header badge in sync immediately on this page.
    var count = items.reduce(function (sum, item) { return sum + Number(item.qty); }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });
  }
  function render() {
    var items = read();
    if (!items.length) {
      root.innerHTML = '<section class="cart-empty"><div class="cart-empty__icon" aria-hidden="true">🛒</div><h2>Giỏ hàng đang trống</h2><p>Hãy khám phá những món đồ chơi thú vị dành cho bé nhé!</p><a class="c-btn c-btn--primary" href="products.html">Khám phá sản phẩm</a></section>';
      return;
    }
    var totalQty = 0, total = 0;
    var rows = items.map(function (item) {
      var qty = Number(item.qty), price = Number(item.price);
      var line = qty * price;
      totalQty += qty; total += line;
      return '<article class="cart-page__row">' +
        '<img class="cart-page__img" src="' + escapeAttr(item.img || "") + '" alt="' + escapeAttr(item.name) + '">' +
        '<div><a class="cart-page__name" href="' + escapeAttr(item.url || "products.html") + '">' + escapeHtml(item.name) + '</a>' +
        '<p class="cart-page__price">Đơn giá: ' + money(price) + '</p>' +
        '<div class="cart-page__actions"><div class="cart-page__qty" aria-label="Điều chỉnh số lượng">' +
        '<button type="button" data-cart-action="minus" data-id="' + escapeAttr(item.id) + '" aria-label="Giảm số lượng">−</button>' +
        '<span>' + qty + '</span>' +
        '<button type="button" data-cart-action="plus" data-id="' + escapeAttr(item.id) + '" aria-label="Tăng số lượng">+</button></div>' +
        '<button type="button" class="cart-page__remove" data-cart-action="remove" data-id="' + escapeAttr(item.id) + '">Xóa</button></div></div>' +
        '<div class="cart-page__line-total">' + money(line) + '</div></article>';
    }).join("");
    root.innerHTML = '<div class="cart-page__layout"><section class="cart-page__list" aria-label="Sản phẩm trong giỏ">' + rows +
      '</section><aside class="cart-summary"><h2>Tóm tắt đơn hàng</h2>' +
      '<div class="cart-summary__line"><span>Tổng số lượng</span><strong>' + totalQty + ' sản phẩm</strong></div>' +
      '<div class="cart-summary__line"><span>Tạm tính</span><strong>' + money(total) + '</strong></div>' +
      '<div class="cart-summary__line cart-summary__total"><span>Tổng tiền</span><strong>' + money(total) + '</strong></div>' +
      '<a class="c-btn c-btn--primary" href="products.html">Tiếp tục mua sắm</a>' +
      '<p class="cart-summary__note">Đây là giỏ hàng demo phục vụ học tập. Website chưa tích hợp thanh toán hoặc đặt hàng thật.</p></aside></div>';
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function escapeAttr(value) { return escapeHtml(value); }
  root.addEventListener("click", function (event) {
    var button = event.target.closest("[data-cart-action]");
    if (!button) return;
    var id = button.getAttribute("data-id");
    var action = button.getAttribute("data-cart-action");
    var items = read();
    if (action === "remove") {
      items = items.filter(function (item) { return item.id !== id; });
    } else {
      items.forEach(function (item) {
        if (item.id === id) item.qty = Math.max(1, Number(item.qty) + (action === "plus" ? 1 : -1));
      });
    }
    write(items);
  });
  window.addEventListener("storage", function (event) {
    if (event.key === KEY) render();
  });
  render();
})();