// Storage keys
const INVOICE_KEY = "invoice_data";
const CUSTOMER_KEY = "gst_customers_data";
const DEALER_KEY = "gst_dealers_data";
const CYLINDER_KEY = "cylinder_data";

// Get sales data for reports
export const getSalesReportData = (period = "monthly") => {
  const invoices = JSON.parse(localStorage.getItem(INVOICE_KEY) || "[]");

  const salesData = {
    totalSales: invoices.reduce((sum, inv) => sum + inv.total, 0),
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter((i) => i.status === "Paid").length,
    unpaidInvoices: invoices.filter(
      (i) => i.status === "Unpaid" || i.status === "Overdue",
    ).length,
    partiallyPaid: invoices.filter((i) => i.status === "Partially Paid").length,
    totalGST: invoices.reduce(
      (sum, inv) => sum + (inv.cgst + inv.sgst + inv.igst),
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
    const month = inv.date.substring(0, 7);
    if (!monthly[month]) {
      monthly[month] = { amount: 0, count: 0 };
    }
    monthly[month].amount += inv.total;
    monthly[month].count++;
  });
  return Object.entries(monthly).map(([month, data]) => ({
    month,
    amount: data.amount,
    count: data.count,
  }));
};

const getTopCustomers = (invoices) => {
  const customerMap = {};
  invoices.forEach((inv) => {
    if (!customerMap[inv.customerName]) {
      customerMap[inv.customerName] = { total: 0, count: 0 };
    }
    customerMap[inv.customerName].total += inv.total;
    customerMap[inv.customerName].count++;
  });
  return Object.entries(customerMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
};

const getTopProducts = (invoices) => {
  const productMap = {};
  invoices.forEach((inv) => {
    inv.items?.forEach((item) => {
      if (!productMap[item.product]) {
        productMap[item.product] = { quantity: 0, amount: 0 };
      }
      productMap[item.product].quantity += item.quantity;
      productMap[item.product].amount += item.amount;
    });
  });
  return Object.entries(productMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
};

// Get stock report data
export const getStockReportData = () => {
  const cylinderData = JSON.parse(
    localStorage.getItem(CYLINDER_KEY) ||
      '{"cylinderTypes":[],"cylinderStock":[],"stockTransactions":[]}',
  );
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
    recentTransactions: stockTransactions.slice(-10).reverse(),
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
    const type = types.find((t) => t.id === s.cylinderTypeId);
    if (type && s.status === "in_stock") {
      total += type.price || 0;
    }
  });
  return total;
};

// Get financial report data
export const getFinancialReportData = () => {
  const invoices = JSON.parse(localStorage.getItem(INVOICE_KEY) || "[]");
  const expenses = [
    { category: "Rent", amount: 50000, month: "2024-03" },
    { category: "Salary", amount: 150000, month: "2024-03" },
    { category: "Utilities", amount: 8500, month: "2024-03" },
    { category: "Marketing", amount: 25000, month: "2024-03" },
    { category: "Transport", amount: 12000, month: "2024-03" },
  ];

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalGSTCollected = invoices.reduce(
    (sum, inv) => sum + (inv.cgst + inv.sgst + inv.igst),
    0,
  );
  const totalITC = 17924; // Input Tax Credit from expenses

  const financialData = {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    totalGSTCollected,
    totalITC,
    netGSTPayable: totalGSTCollected - totalITC,
    profitMargin: ((totalRevenue - totalExpenses) / totalRevenue) * 100,
    revenueByMonth: getRevenueByMonth(invoices),
    expensesByCategory: expenses,
    cashFlow: calculateCashFlow(invoices, expenses),
  };

  return financialData;
};

const getRevenueByMonth = (invoices) => {
  const monthly = {};
  invoices.forEach((inv) => {
    const month = inv.date.substring(0, 7);
    if (!monthly[month]) {
      monthly[month] = 0;
    }
    monthly[month] += inv.total;
  });
  return Object.entries(monthly).map(([month, amount]) => ({ month, amount }));
};

const calculateCashFlow = (invoices, expenses) => {
  const cashFlow = {};
  invoices.forEach((inv) => {
    const month = inv.date.substring(0, 7);
    if (!cashFlow[month]) cashFlow[month] = { income: 0, expense: 0 };
    cashFlow[month].income += inv.total;
  });
  expenses.forEach((exp) => {
    if (!cashFlow[exp.month]) cashFlow[exp.month] = { income: 0, expense: 0 };
    cashFlow[exp.month].expense += exp.amount;
  });
  return Object.entries(cashFlow).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
    profit: data.income - data.expense,
  }));
};

// Get customer report data
export const getCustomerReportData = () => {
  const customers = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "[]");
  const invoices = JSON.parse(localStorage.getItem(INVOICE_KEY) || "[]");

  const customerReport = customers.map((customer) => {
    const customerInvoices = invoices.filter(
      (inv) => inv.customerId === customer.id,
    );
    const totalPurchases = customerInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0,
    );
    const paidAmount = customerInvoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.total, 0);
    const outstanding = totalPurchases - paidAmount;

    return {
      id: customer.id,
      name: customer.name,
      companyName: customer.companyName,
      email: customer.email,
      phone: customer.phone,
      gstin: customer.gstin,
      totalInvoices: customerInvoices.length,
      totalPurchases,
      paidAmount,
      outstanding,
      lastPurchase:
        customerInvoices.length > 0
          ? Math.max(...customerInvoices.map((inv) => new Date(inv.date)))
          : null,
      status: customer.status,
    };
  });

  return {
    customers: customerReport,
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    totalRevenue: customerReport.reduce((sum, c) => sum + c.totalPurchases, 0),
    totalOutstanding: customerReport.reduce((sum, c) => sum + c.outstanding, 0),
    topCustomers: customerReport
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 5),
  };
};

// Get dealer report data
export const getDealerReportData = () => {
  const dealers = JSON.parse(localStorage.getItem(DEALER_KEY) || "[]");
  const invoices = JSON.parse(localStorage.getItem(INVOICE_KEY) || "[]");

  const dealerReport = dealers.map((dealer) => {
    const dealerInvoices = invoices.filter(
      (inv) => inv.customerId === dealer.id,
    );
    const totalSales = dealerInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalCommission = (totalSales * (dealer.commission || 5)) / 100;
    const paidCommission = dealerInvoices
      .filter((inv) => inv.status === "Paid")
      .reduce(
        (sum, inv) => sum + (inv.total * (dealer.commission || 5)) / 100,
        0,
      );

    return {
      id: dealer.id,
      name: dealer.name,
      companyName: dealer.companyName,
      dealerCode: dealer.dealerCode,
      dealerType: dealer.dealerType,
      territory: dealer.territory,
      email: dealer.email,
      phone: dealer.phone,
      totalOrders: dealerInvoices.length,
      totalSales,
      commission: dealer.commission,
      totalCommission,
      paidCommission,
      outstandingCommission: totalCommission - paidCommission,
      status: dealer.status,
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
    topDealers: dealerReport
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
