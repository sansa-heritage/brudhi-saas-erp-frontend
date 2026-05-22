// frontend/src/components/services/subscriptionService.js
import apiClient from '../client';

// ===============================
// 📋 SUBSCRIPTION CRUD OPERATIONS
// ===============================

// Get all subscriptions
export const getSubscriptions = () => apiClient.get('/subscriptions');

// Get subscription by ID
export const getSubscriptionById = (id) => apiClient.get(`/subscriptions/${id}`);

// ✅ ADD THIS - Get current subscription for tenant (using your API endpoint)
export const getSubscription = (tenantId) => apiClient.get(`/subscriptions/tenant?tenantId=${tenantId}`);

// Get current subscription for tenant
export const getCurrentSubscription = (tenantId) => apiClient.get(`/subscriptions/tenant?tenantId=${tenantId}`);

// Create new subscription
export const createSubscription = (data) => apiClient.post('/subscriptions', data);

// Update subscription
export const updateSubscription = (id, data) => apiClient.put(`/subscriptions/${id}`, data);

// Delete subscription
export const deleteSubscription = (id) => apiClient.delete(`/subscriptions/${id}`);

// ===============================
// 🔄 SUBSCRIPTION ACTIONS
// ===============================

// ✅ ADD THIS - Upgrade plan (using your API endpoints)
export const upgradePlan = (planData) => apiClient.post('/subscriptions/upgrade', planData);

// Cancel subscription
export const cancelSubscription = (id, data) => apiClient.post(`/subscriptions/${id}/cancel`, data);

// Renew subscription
export const renewSubscription = (id, data) => apiClient.post(`/subscriptions/${id}/renew`, data);

// Change subscription plan
export const changeSubscriptionPlan = (id, data) => apiClient.put(`/subscriptions/${id}/change-plan`, data);

// Record payment for subscription
export const recordSubscriptionPayment = (id, paymentData) => 
  apiClient.post(`/subscriptions/${id}/payments`, paymentData);

// Update expired subscriptions
export const updateExpiredSubscriptions = () => 
  apiClient.post('/subscriptions/update-expired');

// ===============================
// 📊 STATISTICS & REPORTS
// ===============================

// Get subscription statistics
export const getSubscriptionStats = () => apiClient.get('/subscriptions/statistics');

// Get subscription usage report
export const getSubscriptionUsage = (tenantId) => apiClient.get(`/subscriptions/usage/${tenantId}`);

// ===============================
// 🎯 PLANS MANAGEMENT
// ===============================

// Get all subscription plans
export const getPlans = () => apiClient.get('/subscriptions/plans');

// Get plan by ID
export const getPlanById = (id) => apiClient.get(`/subscriptions/plans/${id}`);

// Create new plan
export const createPlan = (data) => apiClient.post('/subscriptions/plans', data);

// Update plan
export const updatePlan = (id, data) => apiClient.put(`/subscriptions/plans/${id}`, data);

// Delete plan
export const deletePlan = (id) => apiClient.delete(`/subscriptions/plans/${id}`);

// ===============================
// ✅ STATUS & VALIDATION
// ===============================

// Check subscription status for tenant
export const checkSubscriptionStatus = (tenantId) => 
  apiClient.get(`/subscriptions/status/${tenantId}`);

// Validate subscription limit (invoices, users, etc.)
export const validateSubscriptionLimit = (tenantId, limitType) => 
  apiClient.get(`/subscriptions/validate/${tenantId}?type=${limitType}`);

// Increment usage counter (invoices, users, etc.)
export const incrementUsage = (tenantId, usageType) => 
  apiClient.post(`/subscriptions/increment-usage/${tenantId}`, { type: usageType });

// Get subscription features
export const getSubscriptionFeatures = (planId) => 
  apiClient.get(`/subscriptions/features/${planId}`);

// ===============================
// 📝 DEFAULT EXPORT
// ===============================

export default {
  // Subscription CRUD
  getSubscriptions,
  getSubscriptionById,
  getSubscription,
  getCurrentSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  
  // Subscription Actions
  upgradePlan,
  cancelSubscription,
  renewSubscription,
  changeSubscriptionPlan,
  recordSubscriptionPayment,
  updateExpiredSubscriptions,
  
  // Statistics
  getSubscriptionStats,
  getSubscriptionUsage,
  
  // Plans Management
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  
  // Status & Validation
  checkSubscriptionStatus,
  validateSubscriptionLimit,
  incrementUsage,
  getSubscriptionFeatures,
};