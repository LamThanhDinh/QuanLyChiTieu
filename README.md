# KÉT SẮT SỐ System

Ứng dụng quản lý tài chính cá nhân và gia đình tích hợp AI, hỗ trợ người dùng theo dõi thu nhập, chi tiêu, tài khoản, danh mục, mục tiêu tiết kiệm, ngân sách theo danh mục và giao dịch định kỳ. Hệ thống sử dụng Gemini AI để hỗ trợ phân tích tài chính, đọc hóa đơn và tự động tạo dữ liệu tài chính từ yêu cầu tự nhiên.

## Tính năng

**Xác thực & Hồ sơ người dùng**
- Đăng ký, đăng nhập bằng JWT.
- Quên mật khẩu và đặt lại mật khẩu qua email.
- Quản lý hồ sơ cá nhân, cập nhật thông tin và avatar.
- Đổi mật khẩu, xóa tài khoản và theo dõi lịch sử đăng nhập.

**Quản lý tài khoản**
- Tạo, sửa, xóa các nguồn tiền như ví cá nhân, tài khoản ngân hàng.
- Theo dõi số dư ban đầu và thông tin tài khoản.
- Xem các giao dịch gắn với từng tài khoản để biết dòng tiền đang nằm ở đâu.

**Quản lý danh mục**
- Tạo danh mục thu nhập và chi tiêu.
- Hỗ trợ icon danh mục để giao diện dễ nhận biết.
- Danh mục có thể liên kết với mục tiêu tài chính khi cần theo dõi khoản tiết kiệm.

**Quản lý giao dịch**
- Thêm, sửa, xóa giao dịch thu nhập và chi tiêu.
- Lọc, tìm kiếm giao dịch theo thời gian, danh mục, tài khoản và từ khóa.
- Hiển thị lịch sử giao dịch, giao dịch gần đây và lịch giao dịch.
- Import/Export dữ liệu giao dịch bằng Excel/CSV.
- Gắn nhãn giao dịch được sinh từ mẫu định kỳ.

**Giao dịch định kỳ**
- Tạo mẫu giao dịch lặp lại theo ngày, tuần, tháng hoặc năm.
- Hỗ trợ ngày chạy tiếp theo, ngày kết thúc, bật/tạm dừng mẫu và tự động tạo khi xử lý khoản đến hạn.
- Có nút tạo giao dịch ngay, xử lý các khoản đến hạn và xem lịch sử giao dịch đã sinh ra từ từng mẫu.
- Phân trang danh sách mẫu định kỳ để dễ demo và quản lý khi dữ liệu nhiều.

**Quản lý mục tiêu**
- Tạo mục tiêu tiết kiệm với số tiền mục tiêu, số tiền hiện có và hạn chót.
- Nạp tiền vào mục tiêu, ghim mục tiêu quan trọng và lưu trữ mục tiêu.
- Theo dõi tiến độ hoàn thành và trạng thái quá hạn/hoàn thành.

**Ngân sách theo danh mục**
- Đặt ngân sách theo từng danh mục trong từng tháng.
- Theo dõi số tiền đã chi, số tiền còn lại và phần trăm sử dụng ngân sách.
- Cảnh báo khi danh mục gần chạm ngưỡng hoặc vượt ngân sách.
- Gemini AI đề xuất ngân sách tháng tới dựa trên lịch sử chi tiêu.
- Cho phép áp dụng nhanh các đề xuất ngân sách do AI tạo ra.

**Thông báo**
- Chuông thông báo hiển thị cảnh báo mục tiêu sắp hết hạn, mục tiêu quá hạn, mục tiêu gần hoàn thành.
- Cảnh báo ngân sách gần vượt hoặc đã vượt mức theo tháng hiện tại.
- Cảnh báo chi tiêu theo ngưỡng ngày/tháng trong phần cài đặt nhắc nhở.
- Mỗi danh mục ngân sách chỉ sinh một thông báo theo trạng thái trong tháng, tránh lặp lại nhiều dòng giống nhau.

**Trợ lý AI**
- Chat với AI bằng ngôn ngữ tự nhiên.
- Tạo nhanh giao dịch, danh mục, tài khoản và mục tiêu từ câu lệnh.
- Đọc ảnh/PDF hóa đơn và tự động nhận diện khoản thu/chi.
- Phân tích nhanh tình hình tài chính, cảnh báo bất thường và gợi ý hành động.
- Hỗ trợ upload JPG, PNG, WebP và PDF.

**Thống kê & Báo cáo**
- Tổng quan thu nhập, chi tiêu và số dư.
- Biểu đồ xu hướng thu chi theo thời gian.
- Phân tích chi tiêu theo danh mục.
- Bảng thống kê danh mục, danh sách giao dịch và các nhận xét tài chính.

