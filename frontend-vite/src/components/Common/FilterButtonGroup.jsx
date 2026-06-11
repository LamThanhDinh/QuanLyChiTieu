import React from "react";
import styles from "./FilterButtonGroup.module.css";

/**
 * Presentational filter button group, similar style to DateRangeNavigator.
 * @param {Object} props
 * @param {Array<{label: string, value: string, icon?: React.ReactNode}>} props.options - List of filter options
 * @param {string} props.value - Current selected value
 * @param {(value: string) => void} props.onChange - Callback when filter changes
 * @param {string} [props.className] - Optional extra class
 */
const FilterButtonGroup = ({ options, value, onChange, className = "" }) => {
  return (
    <div className={`${styles.filterButtonGroup} ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={value === opt.value ? styles.active : ""}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.icon && <span className={styles.icon}>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtonGroup;
