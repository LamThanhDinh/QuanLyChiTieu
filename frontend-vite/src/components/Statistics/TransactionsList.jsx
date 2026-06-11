import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faCalendarAlt,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { getIconObject } from "../../utils/iconMap";
import styles from "./TransactionsList.module.css";

const TransactionsList = ({
  transactions = [],
  loading = false,
  error = null,
  filter = null,
  onClearFilter = () => {},
  onTransactionClick = () => {},
}) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Đang tải danh sách giao dịch...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>
            Danh sách giao dịch
            {filter && (
              <span className={styles.filterIndicator}>
                (đã lọc theo danh mục)
              </span>
            )}
          </h3>
          <p className={styles.subtitle}>
            Tổng cộng: {transactions.length} giao dịch
          </p>
        </div>

        {filter && (
          <button
            className={styles.clearFilterButton}
            onClick={onClearFilter}
            title="Xóa bộ lọc danh mục"
          >
            <FontAwesomeIcon icon={faFilter} />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FontAwesomeIcon icon={faWallet} />
          </div>
          <h4 className={styles.emptyTitle}>Không có giao dịch</h4>
          <p className={styles.emptyDescription}>
            {filter
              ? "Không có giao dịch nào cho danh mục được chọn trong khoảng thời gian này."
              : "Không có giao dịch nào trong khoảng thời gian này."}
          </p>
        </div>
      ) : (
        <div className={styles.transactionsList}>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={styles.transactionItem}
              onClick={() => onTransactionClick(transaction)}
            >
              {/* Transaction Type Indicator */}
              <div
                className={`${styles.typeIndicator} ${
                  transaction.type === "THUNHAP"
                    ? styles.income
                    : styles.expense
                }`}
              >
                <div className={styles.typeIcon}>
                  {transaction.type === "THUNHAP" ? "+" : "-"}
                </div>
              </div>

              {/* Transaction Info */}
              <div className={styles.transactionInfo}>
                <div className={styles.mainInfo}>
                  <h4 className={styles.description}>
                    {transaction.description}
                  </h4>
                  <p className={styles.category}>
                    <FontAwesomeIcon
                      icon={getIconObject(transaction.category?.icon)}
                      className={styles.categoryIcon}
                    />
                    {transaction.category?.name || "Chưa phân loại"}
                  </p>
                </div>

                <div className={styles.metaInfo}>
                  <span className={styles.date}>
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className={styles.dateIcon}
                    />
                    {new Date(transaction.date).toLocaleDateString("vi-VN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {transaction.paymentMethod?.name && (
                    <span className={styles.account}>
                      <FontAwesomeIcon
                        icon={faWallet}
                        className={styles.accountIcon}
                      />
                      {transaction.paymentMethod.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div
                className={`${styles.amount} ${
                  transaction.type === "THUNHAP"
                    ? styles.incomeAmount
                    : styles.expenseAmount
                }`}
              >
                {transaction.type === "THUNHAP" ? "+" : "-"}
                {transaction.amount?.toLocaleString("vi-VN")} ₫
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
