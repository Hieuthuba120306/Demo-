/* WONDERLAB — catalogue filtering, sorting and URL state.
   Filtering is driven by the product markup itself, so the page still lists
   every product when JavaScript is unavailable. */
(function () {
  "use strict";

  var form = document.querySelector("[data-filters]");
  var grid = document.querySelector("[data-grid]");

  if (!form || !grid) return;

  var items = Array.prototype.slice.call(
    grid.querySelectorAll("[data-product]"),
  );
  var countEls = document.querySelectorAll(
    "[data-count], [data-count-desktop]",
  );
  var activeEl = document.querySelector("[data-active]");
  var emptyEl = document.querySelector("[data-empty]");
  var sortEl = document.querySelector("[data-sort]");
  var applyBtn = document.querySelector("[data-filters-apply]");
  var searchInput = document.querySelector(".search__input");
  var openBtn = document.querySelector("[data-filters-open]");
  var backdrop = document.querySelector(".filters-backdrop");
  var panels = document.querySelectorAll("[data-filters-close]");

  var pagination = document.querySelector("[data-pagination]");
  var pageNumbers = document.querySelector("[data-pages]");
  var pageStatus = document.querySelector("[data-page-status]");
  var previousPage = document.querySelector("[data-page-prev]");
  var nextPage = document.querySelector("[data-page-next]");
  var PAGE_SIZE = 12;
  var currentPage = 1;
  var totalPages = 1;

  var FACETS = ["danh-muc", "tuoi", "gia", "ky-nang"];
  var query = "";

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  }

  function priceBand(price) {
    if (price < 300000) return "duoi-300";
    if (price <= 500000) return "300-500";
    return "tren-500";
  }

  function readState() {
    var state = {};
    FACETS.forEach(function (facet) {
      state[facet] = [];
      Array.prototype.forEach.call(
        form.querySelectorAll('input[name="' + facet + '"]:checked'),
        function (input) {
          state[facet].push(input.value);
        },
      );
    });
    return state;
  }

  function matches(item, state) {
    var ages = (item.getAttribute("data-age") || "").split(/\s+/);
    var skills = (item.getAttribute("data-skills") || "").split(/\s+/);
    var band = priceBand(Number(item.getAttribute("data-price")));

    if (
      state["danh-muc"].length &&
      state["danh-muc"].indexOf(item.getAttribute("data-cat")) === -1
    ) {
      return false;
    }
    if (state.tuoi.length) {
      var ageHit = state.tuoi.some(function (value) {
        return ages.indexOf(value) > -1;
      });
      if (!ageHit) return false;
    }
    if (state.gia.length && state.gia.indexOf(band) === -1) return false;
    if (state["ky-nang"].length) {
      var skillHit = state["ky-nang"].some(function (value) {
        return skills.indexOf(value) > -1;
      });
      if (!skillHit) return false;
    }
    if (
      query &&
      normalize(item.getAttribute("data-name")).indexOf(query) === -1
    )
      return false;
    return true;
  }

  function sortItems(sortKey) {
    var sorted = items.slice();
    sorted.sort(function (a, b) {
      if (sortKey === "price-asc") {
        return (
          Number(a.getAttribute("data-price")) -
          Number(b.getAttribute("data-price"))
        );
      }
      if (sortKey === "price-desc") {
        return (
          Number(b.getAttribute("data-price")) -
          Number(a.getAttribute("data-price"))
        );
      }
      if (sortKey === "name-asc") {
        return normalize(a.getAttribute("data-name")).localeCompare(
          normalize(b.getAttribute("data-name")),
          "vi",
        );
      }
      return (
        Number(a.getAttribute("data-order")) -
        Number(b.getAttribute("data-order"))
      );
    });
    sorted.forEach(function (item) {
      grid.appendChild(item);
    });
    return sorted;
  }

  function writeUrl(state, sortKey) {
    var params = new URLSearchParams();
    FACETS.forEach(function (facet) {
      if (state[facet].length) params.set(facet, state[facet].join(","));
    });
    if (query) params.set("q", searchInput ? searchInput.value : query);
    if (sortKey && sortKey !== "default") params.set("sort", sortKey);
    if (currentPage > 1) params.set("page", String(currentPage));
    var next = params.toString();
    var url = window.location.pathname + (next ? "?" + next : "");
    window.history.replaceState({}, "", url);
  }

  function renderChips(state) {
    if (!activeEl) return;
    activeEl.textContent = "";

    var any = false;

    FACETS.forEach(function (facet) {
      state[facet].forEach(function (value) {
        var input = form.querySelector(
          'input[name="' + facet + '"][value="' + value + '"]',
        );
        if (!input) return;
        var label = input.parentNode.querySelector("span");
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.setAttribute("data-chip-facet", facet);
        chip.setAttribute("data-chip-value", value);

        var text = document.createElement("span");
        text.textContent = label ? label.textContent : value;

        var icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "×";

        chip.appendChild(text);
        chip.appendChild(icon);
        chip.setAttribute(
          "aria-label",
          "Bỏ lọc " + (label ? label.textContent : value),
        );
        activeEl.appendChild(chip);
        any = true;
      });
    });

    activeEl.hidden = !any;
  }

  function renderPagination(total) {
    if (!pagination) return;
    pagination.hidden = total === 0;
    if (previousPage) previousPage.disabled = currentPage === 1;
    if (nextPage) nextPage.disabled = currentPage === totalPages;
    if (pageStatus)
      pageStatus.textContent = "Trang " + currentPage + " / " + totalPages;
    if (!pageNumbers) return;
    pageNumbers.textContent = "";
    for (var page = 1; page <= totalPages; page += 1) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "pagination__button";
      button.textContent = String(page);
      button.setAttribute("data-page", String(page));
      button.setAttribute("aria-label", "Trang " + page);
      if (page === currentPage) button.setAttribute("aria-current", "page");
      pageNumbers.appendChild(button);
    }
  }

  function apply(resetPage) {
    if (resetPage !== false) currentPage = 1;
    var state = readState();
    var sortKey = sortEl ? sortEl.value : "default";
    var filtered = sortItems(sortKey).filter(function (item) {
      return matches(item, state);
    });
    var total = filtered.length;
    totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    var start = (currentPage - 1) * PAGE_SIZE;
    var visibleItems = filtered.slice(start, start + PAGE_SIZE);
    items.forEach(function (item) {
      item.hidden = visibleItems.indexOf(item) === -1;
    });

    Array.prototype.forEach.call(countEls, function (el) {
      el.textContent = total
        ? "Hiển thị " +
          (start + 1) +
          "-" +
          Math.min(start + PAGE_SIZE, total) +
          " trên " +
          total +
          " sản phẩm"
        : "Hiển thị 0 sản phẩm";
    });
    if (applyBtn) applyBtn.textContent = "Xem " + total + " sản phẩm";
    if (emptyEl) emptyEl.hidden = total !== 0;
    renderPagination(total);
    renderChips(state);
    writeUrl(state, sortKey);
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    apply(false);
    var currentButton =
      pageNumbers && pageNumbers.querySelector('[aria-current="page"]');
    if (currentButton) currentButton.focus({ preventScroll: true });
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* restore state from the URL ------------------------------------------- */
  function hydrateFromUrl() {
    var params = new URLSearchParams(window.location.search);

    FACETS.forEach(function (facet) {
      var values = params.getAll(facet).join(",");
      if (!values) return;
      values.split(",").forEach(function (value) {
        var input = form.querySelector(
          'input[name="' + facet + '"][value="' + value + '"]',
        );
        if (input) input.checked = true;
      });
    });

    var q = params.get("q");
    if (q) {
      query = normalize(q);
      if (searchInput) searchInput.value = q;
    }

    var page = params.get("page");
    if (page && /^[1-9]\d*$/.test(page) && isFinite(Number(page))) {
      currentPage = Number(page);
    }

    var sort = params.get("sort");
    if (sort && sortEl) sortEl.value = sort;
  }

  /* events ---------------------------------------------------------------- */
  if (previousPage)
    previousPage.addEventListener("click", function () {
      goToPage(currentPage - 1);
    });
  if (nextPage)
    nextPage.addEventListener("click", function () {
      goToPage(currentPage + 1);
    });
  if (pageNumbers)
    pageNumbers.addEventListener("click", function (event) {
      var button = event.target.closest("[data-page]");
      if (button) goToPage(Number(button.getAttribute("data-page")));
    });

  form.addEventListener("change", apply);

  form.addEventListener("reset", function () {
    window.setTimeout(apply, 0);
  });

  if (sortEl) sortEl.addEventListener("change", apply);

  if (activeEl) {
    activeEl.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-chip-facet]");
      if (!chip) return;
      var input = form.querySelector(
        'input[name="' +
          chip.getAttribute("data-chip-facet") +
          '"][value="' +
          chip.getAttribute("data-chip-value") +
          '"]',
      );
      if (input) input.checked = false;
      apply();
    });
  }

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-filters-reset]"),
    function (btn) {
      btn.addEventListener("click", function () {
        form.reset();
        window.setTimeout(apply, 0);
      });
    },
  );

  /* mobile filter panel -------------------------------------------------- */
  function openFilters() {
    form.classList.add("is-open");
    if (backdrop) backdrop.hidden = false;
    document.body.classList.add("is-scroll-locked");
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    var firstInput = form.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  function closeFilters() {
    form.classList.remove("is-open");
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("is-scroll-locked");
    if (openBtn) {
      openBtn.setAttribute("aria-expanded", "false");
      openBtn.focus();
    }
  }

  if (openBtn) {
    openBtn.addEventListener("click", openFilters);
  }

  Array.prototype.forEach.call(panels, function (btn) {
    btn.addEventListener("click", closeFilters);
  });

  if (applyBtn) {
    applyBtn.addEventListener("click", function () {
      apply();
      closeFilters();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && form.classList.contains("is-open")) {
      closeFilters();
    }
  });

  hydrateFromUrl();
  apply(false);
})();
