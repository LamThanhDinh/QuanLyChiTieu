import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  faCalendarAlt,
  faChartLine,
  faCheck,
  faEdit,
  faMagic,
  faPiggyBank,
  faPlus,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Button from "../components/Common/Button";
import { getProfile } from "../api/profileService";
import { getCategories } from "../api/categoriesService";
import {
  applyBudgetSuggestions,
  deleteBudget,
  getBudgetSuggestions,
  getBudgets,
  saveBudget,
  updateBudget,
} from "../api/budgetService";
import { getGreeting } from "../utils/timeHelpers";
import { getIconObject } from "../utils/iconMap";
import styles from "../styles/BudgetsPage.module.css";

const getCurrentPeriod = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

const getNextPeriod = () => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    month: next.getMonth() + 1,
    year: next.getFullYear(),
  };
};

const formatCurrency = (amount) =>
  `${Math.round(amount || 0).toLocaleString("vi-VN")} đ`;

// Format số tiền để hiển thị trong input (có dấu chấm phân cách)
const formatInputAmount = (value) => {
  if (!value && value !== 0) return "";
  const num = String(value).replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("vi-VN");
};

// Parse số tiền từ input (bỏ dấu chấm)
const parseInputAmount = (value) => {
  return String(value).replace(/[^\d]/g, "");
};

const getStatusText = (status) => {
  if (status === "exceeded") return "Vượt ngân sách";
  if (status === "warning") return "Gần chạm ngưỡng";
  return "Ổn định";
};

