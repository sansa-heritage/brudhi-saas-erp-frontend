import apiClient from '../client';

export const getPlans = () => apiClient.get('/superadmin/plans');
export const createPlan = (data) => apiClient.post('/superadmin/plans', data);
export const updatePlan = (id, data) => apiClient.put(`/superadmin/plans/${id}`, data);
export const deletePlan = (id) => apiClient.delete(`/superadmin/plans/${id}`);