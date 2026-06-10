import apiClient from "../client";

// Get Company Settings
export const getCompanySettings = async () => {
  return await apiClient.get("/company-settings");
};

// Update Company Settings
export const updateCompanySettings = async (data) => {
  return await apiClient.put("/company-settings", data);
};