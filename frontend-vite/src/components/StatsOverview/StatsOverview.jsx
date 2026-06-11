import React from "react";
import styles from "./StatsOverview.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faExchangeAlt,
  faArrowTrendUp, // <--- Sửa thành tên này
  faArrowTrendDown,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";

// Hàm tiện ích để phân tích xu hướng từ comparison text
const getTrendInfo = (comparison, type) => {
  if (!comparison) return { icon: faMinus, className: "neutral" };

  const lowerComparison = comparison.toLowerCase();

  // Phân tích xu hướng dựa trên nội dung
  if (
    lowerComparison.includes("tăng") ||
    lowerComparison.includes("nhiều hơn")
  ) {
    return {
      icon: faArrowTrendUp,
      className: type === "expense" ? "negative" : "positive",
    };
  } else if (
    lowerComparison.includes("giảm") ||
    lowerComparison.includes("ít hơn")
  ) {
    return {
      icon: faArrowTrendDown,
      className: type === "expense" ? "positive" : "negative",
    };
  } else if (
    lowerComparison.includes("tích lũy") ||
    lowerComparison.includes("dương")
  ) {
    return { icon: faArrowTrendUp, className: "positive" };
  } else if (
    lowerComparison.includes("thiếu hụt") ||
    lowerComparison.includes("âm")
  ) {
    return { icon: faArrowTrendDown, className: "negative" };
  }

  return { icon: faMinus, className: "neutral" };
};
const formatCurrency = (amount) => {
  if (typeof amount !== "number") {
    return "0 ₫";
  }
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

// Component con cho từng card
const StatCard = ({ type, amount, comparison }) => {
  const getConfig = () => {
    switch (type) {
      case "income":
        return {
          icon: faArrowDown,
          label: "THU NHẬP",
          iconClass: styles.iconIncome,
          amountClass: styles.amountIncome,
        };
      case "expense":
        return {
          icon: faArrowUp,
          label: "CHI TIÊU",
          iconClass: styles.iconExpense,
          amountClass: styles.amountExpense,
        };
      case "cashflow":
        return {
          icon: faExchangeAlt,
          label: "DÒNG TIỀN",
          iconClass: styles.iconCashflow,
          amountClass: styles.amountCashflow,
        };
      default:
        return {};
    }
  };

  const config = getConfig();
  const trendInfo = getTrendInfo(comparison, type);

  return (
    <div className={styles.statCard}>
      {/* HÀNG 1: GỘP ICON VÀ THÔNG TIN CHÍNH */}
      <div className={styles.cardTop}>
        <div className={config.iconClass}>
          <FontAwesomeIcon icon={config.icon} />
        </div>
        <div className={styles.mainInfo}>
          <span className={styles.label}>{config.label}</span>
          <div className={config.amountClass}>{formatCurrency(amount)}</div>
        </div>
      </div>

      {/* HÀNG 2: PHẦN SO SÁNH */}
      {comparison && (
        <div className={`${styles.comparison} ${styles[trendInfo.className]}`}>
          <FontAwesomeIcon icon={trendInfo.icon} className={styles.trendIcon} />
          <span className={styles.comparisonText}>{comparison}</span>
        </div>
      )}
    </div>
  );
};

// Component chính - widget compact hiển thị 3 thẻ theo chiều ngang
const StatsOverview = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className={styles.widgetContainer}>
        <div className={styles.loadingContent}>Đang tải...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.widgetContainer}>
        <div className={styles.noDataContent}>
          Không có dữ liệu để hiển thị.
        </div>
      </div>
    );
  }

  // Tính toán dòng tiền ròng
  const calculateNetCashFlow = () => {
    const income = stats.income?.amount || 0;
    const expense = stats.expense?.amount || 0;
    return income - expense;
  };

  const netCashFlow = calculateNetCashFlow();

  return (
    <div className={styles.widgetContainer}>
      {/* Thu nhập */}
      <StatCard
        type="income"
        amount={stats.income?.amount || 0}
        comparison={stats.income?.changeDescription}
      />

      {/* Divider */}
      <div className={styles.divider}></div>

      {/* Chi tiêu */}
      <StatCard
        type="expense"
        amount={stats.expense?.amount || 0}
        comparison={stats.expense?.changeDescription}
      />

      {/* Divider */}
      <div className={styles.divider}></div>

      {/* Dòng tiền */}
      <StatCard
        type="cashflow"
        amount={netCashFlow}
        comparison={
          stats.balance?.changeDescription ||
          (netCashFlow >= 0 ? "Tích lũy được tiền" : "Thiếu hụt ngân sách")
        }
      />
    </div>
  );
};

export default StatsOverview;
