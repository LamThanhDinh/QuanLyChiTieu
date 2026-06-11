import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CategoryList.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { getIconObject } from "../../utils/iconMap";
import ConfirmDialog from "../Common/ConfirmDialog";
import Badge from "../Common/Badge";

// Hàm định dạng tiền tệ (Không đổi)
const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "0 ₫";
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

// --- CategoryItem Component (Không thay đổi) ---
const CategoryItem = ({
  category,
  onEdit,
  onDeleteRequest,
  selected,
  onSelect,
}) => {
  const amountStyle =
    category.type === "THUNHAP" ? styles.incomeAmount : styles.expenseAmount;

  return (
    <div
      className={`${styles.categoryItem} ${selected ? styles.selected : ""}`}
      onClick={(e) => {
        // Nếu click vào nút edit/delete thì không gọi onSelect
        if (e.target.closest("button")) return;
        if (onSelect) onSelect(category);
      }}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.categoryInfo}>
        <FontAwesomeIcon
          icon={getIconObject(category.icon)}
          className={styles.categoryIcon}
        />
        <span className={styles.categoryName}>{category.name}</span>
      </div>
      <div className={`${styles.categoryTotalAmount} ${amountStyle}`}>
        {category.totalAmount !== undefined
          ? formatCurrency(category.totalAmount)
          : "-"}
      </div>
      <div className={styles.categoryActions}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(category);
          }}
          className={`${styles.actionButton} ${styles.editButton}`}
          title="Sửa"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(category._id || category.id, category.name);
          }}
          className={`${styles.actionButton} ${styles.deleteButton}`}
          title="Xóa"
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      </div>
    </div>
  );
};

