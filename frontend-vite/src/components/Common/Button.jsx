import React from "react";
import styles from "./Button.module.css";

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  icon,
  className = "",
  variant = "primary",
  loading = false,
  ...rest
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.button} ${styles[variant]} ${className}`}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {loading ? (
        <span className={styles.loading}>Đang xử lý...</span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
