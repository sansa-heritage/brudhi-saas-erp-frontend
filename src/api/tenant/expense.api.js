import apiClient from '../client';

export const getExpenses = () => apiClient.get('/expenses');
export const addExpense = (data) => apiClient.post('/expenses', data);
export const updateExpense = (id, data) => apiClient.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => apiClient.delete(`/expenses/${id}`);
export const getExpenseById = (id) => apiClient.get(`/expenses/${id}`);
