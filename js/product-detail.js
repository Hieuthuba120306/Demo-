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
  var galleryVideoBox = document.getElementById("gallery-video-box");
  var galleryVideo = document.getElementById("gallery-video");
  var galleryVideoPill = document.querySelector("[data-play-main-video]");
  var thumbs = document.querySelector("[data-thumbs]");

  if (mainImage) {
    mainImage.src = product.images[0];
    mainImage.alt = product.name;
    mainImage.hidden = false;
  }
  if (galleryVideoBox) {
    galleryVideoBox.hidden = true;
  }

  if (product.video && galleryVideo) {
    galleryVideo.src = product.video;
    galleryVideo.poster = product.images[0] || "";
    galleryVideo.load();
    if (galleryVideoPill) galleryVideoPill.hidden = false;
  } else {
    if (galleryVideoPill) galleryVideoPill.hidden = true;
  }

  function showGalleryVideo() {
    if (!product.video || !galleryVideoBox || !mainImage) return;
    mainImage.hidden = true;
    galleryVideoBox.hidden = false;
    if (galleryVideoPill) galleryVideoPill.hidden = true;
    if (galleryVideo) galleryVideo.play().catch(function () {});

    if (thumbs) {
      Array.prototype.forEach.call(thumbs.querySelectorAll(".gallery__thumb"), function (thumb) {
        thumb.setAttribute("aria-pressed", thumb.getAttribute("data-type") === "video" ? "true" : "false");
      });
    }
  }

  function showGalleryImage(index) {
    var src = product.images[index];
    if (!src || !mainImage) return;

    if (galleryVideo) galleryVideo.pause();
    if (galleryVideoBox) galleryVideoBox.hidden = true;
    mainImage.hidden = false;
    mainImage.src = src;
    mainImage.alt = product.name + " — ảnh " + (index + 1);
    if (galleryVideoPill && product.video) galleryVideoPill.hidden = false;

    if (thumbs) {
      Array.prototype.forEach.call(thumbs.querySelectorAll(".gallery__thumb"), function (thumb) {
        var isTarget = thumb.getAttribute("data-type") === "image" && Number(thumb.getAttribute("data-index")) === index;
        thumb.setAttribute("aria-pressed", isTarget ? "true" : "false");
      });
    }
  }

  if (galleryVideoPill) {
    galleryVideoPill.addEventListener("click", showGalleryVideo);
  }

  if (thumbs) {
    thumbs.textContent = "";

    var totalItems = product.images.length + (product.video ? 1 : 0);

    if (totalItems < 2) {
      thumbs.hidden = true;
    } else {
      thumbs.hidden = false;

      // Add image thumbnails
      product.images.forEach(function (src, index) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "gallery__thumb";
        button.setAttribute("data-type", "image");
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

      // Add video thumbnail if product has video
      if (product.video) {
        var vButton = document.createElement("button");
        vButton.type = "button";
        vButton.className = "gallery__thumb gallery__thumb--video";
        vButton.setAttribute("data-type", "video");
        vButton.setAttribute("aria-pressed", "false");
        vButton.setAttribute("aria-label", "Xem video thực tế " + product.name);

        var vIcon = document.createElement("div");
        vIcon.className = "thumb-video-icon";
        vIcon.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

        var vImg = document.createElement("img");
        vImg.src = product.images[0] || "";
        vImg.alt = "";
        vImg.width = 160;
        vImg.height = 160;
        vImg.loading = "lazy";

        var vBadge = document.createElement("span");
        vBadge.className = "thumb-video-badge";
        vBadge.textContent = "Video";

        vButton.appendChild(vIcon);
        vButton.appendChild(vImg);
        vButton.appendChild(vBadge);
        thumbs.appendChild(vButton);
      }
    }

    thumbs.addEventListener("click", function (event) {
      var button = event.target.closest(".gallery__thumb");
      if (!button) return;

      var type = button.getAttribute("data-type");
      if (type === "video") {
        showGalleryVideo();
      } else {
        var index = Number(button.getAttribute("data-index"));
        showGalleryImage(index);
      }
    });
  }

  // Quick jump to video from rating badge
  var jumpVideoBtn = document.querySelector("[data-jump-video]");
  if (jumpVideoBtn) {
    if (product.video) {
      jumpVideoBtn.hidden = false;
      jumpVideoBtn.addEventListener("click", function (e) {
        e.preventDefault();
        showGalleryVideo();
        var galleryEl = document.querySelector(".gallery");
        if (galleryEl) galleryEl.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } else {
      jumpVideoBtn.hidden = true;
    }
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
    /* a body block is a paragraph string, { h: "heading" } or { ul: ["item", …] } */
    product.body.forEach(function (block) {
      var el;

      if (typeof block === "string") {
        el = document.createElement("p");
        el.textContent = block;
      } else if (block.h) {
        el = document.createElement("h2");
        el.textContent = block.h;
      } else if (block.ul) {
        el = document.createElement("ul");
        el.className = "spec-list";
        block.ul.forEach(function (text) {
          var li = document.createElement("li");
          li.textContent = text;
          el.appendChild(li);
        });
      }

      if (el) bodyPanel.appendChild(el);
    });
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab, focus) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute("aria-selected", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;

      var panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) {
        panel.hidden = !selected;
        if (!selected) {
          var vid = panel.querySelector("video");
          if (vid && typeof vid.pause === "function") vid.pause();
        }
      }
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

  /* video showcases & tabs ------------------------------------------------- */
  var videoTab = document.querySelector("[data-tab-video]");
  var tabVideoPlayer = document.getElementById("tab-video-player");
  var overviewVideoCard = document.querySelector("[data-overview-video-card]");

  if (product.video) {
    if (videoTab) videoTab.hidden = false;
    if (overviewVideoCard) {
      overviewVideoCard.hidden = false;
      setAll("[data-overview-video-title]", "Xem video thực tế: " + product.name);
      var overviewThumb = document.querySelector("[data-overview-video-thumb]");
      if (overviewThumb) overviewThumb.src = product.images[0] || "";
    }
    if (tabVideoPlayer) {
      tabVideoPlayer.src = product.video;
      tabVideoPlayer.poster = product.images[0] || "";
      tabVideoPlayer.load();
      setAll("[data-tab-video-title]", "Video thực tế: " + product.name);
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-switch-to-video-tab]"), function (el) {
      el.addEventListener("click", function () {
        if (videoTab) {
          selectTab(videoTab, false);
          videoTab.scrollIntoView({ behavior: "smooth", block: "center" });
          if (tabVideoPlayer) tabVideoPlayer.play().catch(function () {});
        }
      });
    });
  } else {
    if (videoTab) videoTab.hidden = true;
    if (overviewVideoCard) overviewVideoCard.hidden = true;
  }

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

  /* customer reviews & ratings -------------------------------------------- */
  var DEFAULT_REVIEWS = [
    {
      author: "Chị Minh Thư (Mẹ bé 5 tuổi)",
      rating: 5,
      date: "3 ngày trước",
      title: "Chất liệu gỗ rất đẹp, bé chơi say mê!",
      comment: "Sản phẩm đóng gói rất cẩn thận, mở hộp ra là ưng ngay vì gỗ nhẵn mịn, hoàn toàn không có dăm hay mùi sơn khó chịu. Bé nhà mình ngồi chơi mải miết cả buổi chiều mà không đòi xem tivi nữa. Rất đáng tiền!",
      verified: true
    },
    {
      author: "Anh Hoàng Nam (Hà Nội)",
      rating: 5,
      date: "1 tuần trước",
      title: "Giúp con vừa chơi vừa học rất bổ ích",
      comment: "Mình mua tặng sinh nhật con, bé thích lắm luôn. Chi tiết chắc chắn, màu sắc trang nhã đúng chuẩn giáo dục Montessori. Điểm cộng lớn là giao hàng nhanh và tư vấn nhiệt tình.",
      verified: true
    },
    {
      author: "Mẹ bé Bắp (Đà Nẵng)",
      rating: 4,
      date: "2 tuần trước",
      title: "Chất lượng tốt, rèn tính kiên nhẫn rõ rệt",
      comment: "Đồ chơi kích thích tư duy tốt, các chi tiết ăn khớp chuẩn xác. Ban đầu bé hơi lúng túng nhưng được bố mẹ hướng dẫn một chút là tự chơi được ngay. Sẽ ủng hộ WONDERLAB thêm các món khác!",
      verified: true
    },
    {
      author: "Cô Thanh Hằng (Giáo viên mầm non)",
      rating: 5,
      date: "3 tuần trước",
      title: "Rất phù hợp cho hoạt động nhóm và góc học tập",
      comment: "Mình mua cho lớp học ở trường, các bé thi nhau lắp ráp và tương tác rất hào hứng. Đồ chơi bằng vật liệu an toàn, bền bỉ qua nhiều lượt chơi của trẻ.",
      verified: true
    }
  ];

  function getStoredReviews(pid) {
    try {
      var raw = localStorage.getItem("wonderlab_reviews_" + pid);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredReviews(pid, list) {
    try {
      localStorage.setItem("wonderlab_reviews_" + pid, JSON.stringify(list));
    } catch (e) {}
  }

  function starString(rating) {
    var full = Math.round(rating);
    var res = "";
    for (var i = 0; i < 5; i++) {
      res += i < full ? "★" : "☆";
    }
    return res;
  }

  function initReviews() {
    var stored = getStoredReviews(productId);
    var baseReviews = (product && Array.isArray(product.reviews) && product.reviews.length > 0)
      ? product.reviews
      : DEFAULT_REVIEWS;
    var allReviews = stored.concat(baseReviews);

    var baseCount = (product && typeof product.reviewCount === "number") ? product.reviewCount : baseReviews.length;
    var totalReviews = baseCount + stored.length;

    var baseScore = (product && typeof product.rating === "number") ? product.rating : 4.9;
    var avg = baseScore;
    if (stored.length > 0) {
      var userSum = 0;
      stored.forEach(function (r) { userSum += r.rating; });
      avg = (baseScore * baseCount + userSum) / totalReviews;
    }
    var avgStr = Number(avg).toFixed(1);

    var dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(function (r) {
      var starKey = Math.min(5, Math.max(1, Math.round(r.rating)));
      dist[starKey] = (dist[starKey] || 0) + 1;
    });

    var p5 = Math.round((dist[5] / allReviews.length) * 100);
    var p4 = Math.round((dist[4] / allReviews.length) * 100);
    var p3 = Math.round((dist[3] / allReviews.length) * 100);
    var p2 = Math.round((dist[2] / allReviews.length) * 100);
    var p1 = Math.max(0, 100 - (p5 + p4 + p3 + p2));
    var distMap = { 5: p5, 4: p4, 3: p3, 2: p2, 1: p1 };

    // Set numbers in UI
    setAll("[data-rating-score]", avgStr);
    setAll("[data-score-main]", avgStr);
    setAll("[data-review-count]", String(totalReviews));
    setAll("[data-tab-review-count]", String(totalReviews));
    setAll("[data-review-count-bold]", String(totalReviews));
    setAll("[data-review-count-list]", String(allReviews.length));

    var starsText = starString(parseFloat(avgStr));
    setAll("[data-stars-inline]", starsText);
    setAll("[data-stars-main]", starsText);

    // Update distribution bars
    for (var s = 1; s <= 5; s++) {
      var pct = distMap[s] || 0;
      var fillEl = document.querySelector("[data-dist-" + s + "]");
      var pctEl = document.querySelector("[data-dist-pct-" + s + "]");
      if (fillEl) fillEl.style.width = pct + "%";
      if (pctEl) pctEl.textContent = pct + "%";
    }

    // Render review cards list
    var listContainer = document.querySelector("[data-reviews-list]");
    if (listContainer) {
      listContainer.textContent = "";
      allReviews.forEach(function (rev) {
        var card = document.createElement("article");
        card.className = "review-card";

        var header = document.createElement("div");
        header.className = "review-card__header";

        var authorBox = document.createElement("div");
        authorBox.className = "review-author";

        var avatar = document.createElement("div");
        avatar.className = "review-avatar";
        avatar.textContent = (rev.author || "K").trim().charAt(0).toUpperCase();

        var authorInfo = document.createElement("div");
        authorInfo.className = "review-author__info";

        var authorName = document.createElement("span");
        authorName.className = "review-author__name";
        authorName.textContent = rev.author;

        var verified = document.createElement("span");
        verified.className = "review-verified-badge";
        verified.innerHTML = '<svg class="icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg> Đã mua tại WONDERLAB';

        authorInfo.appendChild(authorName);
        if (rev.verified !== false) authorInfo.appendChild(verified);

        authorBox.appendChild(avatar);
        authorBox.appendChild(authorInfo);

        var dateEl = document.createElement("span");
        dateEl.className = "review-date";
        dateEl.textContent = rev.date || "Vừa xong";

        header.appendChild(authorBox);
        header.appendChild(dateEl);

        var ratingDiv = document.createElement("div");
        ratingDiv.className = "review-card__rating";
        var starsSpan = document.createElement("span");
        starsSpan.className = "review-stars-mini";
        starsSpan.textContent = starString(rev.rating);
        ratingDiv.appendChild(starsSpan);

        var titleEl = document.createElement("h4");
        titleEl.className = "review-card__title";
        titleEl.textContent = rev.title;

        var contentEl = document.createElement("p");
        contentEl.className = "review-card__content";
        contentEl.textContent = rev.comment;

        card.appendChild(header);
        card.appendChild(ratingDiv);
        card.appendChild(titleEl);
        card.appendChild(contentEl);

        listContainer.appendChild(card);
      });
    }
  }

  initReviews();

  // Jump to reviews tab when clicking rating badge
  var jumpLink = document.querySelector("[data-jump-reviews]");
  if (jumpLink) {
    jumpLink.addEventListener("click", function (event) {
      event.preventDefault();
      var reviewTab = document.getElementById("tab-danhgia");
      if (reviewTab) {
        selectTab(reviewTab, false);
        var reviewPanel = document.getElementById("panel-danhgia");
        if (reviewPanel) {
          reviewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  // Toggle review form
  var formCard = document.querySelector("[data-review-form-card]");
  var toggleBtn = document.querySelector("[data-toggle-review-form]");
  var closeBtns = document.querySelectorAll("[data-close-review-form]");

  if (toggleBtn && formCard) {
    toggleBtn.addEventListener("click", function () {
      formCard.hidden = !formCard.hidden;
      if (!formCard.hidden) {
        formCard.scrollIntoView({ behavior: "smooth", block: "center" });
        var firstInput = formCard.querySelector("input[name='author']");
        if (firstInput) firstInput.focus();
      }
    });
  }

  if (closeBtns && formCard) {
    Array.prototype.forEach.call(closeBtns, function (btn) {
      btn.addEventListener("click", function () {
        formCard.hidden = true;
      });
    });
  }

  // Star picker in review form
  var starButtons = document.querySelectorAll("[data-star-picker] button");
  var ratingInput = document.querySelector("[data-rating-input]");
  var starLabel = document.querySelector("[data-star-label]");

  var STAR_LABELS = {
    1: "Cần cải thiện (1/5 sao)",
    2: "Tạm ổn (2/5 sao)",
    3: "Hài lòng (3/5 sao)",
    4: "Rất tốt (4/5 sao)",
    5: "Tuyệt vời (5/5 sao)"
  };

  function setPickerScore(val) {
    if (ratingInput) ratingInput.value = String(val);
    if (starLabel) starLabel.textContent = STAR_LABELS[val] || (val + "/5 sao");
    Array.prototype.forEach.call(starButtons, function (btn) {
      var btnVal = Number(btn.getAttribute("data-val"));
      btn.classList.toggle("is-active", btnVal <= val);
    });
  }

  Array.prototype.forEach.call(starButtons, function (btn) {
    btn.addEventListener("click", function () {
      var val = Number(btn.getAttribute("data-val"));
      setPickerScore(val);
    });
  });

  // Submit review form
  var reviewForm = document.querySelector("[data-user-review-form]");
  if (reviewForm) {
    reviewForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var authorVal = (reviewForm.querySelector("[name='author']").value || "").trim();
      var titleVal = (reviewForm.querySelector("[name='title']").value || "").trim();
      var commentVal = (reviewForm.querySelector("[name='comment']").value || "").trim();
      var scoreVal = Number(ratingInput ? ratingInput.value : 5) || 5;

      if (!authorVal || !titleVal || !commentVal) return;

      var newRev = {
        author: authorVal,
        rating: scoreVal,
        date: "Vừa xong",
        title: titleVal,
        comment: commentVal,
        verified: true
      };

      var curStored = getStoredReviews(productId);
      curStored.unshift(newRev);
      saveStoredReviews(productId, curStored);

      // Re-init reviews display
      initReviews();

      // Reset & hide form
      reviewForm.reset();
      setPickerScore(5);
      if (formCard) formCard.hidden = true;

      // Toast feedback
      if (window.WonderlabCart && typeof window.WonderlabCart.showToast === "function") {
        window.WonderlabCart.showToast("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
      }
    });
  }

})();
