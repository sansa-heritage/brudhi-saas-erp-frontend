import apiClient from "../client";

// Get tenant ID from localStorage or context
const getTenantId = () => {
  return localStorage.getItem("tenantId") || sessionStorage.getItem("tenantId");
};

// Regular report endpoints (these use authentication middleware)
export const getSalesReport = (fromDate, toDate) => {
  const params = new URLSearchParams({
    fromDate: fromDate,
    toDate: toDate,
  });
  return apiClient.get(`/reports/sales?${params.toString()}`);
};
export const getStockReport = () => apiClient.get("/reports/stock");
export const getFinancialReport = () => apiClient.get("/reports/financial");

// Export endpoints (need explicit tenant ID)
// Export endpoints (need explicit tenant ID)
export const exportSalesReport = async (format, fromDate, toDate) => {
  console.log("=== exportSalesReport called ===");
  console.log("Format:", format);
  console.log("From Date:", fromDate);
  console.log("To Date:", toDate);
  
  const tenantId = getTenantId();
  console.log("Tenant ID:", tenantId);
  
  const params = new URLSearchParams({
    format: format,
    fromDate: fromDate,
    toDate: toDate,
    tenantId: tenantId
  });
  
  const url = `/reports/export/sales?${params.toString()}`;
  console.log("Request URL:", url);
  
  const response = await apiClient.get(url, {
    responseType: 'blob'
  });
  
  console.log("Response received, status:", response.status);
  console.log("Response headers:", response.headers);
  
  return response;
};


export const exportExpensesReport = async (format, fromDate, toDate) => {
  const tenantId = getTenantId();
  const params = new URLSearchParams({
    format: format,
    fromDate: fromDate,
    toDate: toDate,
    tenantId: tenantId,
  });

  const response = await apiClient.get(
    `/reports/export/expenses?${params.toString()}`,
    {
      responseType: "blob",
    },
  );

  return response;
};

export const exportFinancialReport = async (format, fromDate, toDate) => {
  const tenantId = getTenantId();
  const params = new URLSearchParams({
    format: format,
    fromDate: fromDate,
    toDate: toDate,
    tenantId: tenantId,
  });

  const response = await apiClient.get(
    `/reports/export/financial?${params.toString()}`,
    {
      responseType: "blob",
    },
  );

  return response;
};

export const exportCustomerReport = async (
  customerId,
  format,
  fromDate,
  toDate,
) => {
  const tenantId = getTenantId();
  const params = new URLSearchParams({
    format: format,
    fromDate: fromDate,
    toDate: toDate,
    tenantId: tenantId,
  });

  const response = await apiClient.get(
    `/reports/export/customer/${customerId}?${params.toString()}`,
    {
      responseType: "blob",
    },
  );

  return response;
};
