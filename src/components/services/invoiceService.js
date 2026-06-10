// // frontend/src/components/services/invoiceService.js
// import apiClient from "../../api/client";

// // Get all invoices with filters
// export const getInvoices = async (filters = {}) => {
//   try {
//     const params = new URLSearchParams();
//     if (filters.status) params.append("payment_status", filters.status);
//     if (filters.partyType) params.append("party_type", filters.partyType);
//     if (filters.partyId) params.append("party_id", filters.partyId);
//     if (filters.fromDate) params.append("from_date", filters.fromDate);
//     if (filters.toDate) params.append("to_date", filters.toDate);
//     if (filters.page) params.append("page", filters.page);
//     if (filters.limit) params.append("limit", filters.limit);

//     const response = await apiClient.get(
//       `/invoices${params.toString() ? `?${params.toString()}` : ""}`
//     );
//     console.log("Get invoices response:", response);

//     if (response.data && response.data.data && response.data.data.data) {
//       return response.data.data.data;
//     }
//     if (response.data && response.data.data && Array.isArray(response.data.data)) {
//       return response.data.data;
//     }
//     if (response.data && Array.isArray(response.data)) {
//       return response.data;
//     }
//     return [];
//   } catch (error) {
//     console.error("Error fetching invoices:", error);
//     return [];
//   }
// };

// // Get invoice by ID
// export const getInvoiceById = async (id) => {
//   try {
//     const response = await apiClient.get(`/invoices/${id}`);
//     if (response.data && response.data.data) {
//       return response.data.data;
//     }
//     return null;
//   } catch (error) {
//     console.error("Error fetching invoice by ID:", error);
//     throw error;
//   }
// };

// // Create new invoice with full integration
// export const createInvoice = async (invoiceData) => {
//   try {
//     console.log("📦 Original invoice data received:", invoiceData);

//     // Calculate totals from items
//     let subtotal = 0;
//     let totalDiscount = 0;
//     let totalCGST = 0;
//     let totalSGST = 0;
//     let totalIGST = 0;

//     const processedItems = invoiceData.items.map((item) => {
//       const itemAmount = item.quantity * item.rate;
//       const discountAmt = (itemAmount * (item.discountPercent || 0)) / 100;
//       const taxableValue = itemAmount - discountAmt;

//       // Calculate GST (CGST + SGST for intra-state)
//       const cgst = (taxableValue * (item.gstRate || 0)) / 200;
//       const sgst = (taxableValue * (item.gstRate || 0)) / 200;
//       const igst = 0; // For inter-state, calculate differently
//       const totalAmount = taxableValue + cgst + sgst + igst;

//       subtotal += itemAmount;
//       totalDiscount += discountAmt;
//       totalCGST += cgst;
//       totalSGST += sgst;
//       totalIGST += igst;

//       return {
//         product_id: item.productId,
//         product_code: item.productCode,
//         product_name: item.productName,
//         hsn_code: item.hsnCode,
//         quantity: item.quantity,
//         rate: item.rate,
//         discount_percent: item.discountPercent || 0,
//         discount_amount: discountAmt,
//         taxable_value: taxableValue,
//         cgst: cgst,
//         sgst: sgst,
//         igst: igst,
//         total_amount: totalAmount,
//       };
//     });

//     const totalGST = totalCGST + totalSGST + totalIGST;
//     const totalTaxableValue = subtotal - totalDiscount;
//     const grandTotal = totalTaxableValue + totalGST;

//     // Generate invoice number
//     const invoiceNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

//     const payload = {
//       invoice_no: invoiceData.invoiceNo || invoiceNo,
//       invoice_date: invoiceData.invoiceDate || new Date().toISOString().split("T")[0],
//       due_date: invoiceData.dueDate,
//       party_type: invoiceData.partyType || "customer",
//       party_id: invoiceData.partyId ? Number(invoiceData.partyId) : null,
//       party_name: invoiceData.partyName,
//       party_gst: invoiceData.partyGst || null,
//       party_address: invoiceData.partyAddress || null,
//       place_of_supply: invoiceData.placeOfSupply || null,
//       place_of_delivery: invoiceData.placeOfDelivery || null,
//       transport_mode: invoiceData.transportMode || null,
//       vehicle_number: invoiceData.vehicleNumber || null,
//       delivery_note: invoiceData.deliveryNote || null,
//       items: processedItems,
//       subtotal: subtotal,
//       total_discount: totalDiscount,
//       taxable_amount: totalTaxableValue,
//       cgst: totalCGST,
//       sgst: totalSGST,
//       igst: totalIGST,
//       gst_amount: totalGST,
//       total_amount: grandTotal,
//       round_off: invoiceData.roundOff || 0,
//       net_amount: grandTotal + (invoiceData.roundOff || 0),
//       payment_status: invoiceData.paymentStatus || "Unpaid",
//       paid_amount: invoiceData.paidAmount || 0,
//       balance_amount: (grandTotal + (invoiceData.roundOff || 0)) - (invoiceData.paidAmount || 0),
//       payment_method: invoiceData.paymentMethod || null,
//       transaction_id: invoiceData.transactionId || null,
//       notes: invoiceData.notes || null,
//       terms_conditions: invoiceData.termsConditions || null,
//       amount_in_words: invoiceData.amountInWords || null,
//       created_by: invoiceData.createdBy ? Number(invoiceData.createdBy) : 1,
//     };

