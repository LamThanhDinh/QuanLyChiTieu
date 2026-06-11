import React, { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  getMonth,
  getYear,
  format,
} from "date-fns";
import styles from "./DateRangeNavigator.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// --- HELPER FUNCTIONS ---

// Tạo danh sách các tuần trong một tháng
const getWeekOptions = (date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const options = [];

  while (weekStart <= monthEnd) {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    options.push({
      value: weekStart.toISOString(),
      label: `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM/yyyy")}`,
    });
    weekStart = addWeeks(weekStart, 1);
  }
  return options;
};

// Tạo danh sách các tháng trong năm
const getMonthOptions = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: `Tháng ${i + 1}`,
  }));
};

// Tạo danh sách các năm
const getYearOptions = (date) => {
  const currentYear = getYear(date);
  const options = [];
  for (let i = currentYear + 1; i >= currentYear - 5; i--) {
    options.push({ value: i, label: `Năm ${i}` });
  }
  return options;
};

// --- COMPONENT ---

const DateRangeNavigator = ({
  period,
  currentDate,
  onPeriodChange,
  onDateChange,
}) => {
  // --- HANDLERS ---
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (period === "week") newDate.setDate(newDate.getDate() - 7);
    if (period === "month") newDate.setMonth(newDate.getMonth() - 1);
    if (period === "year") newDate.setFullYear(newDate.getFullYear() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (period === "week") newDate.setDate(newDate.getDate() + 7);
    if (period === "month") newDate.setMonth(newDate.getMonth() + 1);
    if (period === "year") newDate.setFullYear(newDate.getFullYear() + 1);
    onDateChange(newDate);
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    const newDate = new Date(currentDate);

    if (period === "week") {
      onDateChange(new Date(value));
    } else if (period === "month") {
      newDate.setMonth(parseInt(value, 10));
      onDateChange(newDate);
    } else if (period === "year") {
      newDate.setFullYear(parseInt(value, 10));
      // Nếu đang ở tháng sau mà năm mới không có ngày đó, JS sẽ tự lùi tháng.
      // Cần set lại về đầu tháng để đảm bảo tính đúng đắn.
      newDate.setMonth(0, 1);
      onDateChange(newDate);
    }
  };

  // --- RENDER LOGIC ---
  const { options, selectedValue } = useMemo(() => {
    if (period === "week") {
      return {
        options: getWeekOptions(currentDate),
        selectedValue: startOfWeek(currentDate, {
          weekStartsOn: 1,
        }).toISOString(),
      };
    }
    if (period === "month") {
      return {
        options: getMonthOptions(),
        selectedValue: getMonth(currentDate),
      };
    }
    if (period === "year") {
      return {
        options: getYearOptions(currentDate),
        selectedValue: getYear(currentDate),
      };
    }
    return { options: [], selectedValue: "" };
  }, [period, currentDate]);

  return (
    <fieldset className={styles.dateRangeFieldset}>
      <legend className={styles.dateRangeLegend}>Bộ lọc thời gian</legend>
      <div className={styles.controlsGroup}>
        {/* Bộ lọc Tuần/Tháng/Năm */}
        <div className={styles.filterButtons}>
          <button
            onClick={() => onPeriodChange("week")}
            className={period === "week" ? styles.active : ""}
          >
            Tuần
          </button>
          <button
            onClick={() => onPeriodChange("month")}
            className={period === "month" ? styles.active : ""}
          >
            Tháng
          </button>
          <button
            onClick={() => onPeriodChange("year")}
            className={period === "year" ? styles.active : ""}
          >
            Năm
          </button>
        </div>

        {/* Điều hướng Trước/Sau và hiển thị ngày */}
        <div className={styles.navButtonsBox}>
          <button onClick={handlePrev} className={styles.navButton}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <select
            className={styles.navDateSelect}
            value={selectedValue}
            onChange={handleSelectChange}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button onClick={handleNext} className={styles.navButton}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </fieldset>
  );
};

export default DateRangeNavigator;
