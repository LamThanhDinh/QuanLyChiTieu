import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

import Header from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import DateRangeNavigator from "../components/Common/DateRangeNavigator";
import TotalBalanceDisplay from "../components/Accounts/TotalBalanceDisplay";
import AccountList from "../components/Accounts/AccountList";
import AddEditAccountModal from "../components/Accounts/AddEditAccountModal";
import HeaderCard from "../components/Common/HeaderCard";

import SummaryWidget from "../components/Common/SummaryWidget";
import PageContentContainer from "../components/Common/PageContentContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../components/Common/Button";

import {
  faPlus,
  faChartPie,
  faHandHoldingDollar,
  faArrowDown, // Icon cho thu nhập
  faArrowUp, // Icon cho chi tiêu
} from "@fortawesome/free-solid-svg-icons";

import styles from "../styles/AccountPage.module.css";
import headerStyles from "../components/Common/HeaderCard.module.css";
import {
  getAccounts,
  addAccount,
  editAccount,
  deleteAccount,
  getTransactionCountByAccount,
} from "../api/accountsService";
import statisticsService from "../api/statisticsService";
import { getProfile } from "../api/profileService";
import { getGreeting, getFullDate } from "../utils/timeHelpers";

const AccountPage = () => {
  const queryClient = useQueryClient();

  // --- State quản lý chung ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [highlightedAccountId, setHighlightedAccountId] = useState(null);

  // THAY ĐỔI: Chuyển sang quản lý state bằng period và currentDate
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState("month");

  // ✅ SỬ DỤNG REACT QUERY ĐỂ FETCH VÀ QUẢN LÝ DỮ LIỆU
  const queryParams = useMemo(() => {
    let startDate, endDate;
    if (period === "week") {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else if (period === "month") {
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    } else if (period === "year") {
      startDate = startOfYear(currentDate);
      endDate = endOfYear(currentDate);
    }
    if (startDate && endDate) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }
    return {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    };
  }, [period, currentDate]);

  const {
    data: pageData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accountsPage", queryParams],
    queryFn: async () => {
      const accountsData = await getAccounts(queryParams);
      const [summary, counts, profile] = await Promise.all([
        statisticsService.getOverviewStats(queryParams),
        Promise.all(
          accountsData.map((acc) =>
            getTransactionCountByAccount({
              accountId: acc.id,
              ...queryParams,
            }).then((count) => ({ [acc.id]: count }))
          )
        ).then((results) =>
          results.reduce((acc, val) => ({ ...acc, ...val }), {})
        ),
        getProfile().catch(() => null),
      ]);
      return {
        accounts: accountsData || [],
        summaryData: {
          income: summary.income,
          expense: summary.expense,
        },
        transactionCounts: counts,
        userProfile: profile?.data || null,
      };
    },
    placeholderData: (previousData) => previousData,
  });

  const {
    accounts = [],
    summaryData = { income: null, expense: null },
    transactionCounts = {},
    userProfile = null,
  } = pageData || {};

  const apiError = error
    ? error.response?.data?.message ||
      "Không thể tải dữ liệu cho trang nguồn tiền."
    : "";

  // CÁC HÀM HANDLER MỚI cho DateRangeNavigator
  const handleDateChange = (newDate) => setCurrentDate(newDate);
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setCurrentDate(new Date());
  };

  // --- Các hàm xử lý Modal ---
  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  // ✅ SỬ DỤNG REACT QUERY MUTATIONS CHO CÁC HÀNH ĐỘNG
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountsPage"] });
      handleCloseModal();
    },
    onError: (err, variables, context) => {
      console.error("Lỗi khi thực hiện hành động:", err);
      // Lỗi sẽ được throw và bắt ở handleFormSubmit để hiển thị trong modal
    },
  };

  const addAccountMutation = useMutation({
    mutationFn: addAccount,
    ...mutationOptions,
  });

  const editAccountMutation = useMutation({
    mutationFn: (variables) => editAccount(variables.id, variables.payload),
    ...mutationOptions,
  });

  const deleteAccountMutation = useMutation({ mutationFn: deleteAccount });

  const handleFormSubmit = async (formData) => {
    const isEditing = !!editingAccount;
    const payload = {
      name: formData.name,
      type: formData.type === "cash" ? "TIENMAT" : "THENGANHANG",
      initialBalance: parseFloat(formData.balance) || 0,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
    };
    if (isEditing) {
      delete payload.initialBalance;
      delete payload.type;
    }
    try {
      if (isEditing) {
        await editAccountMutation.mutateAsync({
          id: editingAccount.id,
          payload,
        });
      } else {
        await addAccountMutation.mutateAsync(payload);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi lưu.";
      console.error("Lỗi khi lưu nguồn tiền:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Tính tổng số dư từ danh sách tài khoản đã được API trả về
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.balance || 0),
    0
  );

  // Hàm xóa tài khoản
  const handleDeleteAccount = async (accountId) => {
    try {
      await deleteAccountMutation.mutateAsync(accountId);
      // Tự động cập nhật lại list sau khi xóa thành công
      queryClient.invalidateQueries({ queryKey: ["accountsPage"] });
    } catch (err) {
      console.error("Lỗi khi xóa nguồn tiền:", err);
      // Có thể hiển thị thông báo lỗi cho người dùng ở đây
    }
  };

  const StatisticsSection = () => (
    <SummaryWidget
      incomeData={{
        amount: summaryData.income?.amount || 0,
        comparison: summaryData.income?.changeDescription || "",
        percent: summaryData.income?.changePercent,
      }}
      expenseData={{
        amount: summaryData.expense?.amount || 0,
        comparison: summaryData.expense?.changeDescription || "",
        percent: summaryData.expense?.changePercent,
      }}
      isLoading={isLoading}
      variant="compact"
    />
  );

  // === Helper functions cho header ===
  // Tạo ngữ cảnh thông minh
  const getSmartContext = () => {
    if (isLoading) return "Đang tải dữ liệu tài chính...";

    if (!summaryData || !summaryData.income || !summaryData.expense) {
      return "Hãy bắt đầu quản lý tài chính của bạn.";
    }

    const balance = summaryData.income.amount - summaryData.expense.amount;
    const accountCount = accounts.length;

    if (balance > 0) {
      return `Tình hình tài chính tích cực! Bạn có ${accountCount} nguồn tiền đang hoạt động.`;
    } else if (balance < 0) {
      return `Cần chú ý chi tiêu. Quản lý ${accountCount} tài khoản một cách thông minh hơn nhé!`;
    } else {
      return `Tài chính cân bằng với ${accountCount} nguồn tiền. Rất tốt!`;
    }
  };

  const getMoodEmoji = () => {
    if (isLoading || !summaryData) return "📊";
    const balance = summaryData.income.amount - summaryData.expense.amount;
    if (balance > 0) return "💙"; // tốt
    if (balance < 0) return "💔"; // xấu
    return "🩵"; // cân bằng
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header
        userName={userProfile?.fullname}
        userAvatar={userProfile?.avatar}
      />
      <Navbar />
      <main className={styles.pageWrapper}>
        <div className={styles.contentContainer}>
          {/* Header với layout 2x2 grid */}
          <HeaderCard
            className={styles.accountPageHeader}
            gridIcon={<FontAwesomeIcon icon={faHandHoldingDollar} />}
            gridTitle={`${getGreeting()}, ${userProfile?.fullname || "Bạn"}!`}
            gridSubtitle="Quản lý nguồn tiền thông minh"
            gridStats={<StatisticsSection />}
            gridInfo={
              <>
                <div className="smartContext">
                  <span className="contextText">{getSmartContext()}</span>
                  <span className="moodEmoji">{getMoodEmoji()}</span>
                </div>
                <span className={headerStyles.miniStats}>{getFullDate()}</span>
              </>
            }
            gridAction={
              <Button
                onClick={handleOpenAddModal}
                icon={<FontAwesomeIcon icon={faPlus} />}
                variant="primary"
                className={styles.addButton}
              >
                Thêm Nguồn Tiền
              </Button>
            }
          />

          <PageContentContainer
            title="Bảng Điều Khiển Tài Chính"
            titleIcon={faChartPie}
            titleIconColor="#3f51b5"
            dateProps={{
              period,
              currentDate,
              onDateChange: handleDateChange,
              onPeriodChange: handlePeriodChange,
            }}
          >
            <TotalBalanceDisplay
              accounts={accounts}
              isLoading={isLoading}
              highlightedAccountId={highlightedAccountId}
              onHoverAccount={setHighlightedAccountId}
            />
            <AccountList
              accounts={accounts}
              totalBalance={totalBalance}
              isLoading={isLoading}
              error={apiError}
              onEditRequest={handleOpenEditModal}
              onDeleteAccount={handleDeleteAccount}
              highlightedAccountId={highlightedAccountId}
              onHoverAccount={setHighlightedAccountId}
              transactionCounts={transactionCounts}
            />
          </PageContentContainer>
        </div>
      </main>
      {isModalOpen && (
        <AddEditAccountModal
          isOpen={isModalOpen}
          mode={editingAccount ? "edit" : "add"}
          initialData={editingAccount}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
        />
      )}
      <Footer />
    </div>
  );
};

export default AccountPage;