//     console.log("📤 Sending payload to backend:", JSON.stringify(payload, null, 2));

//     const response = await apiClient.post("/invoices", payload);
//     console.log("✅ Create invoice response:", response.data);

//     // Update stock after invoice creation (optional)
//     if (response.data && response.data.data && response.data.data.id) {
//       await updateStockAfterInvoice(response.data.data.id, processedItems);
//     }

//     return response.data;
//   } catch (error) {
//     console.error("❌ Error creating invoice:", error);
//     throw error;
//   }
// };

// // Update stock after invoice creation
// const updateStockAfterInvoice = async (invoiceId, items) => {
//   try {
//     for (const item of items) {
//       await apiClient.post("/stock/update", {
//         product_id: item.product_id,
//         quantity: item.quantity,
//         transaction_type: "sale",
//         reference_type: "invoice",
//         reference_id: invoiceId,
//         remarks: "Stock deducted via invoice",
//       });
//     }
//     console.log("✅ Stock updated successfully");
//   } catch (error) {
//     console.error("❌ Error updating stock:", error);
//   }
// };

// // Update invoice
// export const updateInvoice = async (id, invoiceData) => {
//   try {
//     console.log("📦 Updating invoice ID:", id);
//     console.log("Update data:", invoiceData);

//     // Recalculate totals if items changed
//     let updatePayload = { ...invoiceData };

//     if (invoiceData.items) {
//       let subtotal = 0;
//       let totalDiscount = 0;
//       let totalCGST = 0;
//       let totalSGST = 0;
//       let totalIGST = 0;

//       invoiceData.items.forEach((item) => {
//         const itemAmount = item.quantity * item.rate;
//         const discountAmt = (itemAmount * (item.discountPercent || 0)) / 100;
//         const taxableValue = itemAmount - discountAmt;
//         const cgst = (taxableValue * (item.gstRate || 0)) / 200;
//         const sgst = (taxableValue * (item.gstRate || 0)) / 200;
//         const igst = 0;

//         subtotal += itemAmount;
//         totalDiscount += discountAmt;
//         totalCGST += cgst;
//         totalSGST += sgst;
//         totalIGST += igst;
//       });

//       const totalGST = totalCGST + totalSGST + totalIGST;
//       const totalTaxableValue = subtotal - totalDiscount;
//       const grandTotal = totalTaxableValue + totalGST;

//       updatePayload.subtotal = subtotal;
//       updatePayload.total_discount = totalDiscount;
//       updatePayload.taxable_amount = totalTaxableValue;
//       updatePayload.cgst = totalCGST;
//       updatePayload.sgst = totalSGST;
//       updatePayload.igst = totalIGST;
//       updatePayload.gst_amount = totalGST;
//       updatePayload.total_amount = grandTotal;
//       updatePayload.net_amount = grandTotal + (updatePayload.round_off || 0);
//       updatePayload.balance_amount = (grandTotal + (updatePayload.round_off || 0)) - (updatePayload.paid_amount || 0);
//     }

//     const response = await apiClient.put(`/invoices/${id}`, updatePayload);
//     console.log("✅ Update response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error updating invoice:", error);
//     throw error;
//   }
// };

// // Delete invoice
// export const deleteInvoice = async (id) => {
//   try {
//     const response = await apiClient.delete(`/invoices/${id}`);
//     console.log("Delete invoice response:", response);
//     return response.data;
//   } catch (error) {
//     console.error("Error deleting invoice:", error);
//     throw error;
//   }
// };

// // Record payment
// export const recordPayment = async (id, paymentData) => {
//   try {
//     console.log("📦 Recording payment for invoice ID:", id);
//     console.log("Payment data:", paymentData);

