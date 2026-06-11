// src/components/Goals/GoalControls.jsx
import React from "react";
import GoalFilterButtons from "./GoalFilterButtons";
import GoalSortDropdown from "./GoalSortDropdown";
import styles from "./GoalControls.module.css"; // Sẽ tạo ở bước 2

const GoalControls = ({
  filterValue,
  onFilterChange,
  sortType,
  sortDirection,
  onSortTypeChange,
  onSortDirectionChange,
}) => {
  // Các filter phù hợp với backend: ALL, IN_PROGRESS, COMPLETED, OVERDUE, ARCHIVED
  return (
    <fieldset className={styles.goalControlsFieldset}>
      <legend className={styles.goalControlsLegend}>Bộ lọc & Sắp xếp</legend>
      <div className={styles.controlsGroup}>
        {/* Component nút lọc trạng thái */}
        <GoalFilterButtons
          value={filterValue}
          onChange={onFilterChange}
          filters={[
            { label: "Tất cả", value: "ALL" },
            { label: "Đang thực hiện", value: "IN_PROGRESS" },
            { label: "Hoàn thành", value: "COMPLETED" },
            { label: "Quá hạn", value: "OVERDUE" },
            { label: "Đã lưu trữ", value: "ARCHIVED" },
          ]}
        />

        {/* Component dropdown sắp xếp */}
        <GoalSortDropdown
          sortType={sortType}
          sortDirection={sortDirection}
          onSortTypeChange={onSortTypeChange}
          onSortDirectionChange={onSortDirectionChange}
        />
      </div>
    </fieldset>
  );
};

export default GoalControls;
