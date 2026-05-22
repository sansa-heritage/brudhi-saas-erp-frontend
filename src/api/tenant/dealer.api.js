import apiClient from '../client';

export const getDealers = () => apiClient.get('/dealers');
export const createDealer = (data) => apiClient.post('/dealers', data);
export const updateDealer = (id, data) => apiClient.put(`/dealers/${id}`, data);
export const deleteDealer = (id) => apiClient.delete(`/dealers/${id}`);