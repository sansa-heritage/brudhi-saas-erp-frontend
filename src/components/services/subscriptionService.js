// frontend/src/components/services/subscriptionService.js
import apiClient from "../../api/client";

// Get all subscriptions (with filters)
export const getSubscriptions = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.planId) params.append("plan_id", filters.planId);
    if (filters.tenantId) params.append("tenant_id", filters.tenantId);
    if (filters.startDate) params.append("start_date", filters.startDate);
    if (filters.endDate) params.append("end_date", filters.endDate);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await apiClient.get(
      `/subscriptions${params.toString() ? `?${params.toString()}` : ""}`
    );
    console.log("Get subscriptions response:", response);

    if (response.data && response.data.data && response.data.data.data) {
      return response.data.data.data;
    }
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
};

// Get subscription by ID
export const getSubscriptionById = async (id) => {
  try {
    const response = await apiClient.get(`/subscriptions/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching subscription by ID:", error);
    throw error;
  }
};

// Get current subscription for a tenant
export const getCurrentSubscription = async (tenantId) => {
  try {
    const response = await apiClient.get(`/subscriptions/current/${tenantId}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching current subscription:", error);
    throw error;
  }
};

// Create new subscription
export const createSubscription = async (subscriptionData) => {
  try {
    console.log("📦 Original subscription data received:", subscriptionData);

    const payload = {
      subscription_no: subscriptionData.subscription_no || `SUB-${Date.now()}`,
      tenant_id: subscriptionData.tenant_id ? Number(subscriptionData.tenant_id) : null,
      plan_id: subscriptionData.plan_id ? Number(subscriptionData.plan_id) : null,
      plan_name: subscriptionData.plan_name,
      plan_type: subscriptionData.plan_type || "standard",
      start_date: subscriptionData.start_date,
      end_date: subscriptionData.end_date,
      billing_cycle: subscriptionData.billing_cycle || "monthly",
      amount: parseFloat(subscriptionData.amount) || 0,
      discount_amount: parseFloat(subscriptionData.discount_amount) || 0,
      total_amount: parseFloat(subscriptionData.total_amount) || 0,
      payment_status: subscriptionData.payment_status || "pending",
      payment_method: subscriptionData.payment_method || null,
      transaction_id: subscriptionData.transaction_id || null,
      status: subscriptionData.status || "active",
      auto_renew: subscriptionData.auto_renew !== undefined ? subscriptionData.auto_renew : true,
      created_by: subscriptionData.created_by ? Number(subscriptionData.created_by) : null,
      notes: subscriptionData.notes || null,
    };

    console.log("📤 Sending payload to backend:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post("/subscriptions", payload);
    console.log("✅ Create subscription response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating subscription:", error);
    throw error;
  }
};

// Update subscription
export const updateSubscription = async (id, subscriptionData) => {
  try {
    console.log("📦 Updating subscription ID:", id);
    console.log("Update data:", subscriptionData);

    const payload = {
      plan_id: subscriptionData.plan_id ? Number(subscriptionData.plan_id) : null,
      plan_name: subscriptionData.plan_name,
      plan_type: subscriptionData.plan_type,
      billing_cycle: subscriptionData.billing_cycle,
      amount: parseFloat(subscriptionData.amount) || 0,
      discount_amount: parseFloat(subscriptionData.discount_amount) || 0,
      total_amount: parseFloat(subscriptionData.total_amount) || 0,
      payment_status: subscriptionData.payment_status,
      payment_method: subscriptionData.payment_method || null,
      transaction_id: subscriptionData.transaction_id || null,
      status: subscriptionData.status,
      auto_renew: subscriptionData.auto_renew,
      notes: subscriptionData.notes || null,
    };

    console.log("📤 Update payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.put(`/subscriptions/${id}`, payload);
    console.log("✅ Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
    throw error;
  }
};

// Delete subscription
export const deleteSubscription = async (id) => {
  try {
    const response = await apiClient.delete(`/subscriptions/${id}`);
    console.log("Delete subscription response:", response);
    return response.data;
  } catch (error) {
    console.error("Error deleting subscription:", error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (id, cancellationData) => {
  try {
    console.log("📦 Cancelling subscription ID:", id);
    console.log("Cancellation data:", cancellationData);

    const payload = {
      cancelled_by: cancellationData.cancelled_by ? Number(cancellationData.cancelled_by) : null,
      cancellation_reason: cancellationData.cancellation_reason || null,
      status: "cancelled",
    };

    console.log("📤 Cancel payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post(`/subscriptions/${id}/cancel`, payload);
    console.log("✅ Cancel response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error cancelling subscription:", error);
    throw error;
  }
};

// Renew subscription
export const renewSubscription = async (id, renewalData) => {
  try {
    console.log("📦 Renewing subscription ID:", id);
    console.log("Renewal data:", renewalData);

    const payload = {
      end_date: renewalData.end_date,
      renewed_at: new Date().toISOString(),
      status: "active",
    };

    console.log("📤 Renew payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post(`/subscriptions/${id}/renew`, payload);
    console.log("✅ Renew response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error renewing subscription:", error);
    throw error;
  }
};

// ✅ ADD THIS - Upgrade plan (for upgrading subscription)
export const upgradePlan = async (planData) => {
  try {
    console.log("📦 Upgrading subscription with plan data:", planData);

    const payload = {
      plan_id: planData.plan_id ? Number(planData.plan_id) : null,
      plan_name: planData.plan_name,
      plan_type: planData.plan_type || "standard",
      billing_cycle: planData.billing_cycle || "monthly",
      amount: parseFloat(planData.amount) || 0,
    };

    console.log("📤 Upgrade payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post("/subscriptions/upgrade", payload);
    console.log("✅ Upgrade response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error upgrading subscription:", error);
    throw error;
  }
};

// Upgrade/Downgrade plan
export const changePlan = async (id, planData) => {
  try {
    console.log("📦 Changing plan for subscription ID:", id);
    console.log("Plan data:", planData);

    const payload = {
      plan_id: planData.plan_id ? Number(planData.plan_id) : null,
      plan_name: planData.plan_name,
      plan_type: planData.plan_type,
      amount: parseFloat(planData.amount) || 0,
      billing_cycle: planData.billing_cycle,
    };

    console.log("📤 Change plan payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.put(`/subscriptions/${id}/change-plan`, payload);
    console.log("✅ Change plan response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error changing plan:", error);
    throw error;
  }
};

// Get subscription statistics
export const getSubscriptionStats = async () => {
  try {
    const response = await apiClient.get("/subscriptions/stats");
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      cancelledSubscriptions: 0,
      totalRevenue: 0,
    };
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      cancelledSubscriptions: 0,
      totalRevenue: 0,
    };
  }
};

// Get plans
export const getPlans = async () => {
  try {
    const response = await apiClient.get("/subscriptions/plans");
    console.log("Get plans response:", response);

    if (response.data && response.data.data && response.data.data.data) {
      return response.data.data.data;
    }
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

// Get plan by ID
export const getPlanById = async (id) => {
  try {
    const response = await apiClient.get(`/subscriptions/plans/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching plan by ID:", error);
    throw error;
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (tenantId) => {
  try {
    const response = await apiClient.get(`/subscriptions/status/${tenantId}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return {
      isActive: false,
      plan: null,
      daysRemaining: 0,
      isExpired: true,
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return {
      isActive: false,
      plan: null,
      daysRemaining: 0,
      isExpired: true,
    };
  }
};

// Validate subscription limits
export const validateSubscriptionLimit = async (tenantId, limitType = "invoices") => {
  try {
    const response = await apiClient.get(`/subscriptions/validate/${tenantId}?type=${limitType}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return {
      allowed: true,
      currentUsage: 0,
      limit: 0,
      percentageUsed: 0,
    };
  } catch (error) {
    console.error("Error validating subscription limit:", error);
    return {
      allowed: true,
      currentUsage: 0,
      limit: 0,
      percentageUsed: 0,
    };
  }
};

// Increment usage counter
export const incrementUsage = async (tenantId, usageType = "invoices") => {
  try {
    const response = await apiClient.post(`/subscriptions/increment-usage/${tenantId}`, {
      type: usageType,
    });
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error incrementing usage:", error);
    throw error;
  }
};

// Export all functions as default
// export default {
//   getSubscriptions,
//   getSubscriptionById,
//   getCurrentSubscription,
//   createSubscription,
//   updateSubscription,
//   deleteSubscription,
//   cancelSubscription,
//   renewSubscription,
//   changePlan,
//   getSubscriptionStats,
//   getPlans,
//   getPlanById,
//   checkSubscriptionStatus,
//   validateSubscriptionLimit,
//   incrementUsage,
// };