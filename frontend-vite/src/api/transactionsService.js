import axiosInstance from "./axiosConfig";

const API_URL = "/transactions";

/**
 * Lấy danh sách giao dịch có phân trang và bộ lọc.
 * @param {number} page - Trang hiện tại.
 * @param {number} limit - Số lượng mục trên mỗi trang.
 * @param {object} filters - Đối tượng chứa các bộ lọc (VD: { categoryId: '...' }).
 * @returns {Promise<Object>} - Dữ liệu trả về từ API.
 */
export const getTransactions = (page = 1, limit = 5, filters = {}) => {
  return axiosInstance.get(API_URL, {
    params: { page, limit, ...filters },
  });
};

/**
 * Xóa một giao dịch.
 * @param {string} transactionId - ID của giao dịch cần xóa.
 * @returns {Promise<Object>} - Dữ liệu trả về từ API.
 */
export const deleteTransaction = (transactionId) => {
  return axiosInstance.delete(`${API_URL}/${transactionId}`);
};

/**
 * Thêm một giao dịch mới.
 * @param {object} transactionData - Dữ liệu giao dịch mới.
 * @returns {Promise<object>} - Dữ liệu trả về từ API.
 */
export const addTransaction = (transactionData) => {
  return axiosInstance.post(API_URL, transactionData);
};

/**
 * Cập nhật một giao dịch.
 * @param {string} transactionId - ID của giao dịch cần cập nhật.
 * @param {object} transactionData - Dữ liệu giao dịch mới.
 * @returns {Promise<object>} - Dữ liệu trả về từ API.
 */
export const updateTransaction = (transactionId, transactionData) => {
  return axiosInstance.put(`${API_URL}/${transactionId}`, transactionData);
};
