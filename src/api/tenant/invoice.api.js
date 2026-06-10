// import apiClient from '../client';

// export const getInvoices = () => apiClient.get('/invoices');
// export const createInvoice = (data) => apiClient.post('/invoices', data);
// export const updateInvoice = (id, data) => apiClient.put(`/invoices/${id}`, data);
// export const deleteInvoice = (id) => apiClient.delete(`/invoices/${id}`);
// export const getInvoiceById = (id) => apiClient.get(`/invoices/${id}`);

// // Add this function for downloading invoice PDF
// export const downloadInvoicePDF = (id) => {
//   return apiClient.get(`/invoices/${id}/download`, {
//     responseType: 'blob'
//   });
// };

import apiClient from '../client';

export const getInvoices = () => apiClient.get('/invoices');
export const getInvoiceById = (id) => apiClient.get(`/invoices/${id}`);
export const createInvoice = (data) => apiClient.post('/invoices', data);
export const updateInvoice = (id, data) => apiClient.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => apiClient.delete(`/invoices/${id}`);
// ✅ DOWNLOAD INVOICE
// export const downloadInvoice = async (id, format = "pdf") => {
//   return await apiClient.get(
//     `/invoices/${id}/download?format=${format}`,
//     {
//       responseType: "blob",
//     }
//   );
export const downloadInvoice = (id) =>
  apiClient.get(`/invoices/download/${id}`, {
    responseType: "blob",
  });
