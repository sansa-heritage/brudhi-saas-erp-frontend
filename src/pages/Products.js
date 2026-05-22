import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaCube,
  FaBoxes,
  FaHistory,
  FaExclamationTriangle,
  FaChartLine,
  FaTruck,
  FaShoppingCart,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import { getStockStatistics } from "../components/services/cylinderService";

const Products = () => {
  const navigate = useNavigate();
  const stats = getStockStatistics();

  const modules = [
    {
      title: "Cylinder Types",
      description:
        "Manage different types of LPG cylinders with specifications",
      icon: <FaCube size={40} />,
      color: "primary",
      path: "/products/cylinder-types",
      stats: `${stats.totalCylinders} types`,
    },
    {
      title: "Cylinder Stock",
      description: "Track individual cylinders, their status and location",
      icon: <FaBoxes size={40} />,
      color: "success",
      path: "/products/cylinder-stock",
      stats: `${stats.totalCylinders} cylinders | ${stats.inStock} in stock`,
    },
    {
      title: "Stock Transactions",
      description: "View all cylinder movements and transaction history",
      icon: <FaHistory size={40} />,
      color: "info",
      path: "/products/stock-transactions",
      stats: "Track purchases, sales & transfers",
    },
    {
      title: "Low Stock Alerts",
      description: "Monitor stock levels and get reorder alerts",
      icon: <FaExclamationTriangle size={40} />,
      color: "warning",
      path: "/products/low-stock-alerts",
      stats: `${stats.lowStockCount} items low in stock`,
    },
  ];

  // Handle back button - go to dashboard
  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <Container fluid className="p-4 bg-light">
      {/* Back Button - Redirects to Dashboard */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center"
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
      <div className="bg-gradient-dark text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaCube className="me-2" /> Product Management
            </h2>
            <p className="mb-0 opacity-75">
              Complete LPG Cylinder Management System - Track types, stock,
              transactions and alerts
            </p>
          </div>
          <div className="d-flex gap-2">
            <div className="bg-light bg-opacity-25 rounded-circle p-2 px-3">
              <small>Total Stock Value</small>
              <strong className="ms-2">
                ₹{(stats.totalCylinders * 850).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 text-center">
            <Card.Body>
              <FaCube size={30} className="text-primary mb-2" />
              <h3 className="mb-0">{stats.totalCylinders}</h3>
              <small className="text-muted">Total Cylinders</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 text-center">
            <Card.Body>
              <FaTruck size={30} className="text-success mb-2" />
              <h3 className="mb-0">{stats.inStock}</h3>
              <small className="text-muted">In Stock</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 text-center">
            <Card.Body>
              <FaShoppingCart size={30} className="text-warning mb-2" />
              <h3 className="mb-0">{stats.issued}</h3>
              <small className="text-muted">Issued</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3 text-center">
            <Card.Body>
              <FaExclamationTriangle size={30} className="text-danger mb-2" />
              <h3 className="mb-0">{stats.damaged}</h3>
              <small className="text-muted">Damaged</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Module Cards */}
      <Row className="g-4">
        {modules.map((module, idx) => (
          <Col md={6} lg={3} key={idx}>
            <Card
              className="border-0 shadow-sm rounded-3 h-100 module-card"
              onClick={() => navigate(module.path)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="text-center p-4">
                <div className={`text-${module.color} mb-3`}>{module.icon}</div>
                <Card.Title className="fw-bold">{module.title}</Card.Title>
                <Card.Text className="small text-muted">
                  {module.description}
                </Card.Text>
                <Badge bg={module.color} className="rounded-pill">
                  {module.stats}
                </Badge>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 text-center pb-3">
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
        .bg-gradient-dark {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }
        .module-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }
        .module-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default Products;
