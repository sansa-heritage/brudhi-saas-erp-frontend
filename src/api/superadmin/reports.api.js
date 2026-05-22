import apiClient from '../client';

export const getRevenueReport = () => apiClient.get('/reports/revenue');
export const getTenantGrowth = () => apiClient.get('/reports/tenants');
export const getUserActivity = () => apiClient.get('/reports/users');