import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faEye,
  faChartBar,
  faPercent,
} from "@fortawesome/free-solid-svg-icons";
import { getIconObject } from "../../utils/iconMap";
import styles from "./CategoryStatsTable.module.css";

const CategoryStatsTable = ({
  data = [],
  type = "expense", // "expense" or "income"
  total = 0,
  loading = false,
  onCategoryClick = () => {},
}) => {
  const [sortField, setSortField] = useState("value");
  const [sortDirection, setSortDirection] = useState("desc");

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "name") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return faSort;
    return sortDirection === "asc" ? faSortUp : faSortDown;
  };

  const getPercentage = (value) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FontAwesomeIcon icon={faChartBar} className={styles.emptyIcon} />
        <h4 className={styles.emptyTitle}>Không có dữ liệu</h4>
        <p className={styles.emptyDescription}>
          Không có dữ liệu {type === "expense" ? "chi tiêu" : "thu nhập"} theo
          danh mục.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Chi tiết {type === "expense" ? "chi tiêu" : "thu nhập"} theo danh mục
        </h3>
        <div className={styles.summary}>
          <span className={styles.totalCount}>{data.length} danh mục</span>
          <span className={styles.totalAmount}>
            Tổng: {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.rankHeader}>#</th>
              <th
                className={`${styles.nameHeader} ${styles.sortable}`}
                onClick={() => handleSort("name")}
              >
                Danh mục
                <FontAwesomeIcon
                  icon={getSortIcon("name")}
                  className={styles.sortIcon}
                />
              </th>
              <th
                className={`${styles.amountHeader} ${styles.sortable}`}
                onClick={() => handleSort("value")}
              >
                Số tiền
                <FontAwesomeIcon
                  icon={getSortIcon("value")}
                  className={styles.sortIcon}
                />
              </th>
              <th className={styles.percentHeader}>
                <FontAwesomeIcon
                  icon={faPercent}
                  className={styles.percentIcon}
                />
                Tỷ lệ
              </th>
              <th className={styles.actionHeader}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((category, index) => (
              <tr key={category.id || index} className={styles.row}>
                <td className={styles.rank}>
                  <span
                    className={`${styles.rankBadge} ${index < 3 ? styles.topRank : ""}`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className={styles.categoryName}>
                  <div className={styles.categoryInfo}>
                    {category.icon && (
                      <span className={styles.categoryIcon}>
                        <FontAwesomeIcon icon={getIconObject(category.icon)} />
                      </span>
                    )}
                    <span className={styles.name}>{category.name}</span>
                  </div>
                </td>
                <td className={styles.amount}>
                  <span
                    className={`${styles.amountValue} ${
                      type === "expense"
                        ? styles.expenseAmount
                        : styles.incomeAmount
                    }`}
                  >
                    {formatCurrency(category.value)}
                  </span>
                </td>
                <td className={styles.percentage}>
                  <div className={styles.percentageContainer}>
                    <span className={styles.percentageText}>
                      {getPercentage(category.value)}%
                    </span>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${
                          type === "expense"
                            ? styles.expenseProgress
                            : styles.incomeProgress
                        }`}
                        style={{ width: `${getPercentage(category.value)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className={styles.actions}>
                  <button
                    className={styles.viewButton}
                    onClick={() => onCategoryClick(category)}
                    title="Xem giao dịch"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryStatsTable;
