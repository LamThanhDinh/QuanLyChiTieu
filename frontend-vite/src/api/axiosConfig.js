// src/api/axiosConfig.js
import axios from "axios";

// Tạo một instance của axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api", // Lấy URL từ file .env
  timeout: 15000, // Timeout 15 giây
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

export default axiosInstance;
