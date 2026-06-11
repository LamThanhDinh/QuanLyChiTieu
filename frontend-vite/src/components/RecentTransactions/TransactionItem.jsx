// src/components/RecentTransactions/TransactionItem.jsx
import React, { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RecentTransactions.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { getIconObject } from "../../utils/iconMap";

// Hàm chỉ định dạng ngày (VD: 17/06/2025)
const formatDateOnly = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Hàm chỉ định dạng giờ (VD: 19:51)
const formatTimeOnly = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "0 ₫";
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const TransactionItem = forwardRef(
  ({ transaction, onEditRequest, onDeleteRequest, onCategoryClick }, ref) => {
    const navigate = useNavigate();

    if (!transaction) return null;

    const {
      id,
      date,
      category,
      description,
      paymentMethod,
      amount,
      type,
      createdAt,
    } = transaction;

    const handleEdit = () => onEditRequest(transaction);
    const handleDelete = () => onDeleteRequest(id);

    const handleCategoryClick = () => {
      console.log("Category clicked:", category);
      const categoryId = category?.id || category?._id;
      console.log("Category ID:", categoryId);
      
      if (category && categoryId) {
        // Nếu có callback từ parent thì dùng callback đó
        if (onCategoryClick) {
          console.log("Calling onCategoryClick with:", categoryId, category.name);
          onCategoryClick(categoryId, category.name);
        } else {
          // Fallback về behavior cũ
          console.log("Fallback navigation to transactions");
          navigate(`/transactions?categoryId=${categoryId}`);
        }
      } else {
        console.log("No category or category ID found");
      }
    };

    const getStyleForAccount = (account) => {
      if (!account?.type) return styles.pmOther;
      switch (account.type) {
        case "TIENMAT":
          return styles.pmCash;
        case "THENGANHANG":
          return styles.pmBank;
        default:
          return styles.pmOther;
      }
    };

    return (
      <tr ref={ref} className={styles.transactionRow}>
        <td data-label="Thời gian">
          <div className={styles.dateTimeContainer}>
            <span className={styles.datePart}>{formatDateOnly(date)}</span>
            <span className={styles.timePart}>
              Tạo lúc: {formatTimeOnly(createdAt)}
            </span>
          </div>
        </td>
        <td data-label="Danh mục" className={styles.categoryCell}>
          <FontAwesomeIcon
            icon={getIconObject(category?.icon)}
            className={styles.categoryIcon}
            style={{ marginRight: "8px" }}
          />
          <span
            className={styles.categoryNameLink}
            onClick={handleCategoryClick}
            title={`Click để xem chi tiết danh mục "${category?.name}"`}
          >
            {category?.name || "N/A"}
          </span>
        </td>
        <td data-label="Mô tả" className={styles.descriptionCell}>
          {description || "-"}
        </td>
        <td data-label="Phương thức TT">
          <span
            className={`${styles.paymentMethodBadge} ${getStyleForAccount(
              paymentMethod
            )}`}
          >
            {paymentMethod?.name || "N/A"}
          </span>
        </td>
        <td
          data-label="Số tiền"
          className={`${styles.amountCell} ${
            type === "THUNHAP" ? styles.incomeAmount : styles.expenseAmount
          }`}
        >
          {formatCurrency(amount)}
        </td>
        <td data-label="Hành động" className={styles.actionsCell}>
          <button
            onClick={handleEdit}
            className={`${styles.actionButton} ${styles.editButton}`}
            title="Sửa"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={handleDelete}
            className={`${styles.actionButton} ${styles.deleteButton}`}
            title="Xóa"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </td>
      </tr>
    );
  }
);

export default TransactionItem;
