import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faCalendarAlt,
  faCheck,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faCrown,
  faEdit,
  faEnvelope,
  faExclamationTriangle,
  faHome,
  faPencilAlt,
  faPlus,
  faReceipt,
  faSignOutAlt,
  faSpinner,
  faTimes,
  faTrash,
  faUserCircle,
  faUsers,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Button from "../components/Common/Button";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import { getProfile } from "../api/profileService";
import { getAccounts } from "../api/accountsService";
import { getCategories } from "../api/categoriesService";
import {
  createFamily,
  createFamilyTransaction,
  deleteFamily,
  deleteFamilyMember,
  deleteFamilyTransaction,
  getFamilies,
  getFamilyCategoryStats,
  getFamilyDetail,
  getFamilyTransactions,
  inviteFamilyMember,
  leaveFamily,
  transferFamilyOwnership,
  updateFamilyMemberNickname,
  updateFamilyTransaction,
} from "../api/familyService";
import { getFullDate, getGreeting } from "../utils/timeHelpers";
import styles from "../styles/FamilyPage.module.css";
import txStyles from "../components/Transactions/AddEditTransactionModal.module.css";
import CategoryAnalysisChart from "../components/Categories/CategoryAnalysisChart";

// ─── helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  `${Math.round(amount || 0).toLocaleString("vi-VN")} đ`;

const formatDateForInput = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const AMOUNT_PRESETS = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];

const REQUIRED_FIELDS = ["name", "amount", "categoryId", "accountId", "date"];

const emptyTxForm = () => ({
  name: "",
  amount: "",
  type: "CHITIEU",
  accountId: "",
  categoryId: "",
  date: formatDateForInput(new Date()),
  note: "",
});

const initialFamilyForm = { name: "", description: "" };

