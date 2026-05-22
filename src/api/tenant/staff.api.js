import apiClient from '../client';

// Staff CRUD Operations - Use consistent endpoints
export const getStaff = () => apiClient.get('/staffs');  // GET all staff
export const getStaffById = (id) => apiClient.get(`/staffs/${id}`);  // GET single staff
export const createStaff = (data) => apiClient.post('/staffs', data);  // Changed from /staff to /staffs
export const updateStaff = (id, data) => apiClient.put(`/staffs/${id}`, data);  // Changed from /staff to /staffs
export const deleteStaff = (id) => apiClient.delete(`/staffs/${id}`);  // Changed from /staff to /staffs

// Role Management
export const getRoles = () => apiClient.get('/staffs/roles');
export const createRole = (data) => apiClient.post('/staffs/roles', data);
export const updateRole = (id, data) => apiClient.put(`/staffs/roles/${id}`, data);
export const deleteRole = (id) => apiClient.delete(`/staffs/roles/${id}`);

// Permission Management
export const getAllPermissions = () => apiClient.get('/staffs/permissions');
export const getRolePermissions = (roleId) => apiClient.get(`/staffs/roles/${roleId}/permissions`);
export const assignPermissionsToRole = (roleId, permissions) => 
  apiClient.post(`/staffs/roles/${roleId}/permissions`, { permissions });

// Staff Status Management
export const activateStaff = (id) => apiClient.patch(`/staffs/${id}/activate`);
export const deactivateStaff = (id) => apiClient.patch(`/staffs/${id}/deactivate`);
export const blockStaff = (id) => apiClient.patch(`/staffs/${id}/block`);