// src/components/services/staffService.js
import apiClient from "../../api/client";

// ===============================
// STAFF CRUD OPERATIONS
// ===============================

// Get all staff members
// Get all staff members
export const getStaff = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.department) params.append("department", filters.department);
    if (filters.search) params.append("search", filters.search);
    if (filters.role_id) params.append("role_id", filters.role_id);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const url = `/staff${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get(url);

    console.log("Full API Response:", response);

    // Your API returns: { success: true, data: { staff: [...], pagination: {...}, stats: {...} } }
    // Extract staff array from response.data.data.staff
    if (
      response?.data?.data?.staff &&
      Array.isArray(response.data.data.staff)
    ) {
      console.log(
        "Found staff in data.data.staff:",
        response.data.data.staff.length,
      );
      return response.data.data.staff;
    }

    // Alternative: { data: { staff: [...] } }
    if (response?.data?.staff && Array.isArray(response.data.staff)) {
      console.log("Found staff in data.staff:", response.data.staff.length);
      return response.data.staff;
    }

    // Alternative: { data: [...] }
    if (response?.data && Array.isArray(response.data)) {
      console.log("Found staff in data:", response.data.length);
      return response.data;
    }

    console.warn("No staff data found in response:", response);
    return [];
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
};

// Get staff member by ID
export const getStaffById = async (id) => {
  try {
    const response = await apiClient.get(`/staff/${id}`);
    console.log("Get staff by ID response:", response);

    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching staff by ID:", error);
    throw error;
  }
};

// Create new staff member - Matches your exact form data format
export const createStaff = async (staffData) => {
  try {
    console.log("📦 Original staff data received:", staffData);

    // ✅ Send in same format as addCustomer (camelCase)
    const payload = {
      // Personal Information
      first_name: staffData.first_name || staffData.firstName,
      last_name: staffData.last_name || staffData.lastName || null,
      email: staffData.email,
      password: staffData.password,
      phone: staffData.phone,

      // Employment Information
      role_id: parseInt(staffData.role_id || staffData.roleId) || 2,
      department: staffData.department,
      designation: staffData.designation,
      joining_date: staffData.joining_date || staffData.joiningDate,

      // Address fields - Same pattern as customer
      address: staffData.address || null,
      landmark: staffData.landmark || null,

      // Location fields - CRITICAL: Use Id suffix like customer
      // countryId: staffData.countryId ? Number(staffData.countryId) : null,
      // stateId: staffData.stateId ? Number(staffData.stateId) : null,
      // cityId: staffData.cityId ? Number(staffData.cityId) : null,
      // pincodeId: staffData.pincodeId ? Number(staffData.pincodeId) : null,
      city: staffData.city || null, // ✅ Include city
      state: staffData.state || null, // ✅ Include state
      country: staffData.country || null, // ✅ Include country
      zip_code: staffData.zip_code || null, // ✅ Include zip_code

      // Status
      status: staffData.status || "active",

      // Metadata
      createdBy: staffData.createdBy ? Number(staffData.createdBy) : null,
      notes: staffData.notes || null,
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
    console.log("  - roleId:", payload.roleId);
    console.log("  - createdBy:", payload.createdBy);

    const response = await apiClient.post("/staff", payload);
    console.log("✅ Create staff response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating staff:", error);
    console.error("Error response data:", error.response?.data);
    throw error;
  }
};
// Update staff member
export const updateStaff = async (id, staffData) => {
  try {
    console.log(`Updating staff ${id} with data:`, staffData);

    // Format data exactly as backend expects
    const payload = {
      first_name: staffData.first_name,
      last_name: staffData.last_name || null,
      email: staffData.email,
      role_id: parseInt(staffData.role_id) || 2,
      phone: staffData.phone,
      department: staffData.department,
      designation: staffData.designation,
      joining_date: staffData.joining_date,
      address: staffData.address || null,
      city: staffData.city || null,
      state: staffData.state || null,
      country: staffData.country || "India",
      zip_code: staffData.zip_code || null,
      status: staffData.status || "active",
    };

    // Only include password if it's provided (for updates)
    if (staffData.password && staffData.password.trim() !== "") {
      payload.password = staffData.password;
    }

    const response = await apiClient.put(`/staff/${id}`, payload);
    console.log("Update staff response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating staff:", error);
    throw error;
  }
};

// Delete staff member
export const deleteStaff = async (id) => {
  try {
    const response = await apiClient.delete(`/staff/${id}`);
    console.log("Delete staff response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting staff:", error);
    throw error;
  }
};

// ===============================
// STAFF STATISTICS
// ===============================

export const getStaffStatistics = async () => {
  try {
    const response = await apiClient.get("/staff/statistics");
    console.log("Staff statistics response:", response);

    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return {
      totalStaff: 0,
      activeStaff: 0,
      inactiveStaff: 0,
      totalRoles: 0,
      departmentBreakdown: {
        sales: 0,
        accounts: 0,
        inventory: 0,
        admin: 0,
      },
      monthlySalary: 0,
    };
  } catch (error) {
    console.error("Error fetching staff statistics:", error);
    return {
      totalStaff: 0,
      activeStaff: 0,
      inactiveStaff: 0,
      totalRoles: 0,
      departmentBreakdown: {
        sales: 0,
        accounts: 0,
        inventory: 0,
        admin: 0,
      },
      monthlySalary: 0,
    };
  }
};

// ===============================
// ROLE MANAGEMENT
// ===============================

// Get all roles
export const getRoles = async () => {
  try {
    const response = await apiClient.get("/staff/roles");
    console.log("Get roles response:", response);

    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    // Default roles if API returns empty
    return [
      {
        id: 1,
        name: "Admin",
        role_id: "ADMIN",
        description: "Full system access",
      },
      {
        id: 2,
        name: "Accounts",
        role_id: "ACCOUNTS",
        description: "Financial management",
      },
      {
        id: 3,
        name: "Store Manager",
        role_id: "STORE",
        description: "Inventory management",
      },
      {
        id: 4,
        name: "Sales Staff",
        role_id: "STAFF",
        description: "Sales operations",
      },
    ];
  } catch (error) {
    console.error("Error fetching roles:", error);
    // Return default roles on error
    return [
      {
        id: 1,
        name: "Admin",
        role_id: "ADMIN",
        description: "Full system access",
      },
      {
        id: 2,
        name: "Accounts",
        role_id: "ACCOUNTS",
        description: "Financial management",
      },
      {
        id: 3,
        name: "Store Manager",
        role_id: "STORE",
        description: "Inventory management",
      },
      {
        id: 4,
        name: "Sales Staff",
        role_id: "STAFF",
        description: "Sales operations",
      },
    ];
  }
};

// Get role by ID
export const getRoleById = async (id) => {
  try {
    const response = await apiClient.get(`/staff/roles/${id}`);

    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching role by ID:", error);
    throw error;
  }
};

// Create new role
export const createRole = async (roleData) => {
  try {
    const payload = {
      name: roleData.name,
      role_id: roleData.role_id,
      description: roleData.description,
      permissions: roleData.permissions || [],
    };

    const response = await apiClient.post("/staff/roles", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

// Update role
export const updateRole = async (id, roleData) => {
  try {
    const payload = {
      name: roleData.name,
      role_id: roleData.role_id,
      description: roleData.description,
      permissions: roleData.permissions || [],
    };

    const response = await apiClient.put(`/staff/roles/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};

