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
  FaStar,
  FaUserGraduate,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getCustomerReportData,
  exportReport,
} from "../../components/services/reportService";

const CustomerReport = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);
  const loadData = () => {
    setReportData(getCustomerReportData());
    setLoading(false);
  };
  const handleExport = () => exportReport("Customer", reportData);

  const filteredCustomers = reportData?.customers?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">Loading...</div>
      </Container>
    );

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

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small>Total Customers</small>
                <h3 className="text-primary">{reportData?.totalCustomers}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small>Active Customers</small>
                <h3 className="text-success">{reportData?.activeCustomers}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small>Total Revenue</small>
                <h3 className="text-info">
                  ₹{reportData?.totalRevenue?.toLocaleString()}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small>Outstanding Amount</small>
                <h3 className="text-danger">
                  ₹{reportData?.totalOutstanding?.toLocaleString()}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Form.Control
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-pill"
          />
        </Card.Body>
      </Card>

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
                {filteredCustomers?.map((customer) => (
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
                      ₹{customer.totalPurchases.toLocaleString()}
                    </td>
                    <td className="text-danger fw-semibold">
                      ₹{customer.outstanding.toLocaleString()}
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
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <style jsx="true">{`
        .rounded-4 {
          border-radius: 1rem !important;
        }
      `}</style>
    </Container>
  );
};

export default CustomerReport;
