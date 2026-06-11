import React from "react";
import ConfirmDialog from "../Common/ConfirmDialog";
import styles from "./SecurityActions.module.css";

const SecurityActions = ({
  loginHistory,
  isConfirmOpen,
  setIsConfirmOpen,
  handleDeleteAccount,
}) => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.historySection}>
          <h3>Lịch sử đăng nhập</h3>
          <div className={styles.historyContainer}>
            <ul className={styles.historyList}>
              {loginHistory.length === 0 && <li>Chưa có dữ liệu.</li>}
              {loginHistory.map((entry) => (
                <li key={entry._id} className={styles.historyItem}>
                  <div className={styles.historyInfo}>
                    <strong>{entry.userAgent.substring(0, 50)}...</strong>
                    <span>IP: {entry.ipAddress}</span>
                  </div>
                  <span className={styles.historyTime}>
                    {new Date(entry.timestamp).toLocaleString("vi-VN")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.dangerSection}>
          <div className={styles.dangerZone}>
            <div>
              <strong>Xóa tài khoản này</strong>
              <p>Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu.</p>
            </div>
            <button
              onClick={() => setIsConfirmOpen(true)}
              className={styles.dangerButton}
            >
              Xóa tài khoản
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Xác nhận xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản của mình không? Toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục."
      />
    </>
  );
};

export default SecurityActions;
