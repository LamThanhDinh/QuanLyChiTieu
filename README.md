# KÉT SẮT SỐ System

Ứng dụng quản lý tài chính cá nhân với tích hợp AI, giúp theo dõi chi tiêu, thu nhập và đạt được mục tiêu tài chính.

## Tính năng

**Xác thực & Bảo mật**
- Xác thực JWT với phân quyền theo vai trò
- Quản lý hồ sơ người dùng và tải avatar
- Theo dõi lịch sử đăng nhập và thông báo qua email

**Quản lý Tài chính**
- Hỗ trợ nhiều tài khoản (Tiền mặt, Ngân hàng, Thẻ tín dụng)
- Theo dõi giao dịch với danh mục và bộ lọc
- Import/Export CSV cho nhiều giao dịch cùng lúc
- Tạo danh mục tùy chỉnh với biểu tượng emoji
- Đặt và theo dõi mục tiêu tài chính

**Tích hợp AI**
- Tự động phân loại giao dịch thông minh
- Phân tích và đề xuất tài chính
- Xử lý truy vấn ngôn ngữ tự nhiên qua Google Generative AI

**Phân tích & Báo cáo**
- Biểu đồ trực quan và thống kê
- Phân tích xu hướng chi tiêu
- So sánh thu nhập và chi phí
- Phân tích theo danh mục

**Quản trị hệ thống**
- Bảng điều khiển quản lý người dùng
- Thống kê và giám sát toàn hệ thống

## Công nghệ sử dụng

**Backend**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication and bcryptjs hashing
- Google Generative AI integration
- Nodemailer for email services
- Swagger for API documentation
- Jest and Supertest for testing

**Frontend**
- React 19 with Vite
- Tailwind CSS for styling
- React Router DOM v7
- TanStack React Query for state management
- Recharts for data visualization
- Vitest for testing

**Hạ tầng**
- Docker and Docker Compose
- Nginx reverse proxy

## Cấu trúc dự án

```
ExpenseManagement/
├── backend/                # Backend Node.js/Express
│   ├── controllers/        # Xử lý logic nghiệp vụ
│   ├── middleware/         # Xác thực và validation
│   ├── models/            # Các model Mongoose
│   ├── routes/            # Định nghĩa API routes
│   ├── tests/             # Unit tests backend
│   ├── utils/             # Hàm tiện ích
│   └── server.js          # Entry point
├── frontend-vite/         # Frontend React
│   ├── src/
│   │   ├── api/           # Tầng API service
│   │   ├── components/    # Các React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Các trang
│   │   ├── routes/        # Định nghĩa routes
│   │   └── utils/         # Hàm tiện ích
│   └── public/            # Tài nguyên tĩnh
├── nginx/                 # Cấu hình Nginx
└── docker-compose.yml     # Cấu hình Docker
```

## Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js v16+
- MongoDB
- Docker & Docker Compose (tùy chọn)

### Biến môi trường

**Backend (.env)**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_ai_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

### Cài đặt

**Cách 1: Sử dụng Docker (Khuyến nghị)**
```bash
# Clone repository
git clone <repository-url>
cd ExpenseManagement

# Khởi động với Docker Compose
docker-compose up -d

# Truy cập ứng dụng
# Frontend: http://localhost:80
# Backend API: http://localhost:5000
# Tài liệu API: http://localhost:5000/api-docs
```

**Cách 2: Cài đặt thủ công**

Backend:

```bash
cd backend
npm install
npm run dev
```
Frontend:
**Frontend Setup**
```bash
cd frontend-vite
npm install
npm run dev
```

### Tạo tài khoản Admin
```bash
cd backend
node seedAdmin.js
```

## Kiểm thử

**Backend**
```bash
cd backend
npm test                # Chạy tất cả tests
npm run test:watch     # Chế độ watch
npm run test:coverage  # Xem độ phủ code
```

**Frontend**
```bash
cd frontend-vite
npm test               # Chạy tests
npm run test:ui       # Giao diện UI
npm run test:coverage # Xem độ phủ code
```

## Tài liệu API

Tài liệu Swagger có sẵn tại `http://localhost:5000/api-docs` khi backend đang chạy.

### Các endpoint chính

- `POST /api/auth/register` - Đăng ký người dùng
- `POST /api/auth/login` - Đăng nhập
- `GET /api/transactions` - Lấy danh sách giao dịch
- `POST /api/transactions` - Tạo giao dịch mới
- `GET /api/accounts` - Lấy danh sách tài khoản
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/ai/chat` - Chat với AI
- `GET /api/statistics/overview` - Thống kê tài chính

## Giấy phép

Dự án này là một phần của đồ án tốt nghiệp.

## Lưu ý

- Cấu hình Gmail để gửi thông báo email. Xem hướng dẫn tại [GMAIL_SETUP.md](backend/GMAIL_SETUP.md)
- Sử dụng lệnh `node seedAdmin.js` để tạo tài khoản admin ban đầu sau khi cài đặt xong