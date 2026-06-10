import apiClient from '../client';

export const getStaff = () => apiClient.get('/staffs');
export const createStaff = (data) => apiClient.post('/staff', data);
export const updateStaff = (id, data) => apiClient.put(`/staff/${id}`, data);
export const deleteStaff = (id) => apiClient.delete(`/staff/${id}`);