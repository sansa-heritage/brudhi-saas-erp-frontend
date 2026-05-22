import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
} from "react-bootstrap";
import {
  FaChartLine,
  FaRupeeSign,
  FaFileInvoice,
  FaMoneyBillWave,
  FaDownload,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaChartBar,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const Reports = () => {
  const [reportPeriod, setReportPeriod] = useState("month");

  // Yearly Sales Data (Jan to Dec)
  const yearlySalesData = [
    { month: "Jan", sales: 320000, profit: 95000 },
    { month: "Feb", sales: 350000, profit: 105000 },
    { month: "Mar", sales: 380000, profit: 115000 },
    { month: "Apr", sales: 420000, profit: 125000 },
    { month: "May", sales: 450000, profit: 135000 },
    { month: "Jun", sales: 480000, profit: 145000 },
    { month: "Jul", sales: 510000, profit: 155000 },
    { month: "Aug", sales: 530000, profit: 160000 },
    { month: "Sep", sales: 520000, profit: 158000 },
    { month: "Oct", sales: 540000, profit: 165000 },
    { month: "Nov", sales: 560000, profit: 170000 },
    { month: "Dec", sales: 542800, profit: 165000 },
  ];

  // Profit vs Expenses Data (Last 6 months - Jul to Dec)
  const profitExpensesData = [
    { month: "Jul", profit: 155000, expenses: 355000 },
    { month: "Aug", profit: 160000, expenses: 370000 },
    { month: "Sep", profit: 158000, expenses: 362000 },
    { month: "Oct", profit: 165000, expenses: 375000 },
    { month: "Nov", profit: 170000, expenses: 390000 },
    { month: "Dec", profit: 165000, expenses: 377800 },
  ];

  // Stats Data
  const stats = [
    {
      title: "Total Sales",
      value: "₹5,42,800",
      change: "+12.5%",
      icon: <FaRupeeSign size={28} />,
      color: "primary",
      bg: "bg-primary",
    },
    {
      title: "GST Collected",
      value: "₹82,800",
      change: "+8.2%",
      icon: <FaFileInvoice size={28} />,
      color: "success",
      bg: "bg-success",
    },
    {
      title: "Total Expenses",
      value: "₹3,50,500",
      change: "+5.1%",
      icon: <FaMoneyBillWave size={28} />,
      color: "danger",
      bg: "bg-danger",
    },
    {
      title: "Net Profit",
      value: "₹1,92,300",
      change: "+15.3%",
      icon: <FaArrowUp size={28} />,
      color: "warning",
      bg: "bg-warning",
    },
  ];

  const formatYAxis = (value) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-3 shadow-sm border">
          <p className="fw-bold mb-2">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="mb-1 small" style={{ color: p.color }}>
              {p.name}: ₹{p.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Container fluid className="p-4 bg-light">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Reports</h2>
          <p className="text-muted">Generate and export business reports</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="d-flex align-items-center gap-2">
            <FaCalendarAlt className="text-muted" />
            <Form.Select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="rounded-pill"
              style={{ width: "140px" }}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </Form.Select>
          </div>
          <Button variant="primary" className="rounded-pill px-4">
            <FaDownload className="me-2" /> Export All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {stats.map((stat, idx) => (
          <Col md={3} key={idx}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small">{stat.title}</span>
                    <h3 className="fw-bold mb-1 mt-1">{stat.value}</h3>
                    <span className={`text-${stat.color} small`}>
                      {stat.change} from last month
                    </span>
                  </div>
                  <div className={`${stat.bg} bg-opacity-10 rounded-3 p-2`}>
                    <div className={`text-${stat.color}`}>{stat.icon}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Yearly Sales Trend Chart */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="fw-bold mb-0">Yearly Sales Trend</h6>
                  <small className="text-muted">Monthly sales and profit overview</small>
                </div>
                <Badge bg="primary" className="rounded-pill px-3 py-2">
                  Jan - Dec 2024
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={yearlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis
                    tickFormatter={formatYAxis}
                    stroke="#64748b"
                    fontSize={12}
                    domain={[250000, 1000000]}
                    ticks={[250000, 500000, 750000, 1000000]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <small className="text-muted">Y-axis: ₹250k to ₹1000k</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Stats Summary */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">Quick Statistics</h6>
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span className="text-muted">Total Invoices</span>
                  <span className="fw-bold">156</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span className="text-muted">Paid Invoices</span>
                  <span className="fw-bold text-success">124 (79.5%)</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span className="text-muted">Pending Invoices</span>
                  <span className="fw-bold text-warning">32 (20.5%)</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span className="text-muted">Average Order Value</span>
                  <span className="fw-bold">₹3,479</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Profit Margin</span>
                  <span className="fw-bold text-success">35.4%</span>
                </div>
              </div>
              <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                <div className="d-flex align-items-center gap-2">
                  <FaArrowUp className="text-primary" />
                  <span className="small fw-semibold">
                    Overall growth: +15.3% compared to last month
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Profit vs Expenses Chart */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="fw-bold mb-0">Profit vs Expenses</h6>
                  <small className="text-muted">Last 6 months comparison</small>
                </div>
                <Badge bg="success" className="rounded-pill px-3 py-2">
                  Jul - Dec 2024
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={profitExpensesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis
                    tickFormatter={formatYAxis}
                    stroke="#64748b"
                    fontSize={12}
                    domain={[250000, 1000000]}
                    ticks={[250000, 500000, 750000, 1000000]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <small className="text-muted">Y-axis: ₹250k to ₹1000k</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Category Sales */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">Sales by Category</h6>
              <div className="mb-4">
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small">LPG Cylinders</span>
                    <span className="small fw-semibold">₹3,20,000 (59%)</span>
                  </div>
                  <div className="rounded-pill" style={{ height: "8px", backgroundColor: "#e2e8f0", overflow: "hidden" }}>
                    <div className="rounded-pill" style={{ width: "59%", height: "100%", backgroundColor: "#3b82f6" }} />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small">Accessories</span>
                    <span className="small fw-semibold">₹1,25,000 (23%)</span>
                  </div>
                  <div className="rounded-pill" style={{ height: "8px", backgroundColor: "#e2e8f0", overflow: "hidden" }}>
                    <div className="rounded-pill" style={{ width: "23%", height: "100%", backgroundColor: "#10b981" }} />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small">Services</span>
                    <span className="small fw-semibold">₹97,800 (18%)</span>
                  </div>
                  <div className="rounded-pill" style={{ height: "8px", backgroundColor: "#e2e8f0", overflow: "hidden" }}>
                    <div className="rounded-pill" style={{ width: "18%", height: "100%", backgroundColor: "#f59e0b" }} />
                  </div>
                </div>
              </div>
              <div className="bg-light rounded-3 p-3 mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted">Total Categories</span>
                  <span className="fw-semibold">3</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="small text-muted">Top Category</span>
                  <span className="fw-semibold text-primary">LPG Cylinders (59%)</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Export Reports Section */}
      <h5 className="fw-bold mb-3 mt-2">Export Reports</h5>
      <Row className="g-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 report-card">
            <Card.Body className="p-3 text-center">
              <FaChartLine size={32} className="text-primary mb-2" />
              <h6 className="fw-bold mb-1">Sales Report</h6>
              <p className="small text-muted mb-2">Detailed sales breakdown</p>
              <div className="d-flex justify-content-center gap-2">
                <Button variant="outline-danger" size="sm" className="rounded-pill px-3">PDF</Button>
                <Button variant="outline-success" size="sm" className="rounded-pill px-3">CSV</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 report-card">
            <Card.Body className="p-3 text-center">
              <FaFileInvoice size={32} className="text-success mb-2" />
              <h6 className="fw-bold mb-1">GST Report</h6>
              <p className="small text-muted mb-2">GSTR-1 ready report</p>
              <div className="d-flex justify-content-center gap-2">
                <Button variant="outline-danger" size="sm" className="rounded-pill px-3">PDF</Button>
                <Button variant="outline-success" size="sm" className="rounded-pill px-3">CSV</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 report-card">
            <Card.Body className="p-3 text-center">
              <FaWallet size={32} className="text-info mb-2" />
              <h6 className="fw-bold mb-1">Customer Report</h6>
              <p className="small text-muted mb-2">Customer-wise sales</p>
              <div className="d-flex justify-content-center gap-2">
                <Button variant="outline-danger" size="sm" className="rounded-pill px-3">PDF</Button>
                <Button variant="outline-success" size="sm" className="rounded-pill px-3">CSV</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 report-card">
            <Card.Body className="p-3 text-center">
              <FaMoneyBillWave size={32} className="text-danger mb-2" />
              <h6 className="fw-bold mb-1">Expense Report</h6>
              <p className="small text-muted mb-2">Category-wise expenses</p>
              <div className="d-flex justify-content-center gap-2">
                <Button variant="outline-danger" size="sm" className="rounded-pill px-3">PDF</Button>
                <Button variant="outline-success" size="sm" className="rounded-pill px-3">CSV</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* GST Summary Table */}
      <Row className="g-4 mt-2">
        <Col md={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">GST Summary</h6>
              <div className="table-responsive">
                <table className="table table-borderless">
                  <thead className="bg-light">
                    <tr>
                      <th className="rounded-start-3">Tax Type</th>
                      <th>Collected (₹)</th>
                      <th>Paid (ITC)</th>
                      <th className="rounded-end-3">Net Payable</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">CGST</td>
                      <td>41,400</td>
                      <td>8,962</td>
                      <td className="text-danger fw-semibold">32,438</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">SGST</td>
                      <td>41,400</td>
                      <td>8,962</td>
                      <td className="text-danger fw-semibold">32,438</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">IGST</td>
                      <td>0</td>
                      <td>0</td>
                      <td className="text-success fw-semibold">0</td>
                    </tr>
                    <tr className="border-top">
                      <td className="fw-bold">Total</td>
                      <td className="fw-bold">82,800</td>
                      <td className="fw-bold">17,924</td>
                      <td className="fw-bold text-primary">64,876</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx="true">{`
        .rounded-4 {
          border-radius: 1rem !important;
        }
        .report-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default Reports;