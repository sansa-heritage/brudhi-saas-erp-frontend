// frontend/src/components/services/cylinderService.js
import apiClient from "../../api/client";

// Helper function to extract data from response
const extractData = (response) => {
  if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
    return response.data.data.data;
  }
  if (response?.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
};

// ==================== CYLINDER TYPES API ====================
export const getCylinderTypes = async () => {
  try {
    const response = await apiClient.get("/cylinder-types");
    return extractData(response);
  } catch (error) {
    console.error("Error fetching cylinder types:", error);
    throw error;
  }
};

export const getCylinderTypeById = async (id) => {
  try {
    const response = await apiClient.get(`/cylinder-types/${id}`);
    return response?.data?.data || response?.data || response;
  } catch (error) {
    console.error("Error fetching cylinder type by ID:", error);
    throw error;
  }
};

export const createCylinderType = async (data) => {
  try {
    const response = await apiClient.post("/cylinder-types", data);
    return response.data;
  } catch (error) {
    console.error("Error creating cylinder type:", error);
    throw error;
  }
};

export const updateCylinderType = async (id, data) => {
  try {
    const response = await apiClient.put(`/cylinder-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating cylinder type:", error);
    throw error;
  }
};

export const deleteCylinderType = async (id) => {
  try {
    const response = await apiClient.delete(`/cylinder-types/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting cylinder type:", error);
    throw error;
  }
};

export const getCylinderTypeStats = async () => {
  try {
    const response = await apiClient.get("/cylinder-types/stats");
    return (
      response?.data?.data ||
      response?.data || { totalTypes: 0, activeTypes: 0, inactiveTypes: 0 }
    );
  } catch (error) {
    console.error("Error fetching cylinder type stats:", error);
    return { totalTypes: 0, activeTypes: 0, inactiveTypes: 0 };
  }
};

// ==================== CYLINDER STOCK API ====================
export const getCylinderStock = async () => {
  try {
    const response = await apiClient.get("/cylinders/stock");
    console.log("getCylinderStock response:", response);

    // Handle different response structures
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  } catch (error) {
    console.error("Error fetching cylinder stock:", error);
    return [];
  }
};

export const getCylinderById = async (id) => {
  try {
    const response = await apiClient.get(`/cylinders/${id}`);
    return response?.data?.data || response?.data || response;
  } catch (error) {
    console.error("Error fetching cylinder by ID:", error);
    throw error;
  }
};

export const createCylinder = async (data) => {
  try {
    const response = await apiClient.post("/cylinders", data);
    return response.data;
  } catch (error) {
    console.error("Error creating cylinder:", error);
    throw error;
  }
};

// ✅ ADD THIS ALIAS - addCylinder as an alias for createCylinder
export const addCylinder = createCylinder;

export const updateCylinder = async (id, data) => {
  try {
    const response = await apiClient.put(`/cylinders/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating cylinder:", error);
    throw error;
  }
};

export const deleteCylinder = async (id) => {
  try {
    const response = await apiClient.delete(`/cylinders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting cylinder:", error);
    throw error;
  }
};

export const getCylindersByType = async (typeId) => {
  try {
    const response = await apiClient.get(`/cylinders/type/${typeId}`);
    return extractData(response);
  } catch (error) {
    console.error("Error fetching cylinders by type:", error);
    return [];
  }
};

export const updateCylinderStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/cylinders/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating cylinder status:", error);
    throw error;
  }
};

// ==================== LOW STOCK ALERT API ====================
export const getLowStockAlerts = async () => {
  try {
    const response = await apiClient.get("/cylinders/low-stock");
    return extractData(response);
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    return [];
  }
};

export const getLowStockThreshold = async () => {
  try {
    const response = await apiClient.get("/cylinders/low-stock-threshold");
    return response?.data?.data || response?.data || { threshold: 5 };
  } catch (error) {
    console.error("Error fetching low stock threshold:", error);
    return { threshold: 5 };
  }
};

export const updateLowStockThreshold = async (threshold) => {
  try {
    const response = await apiClient.put("/cylinders/low-stock-threshold", {
      threshold,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating low stock threshold:", error);
    throw error;
  }
};

export const getStockStatistics = async () => {
  try {
    const response = await apiClient.get("/cylinders/statistics");
    return (
      response?.data?.data ||
      response?.data || {
        totalCylinders: 0,
        inStock: 0,
        issued: 0,
        damaged: 0,
        returned: 0,
        lowStockCount: 0,
        lowStockItems: [],
      }
    );
  } catch (error) {
    console.error("Error fetching stock statistics:", error);
    return {
      totalCylinders: 0,
      inStock: 0,
      issued: 0,
      damaged: 0,
      returned: 0,
      lowStockCount: 0,
      lowStockItems: [],
    };
  }
};

// ==================== STOCK TRANSACTIONS API ====================
export const getStockTransactions = async () => {
  try {
    const response = await apiClient.get("/stock-transactions");
    return extractData(response);
  } catch (error) {
    console.error("Error fetching stock transactions:", error);
    return [];
  }
};

export const getStockTransactionById = async (id) => {
  try {
    const response = await apiClient.get(`/stock-transactions/${id}`);
    return response?.data?.data || response?.data || response;
  } catch (error) {
    console.error("Error fetching stock transaction by ID:", error);
    throw error;
  }
};

export const addStockTransaction = async (data) => {
  try {
    const response = await apiClient.post("/stock-transactions", data);
    return response.data;
  } catch (error) {
    console.error("Error creating stock transaction:", error);
    throw error;
  }
};

export const updateStockTransaction = async (id, data) => {
  try {
    const response = await apiClient.put(`/stock-transactions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating stock transaction:", error);
    throw error;
  }
};

export const deleteStockTransaction = async (id) => {
  try {
    const response = await apiClient.delete(`/stock-transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting stock transaction:", error);
    throw error;
  }
};

export const getStockTransactionsByCylinder = async (cylinderId) => {
  try {
    const response = await apiClient.get(
      `/stock-transactions/cylinder/${cylinderId}`,
    );
    return extractData(response);
  } catch (error) {
    console.error("Error fetching stock transactions by cylinder:", error);
    return [];
  }
};

export const getStockTransactionsByDateRange = async (startDate, endDate) => {
  try {
    const response = await apiClient.get(
      `/stock-transactions/date-range?start=${startDate}&end=${endDate}`,
    );
    return extractData(response);
  } catch (error) {
    console.error("Error fetching stock transactions by date range:", error);
    return [];
  }
};

// ==================== BULK OPERATIONS API ====================
export const bulkCreateCylinders = async (data) => {
  try {
    const response = await apiClient.post("/cylinders/bulk", data);
    return response.data;
  } catch (error) {
    console.error("Error in bulk create:", error);
    throw error;
  }
};

export const exportCylinders = async (format = "csv") => {
  try {
    const response = await apiClient.get(`/cylinders/export?format=${format}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting cylinders:", error);
    throw error;
  }
};

export const importCylinders = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/cylinders/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error importing cylinders:", error);
    throw error;
  }
};

// ==================== DASHBOARD STATS API ====================
export const getCylinderDashboardStats = async () => {
  try {
    const response = await apiClient.get("/cylinders/dashboard-stats");
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalTypes: 0,
      totalCylinders: 0,
      totalTransactions: 0,
      inStock: 0,
      issued: 0,
      damaged: 0,
    };
  }
};
