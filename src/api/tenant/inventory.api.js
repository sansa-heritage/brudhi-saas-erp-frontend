import apiClient from '../client';

// Product CRUD Operations - Using correct inventory endpoint
export const getProducts = () => apiClient.get('/inventory'); // Changed from '/products' to '/inventory'
export const getProductById = (id) => apiClient.get(`/inventory/${id}`);
export const createProduct = (data) => apiClient.post('/inventory', data);
export const updateProduct = (id, data) => apiClient.put(`/inventory/${id}`, data);
export const deleteProduct = (id) => apiClient.delete(`/inventory/${id}`);

// Stock Management
export const addStockTransaction = (data) => apiClient.post('/inventory/stock/transactions', data);
export const getStockTransactions = (productId) => apiClient.get(`/inventory/stock/transactions/${productId}`);
export const adjustStock = (data) => apiClient.post('/inventory/stock/adjust', data);

// Stock Alerts
export const getStockAlerts = () => apiClient.get('/inventory/alerts');
export const resolveAlert = (id) => apiClient.put(`/inventory/alerts/${id}/resolve`);

// Stock Transfers
export const createStockTransfer = (data) => apiClient.post('/inventory/transfers', data);
export const completeStockTransfer = (id) => apiClient.put(`/inventory/transfers/${id}/complete`);

// Inventory Reports
export const getInventorySummary = () => apiClient.get('/inventory/summary');

