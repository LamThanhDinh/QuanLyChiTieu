// frontend-vite/src/pages/TransactionsPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { startOfWeek, endOfWeek, format } from "date-fns";
import styles from "../styles/TransactionsPage.module.css";
import {
  faPlus,
  faExchangeAlt,
  faCalendarAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Services
import { getTransactions, deleteTransaction } from "../api/transactionsService";
import { getCategories } from "../api/categoriesService";
import { getAccounts } from "../api/accountsService";
import { getProfile } from "../api/profileService";
import statisticsService from "../api/statisticsService";

// Components
import Header from "../components/Header/Header";
import Button from "../components/Common/Button";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import HeaderCard from "../components/Common/HeaderCard";
import PageContentContainer from "../components/Common/PageContentContainer";
import FloatingActionButton from "../components/Common/FloatingActionButton";
import TransactionCalendar from "../components/Transactions/TransactionCalendar";
import TransactionFilterPanel from "../components/Transactions/TransactionFilterPanel";
import TransactionList from "../components/Transactions/TransactionList";
import AddEditTransactionModal from "../components/Transactions/AddEditTransactionModal";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import TransactionStatsWidget from "../components/Common/TransactionStatsWidget";

// Utils
import { getGreeting, getFullDate } from "../utils/timeHelpers";

const ITEMS_PER_PAGE = 20; // Define items per page constant

const TransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFiltersFromUrl = useMemo(() => {
    const filters = {};
    const categoryId = searchParams.get("categoryId");
    const accountId = searchParams.get("accountId");
    if (categoryId) filters.categoryId = categoryId;
    if (accountId) filters.accountId = accountId;
    return filters;
  }, [searchParams]);

  // State dữ liệu
  const [statsData, setStatsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [calendarData, setCalendarData] = useState({});
  const [categoryList, setCategoryList] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [transactionStats, setTransactionStats] = useState({
    totalCount: 0,
    incomeCount: 0,
    expenseCount: 0,
  });

  // State quản lý
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState("month");
  const [activeFilters, setActiveFilters] = useState(initialFiltersFromUrl);
  const [tempFilters, setTempFilters] = useState(initialFiltersFromUrl);
  const [isLoading, setIsLoading] = useState({ page: true, filters: true });
  const [error, setError] = useState("");
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // ✅ Cờ để điều phối

  // State modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // ✅ Step 1: Tải dữ liệu cho bộ lọc
  useEffect(() => {
    const fetchFilterData = async () => {
      setIsLoading((prev) => ({ ...prev, filters: true }));
      try {
        const [catRes, accRes, profileRes] = await Promise.all([
          getCategories(),
          getAccounts({}),
          getProfile().catch(() => null),
        ]);
        setCategoryList(catRes || []);
        setAccountList(accRes || []);
        setUserProfile(profileRes?.data || null);
        setInitialDataLoaded(true);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu cho bộ lọc:", error);
        setError("Không thể tải được các tùy chọn trong bộ lọc.");
      } finally {
        setIsLoading((prev) => ({ ...prev, filters: false }));
      }
    };
    fetchFilterData();
  }, []);

  // ✅ Step 2: Tải dữ liệu trang chính (chỉ chạy sau khi Step 1 hoàn tất)
  const fetchPageData = useCallback(
    async (page = 1) => {
      if (!initialDataLoaded) return; // Chờ cho đến khi dữ liệu filter được tải xong

      setIsLoading((prev) => ({ ...prev, page: true }));
      setError("");

      const getRequestParams = (currentFilters) => {
        let params = { page, limit: 10, ...currentFilters };

        // ✅ Ưu tiên dateFrom/dateTo nếu có (từ click dayCell)
        if (currentFilters.dateFrom && currentFilters.dateTo) {
          // Không thêm year/month/week params nếu đã có dateFrom/dateTo
          // Để API lọc chính xác theo ngày
          return params;
        }

        // Nếu không có dateFrom/dateTo, dùng logic period như cũ
        if (period === "week") {
          params.startDate = startOfWeek(currentDate, {
            weekStartsOn: 1,
          }).toISOString();
          params.endDate = endOfWeek(currentDate, {
            weekStartsOn: 1,
          }).toISOString();
        } else if (period === "year") {
          params.year = currentDate.getFullYear();
        } else {
          // month
          params.year = currentDate.getFullYear();
          params.month = currentDate.getMonth() + 1;
        }
        return params;
      };

      try {
        const overviewParams = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
        };

        // ✅ Calendar params phụ thuộc vào period
        const calendarParams =
          period === "year"
            ? { year: currentDate.getFullYear() } // Chỉ truyền year cho cả năm
            : {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1,
              }; // Truyền year + month cho week/month

        const [statsRes, calendarRes, transactionsRes] = await Promise.all([
          statisticsService.getOverviewStats(overviewParams),
          statisticsService.getCalendarData(calendarParams),
          getTransactions(
            pagination.currentPage,
            ITEMS_PER_PAGE,
            getRequestParams(activeFilters)
          ),
        ]);
        setStatsData(statsRes);
        setCalendarData(calendarRes);
        setTransactions(transactionsRes.data.data);
        setPagination({
          currentPage: transactionsRes.data.currentPage,
          totalPages: transactionsRes.data.totalPages,
        });

        // ✅ Sử dụng stats từ backend thay vì tự tính toán
        setTransactionStats({
          totalCount: transactionsRes.data.totalCount || 0,
          incomeCount: transactionsRes.data.incomeCount || 0,
          expenseCount: transactionsRes.data.expenseCount || 0,
        });
      } catch (err) {
        setError("Không thể tải danh sách giao dịch.");
        console.error("Fetch page data error:", err);
      } finally {
        setIsLoading((prev) => ({ ...prev, page: false }));
      }
    },
    [
      initialDataLoaded,
      currentDate,
      period,
      activeFilters,
      pagination.currentPage,
    ]
  );

  useEffect(() => {
    if (initialDataLoaded) {
      fetchPageData(pagination.currentPage);
    }
  }, [initialDataLoaded, activeFilters, pagination.currentPage, fetchPageData]);

  // Effect để xóa URL params và xử lý focus
  useEffect(() => {
    const shouldFocus = searchParams.get("focus");
    const source = searchParams.get("source");

    if (shouldFocus === "filter" && source === "analytics") {
      // Scroll to and focus on filter panel
      setTimeout(() => {
        const filterPanel = document.querySelector("[data-filter-panel]");
        if (filterPanel) {
          filterPanel.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Optionally highlight the filter panel briefly
          filterPanel.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.5)";
          setTimeout(() => {
            filterPanel.style.boxShadow = "";
          }, 2000);
        }
      }, 100);
    } else if (shouldFocus === "true") {
      // Focus từ categories page - scroll to filter panel
      setTimeout(() => {
        const filterPanel = document.querySelector("[data-filter-panel]");
        if (filterPanel) {
          filterPanel.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Highlight briefly để user biết đã filter
          filterPanel.style.boxShadow = "0 0 0 3px rgba(63, 81, 181, 0.5)";
          setTimeout(() => {
            filterPanel.style.boxShadow = "";
          }, 2000);
        }
      }, 100);
    }

    // Clean up URL params
    if (
      searchParams.get("categoryId") ||
      searchParams.get("accountId") ||
      shouldFocus
    ) {
      const newParams = {};
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Handlers
  const handlePageChange = (newPage) =>
    setPagination((p) => ({ ...p, currentPage: newPage }));
  const handleFilterFieldChange = (fieldName, value) =>
    setTempFilters((prev) => ({ ...prev, [fieldName]: value }));
  const handleApplyFilters = () => {
    setActiveFilters(tempFilters);
    handlePageChange(1);
  };
  const handleResetFilters = () => {
    const emptyFilters = {};
    setActiveFilters(emptyFilters);
    setTempFilters(emptyFilters);
    handlePageChange(1);
  };
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
    handlePageChange(1);
  };
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    handleDateChange(new Date());
  };
  const handleEditRequest = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };
  const handleAddRequest = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };
  const handleDeleteRequest = (transactionId) => {
    setTransactionToDelete(transactionId);
    setIsConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await deleteTransaction(transactionToDelete);
      fetchPageData(pagination.currentPage);
    } catch (err) {
      alert("Xóa giao dịch thất bại!");
      console.error("Lỗi khi xóa giao dịch:", err);
    } finally {
      setIsConfirmOpen(false);
      setTransactionToDelete(null);
    }
  };
  const handleSubmitSuccess = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    fetchPageData(pagination.currentPage);
  };

  // ✅ Handler cho click vào dayCell
  const handleDayClick = (selectedDate) => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    // Cập nhật filter để lọc theo ngày được chọn
    const newFilters = {
      ...tempFilters,
      dateFrom: formattedDate,
      dateTo: formattedDate,
    };

    setTempFilters(newFilters);
    setActiveFilters(newFilters);
    handlePageChange(1);

    // Focus vào TransactionList sau một chút để đảm bảo data đã load
    setTimeout(() => {
      const listSection = document.querySelector("[data-transaction-list]");
      if (listSection) {
        listSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // Highlight briefly
        listSection.style.boxShadow = "0 0 0 3px rgba(63, 81, 181, 0.5)";
        setTimeout(() => {
          listSection.style.boxShadow = "";
        }, 2000);
      }
    }, 300);
  };

  // === Helper functions cho header ===
  const getTransactionSmartContext = () => {
    const totalTransactions = transactions.length;
    if (totalTransactions === 0) {
      return "Chưa có giao dịch nào trong khoảng thời gian này";
    }
    return `Đã có ${totalTransactions} giao dịch trong ${period === "week" ? "tuần" : period === "month" ? "tháng" : "năm"} này`;
  };

  const getTransactionMoodEmoji = () => {
    if (!statsData) return "📊";
    const { totalIncome = 0, totalExpense = 0 } = statsData;
    const balance = totalIncome - totalExpense;

    if (balance > 0) return "💰";
    if (balance < 0) return "💸";
    return "⚖️";
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
          {/* Header Card */}
          <HeaderCard
            className={styles.transactionPageHeader}
            gridIcon={<FontAwesomeIcon icon={faExchangeAlt} />}
            gridTitle={`${getGreeting()}, ${userProfile?.fullname || "Bạn"}!`}
            gridSubtitle="Quản lý giao dịch thông minh"
            gridStats={
              <div className={styles.widgetSection}>
                <TransactionStatsWidget
                  totalCount={transactionStats.totalCount}
                  incomeCount={transactionStats.incomeCount}
                  expenseCount={transactionStats.expenseCount}
                  period={period}
                  isLoading={isLoading.page}
                />
              </div>
            }
            gridInfo={
              <>
                <div className="smartContext">
                  <span className="contextText">
                    {getTransactionSmartContext()}
                  </span>
                  <span className="moodEmoji">{getTransactionMoodEmoji()}</span>
                </div>
                <span className="miniStats">{getFullDate()}</span>
              </>
            }
            gridAction={
              <Button
                onClick={handleAddRequest}
                icon={<FontAwesomeIcon icon={faPlus} />}
                variant="primary"
              >
                Thêm Giao Dịch
              </Button>
            }
          />

          {/* Main Content */}
          <PageContentContainer
            title="Quản Lý Giao Dịch"
            titleIcon={faCalendarAlt}
            titleIconColor="#3f51b5"
            dateProps={{
              period,
              currentDate,
              onDateChange: handleDateChange,
              onPeriodChange: handlePeriodChange,
            }}
            customLayout={true}
          >
            {/* Transaction Calendar */}
            <div className={styles.calendarSection}>
              <TransactionCalendar
                calendarData={calendarData}
                currentDate={currentDate}
                period={period}
                onDayClick={handleDayClick}
              />
            </div>

            {/* Transaction Stats Widget */}

            {/* Filter Panel */}
            <div className={styles.filterSection} data-filter-panel>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <FontAwesomeIcon
                    icon={faSearch}
                    className={styles.sectionIcon}
                  />
                  <h3>Bộ Lọc Giao Dịch</h3>
                </div>
                <span className={styles.sectionSubtitle}>
                  Lọc và tìm kiếm giao dịch theo tiêu chí mong muốn
                </span>
              </div>
              <TransactionFilterPanel
                filters={tempFilters}
                onFilterFieldChange={handleFilterFieldChange}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                categories={categoryList}
                accounts={accountList}
                isLoading={isLoading.filters}
              />
            </div>

            {/* Transaction List */}
            <div className={styles.listSection} data-transaction-list>
              <TransactionList
                transactions={transactions}
                pagination={pagination}
                isLoading={isLoading.page}
                error={error}
                onPageChange={handlePageChange}
                onEditRequest={handleEditRequest}
                onDeleteRequest={handleDeleteRequest}
              />
            </div>
          </PageContentContainer>
        </div>
      </main>

      {isModalOpen && (
        <AddEditTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmitSuccess={handleSubmitSuccess}
          mode={editingTransaction ? "edit" : "add"}
          initialData={editingTransaction}
        />
      )}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác."
      />
      <Footer />

      {/* FAB for mobile - add transaction */}
      <FloatingActionButton onClick={handleAddRequest} />
    </div>
  );
};

export default TransactionsPage;
