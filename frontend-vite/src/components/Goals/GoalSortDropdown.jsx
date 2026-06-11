import React from "react";
import Select from "react-select";
import styles from "./GoalSortDropdown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortAmountDown,
  faSortAmountUp,
} from "@fortawesome/free-solid-svg-icons";

const options = [
  { value: "PROGRESS", label: "Tiến độ" },
  { value: "DEADLINE", label: "Hạn chót" },
  { value: "CREATED", label: "Ngày tạo" },
];

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderColor: state.isFocused ? "#a5b4fc" : "transparent",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.2)" : "none",
    minHeight: 36,
    fontWeight: 600,
    fontSize: "1rem",
    color: "#374151",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "140px",
    minWidth: "120px",
    maxWidth: "220px",
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "1rem",
    fontWeight: 500,
    color: "#374151",
    backgroundColor: state.isSelected
      ? "#e0e7ff"
      : state.isFocused
        ? "#f3f4f6"
        : "#fff",
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#374151",
    fontWeight: 600,
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    display: "none",
  }),
  indicatorSeparator: () => ({ display: "none" }),
};

const GoalSortDropdown = ({
  sortType,
  sortDirection,
  onSortTypeChange,
  onSortDirectionChange,
}) => {
  const handleDirectionClick = () => {
    onSortDirectionChange(sortDirection === "desc" ? "asc" : "desc");
  };

  return (
    <div className={styles.sortWrapper}>
      <button
        type="button"
        className={styles.sortIcon}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        onClick={handleDirectionClick}
        aria-label={
          sortDirection === "desc" ? "Sắp xếp giảm dần" : "Sắp xếp tăng dần"
        }
        title={
          sortDirection === "desc" ? "Sắp xếp giảm dần" : "Sắp xếp tăng dần"
        }
      >
        <FontAwesomeIcon
          icon={sortDirection === "desc" ? faSortAmountDown : faSortAmountUp}
        />
      </button>
      <div style={{ flex: 1, minWidth: 120 }}>
        <Select
          options={options}
          value={options.find((opt) => opt.value === sortType) || options[0]}
          onChange={(opt) => onSortTypeChange(opt.value)}
          styles={customStyles}
          isSearchable={false}
          aria-label="Sắp xếp mục tiêu"
          menuPlacement="auto"
        />
      </div>
    </div>
  );
};

export default GoalSortDropdown;
