import apiClient from '../client';

// ==================== CYLINDER TYPES ====================
export const getCylinderTypes = () => apiClient.get('/cylinders/types');
export const getCylinderTypeById = (id) => apiClient.get(`/cylinders/types/${id}`);
export const createCylinderType = (data) => apiClient.post('/cylinders/types', data);
export const updateCylinderType = (id, data) => apiClient.put(`/cylinders/types/${id}`, data);
export const deleteCylinderType = (id) => apiClient.delete(`/cylinders/types/${id}`);
export const getCylinderTypeStats = () => apiClient.get('/cylinders/types/stats');

// ==================== CYLINDER STOCK ====================
export const getCylinders = () => apiClient.get('/cylinders/stock');
export const getCylinderById = (id) => apiClient.get(`/cylinders/stock/${id}`);
export const createCylinder = (data) => apiClient.post('/cylinders/stock', data);
export const updateCylinder = (id, data) => apiClient.put(`/cylinders/stock/${id}`, data);
export const deleteCylinder = (id) => apiClient.delete(`/cylinders/stock/${id}`);
export const updateCylinderStatus = (id, status) => apiClient.patch(`/cylinders/stock/${id}/status`, { status });
export const getCylindersByType = (typeId) => apiClient.get(`/cylinders/stock/type/${typeId}`);

// ==================== LOW STOCK ALERTS ====================
export const getLowStockAlerts = () => apiClient.get('/cylinders/low-stock');
export const getLowStockThreshold = () => apiClient.get('/cylinders/low-stock/threshold');
export const updateLowStockThreshold = (threshold) => apiClient.put('/cylinders/low-stock/threshold', { threshold });

// ==================== STOCK TRANSACTIONS ====================
export const getStockTransactions = () => apiClient.get('/cylinders/transactions');
export const getStockTransactionById = (id) => apiClient.get(`/cylinders/transactions/${id}`);
export const createStockTransaction = (data) => apiClient.post('/cylinders/transactions', data);
export const getStockTransactionsByCylinder = (cylinderId) => apiClient.get(`/cylinders/transactions/cylinder/${cylinderId}`);

// ==================== STATISTICS ====================
export const getStockStatistics = () => apiClient.get('/cylinders/statistics');