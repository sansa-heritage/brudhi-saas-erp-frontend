import apiClient from '../client';

export const login = (data) => apiClient.post('/auth/login', data);
export const logout = () => apiClient.post('/auth/logout');
export const getProfile = () => apiClient.get('/auth/profile');