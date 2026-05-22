import apiClient from '../client';

export const getSalesReport = () => apiClient.get('/reports/sales');
export const getStockReport = () => apiClient.get('/reports/stock');
export const getFinancialReport = () => apiClient.get('/reports/financial');