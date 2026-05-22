import apiClient from '../client';

export const getDashboard = () => apiClient.get('/dashboard');
export const getAnalytics = () => apiClient.get('/reports');