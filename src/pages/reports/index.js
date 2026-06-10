import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  FaChartLine,
  FaFileInvoice,
  FaWallet,
  FaMoneyBillWave,
  FaFilePdf,
  FaFileCsv,
  FaSpinner,
} from "react-icons/fa";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ReportsDashboard = () => {
  const [period, setPeriod] = useState("This Year");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [summaryCards, setSummaryCards] = useState({
    total_sales: 0,
    gst_collected: 0,
    total_expenses: 0,
    net_profit: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [profitExpenseData, setProfitExpenseData] = useState([]);
  const [expensesBreakdown, setExpensesBreakdown] = useState([]);

  const [exportReports] = useState([
    {
      title: "Sales Report",
      description:
        "Detailed breakdown of all sales with customer and product information",
      icon: <FaChartLine size={32} />,
      bgColor: "#e0e7ff",
      iconColor: "#4f46e5",
      endpoint: "/reports/export/sales",
      requiresCustomerId: false,
    },
    {
      title: "GST Report",
      description: "GSTR-1 ready report with CGST, SGST, and IGST details",
      icon: <FaFileInvoice size={32} />,
      bgColor: "#dcfce7",
      iconColor: "#10b981",
      endpoint: "/reports/export/financial",
      requiresCustomerId: false,
    },
    {
      title: "Customer Report",
      description: "Customer-wise sales and outstanding payment details",
      icon: <FaWallet size={32} />,
      bgColor: "#dbeafe",
      iconColor: "#3b82f6",
      endpoint: "/reports/export/customer",
      requiresCustomerId: true,
    },
    {
      title: "Expense Report",
      description: "Category-wise expense breakdown with GST input credits",
      icon: <FaMoneyBillWave size={32} />,
      bgColor: "#fee2e2",
      iconColor: "#ef4444",
      endpoint: "/reports/export/expenses",
      requiresCustomerId: false,
    },
  ]);

  // API Service - Same as Dashboard
  const apiRequest = async (endpoint) => {
    const token = localStorage.getItem("token");
    const tenantId = localStorage.getItem("tenantId");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId || "14",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  };

  // Fetch expenses directly - Similar to Dashboard
  const fetchExpensesData = async () => {
    try {
      const token = localStorage.getItem("token");
      const tenantId = localStorage.getItem("tenantId");

      const response = await fetch(`${API_BASE_URL}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId || "14",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();

        let expensesArray = [];
        if (result.data && Array.isArray(result.data)) {
          expensesArray = result.data;
        } else if (
          result.data &&
          result.data.data &&
          Array.isArray(result.data.data)
        ) {
          expensesArray = result.data.data;
        } else if (Array.isArray(result)) {
          expensesArray = result;
        }

        // Calculate total expenses
        const totalExpenses = expensesArray.reduce((sum, expense) => {
          return sum + (parseFloat(expense.total_amount) || 0);
        }, 0);

        // Calculate expenses breakdown by category
        const categoryMap = new Map();

        expensesArray.forEach((expense) => {
          const category = expense.category;
          const amount = parseFloat(expense.total_amount) || 0;

          if (categoryMap.has(category)) {
            categoryMap.set(category, categoryMap.get(category) + amount);
          } else {
            categoryMap.set(category, amount);
          }
        });

        const breakdown = Array.from(categoryMap.entries())
          .map(([label, amount]) => ({
            label: label,
            amount: amount,
            width:
              totalExpenses > 0
                ? `${Math.round((amount / totalExpenses) * 100)}%`
                : "0%",
          }))
          .sort((a, b) => b.amount - a.amount);

        setExpensesBreakdown(breakdown);

        // Update summary cards with expenses (net profit remains 0)
        setSummaryCards((prev) => ({
          ...prev,
          total_expenses: totalExpenses,
          net_profit: 0,
        }));

        return { totalExpenses, breakdown };
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      return null;
    }
  };

  // Get date range based on period
  const getDateRange = () => {
    const now = new Date();
    let fromDate, toDate;

    toDate = now.toISOString().split("T")[0];

    switch (period) {
      case "This Month":
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        break;
      case "Last Month":
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          .toISOString()
          .split("T")[0];
        toDate = new Date(now.getFullYear(), now.getMonth(), 0)
          .toISOString()
          .split("T")[0];
        break;
      case "This Quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        fromDate = new Date(now.getFullYear(), quarter * 3, 1)
          .toISOString()
          .split("T")[0];
        break;
      case "This Year":
      default:
        fromDate = new Date(now.getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0];
        break;
    }

    return { fromDate, toDate };
  };

  // Fetch dashboard summary data
  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);

      // Fetch summary from reports endpoint
      const response = await apiRequest("/reports/dashboard-summary");

      if (response.success && response.data) {
        // Set summary cards (net profit forced to 0)
        setSummaryCards({
          total_sales: response.data.summary_cards?.total_sales || 0,
          gst_collected: response.data.summary_cards?.gst_collected || 0,
          total_expenses: response.data.summary_cards?.total_expenses || 0,
          net_profit: 0,
        });

        // Set sales data for chart
        if (
          response.data.yearly_sales &&
          response.data.yearly_sales.length > 0
        ) {
          setSalesData(response.data.yearly_sales);
        } else {
          setDefaultSalesData();
        }

        // Set profit vs expense data
        if (
          response.data.profit_expense_data &&
          response.data.profit_expense_data.length > 0
        ) {
          setProfitExpenseData(response.data.profit_expense_data);
        } else {
          setDefaultProfitExpenseData();
        }
      } else {
        setDefaultData();
      }

      // Also fetch expenses data directly (like Dashboard)
      await fetchExpensesData();
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
      setError(err.message);
      setDefaultData();

      // Try to fetch expenses even if summary fails
      await fetchExpensesData();
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales data based on period
  const fetchSalesData = async () => {
    try {
      const { fromDate, toDate } = getDateRange();
      const response = await apiRequest(
        `/reports/sales?fromDate=${fromDate}&toDate=${toDate}`
      );

      if (response.success && response.data) {
        if (
          response.data.monthly_data &&
          response.data.monthly_data.length > 0
        ) {
          const formattedData = response.data.monthly_data.map((item) => ({
            month: item.month,
            sales: item.total_sales || 0,
          }));
          setSalesData(formattedData);
        }

        if (response.data.summary) {
          setSummaryCards((prev) => ({
            ...prev,
            total_sales: response.data.summary.total_sales || 0,
            gst_collected: response.data.summary.total_gst || 0,
            net_profit: 0,
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
    }
  };

  // Fetch financial data for profit vs expenses
  const fetchFinancialData = async () => {
    try {
      const { fromDate, toDate } = getDateRange();
      const response = await apiRequest(
        `/reports/financial?fromDate=${fromDate}&toDate=${toDate}`
      );

      if (response.success && response.data) {
        if (
          response.data.financial_data &&
          response.data.financial_data.length > 0
        ) {
          setProfitExpenseData(response.data.financial_data);
        } else if (
          response.data.sales_trend &&
          response.data.sales_trend.length > 0
        ) {
          const transformed = response.data.sales_trend.map((item) => ({
            month: item.month,
            profit: item.sales || 0,
            expenses: 0,
          }));
          setProfitExpenseData(transformed);
        }

        if (response.data.profit_loss) {
          setSummaryCards((prev) => ({
            ...prev,
            total_expenses: response.data.profit_loss.total_expenses || 0,
            net_profit: 0,
          }));
        }
      }

      // Refresh expenses data
      await fetchExpensesData();
    } catch (err) {
      console.error("Error fetching financial data:", err);
    }
  };

  // Set default data
  const setDefaultData = () => {
    setDefaultSalesData();
    setDefaultProfitExpenseData();
    setSummaryCards({
      total_sales: 0,
      gst_collected: 0,
      total_expenses: 0,
      net_profit: 0,
    });
  };

  const setDefaultSalesData = () => {
    setSalesData([
      { month: "Jan", sales: 0 },
      { month: "Feb", sales: 0 },
      { month: "Mar", sales: 0 },
      { month: "Apr", sales: 0 },
      { month: "May", sales: 0 },
      { month: "Jun", sales: 0 },
      { month: "Jul", sales: 0 },
      { month: "Aug", sales: 0 },
      { month: "Sep", sales: 0 },
      { month: "Oct", sales: 0 },
      { month: "Nov", sales: 0 },
      { month: "Dec", sales: 0 },
    ]);
  };

  const setDefaultProfitExpenseData = () => {
    setProfitExpenseData([
      { month: "Jan", profit: 0, expenses: 0 },
      { month: "Feb", profit: 0, expenses: 0 },
      { month: "Mar", profit: 0, expenses: 0 },
      { month: "Apr", profit: 0, expenses: 0 },
      { month: "May", profit: 0, expenses: 0 },
      { month: "Jun", profit: 0, expenses: 0 },
    ]);
  };

  // Handle period change
  const handlePeriodChange = async (e) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    setLoading(true);

    try {
      await Promise.all([fetchSalesData(), fetchFinancialData()]);
    } catch (err) {
      console.error("Error fetching data for period:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle export report
  const handleExport = async (
    reportType,
    format,
    endpoint,
    requiresCustomerId = false
  ) => {
    try {
      const { fromDate, toDate } = getDateRange();
      const token = localStorage.getItem("token");
      const tenantId = localStorage.getItem("tenantId");

      let url = `${API_BASE_URL}${endpoint}?format=${format}&fromDate=${fromDate}&toDate=${toDate}`;

      // If customer report, prompt for customer ID
      if (requiresCustomerId) {
        const customerId = prompt("Enter Customer ID:");
        if (!customerId) {
          alert("Customer ID is required to generate this report");
          return;
        }
        url = `${API_BASE_URL}${endpoint}/${customerId}?format=${format}&fromDate=${fromDate}&toDate=${toDate}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId || "14",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        if (format === "csv" || format === "xlsx") {
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `${reportType.toLowerCase().replace(/ /g, "_")}_${
            Date.now()
          }.${format === "csv" ? "csv" : "xlsx"}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          alert(
            `${reportType} exported as ${format.toUpperCase()} successfully!`
          );
        } else {
          // For PDF, open in new window
          window.open(downloadUrl, "_blank");
          setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
          alert(`${reportType} exported as PDF successfully!`);
        }
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Export failed");
      }
    } catch (err) {
      console.error("Error exporting report:", err);
      alert(`Failed to export ${reportType}. ${err.message}`);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  // Fetch data when period changes
  useEffect(() => {
    if (period !== "This Year") {
      fetchSalesData();
      fetchFinancialData();
    }
  }, [period]);

  if (loading && salesData.every((item) => item.sales === 0)) {
    return (
      <Container
        fluid
        className="p-3 bg-light min-vh-100 d-flex align-items-center justify-content-center"
      >
        <div className="text-center">
          <FaSpinner className="fa-spin mb-3" size={40} color="#4f46e5" />
          <h5>Loading Reports Dashboard...</h5>
          <p className="text-muted">Fetching latest data</p>
        </div>
      </Container>
    );
  }

  if (error && salesData.every((item) => item.sales === 0)) {
    return (
      <Container
        fluid
        className="p-3 bg-light min-vh-100 d-flex align-items-center justify-content-center"
      >
        <div className="text-center">
          <div className="mb-3" style={{ fontSize: "48px" }}>
            ⚠️
          </div>
          <h5 className="text-danger">Error Loading Data</h5>
          <p className="text-muted">{error}</p>
          <Button variant="primary" onClick={() => fetchDashboardSummary()}>
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-3 bg-light min-vh-100">
      {/* Filter */}
      <Row className="mb-3">
        <Col md={4}>
          <div className="d-flex align-items-center">
            <label className="fw-semibold me-2 text-secondary small">
              Report Period:
            </label>
            <Form.Select
              value={period}
              onChange={handlePeriodChange}
              style={{
                maxWidth: "200px",
                borderRadius: "10px",
                fontSize: "12px",
                padding: "4px 8px",
              }}
              size="sm"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </Form.Select>
            {loading && (
              <FaSpinner className="ms-2 fa-spin" color="#4f46e5" size={14} />
            )}
          </div>
        </Col>
      </Row>

      {/* Summary Cards - Net Profit Showing 0 */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body className="p-3">
              <h6 className="text-secondary mb-1 small">Total Sales</h6>
              <h3
                className="fw-bold text-dark mb-1"
                style={{ fontSize: "1.5rem" }}
              >
                ₹{summaryCards.total_sales.toLocaleString("en-IN")}
              </h3>
              <small className="text-success" style={{ fontSize: "11px" }}>
                {period.toLowerCase()}
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body className="p-3">
              <h6 className="text-secondary mb-1 small">GST Collected</h6>
              <h3
                className="fw-bold mb-1"
                style={{ color: "#10B981", fontSize: "1.5rem" }}
              >
                ₹{summaryCards.gst_collected.toLocaleString("en-IN")}
              </h3>
              <small className="text-success" style={{ fontSize: "11px" }}>
                {period.toLowerCase()}
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body className="p-3">
              <h6 className="text-secondary mb-1 small">Total Expenses</h6>
              <h3
                className="fw-bold mb-1"
                style={{ color: "#F59E0B", fontSize: "1.5rem" }}
              >
                ₹{summaryCards.total_expenses.toLocaleString("en-IN")}
              </h3>
              <small className="text-danger" style={{ fontSize: "11px" }}>
                {period.toLowerCase()}
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body className="p-3">
              <h6 className="text-secondary mb-1 small">Net Profit</h6>
              <h3
                className="fw-bold mb-1"
                style={{ color: "#2563EB", fontSize: "1.5rem" }}
              >
                ₹{summaryCards.net_profit.toLocaleString("en-IN")}
              </h3>
              <small className="text-success" style={{ fontSize: "11px" }}>
                {period.toLowerCase()}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-3 mb-4">
        {/* Sales Trend */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ fontSize: "1rem" }}>
                  Sales Trend
                </h5>
                <Badge
                  bg="primary"
                  className="rounded-pill px-2 py-1"
                  style={{ fontSize: "10px" }}
                >
                  {period}
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `₹${(value / 1000).toFixed(0)}k`
                        : `₹${value}`
                    }
                    stroke="#64748b"
                    fontSize={10}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      "Sales",
                    ]}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "11px",
                      padding: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Profit vs Expenses */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ fontSize: "1rem" }}>
                  Profit vs Expenses
                </h5>
                <Badge
                  bg="success"
                  className="rounded-pill px-2 py-1"
                  style={{ fontSize: "10px" }}
                >
                  Last 6 Months
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `₹${(value / 1000).toFixed(0)}k`
                        : `₹${value}`
                    }
                    stroke="#64748b"
                    fontSize={10}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `₹${value.toLocaleString()}`,
                      name === "profit" ? "Profit" : "Expenses",
                    ]}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "11px",
                      padding: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar
                    dataKey="profit"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    name="Profit"
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                    name="Expenses"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Export Reports Section */}
      <h5 className="fw-bold mb-3 mt-2" style={{ color: "#1e293b" }}>
        Export Reports
      </h5>
      <Row className="g-4 mb-4">
        {exportReports.map((report, idx) => (
          <Col md={6} lg={3} key={idx}>
            <Card className="border-0 shadow-sm rounded-4 report-card h-100">
              <Card.Body className="p-4 text-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: report.bgColor,
                  }}
                >
                  <div style={{ color: report.iconColor }}>{report.icon}</div>
                </div>
                <h6 className="fw-bold mb-2">{report.title}</h6>
                <p
                  className="text-muted mb-3"
                  style={{ fontSize: "11px", lineHeight: "1.4" }}
                >
                  {report.description}
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="rounded-pill px-3 d-flex align-items-center gap-1"
                    onClick={() =>
                      handleExport(
                        report.title,
                        "pdf",
                        report.endpoint,
                        report.requiresCustomerId
                      )
                    }
                  >
                    <FaFilePdf size={12} /> PDF
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="rounded-pill px-3 d-flex align-items-center gap-1"
                    onClick={() =>
                      handleExport(
                        report.title,
                        "csv",
                        report.endpoint,
                        report.requiresCustomerId
                      )
                    }
                  >
                    <FaFileCsv size={12} /> CSV
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style>{`
        .rounded-3 {
          border-radius: 12px !important;
        }
        
        .rounded-4 {
          border-radius: 16px !important;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
        }
        
        .report-card {
          cursor: pointer;
        }
        
        .report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
        
        .recharts-default-tooltip {
          border-radius: 10px !important;
        }
        
        .bg-light {
          background-color: #f8f9fa !important;
        }
        
        .form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .fa-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Container>
  );
};

export default ReportsDashboard;