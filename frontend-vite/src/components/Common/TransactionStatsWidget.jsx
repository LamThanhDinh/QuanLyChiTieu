// frontend-vite/src/components/Common/TransactionStatsWidget.jsx

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faExchangeAlt,
  faCalendarWeek,
  faCalendarAlt,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./TransactionStatsWidget.module.css";

const TransactionStatsWidget = ({
  totalCount = 0,
  incomeCount = 0,
  expenseCount = 0,
  period = "month", // week, month, year
  isLoading = false,
  className = "",
}) => {
  // Helper để lấy icon theo period
  const getPeriodIcon = () => {
    switch (period) {
      case "week":
        return faCalendarWeek;
      case "year":
        return faCalendar;
      default:
        return faCalendarAlt;
    }
  };

  // Helper để lấy text theo period
  const getPeriodText = () => {
    switch (period) {
      case "week":
        return "tuần này";
      case "year":
        return "năm này";
      default:
        return "tháng này";
    }
  };

  if (isLoading) {
    return (
      <div className={`${styles.widget} ${className}`}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.widget} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <FontAwesomeIcon
            icon={getPeriodIcon()}
            className={styles.periodIcon}
          />
          <h3 className={styles.title}>Giao dịch {getPeriodText()}</h3>
        </div>
        <div className={styles.totalBadge}>
          <FontAwesomeIcon icon={faExchangeAlt} />
          <span>{totalCount}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Thu nhập */}
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon icon={faArrowUp} className={styles.incomeIcon} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Thu nhập</span>
            <span className={styles.statValue}>{incomeCount}</span>
          </div>
        </div>

        {/* Chi tiêu */}
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <FontAwesomeIcon
              icon={faArrowDown}
              className={styles.expenseIcon}
            />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Chi tiêu</span>
            <span className={styles.statValue}>{expenseCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatsWidget;
