// frontend-vite/src/api/categoriesService.js

// ✅ SỬA ĐỔI: Import axiosInstance đã được cấu hình sẵn từ file của bạn.
import axiosInstance from "./axiosConfig.js";

/**
 * Lấy danh sách danh mục từ server.
 * @param {object} params - Các query params như { type, date, period, year, month }.
 * @returns {Promise<Array>} - Promise trả về mảng các danh mục.
 */
export const getCategories = async (params = {}) => {
  try {
    // ✅ SỬA ĐỔI: Sử dụng axiosInstance.get
    // Base URL đã được cấu hình trong axiosInstance, nên ta chỉ cần đường dẫn tương đối.
    const response = await axiosInstance.get("/categories", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

/**
 * Thêm một danh mục mới.
 * @param {object} categoryData - Dữ liệu của danh mục mới { name, type, icon }.
 * @returns {Promise<object>} - Promise trả về danh mục vừa được tạo.
 */
export const addCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post("/categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

/**
 * Cập nhật một danh mục.
 * @param {string} id - ID của danh mục cần cập nhật.
 * @param {object} categoryData - Dữ liệu cập nhật.
 * @returns {Promise<object>} - Promise trả về danh mục đã được cập nhật.
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

/**
 * Xóa một danh mục.
 * @param {string} id - ID của danh mục cần xóa.
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  try {
    await axiosInstance.delete(`/categories/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
