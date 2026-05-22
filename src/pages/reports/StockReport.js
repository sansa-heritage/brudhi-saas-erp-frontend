import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import {
  FaBoxes,
  FaTruck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaDownload,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getStockReportData, exportReport } from "../../components/services/reportService";

const StockReport = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = getStockReportData();
    setReportData(data);
    setLoading(false);
  };

  const handleExport = () => {
    exportReport("Stock", reportData);
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
            <FaBoxes className="me-2 text-success" /> Stock Report
          </h2>
          <p className="text-muted">
            Monitor cylinder inventory and stock levels
          </p>
        </div>
        <Button
          variant="success"
          onClick={handleExport}
          className="rounded-pill px-4"
        >
          <FaDownload className="me-2" /> Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between">
                <div>
                  <small>Total Cylinders</small>
                  <h3 className="text-primary mb-0">
                    {reportData?.totalCylinders || 0}
                  </h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                  <FaBoxes className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between">
                <div>
                  <small>In Stock</small>
                  <h3 className="text-success mb-0">
                    {reportData?.inStock || 0}
                  </h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded-3 p-3">
                  <FaCheckCircle className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between">
                <div>
                  <small>Issued</small>
                  <h3 className="text-warning mb-0">
                    {reportData?.issued || 0}
                  </h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                  <FaTruck className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between">
                <div>
                  <small>Damaged</small>
                  <h3 className="text-danger mb-0">
                    {reportData?.damaged || 0}
                  </h3>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-3 p-3">
                  <FaExclamationTriangle className="text-danger" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stock by Type Table */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Cylinder Type</th>
                  <th>Code</th>
                  <th>In Stock</th>
                  <th>Issued</th>
                  <th>Damaged</th>
                  <th className="pe-4">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.stockByType?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="ps-4 fw-semibold">{item.name}</td>
                    <td>
                      <code>{item.code}</code>
                    </td>
                    <td className="text-success fw-semibold">{item.inStock}</td>
                    <td className="text-warning">{item.issued}</td>
                    <td className="text-danger">{item.damaged}</td>
                    <td className="pe-4" style={{ width: "150px" }}>
                      <ProgressBar
                        now={
                          (item.issued / (item.inStock + item.issued)) * 100 ||
                          0
                        }
                        variant="warning"
                        className="rounded-pill"
                        style={{ height: "6px" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Stock Value */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <h6 className="fw-bold mb-3">Stock Summary</h6>
          <Row>
            <Col md={4}>
              <div className="p-3 bg-light rounded-3 text-center">
                <small className="text-muted">Total Stock Value</small>
                <h4 className="text-primary mb-0">
                  ₹{reportData?.totalStockValue?.toLocaleString() || 0}
                </h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-light rounded-3 text-center">
                <small className="text-muted">Stock Turnover Rate</small>
                <h4 className="text-info mb-0">
                  {(
                    (reportData?.issued / reportData?.totalCylinders) * 100 || 0
                  ).toFixed(1)}
                  %
                </h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-light rounded-3 text-center">
                <small className="text-muted">Health Status</small>
                <Badge
                  bg={
                    reportData?.inStock > reportData?.issued
                      ? "success"
                      : "warning"
                  }
                  className="mt-2 px-3 py-2 rounded-pill"
                >
                  {reportData?.inStock > reportData?.issued
                    ? "Good"
                    : "Low Stock"}
                </Badge>
              </div>
            </Col>
          </Row>
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

export default StockReport;
