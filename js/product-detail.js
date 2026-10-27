/* WONDERLAB — product detail: gallery, tabs, quantity stepper, add to cart.
   The page ships with the Robot STEM content in its markup, so it is readable
   without JavaScript; this script swaps in another product when ?sp= is given. */
(function () {
  "use strict";

  var root = document.querySelector("[data-product-root]");
  if (!root) return;

  var catalogue = window.WONDERLAB_PRODUCTS || {};
  var slug = new URLSearchParams(window.location.search).get("sp");
  var product = catalogue[slug] || catalogue["robot-stem"];
  if (!product) return;

  var productId = catalogue[slug] ? slug : "robot-stem";
  var nf = new Intl.NumberFormat("vi-VN");

  function money(value) {
    return nf.format(value) + "đ";
  }

  function setAll(selector, value) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (el) {
      el.textContent = value;
    });
  }

  setAll("[data-name]", product.name);
  setAll("[data-price]", money(product.price));
  setAll("[data-age]", product.age);
  setAll("[data-parts]", product.parts);
  setAll("[data-parts-label]", product.partsLabel || "Số chi tiết");
  setAll("[data-brand]", product.brand || "WONDERLAB");
  setAll("[data-material]", product.material);
  setAll("[data-category]", product.category);
  setAll("[data-summary]", product.summary);
  setAll("[data-crumb]", product.name);
  document.title = product.name + " — WONDERLAB";

  /* gallery --------------------------------------------------------------- */
  var mainImage = document.getElementById("gallery-main");
  var thumbs = document.querySelector("[data-thumbs]");

  if (mainImage) {
    mainImage.src = product.images[0];
    mainImage.alt = product.name;
  }

  if (thumbs) {
    thumbs.textContent = "";

    if (product.images.length < 2) {
      thumbs.hidden = true;
    } else {
      product.images.forEach(function (src, index) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "gallery__thumb";
        button.setAttribute("data-index", String(index));
        button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
        button.setAttribute("aria-label", "Xem ảnh " + (index + 1) + " của " + product.name);

        var img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.width = 160;
        img.height = 160;
        img.loading = "lazy";

        button.appendChild(img);
        thumbs.appendChild(button);
      });
    }

    thumbs.addEventListener("click", function (event) {
      var button = event.target.closest("[data-index]");
      if (!button || !mainImage) return;

      var index = Number(button.getAttribute("data-index"));
      var src = product.images[index];
      if (!src) return;

      mainImage.src = src;
      mainImage.alt = product.name + " — ảnh " + (index + 1);

      Array.prototype.forEach.call(thumbs.querySelectorAll("[data-index]"), function (thumb) {
        thumb.setAttribute("aria-pressed", thumb === button ? "true" : "false");
      });
    });
  }

  /* tab panels ------------------------------------------------------------ */
  var specBody = document.querySelector("[data-panel-specs]");
  var guideBody = document.querySelector("[data-panel-guide]");
  var bodyPanel = document.querySelector("[data-panel-body]");

  if (specBody && product.specs) {
    specBody.textContent = "";
    product.specs.forEach(function (row) {
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = row[0];
      var td = document.createElement("td");
      td.textContent = row[1];
      tr.appendChild(th);
      tr.appendChild(td);
      specBody.appendChild(tr);
    });
  }

  if (guideBody && product.guide) {
    guideBody.textContent = "";
    product.guide.forEach(function (line) {
      var li = document.createElement("li");
      li.textContent = line;
      guideBody.appendChild(li);
    });
  }

  if (bodyPanel && product.body) {
    bodyPanel.textContent = "";
    product.body.forEach(function (paragraph) {
      var p = document.createElement("p");
      p.textContent = paragraph;
      bodyPanel.appendChild(p);
    });
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab, focus) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute("aria-selected", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;

      var panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    });

    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      selectTab(tab, false);
    });

    tab.addEventListener("keydown", function (event) {
      var next = null;

      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs[tabs.length - 1];

      if (next) {
        event.preventDefault();
        selectTab(next, true);
      }
    });
  });

  /* quantity -------------------------------------------------------------- */
  var qtyInput = document.getElementById("qty");
  var buyForm = document.querySelector("[data-buy-form]");
  var buyNow = document.querySelector("[data-buy-now]");

  function currentQty() {
    var value = qtyInput ? parseInt(qtyInput.value, 10) : 1;
    if (isNaN(value)) value = 1;
    return Math.min(20, Math.max(1, value));
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-qty]"), function (button) {
    button.addEventListener("click", function () {
      if (!qtyInput) return;
      var next = currentQty() + Number(button.getAttribute("data-qty"));
      qtyInput.value = String(Math.min(20, Math.max(1, next)));
    });
  });

  if (qtyInput) {
    qtyInput.addEventListener("change", function () {
      qtyInput.value = String(currentQty());
    });
  }

  /* cart ------------------------------------------------------------------ */
  function addCurrent() {
    if (!window.WonderlabCart) return;
    window.WonderlabCart.add({
      id: productId,
      name: product.name,
      price: product.price,
      img: product.images[0],
      url: "product-detail.html?sp=" + productId,
      qty: currentQty()
    });
  }

  if (buyForm) {
    buyForm.addEventListener("submit", function (event) {
      event.preventDefault();
      addCurrent();
    });
  }

  if (buyNow) {
    buyNow.addEventListener("click", function () {
      addCurrent();
      if (window.WonderlabCart) window.WonderlabCart.open();
    });
  }
})();
