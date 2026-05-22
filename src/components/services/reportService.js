// Storage keys
const INVOICE_KEY = "invoice_data";
const CUSTOMER_KEY = "gst_customers_data";
const DEALER_KEY = "gst_dealers_data";
const CYLINDER_KEY = "cylinder_data";

// Helper function to safely get data from localStorage
const getLocalStorageData = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
};

// Get sales data for reports
export const getSalesReportData = (period = "monthly") => {
  const invoices = getLocalStorageData(INVOICE_KEY, []);

  const salesData = {
    totalSales: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter((i) => i.status === "Paid").length,
    unpaidInvoices: invoices.filter(
      (i) => i.status === "Unpaid" || i.status === "Overdue",
    ).length,
    partiallyPaid: invoices.filter((i) => i.status === "Partially Paid").length,
    totalGST: invoices.reduce(
      (sum, inv) => sum + (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0),
      0,
    ),
    monthlyData: getMonthlySalesData(invoices),
    topCustomers: getTopCustomers(invoices),
    topProducts: getTopProducts(invoices),
  };

  return salesData;
};

const getMonthlySalesData = (invoices) => {
  const monthly = {};
  invoices.forEach((inv) => {
    if (inv.date) {
      const month = inv.date.substring(0, 7);
      if (!monthly[month]) {
        monthly[month] = { amount: 0, count: 0 };
      }
      monthly[month].amount += inv.total || 0;
      monthly[month].count++;
    }
  });
  return Object.entries(monthly)
    .map(([month, data]) => ({
      month,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const getTopCustomers = (invoices) => {
  const customerMap = {};
  invoices.forEach((inv) => {
    if (inv.customerName) {
      if (!customerMap[inv.customerName]) {
        customerMap[inv.customerName] = { total: 0, count: 0 };
      }
      customerMap[inv.customerName].total += inv.total || 0;
      customerMap[inv.customerName].count++;
    }
  });
  return Object.entries(customerMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
};

const getTopProducts = (invoices) => {
  const productMap = {};
  invoices.forEach((inv) => {
    if (inv.items && Array.isArray(inv.items)) {
      inv.items.forEach((item) => {
        if (item.product) {
          if (!productMap[item.product]) {
            productMap[item.product] = { quantity: 0, amount: 0 };
          }
          productMap[item.product].quantity += item.quantity || 0;
          productMap[item.product].amount += item.amount || 0;
        }
      });
    }
  });
  return Object.entries(productMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
};

// Get stock report data
export const getStockReportData = () => {
  const cylinderData = getLocalStorageData(CYLINDER_KEY, {
    cylinderTypes: [],
    cylinderStock: [],
    stockTransactions: [],
  });
  const {
    cylinderTypes = [],
    cylinderStock = [],
    stockTransactions = [],
  } = cylinderData;

  const stockData = {
    totalTypes: cylinderTypes.length,
    totalCylinders: cylinderStock.length,
    inStock: cylinderStock.filter((s) => s.status === "in_stock").length,
    issued: cylinderStock.filter((s) => s.status === "issued").length,
    damaged: cylinderStock.filter((s) => s.status === "damaged").length,
    underMaintenance: cylinderStock.filter(
      (s) => s.status === "under_maintenance",
    ).length,
    returned: cylinderStock.filter((s) => s.status === "returned").length,
    stockByType: getStockByType(cylinderTypes, cylinderStock),
    recentTransactions: [...stockTransactions].reverse().slice(0, 10),
    totalStockValue: calculateStockValue(cylinderTypes, cylinderStock),
  };

  return stockData;
};

const getStockByType = (types, stock) => {
  return types.map((type) => ({
    name: type.name,
    code: type.code,
    inStock: stock.filter(
      (s) => s.cylinderTypeId === type.id && s.status === "in_stock",
    ).length,
    issued: stock.filter(
      (s) => s.cylinderTypeId === type.id && s.status === "issued",
    ).length,
    damaged: stock.filter(
      (s) => s.cylinderTypeId === type.id && s.status === "damaged",
    ).length,
  }));
};

const calculateStockValue = (types, stock) => {
  let total = 0;
  stock.forEach((s) => {
    if (s.status === "in_stock") {
      const type = types.find((t) => t.id === s.cylinderTypeId);
      if (type && type.price) {
        total += type.price;
      }
    }
  });
  return total;
};

// Get financial report data
export const getFinancialReportData = () => {
  const invoices = getLocalStorageData(INVOICE_KEY, []);

  // Sample expenses data (in real app, this would come from expenses service)
  const expenses = [
    { category: "Rent", amount: 50000, month: getCurrentMonth() },
    { category: "Salary", amount: 150000, month: getCurrentMonth() },
    { category: "Utilities", amount: 8500, month: getCurrentMonth() },
    { category: "Marketing", amount: 25000, month: getCurrentMonth() },
    { category: "Transport", amount: 12000, month: getCurrentMonth() },
    { category: "Office Supplies", amount: 5000, month: getCurrentMonth() },
  ];

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalGSTCollected = invoices.reduce(
    (sum, inv) => sum + (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0),
    0,
  );
  const totalITC = 17924; // Input Tax Credit from expenses (sample)

  const financialData = {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    totalGSTCollected,
    totalITC,
    netGSTPayable: Math.max(0, totalGSTCollected - totalITC),
    profitMargin:
      totalRevenue > 0
        ? ((totalRevenue - totalExpenses) / totalRevenue) * 100
        : 0,
    revenueByMonth: getRevenueByMonth(invoices),
    expensesByCategory: expenses,
    cashFlow: calculateCashFlow(invoices, expenses),
  };

  return financialData;
};

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getRevenueByMonth = (invoices) => {
  const monthly = {};
  invoices.forEach((inv) => {
    if (inv.date) {
      const month = inv.date.substring(0, 7);
      if (!monthly[month]) {
        monthly[month] = 0;
      }
      monthly[month] += inv.total || 0;
    }
  });
  return Object.entries(monthly)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const calculateCashFlow = (invoices, expenses) => {
  const cashFlow = {};

  invoices.forEach((inv) => {
    if (inv.date) {
      const month = inv.date.substring(0, 7);
      if (!cashFlow[month]) cashFlow[month] = { income: 0, expense: 0 };
      cashFlow[month].income += inv.total || 0;
    }
  });

  expenses.forEach((exp) => {
    if (!cashFlow[exp.month]) cashFlow[exp.month] = { income: 0, expense: 0 };
    cashFlow[exp.month].expense += exp.amount;
  });

  return Object.entries(cashFlow)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      profit: data.income - data.expense,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

// Get customer report data
export const getCustomerReportData = () => {
  const customers = getLocalStorageData(CUSTOMER_KEY, []);
  const invoices = getLocalStorageData(INVOICE_KEY, []);

  const customerReport = customers.map((customer) => {
    const customerInvoices = invoices.filter(
      (inv) => inv.customerId === customer.id,
    );
    const totalPurchases = customerInvoices.reduce(
      (sum, inv) => sum + (inv.total || 0),
      0,
    );
    const paidAmount = customerInvoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const outstanding = totalPurchases - paidAmount;

    return {
      id: customer.id,
      name: customer.name || "N/A",
      companyName: customer.companyName || "",
      email: customer.email || "N/A",
      phone: customer.phone || "N/A",
      gstin: customer.gstin || "N/A",
      totalInvoices: customerInvoices.length,
      totalPurchases,
      paidAmount,
      outstanding,
      lastPurchase:
        customerInvoices.length > 0
          ? customerInvoices.reduce(
              (latest, inv) => (inv.date > latest ? inv.date : latest),
              customerInvoices[0].date,
            )
          : null,
      status: customer.status || "active",
    };
  });

  return {
    customers: customerReport,
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    totalRevenue: customerReport.reduce((sum, c) => sum + c.totalPurchases, 0),
    totalOutstanding: customerReport.reduce((sum, c) => sum + c.outstanding, 0),
    topCustomers: [...customerReport]
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 5),
  };
};

// Get dealer report data
export const getDealerReportData = () => {
  const dealers = getLocalStorageData(DEALER_KEY, []);
  const invoices = getLocalStorageData(INVOICE_KEY, []);

  const dealerReport = dealers.map((dealer) => {
    const dealerInvoices = invoices.filter(
      (inv) => inv.customerId === dealer.id,
    );
    const totalSales = dealerInvoices.reduce(
      (sum, inv) => sum + (inv.total || 0),
      0,
    );
    const commissionRate = dealer.commission || 5;
    const totalCommission = (totalSales * commissionRate) / 100;
    const paidCommission = dealerInvoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + ((inv.total || 0) * commissionRate) / 100, 0);

    return {
      id: dealer.id,
      name: dealer.name || "N/A",
      companyName: dealer.companyName || "",
      dealerCode: dealer.dealerCode || `DLR${dealer.id}`,
      dealerType: dealer.dealerType || "retailer",
      territory: dealer.territory || "N/A",
      email: dealer.email || "N/A",
      phone: dealer.phone || "N/A",
      totalOrders: dealerInvoices.length,
      totalSales,
      commission: commissionRate,
      totalCommission,
      paidCommission,
      outstandingCommission: totalCommission - paidCommission,
      status: dealer.status || "active",
    };
  });

  return {
    dealers: dealerReport,
    totalDealers: dealers.length,
    activeDealers: dealers.filter((d) => d.status === "active").length,
    totalSales: dealerReport.reduce((sum, d) => sum + d.totalSales, 0),
    totalCommission: dealerReport.reduce(
      (sum, d) => sum + d.totalCommission,
      0,
    ),
    topDealers: [...dealerReport]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5),
  };
};

// Export reports as PDF (simulated)
export const exportReport = (reportType, data) => {
  console.log(`Exporting ${reportType} report:`, data);
  alert(`${reportType} report exported successfully! (Demo)`);
  return true;
};
