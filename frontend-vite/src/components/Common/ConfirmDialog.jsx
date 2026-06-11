// src/components/Common/ConfirmDialog.jsx
import React from "react";
import styles from "./ConfirmDialog.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Thêm import
import { faSpinner } from "@fortawesome/free-solid-svg-icons"; // Thêm import

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  // ✅ THÊM 3 PROPS MỚI
  isProcessing = false, // Để biết có đang xử lý hay không
  errorMessage = null, // Để nhận thông báo lỗi từ component cha
  confirmText = "Xác nhận", // Tùy chỉnh chữ trên nút
}) => {
  if (!isOpen) {
    return null;
  }

  // Ngăn chặn việc đóng dialog khi đang xử lý
  const handleOverlayClick = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{title || "Xác nhận"}</h3>
        <p className={styles.modalMessage}>
          {message || "Bạn có chắc chắn muốn thực hiện hành động này?"}
        </p>

        {/* ✅ HIỂN THỊ LỖI NẾU CÓ */}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <div className={styles.modalActions}>
          <button
            onClick={onClose}
            className={`${styles.modalButton} ${styles.cancelButton}`}
            disabled={isProcessing} // Vô hiệu hóa khi đang xử lý
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.modalButton} ${styles.confirmButton}`}
            disabled={isProcessing} // Vô hiệu hóa khi đang xử lý
          >
            {isProcessing ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
