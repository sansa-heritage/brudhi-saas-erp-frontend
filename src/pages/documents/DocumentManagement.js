import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaFolderOpen,
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import { getDocumentStatistics } from "../../components/services/documentService";

const DocumentManagement = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const data = getDocumentStatistics();
    setStats(data);
  };

  const modules = [
    {
      title: "Customer Documents",
      description:
        "Manage GST certificates, PAN cards, agreements and other customer documents",
      icon: <FaUsers size={40} />,
      color: "primary",
      path: "/documents/customers",
      count: stats?.customerDocuments || 0,
    },
    {
      title: "Dealer Documents",
      description:
        "Manage dealer agreements, GST certificates, authorization letters",
      icon: <FaUserTie size={40} />,
      color: "success",
      path: "/documents/dealers",
      count: stats?.dealerDocuments || 0,
    },
    {
      title: "Company Documents",
      description:
        "Manage GST, registration certificates, MSME, trade licenses",
      icon: <FaBuilding size={40} />,
      color: "info",
      path: "/documents/company",
      count: stats?.companyDocuments || 0,
    },
  ];

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <Container fluid className="p-4 bg-light">
      {/* Back Button */}
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
              <div className="bg-secondary bg-opacity-20 rounded-circle p-2">
                <FaFolderOpen size={20} className="text-white" />
              </div>
              <span className="badge bg-white text-primary rounded-pill px-3 py-1">
                Document Management System
              </span>
            </div>
            <h2 className="fw-bold mb-1 display-6">Document Management</h2>
            <p className="mb-0 opacity-75">
              Centralized document repository for customers, dealers and company
            </p>
          </div>
          <div className="bg-secondary bg-opacity-15 rounded-circle p-3">
            <FaFileAlt size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Total Documents</small>
                  <h3 className="text-primary">{stats?.totalDocuments || 0}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                  <FaFileAlt className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Verified</small>
                  <h3 className="text-success">
                    {stats?.verifiedDocuments || 0}
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
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Pending</small>
                  <h3 className="text-warning">
                    {stats?.pendingDocuments || 0}
                  </h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                  <FaClock className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Categories</small>
                  <h3 className="text-info">3</h3>
                </div>
                <div className="bg-info bg-opacity-10 rounded-3 p-3">
                  <FaFolderOpen className="text-info" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Storage Usage */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">Storage Usage</h6>
          <ProgressBar
            now={65}
            label="65%"
            className="rounded-pill"
            style={{ height: "10px" }}
          />
          <div className="d-flex justify-content-between mt-2">
            <small className="text-muted">Used: 65 MB</small>
            <small className="text-muted">Total: 100 MB</small>
          </div>
        </Card.Body>
      </Card>

      {/* Module Cards */}
      <Row className="g-4">
        {modules.map((module, idx) => (
          <Col md={6} lg={4} key={idx}>
            <Card
              className="border-0 shadow-sm rounded-4 h-100 module-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(module.path)}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className={`bg-${module.color} bg-opacity-10 rounded-3 p-3`}
                  >
                    <div className={`text-${module.color}`}>{module.icon}</div>
                  </div>
                  <Badge bg={module.color} className="rounded-pill px-3 py-2">
                    {module.count} Documents
                  </Badge>
                </div>
                <h5 className="fw-bold mb-2">{module.title}</h5>
                <p className="text-muted small mb-0">{module.description}</p>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 text-end pb-3">
                <Button
                  variant={`outline-${module.color}`}
                  size="sm"
                  className="rounded-pill px-3"
                >
                  Manage →
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      <style jsx="true">{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .module-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }
        .module-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
        }
        .rounded-4 {
          border-radius: 1rem !important;
        }
      `}</style>
    </Container>
  );
};

export default DocumentManagement;