//     const payload = {
//       amount: Number(paymentData.amount),
//       date: paymentData.date || new Date().toISOString().split("T")[0],
//       method: paymentData.method,
//       transaction_id: paymentData.transactionId || null,
//       notes: paymentData.notes || null,
//       recorded_by: paymentData.recordedBy ? Number(paymentData.recordedBy) : null,
//     };

//     console.log("📤 Payment payload:", JSON.stringify(payload, null, 2));

//     const response = await apiClient.post(`/invoices/${id}/payments`, payload);
//     console.log("✅ Payment response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error recording payment:", error);
//     throw error;
//   }
// };

// // Get invoice statistics
// export const getInvoiceStats = async () => {
//   try {
//     const response = await apiClient.get("/invoices/stats");
//     console.log("Invoice stats response:", response);

//     if (response.data && response.data.data) {
//       return response.data.data;
//     }
//     return {
//       totalInvoices: 0,
//       totalAmount: 0,
//       paidAmount: 0,
//       unpaidAmount: 0,
//       pendingAmount: 0,
//       overdueAmount: 0,
//     };
//   } catch (error) {
//     console.error("Error fetching invoice stats:", error);
//     return {
//       totalInvoices: 0,
//       totalAmount: 0,
//       paidAmount: 0,
//       unpaidAmount: 0,
//       pendingAmount: 0,
//       overdueAmount: 0,
//     };
//   }
// };

// // Get invoices by status
// export const getInvoicesByStatus = async (status) => {
//   try {
//     const response = await apiClient.get(`/invoices?payment_status=${status}`);

//     if (response.data && response.data.data) {
//       if (response.data.data.data && Array.isArray(response.data.data.data)) {
//         return response.data.data.data;
//       }
//       if (Array.isArray(response.data.data)) {
//         return response.data.data;
//       }
//     }
//     return [];
//   } catch (error) {
//     console.error("Error fetching invoices by status:", error);
//     return [];
//   }
// };

// // Get due invoices
// export const getDueInvoices = async () => {
//   try {
//     const response = await apiClient.get("/invoices/due");

//     if (response.data && response.data.data) {
//       if (response.data.data.data && Array.isArray(response.data.data.data)) {
//         return response.data.data.data;
//       }
//       if (Array.isArray(response.data.data)) {
//         return response.data.data;
//       }
//     }
//     return [];
//   } catch (error) {
//     console.error("Error fetching due invoices:", error);
//     return [];
//   }
// };

// // Get payment statistics
// export const getPaymentStats = async () => {
//   try {
//     const response = await apiClient.get("/invoices/payment-stats");
//     console.log("Payment stats response:", response);

//     if (response.data && response.data.data) {
//       return response.data.data;
//     }
//     return {
//       totalInvoices: 0,
//       totalAmount: 0,
//       paidAmount: 0,
//       pendingAmount: 0,
//       overdueAmount: 0,
//       collectionRate: 0,
//     };
//   } catch (error) {
//     console.error("Error fetching payment stats:", error);
//     return {
//       totalInvoices: 0,
//       totalAmount: 0,
//       paidAmount: 0,
//       pendingAmount: 0,
//       overdueAmount: 0,
//       collectionRate: 0,
//     };
//   }
// };

// // Generate PDF
// export const generateInvoicePDF = async (id) => {
//   try {
//     const response = await apiClient.get(`/invoices/${id}/pdf`, {
//       responseType: "blob",
//     });

//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", `invoice_${id}.pdf`);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);

//     return true;
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     throw error;
//   }
// };

// // Send email
// export const sendInvoiceEmail = async (id, emailData) => {
//   try {
//     const payload = {
//       to: emailData.to,
//       subject: emailData.subject || `Invoice ${id}`,
//       message: emailData.message || null,
//     };

//     const response = await apiClient.post(`/invoices/${id}/email`, payload);
//     return response.data;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error;
//   }
// };

// // Export all functions as default
// export default {
//   getInvoices,
//   getInvoiceById,
//   createInvoice,
//   updateInvoice,
//   deleteInvoice,
//   recordPayment,
//   getInvoiceStats,
//   getInvoicesByStatus,
//   getDueInvoices,
//   getPaymentStats,
//   generateInvoicePDF,
//   sendInvoiceEmail,
// };

// frontend/src/components/services/invoiceService.js
import apiClient from "../../api/client";

// ==============================================
// HELPER FUNCTIONS
// ==============================================

const buildQueryParams = (filters) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("payment_status", filters.status);
  if (filters.partyType) params.append("party_type", filters.partyType);
  if (filters.partyId) params.append("party_id", filters.partyId);
  if (filters.fromDate) params.append("from_date", filters.fromDate);
  if (filters.toDate) params.append("to_date", filters.toDate);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);
  return params;
};

