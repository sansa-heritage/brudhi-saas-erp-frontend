import apiClient from "../../api/client";

// Get all expenses
export const getExpenses = async () => {
  try {
    const response = await apiClient.get("/expenses");
    console.log("Get expenses response:", response);

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
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

// Get expense by ID
export const getExpenseById = async (id) => {
  try {
    const response = await apiClient.get(`/expenses/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching expense by ID:", error);
    throw error;
  }
};

// Create new expense
export const addExpense = async (expenseData) => {
  try {
    console.log("Sending expense data:", expenseData);

    // Use camelCase to match Postman/backend expectations
    const payload = {
      category: expenseData.category,
      expenseDate: expenseData.expense_date || expenseData.expenseDate, // ✅ camelCase
      amount: Number(expenseData.amount) || 0,
      taxAmount:
        Number(expenseData.tax_amount) || Number(expenseData.taxAmount) || 0, // ✅ camelCase
      totalAmount:
        Number(expenseData.total_amount) ||
        Number(expenseData.totalAmount) ||
        0, // ✅ camelCase
      description: expenseData.description || null,
      referenceNo: expenseData.reference_no || expenseData.referenceNo || null, // ✅ camelCase
      receiptPath: expenseData.receipt_path || expenseData.receiptPath || null, // ✅ camelCase
      paymentStatus:
        expenseData.payment_status || expenseData.paymentStatus || "Pending", // ✅ camelCase
      createdBy: expenseData.created_by || expenseData.createdBy || 4, // ✅ camelCase
    };

    console.log("Formatted payload (camelCase):", payload);
    console.log("expenseDate value:", payload.expenseDate);

    const response = await apiClient.post("/expenses", payload);
    return response.data;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};
// Update expense
export const updateExpense = async (id, expenseData) => {
  try {
    console.log("=== UPDATE EXPENSE DEBUG ===");
    console.log("Updating expense ID:", id);
    console.log("Received expenseData:", expenseData);

    // Map all fields to match backend expectations (camelCase)
    const payload = {
      category: expenseData.category,
      expenseDate: expenseData.expenseDate || expenseData.expense_date,
      amount: Number(expenseData.amount) || 0,
      taxAmount:
        Number(expenseData.taxAmount) || Number(expenseData.tax_amount) || 0,
      totalAmount:
        Number(expenseData.totalAmount) ||
        Number(expenseData.total_amount) ||
        0,
      description: expenseData.description || null,
      referenceNo: expenseData.referenceNo || expenseData.reference_no || null,
      receiptPath: expenseData.receiptPath || expenseData.receipt_path || null,
      paymentStatus:
        expenseData.paymentStatus || expenseData.payment_status || "Pending",
      createdBy: expenseData.createdBy || expenseData.created_by || 4,
    };

    console.log("Final update payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.put(`/expenses/${id}`, payload);
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};
// Delete expense
export const deleteExpense = async (id) => {
  try {
    const response = await apiClient.delete(`/expenses/${id}`);
    console.log("Delete expense response:", response);
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};