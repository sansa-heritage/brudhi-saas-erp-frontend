// frontend/src/components/services/productService.js
import apiClient from "../../api/client";

// Get all products - Updated to use inventory endpoint
export const getProducts = async () => {
  try {
    const response = await apiClient.get("/inventory");
    console.log("Get products response:", response);

    // Check different response structures (matching customerService pattern)
    // Structure 1: { success: true, data: { data: [...] } }
    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      console.log("Found products in data.data.data:", response.data.data.data.length);
      return response.data.data.data;
    }

    // Structure 2: { data: { data: [...] } }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      console.log("Found products in data.data:", response.data.data.length);
      return response.data.data;
    }

    // Structure 3: { data: [...] }
    if (response?.data && Array.isArray(response.data)) {
      console.log("Found products in data:", response.data.length);
      return response.data;
    }

    // Structure 4: Direct array
    if (Array.isArray(response)) {
      console.log("Found products in response:", response.length);
      return response;
    }

    console.warn("Unexpected products response structure:", response);
    return [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await apiClient.get(`/inventory/${id}`);
    console.log("Get product by ID response:", response);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

// Create new product
export const addProduct = async (productData) => {
  try {
    console.log("📦 Original product data received:", productData);

    // Map fields to match backend expectations
    const payload = {
      // Basic Info
      product_name: productData.product_name || productData.name,
      product_code: productData.product_code,
      hsn_code: productData.hsn_code || null,
      
      // Category & Unit
      category_id: productData.category_id ? Number(productData.category_id) : null,
      unit_id: productData.unit_id ? Number(productData.unit_id) : null,
      
      // Pricing
      purchase_price: Number(productData.purchase_price) || 0,
      selling_price: Number(productData.selling_price) || 0,
      mrp: Number(productData.mrp) || 0,
      
      // Stock
      current_stock: Number(productData.current_stock) || 0,
      min_stock: Number(productData.min_stock) || 0,
      max_stock: Number(productData.max_stock) || 0,
      
      // Tax
      gst_rate: Number(productData.gst_rate) || 18,
      cess: Number(productData.cess) || 0,
      
      // Description & Status
      description: productData.description || null,
      status: productData.status || "active",
      
      // Metadata
      created_by: productData.created_by ? Number(productData.created_by) : null,
    };

    console.log("📤 Sending payload to backend:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post("/inventory", payload);
    console.log("✅ Add product response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding product:", error);
    console.error("Error response data:", error.response?.data);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    console.log("📦 Updating product ID:", id);
    console.log("Update data received:", productData);

    // Map all fields to match backend expectations
    const payload = {
      // Basic Info
      product_name: productData.product_name || productData.name,
      product_code: productData.product_code,
      hsn_code: productData.hsn_code || null,
      
      // Category & Unit
      category_id: productData.category_id ? Number(productData.category_id) : null,
      unit_id: productData.unit_id ? Number(productData.unit_id) : null,
      
      // Pricing
      purchase_price: Number(productData.purchase_price) || 0,
      selling_price: Number(productData.selling_price) || 0,
      mrp: Number(productData.mrp) || 0,
      
      // Stock
      current_stock: Number(productData.current_stock) || 0,
      min_stock: Number(productData.min_stock) || 0,
      max_stock: Number(productData.max_stock) || 0,
      
      // Tax
      gst_rate: Number(productData.gst_rate) || 18,
      cess: Number(productData.cess) || 0,
      
      // Description & Status
      description: productData.description || null,
      status: productData.status || "active",
      
      // Metadata
      updated_by: productData.updated_by ? Number(productData.updated_by) : null,
    };

    console.log("📤 Sending update payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.put(`/inventory/${id}`, payload);
    console.log("✅ Update product response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating product:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await apiClient.delete(`/inventory/${id}`);
    console.log("Delete product response:", response);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Search products
export const searchProducts = async (searchTerm) => {
  try {
    const response = await apiClient.get(`/inventory?search=${searchTerm}`);
    console.log("Search products response:", response);
    
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data;
      }
    }
    return [];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await apiClient.get(`/inventory?category_id=${categoryId}`);
    console.log("Products by category response:", response);
    
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data;
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};

// Update product stock
export const updateProductStock = async (id, stockData) => {
  try {
    console.log("📦 Updating stock for product ID:", id);
    console.log("Stock data:", stockData);

    const payload = {
      quantity: Number(stockData.quantity) || 0,
      operation: stockData.operation || "add", // "add" or "subtract"
      reason: stockData.reason || null,
      reference_type: stockData.reference_type || null,
      reference_id: stockData.reference_id ? Number(stockData.reference_id) : null,
    };

    const response = await apiClient.post(`/inventory/stock/adjust`, {
      product_id: id,
      ...payload
    });
    
    console.log("✅ Stock update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating product stock:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Get stock transactions for a product
export const getStockTransactions = async (productId, limit = 50) => {
  try {
    const response = await apiClient.get(`/inventory/stock/transactions/${productId}?limit=${limit}`);
    console.log("Stock transactions response:", response);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching stock transactions:", error);
    return [];
  }
};

// Get low stock alerts
export const getLowStockAlerts = async () => {
  try {
    const response = await apiClient.get("/inventory/alerts");
    console.log("Stock alerts response:", response);
    
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data;
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching stock alerts:", error);
    return [];
  }
};

// Resolve stock alert
export const resolveAlert = async (alertId, resolution = "resolved") => {
  try {
    const response = await apiClient.put(`/inventory/alerts/${alertId}/resolve`, {
      resolution,
      resolved_at: new Date().toISOString()
    });
    console.log("Resolve alert response:", response);
    return response.data;
  } catch (error) {
    console.error("Error resolving alert:", error);
    throw error;
  }
};

// Get inventory summary
export const getInventorySummary = async () => {
  try {
    const response = await apiClient.get("/inventory/summary");
    console.log("Inventory summary response:", response);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return {
      total_products: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
      total_stock_value: 0
    };
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    return {
      total_products: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
      total_stock_value: 0
    };
  }
};

// Check product stock (specific product)
export const checkProductStock = async (productId) => {
  try {
    const response = await apiClient.get(`/inventory/${productId}`);
    if (response.data && response.data.data) {
      const product = response.data.data;
      return {
        product_id: product.id,
        product_name: product.product_name || product.name,
        current_stock: product.current_stock || 0,
        min_stock: product.min_stock || 0,
        max_stock: product.max_stock || 0,
        is_low_stock: (product.current_stock || 0) <= (product.min_stock || 0),
        is_out_of_stock: (product.current_stock || 0) === 0
      };
    }
    return null;
  } catch (error) {
    console.error("Error checking product stock:", error);
    return null;
  }
};

export default {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  updateProductStock,
  getStockTransactions,
  getLowStockAlerts,
  resolveAlert,
  getInventorySummary,
  checkProductStock,
};