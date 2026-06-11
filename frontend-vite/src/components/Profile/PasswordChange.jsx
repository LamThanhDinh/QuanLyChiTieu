import React from "react";
import styles from "./PasswordChange.module.css";

const PasswordChange = ({
  passwords,
  message,
  isSubmitting,
  handlePasswordSubmit,
  handleChange,
}) => {
  return (
    <div className={styles.container}>
      <h3>Đổi mật khẩu</h3>
      <form onSubmit={handlePasswordSubmit} className={styles.formSection}>
        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
        <div className={styles.formGroup}>
          <label>Mật khẩu cũ</label>
          <input
            type="password"
            name="oldPassword"
            value={passwords.oldPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroupWithValidation}>
          <label>Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
          />
          {passwords.newPassword && passwords.newPassword.length < 6 && (
            <div className={styles.passwordError}>
              Mật khẩu phải có ít nhất 6 ký tự
            </div>
          )}
          {passwords.newPassword && passwords.newPassword.length >= 6 && (
            <div className={styles.passwordSuccess}>Mật khẩu hợp lệ</div>
          )}
        </div>
        <div className={styles.formGroupWithValidation}>
          <label>Xác nhận mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
          />
          {passwords.confirmPassword &&
            passwords.newPassword !== passwords.confirmPassword && (
              <div className={styles.passwordError}>
                Mật khẩu xác nhận không khớp
              </div>
            )}
          {passwords.confirmPassword &&
            passwords.newPassword === passwords.confirmPassword &&
            passwords.newPassword.length >= 6 && (
              <div className={styles.passwordSuccess}>
                Mật khẩu xác nhận khớp
              </div>
            )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.saveButton}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu mật khẩu"}
        </button>
      </form>
    </div>
  );
};

export default PasswordChange;