const extractDataFromResponse = (response, defaultValue = []) => {
  if (response.data?.data?.data) return response.data.data.data;
  if (response.data?.data && Array.isArray(response.data.data))
    return response.data.data;
  if (response.data && Array.isArray(response.data)) return response.data;
  return defaultValue;
};

const calculateItemTotals = (item) => {
  const itemAmount = item.quantity * item.rate;
  const discountAmt = (itemAmount * (item.discountPercent || 0)) / 100;
  const taxableValue = itemAmount - discountAmt;
  const gstRate = item.gstRate || 0;
  const cgst = (taxableValue * gstRate) / 200;
  const sgst = (taxableValue * gstRate) / 200;
  const igst = 0;

  return {
    itemAmount,
    discountAmt,
    taxableValue,
    cgst,
    sgst,
    igst,
    totalAmount: taxableValue + cgst + sgst + igst,
  };
};

const calculateInvoiceTotals = (items) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  items.forEach((item) => {
    const totals = calculateItemTotals(item);
    subtotal += totals.itemAmount;
    totalDiscount += totals.discountAmt;
    totalCGST += totals.cgst;
    totalSGST += totals.sgst;
    totalIGST += totals.igst;
  });

  const totalGST = totalCGST + totalSGST + totalIGST;
  const totalTaxableValue = subtotal - totalDiscount;
  const grandTotal = totalTaxableValue + totalGST;

  return {
    subtotal,
    totalDiscount,
    totalCGST,
    totalSGST,
    totalIGST,
    totalGST,
    totalTaxableValue,
    grandTotal,
  };
};

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `INV-${year}${month}-${random}`;
};

const processItems = (items) => {
  return items.map((item) => {
    const totals = calculateItemTotals(item);
    return {
      product_id: item.productId,
      product_code: item.productCode,
      product_name: item.productName,
      hsn_code: item.hsnCode,
      quantity: item.quantity,
      rate: item.rate,
      discount_percent: item.discountPercent || 0,
      discount_amount: totals.discountAmt,
      taxable_value: totals.taxableValue,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      total_amount: totals.totalAmount,
    };
  });
};

// ==============================================
// INVOICE CRUD OPERATIONS
// ==============================================

