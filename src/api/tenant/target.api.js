// src/api/tenant/target.api.js

import apiClient from "../client";

export const getStaffTargets = async (filters = {}, pagination = {}) => {
  const params = new URLSearchParams();

  Object.keys(filters).forEach((key) => {
    if (filters[key]) params.append(key, filters[key]);
  });

  if (pagination.page) params.append("page", pagination.page);
  if (pagination.limit) params.append("limit", pagination.limit);

  const queryString = params.toString();
  const url = `/staff/targets${queryString ? `?${queryString}` : ""}`;

  return await apiClient.get(url);
};

export const getStaffTargetById = async (id) => {
  return await apiClient.get(`/staff-targets/${id}`);
};

export const createStaffTarget = async (targetData) => {
  return await apiClient.post("/staff/targets", targetData);
};

// export const updateTargetAchievement = async (id, achievementData) => {
//   return await apiClient.put(
//     `/staff/targets/${id}/achievement`,
//     achievementData,
//   );
// };


export const updateTargetAchievement = async (id, achievementData) => {
  // Using PATCH method as defined in your backend
  return await apiClient.patch(`/staff/targets/${id}/achievement`, {
    achieved_amount: achievementData.achieved_amount,
    month: achievementData.month,
    created_by: achievementData.created_by
  });
};

export const updateStaffTarget = async (id, targetData) => {
  return await apiClient.put(`/staff-targets/${id}`, targetData);
};

export const deleteTarget = async (id) => {
  // Fixed: Use /staff/targets/ (with slash) instead of /staff-targets/ (with hyphen)
  return await apiClient.delete(`/staff/targets/${id}`);
};
