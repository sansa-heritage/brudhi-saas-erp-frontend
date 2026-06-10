// src/api/tenant/overtime.api.js

import apiClient from "../client";

// Create new overtime request
export const createOvertimeRequest = (data) =>
  apiClient.post("/staff/overtime", data);

// Get all overtime requests with filters and pagination
export const getOvertimeRequests = (filters = {}, pagination = {}) => {
  const params = {
    ...filters,
    page: pagination.page || 1,
    limit: pagination.limit || 10,
  };
  return apiClient.get("/staff/overtime", { params });
};

// Get overtime request by ID
export const getOvertimeRequestById = (id) =>
  apiClient.get(`/staff/overtime/${id}`);

// Update overtime request
export const updateOvertimeRequest = (id, data) =>
  apiClient.put(`/staff/overtime/${id}`, data);

// Delete overtime request
// ✅ ADD THIS - Delete overtime request
export const deleteOvertimeRequest = (id) =>
  apiClient.delete(`/staff/overtime/${id}`);

// Update overtime status
export const updateOvertimeStatus = (id, statusData) =>
  apiClient.patch(`/staff/overtime/${id}/status`, statusData);
