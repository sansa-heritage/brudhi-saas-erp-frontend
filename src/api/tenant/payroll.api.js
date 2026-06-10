import axios from "axios";
import apiClient from "../client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ============ PAYROLL SERVICES ============

// Get all payrolls
export const getAllPayrolls = () => apiClient.get("/staff/payroll");

// Get payroll by ID
export const getPayrollById = (id) => apiClient.get(`/staff/payroll/${id}`);

// Generate payroll for a staff member
// Generate payroll for a staff member
export const generatePayroll = (data) =>
  apiClient.post("/staff/payroll/generate", data);

// Process payroll payment
export const processPayrollPayment = (id, data) =>
  apiClient.patch(`/staff/payroll/${id}/payment`, data);

// Delete payroll record
export const deletePayroll = (id) => apiClient.delete(`/staff/payroll/${id}`);

// Download Excel Payslip
export const downloadExcelPayslip = (id) =>
  apiClient.get(`/staff/payroll/${id}/download/excel`, {
    responseType: "blob",
  });

// Download PDF Payslip
export const downloadPDFPayslip = (id) => {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("tenant_id");

  return axios.get(`${API_URL}/staff/payroll/${id}/download/pdf`, {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Tenant-Id": tenantId || "",
      Accept: "application/pdf",
    },
  });
};

// View PDF Payslip in browser
export const viewPDFPayslip = (id) =>
  apiClient.get(`/staff/payroll/${id}/view/pdf`, {
    responseType: "blob",
  });