## Công nghệ sử dụng

**Backend**
- Node.js với Express.js.
- MongoDB với Mongoose ODM.
- JWT và bcryptjs cho xác thực.
- Multer cho upload avatar/tệp.
- Nodemailer cho gửi email.
- Google Generative AI cho trợ lý AI.
- Swagger cho tài liệu API.
- Jest, Supertest và mongodb-memory-server cho kiểm thử.

**Frontend**
- React 19 với Vite.
- React Router DOM v7.
- TanStack React Query.
- Axios.
- Recharts cho biểu đồ.
- FontAwesome, Lucide React và React Icons cho icon.
- CSS Modules cho giao diện từng component/page.
- Vitest và Testing Library cho kiểm thử frontend.

**Hạ tầng**
- Docker và Docker Compose.
- Nginx reverse proxy.
- Hỗ trợ triển khai frontend/backend riêng trên Render.

## Cấu trúc dự án

```text
QuanLyChiTieu/
├── backend/                         # Backend Node.js/Express
│   ├── controllers/                 # Xử lý logic nghiệp vụ
│   │   ├── aiHandlers/              # Các handler nhỏ cho AI Assistant
│   │   ├── aiController.js
│   │   ├── budgetController.js
│   │   ├── recurringTransactionController.js
│   │   └── ...
│   ├── middleware/                  # Middleware xác thực và xử lý request
│   ├── models/                      # Mongoose models
│   │   ├── Account.js
│   │   ├── Budget.js
│   │   ├── Category.js
│   │   ├── Goal.js
│   │   ├── RecurringTransaction.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/                      # API routes
│   ├── tests/                       # Unit/integration tests
│   ├── uploads/                     # Tệp upload, avatar người dùng
│   ├── utils/                       # Hàm tiện ích
│   ├── server.js                    # Entry point backend
│   └── swagger.js                   # Cấu hình Swagger
├── frontend-vite/                   # Frontend React/Vite
│   ├── src/
│   │   ├── api/                     # API service layer
│   │   ├── components/              # Components dùng lại
│   │   │   ├── AIAssistant/
│   │   │   ├── Accounts/
│   │   │   ├── Categories/
│   │   │   ├── Common/
│   │   │   ├── Goals/
│   │   │   ├── Header/
│   │   │   ├── Profile/
│   │   │   ├── Statistics/
│   │   │   └── Transactions/
│   │   ├── contexts/                # React contexts
│   │   ├── hooks/                   # Custom hooks
│   │   ├── pages/                   # Các trang chính
│   │   ├── routes/                  # Định nghĩa route
│   │   ├── styles/                  # CSS module cho pages
│   │   └── utils/                   # Hàm tiện ích frontend
│   └── public/                      # Tài nguyên tĩnh
├── nginx/                           # Cấu hình Nginx
├── thesis/                          # Tài liệu/báo cáo đồ án
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Hướng dẫn cài đặt

### Yêu cầu hệ thống

- Node.js 18+.
- MongoDB hoặc MongoDB Atlas.
- Docker & Docker Compose nếu muốn chạy bằng container.
- Tài khoản Google AI Studio để lấy Gemini API key.
- Tài khoản Brevo/API key nếu dùng chức năng gửi email.

### Biến môi trường

**Backend (`backend/.env`)**

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=your_sender_name
NODE_ENV=development
```

**Frontend (`frontend-vite/.env`)**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Khi deploy frontend sau Nginx hoặc Render rewrite, có thể để `VITE_API_BASE_URL=/api` nếu frontend và backend dùng chung domain/proxy.

### Cài đặt thủ công

**Backend**

```bash
cd backend
npm install
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:5000
```

**Frontend**

```bash
cd frontend-vite
npm install
npm run dev
```

Frontend Vite mặc định chạy tại:

```text
http://localhost:5173
```

### Chạy bằng Docker

```bash
docker-compose up -d
```

Nếu dùng file cấu hình dev:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Kiểm thử

**Backend**

