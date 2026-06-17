// src/api/axiosConfig.js
import axios from "axios";

// Tạo một instance của axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api", // Lấy URL từ file .env
  timeout: 30000, // Timeout 30 giây (tăng để hỗ trợ import/export dữ liệu lớn)
});

// Thêm một "interceptor" để tự động gắn token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response để xử lý lỗi timeout rõ ràng hơn
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED" && error.message?.includes("timeout")) {
      error.message = "Yêu cầu quá thời gian chờ. Vui lòng thử lại.";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
