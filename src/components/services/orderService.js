// src/components/services/orderService.js
import apiClient from "../../api/client";

// ===============================
// ORDER CRUD OPERATIONS
// ===============================

// Get all orders with optional filters
// src/components/services/orderService.js

// Get all orders with optional filters
export const getOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.payment_status)
      params.append("payment_status", filters.payment_status);
    if (filters.order_type) params.append("order_type", filters.order_type);
    if (filters.customer_id) params.append("customer_id", filters.customer_id);
    if (filters.search) params.append("search", filters.search);
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const url = `/orders${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get(url);

    console.log("=== GET ORDERS API RESPONSE ===");
    console.log("Full response:", response);
    console.log("Response data:", response.data);

    // ✅ Check for different response structures
    // Structure 1: { success: true, data: { data: [...] } }
    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      console.log(
        "Found orders in data.data.data:",
        response.data.data.data.length,
      );
      return response.data.data.data;
    }

    // Structure 2: { success: true, data: { orders: [...] } }
    if (
      response?.data?.data?.orders &&
      Array.isArray(response.data.data.orders)
    ) {
      console.log(
        "Found orders in data.data.orders:",
        response.data.data.orders.length,
      );
      return response.data.data.orders;
    }

    // Structure 3: { data: { orders: [...] } }
    if (response?.data?.orders && Array.isArray(response.data.orders)) {
      console.log("Found orders in data.orders:", response.data.orders.length);
      return response.data.orders;
    }

    // Structure 4: { data: [...] }
    if (response?.data && Array.isArray(response.data)) {
      console.log("Found orders in data:", response.data.length);
      return response.data;
    }

    // Structure 5: Direct array
    if (Array.isArray(response)) {
      console.log("Found orders directly in response:", response.length);
      return response;
    }

    console.warn("No orders found in response. Check API response structure.");
    return [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Get order by ID - FIXED to return full response
export const getOrderById = async (id) => {
  try {
    const response = await apiClient.get(`/orders/${id}`);
    console.log("Get order by ID response:", response);
    
    // Return the full response object
    return response;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
};

// Get orders by customer ID
export const getOrdersByCustomerId = async (customerId) => {
  try {
    const response = await apiClient.get(`/orders/customer/${customerId}`);
    console.log("Get orders by customer ID response:", response);

    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching orders by customer:", error);
    return [];
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    console.log("Creating order with data:", orderData);

    const payload = {
      // Basic Information
      order_no: orderData.order_no || orderData.orderId,
      order_date: orderData.order_date || orderData.orderDate,
      customer_id: orderData.customer_id
        ? parseInt(orderData.customer_id)
        : null,
      customer_type: orderData.customer_type || "regular",
      order_type: orderData.order_type || "sales",

      // Status
      status: orderData.status || "pending",
      payment_status: orderData.payment_status || "pending",
      payment_method: orderData.payment_method || null,

      // Financial
      subtotal: parseFloat(orderData.subtotal) || 0,
      discount_type: orderData.discount_type || "percentage",
      discount_value: parseFloat(orderData.discount_value) || 0,
      discount_amount: parseFloat(orderData.discount_amount) || 0,
      tax_amount: parseFloat(orderData.tax_amount) || 0,
      shipping_charge: parseFloat(orderData.shipping_charge) || 0,
      total_amount: parseFloat(orderData.total_amount) || 0,

      // Additional Info
      notes: orderData.notes || null,
      delivery_address: orderData.delivery_address || null,
      delivery_date: orderData.delivery_date || null,

      // Assignment
      assigned_to: orderData.assigned_to
        ? parseInt(orderData.assigned_to)
        : null,
      created_by: orderData.created_by ? parseInt(orderData.created_by) : null,
    };

    const response = await apiClient.post("/orders", payload);
    console.log("Create order response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Update order
export const updateOrder = async (id, orderData) => {
  try {
    console.log(`Updating order ${id} with data:`, orderData);

    const payload = {
      // Basic Information
      order_no: orderData.order_no || orderData.orderId,
      order_date: orderData.order_date || orderData.orderDate,
      customer_id: orderData.customer_id
        ? parseInt(orderData.customer_id)
        : null,
      customer_type: orderData.customer_type || "regular",
      order_type: orderData.order_type || "sales",

      // Status
      status: orderData.status || "pending",
      payment_status: orderData.payment_status || "pending",
      payment_method: orderData.payment_method || null,

      // Financial
      subtotal: parseFloat(orderData.subtotal) || 0,
      discount_type: orderData.discount_type || "percentage",
      discount_value: parseFloat(orderData.discount_value) || 0,
      discount_amount: parseFloat(orderData.discount_amount) || 0,
      tax_amount: parseFloat(orderData.tax_amount) || 0,
      shipping_charge: parseFloat(orderData.shipping_charge) || 0,
      total_amount: parseFloat(orderData.total_amount) || 0,

      // Additional Info
      notes: orderData.notes || null,
      delivery_address: orderData.delivery_address || null,
      delivery_date: orderData.delivery_date || null,

      // Assignment
      assigned_to: orderData.assigned_to
        ? parseInt(orderData.assigned_to)
        : null,
    };

    // Only include approval/cancellation fields if applicable
    if (orderData.status === "approved" && !orderData.approved_at) {
      payload.approved_at = new Date().toISOString();
      payload.approved_by = orderData.approved_by || null;
    }

    if (orderData.status === "cancelled" && !orderData.cancelled_at) {
      payload.cancelled_at = new Date().toISOString();
      payload.cancelled_by = orderData.cancelled_by || null;
      payload.cancellation_reason = orderData.cancellation_reason || null;
    }

    const response = await apiClient.put(`/orders/${id}`, payload);
    console.log("Update order response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// Delete order (soft delete)
export const deleteOrder = async (id) => {
  try {
    const response = await apiClient.delete(`/orders/${id}`);
    console.log("Delete order response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// ===============================
// ORDER STATUS MANAGEMENT
// ===============================

// Update order status
export const updateOrderStatus = async (id, status, reason = null) => {
  try {
    const payload = { status };

    if (status === "approved") {
      payload.approved_at = new Date().toISOString();
    }

    if (status === "cancelled") {
      payload.cancelled_at = new Date().toISOString();
      payload.cancellation_reason = reason;
    }

    const response = await apiClient.patch(`/orders/${id}/status`, payload);
    console.log("Update order status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const payload = { payment_status: paymentStatus };
    const response = await apiClient.patch(
      `/orders/${id}/payment-status`,
      payload,
    );
    console.log("Update payment status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

// ===============================
// ORDER STATISTICS
// ===============================

// Get order statistics
export const getOrderStatistics = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);

    const url = `/orders/statistics${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get(url);

    console.log("Order statistics response:", response);

    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
    };
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
    };
  }
};