// ─── FamilyTransactionModal ────────────────────────────────────────────────────
const FamilyTransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "add",
  accounts = [],
  categories = [],
  isSaving = false,
}) => {
  const firstInputRef = useRef(null);
  const amountInputRef = useRef(null);

  const [form, setForm] = useState(emptyTxForm());
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === form.type),
    [categories, form.type]
  );

  // validate
  const validateField = useCallback((name, value) => {
    if (name === "amount") {
      if (!value || value === "0") return "Số tiền không được để trống";
      if (parseFloat(value) <= 0) return "Số tiền phải lớn hơn 0";
      return null;
    }
    if (name === "name") {
      if (!String(value || "").trim()) return "Tên giao dịch không được để trống";
      return null;
    }
    if (name === "categoryId") return value ? null : "Vui lòng chọn danh mục";
    if (name === "accountId") return value ? null : "Vui lòng chọn tài khoản";
    if (name === "date") return value ? null : "Vui lòng chọn ngày";
    return null;
  }, []);

  const validateAll = useCallback((f) => {
    const errors = {};
    REQUIRED_FIELDS.forEach((field) => {
      errors[field] = validateField(field, f[field]);
    });
    setFieldErrors(errors);
    const valid = Object.values(errors).every((e) => e === null);
    setIsValid(valid);
    return valid;
  }, [validateField]);

  // populate form when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setTouched({});

    if (mode === "edit" && initialData) {
      const f = {
        name: initialData.name || initialData.description || "",
        amount: String(initialData.amount || ""),
        type: initialData.type || "CHITIEU",
        accountId:
          initialData.paymentMethod?._id ||
          initialData.paymentMethod?.id ||
          initialData.accountId ||
          "",
        categoryId:
          initialData.category?._id ||
          initialData.category?.id ||
          initialData.categoryId ||
          "",
        date: formatDateForInput(initialData.date || new Date()),
        note: initialData.note || "",
      };
      setForm(f);
      validateAll(f);
    } else {
      const f = emptyTxForm();
      setForm(f);
      validateAll(f);
    }

    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [isOpen, mode, initialData]); // eslint-disable-line

  // auto-set first category when type changes
  useEffect(() => {
    setForm((prev) => {
      const cats = categories.filter((c) => c.type === prev.type);
      const newCatId =
        mode === "add" ? cats[0]?._id || "" : prev.categoryId;
      const updated = { ...prev, categoryId: newCatId };
      validateAll(updated);
      return updated;
    });
  }, [form.type, categories, mode]); // eslint-disable-line

  // keyboard
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && isValid && !isSaving) {
        e.preventDefault();
        document.getElementById("familyTxForm")?.requestSubmit();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isValid, isSaving, onClose]);

  const set = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      validateAll(updated);
      return updated;
    });
  };

  const handleBlur = (field) => setTouched((p) => ({ ...p, [field]: true }));

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    set("amount", raw);
    setTouched((p) => ({ ...p, amount: true }));
  };

  const handleTypeChange = (newType) => {
    setForm((prev) => {
      const cats = categories.filter((c) => c.type === newType);
      const updated = {
        ...prev,
        type: newType,
        categoryId: cats[0]?._id || "",
      };
      validateAll(updated);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {};
    REQUIRED_FIELDS.forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);
    if (!validateAll(form)) {
      setError("Vui lòng kiểm tra lại các trường đã nhập.");
      return;
    }
    setError("");
    try {
      await onSubmit({
        name: form.name.trim(),
        amount: Number(form.amount),
        type: form.type,
        categoryId: form.categoryId,
        accountId: form.accountId,
        date: form.date,
        note: form.note.trim(),
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (mode === "edit" ? "Không thể sửa giao dịch." : "Không thể thêm giao dịch.");
      setError(msg);
    }
  };

  if (!isOpen) return null;

  const displayAmount = form.amount
    ? parseInt(form.amount, 10).toLocaleString("vi-VN")
    : "";

  const touchedCount = REQUIRED_FIELDS.filter((f) => touched[f]).length;
  const progressPct = Math.min(100, (touchedCount / REQUIRED_FIELDS.length) * 100);

  const fieldErr = (name) =>
    touched[name] && fieldErrors[name] ? (
      <span className={txStyles.errorText}>
        <FontAwesomeIcon icon={faExclamationTriangle} className={txStyles.errorIcon} />
        {fieldErrors[name]}
      </span>
    ) : null;

  const fieldCls = (name) =>
    touched[name] && fieldErrors[name] ? txStyles.fieldError : "";

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Sửa Giao Dịch Chung" : "Thêm Giao Dịch Chung";

  return (
    <div className={txStyles.modalOverlay} onClick={onClose}>
      <div className={txStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className={txStyles.modalHeader}>
          <h2 className={txStyles.modalTitle}>
            <FontAwesomeIcon
              icon={isEditMode ? faEdit : faReceipt}
              className={txStyles.titleIcon}
            />
            {title}
          </h2>
          <button onClick={onClose} className={txStyles.closeButton} type="button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form id="familyTxForm" onSubmit={handleSubmit} className={txStyles.transactionForm}>
          {/* error banner */}
          {error && (
            <div className={txStyles.errorMessage}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {error}
            </div>
          )}

          {/* progress */}
          <div className={txStyles.formProgress}>
            <div className={txStyles.progressBar}>
              <div className={txStyles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
            <span className={txStyles.progressText}>
              {isValid ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className={txStyles.successIcon} />
                  Sẵn sàng để lưu
                </>
              ) : (
                `Hoàn thành ${touchedCount}/${REQUIRED_FIELDS.length} trường`
              )}
            </span>
          </div>

          {/* type toggle */}
          <div className={txStyles.formGroup}>
            <label className={txStyles.formLabel}>Loại giao dịch</label>
            <div className={txStyles.radioGroup}>
              <label>
                <input
                  className={txStyles.radioInput}
                  type="radio"
                  value="CHITIEU"
                  checked={form.type === "CHITIEU"}
                  onChange={() => handleTypeChange("CHITIEU")}
                />
                <span className={`${txStyles.radioLabelText} ${txStyles.expense}`}>
                  <FontAwesomeIcon icon={faArrowDown} className={txStyles.radioIcon} />
                  Chi tiêu
                </span>
              </label>
              <label>
                <input
                  className={txStyles.radioInput}
                  type="radio"
                  value="THUNHAP"
                  checked={form.type === "THUNHAP"}
                  onChange={() => handleTypeChange("THUNHAP")}
                />
                <span className={`${txStyles.radioLabelText} ${txStyles.income}`}>
                  <FontAwesomeIcon icon={faArrowUp} className={txStyles.radioIcon} />
                  Thu nhập
                </span>
              </label>
            </div>
          </div>

          {/* name */}
          <div className={txStyles.formGroup}>
            <label htmlFor="fTxName" className={txStyles.formLabel}>
              Tên/Mô tả giao dịch <span className={txStyles.requiredStar}>*</span>
            </label>
            <input
              ref={firstInputRef}
              id="fTxName"
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className={`${txStyles.formInput} ${fieldCls("name")}`}
              placeholder="Ví dụ: Đi siêu thị cuối tuần…"
              maxLength={100}
            />
            {fieldErr("name")}
          </div>

          {/* amount */}
          <div className={txStyles.formGroup}>
            <label htmlFor="fTxAmount" className={txStyles.formLabel}>
              Số tiền <span className={txStyles.requiredStar}>*</span>
            </label>
            <div className={txStyles.amountInputWrapper}>
              <input
                ref={amountInputRef}
                id="fTxAmount"
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                onBlur={() => handleBlur("amount")}
                className={`${txStyles.amountInput} ${fieldCls("amount")}`}
                placeholder="0"
              />
              <span className={txStyles.currencySymbol}>₫</span>
            </div>
            {fieldErr("amount")}
            {!form.amount && (
              <div className={txStyles.amountSuggestions}>
                {AMOUNT_PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={txStyles.amountSuggestion}
                    onClick={() => {
                      set("amount", String(v));
                      setTouched((p) => ({ ...p, amount: true }));
                    }}
                  >
                    {v.toLocaleString("vi-VN")}₫
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* category + account */}
          <div className={txStyles.formGrid}>
            <div className={txStyles.formGroup}>
              <label htmlFor="fTxCategory" className={txStyles.formLabel}>
                Danh mục <span className={txStyles.requiredStar}>*</span>
              </label>
              <select
                id="fTxCategory"
                value={form.categoryId}
                onChange={(e) => { set("categoryId", e.target.value); handleBlur("categoryId"); }}
                onBlur={() => handleBlur("categoryId")}
                className={`${txStyles.formInput} ${fieldCls("categoryId")}`}
              >
                <option value="">-- Chọn danh mục --</option>
                {filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {fieldErr("categoryId")}
            </div>

            <div className={txStyles.formGroup}>
              <label htmlFor="fTxAccount" className={txStyles.formLabel}>
                Tài khoản <span className={txStyles.requiredStar}>*</span>
              </label>
              <select
                id="fTxAccount"
                value={form.accountId}
                onChange={(e) => { set("accountId", e.target.value); handleBlur("accountId"); }}
                onBlur={() => handleBlur("accountId")}
                className={`${txStyles.formInput} ${fieldCls("accountId")}`}
              >
                <option value="">-- Chọn tài khoản --</option>
                {accounts.map((acc) => {
                  const id = acc._id || acc.id;
                  return <option key={id} value={id}>{acc.name}</option>;
                })}
              </select>
              {fieldErr("accountId")}
            </div>
          </div>

          {/* date + note */}
          <div className={txStyles.formGrid}>
            <div className={txStyles.formGroup}>
              <label htmlFor="fTxDate" className={txStyles.formLabel}>
                Ngày <span className={txStyles.requiredStar}>*</span>
              </label>
              <input
                id="fTxDate"
                type="date"
                value={form.date}
                onChange={(e) => { set("date", e.target.value); handleBlur("date"); }}
                onBlur={() => handleBlur("date")}
                className={`${txStyles.formInput} ${fieldCls("date")}`}
                max={formatDateForInput(new Date(Date.now() + 30 * 86400000))}
              />
              {fieldErr("date")}
            </div>

            <div className={txStyles.formGroup}>
              <label htmlFor="fTxNote" className={txStyles.formLabel}>Ghi chú</label>
              <input
                id="fTxNote"
                type="text"
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                className={txStyles.formInput}
                placeholder="Thêm ghi chú nếu cần…"
              />
            </div>
          </div>

          {/* actions */}
          <div className={txStyles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={`${txStyles.formButton} ${txStyles.cancelButton}`}
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`${txStyles.formButton} ${txStyles.submitButton} ${isValid ? txStyles.submitButtonActive : ""}`}
              disabled={isSaving || !isValid}
              title={!isValid ? "Vui lòng kiểm tra lại các trường" : "Nhấn Ctrl+Enter để lưu nhanh"}
            >
              {isSaving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Đang lưu…</span>
                </>
              ) : (
                <>
                  {isValid && <FontAwesomeIcon icon={faCheckCircle} />}
                  <span>{isEditMode ? "Lưu thay đổi" : "Thêm giao dịch"}</span>
                </>
              )}
            </button>
          </div>

          <div className={txStyles.keyboardHints}>
            <span>
              💡 Mẹo: Nhấn <kbd>Ctrl</kbd> + <kbd>Enter</kbd> để lưu nhanh
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── FamilyPage ────────────────────────────────────────────────────────────────
const FamilyPage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [families, setFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [familyDetail, setFamilyDetail] = useState(null);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, totalTransactions: 0 });
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [familyForm, setFamilyForm] = useState(initialFamilyForm);
  const [inviteEmail, setInviteEmail] = useState("");

  // modal states
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null); // null = add, object = edit
  const [transferToMemberId, setTransferToMemberId] = useState("");

  // confirm dialog states
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberNicknameEdit, setMemberNicknameEdit] = useState(null);
  const [nicknameValue, setNicknameValue] = useState("");
  const [txToDelete, setTxToDelete] = useState(null);
  const [showDeleteFamily, setShowDeleteFamily] = useState(false);
  const [showLeaveFamily, setShowLeaveFamily] = useState(false);

  // pagination
  const [txPage, setTxPage] = useState(1);
  const [txPagination, setTxPagination] = useState(null); // { total, page, limit, totalPages }

  // chart state
  const [categoriesData, setCategoriesData] = useState([]);
  const [chartType, setChartType] = useState("ALL"); // ALL | CHITIEU | THUNHAP
  const [chartPeriod, setChartPeriod] = useState("month");
  const [chartDate, setChartDate] = useState(new Date());
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // chart derived data
  const { chartData, chartTotal } = useMemo(() => {
    const filtered =
      chartType === "ALL"
        ? categoriesData
        : categoriesData.filter((c) => c.type === chartType);
    const COLORS = [
      "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
      "#AF19FF", "#FF4560", "#3366CC", "#DC3912",
      "#FF9900", "#109618", "#990099", "#0099C6",
    ];
    const data = filtered
      .filter((c) => c.totalAmount > 0)
      .map((c, i) => ({
        id: c._id || c.id,
        name: c.name,
        value: c.totalAmount,
        type: c.type,
        icon: c.icon,
        color: COLORS[i % COLORS.length],
      }));
    const total = data.reduce((s, d) => s + d.value, 0);
    return { chartData: data, chartTotal: total };
  }, [categoriesData, chartType]);

  const userName = userProfile?.fullname || "Bạn";
  const userAvatar = userProfile?.avatar || null;

  const selectedFamily = useMemo(
    () => families.find((f) => f._id === selectedFamilyId),
    [families, selectedFamilyId]
  );

  const currentUserId = userProfile?._id || userProfile?.id || userProfile?.userId;
  const selectedOwnerId =
    familyDetail?.ownerId?._id || selectedFamily?.ownerId?._id || selectedFamily?.ownerId;
  const isCurrentUserOwner =
    selectedFamilyId && String(currentUserId || "") === String(selectedOwnerId || "");

  // ── loaders ──────────────────────────────────────────────────────────────────
  const loadBaseData = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const [profileRes, familyRes, accountRes, categoryRes] = await Promise.all([
        getProfile().catch(() => null),
        getFamilies(),
        getAccounts({}),
        getCategories({ includeGoalCategories: "false" }),
      ]);
      const familyList = familyRes?.data || [];
      setUserProfile(profileRes?.data || null);
      setFamilies(familyList);
      setAccounts(accountRes || []);
      setCategories(categoryRes || []);
      setSelectedFamilyId((cur) => cur || familyList[0]?._id || "");
    } catch {
      setMessage("Không thể tải dữ liệu gia đình.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFamilyData = useCallback(async (page = 1) => {
    if (!selectedFamilyId) {
      setFamilyDetail(null);
      setTransactions([]);
      setTxPagination(null);
      return;
    }
    try {
      const [detailRes, txRes] = await Promise.all([
        getFamilyDetail(selectedFamilyId),
        getFamilyTransactions(selectedFamilyId, { page, limit: 20 }),
      ]);
      setFamilyDetail(detailRes.family);
      setStats(txRes.stats || detailRes.stats || {});
      setTransactions(txRes.data || []);
      setTxPagination(txRes.pagination || null);
      setTxPage(page);
    } catch {
      setMessage("Không thể tải chi tiết gia đình.");
      setMessageType("error");
    }
  }, [selectedFamilyId]);

  // ── chart loader ─────────────────────────────────────────────────────────────
  const buildChartParams = useCallback(() => {
    const params = { period: chartPeriod };
    if (chartPeriod === "year") params.year = chartDate.getFullYear();
    if (chartPeriod === "month") {
      params.year = chartDate.getFullYear();
      params.month = chartDate.getMonth() + 1;
    }
    if (chartPeriod === "week") {
      params.date = chartDate.toISOString().split("T")[0];
    }
    return params;
  }, [chartPeriod, chartDate]);

  const loadCategoryStats = useCallback(async () => {
    if (!selectedFamilyId) {
      setCategoriesData([]);
      return;
    }
    setIsChartLoading(true);
    try {
      const data = await getFamilyCategoryStats(selectedFamilyId, buildChartParams());
      setCategoriesData(data || []);
    } catch {
      setCategoriesData([]);
    } finally {
      setIsChartLoading(false);
    }
  }, [selectedFamilyId, buildChartParams]);

  useEffect(() => { loadBaseData(); }, [loadBaseData]);
  useEffect(() => { setTxPage(1); loadFamilyData(1); }, [loadFamilyData]);
  useEffect(() => { setActiveCategory(null); loadCategoryStats(); }, [loadCategoryStats]);

  // flash message auto-clear
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!familyForm.name.trim()) return;
    setIsSaving(true);
    setMessage("");
    try {
      const family = await createFamily(familyForm);
      setFamilyForm(initialFamilyForm);
      setIsFamilyModalOpen(false);
      await loadBaseData();
      setSelectedFamilyId(family._id);
      setMessage("Đã tạo nhóm gia đình.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể tạo nhóm gia đình.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!selectedFamilyId || !inviteEmail.trim()) return;
    setIsSaving(true);
    setMessage("");
    try {
      await inviteFamilyMember(selectedFamilyId, inviteEmail);
      setInviteEmail("");
      setMessage("Đã gửi lời mời thành viên.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể gửi lời mời.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTxModalSubmit = async (payload) => {
    setIsSaving(true);
    setMessage("");
    try {
      if (editingTx) {
        await updateFamilyTransaction(selectedFamilyId, editingTx.id || editingTx._id, payload);
        setMessage("Đã cập nhật giao dịch.");
      } else {
        await createFamilyTransaction(selectedFamilyId, payload);
        setMessage("Đã thêm giao dịch gia đình.");
      }
      setMessageType("success");
      setIsTxModalOpen(false);
      setEditingTx(null);
      await loadFamilyData();
    } catch (err) {
      // re-throw để modal hiển thị lỗi
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTx = async () => {
    if (!txToDelete || !selectedFamilyId) return;
    setIsSaving(true);
    try {
      await deleteFamilyTransaction(selectedFamilyId, txToDelete.id || txToDelete._id);
      setTxToDelete(null);
      await loadFamilyData();
      setMessage("Đã xóa giao dịch.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể xóa giao dịch.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedFamilyId || !memberToDelete) return;
    setIsSaving(true);
    setMessage("");
    try {
      await deleteFamilyMember(selectedFamilyId, memberToDelete.id);
      setMemberToDelete(null);
      await Promise.all([loadFamilyData(1), loadBaseData()]);
      setMessage("Đã xóa thành viên khỏi gia đình.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể xóa thành viên.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const openNicknameModal = (member) => {
    const memberId = member.userId?._id || member.userId;
    setMemberNicknameEdit({
      id: memberId,
      name: member.userId?.fullname || member.userId?.username || member.email,
    });
    setNicknameValue(member.nickname || "");
  };

  const handleUpdateNickname = async (e) => {
    e.preventDefault();
    if (!selectedFamilyId || !memberNicknameEdit) return;
    setIsSaving(true);
    setMessage("");
    try {
      await updateFamilyMemberNickname(
        selectedFamilyId,
        memberNicknameEdit.id,
        nicknameValue
      );
      setMemberNicknameEdit(null);
      setNicknameValue("");
      await Promise.all([loadFamilyData(txPage), loadBaseData()]);
      setMessage(nicknameValue.trim() ? "Đã cập nhật biệt danh." : "Đã xóa biệt danh.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể cập nhật biệt danh.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFamily = async () => {
    if (!selectedFamilyId) return;
    setIsSaving(true);
    setMessage("");
    try {
      await deleteFamily(selectedFamilyId);
      setShowDeleteFamily(false);
      setSelectedFamilyId("");
      await loadBaseData();
      setMessage("Đã xóa nhóm gia đình.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể xóa nhóm gia đình.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaveFamily = async () => {
    if (!selectedFamilyId) return;
    setIsSaving(true);
    setMessage("");
    try {
      await leaveFamily(selectedFamilyId);
      setShowLeaveFamily(false);
      setSelectedFamilyId("");
      await loadBaseData();
      setMessage("Đã rời khỏi nhóm gia đình.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể rời nhóm.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    if (!selectedFamilyId || !transferToMemberId) return;
    setIsSaving(true);
    setMessage("");
    try {
      await transferFamilyOwnership(selectedFamilyId, transferToMemberId);
      setIsTransferModalOpen(false);
      setTransferToMemberId("");
      await Promise.all([loadFamilyData(1), loadBaseData()]);
      setMessage("Đã chuyển quyền chủ nhóm thành công.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể chuyển quyền.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      <Header userName={userName} userAvatar={userAvatar} />
      <Navbar />

      <main className={styles.page}>
        {/* hero */}
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <FontAwesomeIcon icon={faUsers} /> Quản lý gia đình
            </span>
            <h1>{getGreeting()}, {userName}!</h1>
            <p>
              Tạo nhóm chi tiêu gia đình, mời thành viên bằng email và cùng theo
              dõi các khoản thu chi chung mà không ảnh hưởng dữ liệu cá nhân.
            </p>
            <div className={styles.heroMeta}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{getFullDate()}</span>
            </div>
          </div>
          <div className={styles.heroSide}>
            <Button
              type="button"
              icon={<FontAwesomeIcon icon={faPlus} />}
              variant="primary"
              onClick={() => setIsFamilyModalOpen(true)}
              className={styles.heroButton}
            >
              Tạo gia đình
            </Button>
            <div className={styles.heroBadge}>
              <FontAwesomeIcon icon={faHome} />
              <strong>{families.length}</strong>
              <span>Nhóm gia đình</span>
            </div>
          </div>
        </section>

        {/* flash message */}
        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>{message}</div>
        )}

        <section className={styles.layout}>
          {/* sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Nhóm của tôi</h2>
                <FontAwesomeIcon icon={faUsers} />
              </div>
              {isLoading ? (
                <div className={styles.emptyState}>Đang tải...</div>
              ) : families.length === 0 ? (
                <div className={styles.emptyState}>Chưa có nhóm gia đình nào.</div>
              ) : (
                <div className={styles.familyList}>
                  {families.map((family) => (
                    <button
                      key={family._id}
                      type="button"
                      className={`${styles.familyItem} ${selectedFamilyId === family._id ? styles.active : ""}`}
                      onClick={() => setSelectedFamilyId(family._id)}
                    >
                      <strong>{family.name}</strong>
                      <span>{family.members?.length || 0} thành viên</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* main panel */}
          <section className={styles.mainPanel}>
            {!selectedFamily ? (
              <div className={styles.panel}>
                <div className={styles.emptyState}>
                  Hãy tạo hoặc chọn một nhóm gia đình để bắt đầu.
                </div>
              </div>
            ) : (
              <>
                {/* family header */}
                <div className={styles.familyHeader}>
                  <div>
                    <span className={styles.eyebrow}>Chi tiêu gia đình</span>
                    <h2>{familyDetail?.name || selectedFamily.name}</h2>
                    <p>{familyDetail?.description || "Cùng quản lý thu chi chung."}</p>
                  </div>
                  <div className={styles.familyHeaderActions}>
                    {isCurrentUserOwner ? (
                      <>
                        <form className={styles.inviteForm} onSubmit={handleInvite}>
                          <FontAwesomeIcon icon={faEnvelope} />
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Nhập email thành viên"
                          />
                          <button type="submit" disabled={isSaving || !inviteEmail.trim()}>
                            Mời
                          </button>
                        </form>
                        <Button
                          type="button"
                          icon={<FontAwesomeIcon icon={faPlus} />}
                          variant="primary"
                          onClick={() => { setEditingTx(null); setIsTxModalOpen(true); }}
                          className={styles.addTransactionButton}
                        >
                          Thêm giao dịch chung
                        </Button>
                        <button
                          type="button"
                          className={styles.ownerActionButton}
                          title="Chuyển quyền chủ nhóm"
                          onClick={() => { setTransferToMemberId(""); setIsTransferModalOpen(true); }}
                        >
                          <FontAwesomeIcon icon={faCrown} />
                        </button>
                        <button
                          type="button"
                          className={styles.dangerActionButton}
                          title="Xóa nhóm gia đình"
                          onClick={() => setShowDeleteFamily(true)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          icon={<FontAwesomeIcon icon={faPlus} />}
                          variant="primary"
                          onClick={() => { setEditingTx(null); setIsTxModalOpen(true); }}
                          className={styles.addTransactionButton}
                        >
                          Thêm giao dịch chung
                        </Button>
                        <button
                          type="button"
                          className={styles.leaveButton}
                          title="Rời khỏi nhóm"
                          onClick={() => setShowLeaveFamily(true)}
                        >
                          <FontAwesomeIcon icon={faSignOutAlt} />
                          Rời nhóm
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* stats */}
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span>Tổng thu</span>
                    <strong className={styles.income}>{formatCurrency(stats.totalIncome)}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span>Tổng chi</span>
                    <strong className={styles.expense}>{formatCurrency(stats.totalExpense)}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span>Số dư chung</span>
                    <strong>{formatCurrency(stats.balance)}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span>Giao dịch</span>
                    <strong>{stats.totalTransactions || 0}</strong>
                  </div>
                </div>

                {/* category analysis chart */}
                <div className={styles.panel} style={{ padding: "20px" }}>
                  <div className={styles.panelHeader}>
                    <h2>Cơ cấu thu chi</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* period buttons */}
                      <div className={styles.chartPeriodBar}>
                        {[
                          { key: "week", label: "Tuần" },
                          { key: "month", label: "Tháng" },
                          { key: "year", label: "Năm" },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            type="button"
                            className={`${styles.chartPeriodBtn} ${chartPeriod === key ? styles.chartPeriodActive : ""}`}
                            onClick={() => setChartPeriod(key)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {/* type buttons */}
                      <div className={styles.chartPeriodBar}>
                        {[
                          { key: "ALL", label: "Tất cả" },
                          { key: "CHITIEU", label: "Chi tiêu" },
                          { key: "THUNHAP", label: "Thu nhập" },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            type="button"
                            className={`${styles.chartPeriodBtn} ${chartType === key ? styles.chartPeriodActive : ""}`}
                            onClick={() => { setChartType(key); setActiveCategory(null); }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* date nav */}
                  <div className={styles.chartDateNav}>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      onClick={() => {
                        const d = new Date(chartDate);
                        if (chartPeriod === "week") d.setDate(d.getDate() - 7);
                        else if (chartPeriod === "month") d.setMonth(d.getMonth() - 1);
                        else d.setFullYear(d.getFullYear() - 1);
                        setChartDate(d);
                      }}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <span className={styles.chartDateLabel}>
                      {chartPeriod === "week" && `Tuần ${chartDate.toLocaleDateString("vi-VN")}`}
                      {chartPeriod === "month" && `Tháng ${chartDate.getMonth() + 1}/${chartDate.getFullYear()}`}
                      {chartPeriod === "year" && `Năm ${chartDate.getFullYear()}`}
                    </span>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      onClick={() => {
                        const d = new Date(chartDate);
                        if (chartPeriod === "week") d.setDate(d.getDate() + 7);
                        else if (chartPeriod === "month") d.setMonth(d.getMonth() + 1);
                        else d.setFullYear(d.getFullYear() + 1);
                        setChartDate(d);
                      }}
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                  <CategoryAnalysisChart
                    data={chartData}
                    total={chartTotal}
                    loading={isChartLoading}
                    error={null}
                    categoryType={chartType}
                    onActiveCategoryChange={setActiveCategory}
                  />
                </div>

                {/* members */}
                <div className={styles.contentGrid}>
                  <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                      <h2>Thành viên</h2>
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className={styles.memberList}>
                      {(familyDetail?.members || selectedFamily.members || []).map((member) => {
                        const memberId = member.userId?._id || member.userId;
                        const isMe = String(memberId) === String(currentUserId);
                        const isOwnerMember = member.role === "owner";
                        return (
                          <div
                            key={memberId}
                            className={styles.memberItem}
                          >
                            <div>
                              <strong>
                                {member.userId?.fullname || member.userId?.username || member.email}
                                {isMe && <span className={styles.youBadge}>(Bạn)</span>}
                              </strong>
                              {member.nickname && (
                                <span className={styles.nicknameText}>
                                  Biệt danh: {member.nickname}
                                </span>
                              )}
                              <span>{member.email}</span>
                            </div>
                            <div className={styles.memberActions}>
                              <b>{isOwnerMember ? "Chủ nhóm" : "Thành viên"}</b>
                              {(isCurrentUserOwner || isMe) && (
                                <button
                                  type="button"
                                  className={styles.editMemberButton}
                                  title="Đặt biệt danh"
                                  onClick={() => openNicknameModal(member)}
                                >
                                  <FontAwesomeIcon icon={faPencilAlt} />
                                </button>
                              )}
                              {isCurrentUserOwner && !isOwnerMember && (
                                <button
                                  type="button"
                                  className={styles.deleteMemberButton}
                                  title="Xóa thành viên"
                                  onClick={() =>
                                    setMemberToDelete({
                                      id: memberId,
                                      name:
                                        member.userId?.fullname ||
                                        member.userId?.username ||
                                        member.email,
                                    })
                                  }
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* transactions */}
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>Giao dịch chung</h2>
                    <FontAwesomeIcon icon={faWallet} />
                  </div>
                  {transactions.length === 0 ? (
                    <div className={styles.emptyState}>Chưa có giao dịch gia đình.</div>
                  ) : (
                    <>
                      <div className={styles.transactionList}>
                        {transactions.map((tx) => {
                          const creatorName =
                            tx.createdBy?.fullname ||
                            tx.createdBy?.username ||
                            tx.createdBy?.email ||
                            null;
                          return (
                            <article key={tx.id || tx._id} className={styles.transactionItem}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <strong>{tx.description || tx.name}</strong>
                                <span>
                                  {tx.category?.name || "Danh mục"}
                                  {" · "}
                                  {tx.paymentMethod?.name || "Tài khoản"}
                                  {" · "}
                                  {new Date(tx.date).toLocaleDateString("vi-VN")}
                                  {creatorName && (
                                    <>
                                      {" · "}
                                      <FontAwesomeIcon
                                        icon={faUserCircle}
                                        style={{ marginRight: 3 }}
                                      />
                                      {creatorName}
                                    </>
                                  )}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                <b
                                  className={
                                    tx.type === "THUNHAP" ? styles.income : styles.expense
                                  }
                                >
                                  {tx.type === "THUNHAP" ? "+" : "-"}
                                  {formatCurrency(tx.amount)}
                                </b>
                                <button
                                  type="button"
                                  className={styles.editTxButton}
                                  title="Sửa giao dịch"
                                  onClick={() => { setEditingTx(tx); setIsTxModalOpen(true); }}
                                >
                                  <FontAwesomeIcon icon={faPencilAlt} />
                                </button>
                                <button
                                  type="button"
                                  className={styles.deleteMemberButton}
                                  title="Xóa giao dịch"
                                  onClick={() => setTxToDelete(tx)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {txPagination && txPagination.totalPages > 1 && (
                        <div className={styles.pagination}>
                          <button
                            className={styles.pageBtn}
                            disabled={txPage <= 1}
                            onClick={() => loadFamilyData(txPage - 1)}
                            title="Trang trước"
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </button>
                          <span className={styles.pageInfo}>
                            Trang {txPagination.page} / {txPagination.totalPages}
                            <small> ({txPagination.total} giao dịch)</small>
                          </span>
                          <button
                            className={styles.pageBtn}
                            disabled={txPage >= txPagination.totalPages}
                            onClick={() => loadFamilyData(txPage + 1)}
                            title="Trang sau"
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </section>
      </main>

      {/* Create family modal */}
      {isFamilyModalOpen && (
        <div className={styles.modalOverlay} onMouseDown={() => setIsFamilyModalOpen(false)}>
          <form
            className={styles.modalDialog}
            onSubmit={handleCreateFamily}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <FontAwesomeIcon icon={faHome} />
              <div>
                <h2>Tạo Gia Đình</h2>
                <p>Tạo nhóm để cùng theo dõi chi tiêu chung.</p>
              </div>
              <button type="button" onClick={() => setIsFamilyModalOpen(false)} aria-label="Đóng">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <label>
                Tên gia đình
                <input
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="VD: Gia đình Đỉnh Lâm"
                />
              </label>
              <label>
                Mô tả
                <textarea
                  value={familyForm.description}
                  onChange={(e) => setFamilyForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Mô tả ngắn"
                  rows={3}
                />
              </label>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setIsFamilyModalOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} /> Hủy
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSaving || !familyForm.name.trim()}
              >
                <FontAwesomeIcon icon={faCheck} /> Tạo gia đình
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit transaction modal */}
      <FamilyTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => { setIsTxModalOpen(false); setEditingTx(null); }}
        onSubmit={handleTxModalSubmit}
        initialData={editingTx}
        mode={editingTx ? "edit" : "add"}
        accounts={accounts}
        categories={categories}
        isSaving={isSaving}
      />

      {/* Confirm delete member */}
      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDeleteMember}
        title="Xóa thành viên"
        message={`Bạn có chắc muốn xóa "${memberToDelete?.name || "thành viên"}" khỏi nhóm gia đình không?`}
        confirmText="Xóa"
        isProcessing={isSaving}
      />

      {/* Confirm delete transaction */}
      <ConfirmDialog
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleDeleteTx}
        title="Xóa giao dịch"
        message={`Bạn có chắc muốn xóa giao dịch "${txToDelete?.description || txToDelete?.name || ""}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        isProcessing={isSaving}
      />

      {/* Confirm delete family */}
      <ConfirmDialog
        isOpen={showDeleteFamily}
        onClose={() => setShowDeleteFamily(false)}
        onConfirm={handleDeleteFamily}
        title="Xóa nhóm gia đình"
        message={`Bạn có chắc muốn xóa nhóm "${selectedFamily?.name || ""}"? Toàn bộ giao dịch trong nhóm sẽ bị xóa vĩnh viễn.`}
        confirmText="Xóa nhóm"
        isProcessing={isSaving}
      />

      {/* Confirm leave family */}
      <ConfirmDialog
        isOpen={showLeaveFamily}
        onClose={() => setShowLeaveFamily(false)}
        onConfirm={handleLeaveFamily}
        title="Rời khỏi nhóm"
        message={`Bạn có chắc muốn rời khỏi nhóm "${selectedFamily?.name || ""}"? Bạn sẽ không còn truy cập được dữ liệu của nhóm này.`}
        confirmText="Rời nhóm"
        isProcessing={isSaving}
      />

      {/* Edit member nickname modal */}
      {memberNicknameEdit && (
        <div className={styles.modalOverlay} onMouseDown={() => setMemberNicknameEdit(null)}>
          <form
            className={styles.modalDialog}
            onSubmit={handleUpdateNickname}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <FontAwesomeIcon icon={faPencilAlt} />
              <div>
                <h2>Đặt biệt danh</h2>
                <p>Đặt cách gọi thân thuộc cho thành viên trong gia đình.</p>
              </div>
              <button type="button" onClick={() => setMemberNicknameEdit(null)} aria-label="Đóng">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <label>
                Thành viên
                <input value={memberNicknameEdit.name} disabled />
              </label>
              <label>
                Biệt danh
                <input
                  value={nicknameValue}
                  onChange={(e) => setNicknameValue(e.target.value)}
                  placeholder="VD: Mẹ, Cha, Anh Hai..."
                  maxLength={40}
                  autoFocus
                />
              </label>
              <p className={styles.modalHint}>
                Để trống và lưu nếu bạn muốn xóa biệt danh hiện tại.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setMemberNicknameEdit(null)}
              >
                <FontAwesomeIcon icon={faTimes} /> Hủy
              </button>
              <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                <FontAwesomeIcon icon={faCheck} /> Lưu biệt danh
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer ownership modal */}
      {isTransferModalOpen && (
        <div className={styles.modalOverlay} onMouseDown={() => setIsTransferModalOpen(false)}>
          <form
            className={styles.modalDialog}
            onSubmit={handleTransferOwnership}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <FontAwesomeIcon icon={faCrown} />
              <div>
                <h2>Chuyển quyền chủ nhóm</h2>
                <p>Chọn thành viên sẽ tiếp quản nhóm này.</p>
              </div>
              <button type="button" onClick={() => setIsTransferModalOpen(false)} aria-label="Đóng">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <label>
                Chọn thành viên nhận quyền
                <select
                  value={transferToMemberId}
                  onChange={(e) => setTransferToMemberId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn thành viên --</option>
                  {(familyDetail?.members || []).filter((m) => {
                    const mid = m.userId?._id || m.userId;
                    return m.role !== "owner" && String(mid) !== String(currentUserId);
                  }).map((m) => {
                    const mid = m.userId?._id || m.userId;
                    return (
                      <option key={mid} value={mid}>
                        {m.userId?.fullname || m.userId?.username || m.email}
                      </option>
                    );
                  })}
                </select>
              </label>
              <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>
                ⚠️ Sau khi chuyển, bạn sẽ trở thành thành viên thường và không thể hoàn tác.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setIsTransferModalOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} /> Hủy
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSaving || !transferToMemberId}
              >
                <FontAwesomeIcon icon={faCrown} /> Chuyển quyền
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default FamilyPage;
