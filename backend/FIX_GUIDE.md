# 🔧 Fix Guide - Email Service & Avatar Upload

## ✅ Các lỗi đã fix:

### 1. **Email Service - Mã xác thực hiển thị trên màn hình**
**Vấn đề:** Dòng 209 trong `authController.js` trả về `resetToken` khi email fails
**Giải pháp:** Thay vì expose token, chỉ trả về lỗi an toàn

**File fix:** `backend/controllers/authController.js` (forgotPassword function)

### 2. **Email Service - Cấu hình TLS**
**Vấn đề:** Có thể gặp lỗi SSL certificate chain
**Giải pháp:** Thêm `tls: { rejectUnauthorized: false }` vào config

**File fix:** `backend/utils/emailService.js` (createTransporter function)

### 3. **Upload Avatar - Lỗi thư mục không tồn tại**
**Vấn đề:** Thư mục `uploads/avatars/` chưa được tạo, dẫn đến lỗi upload
**Giải pháp:** Auto-create thư mục khi server start

**File fix:** `backend/server.js` (thêm logic tạo directory)

---

## 🚀 Cách test:

### Test Email Service:
```bash
cd backend
npm run dev  # hoặc npm start
```

Gửi request test:
```bash
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "haniya2805@gmail.com"
}
```

**Kiểm tra:**
- ✅ Không có `resetToken` trong response
- ✅ Email tới mailbox
- ✅ Nếu email fails, thấy thông báo lỗi an toàn

### Test Avatar Upload:
```bash
POST http://localhost:5000/api/users/avatar
Authorization: Bearer {token}
Body: form-data
  - avatar: [image file]
```

**Kiểm tra:**
- ✅ Thư mục `backend/uploads/avatars/` được tạo tự động
- ✅ File ảnh được lưu
- ✅ Response trả về đường dẫn avatar

---

## 📧 Kiểm tra cấu hình Email:

Đảm bảo `.env` có:
```env
EMAIL_USER=lamthanhdinhtv1223@gmail.com
EMAIL_PASS=bbmo uqob zxji hhow
```

⚠️ **Lưu ý:** Email password phải là **App Password** (16 ký tự, không có dấu cách)

Nếu vẫn không gửi được email:
1. Kiểm tra 2FA có bật không
2. Tạo lại App Password mới
3. Kiểm tra Spam folder
4. Xem terminal backend để xem lỗi chi tiết

---

## 📝 Tóm tắt thay đổi:

| File | Thay đổi |
|------|---------|
| `authController.js` | Xóa resetToken khỏi response khi email fails |
| `emailService.js` | Thêm TLS config |
| `server.js` | Thêm auto-create uploads directory |

✅ **Tất cả fix đã hoàn thành!**