// --- ✅ THAY ĐỔI 1: CẬP NHẬT PROPS VÀ LOẠI BỎ LOGIC FETCH ---
const CategoryList = ({
  categories,
  isLoading,
  error,
  onEditCategory,
  onDeleteCategory, // Function để delete category từ parent
  onDeleteSuccess,
  activeCategory,
  onSelectCategory,
  chartData,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const activeItemRef = useRef(null); // Ref cho item đang active
  const navigate = useNavigate();

  // ✅ THÊM: State cho hộp thoại xác nhận mở danh sách giao dịch
  const [isNavigateConfirmOpen, setIsNavigateConfirmOpen] = useState(false);
  const [categoryToNavigate, setCategoryToNavigate] = useState(null);

  const activeCategoryId = activeCategory ? activeCategory.id : null;

  // ✅ THAY ĐỔI: useEffect để cuộn tới item được chọn
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center", // Thay đổi từ "nearest" thành "center" để đảm bảo hiển thị đầy đủ
        inline: "start",
      });
    }
  }, [activeCategoryId]);

  const requestDeleteCategory = (categoryId, categoryName) => {
    setDeleteError(""); // Reset lỗi xóa mỗi khi mở dialog
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete || !onDeleteCategory) return;
    try {
      // ✅ THAY ĐỔI: Gọi hàm xóa từ parent component
      await onDeleteCategory(categoryToDelete.id);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      // Đóng dialog sau khi thành công
      setIsConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Lỗi khi xóa danh mục:", err);
      const message =
        err.response?.data?.message ||
        `Lỗi khi xóa danh mục "${categoryToDelete.name}".`;
      setDeleteError(message);
      // Giữ dialog mở để người dùng thấy lỗi
    }
  };

  const handleEditCategory = (category) => {
    if (onEditCategory) {
      onEditCategory(category);
    }
  };

  // ✅ THÊM: Hàm xử lý click vào badge
  const handleBadgeClick = (e, category) => {
    e.stopPropagation(); // Ngăn không trigger click của row

    // Highlight category trước khi navigate
    const chartEquivalent = chartData.find(
      (c) => c.id === (category._id || category.id)
    );
    const payload = chartEquivalent
      ? chartEquivalent
      : { id: category._id || category.id };
    onSelectCategory(payload);

    // Navigate đến transactions page với category filter và focus
    navigate(
      `/transactions?categoryId=${category._id || category.id}&focus=true`
    );
  };

  // ✅ THÊM: Hàm xử lý click vào category để toggle highlight hoặc mở dialog
  const handleCategoryClick = (category) => {
    // Tìm category tương ứng trong chart data
    const chartEquivalent = chartData.find(
      (c) => c.id === (category._id || category.id)
    );
    const payload = chartEquivalent
      ? chartEquivalent
      : { id: category._id || category.id };

    // Nếu category này đang được chọn, chỉ cần toggle (bỏ chọn)
    const currentActiveId = activeCategoryId;
    if (currentActiveId === (category._id || category.id)) {
      onSelectCategory(null); // Bỏ chọn
      return;
    }

    // Nếu chưa được chọn, highlight trước
    onSelectCategory(payload);

    // Sau đó mở dialog để hỏi có muốn xem transactions không
    setCategoryToNavigate(category);
    setIsNavigateConfirmOpen(true);
  };

  // ✅ THÊM: Hàm xử lý xác nhận mở danh sách giao dịch
  const handleConfirmNavigate = () => {
    if (categoryToNavigate) {
      navigate(
        `/transactions?categoryId=${categoryToNavigate._id || categoryToNavigate.id}`
      );
    }
    setIsNavigateConfirmOpen(false);
    setCategoryToNavigate(null);
  };

  // ✅ THÊM: Hàm đóng hộp thoại xác nhận
  const handleCloseNavigateConfirm = () => {
    setIsNavigateConfirmOpen(false);
    setCategoryToNavigate(null);
  };

  // --- ✅ THAY ĐỔI 2: CẬP NHẬT LOGIC RENDER DỰA TRÊN PROPS ---
  if (isLoading) {
    return <div className={styles.loadingMessage}>Đang tải danh mục...</div>;
  }

  // Hiển thị lỗi fetch tổng quát nếu có và không có dữ liệu
  if (error && categories.length === 0) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <>
      <div className={styles.categoryListContainer}>
        {/* Hiển thị lỗi fetch ngay cả khi có dữ liệu cũ */}
        {error && <p className={styles.inlineError}>{error}</p>}

        {categories.length === 0 && !isLoading && !error && (
          <p className={styles.noCategoriesMessage}>
            Không có danh mục nào để hiển thị.
          </p>
        )}
        {categories.length > 0 && (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Mục</th>
                  <th scope="col">Tổng tiền</th>
                  <th scope="col">Số giao dịch</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const isSelected =
                    activeCategoryId &&
                    (category._id || category.id) === activeCategoryId;

                  // Tìm màu sắc tương ứng từ chartData
                  const chartEntry = chartData?.find(
                    (c) => c.id === (category._id || category.id)
                  );
                  const sliceColor = chartEntry?.color || "#3f51b5";

                  // Tạo màu tối hơn cho hover
                  const hexToRgb = (hex) => {
                    const result =
                      /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result
                      ? {
                          r: parseInt(result[1], 16),
                          g: parseInt(result[2], 16),
                          b: parseInt(result[3], 16),
                        }
                      : null;
                  };

                  const rgb = hexToRgb(sliceColor);
                  const sliceColorLight = rgb
                    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
                    : "rgba(63, 81, 181, 0.3)";
                  const sliceColorDark = rgb
                    ? `rgba(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)}, 1)`
                    : "#32408f";

                  return (
                    <tr
                      key={category._id || category.id}
                      ref={isSelected ? activeItemRef : null}
                      className={`${styles.row} ${
                        isSelected ? styles.highlight : ""
                      }`}
                      data-category-name={category.name}
                      onClick={() => handleCategoryClick(category)}
                      role="button"
                      aria-selected={isSelected}
                      style={
                        isSelected
                          ? {
                              "--slice-color": sliceColor,
                              "--slice-color-light": sliceColorLight,
                              "--slice-color-dark": sliceColorDark,
                            }
                          : {}
                      }
                    >
                      <td>
                        <FontAwesomeIcon
                          icon={getIconObject(category.icon)}
                          className={styles.categoryIcon}
                        />
                        <span className={styles.categoryName}>
                          {category.name}
                        </span>
                      </td>
                      <td
                        className={`${styles.totalAmount} ${
                          category.type === "THUNHAP"
                            ? styles.incomeAmount
                            : styles.expenseAmount
                        }`}
                      >
                        {formatCurrency(category.totalAmount)}
                      </td>
                      <td className={styles.transactionCount}>
                        <Badge
                          variant="default"
                          size="small"
                          className={`${styles.transactionBadge} ${isSelected ? styles.selectedBadge : ""}`}
                          onClick={(e) => handleBadgeClick(e, category)}
                          title={`Xem ${category.transactionCount || 0} giao dịch của ${category.name}`}
                        >
                          {category.transactionCount || 0} giao dịch
                        </Badge>
                      </td>
                      <td>
                        <div className={styles.categoryActions}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                            }}
                            className={`${styles.actionButton} ${styles.editButton}`}
                            title="Sửa"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              requestDeleteCategory(
                                category._id || category.id,
                                category.name
                              );
                            }}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            title="Xóa"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa danh mục"
        message={
          <>
            <p>
              Bạn có chắc chắn muốn xóa danh mục "
              <strong>{categoryToDelete?.name || ""}</strong>"?
            </p>
            <p className={styles.warningText}>
              Hành động này không thể hoàn tác và các giao dịch liên quan có thể
              bị ảnh hưởng.
            </p>
            {deleteError && (
              <p className={styles.errorMessageDialog}>{deleteError}</p>
            )}
          </>
        }
      />
      {/* ✅ THÊM: Hộp thoại xác nhận mở danh sách giao dịch */}
      <ConfirmDialog
        isOpen={isNavigateConfirmOpen}
        onClose={handleCloseNavigateConfirm}
        onConfirm={handleConfirmNavigate}
        title="Mở danh sách giao dịch"
        message={
          <>
            <p>
              Bạn có muốn mở danh sách giao dịch của danh mục "
              <strong>{categoryToNavigate?.name || ""}</strong>" không?
            </p>
            <p>
              Hệ thống sẽ chuyển đến trang Giao dịch và lọc theo danh mục này.
            </p>
          </>
        }
      />
    </>
  );
};

export default CategoryList;
