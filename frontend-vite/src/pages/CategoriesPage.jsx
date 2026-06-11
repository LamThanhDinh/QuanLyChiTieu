// frontend-vite/src/pages/CategoriesPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoriesService";
import { getProfile } from "../api/profileService";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";

// Import components
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import HeaderCard from "../components/Common/HeaderCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Button from "../components/Common/Button";
import CategoryList from "../components/Categories/CategoryList";
import AddEditCategoryModal from "../components/Categories/AddEditCategoryModal";
import CategoryAnalysisChart from "../components/Categories/CategoryAnalysisChart";
import DateRangeNavigator from "../components/Common/DateRangeNavigator";
import PageContentContainer from "../components/Common/PageContentContainer";
import CategoryStatsWidget from "../components/Categories/CategoryStatsWidget";
import styles from "../styles/CategoriesPage.module.css";
import headerStyles from "../components/Common/HeaderCard.module.css";
import { getGreeting, getFullDate } from "../utils/timeHelpers";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
  "#3366CC",
  "#DC3912",
];

const CategoriesPage = () => {
  const [searchParams] = useSearchParams();
  const highlightCategoryId = searchParams.get("highlight");

  // States
  const [activeType, setActiveType] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [period, setPeriod] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ THAY THẾ: Lấy thông tin người dùng qua react-query
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getProfile,
    select: (data) => data.data, // Chỉ lấy phần data từ response
    staleTime: 1000 * 60 * 5, // Dữ liệu user được cho là "tươi" trong 5 phút
    refetchOnWindowFocus: "always",
  });

  const userName = userProfile?.fullname || "Bạn";
  const userAvatar = userProfile?.avatar || null;

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = { period };
      if (period === "year") params.year = currentDate.getFullYear();
      if (period === "month") {
        params.year = currentDate.getFullYear();
        params.month = currentDate.getMonth() + 1;
      }
      if (period === "week") {
        params.date = currentDate.toISOString().split("T")[0];
      }

      const data = await getCategories(params);
      setCategoriesData(data || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setCategoriesData([]);
    } finally {
      setIsLoading(false);
    }
  }, [period, currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-highlight từ URL
  useEffect(() => {
    if (highlightCategoryId && categoriesData.length > 0) {
      const categoryToHighlight = categoriesData.find(
        (cat) =>
          cat.id === highlightCategoryId || cat._id === highlightCategoryId
      );
      if (categoryToHighlight) {
        const categoryIndex = categoriesData.indexOf(categoryToHighlight);
        const color = COLORS[categoryIndex % COLORS.length];
        setActiveCategory({
          id: categoryToHighlight.id || categoryToHighlight._id,
          color: color,
          name: categoryToHighlight.name,
        });
      }
    }
  }, [highlightCategoryId, categoriesData]);

  // Tính toán thống kê danh mục cho widget
  const categoryStats = useMemo(() => {
    const totalCategories = categoriesData.length;
    const incomeCategories = categoriesData.filter(
      (cat) => cat.type === "THUNHAP"
    ).length;
    const expenseCategories = categoriesData.filter(
      (cat) => cat.type === "CHITIEU"
    ).length;
    const usedCategories = categoriesData.filter(
      (cat) => (cat.transactionCount || 0) > 0 // ✅ THAY ĐỔI: Dùng transactionCount thay vì totalAmount
    ).length;
    // Tìm danh mục được dùng nhiều nhất
    let mostUsedCategory = null;
    let maxUsage = 0;
    categoriesData.forEach((cat) => {
      const usage = cat.transactionCount || 0; // ✅ THAY ĐỔI: Dùng transactionCount
      if (usage > maxUsage) {
        maxUsage = usage;
        mostUsedCategory = {
          ...cat,
          usageCount: cat.totalAmount, // Giữ totalAmount để hiển thị số tiền
        };
      }
    });
    return {
      totalCategories,
      incomeCategories,
      expenseCategories,
      usedCategories,
      mostUsedCategory,
    };
  }, [categoriesData]);

  // Handlers
  const handlePeriodChange = (newPeriod) => setPeriod(newPeriod);
  const handleDateChange = (newDate) => setCurrentDate(newDate);
  const handleCategoryTypeChange = (newType) => {
    setActiveType(newType);
    setActiveCategory(null);
  };
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSelectCategory = (categoryData) => {
    const currentActiveId = activeCategory ? activeCategory.id : null;
    if (categoryData && categoryData.id === currentActiveId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryData);
    }
  };

  const handleFormSubmit = async (formData) => {
    const isEditing = !!editingCategory;
    const categoryId = isEditing
      ? editingCategory._id || editingCategory.id
      : null;
    const payload = {
      name: formData.name,
      type: formData.type,
      icon: formData.icon,
    };

    try {
      if (isEditing) {
        await updateCategory(categoryId, payload);
      } else {
        await addCategory(payload);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi không xác định khi lưu."
      );
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      fetchData(); // Refresh data after delete
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      throw error; // Re-throw để CategoryList có thể handle error display
    }
  };

  // Data processing
  const { listData, chartData, chartTotal } = useMemo(() => {
    const filteredList =
      activeType === "ALL"
        ? categoriesData
        : categoriesData.filter((cat) => cat.type === activeType);

    const finalChartData = filteredList
      .filter((cat) => cat.totalAmount > 0)
      .map((cat, index) => ({
        id: cat._id || cat.id,
        name: cat.name,
        value: cat.totalAmount,
        icon: cat.icon,
        color: COLORS[index % COLORS.length],
      }));

    const total = finalChartData.reduce((sum, item) => sum + item.value, 0);

    return {
      listData: filteredList,
      chartData: finalChartData,
      chartTotal: total,
    };
  }, [activeType, categoriesData]);

  // === Helper functions cho header (dạng smart content & emoji) ===
  const getCategorySmartContext = () => {
    if (isLoading) return "Đang tải dữ liệu danh mục...";
    if (error) return "Không thể tải dữ liệu danh mục. Vui lòng thử lại.";
    if (!categoriesData || categoriesData.length === 0) {
      return "Hãy bắt đầu thêm danh mục để quản lý thu chi hiệu quả hơn!";
    }
    if (activeType === "THUNHAP") {
      if (categoryStats.incomeCategories === 0)
        return "Chưa có nhóm thu nhập nào. Hãy thêm mới!";
      if (categoryStats.usedCategories === 0)
        return "Bạn có nhóm thu nhập, nhưng chưa có giao dịch nào.";
      const totalIncomeAmount = categoriesData
        .filter((cat) => cat.type === "THUNHAP")
        .reduce((sum, cat) => sum + (cat.totalAmount || 0), 0);
      const totalIncomeTransactions = categoriesData
        .filter((cat) => cat.type === "THUNHAP")
        .reduce((sum, cat) => sum + (cat.transactionCount || 0), 0);
      return `Có ${categoryStats.incomeCategories} nhóm thu nhập, ${totalIncomeTransactions} giao dịch, tổng thu: ${totalIncomeAmount.toLocaleString()} VNĐ.`;
    }
    if (activeType === "CHITIEU") {
      if (categoryStats.expenseCategories === 0)
        return "Chưa có nhóm chi tiêu nào. Hãy thêm mới!";
      if (categoryStats.usedCategories === 0)
        return "Bạn có nhóm chi tiêu, nhưng chưa có giao dịch nào.";
      const totalExpenseAmount = categoriesData
        .filter((cat) => cat.type === "CHITIEU")
        .reduce((sum, cat) => sum + (cat.totalAmount || 0), 0);
      const totalExpenseTransactions = categoriesData
        .filter((cat) => cat.type === "CHITIEU")
        .reduce((sum, cat) => sum + (cat.transactionCount || 0), 0);
      return `Có ${categoryStats.expenseCategories} nhóm chi tiêu, ${totalExpenseTransactions} giao dịch, tổng chi: ${totalExpenseAmount.toLocaleString()} VNĐ.`;
    }
    // ALL
    const totalTransactions = categoriesData.reduce(
      (sum, cat) => sum + (cat.transactionCount || 0),
      0
    );
    return `Có tổng cộng ${categoryStats.totalCategories} nhóm, ${totalTransactions} giao dịch, đã sử dụng ${categoryStats.usedCategories} nhóm.`;
  };

  const getCategoryMoodEmoji = () => {
    if (isLoading) return "📊";
    if (error) return "❌";
    if (!categoriesData || categoriesData.length === 0) return "🗂️";
    if (categoryStats.usedCategories === 0) return "🕑";
    if (activeType === "THUNHAP") return "💰";
    if (activeType === "CHITIEU") return "💸";
    return "📈";
  };

  return (
    <div>
      <Header userName={userName} userAvatar={userAvatar} />
      <Navbar />
      <main className={styles.pageWrapper}>
        <div className={styles.contentContainer}>
          <HeaderCard
            className={styles.categoryPageHeader}
            gridIcon={<FontAwesomeIcon icon={faChartPie} />}
            gridTitle={`${getGreeting()}, ${userName}!`}
            gridSubtitle="Tổng quan thu chi theo nhóm"
            gridStats={
              <CategoryStatsWidget
                categoryStats={categoryStats}
                activeFilter={activeType}
                onFilterChange={handleCategoryTypeChange}
              />
            }
            gridInfo={
              <>
                <div className="smartContext">
                  <span className="contextText">
                    {getCategorySmartContext()}
                  </span>
                  <span className={headerStyles.moodEmoji}>
                    {getCategoryMoodEmoji()}
                  </span>
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
                Thêm danh mục
              </Button>
            }
          />
          <PageContentContainer
            title="Phân tích danh mục"
            titleIcon={faChartPie}
            customLayout={true}
            className={styles.analyticsSection}
            dateProps={{
              period,
              currentDate,
              onDateChange: handleDateChange,
              onPeriodChange: handlePeriodChange,
            }}
            headerExtra={
              <fieldset className={styles.typeFilterFieldset}>
                <legend className={styles.typeFilterLegend}>
                  Loại danh mục
                </legend>
                <div className={styles.typeFilterButtons}>
                  <button
                    className={activeType === "ALL" ? styles.active : ""}
                    onClick={() => handleCategoryTypeChange("ALL")}
                  >
                    Tất cả
                  </button>
                  <button
                    className={activeType === "THUNHAP" ? styles.active : ""}
                    onClick={() => handleCategoryTypeChange("THUNHAP")}
                  >
                    Thu nhập
                  </button>
                  <button
                    className={activeType === "CHITIEU" ? styles.active : ""}
                    onClick={() => handleCategoryTypeChange("CHITIEU")}
                  >
                    Chi tiêu
                  </button>
                </div>
              </fieldset>
            }
          >
            <div className={styles.contentRow}>
              <div className={styles.chartContainer}>
                <CategoryAnalysisChart
                  data={chartData}
                  total={chartTotal}
                  loading={isLoading}
                  error={error}
                  categoryType={activeType}
                  period={period}
                  currentDate={currentDate}
                  onPeriodChange={handlePeriodChange}
                  onDateChange={handleDateChange}
                  onActiveCategoryChange={handleSelectCategory}
                />
              </div>

              <div className={styles.listContainer}>
                <CategoryList
                  onEditCategory={handleOpenEditModal}
                  onDeleteCategory={handleDeleteCategory}
                  onDeleteSuccess={fetchData}
                  categories={listData}
                  isLoading={isLoading}
                  error={error}
                  activeCategory={activeCategory}
                  onSelectCategory={handleSelectCategory}
                  chartData={chartData}
                />
              </div>
            </div>
          </PageContentContainer>

          <AddEditCategoryModal
            isOpen={isModalOpen}
            mode={editingCategory ? "edit" : "add"}
            initialData={editingCategory}
            categoryType={activeType}
            onClose={handleCloseModal}
            onSubmit={handleFormSubmit}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
