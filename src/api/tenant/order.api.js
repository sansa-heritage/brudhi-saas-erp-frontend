// src/components/services/orderService.js
import apiClient from '../client';

// Order CRUD Operations
export const getOrders = () => apiClient.get('/orders');
export const getOrderById = (id) => apiClient.get(`/orders/${id}`);
// export const createOrder = (data) => apiClient.post('/orders', data);
// FIXED: Create order with proper data formatting
export const createOrder = (data) => {
  console.log("=== createOrder Service Called ===");
  console.log("Original data received:", data);
  console.log("Items type:", typeof data.items);
  console.log("Is items array?", Array.isArray(data.items));
  console.log("Items length:", data.items?.length);
  
  // CRITICAL FIX: Ensure items is always an array
  const formattedData = {
    ...data,
    items: Array.isArray(data.items) ? data.items : []
  };
  
  console.log("Formatted data being sent:", JSON.stringify(formattedData, null, 2));
  console.log("Formatted items is array:", Array.isArray(formattedData.items));
  console.log("Formatted items length:", formattedData.items.length);
  
  return apiClient.post('/orders', formattedData);
};
export const updateOrder = (id, data) => apiClient.put(`/orders/${id}`, data);
export const deleteOrder = (id) => apiClient.delete(`/orders/${id}`);

// Order Status Management
export const updateOrderStatus = (id, status, reason = null) => {
  return apiClient.patch(`/orders/${id}/status`, { status, cancellation_reason: reason });
};

export const updatePaymentStatus = (id, paymentStatus) => {
  return apiClient.patch(`/orders/${id}/payment-status`, { payment_status: paymentStatus });
};