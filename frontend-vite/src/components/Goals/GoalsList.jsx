// src/components/Goals/GoalsList.jsx

import React from "react";
import styles from "./GoalsList.module.css";
import GoalCard from "./GoalCard"; // <-- IMPORT COMPONENT MỚI

export default function GoalsList({
  goals,
  onEdit,
  onDelete,
  onAddFunds,
  onShowHistory,
  onToggleArchive,
  onTogglePin,
}) {
  if (goals.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>Bạn chưa có mục tiêu nào cả!</h2>
        <p>Hãy nhấn nút "Tạo mục tiêu mới" để bắt đầu hành trình của bạn.</p>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      {goals.map((goal) => (
        // THAY THẾ DIV CŨ BẰNG GOALCARD
        <GoalCard
          key={goal._id}
          goal={goal}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddFunds={onAddFunds}
          onShowHistory={onShowHistory}
          onToggleArchive={onToggleArchive}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
}
