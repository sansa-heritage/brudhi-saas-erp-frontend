import apiClient from '../client';

export const getTenants = () => apiClient.get('/superadmin/tenants');
export const getTenantById = (id) => apiClient.get(`/superadmin/tenants/${id}`);
export const createTenant = (data) => apiClient.post('/superadmin/tenants', data);
export const updateTenant = (id, data) => apiClient.put(`/superadmin/tenants/${id}`, data);
export const deleteTenant = (id) => apiClient.delete(`/superadmin/tenants/${id}`);
export const backupTenant = (id) => apiClient.post(`/superadmin/tenants/${id}/backup`);

// Tenant Subscription API endpoints
export const tenantSubscriptionApi = {
  // Get current subscription for the logged-in tenant
  getCurrentSubscription: () => apiClient.get('/tenant/subscriptions/current'),
  
  // Get subscription history for the logged-in tenant
  getSubscriptionHistory: (page = 1, limit = 10) => 
    apiClient.get(`/tenant/subscriptions/history?page=${page}&limit=${limit}`),
  
  // Create a new subscription for the logged-in tenant
  createSubscription: (data) => apiClient.post('/tenant/subscriptions', data),
  
  // Renew an existing subscription
  renewSubscription: (subscriptionId, data) => 
    apiClient.post(`/tenant/subscriptions/${subscriptionId}/renew`, data),
  
  // Cancel an active subscription
  cancelSubscription: (subscriptionId) => 
    apiClient.post(`/tenant/subscriptions/${subscriptionId}/cancel`),

  // Get invoices for the logged-in tenant
  getInvoices: (page = 1, limit = 10) => 
    apiClient.get(`/tenant/subscriptions/invoices?page=${page}&limit=${limit}`),

  // ============ ADMIN ENDPOINTS (Super Admin only) ============
  
  // Get all subscriptions across all tenants (with filters)
  adminGetAllSubscriptions: (filters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    return apiClient.get(`/tenant/subscriptions/admin/all?${params}`);
  },
  
  // Get subscription statistics for dashboard
  adminGetSubscriptionStats: () => apiClient.get('/tenant/subscriptions/admin/stats'),
  
  // Get subscriptions that are expiring soon
  adminGetExpiringSubscriptions: (days = 7) => 
    apiClient.get(`/tenant/subscriptions/admin/expiring?days=${days}`),
  
  // Get a specific subscription by ID (admin)
  adminGetSubscriptionById: (id) => apiClient.get(`/tenant/subscriptions/admin/${id}`),
  
  // Create a subscription for a specific tenant (admin)
  adminCreateSubscription: (data) => apiClient.post('/tenant/subscriptions/admin/create', data),
  
  // Update a subscription (admin)
  adminUpdateSubscription: (id, data) => apiClient.put(`/tenant/subscriptions/admin/${id}`, data),
  
  // Delete a subscription (admin)
  adminDeleteSubscription: (id) => apiClient.delete(`/tenant/subscriptions/admin/${id}`),
  
  // Get all subscriptions for a specific tenant (admin)
  adminGetTenantSubscriptions: (tenantId, page = 1, limit = 10) => 
    apiClient.get(`/tenant/subscriptions/admin/tenant/${tenantId}?page=${page}&limit=${limit}`),
  
  // Get subscription by tenant ID (admin)
  adminGetSubscriptionByTenant: (tenantId) => 
    apiClient.get(`/tenant/subscriptions/admin/tenant/${tenantId}/current`),
};

// Individual exports for convenience
export const getCurrentSubscription = () => apiClient.get('/tenant/subscriptions/current');
export const getSubscriptionHistory = (page = 1, limit = 10) => 
  apiClient.get(`/tenant/subscriptions/history?page=${page}&limit=${limit}`);
export const createSubscription = (data) => apiClient.post('/tenant/subscriptions', data);
export const renewSubscription = (subscriptionId, data) => 
  apiClient.post(`/tenant/subscriptions/${subscriptionId}/renew`, data);
export const cancelSubscription = (subscriptionId) => 
  apiClient.post(`/tenant/subscriptions/${subscriptionId}/cancel`);
export const getInvoices = (page = 1, limit = 10) => 
  apiClient.get(`/tenant/subscriptions/invoices?page=${page}&limit=${limit}`);

// Admin individual exports
export const adminGetAllSubscriptions = (filters = {}, page = 1, limit = 10) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  return apiClient.get(`/tenant/subscriptions/admin/all?${params}`);
};
export const adminGetSubscriptionStats = () => apiClient.get('/tenant/subscriptions/admin/stats');
export const adminGetExpiringSubscriptions = (days = 7) => 
  apiClient.get(`/tenant/subscriptions/admin/expiring?days=${days}`);
export const adminGetSubscriptionById = (id) => apiClient.get(`/tenant/subscriptions/admin/${id}`);
export const adminCreateSubscription = (data) => apiClient.post('/tenant/subscriptions/admin/create', data);
export const adminUpdateSubscription = (id, data) => apiClient.put(`/tenant/subscriptions/admin/${id}`, data);
export const adminDeleteSubscription = (id) => apiClient.delete(`/tenant/subscriptions/admin/${id}`);
export const adminGetTenantSubscriptions = (tenantId, page = 1, limit = 10) => 
  apiClient.get(`/tenant/subscriptions/admin/tenant/${tenantId}?page=${page}&limit=${limit}`);
export const adminGetSubscriptionByTenant = (tenantId) => 
  apiClient.get(`/tenant/subscriptions/admin/tenant/${tenantId}/current`);