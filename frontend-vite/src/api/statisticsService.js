// TẠO FILE MỚI: frontend-vite/src/api/statisticsService.js

// ✅ Import axiosInstance từ file cấu hình cùng cấp
import axiosInstance from "./axiosConfig.js";

const getOverviewStats = async (params) => {
  const response = await axiosInstance.get("/statistics/overview", { params });
  return response.data;
};

// Hàm lấy dữ liệu thẻ tổng quan
const getSummaryStats = async (params) => {
  const response = await axiosInstance.get("/statistics/summary", { params });
  return response.data;
};

// Hàm lấy dữ liệu cho biểu đồ xu hướng
const getTrendData = async (params) => {
  const response = await axiosInstance.get("/statistics/trend", { params });
  return response.data;
};

// Hàm lấy dữ liệu cho biểu đồ cơ cấu
const getCategoryData = async (params) => {
  const response = await axiosInstance.get("/statistics/by-category", {
    params,
  });
  return response.data;
};

// Hàm lấy dữ liệu calendar (for TransactionsPage)
const getCalendarData = async (params) => {
  const response = await axiosInstance.get("/statistics/calendar", { params });
  return response.data;
};

// Hàm lấy danh sách giao dịch trong kỳ
const getTransactionsInPeriod = async (params) => {
  const response = await axiosInstance.get("/transactions", { params });
  return response.data;
};

// Thêm hàm xóa giao dịch
const deleteTransaction = async (id) => {
  const response = await axiosInstance.delete(`/transactions/${id}`);
  return response.data;
};

const statisticsService = {
  getSummaryStats,
  getTrendData,
  getCategoryData,
  getCalendarData,
  getTransactionsInPeriod,
  deleteTransaction,
  getOverviewStats,
};

export default statisticsService;
