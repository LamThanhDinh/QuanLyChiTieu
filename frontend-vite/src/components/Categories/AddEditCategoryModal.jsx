import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./AddEditCategoryModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faArrowDown,
  faArrowUp,
  faExclamationTriangle,
  faCheckCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { availableIconsForSelection, getIconObject } from "../../utils/iconMap";

const CATEGORY_TYPE = {
  CHITIEU: "CHITIEU",
  THUNHAP: "THUNHAP",
  ALL: "ALL",
};

const AddEditCategoryModal = ({
  isOpen,
  mode,
  categoryType: initialType,
  initialData,
  onClose,
  onSubmit,
}) => {
  // Refs for focus management
  const firstInputRef = useRef(null);
  const modalContentRef = useRef(null);

  // Enhanced state management
  const [name, setName] = useState("");
  const [type, setType] = useState(initialType || CATEGORY_TYPE.CHITIEU);
  const [selectedIcon, setSelectedIcon] = useState(
    availableIconsForSelection[0]?.identifier || "fa-bullseye"
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smart validation state
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  // Smart validation functions
  const validateField = useCallback((fieldName, value) => {
    switch (fieldName) {
      case "name":
        if (!value?.trim()) return "Tên danh mục không được để trống";
        if (value.trim().length < 2)
          return "Tên danh mục phải có ít nhất 2 ký tự";
        if (value.trim().length > 50)
          return "Tên danh mục không được quá 50 ký tự";
        if (!/^[a-zA-ZÀ-ỹ0-9\s\-_]+$/.test(value.trim()))
          return "Tên danh mục chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới";
        return null;
      case "selectedIcon":
        if (!value) return "Vui lòng chọn một biểu tượng";
        return null;
      default:
        return null;
    }
  }, []);

  // Real-time validation
  const validateForm = useCallback(() => {
    const errors = {};
    errors.name = validateField("name", name);
    errors.selectedIcon = validateField("selectedIcon", selectedIcon);

    setFieldErrors(errors);
    const hasErrors = Object.values(errors).some((error) => error !== null);
    setIsValid(!hasErrors);
    return !hasErrors;
  }, [name, selectedIcon, validateField]);

  // Handle field blur for smart validation
  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Smart category name suggestions based on type
  const getNameSuggestions = () => {
    const expenseSuggestions = [
      "Ăn uống",
      "Di chuyển",
      "Mua sắm",
      "Giải trí",
      "Y tế",
      "Giáo dục",
      "Nhà ở",
      "Tiện ích",
      "Bảo hiểm",
      "Quà tặng",
      "Từ thiện",
      "Khác",
    ];

    const incomeSuggestions = [
      "Lương",
      "Thưởng",
      "Làm thêm",
      "Đầu tư",
      "Kinh doanh",
      "Cho thuê",
      "Bán hàng",
      "Freelance",
      "Lãi suất",
      "Quà tặng",
      "Khác",
    ];

    return type === CATEGORY_TYPE.CHITIEU
      ? expenseSuggestions
      : incomeSuggestions;
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (isValid && !isSubmitting) {
          // Submit form trực tiếp thay vì gọi handleSubmit
          const form = e.target.closest("form");
          if (form) {
            form.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true })
            );
          }
        }
      }
    },
    [isValid, isSubmitting, onClose]
  );

  // Focus management and keyboard listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Auto-focus first input after modal animation
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Validate form whenever relevant fields change
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setName(initialData.name || "");
        setType(initialData.type || CATEGORY_TYPE.CHITIEU);
        setSelectedIcon(
          initialData.icon ||
            availableIconsForSelection[0]?.identifier ||
            "fa-bullseye"
        );
        setError("");
        setFieldErrors({});
        setTouched({});
      } else if (mode === "add") {
        setName("");
        setType(
          initialType === CATEGORY_TYPE.ALL
            ? CATEGORY_TYPE.CHITIEU
            : initialType || CATEGORY_TYPE.CHITIEU
        );
        setSelectedIcon(
          availableIconsForSelection[0]?.identifier || "fa-bullseye"
        );
        setError("");
        setFieldErrors({});
        setTouched({});
      }
    }
  }, [isOpen, mode, initialData, initialType]);

  // Enhanced submit handler with comprehensive validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive validation before submit
    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại các trường đã nhập.");
      // Mark all fields as touched to show validation errors
      setTouched({
        name: true,
        selectedIcon: true,
      });
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        type,
        icon: selectedIcon,
      });
    } catch (apiError) {
      console.error("Lỗi khi submit form trong modal:", apiError);
      setError(apiError.message || "Có lỗi xảy ra khi lưu danh mục.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    setFieldErrors({});
    setTouched({});
    onClose();
  };

  // Smart name suggestions click handler
  const handleNameSuggestionClick = (suggestion) => {
    setName(suggestion);
    setTouched((prev) => ({ ...prev, name: true }));
  };

  // Handle name change with smart validation
  const handleNameChange = (e) => {
    setName(e.target.value);
    setTouched((prev) => ({ ...prev, name: true }));
  };

  // Handle icon selection with smart suggestions
  const handleIconSelect = (iconIdentifier) => {
    setSelectedIcon(iconIdentifier);
    setTouched((prev) => ({ ...prev, selectedIcon: true }));
  };

  if (!isOpen) {
    return null;
  }

  const modalTitle = mode === "add" ? "Thêm Danh Mục Mới" : "Sửa Danh Mục";
  const submitButtonText = mode === "add" ? "Thêm Danh Mục" : "Lưu Thay Đổi";
  const nameSuggestions = getNameSuggestions();

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        ref={modalContentRef}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FontAwesomeIcon
              icon={mode === "add" ? faArrowDown : faCheckCircle}
              className={styles.titleIcon}
            />
            {modalTitle}
          </h2>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="Đóng modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.categoryForm}>
          {error && (
            <div className={styles.errorMessage}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {error}
            </div>
          )}

          {/* Enhanced Name Input Section */}
          <div className={styles.formGroup}>
            <label htmlFor="categoryName" className={styles.formLabel}>
              Tên danh mục <span className={styles.requiredStar}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                ref={firstInputRef}
                type="text"
                id="categoryName"
                value={name}
                onChange={handleNameChange}
                onBlur={() => handleFieldBlur("name")}
                className={`${styles.formInput} ${
                  touched.name && fieldErrors.name ? styles.inputError : ""
                } ${touched.name && !fieldErrors.name ? styles.inputSuccess : ""}`}
                placeholder="Ví dụ: Tiền ăn, Lương tháng..."
                required
                disabled={isSubmitting}
              />
              {touched.name && fieldErrors.name && (
                <div className={styles.fieldError}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {fieldErrors.name}
                </div>
              )}
              {touched.name && !fieldErrors.name && name.trim() && (
                <div className={styles.fieldSuccess}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Tên danh mục hợp lệ
                </div>
              )}
            </div>

            {/* Smart Name Suggestions */}
            {!name.trim() && (
              <div className={styles.suggestionsWrapper}>
                <div className={styles.suggestionsLabel}>Gợi ý:</div>
                <div className={styles.suggestions}>
                  {nameSuggestions.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className={styles.suggestionChip}
                      onClick={() => handleNameSuggestionClick(suggestion)}
                      disabled={isSubmitting}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Type Selection */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Loại danh mục <span className={styles.requiredStar}>*</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="categoryType"
                  value={CATEGORY_TYPE.CHITIEU}
                  checked={type === CATEGORY_TYPE.CHITIEU}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isSubmitting}
                  className={styles.radioInput}
                />
                <span
                  className={`${styles.radioLabelText} ${styles.expense} ${
                    type === CATEGORY_TYPE.CHITIEU ? styles.selected : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faArrowDown}
                    className={styles.radioIcon}
                  />
                  Chi tiêu
                </span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="categoryType"
                  value={CATEGORY_TYPE.THUNHAP}
                  checked={type === CATEGORY_TYPE.THUNHAP}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isSubmitting}
                  className={styles.radioInput}
                />
                <span
                  className={`${styles.radioLabelText} ${styles.income} ${
                    type === CATEGORY_TYPE.THUNHAP ? styles.selected : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faArrowUp}
                    className={styles.radioIcon}
                  />
                  Thu nhập
                </span>
              </label>
            </div>
          </div>

          {/* Enhanced Icon Selection */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Chọn biểu tượng <span className={styles.requiredStar}>*</span>
            </label>

            {/* Main Icon Grid */}
            <div className={styles.iconSelectionGrid}>
              {availableIconsForSelection.map((iconInfo) => (
                <button
                  type="button"
                  key={iconInfo.identifier}
                  onClick={() => handleIconSelect(iconInfo.identifier)}
                  className={`${styles.iconButton} ${
                    selectedIcon === iconInfo.identifier
                      ? styles.iconButtonSelected
                      : ""
                  }`}
                  title={iconInfo.name}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon={getIconObject(iconInfo.identifier)} />
                </button>
              ))}
            </div>

            {touched.selectedIcon && fieldErrors.selectedIcon && (
              <div className={styles.fieldError}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {fieldErrors.selectedIcon}
              </div>
            )}
          </div>

          {/* Enhanced Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={`${styles.formButton} ${styles.cancelButton}`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`${styles.formButton} ${styles.submitButton} ${
                isValid ? styles.submitButtonActive : ""
              }`}
            >
              {isSubmitting && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className={styles.submitSpinner}
                />
              )}
              {submitButtonText}
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className={styles.keyboardHints}>
            <span>
              💡 Mẹo: Nhấn <kbd>Ctrl</kbd> + <kbd>Enter</kbd> để lưu nhanh
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCategoryModal;
