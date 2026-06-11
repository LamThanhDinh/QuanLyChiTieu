// Mở và THAY THẾ file: frontend-vite/src/components/Transactions/TransactionCalendar.jsx

import React, { useMemo } from "react"; // ✅ Thêm 'useMemo'
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  isSameWeek,
  isSameDay,
} from "date-fns";
import styles from "./TransactionCalendar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faBalanceScale,
} from "@fortawesome/free-solid-svg-icons";

// Hàm tiện ích định dạng tiền tệ (Sử dụng hàm này để hiển thị đẹp hơn)
const formatFullCurrency = (amount) => {
  if (typeof amount !== "number") return "0 ₫";
  return amount.toLocaleString("vi-VN") + " ₫";
};

// Hàm định dạng số tiền thu gọn cho các ô trong lịch
const formatCompactCurrency = (amount) => {
  if (typeof amount !== "number" || amount === 0) return null;
  if (Math.abs(amount) >= 1000000) {
    return `${(amount / 1000000).toLocaleString("vi-VN", {
      maximumFractionDigits: 2,
    })} Tr`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toLocaleString("vi-VN")} N`;
  }
  return `${amount.toLocaleString("vi-VN")}`;
};

const TransactionCalendar = ({
  currentDate,
  calendarData,
  period = "month",
  onDayClick,
}) => {
  // ✅ Wrap validCurrentDate trong useMemo để tránh re-render
  const validCurrentDate = useMemo(() => {
    return currentDate instanceof Date ? currentDate : new Date();
  }, [currentDate]);

  // ✅ BƯỚC 1: TÍNH TOÁN TỔNG THU/CHI/SỐ DƯ THEO PERIOD
  // Dùng `useMemo` để việc tính toán chỉ chạy lại khi `calendarData`, `currentDate` hoặc `period` thay đổi
  const periodSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    if (calendarData && typeof calendarData === "object") {
      Object.keys(calendarData).forEach((dateKey) => {
        const dateObj = new Date(dateKey);
        let shouldInclude = false;

        // Tính tổng theo period
        if (period === "year") {
          // Tính cho cả năm
          shouldInclude =
            dateObj.getFullYear() === validCurrentDate.getFullYear();
        } else if (period === "week") {
          // Tính cho tuần
          shouldInclude = isSameWeek(dateObj, validCurrentDate, {
            weekStartsOn: 0,
          });
        } else {
          // Mặc định tính cho tháng
          shouldInclude = isSameMonth(dateObj, validCurrentDate);
        }

        if (shouldInclude) {
          const dayData = calendarData[dateKey];
          totalIncome += dayData.income || 0;
          totalExpense += dayData.expense || 0;
        }
      });
    }

    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [calendarData, validCurrentDate, period]);

  // Logic tính ngày tháng (giữ nguyên)
  const firstDayOfMonth = startOfMonth(validCurrentDate);
  const lastDayOfMonth = endOfMonth(validCurrentDate);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];

  // ✅ Helper function để xác định class highlight cho dayCell
  const getDayCellClasses = (day) => {
    const baseClasses = [styles.dayCell];
    const isCurrentMonth = isSameMonth(day, validCurrentDate);

    if (!isCurrentMonth) {
      baseClasses.push(styles.notCurrentMonth);
    }

    // Chỉ highlight khi period === "week"
    if (
      period === "week" &&
      isSameWeek(day, validCurrentDate, { weekStartsOn: 0 })
    ) {
      baseClasses.push(styles.highlightWeek);
    }

    return baseClasses.join(" ");
  };

  // ✅ Handler cho click vào dayCell (chỉ khi có giao dịch)
  const handleDayClick = (day, dayData) => {
    // Chỉ thực hiện click nếu ngày đó có giao dịch
    if (dayData && onDayClick && typeof onDayClick === "function") {
      onDayClick(day);
    }
  };

  return (
    <div className={styles.calendarCard}>
      <div className={styles.calendarContainer}>
        {/* Phần lưới lịch sẽ nằm trong một div riêng để dễ dàng đặt vào grid area */}
        <div className={styles.gridSection}>
          <div className={styles.weekDaysGrid}>
            {weekDays.map((day) => (
              <div key={day} className={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>
          <div className={styles.daysGrid}>
            {" "}
            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayData =
                calendarData && typeof calendarData === "object"
                  ? calendarData[dateKey]
                  : null;

              // ✅ THÊM TOOLTIP VÀO ĐÂY
              const tooltipText = dayData
                ? `Thu: ${formatFullCurrency(
                    dayData.income
                  )}\nChi: ${formatFullCurrency(dayData.expense)}`
                : null;

              return (
                <div
                  key={dateKey}
                  className={getDayCellClasses(day)}
                  // Sử dụng thuộc tính data-* để tạo tooltip bằng CSS
                  data-tooltip={tooltipText}
                  onClick={() => handleDayClick(day, dayData)}
                  style={{
                    cursor: dayData ? "pointer" : "default", // Chỉ pointer khi có giao dịch
                  }}
                >
                  <span className={styles.dayNumber}>{format(day, "d")}</span>
                  {dayData && (
                    <div className={styles.dayContent}>
                      {dayData.income > 0 && (
                        <div className={styles.income}>
                          +{formatCompactCurrency(dayData.income)}
                        </div>
                      )}
                      {dayData.expense > 0 && (
                        <div className={styles.expense}>
                          -{formatCompactCurrency(dayData.expense)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ BƯỚC 2: THÊM JSX ĐỂ HIỂN THỊ PHẦN TÓM TẮT */}
        <div className={styles.summarySection}>
          <div className={styles.summaryItem}>
            <div className={`${styles.summaryIconWrapper} ${styles.incomeBg}`}>
              <FontAwesomeIcon icon={faArrowDown} className={styles.income} />
            </div>
            <div>
              <span className={styles.summaryLabel}>Tổng thu nhập</span>
              <p className={`${styles.summaryAmount} ${styles.income}`}>
                {formatFullCurrency(periodSummary.income)}
              </p>
            </div>
          </div>

          <div className={styles.summaryItem}>
            <div className={`${styles.summaryIconWrapper} ${styles.expenseBg}`}>
              <FontAwesomeIcon icon={faArrowUp} className={styles.expense} />
            </div>
            <div>
              <span className={styles.summaryLabel}>Tổng chi tiêu</span>
              <p className={`${styles.summaryAmount} ${styles.expense}`}>
                {formatFullCurrency(periodSummary.expense)}
              </p>
            </div>
          </div>

          <div className={styles.summaryItem}>
            <div className={`${styles.summaryIconWrapper} ${styles.balanceBg}`}>
              <FontAwesomeIcon
                icon={faBalanceScale}
                className={styles.balance}
              />
            </div>
            <div>
              <span className={styles.summaryLabel}>Số dư cuối kỳ</span>
              <p className={`${styles.summaryAmount} ${styles.balance}`}>
                {formatFullCurrency(periodSummary.balance)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCalendar;
