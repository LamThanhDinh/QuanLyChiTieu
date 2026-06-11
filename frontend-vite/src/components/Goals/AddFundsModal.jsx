// src/components/Goals/AddFundsModal.jsx

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { addFundsToGoal } from "../../api/goalService";
import { getAccounts } from "../../api/accountsService";
import styles from "./AddFundsModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";

// Component CustomOption không thay đổi
const CustomOption = (props) => {
  const { data, innerProps, innerRef, isFocused } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={styles.customOption}
      style={{ backgroundColor: isFocused ? "#f3f4f6" : "transparent" }}
    >
      <span className={styles.optionName}>{data.label}</span>
      <span className={styles.optionBalance}>
        {data.balance.toLocaleString("vi-VN")} ₫
      </span>
    </div>
  );
};

export default function AddFundsModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  goalData,
}) {
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(null);
  const [validationError, setValidationError] = useState("");

  const { data: accountsData = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts({}),
    select: (data) => data || [],
    enabled: isOpen,
  });

  const addFundsMutation = useMutation({
    mutationFn: (variables) =>
      addFundsToGoal(variables.goalId, variables.payload),
    onSuccess: () => {
      onSubmitSuccess();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setValidationError("");
      if (accountsData.length > 0 && !accountId) {
        setAccountId(accountsData[0].id);
      }
    } else {
      setAccountId(null);
    }
  }, [isOpen, accountsData, accountId]);

  useEffect(() => {
    const insufficientFundsError =
      "Số tiền nạp lớn hơn số dư hiện có trong tài khoản.";
    if (!amount || !accountId || !accountsData) {
      setValidationError("");
      return;
    }
    const selectedAccount = accountsData.find((acc) => acc.id === accountId);
    if (selectedAccount && parseFloat(amount) > selectedAccount.balance) {
      setValidationError(insufficientFundsError);
    } else {
      setValidationError("");
    }
  }, [amount, accountId, accountsData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validationError || addFundsMutation.isPending) return;

    if (!amount || parseFloat(amount) <= 0 || !accountId) {
      setValidationError("Vui lòng nhập số tiền và chọn tài khoản.");
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      accountId: accountId,
      icon: "fa-piggy-bank",
    };
    addFundsMutation.mutate({ goalId: goalData._id, payload });
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };

  if (!isOpen) return null;

  const displayAmount = amount
    ? parseInt(amount, 10).toLocaleString("vi-VN")
    : "";
  const accountOptions = accountsData.map((acc) => ({
    value: acc.id,
    label: acc.name,
    balance: acc.balance,
  }));

  const displayError =
    addFundsMutation.error?.response?.data?.message || validationError;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderIcon}>🏦</div>
          <div className={styles.modalHeaderContent}>
            <h2 className={styles.modalTitle}>Nạp tiền cho mục tiêu</h2>
            <p className={styles.modalSubtitle}>"{goalData.name}"</p>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Đóng modal"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {displayError && (
            <p className={styles.errorMessage}>{displayError}</p>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="fund-amount" className={styles.formLabel}>
              Số tiền cần nạp <span className={styles.requiredStar}>*</span>
            </label>
            <div className={styles.amountInputWrapper}>
              <input
                id="fund-amount"
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                className={styles.amountInput}
                placeholder="0"
                required
                autoFocus
              />
              <span className={styles.currencySymbol}>₫</span>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="account-source" className={styles.formLabel}>
              Từ tài khoản <span className={styles.requiredStar}>*</span>
            </label>
            <Select
              id="account-source"
              options={accountOptions}
              value={accountOptions.find((opt) => opt.value === accountId)}
              onChange={(selectedOption) => setAccountId(selectedOption.value)}
              components={{ Option: CustomOption }}
              styles={{
                control: (base, state) => ({
                  ...base,
                  border: `2px solid ${state.isFocused ? "#667eea" : "#e5e7eb"}`,
                  borderRadius: "0.75rem",
                  padding: "0.375rem 0.5rem",
                  boxShadow: state.isFocused
                    ? "0 0 0 4px rgba(102, 126, 234, 0.1)"
                    : "none",
                  "&:hover": {
                    borderColor: state.isFocused ? "#667eea" : "#d1d5db",
                    transform: state.isFocused ? "none" : "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                }),
                singleValue: (base) => ({
                  ...base,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "500",
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  overflow: "hidden",
                }),
                menuList: (base) => ({
                  ...base,
                  padding: "0.5rem",
                }),
              }}
              // ✅ BƯỚC SỬA LỖI: PHỤC HỒI LẠI ĐẦY ĐỦ NỘI DUNG CHO `getOptionLabel`
              getOptionLabel={(option) => (
                <div className={styles.selectedOption}>
                  <span className={styles.optionName}>{option.label}</span>
                  <span className={styles.optionBalanceSmall}>
                    {option.balance.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              )}
              isLoading={isLoadingAccounts}
              isDisabled={addFundsMutation.isPending}
              placeholder={
                isLoadingAccounts
                  ? "Đang tải tài khoản..."
                  : "Chọn tài khoản..."
              }
              noOptionsMessage={() => "Không có tài khoản"}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.formButton} ${styles.cancelButton}`}
              disabled={addFundsMutation.isPending}
            >
              Hủy <span className={styles.keyboardHint}>Esc</span>
            </button>
            <button
              type="submit"
              className={`${styles.formButton} ${styles.submitButton}`}
              disabled={
                addFundsMutation.isPending ||
                !!validationError ||
                isLoadingAccounts
              }
            >
              {addFundsMutation.isPending ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <>
                  Xác nhận <span className={styles.keyboardHint}>Enter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
