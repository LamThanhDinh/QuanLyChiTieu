import axiosInstance from "./axiosConfig";

// Lấy danh sách tài khoản
export const getAccounts = async ({ startDate, endDate }) => {
  const params = {};
  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  const res = await axiosInstance.get("/accounts", { params });
  return res.data;
};

// Thêm tài khoản mới
export const addAccount = async (data) => {
  const res = await axiosInstance.post("/accounts", data);
  return res.data;
};

// Sửa tài khoản
export const editAccount = async (id, data) => {
  const res = await axiosInstance.put(`/accounts/${id}`, data);
  return res.data;
};

// Xoá tài khoản
export const deleteAccount = async (id) => {
  const res = await axiosInstance.delete(`/accounts/${id}`);
  return res.data;
};

export const getTransactionCountByAccount = async ({
  accountId,
  startDate,
  endDate,
}) => {
  const params = { accountId };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await axiosInstance.get("/transactions", { params });
  return res.data.totalCount || 0;
};
