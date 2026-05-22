import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaBoxes,
  FaRupeeSign,
  FaUsers,
  FaUserTie,
  FaFileDownload,
  FaEye,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";

const ReportsDashboard = () => {
  const navigate = useNavigate();

  const reportModules = [
    {
      title: "Sales Report",
      description: "Track sales performance, revenue trends and top products",
      icon: <FaChartLine size={40} />,
      color: "primary",
      bg: "bg-primary",
      path: "/reports/sales",
      stats: "Daily, Weekly, Monthly Analysis",
    },
    {
      title: "Stock Report",
      description: "Monitor cylinder inventory, stock levels and transactions",
      icon: <FaBoxes size={40} />,
      color: "success",
      bg: "bg-success",
      path: "/reports/stock",
      stats: "Real-time stock status",
    },
    {
      title: "Financial Report",
      description: "View revenue, expenses, profit and GST summary",
      icon: <FaRupeeSign size={40} />,
      color: "info",
      bg: "bg-info",
      path: "/reports/financial",
      stats: "Profit & Loss Analysis",
    },
    {
      title: "Customer Report",
      description: "Analyze customer purchases, outstanding and loyalty",
      icon: <FaUsers size={40} />,
      color: "warning",
      bg: "bg-warning",
      path: "/reports/customer",
      stats: "Customer Insights",
    },
    {
      title: "Dealer Report",
      description: "Track dealer performance, sales and commissions",
      icon: <FaUserTie size={40} />,
      color: "danger",
      bg: "bg-danger",
      path: "/reports/dealer",
      stats: "Dealer Analytics",
    },
  ];

  // Handle back button - go to dashboard
  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <Container fluid className="p-4 bg-light">
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center text-primary"
          onClick={handleGoBack}
        >
          <FaArrowLeft className="me-2" /> Back to Dashboard
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/dashboard")}
        >
          <FaHome className="me-1" /> Dashboard
        </Button>
      </div>
      {/* Header */}
      <div className="bg-gradient-primary text-white rounded-4 p-4 mb-4 shadow-lg">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="bg-primary  bg-opacity-20 rounded-circle p-2">
                <FaChartLine size={20} className="text-white" />
              </div>
              <span className="badge bg-white text-primary rounded-pill px-3 py-1">
                Analytics Dashboard
              </span>
            </div>
            <h2 className="fw-bold mb-1 display-6">Reports & Analytics</h2>
            <p className="mb-0 opacity-75">
              Comprehensive business intelligence and performance reports
            </p>
          </div>
          <div className="bg-primary bg-opacity-15 rounded-circle p-3">
            <FaFileDownload size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <Row className="g-4">
        {reportModules.map((report, idx) => (
          <Col md={6} lg={4} key={idx}>
            <Card
              className="border-0 shadow-sm rounded-4 h-100 report-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(report.path)}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`${report.bg} bg-opacity-10 rounded-3 p-3`}>
                    <div className={`text-${report.color}`}>{report.icon}</div>
                  </div>
                  <Button
                    variant={`outline-${report.color}`}
                    size="sm"
                    className="rounded-pill"
                  >
                    <FaEye className="me-1" /> View
                  </Button>
                </div>
                <h5 className="fw-bold mb-2">{report.title}</h5>
                <p className="text-muted small mb-3">{report.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">{report.stats}</small>
                  <FaChartLine className={`text-${report.color} opacity-50`} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Stats */}
      <Row className="g-4 mt-2">
        <Col md={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">Quick Export Options</h6>
              <Row>
                <Col md={3}>
                  <Button
                    variant="outline-danger"
                    className="w-100 rounded-pill py-2"
                  >
                    <FaFileDownload className="me-2" /> Export as PDF
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="outline-success"
                    className="w-100 rounded-pill py-2"
                  >
                    <FaFileDownload className="me-2" /> Export as Excel
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="outline-primary"
                    className="w-100 rounded-pill py-2"
                  >
                    <FaFileDownload className="me-2" /> Export as CSV
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    variant="outline-secondary"
                    className="w-100 rounded-pill py-2"
                  >
                    Schedule Reports
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx="true">{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .bg-white.bg-opacity-15 {
          background-color: rgba(255, 255, 255, 0.15);
        }
        .report-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }
        .report-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
        }
        .rounded-4 {
          border-radius: 1rem !important;
        }
        .display-6 {
          font-size: 2rem;
          font-weight: 600;
        }
      `}</style>
    </Container>
  );
};

export default ReportsDashboard;
