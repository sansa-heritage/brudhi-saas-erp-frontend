import apiClient from '../client';

export const getStats = () => apiClient.get('/dashboard/stats');
export const getCharts = () => apiClient.get('/dashboard/charts');