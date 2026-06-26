import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faCheck,
  faCirclePlay,
  faArrowDown,
  faArrowUp,
  faEdit,
  faHistory,
  faPause,
  faPlay,
  faPlus,
  faRedoAlt,
  faTrash,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Button from "../components/Common/Button";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import { getAccounts } from "../api/accountsService";
import { getCategories } from "../api/categoriesService";
import { getProfile } from "../api/profileService";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getGeneratedTransactions,
  getRecurringTransactions,
  processDueRecurringTransactions,
  runRecurringTransaction,
  updateRecurringTransaction,
} from "../api/recurringTransactionService";
import { getGreeting } from "../utils/timeHelpers";
import { getIconObject } from "../utils/iconMap";
import styles from "../styles/RecurringTransactionsPage.module.css";

const initialForm = {
  name: "",
  amount: "",
  type: "CHITIEU",
  accountId: "",
  categoryId: "",
  frequency: "monthly",
  nextRunDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  note: "",
  autoCreate: false,
  isActive: true,
};

const frequencyLabels = {
  daily: "Hằng ngày",
  weekly: "Hằng tuần",
  monthly: "Hằng tháng",
  yearly: "Hằng năm",
};

const formatCurrency = (amount) =>
  `${Math.round(amount || 0).toLocaleString("vi-VN")} đ`;

const formatDate = (date) => {
  if (!date) return "Chưa đặt";
  return new Date(date).toLocaleDateString("vi-VN");
};

const parseInputAmount = (value) => value.replace(/\D/g, "");

const formatInputAmount = (value) => {
  const raw = parseInputAmount(String(value || ""));
  return raw ? Number(raw).toLocaleString("vi-VN") : "";
};

const AMOUNT_SUGGESTIONS = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];

const isRecurringExpired = (item) => {
  if (!item) return false;
  if (item.isExpired || item.isEnded) return true;
  if (!item.endDate || !item.nextRunDate) return false;
  return new Date(item.nextRunDate) > new Date(item.endDate);
};

const ITEMS_PER_PAGE = 5;

