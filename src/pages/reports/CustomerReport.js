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
  FaUsers,
  FaDownload,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const CustomerReport = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // API Service
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

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/customers");
      
      // Handle different response structures
      let customers = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        customers = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        customers = response.data;
      } else if (Array.isArray(response)) {
        customers = response;
      }

      // Calculate totals from customers
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(c => c.status === 'active').length;
      
      // Fetch invoices to calculate revenue and outstanding
      const invoicesResponse = await apiRequest("/invoices");
      let invoices = [];
      if (invoicesResponse.data && invoicesResponse.data.data && Array.isArray(invoicesResponse.data.data)) {
        invoices = invoicesResponse.data.data;
      } else if (invoicesResponse.data && Array.isArray(invoicesResponse.data)) {
        invoices = invoicesResponse.data;
      } else if (Array.isArray(invoicesResponse)) {
        invoices = invoicesResponse;
      }

      // Calculate total revenue and outstanding per customer
      const customerRevenue = {};
      const customerOutstanding = {};
      const customerInvoiceCount = {};

      invoices.forEach(inv => {
        const partyId = inv.party_id;
        const amount = parseFloat(inv.total_amount) || 0;
        const balance = parseFloat(inv.balance_amount) || 0;
        
        if (inv.party_type === 'customer') {
          customerRevenue[partyId] = (customerRevenue[partyId] || 0) + amount;
          customerOutstanding[partyId] = (customerOutstanding[partyId] || 0) + balance;
          customerInvoiceCount[partyId] = (customerInvoiceCount[partyId] || 0) + 1;
        }
      });

      // Calculate total revenue and outstanding
      const totalRevenue = Object.values(customerRevenue).reduce((a, b) => a + b, 0);
      const totalOutstanding = Object.values(customerOutstanding).reduce((a, b) => a + b, 0);

      // Format customers for display
      const formattedCustomers = customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        companyName: customer.company_name || '',
        email: customer.email || '',
        phone: customer.mobile || customer.phone || '',
        totalInvoices: customerInvoiceCount[customer.id] || 0,
        totalPurchases: customerRevenue[customer.id] || 0,
        outstanding: customerOutstanding[customer.id] || 0,
        status: customer.status || 'active'
      }));

      setReportData({
        customers: formattedCustomers,
        totalCustomers: totalCustomers,
        activeCustomers: activeCustomers,
        totalRevenue: totalRevenue,
        totalOutstanding: totalOutstanding
      });
      
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.message);
      // Set fallback empty data
      setReportData({
        customers: [],
        totalCustomers: 0,
        activeCustomers: 0,
        totalRevenue: 0,
        totalOutstanding: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle export report
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const tenantId = localStorage.getItem("tenantId");
      
      const fromDate = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const toDate = new Date().toISOString().split('T')[0];
      
      // Prompt for customer ID
      const customerId = prompt("Enter Customer ID to export report:");
      if (!customerId) {
        alert("Customer ID is required to export report");
        return;
      }
      
      const url = `${API_BASE_URL}/reports/export/customer/${customerId}?format=pdf&fromDate=${fromDate}&toDate=${toDate}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId || "14",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        window.open(downloadUrl, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
        alert("Customer report exported as PDF successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Export failed");
      }
    } catch (err) {
      console.error("Error exporting report:", err);
      alert(`Failed to export customer report. ${err.message}`);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = reportData?.customers?.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <FaSpinner className="fa-spin mb-3" size={40} color="#4f46e5" />
          <h5>Loading Customer Report...</h5>
          <p className="text-muted">Fetching latest data</p>
        </div>
      </Container>
    );
  }

  if (error && (!reportData?.customers || reportData.customers.length === 0)) {
    return (
      <Container fluid className="p-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="mb-3" style={{ fontSize: "48px" }}>⚠️</div>
          <h5 className="text-danger">Error Loading Data</h5>
          <p className="text-muted">{error}</p>
          <Button variant="primary" onClick={() => fetchCustomers()}>
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
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
            <FaUsers className="me-2 text-warning" /> Customer Report
          </h2>
          <p className="text-muted">Customer purchase analysis and insights</p>
        </div>
        <Button
          variant="warning"
          onClick={handleExport}
          className="rounded-pill px-4"
        >
          <FaDownload className="me-2" /> Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small className="text-muted">Total Customers</small>
                <h3 className="text-primary mb-0">{reportData?.totalCustomers || 0}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small className="text-muted">Active Customers</small>
                <h3 className="text-success mb-0">{reportData?.activeCustomers || 0}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small className="text-muted">Total Revenue</small>
                <h3 className="text-info mb-0">
                  ₹{(reportData?.totalRevenue || 0).toLocaleString("en-IN")}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small className="text-muted">Outstanding Amount</small>
                <h3 className="text-danger mb-0">
                  ₹{(reportData?.totalOutstanding || 0).toLocaleString("en-IN")}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Form.Control
            type="text"
            placeholder="Search by name, company, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-pill"
          />
        </Card.Body>
      </Card>

      {/* Customers Table */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Customer</th>
                  <th>Contact</th>
                  <th>Invoices</th>
                  <th>Total Purchases</th>
                  <th>Outstanding</th>
                  <th className="pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers && filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="ps-4">
                        <div className="fw-semibold">{customer.name}</div>
                        <small className="text-muted">
                          {customer.companyName}
                        </small>
                      </td>
                      <td>
                        <small>{customer.email}</small>
                        <br />
                        <small>{customer.phone}</small>
                      </td>
                      <td>{customer.totalInvoices}</td>
                      <td className="fw-semibold text-primary">
                        ₹{customer.totalPurchases.toLocaleString("en-IN")}
                      </td>
                      <td className="text-danger fw-semibold">
                        ₹{customer.outstanding.toLocaleString("en-IN")}
                      </td>
                      <td className="pe-4">
                        <Badge
                          bg={customer.status === "active" ? "success" : "danger"}
                          className="rounded-pill"
                        >
                          {customer.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <style>{`
        .rounded-4 {
          border-radius: 1rem !important;
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

export default CustomerReport;