// frontend-vite/src/components/DetailedAnalyticsSection/DetailedAnalyticsSection.jsx
import React, { useState, useEffect, useRef } from "react";
import IncomeExpenseTrendChart from "./IncomeExpenseTrendChart";
import CategoryExpenseChart from "./CategoryExpenseChart";
import styles from "./DetailedAnalyticsSection.module.css";
import { Link } from "react-router-dom";
import { getYear, getMonth, startOfWeek } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartArea } from "@fortawesome/free-solid-svg-icons";
// MỚI: Import service đã được trừu tượng hóa
import { getDetailedAnalyticsData } from "../../api/analyticsService";
// MỚI: import service riêng lẻ
import statisticsService from "../../api/statisticsService";
// MỚI: Import component điều hướng
import DateRangeNavigator from "../Common/DateRangeNavigator";

const DetailedAnalyticsSection = ({ onCategorySelect }) => {
  // State cho bộ lọc thời gian - Mặc định hiển thị theo tháng
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState("month"); // Có thể thay đổi thành "week" hoặc "year" nếu muốn

  // State cho dữ liệu của cả 2 biểu đồ
  const [trendData, setTrendData] = useState([]);
  const [baseTrendData, setBaseTrendData] = useState([]); // Dữ liệu gốc (toàn bộ thu nhập/chi tiêu)
  const [categoryData, setCategoryData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  // State chung cho loading và error
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  // State quản lý danh mục được chọn
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeCategoryName, setActiveCategoryName] = useState(null);
  const [activeCategoryTotal, setActiveCategoryTotal] = useState(0);

  const isInitialMount = useRef(true);

  // useEffect 1: Fetch CẢ HAI khi đổi khoảng thời gian (period, currentDate)
  useEffect(() => {
    const fetchBaseData = async () => {
      setIsLoadingTrend(true);
      setIsLoadingCategories(true);
      setError(null);

      try {
        const { trendData, categoryData, totalExpense } =
          await getDetailedAnalyticsData(period, currentDate, null); // Luôn fetch trend chung ban đầu
        setTrendData(trendData);
        setBaseTrendData(trendData); // Lưu dữ liệu gốc
        setCategoryData(categoryData);
        setTotalExpense(totalExpense);
      } catch (err) {
        setError("Không thể tải dữ liệu.");
        console.error(err);
      } finally {
        setIsLoadingTrend(false);
        setIsLoadingCategories(false);
      }
    };

    fetchBaseData();
  }, [period, currentDate]);

  // useEffect 2: Fetch CHỈ BIỂU ĐỒ ĐƯỜNG khi chọn/bỏ chọn category
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Thông báo cho component cha về sự thay đổi category
    if (onCategorySelect) {
      onCategorySelect(activeCategoryId);
    }

    const fetchTrendOnly = async () => {
      setIsLoadingTrend(true);
      setError(null);
      try {
        const year = getYear(currentDate);
        const month = getMonth(currentDate) + 1;
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

        if (!activeCategoryId) {
          // Nếu bỏ chọn category, quay về dữ liệu gốc
          setTrendData(baseTrendData);
        } else {
          // Nếu chọn category, fetch dữ liệu chi tiêu riêng cho category đó
          let trendParams = {};
          if (period === "week") {
            trendParams = {
              period: "day",
              startDate: weekStart.toISOString().split("T")[0],
              days: 7,
              categoryId: activeCategoryId,
            };
          } else if (period === "month") {
            trendParams = {
              period: "day",
              year,
              month,
              categoryId: activeCategoryId,
            };
          } else if (period === "year") {
            trendParams = {
              period: "month",
              year,
              categoryId: activeCategoryId,
            };
          }

          const categoryTrendRes =
            await statisticsService.getTrendData(trendParams);

          // Kết hợp dữ liệu: giữ thu nhập từ baseTrendData, chi tiêu từ categoryTrendRes
          const combinedData = baseTrendData.map((baseItem) => {
            const categoryItem = categoryTrendRes?.find(
              (catItem) => catItem.name === baseItem.name
            );
            return {
              ...baseItem,
              expense: categoryItem ? categoryItem.expense : 0, // Chi tiêu của category hoặc 0
              income: baseItem.income, // Giữ nguyên thu nhập
            };
          });

          setTrendData(combinedData);
        }
      } catch (err) {
        setError("Lỗi cập nhật biểu đồ xu hướng.");
        console.error(err);
      } finally {
        setIsLoadingTrend(false);
      }
    };

    fetchTrendOnly();
  }, [activeCategoryId, baseTrendData]); // Thêm baseTrendData vào dependency

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setCurrentDate(new Date());
    setActiveCategoryId(null);
    setActiveCategoryName(null);
    setActiveCategoryTotal(0);
  };

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
    setActiveCategoryId(null);
    setActiveCategoryName(null);
    setActiveCategoryTotal(0);
  };

  const handleCategorySelect = (sliceData, index) => {
    // Khi click vào nút ✕ hoặc reset, sliceData sẽ là null
    if (!sliceData) {
      setActiveCategoryId(null);
      setActiveCategoryName(null);
      setActiveCategoryTotal(0);
      return;
    }

    // Lấy id từ sliceData (_id hoặc id)
    const categoryId = sliceData._id || sliceData.id;

    // Nếu click vào slice đã được chọn, thì reset
    if (categoryId === activeCategoryId) {
      setActiveCategoryId(null);
      setActiveCategoryName(null);
      setActiveCategoryTotal(0);
    } else {
      // Chọn slice mới
      setActiveCategoryId(categoryId);
      setActiveCategoryName(sliceData.name);
      setActiveCategoryTotal(sliceData.value || 0);
    }
  };

  const getDynamicTitle = () => {
    switch (period) {
      case "week":
        return "Phân Tích Chi Tiêu Tuần Này";
      case "month":
        return `Phân Tích Chi Tiêu ${currentDate.toLocaleDateString("vi-VN", {
          month: "long",
          year: "numeric",
        })}`;
      case "year":
        return `Phân Tích Chi Tiêu Năm ${currentDate.getFullYear()}`;
      default:
        return "Phân Tích Chi Tiêu";
    }
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        {/* Nhóm Title và Period Info */}
        <div className={styles.titleGroup}>
          <h2 className={styles.analyticsTitle}>
            <FontAwesomeIcon icon={faChartArea} className={styles.titleIcon} />
            {getDynamicTitle()}
          </h2>
          <div className={styles.periodInfo}>
            <span className={styles.periodLabel}>
              Đang xem:{" "}
              {period === "week"
                ? "Tuần"
                : period === "month"
                  ? "Tháng"
                  : "Năm"}
            </span>
          </div>
        </div>

        {/* Nhóm Filter Controls */}
        <div className={styles.filterGroup}>
          <DateRangeNavigator
            period={period}
            currentDate={currentDate}
            onPeriodChange={handlePeriodChange}
            onDateChange={handleDateChange}
          />
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.trendChartContainer}>
          {/* Cấp thấp nhất (H3): Title của component biểu đồ con */}
          <h3 className={styles.chartTitle}>
            {activeCategoryName
              ? `Xu hướng thu nhập và chi tiêu - ${activeCategoryName}`
              : "Xu hướng thu nhập và chi tiêu theo ngày"}
          </h3>
          {activeCategoryName && (
            <div className={styles.categoryNote}>
              <p className={styles.noteText}>
                <strong>Ghi chú:</strong> Đường thu nhập (nét đứt) hiển thị tổng
                thu nhập chung, đường chi tiêu (nét liền) hiển thị chi tiêu
                riêng cho danh mục "{activeCategoryName}" (Tổng:{" "}
                {activeCategoryTotal.toLocaleString("vi-VN")} ₫).
              </p>
            </div>
          )}
          <IncomeExpenseTrendChart
            data={trendData}
            period={period}
            loading={isLoadingTrend}
            error={error}
            categoryName={activeCategoryName}
            categoryId={activeCategoryId}
          />
        </div>
        <div className={styles.categoryChartContainer}>
          {/* Cấp thấp nhất (H3): Title của component biểu đồ con */}
          <h3 className={styles.chartTitle}>Phân bổ chi tiêu theo danh mục</h3>
          <CategoryExpenseChart
            data={categoryData}
            total={totalExpense}
            loading={isLoadingCategories}
            error={error}
            onSliceClick={handleCategorySelect}
            activeCategoryId={activeCategoryId}
            activeCategoryName={activeCategoryName}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalyticsSection;
