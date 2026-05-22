import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import {
  FaChartLine,
  FaRupeeSign,
  FaFileInvoice,
  FaDownload,
  FaCalendarAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getSalesReportData, exportReport } from "../../components/services/reportService";

const SalesReport = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = () => {
    const data = getSalesReportData(period);
    setReportData(data);
    setLoading(false);
  };

  const handleExport = () => {
    exportReport("Sales", reportData);
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">Loading...</div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 mb-2"
            onClick={() => navigate("/reports")}
          >
            <FaArrowLeft className="me-2" /> Back to Reports
          </Button>
          <h2 className="fw-bold mb-1">
            <FaChartLine className="me-2 text-primary" /> Sales Report
          </h2>
          <p className="text-muted">
            Track sales performance and revenue analysis
          </p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-pill"
            style={{ width: "150px" }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Form.Select>
          <Button
            variant="primary"
            onClick={handleExport}
            className="rounded-pill px-4"
          >
            <FaDownload className="me-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Sales</small>
                  <h3 className="text-primary mb-0 fw-bold">
                    ₹{reportData?.totalSales?.toLocaleString() || 0}
                  </h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                  <FaRupeeSign className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Invoices</small>
                  <h3 className="text-success mb-0 fw-bold">
                    {reportData?.totalInvoices || 0}
                  </h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded-3 p-3">
                  <FaFileInvoice className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Paid Invoices</small>
                  <h3 className="text-info mb-0 fw-bold">
                    {reportData?.paidInvoices || 0}
                  </h3>
                </div>
                <div className="bg-info bg-opacity-10 rounded-3 p-3">
                  <FaCalendarAlt className="text-info" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total GST</small>
                  <h3 className="text-warning mb-0 fw-bold">
                    ₹{reportData?.totalGST?.toLocaleString() || 0}
                  </h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                  <FaChartLine className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Sales Table */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Month</th>
                  <th>Invoices Count</th>
                  <th>Total Sales</th>
                  <th className="pe-4">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.monthlyData?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="ps-4 fw-semibold">{item.month}</td>
                    <td>{item.count}</td>
                    <td className="fw-semibold text-primary">
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td className="pe-4">
                      {((item.amount / reportData.totalSales) * 100).toFixed(1)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Top Customers & Products */}
      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <h6 className="fw-bold mb-3">Top 5 Customers</h6>
              <div className="table-responsive">
                <Table size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Orders</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.topCustomers?.map((customer, idx) => (
                      <tr key={idx}>
                        <td>{customer.name}</td>
                        <td>{customer.count}</td>
                        <td className="text-primary">
                          ₹{customer.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <h6 className="fw-bold mb-3">Top 5 Products</h6>
              <div className="table-responsive">
                <Table size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.topProducts?.map((product, idx) => (
                      <tr key={idx}>
                        <td>{product.name}</td>
                        <td>{product.quantity}</td>
                        <td className="text-primary">
                          ₹{product.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx="true">{`
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
        .rounded-4 {
          border-radius: 1rem !important;
        }
      `}</style>
    </Container>
  );
};

export default SalesReport;
