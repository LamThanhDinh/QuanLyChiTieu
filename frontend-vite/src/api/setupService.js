import axiosInstance from "./axiosConfig";

/**
 * Tạo dữ liệu mặc định cho người dùng mới (categories và accounts)
 */
export const createDefaultData = async () => {
  try {
    const response = await axiosInstance.post("/setup/default-data");
    return response.data;
  } catch (error) {
    console.error("Error creating default data:", error);
    throw error;
  }
};

/**
 * Kiểm tra xem người dùng đã có dữ liệu cơ bản chưa
 */
export const checkUserDataStatus = async () => {
  try {
    const response = await axiosInstance.get("/setup/status");
    return response.data;
  } catch (error) {
    console.error("Error checking user data status:", error);
    throw error;
  }
};