// Delete role
export const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`/staff/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};

// ===============================
// PERMISSIONS
// ===============================

// Get all available permissions
export const getAllPermissions = async () => {
  try {
    const response = await apiClient.get("/staff/permissions");

    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    // Default permissions if API returns empty
    return [
      { id: "view_dashboard", name: "View Dashboard", category: "Dashboard" },
      {
        id: "manage_customers",
        name: "Manage Customers",
        category: "Customers",
      },
      { id: "manage_dealers", name: "Manage Dealers", category: "Dealers" },
      { id: "manage_products", name: "Manage Products", category: "Products" },
      { id: "manage_stock", name: "Manage Stock", category: "Stock" },
      { id: "manage_invoices", name: "Manage Invoices", category: "Invoices" },
      { id: "manage_expenses", name: "Manage Expenses", category: "Expenses" },
      { id: "view_reports", name: "View Reports", category: "Reports" },
      { id: "manage_staff", name: "Manage Staff", category: "Staff" },
      { id: "manage_roles", name: "Manage Roles", category: "Staff" },
      { id: "manage_settings", name: "Manage Settings", category: "Settings" },
    ];
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return [];
  }
};

// ===============================
// HELPER FUNCTIONS FOR FORM DATA
// ===============================

// Get department list for dropdown
export const getDepartments = () => {
  return [
    { value: "Sales", label: "Sales" },
    { value: "Accounts", label: "Accounts" },
    { value: "Inventory", label: "Inventory" },
    { value: "Admin", label: "Admin" },
    { value: "HR", label: "Human Resources" },
    { value: "Operations", label: "Operations" },
  ];
};

// Get status options for dropdown
export const getStatusOptions = () => {
  return [
    { value: "active", label: "Active", variant: "success" },
    { value: "inactive", label: "Inactive", variant: "danger" },
  ];
};

// Get role options for dropdown (formatted for select input)
export const getRoleOptions = async () => {
  try {
    const roles = await getRoles();
    return roles.map((role) => ({
      value: role.id,
      label: role.name,
      role_id: role.role_id,
    }));
  } catch (error) {
    console.error("Error getting role options:", error);
    return [
      { value: 1, label: "Admin" },
      { value: 2, label: "Accounts" },
      { value: 3, label: "Store Manager" },
      { value: 4, label: "Sales Staff" },
    ];
  }
};

// Transform API response to form data format
export const transformStaffToFormData = (staffData) => {
  return {
    first_name: staffData.first_name || "",
    last_name: staffData.last_name || "",
    email: staffData.email || "",
    password: "", // Don't populate password
    role_id: staffData.role_id || 2,
    phone: staffData.phone || "",
    department: staffData.department || "",
    designation: staffData.designation || "",
    joining_date: staffData.joining_date || "",
    address: staffData.address || "",
    city: staffData.city || "",
    state: staffData.state || "",
    country: staffData.country || "India",
    zip_code: staffData.zip_code || "",
    status: staffData.status || "active",
  };
};

// Example of how to use the service with your form data
export const exampleStaffData = {
  first_name: "John",
  last_name: "shon2",
  email: "johnshon2@example.com",
  password: "Admin@3210",
  role_id: 2,
  phone: "+919876548650",
  department: "Sales",
  designation: "Sales Manager",
  joining_date: "2024-01-15",
  address: "123 Main Street",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  zip_code: "400001",
  status: "active",
};
