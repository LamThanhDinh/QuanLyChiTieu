import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/authService";

import styles from "../styles/Register.module.css";
import logo from "../assets/login/logo.png";
import bg from "../assets/login/background.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (value.length < 3) return "Tên tài khoản phải có ít nhất 3 ký tự";
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return "Tên tài khoản chỉ được chứa chữ, số và dấu gạch dưới";
        break;
      case "fullname":
        if (value.length < 2) return "Họ tên phải có ít nhất 2 ký tự";
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Email không hợp lệ";
        break;
      case "password":
        if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
        break;
      case "confirmPassword":
        if (value !== formData.password) return "Mật khẩu xác nhận không khớp";
        break;
    }
    return "";
  };

  const isFormValid =
    formData.username &&
    formData.fullname &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    Object.values(errors).every((error) => !error);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { username, fullname, email, password } = formData;
      // Chỉ gửi email nếu user đã nhập
      const payload = {
        username,
        fullname,
        password,
        ...(email && email.trim() ? { email: email.trim() } : {}),
      };
      const response = await register(payload);
      setIsSuccess(true);
      setMessage(
        response.data.message || "Đăng ký thành công! Đang chuyển hướng..."
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setIsSuccess(false);
      console.error("Register error:", err);

      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

      if (err.response?.data?.message) {
        // Lỗi từ server với message cụ thể
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = "Thông tin đăng ký không hợp lệ.";
      } else if (err.response?.status === 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau.";
      } else if (err.code === "NETWORK_ERROR" || !err.response) {
        errorMessage =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      }

      setMessage(errorMessage);
    }
  };

  return (
    <div
      className={styles["register-container"]}
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className={styles["register-left"]}>
        <img src={logo} alt="logo" className={styles["register-logo"]} />
        <h1 className={styles["register-title"]}>KÉT SẮT SỐ</h1>
        <p className={styles["register-desc"]}>
          Tạo tài khoản để bắt đầu quản lí thông minh cùng KÉT SẮT SỐ
        </p>
      </div>

      <form className={styles["register-form-box"]} onSubmit={handleSubmit}>
        <label htmlFor="username">Tên tài khoản:</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Nhập tên tài khoản"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {errors.username && (
          <div className={styles["field-error"]}>{errors.username}</div>
        )}

        <label htmlFor="fullname">Họ và tên:</label>
        <input
          id="fullname"
          name="fullname"
          type="text"
          placeholder="Nhập họ và tên đầy đủ"
          value={formData.fullname}
          onChange={handleChange}
          required
        />
        {errors.fullname && (
          <div className={styles["field-error"]}>{errors.fullname}</div>
        )}

        <label htmlFor="email">Email (tùy chọn):</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="example@email.com"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <div className={styles["field-error"]}>{errors.email}</div>
        )}

        <label htmlFor="password">Nhập mật khẩu:</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Nhập mật khẩu mạnh"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && (
          <div className={styles["field-error"]}>{errors.password}</div>
        )}

        <label htmlFor="confirmPassword">Nhập lại mật khẩu:</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {errors.confirmPassword && (
          <div className={styles["field-error"]}>{errors.confirmPassword}</div>
        )}

        {message && (
          <div
            className={`${styles["login-message"]} ${
              isSuccess ? styles["success"] : styles["error"]
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          className={styles["register-button"]}
          disabled={!isFormValid}
        >
          <FontAwesomeIcon icon={faUserPlus} />
          &nbsp;Đăng ký
        </button>
        <div className={styles["register-login-link"]}>
          Đã có tài khoản?
          <span
            className={styles["login-link"]}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </span>
        </div>
      </form>
    </div>
  );
}
