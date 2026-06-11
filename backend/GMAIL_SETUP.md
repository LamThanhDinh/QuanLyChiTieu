# Hướng Dẫn Cấu Hình Gmail để Gửi Email

## 📧 Cách Lấy App Password từ Gmail

Để ứng dụng có thể gửi email qua Gmail, bạn cần tạo **App Password** (không phải mật khẩu Gmail thông thường).

### Bước 1: Bật Xác Thực 2 Yếu Tố (2FA)

1. Truy cập: https://myaccount.google.com/security
2. Tìm mục **"Xác minh 2 bước"** (2-Step Verification)
3. Nhấn **"Bật"** và làm theo hướng dẫn
4. Xác thực bằng số điện thoại của bạn

### Bước 2: Tạo App Password

1. Sau khi bật 2FA, quay lại: https://myaccount.google.com/security
2. Tìm mục **"App passwords"** (Mật khẩu ứng dụng)
3. Chọn:
   - **Select app**: Mail
   - **Select device**: Other (Custom name)
   - Nhập tên: `ExpenseManagement` hoặc `NodeMailer`
4. Nhấn **"Generate"**
5. Google sẽ hiển thị mã 16 ký tự (ví dụ: `abcd efgh ijkl mnop`)
6. **Sao chép mã này** - bạn chỉ thấy nó một lần!

### Bước 3: Cấu Hình File .env

Mở file `backend/.env` và thay đổi:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**Lưu ý:**
- `EMAIL_USER`: Email Gmail đầy đủ của bạn (vd: `example@gmail.com`)
- `EMAIL_PASS`: App Password **KHÔNG có dấu cách** (16 ký tự liền nhau)

### Ví dụ:

```env
EMAIL_USER=dinhlam2904@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

## 🔧 Kiểm Tra Cấu Hình

### 1. Khởi động lại backend:

```bash
cd backend
npm start
```

### 2. Test gửi email:

Sử dụng Postman hoặc frontend để gửi request đến:

```
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 3. Kiểm tra:

- ✅ Terminal backend hiển thị: `✅ Email sent successfully`
- ✅ Email xuất hiện trong hộp thư đến
- ⚠️ Nếu không thấy email, kiểm tra thư mục **Spam**

## ❗ Xử Lý Lỗi Thường Gặp

### Lỗi: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Nguyên nhân:** 
- Chưa bật 2FA
- Sử dụng mật khẩu Gmail thay vì App Password
- App Password có dấu cách

**Giải pháp:**
- Kiểm tra lại App Password (loại bỏ tất cả dấu cách)
- Đảm bảo đã bật 2FA
- Tạo lại App Password mới

### Lỗi: "self signed certificate in certificate chain"

**Nguyên nhân:** Vấn đề SSL/TLS

**Giải pháp:** Thêm vào `emailService.js`:

```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

### Lỗi: "Greeting never received"

**Nguyên nhân:** Firewall hoặc proxy chặn kết nối

**Giải pháp:**
- Kiểm tra tường lửa
- Thử sử dụng mạng khác
- Liên hệ IT nếu đang dùng mạng công ty

## 🔒 Bảo Mật

- ❌ **KHÔNG** commit file `.env` lên Git
- ❌ **KHÔNG** share App Password
- ✅ Thêm `.env` vào `.gitignore`
- ✅ Sử dụng biến môi trường riêng cho production

## 📚 Tài Liệu Tham Khảo

- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Gmail SMTP Settings](https://support.google.com/a/answer/176600)

## 💡 Tips

1. **Email đẹp hơn:** Template HTML đã được tối ưu với CSS inline
2. **Fallback:** Nếu email thất bại, mã vẫn được log ra console để test
3. **Rate Limit:** Gmail giới hạn ~500 email/ngày cho tài khoản miễn phí
4. **Production:** Nên sử dụng dịch vụ chuyên nghiệp như SendGrid, AWS SES, hoặc Mailgun

## 🎨 Tùy Chỉnh Email Template

Bạn có thể chỉnh sửa template email tại:
`backend/utils/emailService.js`

Thay đổi:
- Logo/branding
- Màu sắc
- Nội dung text
- Footer information
