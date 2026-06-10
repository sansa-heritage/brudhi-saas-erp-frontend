// src/api/tenant/bonus.api.js (or wherever your API file is)

import apiClient from "../client";

// Create new bonus
export const createBonus = (data) => apiClient.post("/staff/bonuses", data);

// Get all bonuses with filters and pagination
export const getBonuses = (filters = {}, pagination = {}) => {
  const params = {
    ...filters,
    page: pagination.page || 1,
    limit: pagination.limit || 10,
  };
  return apiClient.get("/staff/bonuses", { params });
};

// ✅ FIXED - Add /staff prefix
export const getBonusById = (id) => apiClient.get(`/staff/bonuses/${id}`);

// ✅ FIXED - Add /staff prefix
export const updateBonus = (id, data) => apiClient.put(`/staff/bonuses/${id}`, data);

// ✅ FIXED - Add /staff prefix
export const deleteBonus = (id) => apiClient.delete(`/staff/bonuses/${id}`);

// Update bonus status
export const updateBonusStatus = (id, statusData) =>
  apiClient.patch(`/staff/bonuses/${id}/status`, statusData);