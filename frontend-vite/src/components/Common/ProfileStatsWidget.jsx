import React from "react";
import styles from "./ProfileStatsWidget.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faShieldAlt } from "@fortawesome/free-solid-svg-icons";

// Component cho thống kê profile nhỏ
const ProfileStatsWidget = ({ user, activeTab, isLoading }) => {
  if (isLoading || !user) {
    return <div className={styles.widgetContainer}>Đang tải...</div>;
  }

  const accountAge = user.createdAt
    ? Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className={styles.widgetContainer}>
      {/* Profile Info Card */}
      <div className={styles.statCard}>
        <div className={styles.iconProfile}>
          <FontAwesomeIcon icon={faUser} />
        </div>
        <div className={styles.details}>
          <span className={styles.label}>Tài khoản</span>
          <span className={styles.username}>{user.username || "N/A"}</span>
          <span className={styles.comparison}>
            {accountAge > 0 ? `${accountAge} ngày` : "Mới tạo"}
          </span>
        </div>
      </div>

      <div className={styles.divider}></div>

      {/* Security Status Card */}
      <div className={styles.statCard}>
        <div className={styles.iconSecurity}>
          <FontAwesomeIcon icon={faShieldAlt} />
        </div>
        <div className={styles.details}>
          <span className={styles.label}>Bảo mật</span>
          <span className={styles.status}>
            {activeTab === "security" ? "Đang xem" : "Bình thường"}
          </span>
          <span className={styles.comparison}>
            {user.email ? "Đã xác minh email" : "Chưa xác minh"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileStatsWidget;
