// frontend/src/services/customerService.js
import apiClient from "../../api/client";

// Get all customers
// export const getCustomers = async () => {
//   try {
//     const response = await apiClient.get("/customers");
//     console.log("Get customers response:", response);

//     // Your backend returns: { success: true, data: { data: [...], pagination: {...} }, message: "...", timestamp: "..." }
//     if (response.data && response.data.data && response.data.data.data) {
//       return response.data.data.data;
//     }
//     if (
//       response.data &&
//       response.data.data &&
//       Array.isArray(response.data.data)
//     ) {
//       return response.data.data;
//     }
//     if (response.data && Array.isArray(response.data)) {
//       return response.data;
//     }
//     return [];
//   } catch (error) {
//     console.error("Error fetching customers:", error);
//     throw error;
//   }

export const getCustomers = async () => {
  try {
    const response = await apiClient.get("/customers");
    console.log("Get customers response:", response);

    // Check different response structures
    // Structure 1: { success: true, data: { data: [...] } }
    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      console.log(
        "Found customers in data.data.data:",
        response.data.data.data.length,
      );
      return response.data.data.data;
    }

    // Structure 2: { data: { data: [...] } }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      console.log("Found customers in data.data:", response.data.data.length);
      return response.data.data;
    }

    // Structure 3: { data: [...] }
    if (response?.data && Array.isArray(response.data)) {
      console.log("Found customers in data:", response.data.length);
      return response.data;
    }

    // Structure 4: Direct array
    if (Array.isArray(response)) {
      console.log("Found customers in response:", response.length);
      return response;
    }

    console.warn("Unexpected customers response structure:", response);
    return [];
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

// Get customer by ID
export const getCustomerById = async (id) => {
  try {
    const response = await apiClient.get(`/customers/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    throw error;
  }
};

// ✅ FIXED: Create new customer - Keep camelCase as your backend accepts
export const addCustomer = async (customerData) => {
  try {
    console.log("📦 Original customer data received:", customerData);

    // ✅ Send exactly as received from modal (camelCase)
    // DO NOT transform field names - your backend accepts camelCase based on Postman test
    const payload = {
      name: customerData.name,
      email: customerData.email,
      mobile: customerData.mobile,
      alternateMobile: customerData.alternateMobile || null,
      address: customerData.address || null,
      landmark: customerData.landmark || null,
      // Location fields - CRITICAL: Keep as camelCase
      countryId: customerData.countryId ? Number(customerData.countryId) : null,
      stateId: customerData.stateId ? Number(customerData.stateId) : null,
      cityId: customerData.cityId ? Number(customerData.cityId) : null,
      pincodeId: customerData.pincodeId ? Number(customerData.pincodeId) : null,
      // Tax fields
      gstNumber: customerData.gstNumber || null,
      panNumber: customerData.panNumber || null,
      aadhaarNumber: customerData.aadhaarNumber || null,
      // Financial fields
      customerType: customerData.customerType || "regular",
      creditLimit: Number(customerData.creditLimit) || 0,
      // Metadata
      createdBy: customerData.createdBy ? Number(customerData.createdBy) : null,
      status: customerData.status || "active",
    };

    console.log(
      "📤 Sending payload to backend:",
      JSON.stringify(payload, null, 2),
    );

    // Log to verify location fields are included
    console.log("✅ Location fields in payload:");
    console.log("  - countryId:", payload.countryId);
    console.log("  - stateId:", payload.stateId);
    console.log("  - cityId:", payload.cityId);
    console.log("  - pincodeId:", payload.pincodeId);
    console.log("  - creditLimit:", payload.creditLimit);
    console.log("  - createdBy:", payload.createdBy);

    const response = await apiClient.post("/customers", payload);
    console.log("✅ Add customer response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding customer:", error);
    console.error("Error response data:", error.response?.data);
    throw error;
  }
};

// ✅ FIXED: Update customer - includes ALL fields including creditDays
export const updateCustomer = async (id, customerData) => {
  try {
    console.log("📦 Updating customer ID:", id);
    console.log("Update data received:", customerData);

    // Map all fields to camelCase (as your backend accepts)
    const payload = {
      // Basic Info
      name: customerData.name,
      email: customerData.email,
      mobile: customerData.mobile,
      alternateMobile: customerData.alternateMobile || null,

      // Address Info
      address: customerData.address || null,
      landmark: customerData.landmark || null,

      // Location IDs - CRITICAL for update
      countryId: customerData.countryId ? Number(customerData.countryId) : null,
      stateId: customerData.stateId ? Number(customerData.stateId) : null,
      cityId: customerData.cityId ? Number(customerData.cityId) : null,
      pincodeId: customerData.pincodeId ? Number(customerData.pincodeId) : null,

      // Tax Info
      gstNumber: customerData.gstNumber || null,
      panNumber: customerData.panNumber || null,
      aadhaarNumber: customerData.aadhaarNumber || null,

      // Financial Info - INCLUDING creditDays
      customerType: customerData.customerType || "regular",
      creditLimit: Number(customerData.creditLimit) || 0,
      creditDays: Number(customerData.creditDays) || 0, // ✅ ADDED - was missing!

      // Status & Notes
      status: customerData.status || "active",
      notes: customerData.notes || null,
    };

    console.log("📤 Sending update payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.put(`/customers/${id}`, payload);
    console.log("✅ Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating customer:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};
// Delete customer
export const deleteCustomer = async (id) => {
  try {
    const response = await apiClient.delete(`/customers/${id}`);
    console.log("Delete customer response:", response);
    return response.data;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};
