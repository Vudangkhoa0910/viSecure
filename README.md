# ViSecure - Giải pháp bảo mật di động cho người Việt

## 📱 Giới thiệu

ViSecure là một ứng dụng web bảo mật di động được thiết kế đặc biệt cho người Việt Nam. Ứng dụng cung cấp các tính năng bảo mật thiết yếu như kho lưu trữ mật khẩu offline, quét link/hình ảnh, tin tức bảo mật, và VPN mini.

## 🚀 Tính năng chính

### 1. **Vault - Kho lưu trữ an toàn**
- ✅ Lưu trữ mật khẩu, ghi chú, file offline
- ✅ Mã hóa AES-256 với master password
- ✅ Sinh mật khẩu mạnh tự động
- ✅ Xác thực sinh trắc học (vân tay/FaceID)

### 2. **Scanner - Phân tích link & hình ảnh**
- ✅ OCR trích xuất text từ hình ảnh
- ✅ Kiểm tra link với blacklist offline
- ✅ Tích hợp API VirusTotal/Google SafeBrowsing
- ✅ Phân loại: an toàn (xanh), nguy hiểm (đỏ), nghi ngờ (vàng)

### 3. **News & Tips - Tin tức & cảnh báo bảo mật**
- ✅ Cập nhật tin tức bảo mật mới nhất
- ✅ Cảnh báo về thủ đoạn lừa đảo, scam, phishing
- ✅ Mẹo bảo mật hàng ngày
- ✅ Hỗ trợ offline với cache

### 4. **VPN Mini**
- ✅ Kết nối VPN nhanh và an toàn
- ✅ Tự động bật VPN khi vào WiFi công cộng
- ✅ Hỗ trợ WireGuard và OpenVPN
- ✅ Chọn máy chủ theo vị trí

### 5. **Profile & Settings**
- ✅ Quản lý tài khoản và cài đặt
- ✅ Security checkup với điểm số
- ✅ Thống kê sử dụng
- ✅ Cài đặt bảo mật nâng cao

## 🏗️ Kiến trúc dự án

```
ViSecure/
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # UI Components
│   │   ├── pages/             # App Pages
│   │   ├── hooks/             # Custom Hooks
│   │   ├── services/          # API Services
│   │   ├── utils/             # Utilities
│   │   └── types/             # TypeScript Types
│   └── package.json
│
├── backend/                    # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/       # Route Controllers
│   │   ├── models/           # Database Models
│   │   ├── routes/           # API Routes
│   │   ├── middleware/       # Express Middleware
│   │   ├── services/         # Business Logic
│   │   └── utils/            # Utilities
│   └── package.json
│
└── README.md
```

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** với TypeScript
- **Vite** - Build tool hiện đại
- **Material-UI (MUI)** - UI Framework
- **React Router** - Navigation
- **Axios** - HTTP Client
- **Crypto-JS** - Mã hóa client-side
- **Tesseract.js** - OCR
- **Framer Motion** - Animations

### Backend
- **Node.js** với TypeScript
- **Express.js** - Web Framework
- **MongoDB** với Mongoose - Database
- **JWT** - Authentication
- **Multer** - File Upload
- **Helmet** - Security Headers
- **Rate Limiting** - API Protection
- **CORS** - Cross-Origin Resource Sharing

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm hoặc yarn

### 1. Clone repository
```bash
git clone https://github.com/your-username/visecure.git
cd visecure
```

### 2. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy tại: http://localhost:3000

### 3. Cài đặt Backend
```bash
cd backend
npm install

# Copy và cấu hình environment
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn

npm run dev
```
Backend sẽ chạy tại: http://localhost:5000

### 4. Cài đặt MongoDB
```bash
# macOS với Homebrew
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
# Tải và cài đặt từ https://www.mongodb.com/try/download/community
```

## 📝 Cấu hình Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ViSecure
```

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/visecure
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key
VIRUSTOTAL_API_KEY=your-virustotal-api-key
GOOGLE_SAFE_BROWSING_API_KEY=your-google-safe-browsing-api-key
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Deployment

### Frontend (Netlify)
```bash
cd frontend
npm run build

# Deploy folder: dist/
# Build command: npm run build
# Environment: VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend (Render)
```bash
cd backend
npm run build

# Start command: npm start
# Environment variables: Set trong Render dashboard
```

## 📱 Progressive Web App (PWA)

ViSecure hỗ trợ PWA với các tính năng:
- ✅ Offline capability
- ✅ Install on mobile/desktop
- ✅ Push notifications
- ✅ Background sync

## 🔒 Bảo mật

### Frontend Security
- CSP (Content Security Policy)
- XSS Protection
- Client-side encryption
- Secure storage

### Backend Security
- JWT Authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- MongoDB injection protection

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend
```bash
cd backend
npm run test
npm run test:coverage
```

## 📊 API Documentation

API documentation available at: http://localhost:5000/docs (when backend is running)

### Main Endpoints:
- `POST /api/auth/login` - User authentication
- `GET /api/vault` - Get vault items
- `POST /api/scanner/url` - Scan URL for safety
- `GET /api/news` - Get security news
- `GET /api/vpn/servers` - Get VPN servers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Tesseract.js for OCR capabilities
- MongoDB for the robust database
- All open-source contributors

---

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng:
1. Kiểm tra [Issues](https://github.com/Vudangkhoa0910/viSecure/issues)
2. Tạo issue mới nếu chưa có
3. Liên hệ qua email: support@visecure.com

---

**ViSecure** - Bảo vệ bạn trong thế giới số! 🛡️📱