// Get order summary by date range
export const getOrderSummary = async (startDate, endDate) => {
  try {
    const response = await apiClient.get(
      `/orders/summary?start_date=${startDate}&end_date=${endDate}`,
    );

    if (response?.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order summary:", error);
    throw error;
  }
};

// ===============================
// ORDER ITEMS MANAGEMENT
// ===============================

// Get order items
export const getOrderItems = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}/items`);

    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching order items:", error);
    return [];
  }
};

// Add order item
export const addOrderItem = async (orderId, itemData) => {
  try {
    const payload = {
      product_id: itemData.product_id,
      product_name: itemData.product_name,
      quantity: parseInt(itemData.quantity),
      unit_price: parseFloat(itemData.unit_price),
      discount: parseFloat(itemData.discount) || 0,
      tax_rate: parseFloat(itemData.tax_rate) || 0,
      tax_amount: parseFloat(itemData.tax_amount) || 0,
      total_price: parseFloat(itemData.total_price) || 0,
    };

    const response = await apiClient.post(`/orders/${orderId}/items`, payload);
    console.log("Add order item response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding order item:", error);
    throw error;
  }
};

// Update order item
export const updateOrderItem = async (orderId, itemId, itemData) => {
  try {
    const payload = {
      quantity: parseInt(itemData.quantity),
      unit_price: parseFloat(itemData.unit_price),
      discount: parseFloat(itemData.discount) || 0,
      total_price: parseFloat(itemData.total_price) || 0,
    };

    const response = await apiClient.put(
      `/orders/${orderId}/items/${itemId}`,
      payload,
    );
    console.log("Update order item response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating order item:", error);
    throw error;
  }
};

// Delete order item
export const deleteOrderItem = async (orderId, itemId) => {
  try {
    const response = await apiClient.delete(
      `/orders/${orderId}/items/${itemId}`,
    );
    console.log("Delete order item response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting order item:", error);
    throw error;
  }
};

// ===============================
// HELPER FUNCTIONS
// ===============================

// Generate order number
export const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${year}${month}${day}-${random}`;
};

// Get order status options
export const getOrderStatusOptions = () => {
  return [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "approved", label: "Approved", variant: "info" },
    { value: "processing", label: "Processing", variant: "primary" },
    { value: "shipped", label: "Shipped", variant: "info" },
    { value: "delivered", label: "Delivered", variant: "success" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "cancelled", label: "Cancelled", variant: "danger" },
  ];
};

// Get payment status options
export const getPaymentStatusOptions = () => {
  return [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "partial", label: "Partial", variant: "info" },
    { value: "paid", label: "Paid", variant: "success" },
    { value: "refunded", label: "Refunded", variant: "secondary" },
  ];
};

// Get order type options
export const getOrderTypeOptions = () => {
  return [
    { value: "sales", label: "Sales Order" },
    { value: "purchase", label: "Purchase Order" },
    { value: "return", label: "Return Order" },
  ];
};

// Get customer type options
export const getCustomerTypeOptions = () => {
  return [
    { value: "regular", label: "Regular" },
    { value: "wholesale", label: "Wholesale" },
    { value: "corporate", label: "Corporate" },
  ];
};

// Calculate order totals
export const calculateOrderTotals = (
  items,
  discountValue = 0,
  discountType = "percentage",
  taxRate = 0,
  shippingCharge = 0,
) => {
  let subtotal = 0;

  items.forEach((item) => {
    subtotal += item.quantity * item.unit_price;
  });

  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (subtotal * discountValue) / 100;
  } else {
    discountAmount = discountValue;
  }

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const totalAmount = afterDiscount + taxAmount + shippingCharge;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount_amount: parseFloat(discountAmount.toFixed(2)),
    tax_amount: parseFloat(taxAmount.toFixed(2)),
    total_amount: parseFloat(totalAmount.toFixed(2)),
  };
};
