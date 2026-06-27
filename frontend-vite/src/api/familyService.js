import axiosInstance from "./axiosConfig";

const API_URL = "/families";

export const getFamilies = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

export const createFamily = async (payload) => {
  const response = await axiosInstance.post(API_URL, payload);
  return response.data;
};

export const getFamilyDetail = async (familyId) => {
  const response = await axiosInstance.get(`${API_URL}/${familyId}`);
  return response.data;
};

export const deleteFamily = async (familyId) => {
  const response = await axiosInstance.delete(`${API_URL}/${familyId}`);
  return response.data;
};

export const inviteFamilyMember = async (familyId, email) => {
  const response = await axiosInstance.post(`${API_URL}/${familyId}/invite`, {
    email,
  });
  return response.data;
};

export const deleteFamilyMember = async (familyId, memberId) => {
  const response = await axiosInstance.delete(
    `${API_URL}/${familyId}/members/${memberId}`
  );
  return response.data;
};

export const leaveFamily = async (familyId) => {
  const response = await axiosInstance.post(`${API_URL}/${familyId}/leave`);
  return response.data;
};

export const transferFamilyOwnership = async (familyId, newOwnerId) => {
  const response = await axiosInstance.post(
    `${API_URL}/${familyId}/transfer-ownership`,
    { newOwnerId }
  );
  return response.data;
};

export const getFamilyTransactions = async (familyId, { page = 1, limit = 20 } = {}) => {
  const response = await axiosInstance.get(`${API_URL}/${familyId}/transactions`, {
    params: { page, limit },
  });
  return response.data;
};

export const getFamilyCategoryStats = async (familyId, { period, year, month, date } = {}) => {
  const params = {};
  if (period) params.period = period;
  if (year) params.year = year;
  if (month) params.month = month;
  if (date) params.date = date;
  const response = await axiosInstance.get(`${API_URL}/${familyId}/category-stats`, { params });
  return response.data;
};

export const createFamilyTransaction = async (familyId, payload) => {
  const response = await axiosInstance.post(
    `${API_URL}/${familyId}/transactions`,
    payload
  );
  return response.data;
};

export const updateFamilyTransaction = async (familyId, transactionId, payload) => {
  const response = await axiosInstance.put(
    `${API_URL}/${familyId}/transactions/${transactionId}`,
    payload
  );
  return response.data;
};

export const deleteFamilyTransaction = async (familyId, transactionId) => {
  const response = await axiosInstance.delete(
    `${API_URL}/${familyId}/transactions/${transactionId}`
  );
  return response.data;
};

export const acceptFamilyInvitation = async (invitationId) => {
  const response = await axiosInstance.post(
    `/family-invitations/${invitationId}/accept`
  );
  return response.data;
};

export const rejectFamilyInvitation = async (invitationId) => {
  const response = await axiosInstance.post(
    `/family-invitations/${invitationId}/reject`
  );
  return response.data;
};
