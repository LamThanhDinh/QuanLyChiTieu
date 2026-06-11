// src/components/Goals/AddEditGoalModal.jsx

import React, { useState, useEffect } from "react";
import { createGoal, updateGoal } from "../../api/goalService"; //
import styles from "./AddEditGoalModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// 1. IMPORT THƯ VIỆN EMOJI PICKER
import EmojiPicker from "emoji-picker-react";

// Hàm tiện ích để chuyển đổi Date object thành chuỗi 'YYYY-MM-DD'
const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AddEditGoalModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  mode = "add",
  initialData = null,
}) {
  // State cho các trường trong form
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState("🎯");

  // State cho trạng thái modal
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 2. THÊM STATE MỚI ĐỂ QUẢN LÝ VIỆC HIỂN THỊ PICKER
  const [showPicker, setShowPicker] = useState(false);

  // Điền dữ liệu vào form khi ở chế độ "edit"
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setTargetAmount(String(initialData.targetAmount || ""));
      setDeadline(formatDateForInput(initialData.deadline));
      setIcon(initialData.icon || "🎯");
    } else {
      setName("");
      setTargetAmount("");
      setDeadline("");
      setIcon("🎯");
    }
    setError("");
    setShowPicker(false); // Đảm bảo picker luôn đóng khi modal mở lại
  }, [isOpen, mode, initialData]);

  // 3. THÊM HÀM XỬ LÝ KHI NGƯỜI DÙNG CHỌN MỘT EMOJI
  const onEmojiClick = (emojiObject) => {
    setIcon(emojiObject.emoji);
    setShowPicker(false); // Tự động đóng picker sau khi chọn
  };

  // Thêm useEffect để xử lý click outside và ESC key
  useEffect(() => {
    if (showPicker) {
      const handleClickOutside = (e) => {
        if (!e.target.closest(`.${styles.iconPickerWrapper}`)) {
          setShowPicker(false);
        }
      };

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setShowPicker(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showPicker]);

  // Hàm xử lý khi người dùng nhấn nút submit (giữ nguyên)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount) {
      setError("Vui lòng điền Tên và Số tiền mục tiêu.");
      return;
    }
    setIsLoading(true);
    setError("");
    const payload = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      icon: icon.trim(),
    };
    if (deadline) {
      payload.deadline = deadline;
    }

    try {
      if (mode === "edit") {
        // Gọi hàm cập nhật từ service
        await updateGoal(initialData._id, payload);
      } else {
        // Gọi hàm tạo mới từ service
        await createGoal(payload);
      }
      onSubmitSuccess();
      onClose();
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
          `Lỗi khi ${mode === "edit" ? "cập nhật" : "tạo"} mục tiêu.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý việc nhập số tiền (giữ nguyên)
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setTargetAmount(value);
  };

  if (!isOpen) return null;

  const modalTitle = mode === "add" ? "Tạo Mục Tiêu Mới" : "Chỉnh Sửa Mục Tiêu";
  const submitButtonText = mode === "add" ? "Tạo Mục Tiêu" : "Lưu Thay Đổi";
  const displayAmount = targetAmount
    ? parseInt(targetAmount, 10).toLocaleString("vi-VN")
    : "";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderIcon}>🎯</div>
          <h2 className={styles.modalTitle}>{modalTitle}</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Đóng modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.formGroup}>
            <label htmlFor="goal-name" className={styles.formLabel}>
              Tên mục tiêu <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="goal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.formInput}
              placeholder="VD: Mua điện thoại mới, Du lịch Nhật Bản..."
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="goal-amount" className={styles.formLabel}>
              Số tiền cần đạt <span className={styles.requiredStar}>*</span>
            </label>
            <div className={styles.amountInputWrapper}>
              <input
                id="goal-amount"
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                className={styles.amountInput}
                placeholder="0"
                required
                disabled={isLoading}
              />
              <span className={styles.currencySymbol}>₫</span>
            </div>
          </div>

          {/* 4. THAY THẾ INPUT ICON BẰNG BỘ CHỌN EMOJI */}
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label htmlFor="goal-deadline" className={styles.formLabel}>
                Ngày hết hạn (nếu có)
              </label>
              <input
                id="goal-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={styles.formInput}
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Biểu tượng</label>
              <div className={styles.iconPickerWrapper}>
                <button
                  type="button"
                  className={styles.iconSelector}
                  onClick={() => setShowPicker((val) => !val)}
                  disabled={isLoading}
                >
                  {icon}
                </button>
                {showPicker && (
                  <div className={styles.emojiPickerOverlay}>
                    <div className={styles.emojiPicker}>
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        height={350}
                        width={300}
                        lazyLoadEmojis={true}
                        searchDisabled={false}
                        previewConfig={{ showPreview: false }}
                        skinTonesDisabled={true}
                        categories={[
                          "suggested",
                          "smileys_people",
                          "animals_nature",
                          "food_drink",
                          "travel_places",
                          "activities",
                          "objects",
                          "symbols",
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* KẾT THÚC PHẦN THAY THẾ */}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.formButton} ${styles.cancelButton}`}
              disabled={isLoading}
            >
              Hủy <span className={styles.keyboardHint}>Esc</span>
            </button>
            <button
              type="submit"
              className={`${styles.formButton} ${styles.submitButton}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <>
                  {submitButtonText}{" "}
                  <span className={styles.keyboardHint}>Enter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
