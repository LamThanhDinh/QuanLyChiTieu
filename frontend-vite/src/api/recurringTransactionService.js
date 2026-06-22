import axiosInstance from "./axiosConfig";

const API_URL = "/recurring-transactions";

export const getRecurringTransactions = async (params = {}) => {
  const response = await axiosInstance.get(API_URL, { params });
  return response.data;
};

export const getGeneratedTransactions = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}/generated-transactions`);
  return response.data;
};

export const createRecurringTransaction = async (payload) => {
  const response = await axiosInstance.post(API_URL, payload);
  return response.data;
};

export const updateRecurringTransaction = async (id, payload) => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, payload);
  return response.data;
};

export const deleteRecurringTransaction = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};

export const runRecurringTransaction = async (id) => {
  const response = await axiosInstance.post(`${API_URL}/${id}/run`);
  return response.data;
};

export const processDueRecurringTransactions = async () => {
  const response = await axiosInstance.post(`${API_URL}/process-due`);
  return response.data;
};
