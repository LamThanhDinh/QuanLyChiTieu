import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Welcome.module.css"; // ✅ đúng module

import logo from "../assets/login/logo.png";
import btnRegister from "../assets/login/btn_dangky.png";
import btnLogin from "../assets/login/btn_dangnhap.png";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className={styles["welcome-container"]}>
      <img src={logo} alt="Logo EMG" className={styles["welcome-logo"]} />

      <h1 className={styles["welcome-title"]}>Chào mừng đến với KÉT SẮT SỐ </h1>
      <p className={styles["welcome-desc"]}>
        Tạm biệt lo âu tiền bạc. Chi tiêu thông minh, cuộc sống nhẹ nhàng hơn bao giờ hết.
      </p>

      <div className={styles["welcome-btn-group"]}>
        <img  
          src={btnRegister}
          alt="Đăng ký"
          className={styles["welcome-button-img"]}
          onClick={() => navigate("/register")}
        />
        <img
          src={btnLogin}
          alt="Đăng nhập"
          className={styles["welcome-button-img"]}
          onClick={() => navigate("/login")}
        />
      </div>
    </div>
  );
}
