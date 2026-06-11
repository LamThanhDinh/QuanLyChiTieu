// Ghi vào file: frontend-vite/src/components/Common/DateNavigator.jsx

import React from "react";
import styles from "./DateNavigator.module.css"; // Sẽ tạo file CSS ngay sau đây
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const DateNavigator = ({ currentDate, onDateChange, period = "month" }) => {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (period === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (period === "year") {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (period === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (period === "year") {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    onDateChange(newDate);
  };

  const getDisplayDate = () => {
    if (period === "month") {
      return currentDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      });
    }
    if (period === "year") {
      return `Năm ${currentDate.getFullYear()}`;
    }
    return "";
  };

  return (
    <div className={styles.navigatorBox}>
      <button
        onClick={handlePrev}
        className={styles.navButton}
        aria-label="Kỳ trước"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <div className={styles.dateDisplay}>{getDisplayDate()}</div>
      <button
        onClick={handleNext}
        className={styles.navButton}
        aria-label="Kỳ tiếp theo"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

export default DateNavigator;
