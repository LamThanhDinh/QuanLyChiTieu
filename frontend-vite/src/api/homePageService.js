import axiosInstance from "./axiosConfig";

// Lấy dữ liệu tổng quan cho StatsOverview
export const getStatsOverview = () => {
  return axiosInstance.get("/statistics/overview");
};

// Lấy dữ liệu cho CategoryExpenseChart
export const getCategoryChartData = (params = {}) => {
  return axiosInstance.get("/statistics/by-category", {
    params,
  });
};
