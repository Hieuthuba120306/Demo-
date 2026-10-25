# WONDERLAB — đồ chơi giáo dục cho trẻ 4–12 tuổi

Static e-commerce site for the university project **PTUD_N1**. Four pages, one shared
stylesheet, vanilla JavaScript only — no framework, no build step.

## Pages

| File | Page | Focal point |
|---|---|---|
| `index.html` | Trang chủ | Ảnh trẻ đang lắp ráp + câu định hướng theo độ tuổi |
| `products.html` | Danh sách sản phẩm (12 sản phẩm được nhóm theo danh mục) | Sản phẩm |
| `product-detail.html` | Chi tiết sản phẩm (`?sp=<slug>` cho 12 sản phẩm) | Thư viện ảnh |
| `about.html` | Giới thiệu cửa hàng | Ảnh lớp học + phần kể chuyện |

## Chạy thử

```bash
cd "Nhom1 Wonderlab"
python3 -m http.server 4180
# mở http://localhost:4180/index.html
```

Mở trực tiếp `index.html` bằng `file://` cũng xem được, nhưng nên chạy qua local server
để `localStorage` và đường dẫn ảnh hoạt động ổn định.

## Cấu trúc

```
index.html  products.html  product-detail.html  about.html
css/style.css        # 00 fonts → 21 motion, toàn bộ token nằm ở :root
js/main.js           # nav mobile, giỏ hàng demo, drawer, toast
js/products.js       # lọc, sắp xếp, trạng thái URL, drawer bộ lọc trên mobile
js/product-detail.js # gallery, tabs, số lượng, thêm vào giỏ
js/product-data.js   # dữ liệu 12 sản phẩm cho trang chi tiết (?sp=)
assets/fonts/        # Be Vietnam Pro (woff2, tự host, 3 subset)
assets/img/          # logo-wonderlab.png + ảnh sản phẩm
assets/favicon.png   # favicon cắt từ logo
```

## Design system

- Bảng màu: `#2457A7` (chính), `#FFC857` (nhấn), `#45B8AC` (phụ), `#FFFDF7` (nền),
  `#263238` / `#5F6B76` (chữ), `#DCE3EA` (viền). Không gradient, không tím.
- Font: Be Vietnam Pro, tự host — không phụ thuộc Google Fonts khi demo offline.
- Bo góc: 16px cho thẻ, 10px cho nút và ô nhập. Khoảng cách theo bước 8px.
- Teal chỉ dùng làm **nền/khối màu**, không dùng làm màu chữ (tương phản 2.2:1 trên trắng).
  Vàng chỉ đi với chữ `#263238` (8.5:1). Xanh dương chỉ đi với chữ trắng (7.0:1).
- Logo: logo chính thức "Bé Khám Phá WONDERLAB" (nhân vật + wordmark nhiều màu).
  File gốc đã được cắt sát viền và tách nền trắng → `assets/img/logo-wonderlab.png`.
  Vì logo nhiều màu nên ở footer (nền xanh) logo đặt trên một tấm nền trắng bo góc;
  favicon là phần đầu nhân vật + kính lúp trên nền kem (`assets/favicon.png`).

## Giỏ hàng demo

Giỏ hàng lưu trong `localStorage` (`wonderlab_cart_v1`): thêm sản phẩm, tăng giảm số lượng,
xóa, mở drawer, phím `Esc` để đóng. **Không có backend, không có thanh toán** — nội dung này
được ghi rõ trong drawer và ở footer.

## Bộ lọc

Bộ lọc chạy trên chính markup của danh sách (`data-*`), nên khi tắt JavaScript trang vẫn
hiển thị đủ 12 sản phẩm. Trạng thái lọc được ghi vào URL:
`products.html?danh-muc=stem,logic&tuoi=6-8&gia=duoi-300&ky-nang=tu-duy&sort=price-asc&q=robot`

## Ảnh

- Ảnh sản phẩm: ảnh studio tự tạo theo cùng một bố cục (nền kem, góc 3/4), dùng cho 12 sản phẩm.
- Ảnh đời sống: Pexels — `kaboompics.com` (trang chủ) và `Ksenia Chernaya` (trang giới thiệu);
  phần credit nằm trong `alt` của ảnh.
- Thông tin liên hệ trong footer/about là **thông tin mẫu** của bài tập, không phải địa chỉ thật.
