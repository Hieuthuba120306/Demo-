/* WONDERLAB — shared behaviour: mobile nav, demo cart, cart drawer, toast.
   The cart is a client-side demo kept in localStorage. There is no backend,
   no checkout and no order submission. */
(function () {
  "use strict";

  var CART_KEY = "wonderlab_cart_v1";
  var nf = new Intl.NumberFormat("vi-VN");

  function money(value) {
    return nf.format(value) + "đ";
  }

  function readCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      return list.filter(function (item) {
        return item && item.id && Number(item.qty) > 0;
      });
    } catch (error) {
      return [];
    }
  }

  function saveCart(list) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(list));
    } catch (error) {
      /* storage may be unavailable in private mode; the UI still updates */
    }
    paintCart();
  }

  var drawer = document.querySelector("[data-cart-drawer]");
  var itemsEl = document.querySelector("[data-cart-items]");
  var totalEl = document.querySelector("[data-cart-total]");
  var countEls = document.querySelectorAll("[data-cart-count]");
  var lastFocused = null;

  function paintCart() {
    var list = readCart();
    var count = list.reduce(function (sum, item) {
      return sum + Number(item.qty);
    }, 0);

    Array.prototype.forEach.call(countEls, function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });

    if (!itemsEl) return;
    itemsEl.textContent = "";

    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "cart-drawer__empty";
      empty.textContent = "Giỏ hàng đang trống.";
      itemsEl.appendChild(empty);
    }

    var total = 0;

    list.forEach(function (item) {
      total += Number(item.price) * Number(item.qty);

      var row = document.createElement("div");
      row.className = "cart-item";

      var img = document.createElement("img");
      img.className = "cart-item__img";
      img.src = item.img;
      img.alt = "";
      img.width = 64;
      img.height = 64;

      var body = document.createElement("div");

      var name = document.createElement("a");
      name.className = "cart-item__name";
      name.href = item.url;
      name.textContent = item.name;

      var price = document.createElement("p");
      price.className = "cart-item__price";
      price.textContent = money(Number(item.price));

      var actions = document.createElement("div");
      actions.className = "cart-item__row";

      var qty = document.createElement("div");
      qty.className = "cart-item__qty";

      var minus = document.createElement("button");
      minus.type = "button";
      minus.setAttribute("data-cart-qty", "-1");
      minus.setAttribute("data-id", item.id);
      minus.setAttribute("aria-label", "Giảm số lượng " + item.name);
      minus.textContent = "−";

      var qtyValue = document.createElement("span");
      qtyValue.textContent = String(item.qty);

      var plus = document.createElement("button");
      plus.type = "button";
      plus.setAttribute("data-cart-qty", "1");
      plus.setAttribute("data-id", item.id);
      plus.setAttribute("aria-label", "Tăng số lượng " + item.name);
      plus.textContent = "+";

      qty.appendChild(minus);
      qty.appendChild(qtyValue);
      qty.appendChild(plus);

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-item__remove";
      remove.setAttribute("data-cart-remove", "");
      remove.setAttribute("data-id", item.id);
      remove.setAttribute("aria-label", "Xóa " + item.name + " khỏi giỏ hàng");
      remove.textContent = "Xóa";

      actions.appendChild(qty);
      actions.appendChild(remove);
      body.appendChild(name);
      body.appendChild(price);
      body.appendChild(actions);
      row.appendChild(img);
      row.appendChild(body);
      itemsEl.appendChild(row);
    });

    if (totalEl) totalEl.textContent = money(total);
  }

  function addToCart(item) {
    var list = readCart();
    var found = null;

    list.forEach(function (entry) {
      if (entry.id === item.id) found = entry;
    });

    if (found) {
      found.qty = Number(found.qty) + Number(item.qty || 1);
    } else {
      list.push({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        img: item.img,
        url: item.url,
        qty: Number(item.qty || 1),
      });
    }

    saveCart(list);
    showToast("Đã thêm “" + item.name + "” vào giỏ hàng demo.");
  }

  function changeQty(id, delta) {
    var list = readCart();
    list.forEach(function (entry) {
      if (entry.id !== id) return;
      entry.qty = Number(entry.qty) + delta;
    });
    saveCart(
      list.filter(function (entry) {
        return Number(entry.qty) > 0;
      }),
    );
  }

  function removeItem(id) {
    saveCart(
      readCart().filter(function (entry) {
        return entry.id !== id;
      }),
    );
  }

  /* cart drawer ----------------------------------------------------------- */
  function focusable() {
    if (!drawer) return [];
    return Array.prototype.slice.call(
      drawer.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  function onDrawerKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key !== "Tab") return;

    var nodes = focusable();
    if (!nodes.length) return;

    var first = nodes[0];
    var last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    paintCart();
    drawer.hidden = false;
    document.body.classList.add("is-scroll-locked");
    document.addEventListener("keydown", onDrawerKeydown);
    var closeBtn = drawer.querySelector("[data-cart-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    document.body.classList.remove("is-scroll-locked");
    document.removeEventListener("keydown", onDrawerKeydown);
    if (lastFocused && typeof lastFocused.focus === "function")
      lastFocused.focus();
  }

  /* toast ----------------------------------------------------------------- */
  var toast = document.querySelector("[data-toast]");
  var toastText = document.querySelector("[data-toast-text]");
  var toastTimer = null;

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 4000);
  }

  /* clicks ---------------------------------------------------------------- */
  document.addEventListener("click", function (event) {
    var target = event.target;

    if (target.closest("[data-cart-open]")) {
      event.preventDefault();
      openDrawer();
      return;
    }

    if (target.closest("[data-cart-close]")) {
      closeDrawer();
      return;
    }

    if (target.closest("[data-toast-close]")) {
      if (toast) toast.hidden = true;
      return;
    }

    var qtyBtn = target.closest("[data-cart-qty]");
    if (qtyBtn) {
      changeQty(
        qtyBtn.getAttribute("data-id"),
        Number(qtyBtn.getAttribute("data-cart-qty")),
      );
      return;
    }

    var removeBtn = target.closest("[data-cart-remove]");
    if (removeBtn) {
      removeItem(removeBtn.getAttribute("data-id"));
    }
  });

  /* mobile navigation ----------------------------------------------------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navBar = document.querySelector("[data-nav-bar]");

  if (navToggle && navBar) {
    navToggle.addEventListener("click", function () {
      var isOpen = navBar.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  window.WonderlabCart = {
    add: addToCart,
    open: openDrawer,
    showToast: showToast,
  };

  paintCart();
})();
// Chuyển sản phẩm giới thiệu trên trang chủ
(function () {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) return;

  const track = slider.querySelector(".hero-slider__track");
  const slides = track.querySelectorAll(".hero__figure");
  const dotsContainer = slider.querySelector("[data-slider-dots]");
  if (!slides.length) return;

  let current = 0;
  let timer;

  // Tạo các chấm theo số lượng sản phẩm
  const dots = Array.from(slides, function (slide, index) {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "hero-slider__dot";
    dot.setAttribute("aria-label", `Xem sản phẩm ${index + 1}`);

    dot.addEventListener("click", function () {
      showSlide(index);
      startAuto();
    });

    dotsContainer.appendChild(dot);
    return dot;
  });

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    slides.forEach(function (slide, index) {
      const active = index === current;

      slide.inert = !active;
      slide.setAttribute("aria-hidden", String(!active));

      dots[index].classList.toggle("is-active", active);
      dots[index].setAttribute("aria-pressed", String(active));
    });
  }

  function startAuto() {
    clearInterval(timer);

    timer = setInterval(function () {
      showSlide(current + 1);
    }, 4000);
  }

  slider.querySelector("[data-prev]").addEventListener("click", function () {
    showSlide(current - 1);
    startAuto();
  });

  slider.querySelector("[data-next]").addEventListener("click", function () {
    showSlide(current + 1);
    startAuto();
  });

  showSlide(0);
  startAuto();
})();

// Slider banner khuyến mãi
(function () {
  const slider = document.querySelector("[data-promo-slider]");
  if (!slider) return;

  const track = slider.querySelector(".promo__track");
  const slides = track.querySelectorAll(".promo__slide");
  const dotsContainer = slider.parentElement.querySelector("[data-promo-dots]");
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let timer;

  const dots = Array.from(slides, function (slide, index) {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "promo__dot";
    dot.setAttribute("aria-label", `Xem khuyến mãi ${index + 1}`);

    dot.addEventListener("click", function () {
      showSlide(index);
      startAuto();
    });

    dotsContainer.appendChild(dot);
    return dot;
  });

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    slides.forEach(function (slide, index) {
      const active = index === current;

      slide.inert = !active;
      slide.setAttribute("aria-hidden", String(!active));

      dots[index].classList.toggle("is-active", active);
      dots[index].setAttribute("aria-pressed", String(active));
    });
  }

  function startAuto() {
    clearInterval(timer);

    timer = setInterval(function () {
      showSlide(current + 1);
    }, 4000);
  }

  slider
    .querySelector("[data-promo-prev]")
    .addEventListener("click", function () {
      showSlide(current - 1);
      startAuto();
    });

  slider
    .querySelector("[data-promo-next]")
    .addEventListener("click", function () {
      showSlide(current + 1);
      startAuto();
    });

  showSlide(0);
  startAuto();
})();
