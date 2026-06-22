import axiosInstance from "./axiosConfig";

export const getBudgets = async (params = {}) => {
  const response = await axiosInstance.get("/budgets", { params });
  return response.data;
};

export const saveBudget = async (budgetData) => {
  const response = await axiosInstance.post("/budgets", budgetData);
  return response.data;
};

export const updateBudget = async (id, budgetData) => {
  const response = await axiosInstance.put(`/budgets/${id}`, budgetData);
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await axiosInstance.delete(`/budgets/${id}`);
  return response.data;
};

export const getBudgetSuggestions = async (params = {}) => {
  const response = await axiosInstance.get("/budgets/suggestions", { params });
  return response.data;
};

export const applyBudgetSuggestions = async (payload) => {
  const response = await axiosInstance.post(
    "/budgets/apply-suggestions",
    payload
  );
  return response.data;
};
