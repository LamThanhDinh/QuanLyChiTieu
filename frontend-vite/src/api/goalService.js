// src/api/goalService.js

import axiosInstance from "./axiosConfig";

// Hàm lấy tất cả mục tiêu, hỗ trợ lọc, sắp xếp, phân trang
export const getGoals = (params) => {
  return axiosInstance.get("/goals", { params });
};

// Hàm xóa một mục tiêu theo ID
export const deleteGoal = (goalId) => {
  return axiosInstance.delete(`/goals/${goalId}`);
};

// Hàm tạo mục tiêu mới
export const createGoal = (goalData) => {
  return axiosInstance.post("/goals", goalData);
};

// Hàm cập nhật mục tiêu
export const updateGoal = (goalId, goalData) => {
  return axiosInstance.put(`/goals/${goalId}`, goalData);
};

// Hàm nạp tiền vào mục tiêu
export const addFundsToGoal = (goalId, fundsData) => {
  return axiosInstance.post(`/goals/${goalId}/add-funds`, fundsData);
};

// Hàm ghim / bỏ ghim một mục tiêu
export const togglePinGoal = (goalId) => {
  return axiosInstance.patch(`/goals/${goalId}/pin`);
};

// Hàm lưu trữ / bỏ lưu trữ một mục tiêu
export const toggleArchiveGoal = (goalId) => {
  return axiosInstance.patch(`/goals/${goalId}/archive`);
};
