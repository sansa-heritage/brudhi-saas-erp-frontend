// src/components/services/documentService.js
import apiClient from '../../api/client';

// ===============================
// CUSTOMER DOCUMENTS API
// ===============================

// Get all customer documents
export const getCustomerDocuments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.document_type) params.append('document_type', filters.document_type);
    if (filters.status) params.append('status', filters.status);
    
    const url = `/customer-documents${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    console.log("Get customer documents response:", response);
    
    // Handle different response structures
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
    console.error("Error fetching customer documents:", error);
    return [];
  }
};

// Get customer document by ID
export const getCustomerDocumentById = async (id) => {
  try {
    const response = await apiClient.get(`/customer-documents/${id}`);
    console.log("Get customer document by ID response:", response);
    
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching customer document by ID:", error);
    throw error;
  }
};

// Get documents by customer ID
export const getDocumentsByCustomerId = async (customerId) => {
  try {
    const response = await apiClient.get(`/customer-documents/customer/${customerId}`);
    console.log("Get documents by customer ID response:", response);
    
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
    console.error("Error fetching documents by customer ID:", error);
    return [];
  }
};

// Add new customer document
export const addCustomerDocument = async (documentData) => {
  try {
    console.log("Adding customer document:", documentData);
    
    const formData = new FormData();
    formData.append('customer_id', documentData.customerId);
    formData.append('customer_name', documentData.customerName);
    formData.append('document_name', documentData.name);
    formData.append('document_type', documentData.type);
    formData.append('expiry_date', documentData.expiryDate || null);
    
    if (documentData.file) {
      formData.append('file', documentData.file);
    }
    
    const response = await apiClient.post('/customer-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log("Add customer document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding customer document:", error);
    throw error;
  }
};

// Update customer document
export const updateCustomerDocument = async (id, documentData) => {
  try {
    console.log(`Updating customer document ${id}:`, documentData);
    
    const payload = {
      document_name: documentData.name,
      document_type: documentData.type,
      expiry_date: documentData.expiryDate || null,
      status: documentData.status || 'pending'
    };
    
    const response = await apiClient.put(`/customer-documents/${id}`, payload);
    console.log("Update customer document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating customer document:", error);
    throw error;
  }
};

// Delete customer document
export const deleteCustomerDocument = async (id) => {
  try {
    const response = await apiClient.delete(`/customer-documents/${id}`);
    console.log("Delete customer document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting customer document:", error);
    throw error;
  }
};

// Verify customer document
export const verifyCustomerDocument = async (id, status, remarks = '') => {
  try {
    const payload = {
      status: status, // 'verified', 'rejected', 'expired'
      remarks: remarks,
      verified_at: new Date().toISOString()
    };
    
    const response = await apiClient.patch(`/customer-documents/${id}/verify`, payload);
    console.log("Verify customer document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error verifying customer document:", error);
    throw error;
  }
};

// ===============================
// DEALER DOCUMENTS API
// ===============================

// Get all dealer documents
export const getDealerDocuments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.dealer_id) params.append('dealer_id', filters.dealer_id);
    if (filters.document_type) params.append('document_type', filters.document_type);
    if (filters.status) params.append('status', filters.status);
    
    const url = `/dealer-documents${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    console.log("Get dealer documents response:", response);
    
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
    console.error("Error fetching dealer documents:", error);
    return [];
  }
};

// Get dealer document by ID
export const getDealerDocumentById = async (id) => {
  try {
    const response = await apiClient.get(`/dealer-documents/${id}`);
    
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching dealer document by ID:", error);
    throw error;
  }
};

