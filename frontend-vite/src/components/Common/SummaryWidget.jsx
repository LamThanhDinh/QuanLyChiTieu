import React from "react";
import styles from "./SummaryWidget.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

// Component con cho từng card nhỏ (Thu nhập hoặc Chi tiêu)
const StatCard = ({ type, amount, comparison }) => {
  const isIncome = type === "income";
  return (
    <div className={styles.statCard}>
      <div className={isIncome ? styles.iconIncome : styles.iconExpense}>
        <FontAwesomeIcon icon={isIncome ? faArrowDown : faArrowUp} />
      </div>
      <div className={styles.details}>
        <span className={styles.label}>
          {isIncome ? "Thu nhập" : "Chi tiêu"}
        </span>
        <span className={isIncome ? styles.amountIncome : styles.amountExpense}>
          {amount.toLocaleString("vi-VN")} đ
        </span>
        <span className={styles.comparison}>{comparison}</span>
      </div>
    </div>
  );
};

// Component chính của Widget
const SummaryWidget = ({ incomeData, expenseData, isLoading }) => {
  if (isLoading) {
    return <div className={styles.widgetContainer}>Đang tải...</div>;
  }
  if (!incomeData || !expenseData) {
    return (
      <div className={styles.widgetContainer}>
        Không có dữ liệu để hiển thị.
      </div>
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <StatCard
        type="income"
        amount={incomeData.amount}
        comparison={incomeData.comparison}
      />
      <div className={styles.divider}></div> {/* Đường kẻ phân cách dọc */}
      <StatCard
        type="expense"
        amount={expenseData.amount}
        comparison={expenseData.comparison}
      />
    </div>
  );
};

export default SummaryWidget;
