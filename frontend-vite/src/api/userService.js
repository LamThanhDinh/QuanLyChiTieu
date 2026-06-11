import axiosInstance from "./axiosConfig";

// Export user data
export const exportUserData = async () => {
  const response = await axiosInstance.get("/users/export");
  return response.data;
};

// Import user data
export const importUserData = async (data) => {
  const response = await axiosInstance.post("/users/import", { data });
  return response.data;
};

// Get user profile
export const getUserProfile = async () => {
  const response = await axiosInstance.get("/users/profile");
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const response = await axiosInstance.put("/users/profile", userData);
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await axiosInstance.put(
    "/users/change-password",
    passwordData
  );
  return response.data;
};

// Delete user account
export const deleteUserAccount = async () => {
  const response = await axiosInstance.delete("/users/me");
  return response.data;
};

// Get login history
export const getLoginHistory = async () => {
  const response = await axiosInstance.get("/users/login-history");
  return response.data;
};
