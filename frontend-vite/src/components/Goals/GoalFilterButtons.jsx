// src/components/Goals/GoalFilterButtons.jsx (Phiên bản Dropdown)
import React, { useState, useEffect, useRef } from "react";
import styles from "./GoalFilterButtons.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faCheck } from "@fortawesome/free-solid-svg-icons";

const FILTERS = [
  { label: "Tất cả", value: "ALL" }, // 'ALL' sẽ trả về các mục tiêu chưa lưu trữ
  { label: "Đang thực hiện", value: "IN_PROGRESS" },
  { label: "Đã hoàn thành", value: "COMPLETED" },
  { label: "Đã quá hạn", value: "OVERDUE" },
  { label: "Đã lưu trữ", value: "ARCHIVED" }, // Lựa chọn mới
];

const GoalFilterButtons = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selectedLabel =
    FILTERS.find((opt) => opt.value === value)?.label || "Lọc theo";

  // Logic để đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (newValue) => {
    onChange(newValue);
    setIsOpen(false); // Tự động đóng menu sau khi chọn
  };

  return (
    <div className={styles.filterWrapper} ref={wrapperRef}>
      {/* Nút chính để mở menu */}
      <button
        className={styles.filterButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={faFilter} />
        <span>{selectedLabel}</span>
      </button>

      {/* Menu thả xuống */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {FILTERS.map((option) => (
            <button
              key={option.value}
              className={`${styles.dropdownItem} ${value === option.value ? styles.activeItem : ""}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
              {value === option.value && (
                <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalFilterButtons;
