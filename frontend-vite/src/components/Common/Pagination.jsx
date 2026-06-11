// Ghi vào file: frontend-vite/src/components/Common/Pagination.jsx

import React from "react";
import styles from "./Pagination.module.css"; // Sẽ tạo CSS ngay sau
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Không hiển thị nếu chỉ có 1 trang
  }

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Logic để chỉ hiển thị một số lượng trang nhất định (vd: ... 2 3 4 ...)
  const getPaginationGroup = () => {
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    let pages = [];
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages - 1) pages.push("...");

    return pages;
  };

  return (
    <nav className={styles.paginationContainer} aria-label="Pagination">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.navButton}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
        <span>Trước</span>
      </button>

      <ul className={styles.pageList}>
        <li key={1}>
          <button
            onClick={() => handlePageClick(1)}
            className={`${styles.pageButton} ${
              currentPage === 1 ? styles.active : ""
            }`}
          >
            1
          </button>
        </li>

        {getPaginationGroup().map((item, index) => (
          <li key={`${item}-${index}`}>
            {item === "..." ? (
              <span className={styles.ellipsis}>...</span>
            ) : (
              <button
                onClick={() => handlePageClick(item)}
                className={`${styles.pageButton} ${
                  currentPage === item ? styles.active : ""
                }`}
              >
                {item}
              </button>
            )}
          </li>
        ))}

        {totalPages > 1 && (
          <li key={totalPages}>
            <button
              onClick={() => handlePageClick(totalPages)}
              className={`${styles.pageButton} ${
                currentPage === totalPages ? styles.active : ""
              }`}
            >
              {totalPages}
            </button>
          </li>
        )}
      </ul>

      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.navButton}
      >
        <span>Sau</span>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </nav>
  );
};

export default Pagination;
