# VG Web - Hệ thống Web

## 📁 Cấu trúc dự án

```
vg_web/
│
├── index.html                 # Trang chủ - Landing page
├── README.md                  # Hướng dẫn sử dụng
│
├── page/                      # Thư mục chứa các trang
│   ├── auth/                  # Hệ thống xác thực
│   │   ├── login/             # Trang đăng nhập
│   │   │   ├── html/
│   │   │   │   └── index.html
│   │   │   ├── css/
│   │   │   │   └── style.css
│   │   │   └── js/
│   │   │       └── script.js
│   │   │
│   │   └── forgotpass/        # Trang quên mật khẩu
│   │       ├── html/
│   │       │   └── index.html
│   │       ├── css/
│   │       │   └── style.css
│   │       └── js/
│   │           └── script.js
│   │
│   └── component/             # Các component tái sử dụng
│
└── data/                      # Dữ liệu JSON (nếu cần)
```

## 🚀 Cách chạy localhost

### Phương pháp 1: Sử dụng Live Server (Khuyến nghị)

1. **Cài đặt Live Server extension** trong VS Code:
   - Mở VS Code
   - Vào Extensions (Ctrl+Shift+X)
   - Tìm "Live Server" của Ritwick Dey
   - Click Install

2. **Chạy dự án**:
   - Mở thư mục `vg_web` trong VS Code
   - Click chuột phải vào file `index.html`
   - Chọn "Open with Live Server"
   - Trình duyệt sẽ tự động mở tại `http://127.0.0.1:5500/index.html`

### Phương pháp 2: Sử dụng Python HTTP Server

1. **Mở Command Prompt/Terminal** trong thư mục `vg_web`

2. **Chạy lệnh**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Hoặc Python 2
   python -m SimpleHTTPServer 8000
   ```

3. **Truy cập**: Mở trình duyệt và vào `http://localhost:8000`

### Phương pháp 3: Sử dụng Node.js http-server

1. **Cài đặt http-server**:
   ```bash
   npm install -g http-server
   ```

2. **Chạy server**:
   ```bash
   http-server -p 8080
   ```

3. **Truy cập**: `http://localhost:8080`

## 📱 Các trang có sẵn

### 1. Trang chủ
- **URL**: `http://localhost:8000/` hoặc `http://localhost:8000/index.html`
- **Mô tả**: Landing page với navigation đến các trang khác

### 2. Trang đăng nhập
- **URL**: `http://localhost:8000/page/auth/login/html/index.html`
- **Mô tả**: Form đăng nhập với email và mật khẩu
- **Tính năng**:
  - Validation real-time
  - Toggle password visibility
  - Remember me functionality
  - Loading states
  - Responsive design

### 3. Trang quên mật khẩu
- **URL**: `http://localhost:8000/page/auth/forgotpass/html/index.html`
- **Mô tả**: Form khôi phục mật khẩu

## 🔧 Thông tin test

### Credentials demo cho trang login:
- **Email**: `admin@example.com`
- **Mật khẩu**: `123456`

## 🎨 Tính năng thiết kế

- **Responsive Design**: Tương thích mobile và desktop
- **Modern UI**: Gradient backgrounds, animations, hover effects
- **Accessibility**: Keyboard navigation, focus states
- **Performance**: Optimized CSS và JavaScript
- **Cross-browser**: Tương thích với các trình duyệt hiện đại

## 🔗 Đường dẫn nhanh

- **Trang chủ**: `/index.html`
- **Đăng nhập**: `/page/auth/login/html/index.html`
- **Quên mật khẩu**: `/page/auth/forgotpass/html/index.html`

## 📝 Lưu ý

- Tất cả file đều sử dụng HTML, CSS, JavaScript thuần
- Không cần cài đặt dependencies
- Có thể chạy trực tiếp trên localhost
- Cấu trúc folder theo ngôn ngữ (html, css, js)

## 🛠️ Phát triển

Để thêm trang mới:
1. Tạo folder mới trong `page/`
2. Tạo cấu trúc `html/`, `css/`, `js/`
3. Thêm link trong `index.html`
4. Test trên localhost

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console browser (F12)
2. Đảm bảo server đang chạy
3. Kiểm tra đường dẫn file
4. Xóa cache browser nếu cần #   v i e g r a n d _ a p i  
 