```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

**Frontend**

```bash
cd frontend-vite
npm test
npm run test:ui
npm run test:coverage
```

**Build frontend**

```bash
cd frontend-vite
npm run build
```

## Tài liệu API

Khi backend đang chạy, tài liệu Swagger có tại:

```text
http://localhost:5000/api-docs
```

### Các endpoint chính

**Auth**
- `POST /api/auth/register` - Đăng ký.
- `POST /api/auth/login` - Đăng nhập.
- `POST /api/auth/forgot-password` - Gửi yêu cầu quên mật khẩu.
- `POST /api/auth/reset-password` - Đặt lại mật khẩu.

**Users & Profile**
- `GET /api/users/profile` - Lấy thông tin người dùng.
- `PUT /api/users/profile` - Cập nhật hồ sơ.
- `PUT /api/users/avatar` - Upload avatar.

**Accounts**
- `GET /api/accounts` - Lấy danh sách tài khoản.
- `POST /api/accounts` - Tạo tài khoản.
- `PUT /api/accounts/:id` - Cập nhật tài khoản.
- `DELETE /api/accounts/:id` - Xóa tài khoản.

**Categories**
- `GET /api/categories` - Lấy danh sách danh mục.
- `POST /api/categories` - Tạo danh mục.
- `PUT /api/categories/:id` - Cập nhật danh mục.
- `DELETE /api/categories/:id` - Xóa danh mục.

**Transactions**
- `GET /api/transactions` - Lấy danh sách giao dịch.
- `POST /api/transactions` - Tạo giao dịch.
- `PUT /api/transactions/:id` - Cập nhật giao dịch.
- `DELETE /api/transactions/:id` - Xóa giao dịch.

**Goals**
- `GET /api/goals` - Lấy danh sách mục tiêu.
- `POST /api/goals` - Tạo mục tiêu.
- `PUT /api/goals/:id` - Cập nhật mục tiêu.
- `DELETE /api/goals/:id` - Xóa mục tiêu.
- `POST /api/goals/:id/add-funds` - Nạp tiền vào mục tiêu.

**Budgets**
- `GET /api/budgets` - Lấy ngân sách theo tháng/năm.
- `POST /api/budgets` - Tạo ngân sách.
- `PUT /api/budgets/:id` - Cập nhật ngân sách.
- `DELETE /api/budgets/:id` - Xóa ngân sách.
- `GET /api/budgets/suggestions` - AI đề xuất ngân sách tháng tới.
- `POST /api/budgets/apply-suggestions` - Áp dụng đề xuất ngân sách.

**Recurring Transactions**
- `GET /api/recurring-transactions` - Lấy danh sách mẫu định kỳ.
- `POST /api/recurring-transactions` - Tạo mẫu định kỳ.
- `PUT /api/recurring-transactions/:id` - Cập nhật mẫu định kỳ.
- `DELETE /api/recurring-transactions/:id` - Xóa mẫu định kỳ.
- `POST /api/recurring-transactions/:id/run` - Tạo giao dịch ngay từ mẫu.
- `GET /api/recurring-transactions/:id/generated-transactions` - Xem giao dịch đã sinh từ mẫu.
- `POST /api/recurring-transactions/process-due` - Xử lý các mẫu đến hạn.

**Statistics**
- `GET /api/statistics/overview` - Tổng quan tài chính.
- `GET /api/statistics/category` - Thống kê theo danh mục.
- `GET /api/statistics/trends` - Xu hướng thu chi.

**AI Assistant**
- `POST /api/ai-assistant` - Chat với Gemini AI.
- `GET /api/ai-assistant/alerts` - Lấy cảnh báo tài chính cho AI Assistant.
- `POST /api/ai-assistant/analyze-invoice` - Upload ảnh/PDF hóa đơn cho AI xử lý.
- `POST /api/ai-assistant/create-transaction` - Tạo giao dịch từ dữ liệu AI đề xuất.
- `POST /api/ai-assistant/create-category` - Tạo danh mục từ dữ liệu AI đề xuất.
- `POST /api/ai-assistant/create-account` - Tạo tài khoản từ dữ liệu AI đề xuất.
- `POST /api/ai-assistant/create-goal` - Tạo mục tiêu từ dữ liệu AI đề xuất.

## Luồng sử dụng chính

1. Người dùng đăng ký/đăng nhập.
2. Khởi tạo tài khoản và danh mục thu/chi.
3. Thêm giao dịch thủ công hoặc nhờ AI tạo từ câu lệnh/hóa đơn.
4. Theo dõi thống kê thu chi, danh mục và tài khoản.
5. Tạo mục tiêu tiết kiệm để theo dõi tiến độ.
6. Đặt ngân sách theo danh mục để kiểm soát chi tiêu từng tháng.
7. Tạo mẫu giao dịch định kỳ cho các khoản lặp lại như lương, tiền nhà, tiền điện, subscription.
8. Xem thông báo khi mục tiêu quá hạn hoặc ngân sách gần/vượt mức.

## Lưu ý

- File `.env` không nên commit lên GitHub.
- Cần cấu hình `GEMINI_API_KEY` để dùng đầy đủ tính năng AI.
- Cần cấu hình Brevo API key và email gửi đã xác thực để dùng chức năng quên mật khẩu.
- Với Render Free, backend có thể sleep khi không hoạt động nên request đầu tiên có thể chậm hơn.

## Giấy phép

Dự án này là một phần của đồ án tốt nghiệp, phục vụ mục đích học tập và nghiên cứu.
