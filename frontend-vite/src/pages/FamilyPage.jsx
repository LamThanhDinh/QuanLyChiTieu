import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faHome,
  faPlus,
  faReceipt,
  faUsers,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Button from "../components/Common/Button";
import { getProfile } from "../api/profileService";
import { getAccounts } from "../api/accountsService";
import { getCategories } from "../api/categoriesService";
import {
  createFamily,
  createFamilyTransaction,
  getFamilies,
  getFamilyDetail,
  getFamilyTransactions,
  inviteFamilyMember,
} from "../api/familyService";
import { getGreeting } from "../utils/timeHelpers";
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
      setMessage("Đã thêm giao dịch gia đình.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể thêm giao dịch gia đình.");
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
          <div>
            <span className={styles.eyebrow}>
              <FontAwesomeIcon icon={faUsers} /> Quản lý gia đình
            </span>
            <h1>{getGreeting()}, {userName}!</h1>
            <p>
              Tạo nhóm chi tiêu gia đình, mời thành viên bằng email và cùng theo
              dõi các khoản thu chi chung mà không ảnh hưởng dữ liệu cá nhân.
            </p>
          </div>
          <div className={styles.heroBadge}>
            <FontAwesomeIcon icon={faHome} />
            <strong>{families.length}</strong>
            <span>nhóm gia đình</span>
          </div>
        </section>

        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {message}
          </div>
        )}

        <section className={styles.layout}>
          <aside className={styles.sidebar}>
            <form className={styles.panel} onSubmit={handleCreateFamily}>
              <div className={styles.panelHeader}>
                <h2>Tạo gia đình</h2>
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <input
                value={familyForm.name}
                onChange={(event) =>
                  setFamilyForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="VD: Gia đình Đình Lâm"
              />
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
              <Button type="submit" disabled={isSaving || !familyForm.name.trim()}>
                Tạo nhóm
              </Button>
            </form>

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
                  <form className={styles.panel} onSubmit={handleCreateTransaction}>
                    <div className={styles.panelHeader}>
                      <h2>Thêm giao dịch chung</h2>
                      <FontAwesomeIcon icon={faReceipt} />
                    </div>
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
                      placeholder="Số tiền"
                    />
                    <select
                      value={transactionForm.accountId}
                      onChange={(event) =>
                        setTransactionForm((prev) => ({
                          ...prev,
                          accountId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Chọn tài khoản của bạn</option>
                      {accounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
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
                    <Button type="submit" disabled={isSaving}>
                      Thêm giao dịch gia đình
                    </Button>
                  </form>

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
                          <b>{member.role === "owner" ? "Chủ nhóm" : "Thành viên"}</b>
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

      <Footer />
    </div>
  );
};

export default FamilyPage;
