// Ghi vào file: frontend-vite/src/components/Transactions/TransactionList.jsx

import React from "react";
import TransactionItem from "../RecentTransactions/TransactionItem"; // Tận dụng component có sẵn
import Pagination from "../Common/Pagination";
import styles from "./TransactionList.module.css"; // Sẽ tạo CSS
import { faHistory } from "@fortawesome/free-solid-svg-icons"; // Thêm icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Thêm import
const TransactionList = ({
  transactions,
  pagination,
  isLoading,
  error,
  onPageChange,
  onEditRequest,
  onDeleteRequest,
}) => {
  let content;
  if (isLoading) {
    content = <div className={styles.message}>Đang tải giao dịch...</div>;
  } else if (error) {
    content = (
      <div className={`${styles.message} ${styles.error}`}>{error}</div>
    );
  } else if (transactions.length === 0) {
    content = (
      <div className={styles.message}>
        Không tìm thấy giao dịch nào phù hợp.
      </div>
    );
  } else {
    content = (
      <div className={styles.tableWrapper}>
        <table className={styles.transactionsTable}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Danh mục</th>
              <th>Mô tả</th>
              <th>Tài khoản</th>
              <th className={styles.amountHeader}>Số tiền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEditRequest={onEditRequest}
                onDeleteRequest={onDeleteRequest}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <h3 className={styles.title}>
        <FontAwesomeIcon icon={faHistory} className={styles.titleIcon} />
        Lịch sử Giao dịch
      </h3>
      {content}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default TransactionList;
