import apiClient from "../client";

// Brands
export const brandApi = {
  getAll: () => apiClient.get("/brands"),
  getById: (id) => apiClient.get(`/brands/${id}`),
  getDropdown: () => apiClient.get("/brands/dropdown"),
  create: (data) => apiClient.post("/brands", data),
  update: (id, data) => apiClient.put(`/brands/${id}`, data),
  delete: (id) => apiClient.delete(`/brands/${id}`),
};

// Cylinder Types
export const cylinderTypeApi = {
  getAll: () => apiClient.get("/cylinder-types"),
  getById: (id) => apiClient.get(`/cylinder-types/${id}`),
  getDropdown: () => apiClient.get("/cylinder-types/dropdown"),
  create: (data) => apiClient.post("/cylinder-types", data),
  update: (id, data) => apiClient.put(`/cylinder-types/${id}`, data),
  delete: (id) => apiClient.delete(`/cylinder-types/${id}`),
};

// Cylinder Rates
export const cylinderRateApi = {
  getAll: () => apiClient.get("/cylinder-rates"),
  getById: (id) => apiClient.get(`/cylinder-rates/${id}`),
  getCurrent: () => apiClient.get("/cylinder-rates/current"),
  getByBrand: (brandId) => apiClient.get(`/cylinder-rates/brand/${brandId}`),
  create: (data) => apiClient.post("/cylinder-rates", data),
  update: (id, data) => apiClient.put(`/cylinder-rates/${id}`, data),
};

// Countries
export const countryApi = {
  getAll: () => apiClient.get("/countries"),
  getById: (id) => apiClient.get(`/countries/${id}`),
  create: (data) => apiClient.post("/countries", data),
  update: (id, data) => apiClient.put(`/countries/${id}`, data),
  delete: (id) => apiClient.delete(`/countries/${id}`),

  toggleStatus: (id) => apiClient.patch(`/countries/toggle-status/${id}`), // Add this

  toggleStatus: (id) => apiClient.patch(`/countries/${id}/toggle-status`), // Add this
};

// States
export const stateApi = {
  getAll: (countryId) => apiClient.get("/states", { params: { countryId } }),
  getById: (id) => apiClient.get(`/states/${id}`),
  getDropdown: (countryId) =>
    apiClient.get("/states/dropdown", { params: { countryId } }),
  create: (data) => apiClient.post("/states", data),
  update: (id, data) => apiClient.put(`/states/${id}`, data),
  delete: (id) => apiClient.delete(`/states/${id}`),
};

// Cities
export const cityApi = {
  getAll: () => apiClient.get("/cities"),
  getById: (id) => apiClient.get(`/cities/${id}`),
  getDropdown: (stateId) =>
    apiClient.get("/cities/dropdown", { params: { stateId } }),
  create: (data) => apiClient.post("/cities", data),
  update: (id, data) => apiClient.put(`/cities/${id}`, data),
  delete: (id) => apiClient.delete(`/cities/${id}`),
};

// Pincodes API - FIXED
export const pincodeApi = {
  getAll: (params) => apiClient.get("/pincodes", { params }),
  getById: (id) => apiClient.get(`/pincodes/${id}`),
  getDropdown: (cityId) => apiClient.get("/pincodes", { params: { cityId } }), // ✅ Fixed: Use getAll with cityId param
  search: (code) => apiClient.get("/pincodes/search", { params: { code } }),
  create: (data) => apiClient.post("/pincodes", data),
  update: (id, data) => apiClient.put(`/pincodes/${id}`, data),
  delete: (id) => apiClient.delete(`/pincodes/${id}`),
};

// Plans API
export const planApi = {
  getAll: (params) => apiClient.get("/superadmin/plans", { params }),
  getById: (id) => apiClient.get(`/superadmin/plans/${id}`),
  create: (data) => apiClient.post("/superadmin/plans", data),
  update: (id, data) => apiClient.put(`/superadmin/plans/${id}`, data),
  delete: (id) => apiClient.delete(`/superadmin/plans/${id}`),
};