// Add new dealer document
export const addDealerDocument = async (documentData) => {
  try {
    console.log("Adding dealer document:", documentData);
    
    const formData = new FormData();
    formData.append('dealer_id', documentData.dealerId);
    formData.append('dealer_name', documentData.dealerName);
    formData.append('document_name', documentData.name);
    formData.append('document_type', documentData.type);
    formData.append('valid_till', documentData.validTill || null);
    
    if (documentData.file) {
      formData.append('file', documentData.file);
    }
    
    const response = await apiClient.post('/dealer-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log("Add dealer document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding dealer document:", error);
    throw error;
  }
};

// Update dealer document
export const updateDealerDocument = async (id, documentData) => {
  try {
    const payload = {
      document_name: documentData.name,
      document_type: documentData.type,
      valid_till: documentData.validTill || null,
      status: documentData.status || 'pending'
    };
    
    const response = await apiClient.put(`/dealer-documents/${id}`, payload);
    console.log("Update dealer document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating dealer document:", error);
    throw error;
  }
};

// Delete dealer document
export const deleteDealerDocument = async (id) => {
  try {
    const response = await apiClient.delete(`/dealer-documents/${id}`);
    console.log("Delete dealer document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting dealer document:", error);
    throw error;
  }
};

// ===============================
// COMPANY DOCUMENTS API
// ===============================

// Get all company documents
export const getCompanyDocuments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.document_type) params.append('document_type', filters.document_type);
    if (filters.status) params.append('status', filters.status);
    
    const url = `/company-documents${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    console.log("Get company documents response:", response);
    
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
    console.error("Error fetching company documents:", error);
    return [];
  }
};

// Get company document by ID
export const getCompanyDocumentById = async (id) => {
  try {
    const response = await apiClient.get(`/company-documents/${id}`);
    
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching company document by ID:", error);
    throw error;
  }
};

// Add new company document
export const addCompanyDocument = async (documentData) => {
  try {
    console.log("Adding company document:", documentData);
    
    const formData = new FormData();
    formData.append('document_name', documentData.name);
    formData.append('document_type', documentData.type);
    formData.append('valid_till', documentData.validTill || null);
    
    if (documentData.file) {
      formData.append('file', documentData.file);
    }
    
    const response = await apiClient.post('/company-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log("Add company document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding company document:", error);
    throw error;
  }
};

// Update company document
export const updateCompanyDocument = async (id, documentData) => {
  try {
    const payload = {
      document_name: documentData.name,
      document_type: documentData.type,
      valid_till: documentData.validTill || null,
      status: documentData.status || 'pending'
    };
    
    const response = await apiClient.put(`/company-documents/${id}`, payload);
    console.log("Update company document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating company document:", error);
    throw error;
  }
};

// Delete company document
export const deleteCompanyDocument = async (id) => {
  try {
    const response = await apiClient.delete(`/company-documents/${id}`);
    console.log("Delete company document response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting company document:", error);
    throw error;
  }
};

// ===============================
// DOCUMENT STATISTICS
// ===============================

// Get document statistics
export const getDocumentStatistics = async () => {
  try {
    const response = await apiClient.get('/documents/statistics');
    console.log("Document statistics response:", response);
    
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return {
      totalDocuments: 0,
      customerDocuments: 0,
      dealerDocuments: 0,
      companyDocuments: 0,
      verifiedDocuments: 0,
      pendingDocuments: 0
    };
  } catch (error) {
    console.error("Error fetching document statistics:", error);
    return {
      totalDocuments: 0,
      customerDocuments: 0,
      dealerDocuments: 0,
      companyDocuments: 0,
      verifiedDocuments: 0,
      pendingDocuments: 0
    };
  }
};

// ===============================
// DOCUMENT TYPES (Optional)
// ===============================

// Get all document types
export const getDocumentTypes = async () => {
  try {
    const response = await apiClient.get('/documents/types');
    
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [
      { value: 'gst', label: 'GST Certificate' },
      { value: 'pan', label: 'PAN Card' },
      { value: 'aadhar', label: 'Aadhar Card' },
      { value: 'registration', label: 'Business Registration' },
      { value: 'agreement', label: 'Agreement' },
      { value: 'other', label: 'Other Documents' }
    ];
  } catch (error) {
    console.error("Error fetching document types:", error);
    return [
      { value: 'gst', label: 'GST Certificate' },
      { value: 'pan', label: 'PAN Card' },
      { value: 'aadhar', label: 'Aadhar Card' },
      { value: 'registration', label: 'Business Registration' },
      { value: 'agreement', label: 'Agreement' },
      { value: 'other', label: 'Other Documents' }
    ];
  }
};