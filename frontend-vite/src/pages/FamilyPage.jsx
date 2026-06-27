import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheck,
  faEnvelope,
  faHome,
  faPlus,
  faReceipt,
  faTimes,
  faTrash,
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
  deleteFamilyMember,
  getFamilies,
  getFamilyDetail,
  getFamilyTransactions,
  inviteFamilyMember,
} from "../api/familyService";
import { getFullDate, getGreeting } from "../utils/timeHelpers";
import styles from "../styles/FamilyPage.module.css";

const formatCurrency = (amount) =>
  `${Math.round(amount || 0).toLocaleString("vi-VN")} đ`;

const initialFamilyForm = { name: "", description: "" };
const initialTransactionForm = {
  name: "",
  amount: "",
  type: "CHITIEU",
  accountId: "",
  categoryId: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

const parseAmount = (value) => String(value || "").replace(/\D/g, "");

const FamilyPage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [families, setFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [familyDetail, setFamilyDetail] = useState(null);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalTransactions: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [familyForm, setFamilyForm] = useState(initialFamilyForm);
  const [inviteEmail, setInviteEmail] = useState("");
  const [transactionForm, setTransactionForm] = useState(initialTransactionForm);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const userName = userProfile?.fullname || "Bạn";
  const userAvatar = userProfile?.avatar || null;

  const selectedFamily = useMemo(
    () => families.find((family) => family._id === selectedFamilyId),
    [families, selectedFamilyId]
  );

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === transactionForm.type),
    [categories, transactionForm.type]
  );

  const currentUserId = userProfile?._id || userProfile?.id || userProfile?.userId;
  const selectedOwnerId = familyDetail?.ownerId?._id || selectedFamily?.ownerId?._id || selectedFamily?.ownerId;
  const isCurrentUserOwner = selectedFamilyId && String(currentUserId || "") === String(selectedOwnerId || "");

  const loadBaseData = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const [profileResponse, familyResponse, accountResponse, categoryResponse] =
        await Promise.all([
          getProfile().catch(() => null),
          getFamilies(),
          getAccounts({}),
          getCategories({ includeGoalCategories: "false" }),
        ]);

      const familyList = familyResponse?.data || [];
      setUserProfile(profileResponse?.data || null);
      setFamilies(familyList);
      setAccounts(accountResponse || []);
      setCategories(categoryResponse || []);
      setSelectedFamilyId((current) => current || familyList[0]?._id || "");
    } catch (error) {
      console.error("Error loading family page:", error);
      setMessage("Không thể tải dữ liệu gia đình.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFamilyData = useCallback(async () => {
    if (!selectedFamilyId) {
      setFamilyDetail(null);
      setTransactions([]);
      return;
    }

    try {
      const [detailResponse, transactionResponse] = await Promise.all([
        getFamilyDetail(selectedFamilyId),
        getFamilyTransactions(selectedFamilyId),
      ]);
      setFamilyDetail(detailResponse.family);
      setStats(transactionResponse.stats || detailResponse.stats || {});
      setTransactions(transactionResponse.data || []);
    } catch (error) {
      console.error("Error loading family detail:", error);
      setMessage("Không thể tải chi tiết gia đình.");
      setMessageType("error");
    }
  }, [selectedFamilyId]);

  useEffect(() => {
    loadBaseData();
  }, [loadBaseData]);

  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  const handleCreateFamily = async (event) => {
    event.preventDefault();
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
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể tạo nhóm gia đình.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async (event) => {
    event.preventDefault();
    if (!selectedFamilyId || !inviteEmail.trim()) return;

    setIsSaving(true);
    setMessage("");
    try {
      await inviteFamilyMember(selectedFamilyId, inviteEmail);
      setInviteEmail("");
      setMessage("Đã gửi lời mời thành viên.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể gửi lời mời.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTransaction = async (event) => {
    event.preventDefault();
    if (
      !selectedFamilyId ||
      !transactionForm.name ||
      !transactionForm.amount ||
      !transactionForm.accountId ||
      !transactionForm.categoryId
    ) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      await createFamilyTransaction(selectedFamilyId, {
        ...transactionForm,
        amount: Number(transactionForm.amount),
      });
      setTransactionForm({
        ...initialTransactionForm,
        type: transactionForm.type,
      });
      await loadFamilyData();
      setIsTransactionModalOpen(false);
      setMessage("Đã thêm giao dịch gia đình.");
      setMessageType("success");
    } catch (error) {
      const errData = error.response?.data;
      const msg = errData?.message || "Không thể thêm giao dịch gia đình.";
      const detail = errData?.detail ? ` (${errData.detail})` : "";
      setMessage(msg + detail);
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
      await loadFamilyData();
      await loadBaseData();
      setMessage("Đã xóa thành viên khỏi gia đình.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể xóa thành viên.");
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

        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {message}
          </div>
        )}

        <section className={styles.layout}>
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
                      className={`${styles.familyItem} ${
                        selectedFamilyId === family._id ? styles.active : ""
                      }`}
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

          <section className={styles.mainPanel}>
            {!selectedFamily ? (
              <div className={styles.panel}>
                <div className={styles.emptyState}>
                  Hãy tạo hoặc chọn một nhóm gia đình để bắt đầu.
                </div>
              </div>
            ) : (
              <>
                <div className={styles.familyHeader}>
                  <div>
                    <span className={styles.eyebrow}>Chi tiêu gia đình</span>
                    <h2>{familyDetail?.name || selectedFamily.name}</h2>
                    <p>{familyDetail?.description || "Cùng quản lý thu chi chung."}</p>
                  </div>
                  <div className={styles.familyHeaderActions}>
                    <form className={styles.inviteForm} onSubmit={handleInvite}>
                      <FontAwesomeIcon icon={faEnvelope} />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
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
                      onClick={() => setIsTransactionModalOpen(true)}
                      className={styles.addTransactionButton}
                    >
                      Thêm giao dịch chung
                    </Button>
                  </div>
                </div>

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

                <div className={styles.contentGrid}>
                  <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                      <h2>Thành viên</h2>
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className={styles.memberList}>
                      {(familyDetail?.members || selectedFamily.members || []).map((member) => (
                        <div key={member.userId?._id || member.userId} className={styles.memberItem}>
                          <div>
                            <strong>
                              {member.userId?.fullname ||
                                member.userId?.username ||
                                member.email}
                            </strong>
                            <span>{member.email}</span>
                          </div>
                          <div className={styles.memberActions}>
                            <b>{member.role === "owner" ? "Chủ nhóm" : "Thành viên"}</b>
                            {isCurrentUserOwner && member.role !== "owner" && (
                              <button
                                type="button"
                                className={styles.deleteMemberButton}
                                title="Xóa thành viên"
                                onClick={() =>
                                  setMemberToDelete({
                                    id: member.userId?._id || member.userId,
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
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>Giao dịch chung</h2>
                    <FontAwesomeIcon icon={faWallet} />
                  </div>
                  {transactions.length === 0 ? (
                    <div className={styles.emptyState}>Chưa có giao dịch gia đình.</div>
                  ) : (
                    <div className={styles.transactionList}>
                      {transactions.map((transaction) => (
                        <article key={transaction.id} className={styles.transactionItem}>
                          <div>
                            <strong>{transaction.description}</strong>
                            <span>
                              {transaction.category?.name || "Danh mục"} ·{" "}
                              {transaction.paymentMethod?.name || "Tài khoản"} ·{" "}
                              {new Date(transaction.date).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <b
                            className={
                              transaction.type === "THUNHAP"
                                ? styles.income
                                : styles.expense
                            }
                          >
                            {transaction.type === "THUNHAP" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </b>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </section>
      </main>

      {isFamilyModalOpen && (
        <div className={styles.modalOverlay} onMouseDown={() => setIsFamilyModalOpen(false)}>
          <form className={styles.modalDialog} onSubmit={handleCreateFamily} onMouseDown={(event) => event.stopPropagation()}>
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
                  onChange={(event) =>
                    setFamilyForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="VD: Gia đình Đình Lâm"
                />
              </label>
              <label>
                Mô tả
                <textarea
                  value={familyForm.description}
                  onChange={(event) =>
                    setFamilyForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Mô tả ngắn..."
                  rows={3}
                />
              </label>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsFamilyModalOpen(false)}>
                <FontAwesomeIcon icon={faTimes} /> Hủy
              </button>
              <button type="submit" className={styles.primaryButton} disabled={isSaving || !familyForm.name.trim()}>
                <FontAwesomeIcon icon={faCheck} /> Tạo gia đình
              </button>
            </div>
          </form>
        </div>
      )}

      {isTransactionModalOpen && (
        <div className={styles.modalOverlay} onMouseDown={() => setIsTransactionModalOpen(false)}>
          <form className={styles.modalDialog} onSubmit={handleCreateTransaction} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <FontAwesomeIcon icon={faReceipt} />
              <div>
                <h2>Thêm Giao Dịch Chung</h2>
                <p>Giao dịch này sẽ được ghi nhận vào nhóm gia đình đang chọn.</p>
              </div>
              <button type="button" onClick={() => setIsTransactionModalOpen(false)} aria-label="Đóng">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.typeToggle}>
                <button
                  type="button"
                  className={transactionForm.type === "CHITIEU" ? styles.expenseActive : ""}
                  onClick={() =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      type: "CHITIEU",
                      categoryId: "",
                    }))
                  }
                >
                  Chi tiêu
                </button>
                <button
                  type="button"
                  className={transactionForm.type === "THUNHAP" ? styles.incomeActive : ""}
                  onClick={() =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      type: "THUNHAP",
                      categoryId: "",
                    }))
                  }
                >
                  Thu nhập
                </button>
              </div>
              <label>
                Tên giao dịch
                <input
                  value={transactionForm.name}
                  onChange={(event) =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="VD: Đi siêu thị cuối tuần"
                />
              </label>
              <label>
                Số tiền
                <input
                  value={
                    transactionForm.amount
                      ? Number(transactionForm.amount).toLocaleString("vi-VN")
                      : ""
                  }
                  inputMode="numeric"
                  onChange={(event) =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      amount: parseAmount(event.target.value),
                    }))
                  }
                  placeholder="VD: 500.000"
                />
              </label>
              <div className={styles.inlineFields}>
                <label>
                  Tài khoản
                  <select
                    value={transactionForm.accountId}
                    onChange={(event) =>
                      setTransactionForm((prev) => ({
                        ...prev,
                        accountId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Chọn tài khoản</option>
                    {accounts.map((account) => {
                      const accountId = account._id || account.id;
                      return (
                        <option key={accountId} value={accountId}>
                          {account.name}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <label>
                  Danh mục
                  <select
                    value={transactionForm.categoryId}
                    onChange={(event) =>
                      setTransactionForm((prev) => ({
                        ...prev,
                        categoryId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Chọn danh mục</option>
                    {filteredCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Ngày giao dịch
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(event) =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Ghi chú
                <textarea
                  value={transactionForm.note}
                  onChange={(event) =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Ghi chú"
                  rows={3}
                />
              </label>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsTransactionModalOpen(false)}>
                <FontAwesomeIcon icon={faTimes} /> Hủy
              </button>
              <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                <FontAwesomeIcon icon={faCheck} /> Thêm giao dịch
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDeleteMember}
        title="Xóa thành viên"
        message={`Bạn có chắc muốn xóa "${memberToDelete?.name || "thành viên"}" khỏi nhóm gia đình không?`}
        confirmText="Xóa"
        isProcessing={isSaving}
      />

      <Footer />
    </div>
  );
};

export default FamilyPage;
