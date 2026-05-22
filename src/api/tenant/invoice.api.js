import apiClient from '../client';

export const getInvoices = () => apiClient.get('/invoices');
export const createInvoice = (data) => apiClient.post('/invoices', data);
export const updateInvoice = (id, data) => apiClient.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => apiClient.delete(`/invoices/${id}`);
export const getInvoiceById = (id) => apiClient.get(`/invoices/${id}`);

// Add this function for downloading invoice PDF
export const downloadInvoicePDF = (id) => {
  return apiClient.get(`/invoices/${id}/download`, {
    responseType: 'blob'
  });
};
