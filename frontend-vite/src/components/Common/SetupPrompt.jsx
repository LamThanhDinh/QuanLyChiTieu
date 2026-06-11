import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faCheckCircle,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { createDefaultData } from "../../api/setupService";
import styles from "./SetupPrompt.module.css";

const SetupPrompt = ({ onDataCreated, onDismiss }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateDefaults = async () => {
    setIsCreating(true);
    setError("");

    try {
      await createDefaultData();
      onDataCreated && onDataCreated();
    } catch (err) {
      setError("Không thể tạo dữ liệu mặc định. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.setupPrompt}>
      <div className={styles.setupHeader}>
        <div className={styles.setupIcon}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        <h3 className={styles.setupTitle}>Chưa có dữ liệu để hiển thị</h3>
        <button
          onClick={onDismiss}
          className={styles.dismissButton}
          title="Đóng thông báo"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className={styles.setupContent}>
        <p className={styles.setupDescription}>
          Để bắt đầu sử dụng ứng dụng quản lý chi tiêu, bạn cần có ít nhất một
          danh mục và một tài khoản. Hãy tạo dữ liệu mặc định để bắt đầu ngay!
        </p>

        {error && (
          <div className={styles.setupError}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {error}
          </div>
        )}

        <div className={styles.setupActions}>
          <button
            onClick={handleCreateDefaults}
            disabled={isCreating}
            className={`${styles.setupButton} ${styles.createButton}`}
          >
            {isCreating ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Đang tạo...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>Tạo dữ liệu mặc định</span>
              </>
            )}
          </button>
        </div>

        <div className={styles.setupHint}>
          <small>
            💡 Dữ liệu mặc định bao gồm: Các danh mục phổ biến (Ăn uống, Di
            chuyển, Mua sắm...) và tài khoản tiền mặt cơ bản.
          </small>
        </div>
      </div>
    </div>
  );
};

export default SetupPrompt;
