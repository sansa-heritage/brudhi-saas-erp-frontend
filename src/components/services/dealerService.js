// frontend/src/services/dealerService.js
import apiClient from "../../api/client";

// Get all dealers
export const getDealers = async () => {
  try {
    const response = await apiClient.get("/dealers");
    console.log("Get dealers response:", response);

    // Handle nested response structure
    if (response.data && response.data.data && response.data.data.data) {
      return response.data.data.data;
    }
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching dealers:", error);
    throw error;
  }
};

// Get dealer by ID
export const getDealerById = async (id) => {
  try {
    const response = await apiClient.get(`/dealers/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching dealer by ID:", error);
    throw error;
  }
};

// Create new dealer
export const addDealer = async (dealerData) => {
  try {
    console.log("📦 Original dealer data received:", dealerData);

    // Send exactly as received from modal (camelCase)
    const payload = {
      name: dealerData.name,
      email: dealerData.email,
      mobile: dealerData.mobile,
      alternateMobile: dealerData.alternateMobile || null,
      address: dealerData.address || null,
      // Location fields - Keep as camelCase
      countryId: dealerData.countryId ? Number(dealerData.countryId) : null,
      stateId: dealerData.stateId ? Number(dealerData.stateId) : null,
      cityId: dealerData.cityId ? Number(dealerData.cityId) : null,
      pincodeId: dealerData.pincodeId ? Number(dealerData.pincodeId) : null,
      // Tax fields
      gstNumber: dealerData.gstNumber || null,
      panNumber: dealerData.panNumber || null,
      aadhaarNumber: dealerData.aadhaarNumber || null,
      // Dealer specific fields
      dealerType: dealerData.dealerType || "retailer",
      commissionRate: Number(dealerData.commissionRate) || 0,
      creditLimit: Number(dealerData.creditLimit) || 0,
      territory: dealerData.territory || null,
      agreementValidTill: dealerData.agreementValidTill || null,
      // Metadata
      createdBy: dealerData.createdBy ? Number(dealerData.createdBy) : null,
      status: dealerData.status || "active",
      notes: dealerData.notes || null,
    };

    console.log(
      "📤 Sending payload to backend:",
      JSON.stringify(payload, null, 2),
    );

    // Log to verify fields are included
    console.log("✅ Dealer fields in payload:");
    console.log("  - name:", payload.name);
    console.log("  - dealerType:", payload.dealerType);
    console.log("  - commissionRate:", payload.commissionRate);
    console.log("  - countryId:", payload.countryId);
    console.log("  - stateId:", payload.stateId);
    console.log("  - cityId:", payload.cityId);
    console.log("  - pincodeId:", payload.pincodeId);
    console.log("  - createdBy:", payload.createdBy);

    const response = await apiClient.post("/dealers", payload);
    console.log("✅ Add dealer response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding dealer:", error);
    console.error("Error response data:", error.response?.data);
    throw error;
  }
};

// Update dealer - includes ALL fields
// export const updateDealer = async (id, dealerData) => {
//   try {
//     console.log("📦 Updating dealer ID:", id);
//     console.log("Update data received:", dealerData);

//     // Map all fields to camelCase (as your backend accepts)
//     const payload = {
//       // Basic Info
//       name: dealerData.name,
//       email: dealerData.email,
//       mobile: dealerData.mobile,
//       alternateMobile: dealerData.alternateMobile || null,

//       // Address Info
//       address: dealerData.address || null,

//       // Location IDs - CRITICAL for update
//       countryId: dealerData.countryId ? Number(dealerData.countryId) : null,
//       stateId: dealerData.stateId ? Number(dealerData.stateId) : null,
//       cityId: dealerData.cityId ? Number(dealerData.cityId) : null,
//       pincodeId: dealerData.pincodeId ? Number(dealerData.pincodeId) : null,

//       // Tax Info
//       gstNumber: dealerData.gstNumber || null,
//       panNumber: dealerData.panNumber || null,
//       aadhaarNumber: dealerData.aadhaarNumber || null,

//       // Dealer specific fields
//       dealerType: dealerData.dealerType || "retailer",
//       commissionRate: Number(dealerData.commissionRate) || 0,
//       creditLimit: Number(dealerData.creditLimit) || 0,
//       territory: dealerData.territory || null,
//       agreementValidTill: dealerData.agreementValidTill || null,

//       // Status & Notes
//       status: dealerData.status || "active",
//       notes: dealerData.notes || null,
//     };

//     console.log("📤 Sending update payload:", JSON.stringify(payload, null, 2));

//     const response = await apiClient.put(`/dealers/${id}`, payload);
//     console.log("✅ Update response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error updating dealer:", error);
//     console.error("Error response:", error.response?.data);
//     throw error;
//   }
// };

// frontend/src/services/dealerService.js

// ✅ FIXED: Update dealer - Send camelCase, backend will convert
export const updateDealer = async (id, dealerData) => {
  try {
    console.log("📦 Updating dealer ID:", id);
    console.log("Update data received:", dealerData);

    // Send camelCase - backend will map to snake_case
    const payload = {
      name: dealerData.name,
      email: dealerData.email,
      mobile: dealerData.mobile,
      alternateMobile: dealerData.alternateMobile || null,
      address: dealerData.address || null,
      countryId: dealerData.countryId ? Number(dealerData.countryId) : null,
      stateId: dealerData.stateId ? Number(dealerData.stateId) : null,
      cityId: dealerData.cityId ? Number(dealerData.cityId) : null,
      pincodeId: dealerData.pincodeId ? Number(dealerData.pincodeId) : null,
      gstNumber: dealerData.gstNumber || null,
      panNumber: dealerData.panNumber || null,
      aadhaarNumber: dealerData.aadhaarNumber || null,
      dealerType: dealerData.dealerType || "retailer",
      commissionRate: Number(dealerData.commissionRate) || 0, // ✅ Send as commissionRate
      creditLimit: Number(dealerData.creditLimit) || 0,
      territory: dealerData.territory || null,
      agreementValidTill: dealerData.agreementValidTill || null,
      status: dealerData.status || "active",
      notes: dealerData.notes || null,
    };

    console.log("📤 Sending update payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.put(`/dealers/${id}`, payload);
    console.log("✅ Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating dealer:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Delete dealer
export const deleteDealer = async (id) => {
  try {
    const response = await apiClient.delete(`/dealers/${id}`);
    console.log("Delete dealer response:", response);
    return response.data;
  } catch (error) {
    console.error("Error deleting dealer:", error);
    throw error;
  }
};

// Get dealer statistics
export const getDealerStats = async () => {
  try {
    const response = await apiClient.get("/dealers/stats");
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching dealer stats:", error);
    throw error;
  }
};

// Get dealers by type
export const getDealersByType = async (dealerType) => {
  try {
    const response = await apiClient.get(`/dealers?dealerType=${dealerType}`);

    if (response.data && response.data.data) {
      if (response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data;
      }
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching dealers by type:", error);
    throw error;
  }
};

// Search dealers
export const searchDealers = async (searchTerm) => {
  try {
    const response = await apiClient.get(
      `/dealers?search=${encodeURIComponent(searchTerm)}`,
    );

    if (response.data && response.data.data) {
      if (response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data;
      }
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
    }
    return [];
  } catch (error) {
    console.error("Error searching dealers:", error);
    throw error;
  }
};

// Export all functions as default
export default {
  getDealers,
  getDealerById,
  addDealer,
  updateDealer,
  deleteDealer,
  getDealerStats,
  getDealersByType,
  searchDealers,
};
