import apiClient from "../client";

// Salary Structure APIs
export const createSalaryStructure = (data) =>
  apiClient.post("/staff/salary-structure", data);
export const getSalaryStructure = (staffId) =>
  apiClient.get(`/staff/salary-structure/${staffId}`);
export const getAllSalaryStructures = (filters = {}, pagination = {}) => {
  const params = {
    ...filters,
    page: pagination.page || 1,
    limit: pagination.limit || 10,
  };
  return apiClient.get("/staff/salary-structure", { params });
};
// Add this delete method
export const deleteSalaryStructure = (id) =>
  apiClient.delete(`/staff/salary-structure/${id}`);