const RecurringTransactionsPage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [historyPanel, setHistoryPanel] = useState(null);
  const [historyLoadingId, setHistoryLoadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const formRef = useRef(null);

  const userName = userProfile?.fullname || "Bạn";
  const userAvatar = userProfile?.avatar || null;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const [profileResponse, accountResponse, categoryResponse, recurringResponse] =
        await Promise.all([
          getProfile().catch(() => null),
          getAccounts({}),
          getCategories({ includeGoalCategories: "false" }),
          getRecurringTransactions({ status: statusFilter }),
        ]);

      setUserProfile(profileResponse?.data || null);
      setAccounts(accountResponse || []);
      setCategories(categoryResponse || []);
      setRecurringTransactions(recurringResponse?.data || []);
    } catch (error) {
      console.error("Error loading recurring transactions:", error);
      setMessage("Không thể tải dữ liệu khoản cố định.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (statusFilter !== "due") return undefined;

    const intervalId = window.setInterval(() => {
      loadData();
    }, 60000);

    const handleVisibilityChange = () => {
      if (!document.hidden) loadData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadData, statusFilter]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === formData.type),
    [categories, formData.type]
  );

  const stats = useMemo(() => {
    const active = recurringTransactions.filter((item) => item.isActive).length;
    const due = recurringTransactions.filter((item) => item.isDue).length;
    const monthlyFixedCost = recurringTransactions
      .filter((item) => item.isActive && item.type === "CHITIEU")
      .reduce((sum, item) => {
        if (item.frequency === "monthly") return sum + item.amount;
        if (item.frequency === "weekly") return sum + item.amount * 4;
        if (item.frequency === "daily") return sum + item.amount * 30;
        if (item.frequency === "yearly") return sum + item.amount / 12;
        return sum;
      }, 0);

    return {
      total: recurringTransactions.length,
      active,
      due,
      monthlyFixedCost,
    };
  }, [recurringTransactions]);

  const totalPages = Math.max(
    1,
    Math.ceil(recurringTransactions.length / ITEMS_PER_PAGE)
  );

  const paginatedRecurringTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return recurringTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, recurringTransactions]);

  useEffect(() => {
    setCurrentPage(1);
    setHistoryPanel(null);
  }, [statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isFormValid =
    Boolean(formData.name) &&
    Boolean(formData.amount) &&
    Boolean(formData.accountId) &&
    Boolean(formData.categoryId) &&
    Boolean(formData.nextRunDate);

  const requiredFieldsCompleted = [
    formData.name,
    formData.amount,
    formData.accountId,
    formData.categoryId,
    formData.frequency,
    formData.nextRunDate,
  ].filter(Boolean).length;

  useEffect(() => {
    if (!isFormModalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseFormModal();
      }

      if (
        event.key === "Enter" &&
        (event.ctrlKey || event.metaKey) &&
        isFormValid &&
        !isSaving
      ) {
        event.preventDefault();
        const form = document.querySelector(`.${styles.modalFormPanel}`);
        form?.requestSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFormModalOpen, isFormValid, isSaving]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "type" ? { categoryId: "" } : {}),
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleOpenAddRecurring = () => {
    resetForm();
    setMessage("");
    setMessageType("info");
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (isSaving) return;
    resetForm();
    setIsFormModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      endDate: formData.endDate || "",
    };

    try {
      if (editingId) {
        await updateRecurringTransaction(editingId, payload);
        setMessage("Đã cập nhật khoản cố định.");
      } else {
        await createRecurringTransaction(payload);
        setMessage("Đã tạo khoản cố định.");
      }

      setMessageType("success");
      resetForm();
      setIsFormModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
      setMessage(
        error.response?.data?.message || "Không thể lưu khoản cố định."
      );
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      amount: item.amount || "",
      type: item.type || "CHITIEU",
      accountId: item.accountId?._id || item.accountId || "",
      categoryId: item.categoryId?._id || item.categoryId || "",
      frequency: item.frequency || "monthly",
      nextRunDate: item.nextRunDate
        ? new Date(item.nextRunDate).toISOString().slice(0, 10)
        : initialForm.nextRunDate,
      endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : "",
      note: item.note || "",
      autoCreate: Boolean(item.autoCreate),
      isActive: Boolean(item.isActive),
    });
    setMessage("");
    setIsFormModalOpen(true);
  };

  const handleRequestDelete = (item) => {
    setDeleteTarget(item);
    setDeleteError("");
  };

  const handleCloseDeleteDialog = () => {
    if (isSaving) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setIsSaving(true);
    setMessage("");
    setDeleteError("");

    try {
      await deleteRecurringTransaction(deleteTarget._id);
      setMessage("Đã xóa khoản cố định.");
      setMessageType("success");
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
      setDeleteError("Không thể xóa khoản cố định.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    setIsSaving(true);
    setMessage("");

    try {
      await updateRecurringTransaction(item._id, {
        isActive: !item.isActive,
      });
      setMessage(item.isActive ? "Đã tạm dừng khoản cố định." : "Đã bật lại khoản cố định.");
      setMessageType("success");
      await loadData();
    } catch (error) {
      console.error("Error toggling recurring transaction:", error);
      setMessage("Không thể cập nhật trạng thái.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunNow = async (id) => {
    setIsSaving(true);
    setMessage("");

    try {
      await runRecurringTransaction(id);
      setMessage("Đã tạo giao dịch thật từ khoản cố định.");
      setMessageType("success");
      await loadData();
    } catch (error) {
      console.error("Error running recurring transaction:", error);
      setMessage(
        error.response?.data?.message || "Không thể tạo giao dịch từ mẫu."
      );
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProcessDue = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await processDueRecurringTransactions();
      setMessage(response.message || "Đã xử lý các khoản đến hạn.");
      setMessageType("success");
      await loadData();
    } catch (error) {
      console.error("Error processing due recurring transactions:", error);
      setMessage("Không thể xử lý các khoản đến hạn.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewHistory = async (item) => {
    setHistoryLoadingId(item._id);
    setMessage("");

    try {
      const response = await getGeneratedTransactions(item._id);
      setHistoryPanel({
        recurringName: item.name,
        generatedCount: item.generatedCount || 0,
        transactions: response.data || [],
      });
    } catch (error) {
      console.error("Error loading generated transactions:", error);
      setMessage("Không thể tải lịch sử giao dịch đã sinh.");
      setMessageType("error");
    } finally {
      setHistoryLoadingId(null);
    }
  };

  return (
    <div>
      <Header userName={userName} userAvatar={userAvatar} />
      <Navbar />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>
              <FontAwesomeIcon icon={faRedoAlt} /> Khoản cố định
            </span>
            <h1>{getGreeting()}, {userName}!</h1>
            <p>
              Quản lý các khoản thu chi lặp lại như tiền nhà, lương, hóa đơn
              và gói dịch vụ để không phải nhập thủ công mỗi tháng.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Button
              type="button"
              icon={<FontAwesomeIcon icon={faPlus} />}
              variant="primary"
              onClick={handleOpenAddRecurring}
              className={styles.addButton}
            >
              Thêm khoản cố định
            </Button>
            <button
              type="button"
              className={styles.processButton}
              onClick={handleProcessDue}
              disabled={isSaving}
            >
              <FontAwesomeIcon icon={faBolt} />
              Xử lý khoản đến hạn
            </button>
          </div>
        </section>

        <section className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span>Tổng mẫu</span>
            <strong>{stats.total}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Đang hoạt động</span>
            <strong>{stats.active}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Đến hạn</span>
            <strong>{stats.due}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Chi cố định ước tính/tháng</span>
            <strong>{formatCurrency(stats.monthlyFixedCost)}</strong>
          </div>
        </section>

        <section className={styles.contentGrid}>
          <form ref={formRef} className={styles.formPanel} onSubmit={handleSubmit}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>{editingId ? "Sửa khoản cố định" : "Tạo khoản cố định"}</h2>
                <p>Mẫu này sẽ dùng để tạo giao dịch thật khi đến ngày.</p>
              </div>
              <FontAwesomeIcon icon={editingId ? faEdit : faRedoAlt} />
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={handleCloseFormModal}
                disabled={isSaving}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <label>
              Tên giao dịch
              <input
                value={formData.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                placeholder="VD: Tiền nhà"
              />
            </label>

            <div className={styles.inlineFields}>
              <label>
                Loại
                <select
                  value={formData.type}
                  onChange={(event) => handleInputChange("type", event.target.value)}
                >
                  <option value="CHITIEU">Chi tiêu</option>
                  <option value="THUNHAP">Thu nhập</option>
                </select>
              </label>

              <label>
                Số tiền
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatInputAmount(formData.amount)}
                  onChange={(event) =>
                    handleInputChange("amount", parseInputAmount(event.target.value))
                  }
                  placeholder="VD: 2.500.000"
                />
              </label>
            </div>

            <label>
              Tài khoản
              <select
                value={formData.accountId}
                onChange={(event) => handleInputChange("accountId", event.target.value)}
              >
                <option value="">Chọn tài khoản</option>
                {accounts.map((account) => (
                  <option key={account._id || account.id} value={account._id || account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Danh mục
              <select
                value={formData.categoryId}
                onChange={(event) => handleInputChange("categoryId", event.target.value)}
              >
                <option value="">Chọn danh mục</option>
                {filteredCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.inlineFields}>
              <label>
                Chu kỳ
                <select
                  value={formData.frequency}
                  onChange={(event) =>
                    handleInputChange("frequency", event.target.value)
                  }
                >
                  <option value="daily">Hằng ngày</option>
                  <option value="weekly">Hằng tuần</option>
                  <option value="monthly">Hằng tháng</option>
                  <option value="yearly">Hằng năm</option>
                </select>
              </label>

              <label>
                Ngày chạy tiếp theo
                <input
                  type="date"
                  value={formData.nextRunDate}
                  onChange={(event) =>
                    handleInputChange("nextRunDate", event.target.value)
                  }
                />
              </label>
            </div>

            <label>
              Ngày kết thúc
              <input
                type="date"
                value={formData.endDate}
                onChange={(event) => handleInputChange("endDate", event.target.value)}
              />
            </label>

            <label>
              Ghi chú
              <textarea
                value={formData.note}
                onChange={(event) => handleInputChange("note", event.target.value)}
                placeholder="VD: Thanh toán đầu tháng"
              />
            </label>

            <div className={styles.checkboxRow}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.autoCreate}
                  onChange={(event) =>
                    handleInputChange("autoCreate", event.target.checked)
                  }
                />
                Tự động tạo khi xử lý khoản đến hạn
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    handleInputChange("isActive", event.target.checked)
                  }
                />
                Đang hoạt động
              </label>
            </div>

            <div className={styles.formActions}>
              {editingId && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  Hủy sửa
                </button>
              )}
              <Button
                type="submit"
                icon={<FontAwesomeIcon icon={faCheck} />}
                disabled={
                  isSaving || !isFormValid
                }
              >
                {editingId ? "Lưu thay đổi" : "Tạo khoản cố định"}
              </Button>
            </div>
          </form>

          <section className={styles.listPanel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Danh sách khoản cố định</h2>
                <p>Theo dõi các mẫu thu chi lặp lại và tạo giao dịch khi cần.</p>
              </div>
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>

            <div className={styles.filterGroup}>
              {[
                ["all", "Tất cả"],
                ["active", "Hoạt động"],
                ["due", "Đến hạn"],
                ["paused", "Tạm dừng"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={statusFilter === value ? styles.activeFilter : ""}
                  onClick={() => setStatusFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {message && (
              <div className={`${styles.message} ${styles[messageType]}`}>
                {message}
              </div>
            )}

            {isLoading ? (
              <div className={styles.emptyState}>Đang tải dữ liệu...</div>
            ) : recurringTransactions.length === 0 ? (
              <div className={styles.emptyState}>
                Chưa có khoản cố định nào. Hãy tạo mẫu đầu tiên.
              </div>
            ) : (
              <div className={styles.recurringList}>
                {paginatedRecurringTransactions.map((item) => {
                  const expired = isRecurringExpired(item);

                  return (
                  <article
                    key={item._id}
                    className={`${styles.recurringCard} ${
                      item.isDue ? styles.due : ""
                    } ${!item.isActive || expired ? styles.paused : ""}`}
                  >
                    <div className={styles.cardMain}>
                      <span className={styles.categoryIcon}>
                        <FontAwesomeIcon
                          icon={getIconObject(item.categoryId?.icon)}
                        />
                      </span>
                      <div>
                        <h3>{item.name}</h3>
                        <p>
                          {item.categoryId?.name || "Danh mục"} ·{" "}
                          {item.accountId?.name || "Tài khoản"} ·{" "}
                          {frequencyLabels[item.frequency]}
                        </p>
                      </div>
                    </div>

                    <div className={styles.cardMoney}>
                      <strong
                        className={
                          item.type === "THUNHAP" ? styles.income : styles.expense
                        }
                      >
                        {formatCurrency(item.amount)}
                      </strong>
                      <span>
                        Tiếp theo: {formatDate(item.nextRunDate)}
                      </span>
                    </div>

                    <div className={styles.badgeRow}>
                      {item.isDue && <span className={styles.dueBadge}>Đến hạn</span>}
                      {item.autoCreate && (
                        <span className={styles.autoBadge}>Tự động</span>
                      )}
                      {expired && (
                        <span className={styles.expiredBadge}>Hết hạn</span>
                      )}
                      {!item.isActive && !expired && (
                        <span className={styles.pausedBadge}>Tạm dừng</span>
                      )}
                      <span className={styles.countBadge}>
                        Đã tạo {item.generatedCount || 0} lần
                      </span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        onClick={() => handleViewHistory(item)}
                        disabled={historyLoadingId === item._id}
                        title="Xem lịch sử đã tạo"
                      >
                        <FontAwesomeIcon icon={faHistory} />
                      </button>
                      {!expired && (
                        <button
                          type="button"
                          onClick={() => handleRunNow(item._id)}
                          disabled={isSaving || !item.isActive}
                          title="Tạo giao dịch ngay"
                        >
                          <FontAwesomeIcon icon={faCirclePlay} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        disabled={isSaving}
                        title="Sửa"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {!expired && (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          disabled={isSaving}
                          title={item.isActive ? "Tạm dừng" : "Bật lại"}
                        >
                          <FontAwesomeIcon icon={item.isActive ? faPause : faPlay} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRequestDelete(item)}
                        disabled={isSaving}
                        title="Xóa"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </article>
                  );
                })}
              </div>
            )}

            {!isLoading && recurringTransactions.length > ITEMS_PER_PAGE && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            )}

            {historyPanel && (
              <div className={styles.historyPanel}>
                <div className={styles.historyHeader}>
                  <div>
                    <h3>Lịch sử đã tạo</h3>
                    <p>
                      {historyPanel.recurringName} · đã tạo{" "}
                      {historyPanel.generatedCount} lần
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setHistoryPanel(null)}
                  >
                    Đóng
                  </button>
                </div>

                {historyPanel.transactions.length === 0 ? (
                  <div className={styles.emptyState}>
                    Mẫu này chưa sinh giao dịch nào.
                  </div>
                ) : (
                  <div className={styles.historyList}>
                    {historyPanel.transactions.map((transaction) => (
                      <div key={transaction.id} className={styles.historyItem}>
                        <div>
                          <strong>{transaction.description}</strong>
                          <span>
                            {formatDate(transaction.date)} ·{" "}
                            {transaction.category?.name || "Danh mục"} ·{" "}
                            {transaction.paymentMethod?.name || "Tài khoản"}
                          </span>
                        </div>
                        <strong
                          className={
                            transaction.type === "THUNHAP"
                              ? styles.income
                              : styles.expense
                          }
                        >
                          {formatCurrency(transaction.amount)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </section>
      </main>

      {isFormModalOpen && (
        <div className={styles.formOverlay} role="dialog" aria-modal="true">
          <form className={styles.modalFormPanel} onSubmit={handleSubmit}>
              <div className={styles.sectionHeader}>
              <div>
                <h2>{editingId ? "Sửa khoản cố định" : "Tạo khoản cố định"}</h2>
                <p>Mẫu này sẽ dùng để tạo giao dịch thật khi đến ngày.</p>
              </div>
              <FontAwesomeIcon icon={editingId ? faEdit : faRedoAlt} />
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={handleCloseFormModal}
                disabled={isSaving}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className={styles.modalFormBody}>

            {/* Thanh tiến trình hoàn thành form */}
            <div className={styles.modalProgress}>
              <div className={styles.modalProgressBar}>
                <div
                  className={styles.modalProgressFill}
                  style={{ width: `${Math.min(100, (requiredFieldsCompleted / 6) * 100)}%` }}
                />
              </div>
              <span className={styles.modalProgressText}>
                {isFormValid ? (
                  <>
                    <FontAwesomeIcon icon={faCheck} style={{ color: "#059669", marginRight: 4 }} />
                    Sẵn sàng để lưu
                  </>
                ) : (
                  `Hoàn thành ${requiredFieldsCompleted}/6 trường`
                )}
              </span>
            </div>
            <div className={styles.modalTypeGroup}>
              <span className={styles.modalTypeLabel}>Loại giao dịch</span>
              <div className={styles.modalRadioGroup}>
                <label>
                  <input
                    className={styles.modalRadioInput}
                    type="radio"
                    value="CHITIEU"
                    checked={formData.type === "CHITIEU"}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                  />
                  <span className={`${styles.modalRadioLabel} ${styles.modalExpense} ${formData.type === "CHITIEU" ? styles.modalExpenseActive : ""}`}>
                    <FontAwesomeIcon icon={faArrowDown} />
                    Chi tiêu
                  </span>
                </label>
                <label>
                  <input
                    className={styles.modalRadioInput}
                    type="radio"
                    value="THUNHAP"
                    checked={formData.type === "THUNHAP"}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                  />
                  <span className={`${styles.modalRadioLabel} ${styles.modalIncome} ${formData.type === "THUNHAP" ? styles.modalIncomeActive : ""}`}>
                    <FontAwesomeIcon icon={faArrowUp} />
                    Thu nhập
                  </span>
                </label>
              </div>
            </div>

            <label>
              Tên giao dịch
              <input
                value={formData.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                placeholder="VD: Tiền nhà"
              />
            </label>

            {/* Số tiền - giống AddEditTransactionModal */}
            <div className={styles.modalAmountGroup}>
              <span className={styles.modalTypeLabel}>Số tiền <span className={styles.modalRequiredStar}>*</span></span>
              <div className={styles.modalAmountWrapper}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.modalAmountInput}
                  value={formatInputAmount(formData.amount)}
                  onChange={(event) =>
                    handleInputChange("amount", parseInputAmount(event.target.value))
                  }
                  placeholder="0"
                />
                <span className={styles.modalCurrencySymbol}>đ</span>
              </div>
              {!formData.amount && (
                <div className={styles.modalAmountSuggestions}>
                  {AMOUNT_SUGGESTIONS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={styles.modalAmountChip}
                      onClick={() => handleInputChange("amount", String(val))}
                    >
                      {val.toLocaleString("vi-VN")}đ
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label>
              Tài khoản
              <select
                value={formData.accountId}
                onChange={(event) => handleInputChange("accountId", event.target.value)}
              >
                <option value="">Chọn tài khoản</option>
                {accounts.map((account) => (
                  <option key={account._id || account.id} value={account._id || account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Danh mục
              <select
                value={formData.categoryId}
                onChange={(event) => handleInputChange("categoryId", event.target.value)}
              >
                <option value="">Chọn danh mục</option>
                {filteredCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.inlineFields}>
              <label>
                Chu kỳ
                <select
                  value={formData.frequency}
                  onChange={(event) => handleInputChange("frequency", event.target.value)}
                >
                  <option value="daily">Hằng ngày</option>
                  <option value="weekly">Hằng tuần</option>
                  <option value="monthly">Hằng tháng</option>
                  <option value="yearly">Hằng năm</option>
                </select>
              </label>

              <label>
                Ngày chạy tiếp theo
                <input
                  type="date"
                  value={formData.nextRunDate}
                  onChange={(event) =>
                    handleInputChange("nextRunDate", event.target.value)
                  }
                />
              </label>
            </div>

            <label>
              Ngày kết thúc
              <input
                type="date"
                value={formData.endDate}
                onChange={(event) => handleInputChange("endDate", event.target.value)}
              />
            </label>

            <label>
              Ghi chú
              <textarea
                value={formData.note}
                onChange={(event) => handleInputChange("note", event.target.value)}
                placeholder="VD: Thanh toán đầu tháng"
              />
            </label>

            <div className={styles.checkboxRow}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.autoCreate}
                  onChange={(event) =>
                    handleInputChange("autoCreate", event.target.checked)
                  }
                />
                Tự động tạo khi xử lý khoản đến hạn
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    handleInputChange("isActive", event.target.checked)
                  }
                />
                Đang hoạt động
              </label>
            </div>

            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleCloseFormModal}
                disabled={isSaving}
              >
                Hủy
              </button>
              <Button
                type="submit"
                icon={<FontAwesomeIcon icon={faCheck} />}
                disabled={
                  isSaving || !isFormValid
                }
              >
                {editingId ? "Lưu thay đổi" : "Tạo khoản cố định"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xóa khoản cố định"
        message={`Bạn có chắc muốn xóa mẫu "${
          deleteTarget?.name || "khoản cố định"
        }" không?`}
        confirmText="Xóa"
        isProcessing={isSaving}
        errorMessage={deleteError}
      />

      <Footer />
    </div>
  );
};

export default RecurringTransactionsPage;
