import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import {
  FaExclamationTriangle,
  FaBell,
  FaBoxes,
  FaTruck,
  FaShoppingCart,
  FaEye,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import {
  getCylinderStock,
  getCylinderTypes,
  getStockStatistics,
} from "../../components/services/cylinderService";
import { useNavigate } from "react-router-dom";

const LowStockAlerts = () => {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [stock, setStock] = useState([]);
  const [types, setTypes] = useState([]);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stockData = getCylinderStock();
    const typesData = getCylinderTypes();
    const stats = getStockStatistics();

    setStock(stockData);
    setTypes(typesData);
    setStatistics(stats);

    // Calculate low stock items (less than 5 cylinders in stock)
    const lowStock = typesData
      .map((type) => {
        const count = stockData.filter(
          (s) => s.cylinderTypeId === type.id && s.status === "in_stock",
        ).length;
        const reorderLevel = 5;
        return {
          ...type,
          stockCount: count,
          reorderLevel,
          isLow: count < reorderLevel,
          shortage: reorderLevel - count,
        };
      })
      .filter((item) => item.isLow);

    setLowStockItems(lowStock);
  };

  const getAlertLevel = (stockCount, reorderLevel) => {
    if (stockCount === 0)
      return { text: "Critical", color: "danger", icon: "🔴" };
    if (stockCount <= reorderLevel / 2)
      return { text: "High", color: "danger", icon: "🔴" };
    if (stockCount < reorderLevel)
      return { text: "Medium", color: "warning", icon: "🟡" };
    return { text: "Normal", color: "success", icon: "🟢" };
  };

  // Handle back button - go to products page
  const handleGoBack = () => {
    navigate("/products");
  };
  return (
    <Container fluid className="p-4 bg-light">
      {/* Back Button - Redirects to Products Page */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center text-primary"
          onClick={handleGoBack}
        >
          <FaArrowLeft className="me-2" /> Back to Products
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/products")}
        >
          <FaHome className="me-1" /> Products
        </Button>
      </div>
      {/* Header - Changed to blue/purple gradient */}
      <div className="bg-gradient-primary text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaExclamationTriangle className="me-2" /> Low Stock Alerts
            </h2>
            <p className="mb-0 opacity-75">
              Monitor cylinder stock levels and get alerts for items that need
              reordering
            </p>
          </div>
          <div className="bg-secondary bg-opacity-20 rounded-circle p-3">
            <FaBell className="text-white" size={28} />
          </div>
        </div>
      </div>

      {/* Alert Summary Cards - Changed colors */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 bg-primary text-white">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-white-50">Critical Stock</small>
                  <h3 className="mb-0 fw-bold">
                    {
                      lowStockItems.filter(
                        (i) =>
                          getAlertLevel(i.stockCount, i.reorderLevel).text ===
                          "Critical",
                      ).length
                    }
                  </h3>
                </div>
                <FaExclamationTriangle size={32} className="text-white-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 bg-warning text-dark">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-dark-50">Low Stock Items</small>
                  <h3 className="mb-0 fw-bold">{lowStockItems.length}</h3>
                </div>
                <FaBoxes size={32} className="text-dark-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 bg-success text-white">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-white-50">Total Cylinders</small>
                  <h3 className="mb-0 fw-bold">
                    {statistics?.totalCylinders || 0}
                  </h3>
                </div>
                <FaTruck size={32} className="text-white-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Alert - Changed to primary color */}
      {lowStockItems.length > 0 && (
        <Alert variant="primary" className="rounded-3 mb-4">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle size={24} className="me-3" />
            <div>
              <strong>Attention Required!</strong>
              <br />
              <small>
                {lowStockItems.length} cylinder type(s) are running low on
                stock. Please review and place orders soon to avoid stockouts.
              </small>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="ms-auto rounded-pill"
              onClick={() => navigate("/products/cylinder-types")}
            >
              Manage Types
            </Button>
          </div>
        </Alert>
      )}

      {/* Low Stock Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <FaBell className="text-primary me-2" />
            <Card.Title className="mb-0">Items Below Reorder Level</Card.Title>
          </div>
          <hr />
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Type Name</th>
                  <th>Code</th>
                  <th>Capacity</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Shortage</th>
                  <th>Alert Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => {
                    const alert = getAlertLevel(
                      item.stockCount,
                      item.reorderLevel,
                    );
                    return (
                      <tr key={item.id}>
                        <td className="fw-semibold">{item.name}</td>
                        <td>
                          <code>{item.code}</code>
                        </td>
                        <td>{item.capacity}</td>
                        <td className="fw-bold text-danger">
                          {item.stockCount} units
                        </td>
                        <td>{item.reorderLevel} units</td>
                        <td className="fw-bold text-warning">
                          {item.shortage} units
                        </td>
                        <td>
                          <Badge bg={alert.color} className="rounded-pill px-3">
                            {alert.icon} {alert.text}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill px-3"
                            onClick={() => navigate("/products/cylinder-stock")}
                          >
                            <FaEye className="me-1" /> View Stock
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <FaBell size={50} className="text-muted mb-3" />
                      <h5 className="text-muted">No Low Stock Alerts</h5>
                      <p className="text-muted small">
                        All cylinder types have sufficient stock levels.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Reorder Recommendations - Changed border and button color */}
      {lowStockItems.length > 0 && (
        <Card className="border-0 shadow-sm rounded-3 mt-4">
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <FaShoppingCart className="text-primary me-2" />
              <Card.Title className="mb-0">Reorder Recommendations</Card.Title>
            </div>
            <hr />
            <Row>
              {lowStockItems.map((item) => (
                <Col md={4} key={item.id} className="mb-3">
                  <Card className="border border-primary bg-light rounded-3">
                    <Card.Body>
                      <h6 className="fw-bold">{item.name}</h6>
                      <div className="small">
                        <div>
                          Current Stock:{" "}
                          <strong className="text-danger">
                            {item.stockCount}
                          </strong>
                        </div>
                        <div>
                          Recommended Order:{" "}
                          <strong className="text-success">
                            {item.shortage + 10}
                          </strong>{" "}
                          units
                        </div>
                        <div>
                          Estimated Cost:{" "}
                          <strong>
                            ₹
                            {(
                              (item.shortage + 10) *
                              (item.price || 0)
                            ).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        className="mt-2 w-100 rounded-pill"
                      >
                        <FaShoppingCart className="me-1" /> Place Order
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      <style jsx="true">{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .bg-white.bg-opacity-20 {
          background-color: rgba(255, 255, 255, 0.2);
        }
        .bg-dark-50 {
          color: rgba(0, 0, 0, 0.5);
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default LowStockAlerts;