const BudgetsPage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    threshold: 80,
  });

  const userName = userProfile?.fullname || "Bạn";
  const userAvatar = userProfile?.avatar || null;

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const [profileResponse, categoryResponse, budgetResponse] =
        await Promise.all([
          getProfile().catch(() => null),
          getCategories({ type: "CHITIEU" }),
          getBudgets(period),
        ]);

      setUserProfile(profileResponse?.data || null);
      setCategories(
        (categoryResponse || []).filter((category) => category.type === "CHITIEU")
      );
      const budgetList = budgetResponse?.budgets || [];
      if (budgetList.length > 0) {
        console.log("[DEBUG] First budget categoryId:", JSON.stringify(budgetList[0].categoryId));
      }
      setBudgets(budgetList);
    } catch (error) {
      console.error("Error loading budgets:", error);
      setMessage("Không thể tải dữ liệu ngân sách. Vui lòng thử lại.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const budgetStats = useMemo(() => {
    const totalBudget = budgets.reduce(
      (sum, budget) => sum + (budget.amount || 0),
      0
    );
    const totalSpent = budgets.reduce(
      (sum, budget) => sum + (budget.spentAmount || 0),
      0
    );
    const exceededCount = budgets.filter(
      (budget) => budget.status === "exceeded"
    ).length;
    const warningCount = budgets.filter(
      (budget) => budget.status === "warning"
    ).length;

    return {
      totalBudget,
      totalSpent,
      remaining: Math.max(totalBudget - totalSpent, 0),
      usedPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      exceededCount,
      warningCount,
    };
  }, [budgets]);

  const selectedCategoryIds = useMemo(
    () =>
      new Set(
        budgets
          .map((budget) => budget.categoryId?._id || budget.categoryId)
          .filter(Boolean)
      ),
    [budgets]
  );

  const availableCategories = categories.filter(
    (category) => !selectedCategoryIds.has(category._id)
  );

  const handlePeriodChange = (direction) => {
    const target = new Date(period.year, period.month - 1 + direction, 1);
    setPeriod({
      month: target.getMonth() + 1,
      year: target.getFullYear(),
    });
    setSuggestions([]);
  };

  const handleCreateBudget = async (event) => {
    event.preventDefault();
    if (!formData.categoryId || !formData.amount) return;

    setIsSaving(true);
    setMessage("");
    setMessageType("info");

    try {
      await saveBudget({
        ...formData,
        amount: Number(formData.amount),
        threshold: Number(formData.threshold),
        month: period.month,
        year: period.year,
      });
      setFormData({ categoryId: "", amount: "", threshold: 80 });
      await fetchBudgets();
      setMessage("Đã lưu ngân sách.");
      setMessageType("success");
    } catch (error) {
      console.error("Error saving budget:", error);
      setMessage(error.response?.data?.message || "Không thể lưu ngân sách.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const shouldDelete = window.confirm(
      "Bạn có chắc muốn xóa ngân sách này không?"
    );
    if (!shouldDelete) return;

    setIsSaving(true);
    setMessage("");
    setMessageType("info");

    try {
      await deleteBudget(budgetId);
      await fetchBudgets();
      setMessage("Đã xóa ngân sách.");
      setMessageType("success");
    } catch (error) {
      console.error("Error deleting budget:", error);
      setMessage("Không thể xóa ngân sách.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEditBudget = (budget) => {
    setEditingBudget({
      id: budget._id,
      categoryName: budget.categoryId?.name || "Danh mục",
      categoryIcon: budget.categoryId?.icon || null,
      amount: budget.amount || "",
      threshold: budget.threshold || 80,
    });
    setMessage("");
    setMessageType("info");
  };

  const handleCloseEditBudget = () => {
    setEditingBudget(null);
  };

  const handleUpdateBudget = async (event) => {
    event.preventDefault();
    if (!editingBudget?.id || !editingBudget.amount) return;

    setIsSaving(true);
    setMessage("");
    setMessageType("info");

    try {
      await updateBudget(editingBudget.id, {
        amount: Number(editingBudget.amount),
        threshold: Number(editingBudget.threshold),
      });
      setEditingBudget(null);
      await fetchBudgets();
      setMessage("Đã cập nhật ngân sách.");
      setMessageType("success");
    } catch (error) {
      console.error("Error updating budget:", error);
      setMessage(
        error.response?.data?.message || "Không thể cập nhật ngân sách."
      );
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestBudgets = async () => {
    const nextPeriod = getNextPeriod();
    setIsSuggesting(true);
    setMessage("");
    setMessageType("info");

    try {
      const response = await getBudgetSuggestions(nextPeriod);
      setPeriod({ month: response.month, year: response.year });
      setSuggestions(response.suggestions || []);
      setMessage(response.summary || "");
      setMessageType((response.suggestions || []).length > 0 ? "success" : "info");
    } catch (error) {
      console.error("Error getting budget suggestions:", error);
      setMessage("Không thể tạo đề xuất ngân sách.");
      setMessageType("error");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplySuggestions = async () => {
    if (suggestions.length === 0) return;

    setIsSaving(true);
    setMessage("");
    setMessageType("info");

    try {
      await applyBudgetSuggestions({
        month: period.month,
        year: period.year,
        suggestions,
      });
      setSuggestions([]);
      await fetchBudgets();
      setMessage("Đã áp dụng đề xuất ngân sách.");
      setMessageType("success");
    } catch (error) {
      console.error("Error applying budget suggestions:", error);
      setMessage("Không thể áp dụng đề xuất ngân sách.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Header userName={userName} userAvatar={userAvatar} />
      <Navbar />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <FontAwesomeIcon icon={faPiggyBank} /> Ngân sách thông minh
            </span>
            <h1>{getGreeting()}, {userName}!</h1>
            <p>
              Theo dõi ngân sách từng danh mục, cảnh báo khi gần vượt và
              đề xuất kế hoạch tháng tới từ lịch sử chi tiêu.
            </p>
          </div>
          <div className={styles.heroActions}>
            <button
              className={styles.periodButton}
              onClick={() => handlePeriodChange(-1)}
              type="button"
            >
              Tháng trước
            </button>
            <div className={styles.periodBadge}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>
                Tháng {period.month}/{period.year}
              </span>
            </div>
            <button
              className={styles.periodButton}
              onClick={() => handlePeriodChange(1)}
              type="button"
            >
              Tháng sau
            </button>
          </div>
        </section>

        <section className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span>Tổng ngân sách</span>
            <strong>{formatCurrency(budgetStats.totalBudget)}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Đã chi</span>
            <strong>{formatCurrency(budgetStats.totalSpent)}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Còn lại</span>
            <strong>{formatCurrency(budgetStats.remaining)}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Cảnh báo</span>
            <strong>
              {budgetStats.exceededCount + budgetStats.warningCount} danh mục
            </strong>
          </div>
        </section>

        <section className={styles.toolsGrid}>
          <form className={styles.budgetForm} onSubmit={handleCreateBudget}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Thêm ngân sách</h2>
                <p>Đặt giới hạn chi cho một danh mục trong tháng đang xem.</p>
              </div>
              <FontAwesomeIcon icon={faPlus} />
            </div>

            <label>
              Danh mục
              <select
                value={formData.categoryId}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">Chọn danh mục chi tiêu</option>
                {availableCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Số tiền ngân sách
              <input
                type="text"
                inputMode="numeric"
                min="1"
                value={formatInputAmount(formData.amount)}
                placeholder="VD: 3.000.000"
                onChange={(event) => {
                  const raw = parseInputAmount(event.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    amount: raw,
                  }));
                }}
              />
            </label>

            <label>
              Ngưỡng cảnh báo (%)
              <input
                type="number"
                min="1"
                max="100"
                value={formData.threshold}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    threshold: event.target.value,
                  }))
                }
              />
            </label>

            <Button
              type="submit"
              icon={<FontAwesomeIcon icon={faCheck} />}
              disabled={isSaving || !formData.categoryId || !formData.amount}
            >
              Lưu ngân sách
            </Button>
          </form>

          <div className={styles.aiPanel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Đề xuất ngân sách tháng tới</h2>
                <p>Dựa trên 3 tháng gần nhất và danh mục chi tiêu thực tế.</p>
              </div>
              <FontAwesomeIcon icon={faMagic} />
            </div>

            <button
              type="button"
              className={styles.aiButton}
              onClick={handleSuggestBudgets}
              disabled={isSuggesting}
            >
              {isSuggesting ? "Đang phân tích..." : "Tạo đề xuất ngân sách"}
            </button>

            {suggestions.length > 0 && (
              <div className={styles.suggestionsBox}>
                <div className={styles.suggestionsHeader}>
                  <strong>
                    Đề xuất cho tháng {period.month}/{period.year}
                  </strong>
                  <button
                    type="button"
                    onClick={handleApplySuggestions}
                    disabled={isSaving}
                  >
                    Áp dụng tất cả
                  </button>
                </div>
                <ul className={styles.suggestionList}>
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.categoryId}>
                      <div>
                        <strong>{suggestion.categoryName}</strong>
                        <span>{suggestion.reason}</span>
                      </div>
                      <b>{formatCurrency(suggestion.suggestedAmount)}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {message}
          </div>
        )}

        {editingBudget && (
          <div className={styles.editOverlay} role="dialog" aria-modal="true">
            <form className={styles.editDialog} onSubmit={handleUpdateBudget}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Sửa ngân sách</h2>
                  <p>{editingBudget.categoryName}</p>
                </div>
                <FontAwesomeIcon icon={getIconObject(editingBudget.categoryIcon)} />
              </div>

              <label>
                Số tiền ngân sách
                <input
                  type="text"
                  inputMode="numeric"
                  min="1"
                  value={formatInputAmount(editingBudget.amount)}
                  onChange={(event) => {
                    const raw = parseInputAmount(event.target.value);
                    setEditingBudget((prev) => ({
                      ...prev,
                      amount: raw,
                    }));
                  }}
                />
              </label>

              <label>
                Ngưỡng cảnh báo (%)
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editingBudget.threshold}
                  onChange={(event) =>
                    setEditingBudget((prev) => ({
                      ...prev,
                      threshold: event.target.value,
                    }))
                  }
                />
              </label>

              <div className={styles.editActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleCloseEditBudget}
                  disabled={isSaving}
                >
                  <FontAwesomeIcon icon={faTimes} style={{ marginRight: 6 }} />
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isSaving || !editingBudget.amount}
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        )}

        <section className={styles.budgetListSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Ngân sách theo danh mục</h2>
              <p>
                So sánh số tiền đã chi với ngân sách đã đặt trong tháng đang
                xem.
              </p>
            </div>
            <FontAwesomeIcon icon={faChartLine} />
          </div>

          {isLoading ? (
            <div className={styles.emptyState}>Đang tải ngân sách...</div>
          ) : budgets.length === 0 ? (
            <div className={styles.emptyState}>
              Chưa có ngân sách cho tháng này. Hãy thêm thủ công hoặc dùng AI
              đề xuất.
            </div>
          ) : (
            <div className={styles.budgetTable}>
              {budgets.map((budget) => (
                <article key={budget._id} className={styles.budgetRow}>
                  <div className={styles.categoryCell}>
                    <span className={styles.categoryIcon}>
                      <FontAwesomeIcon
                        icon={getIconObject(budget.categoryId?.icon)}
                      />
                    </span>
                    <div>
                      <strong>{budget.categoryId?.name || "Danh mục"}</strong>
                      <span>{getStatusText(budget.status)}</span>
                    </div>
                  </div>

                  <div className={styles.progressCell}>
                    <div className={styles.progressMeta}>
                      <span>
                        {formatCurrency(budget.spentAmount)} /{" "}
                        {formatCurrency(budget.amount)}
                      </span>
                      <b>{Math.round(budget.usedPercentage || 0)}%</b>
                    </div>
                    <div className={styles.progressTrack}>
                      <div
                        className={`${styles.progressFill} ${styles[budget.status] || ""
                          }`}
                        style={{
                          width: `${Math.min(
                            budget.usedPercentage || 0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.remainingCell}>
                    <span>Còn lại</span>
                    <strong>{formatCurrency(budget.remainingAmount)}</strong>
                  </div>

                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => handleOpenEditBudget(budget)}
                      disabled={isSaving}
                      title="Sửa ngân sách"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDeleteBudget(budget._id)}
                      disabled={isSaving}
                      title="Xóa ngân sách"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BudgetsPage;
