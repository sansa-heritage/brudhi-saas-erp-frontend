// frontend/src/services/inventoryService.js
import apiClient from "../../api/client";

// Get all inventory products - returns array directly
export const getInventory = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.brand_id) params.append('brand_id', filters.brand_id);
    
    const url = `/inventory${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    console.log("Get inventory response:", response);

    // Based on your actual API response structure:
    // { success: true, data: { data: [...], pagination: {...} } }
    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    // Alternative structure: { data: { data: [...] } }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Alternative structure: { data: [...] }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn("Unexpected response structure:", response);
    return [];
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
};

// Get inventory product by ID
export const getInventoryById = async (id) => {
  try {
    const response = await apiClient.get(`/inventory/${id}`);
    console.log("Get inventory by ID response:", response);
    
    // Extract from { success: true, data: {...} }
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching inventory by ID:", error);
    throw error;
  }
};

// Create new inventory product
export const addInventory = async (productData) => {
  try {
    console.log("📦 Original product data received:", productData);

    const payload = {
      product_name: productData.productName,
      product_code: productData.productCode || null,
      category: productData.category,
      hsn_code: productData.hsnCode || null,
      unit: productData.unit || "NOS",
      unit_price: productData.unitPrice ? Number(productData.unitPrice) : 0,
      purchase_price: productData.purchasePrice ? Number(productData.purchasePrice) : 0,
      selling_price: Number(productData.sellingPrice) || 0,
      gst_rate: Number(productData.gstRate) || 0,
      opening_stock: Number(productData.openingStock) || 0,
      current_stock: Number(productData.currentStock) || Number(productData.openingStock) || 0,
      min_stock_level: Number(productData.minStockLevel) || 0,
      max_stock_level: Number(productData.maxStockLevel) || 0,
      reorder_level: Number(productData.reorderLevel) || 0,
      location: productData.location || null,
      brand_id: productData.brandId ? Number(productData.brandId) : null,
      is_active: productData.isActive !== undefined ? productData.isActive : 1,
      created_by: productData.createdBy ? Number(productData.createdBy) : null,
    };

    console.log("📤 Sending payload to backend:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post("/inventory", payload);
    console.log("✅ Add inventory response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding inventory:", error);
    throw error;
  }
};

// Update inventory product
export const updateInventory = async (id, productData) => {
  try {
    console.log("📦 Updating inventory ID:", id);
    console.log("Update data received:", productData);

    const payload = {
      product_name: productData.productName,
      category: productData.category,
      hsn_code: productData.hsnCode || null,
      unit: productData.unit || "NOS",
      unit_price: productData.unitPrice ? Number(productData.unitPrice) : 0,
      purchase_price: productData.purchasePrice ? Number(productData.purchasePrice) : 0,
      selling_price: Number(productData.sellingPrice) || 0,
      gst_rate: Number(productData.gstRate) || 0,
      min_stock_level: productData.minStockLevel !== undefined ? Number(productData.minStockLevel) : undefined,
      max_stock_level: productData.maxStockLevel !== undefined ? Number(productData.maxStockLevel) : undefined,
      reorder_level: productData.reorderLevel !== undefined ? Number(productData.reorderLevel) : undefined,
      location: productData.location || null,
      brand_id: productData.brandId ? Number(productData.brandId) : null,
      is_active: productData.isActive !== undefined ? productData.isActive : 1,
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    console.log("📤 Sending update payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.put(`/inventory/${id}`, payload);
    console.log("✅ Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating inventory:", error);
    throw error;
  }
};

// Delete inventory product
export const deleteInventory = async (id) => {
  try {
    const response = await apiClient.delete(`/inventory/${id}`);
    console.log("Delete inventory response:", response);
    return response.data;
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw error;
  }
};

// ===============================
// STOCK MANAGEMENT SERVICES
// ===============================

// Add stock (inward)
export const addStock = async (stockData) => {
  try {
    console.log("📦 Adding stock:", stockData);
    
    const payload = {
      product_id: stockData.productId,
      quantity: Number(stockData.quantity),
      unit_price: stockData.unitPrice ? Number(stockData.unitPrice) : undefined,
      reason: stockData.reason || "Stock inward",
      reference_type: stockData.referenceType || "purchase",
      reference_id: stockData.referenceId || null,
      created_by: stockData.createdBy ? Number(stockData.createdBy) : null,
    };
    
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });
    
    console.log("📤 Sending add stock payload:", payload);
    const response = await apiClient.post("/inventory/stock/add", payload);
    console.log("✅ Add stock response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding stock:", error);
    throw error;
  }
};

// Remove stock (outward)
export const removeStock = async (stockData) => {
  try {
    console.log("📦 Removing stock:", stockData);
    
    const payload = {
      product_id: stockData.productId,
      quantity: Number(stockData.quantity),
      reason: stockData.reason || "Stock outward",
      reference_type: stockData.referenceType || "sale",
      reference_id: stockData.referenceId || null,
      created_by: stockData.createdBy ? Number(stockData.createdBy) : null,
    };
    
    console.log("📤 Sending remove stock payload:", payload);
    const response = await apiClient.post("/inventory/stock/remove", payload);
    console.log("✅ Remove stock response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error removing stock:", error);
    throw error;
  }
};

// Adjust stock
export const adjustStock = async (adjustmentData) => {
  try {
    console.log("📦 Adjusting stock:", adjustmentData);
    
    const payload = {
      product_id: adjustmentData.productId,
      quantity: Number(adjustmentData.quantity),
      adjustment_type: adjustmentData.adjustmentType || "set",
      reason: adjustmentData.reason || "Manual adjustment",
      created_by: adjustmentData.createdBy ? Number(adjustmentData.createdBy) : null,
    };
    
    console.log("📤 Sending adjust stock payload:", payload);
    const response = await apiClient.post("/inventory/stock/adjust", payload);
    console.log("✅ Adjust stock response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adjusting stock:", error);
    throw error;
  }
};

// Get stock transactions for a product - returns array
export const getStockTransactions = async (productId, limit = 50) => {
  try {
    const response = await apiClient.get(`/inventory/stock/transactions/${productId}?limit=${limit}`);
    console.log("Get stock transactions response:", response);
    
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
    console.error("Error fetching stock transactions:", error);
    return [];
  }
};

// Get low stock products - returns array
export const getLowStockProducts = async () => {
  try {
    const response = await apiClient.get("/inventory/stock/low-stock");
    console.log("Get low stock response:", response);
    
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
    console.error("Error fetching low stock products:", error);
    return [];
  }
};

// Get inventory summary/stats - returns object
export const getInventorySummary = async () => {
  try {
    const response = await apiClient.get("/inventory/summary");
    console.log("Get inventory summary response:", response);
    
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return {
      total_products: 0,
      low_stock_count: 0,
      total_stock_value: 0,
      active_products: 0
    };
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    return {
      total_products: 0,
      low_stock_count: 0,
      total_stock_value: 0,
      active_products: 0
    };
  }
};

// Get categories - returns array
export const getCategories = async () => {
  try {
    const response = await apiClient.get("/inventory/categories");
    console.log("Get categories response:", response);
    
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
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Get brands - returns array
export const getBrands = async () => {
  try {
    const response = await apiClient.get("/inventory/brands");
    console.log("Get brands response:", response);
    
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
    console.error("Error fetching brands:", error);
    return [];
  }
};