export const getInvoices = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const url = `/invoices${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get(url);
    console.log("Get invoices response:", response);
    return extractDataFromResponse(response, []);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
};

export const getInvoiceById = async (id) => {
  try {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data?.data || null;
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    throw error;
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    console.log("📦 Original invoice data received:", invoiceData);

    const processedItems = processItems(invoiceData.items || []);
    const totals = calculateInvoiceTotals(invoiceData.items || []);
    const invoiceNo = invoiceData.invoiceNo || generateInvoiceNumber();

    const payload = {
      invoice_no: invoiceNo,
      invoice_date:
        invoiceData.invoiceDate || new Date().toISOString().split("T")[0],
      due_date: invoiceData.dueDate,
      party_type: invoiceData.partyType || "customer",
      party_id: invoiceData.partyId ? Number(invoiceData.partyId) : null,
      party_name: invoiceData.partyName,
      party_gst: invoiceData.partyGst || null,
      party_address: invoiceData.partyAddress || null,
      place_of_supply: invoiceData.placeOfSupply || null,
      place_of_delivery: invoiceData.placeOfDelivery || null,
      transport_mode: invoiceData.transportMode || null,
      vehicle_number: invoiceData.vehicleNumber || null,
      delivery_note: invoiceData.deliveryNote || null,
      items: processedItems,
      subtotal: totals.subtotal,
      total_discount: totals.totalDiscount,
      taxable_amount: totals.totalTaxableValue,
      cgst: totals.totalCGST,
      sgst: totals.totalSGST,
      igst: totals.totalIGST,
      gst_amount: totals.totalGST,
      total_amount: totals.grandTotal,
      round_off: invoiceData.roundOff || 0,
      net_amount: totals.grandTotal + (invoiceData.roundOff || 0),
      payment_status: invoiceData.paymentStatus || "Unpaid",
      paid_amount: invoiceData.paidAmount || 0,
      balance_amount:
        totals.grandTotal +
        (invoiceData.roundOff || 0) -
        (invoiceData.paidAmount || 0),
      payment_method: invoiceData.paymentMethod || null,
      transaction_id: invoiceData.transactionId || null,
      notes: invoiceData.notes || null,
      terms_conditions: invoiceData.termsConditions || null,
      amount_in_words: invoiceData.amountInWords || null,
      created_by: invoiceData.createdBy ? Number(invoiceData.createdBy) : 1,
    };

    console.log(
      "📤 Sending payload to backend:",
      JSON.stringify(payload, null, 2),
    );

    const response = await apiClient.post("/invoices", payload);
    console.log("✅ Create invoice response:", response.data);

    if (response.data?.data?.id) {
      await updateStockAfterInvoice(response.data.data.id, processedItems);
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error creating invoice:", error);
    throw error;
  }
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    console.log("📦 Updating invoice ID:", id);
    console.log("Update data:", invoiceData);

    let updatePayload = { ...invoiceData };

    if (invoiceData.items) {
      const totals = calculateInvoiceTotals(invoiceData.items);

      updatePayload = {
        ...updatePayload,
        subtotal: totals.subtotal,
        total_discount: totals.totalDiscount,
        taxable_amount: totals.totalTaxableValue,
        cgst: totals.totalCGST,
        sgst: totals.totalSGST,
        igst: totals.totalIGST,
        gst_amount: totals.totalGST,
        total_amount: totals.grandTotal,
        net_amount: totals.grandTotal + (updatePayload.round_off || 0),
        balance_amount:
          totals.grandTotal +
          (updatePayload.round_off || 0) -
          (updatePayload.paid_amount || 0),
      };
    }

    const response = await apiClient.put(`/invoices/${id}`, updatePayload);
    console.log("✅ Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating invoice:", error);
    throw error;
  }
};

export const deleteInvoice = async (id) => {
  try {
    const response = await apiClient.delete(`/invoices/${id}`);
    console.log("Delete invoice response:", response);
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

// ==============================================
// STOCK MANAGEMENT
// ==============================================

const updateStockAfterInvoice = async (invoiceId, items) => {
  try {
    for (const item of items) {
      await apiClient.post("/stock/update", {
        product_id: item.product_id,
        quantity: item.quantity,
        transaction_type: "sale",
        reference_type: "invoice",
        reference_id: invoiceId,
        remarks: "Stock deducted via invoice",
      });
    }
    console.log("✅ Stock updated successfully");
  } catch (error) {
    console.error("❌ Error updating stock:", error);
  }
};

// ==============================================
// PAYMENT OPERATIONS
// ==============================================

export const recordPayment = async (id, paymentData) => {
  try {
    console.log("📦 Recording payment for invoice ID:", id);
    console.log("Payment data:", paymentData);

    const payload = {
      amount: Number(paymentData.amount),
      date: paymentData.date || new Date().toISOString().split("T")[0],
      method: paymentData.method,
      transaction_id: paymentData.transactionId || null,
      notes: paymentData.notes || null,
      recorded_by: paymentData.recordedBy
        ? Number(paymentData.recordedBy)
        : null,
    };

    console.log("📤 Payment payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post(`/invoices/${id}/payments`, payload);
    console.log("✅ Payment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error recording payment:", error);
    throw error;
  }
};

// ==============================================
// STATISTICS & REPORTS
// ==============================================

export const getInvoiceStats = async () => {
  try {
    const response = await apiClient.get("/invoices/stats");
    console.log("Invoice stats response:", response);
    return (
      response.data?.data || {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
      }
    );
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    return {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
    };
  }
};

export const getInvoicesByStatus = async (status) => {
  try {
    const response = await apiClient.get(`/invoices?payment_status=${status}`);
    return extractDataFromResponse(response, []);
  } catch (error) {
    console.error("Error fetching invoices by status:", error);
    return [];
  }
};

export const getDueInvoices = async () => {
  try {
    const response = await apiClient.get("/invoices/due");
    return extractDataFromResponse(response, []);
  } catch (error) {
    console.error("Error fetching due invoices:", error);
    return [];
  }
};

export const getPaymentStats = async () => {
  try {
    const response = await apiClient.get("/invoices/payment-stats");
    console.log("Payment stats response:", response);
    return (
      response.data?.data || {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        collectionRate: 0,
      }
    );
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      collectionRate: 0,
    };
  }
};

// ==============================================
// DOCUMENT GENERATION
// ==============================================

export const generateInvoicePDF = async (id) => {
  try {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// ==============================================
// EMAIL OPERATIONS
// ==============================================

export const sendInvoiceEmail = async (id, emailData) => {
  try {
    const payload = {
      to: emailData.to,
      subject: emailData.subject || `Invoice ${id}`,
      message: emailData.message || null,
    };

    const response = await apiClient.post(`/invoices/${id}/email`, payload);
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// ==============================================
// EXPORT ALL FUNCTIONS
// ==============================================

export default {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  getInvoiceStats,
  getInvoicesByStatus,
  getDueInvoices,
  getPaymentStats,
  generateInvoicePDF,
  sendInvoiceEmail,
};
