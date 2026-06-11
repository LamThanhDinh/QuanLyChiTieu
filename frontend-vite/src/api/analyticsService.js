import statisticsService from "./statisticsService";
import { getYear, getMonth, startOfWeek } from "date-fns";

/**
 * Lấy dữ liệu cho cả biểu đồ đường và biểu đồ tròn trong DetailedAnalyticsSection
 * @param {string} period - "week", "month", or "year"
 * @param {Date} currentDate - Ngày hiện tại để tính toán khoảng thời gian
 * @returns {Promise<{trendData: any[], categoryData: any[], totalExpense: number}>}
 */
export const getDetailedAnalyticsData = async (period, currentDate) => {
  const year = getYear(currentDate);
  const month = getMonth(currentDate) + 1;
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  // 1. Xây dựng params cho API BIỂU ĐỒ ĐƯỜNG (TREND)
  let trendParams = {};
  if (period === "week") {
    // Backend cần period=day và startDate+days
    trendParams = {
      period: "day",
      startDate: weekStart.toISOString().split("T")[0],
      days: 7,
    };
  } else if (period === "month") {
    // Backend cần period=day và year+month
    trendParams = { period: "day", year, month };
  } else if (period === "year") {
    // Backend cần period=month và year
    trendParams = { period: "month", year };
  }

  // 2. Xây dựng params cho API BIỂU ĐỒ TRÒN (CATEGORY)
  // Logic này giữ nguyên như lần sửa trước đã hoạt động
  let categoryParams = {};
  if (period === "week") {
    categoryParams = {
      period: "week",
      date: weekStart.toISOString().split("T")[0],
    };
  } else if (period === "month") {
    categoryParams = { period: "month", year, month };
  } else if (period === "year") {
    categoryParams = { period: "year", year };
  }
  categoryParams.type = "CHITIEU";

  // 3. Gọi cả hai API song song
  try {
    const [trendResponse, categoryResponse] = await Promise.all([
      statisticsService.getTrendData(trendParams),
      statisticsService.getCategoryData(categoryParams),
    ]);

    const rawCategoryData = categoryResponse || [];
    const totalExpense = rawCategoryData.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const categoryData = rawCategoryData;

    return { trendData: trendResponse || [], categoryData, totalExpense };
  } catch (error) {
    console.error("Error fetching detailed analytics data:", error);
    throw error;
  }
};
