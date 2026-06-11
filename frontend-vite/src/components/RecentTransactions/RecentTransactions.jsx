// src/components/RecentTransactions/RecentTransactions.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import TransactionItem from "./TransactionItem";
import styles from "./RecentTransactions.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faChevronDown, faHistory, faEye } from "@fortawesome/free-solid-svg-icons";
import AddEditTransactionModal from "../Transactions/AddEditTransactionModal";
import ConfirmDialog from "../Common/ConfirmDialog";
import Button from "../Common/Button";

const RecentTransactions = ({
  // Props từ cha
  transactions = [],
  isLoading = false,
  error = "",
  hasMore = false,
  totalCount = 0, // Tổng số giao dịch  
  currentPage = 1, // Trang hiện tại
  itemsPerPage = 10, // Số item mỗi trang

  // Callbacks từ cha
  onLoadMore,
  onEditRequest,
  onDeleteRequest,
  onConfirmDelete,
  onSubmitSuccess,
  onCloseModal,
  onCloseConfirm,
  onAddRequest, // Callback cho add transaction
  onCategoryClick, // Callback cho category click

  // State cho modals
  isModalOpen = false,
  isConfirmOpen = false,
  editingTransaction = null,
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate("/transactions");
  };

  const handleViewAll = () => {
    navigate("/transactions");
  };

  // Tính toán thông tin load more
  const loadedCount = transactions.length;
  const remainingCount = totalCount - loadedCount;
  const canLoadMore = hasMore && remainingCount > 0;

  // Render content dựa trên state
  let content;
  if (isLoading && transactions.length === 0) {
    content = <div className={styles.loadingIndicator}>Đang tải...</div>;
  } else if (error) {
    content = (
      <p className={`${styles.errorText} ${styles.noTransactions}`}>{error}</p>
    );
  } else if (transactions.length === 0) {
    content = <p className={styles.noTransactions}>Chưa có giao dịch nào.</p>;
  } else {
    content = (
      <div className={styles.tableWrapper}>
        <table className={styles.transactionsTable}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Danh mục</th>
              <th>Mô tả</th>
              <th>Phương thức TT</th>
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
                onCategoryClick={onCategoryClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.recentTransactionsContainer}>
      <div className={styles.header}>
        {/* Áp dụng title hierarchy H3 với icon - Chỉ có title */}
        <h3 className={styles.title}>
          <FontAwesomeIcon icon={faHistory} className={styles.titleIcon} />
          Giao dịch gần đây
        </h3>
      </div>
      
      {/* Transaction Summary với nút Xem tất cả */}
      {transactions.length > 0 && (
        <div className={styles.summarySection}>
          <div className={styles.summaryStats}>
            <span className={styles.summaryText}>
              📊 Hiển thị {transactions.length} giao dịch gần nhất
            </span>
            {totalCount > transactions.length && (
              <span className={styles.moreAvailable}>
                (còn {totalCount - transactions.length} giao dịch khác)
              </span>
            )}
          </div>
          <div className={styles.summaryActions}>
            <Button
              onClick={handleViewDetails}
              variant="success"
              icon={<FontAwesomeIcon icon={faEye} />}
              className={styles.viewAllButton}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Màu xanh dương giống "Xem chi tiết"
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              Xem tất cả
            </Button>
          </div>
        </div>
      )}
      
      {content}
      
      {/* Load More Section */}
      <div className={styles.loadMoreButtonOuterContainer}>
        {totalCount > 0 && loadedCount > 0 && (
          <div className={styles.loadMoreInfo}>
            Đã hiển thị {loadedCount} / {totalCount} giao dịch
          </div>
        )}
        
        {canLoadMore && !isLoading && (
          <button onClick={onLoadMore} className={styles.loadMoreButton}>
            <span>Tải thêm ({Math.min(itemsPerPage, remainingCount)} giao dịch)</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={styles.loadMoreIcon}
            />
          </button>
        )}
        
        {isLoading && transactions.length > 0 && (
          <button className={styles.loadMoreButton} disabled>
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className={styles.loadMoreIcon}
            />
            <span>Đang tải...</span>
          </button>
        )}
        
        {!canLoadMore && totalCount > loadedCount && (
          <button onClick={handleViewAll} className={styles.loadMoreViewAllButton}>
            <span>Xem tất cả ({totalCount} giao dịch)</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={styles.loadMoreIcon}
            />
          </button>
        )}
      </div>
      {!hasMore && transactions.length > 0 && (
        <p className={styles.noMoreTransactions}>
          Đã hiển thị tất cả giao dịch.
        </p>
      )}

      {/* Modals */}
      {isModalOpen && (
        <AddEditTransactionModal
          isOpen={isModalOpen}
          onClose={onCloseModal}
          onSubmitSuccess={onSubmitSuccess}
          mode={editingTransaction ? "edit" : "add"}
          initialData={editingTransaction}
        />
      )}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={onCloseConfirm}
        onConfirm={onConfirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa giao dịch này không?"
      />
    </div>
  );
};

export default RecentTransactions;
