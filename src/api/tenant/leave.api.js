// frontend/src/api/tenant/salartStructure.api.js (or create a new leave.api.js)

import apiClient from "../client";

// Leave APIs
export const markLeave = (data) => apiClient.post("/staff/mark-leave", data);
export const getStaffLeaveHistory = (
  staffId,
  filters = {},
  pagination = {},
) => {
  const params = {
    ...filters,
    page: pagination.page || 1,
    limit: pagination.limit || 10,
  };
  return apiClient.get(`/staff/leave-history/${staffId}`, { params });
};
export const getAllLeaveHistory = (filters = {}, pagination = {}) => {
  const params = {
    ...filters,
    page: pagination.page || 1,
    limit: pagination.limit || 10,
  };
  return apiClient.get("/staff/leave-history", { params });
};
export const getLeaveSummary = (staffId = null, year = null) => {
  const params = {};
  if (staffId) params.staffId = staffId;
  if (year) params.year = year;
  return apiClient.get("/staff/leave-summary", { params });
};
export const updateLeave = (id, data) =>
  apiClient.put(`/staff/leave/${id}`, data);
export const deleteLeave = (id) => apiClient.delete(`/staff/leave/${id}`);
