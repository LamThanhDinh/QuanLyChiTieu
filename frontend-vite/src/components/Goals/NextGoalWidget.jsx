// src/components/Goals/NextGoalWidget.jsx (Phiên bản Ngang)
import React from "react";
import styles from "./NextGoalWidget.module.css";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { renderIcon } from "../../utils/iconMap";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN").format(amount);

const NextGoalWidget = ({ goal, isLoading }) => {
  if (isLoading) {
    return <div className={styles.placeholder}>Đang tải...</div>;
  }

  if (!goal) {
    return (
      <div className={styles.placeholder}>
        🎉 Không có mục tiêu nào sắp đến hạn!
      </div>
    );
  }

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const timeLeft = formatDistanceToNow(new Date(goal.deadline), {
    locale: vi,
  });

  return (
    <div className={styles.widgetContainer}>
      {/* Cột 1: Icon */}
      <div className={styles.iconWrapper}>
        {(() => {
          const iconData = renderIcon(goal.icon);
          if (iconData.type === "emoji") {
            return <span className={styles.icon}>{iconData.content}</span>;
          } else {
            return (
              <FontAwesomeIcon
                icon={iconData.content}
                className={styles.icon}
              />
            );
          }
        })()}
      </div>

      {/* Cột 2: Toàn bộ thông tin */}
      <div className={styles.contentWrapper}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{goal.name}</h4>
          <span className={styles.deadline}>còn {timeLeft}</span>
        </div>

        <div className={styles.progressInfo}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressPercent}>{progress.toFixed(0)}%</span>
        </div>

        <div className={styles.amountInfo}>
          <span className={styles.currentAmount}>
            {formatCurrency(goal.currentAmount)}
          </span>
          <span className={styles.targetAmount}>
            / {formatCurrency(goal.targetAmount)} ₫
          </span>
        </div>
      </div>
    </div>
  );
};

export default NextGoalWidget;
