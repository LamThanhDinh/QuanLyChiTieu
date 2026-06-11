import axiosInstance from "./axiosConfig";

export const login = ({ username, password }) =>
  axiosInstance.post("/auth/login", { username, password });

export const register = (userData) =>
  axiosInstance.post("/auth/register", userData);

export const forgotPassword = (email) =>
  axiosInstance.post("/auth/forgot-password", { email });

export const resetPassword = ({ email, resetToken, newPassword }) =>
  axiosInstance.post("/auth/reset-password", { email, resetToken, newPassword });
