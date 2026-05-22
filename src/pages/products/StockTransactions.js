import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import {
  FaPlus,
  FaSearch,
  FaHistory,
  FaExchangeAlt,
  FaRupeeSign,
  FaCalendarAlt,
  FaFileInvoice,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import {
  getStockTransactions,
  getCylinderStock,
  getCylinderTypes,
  addStockTransaction,
} from "../../components/services/cylinderService";

const StockTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [stock, setStock] = useState([]);
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    cylinderId: "",
    type: "purchase",
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
    fromLocation: "",
    toLocation: "",
    referenceNo: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const transactionData = getStockTransactions();
    const stockData = getCylinderStock();
    const typesData = getCylinderTypes();
    setTransactions(transactionData);
    setStock(stockData);
    setTypes(typesData);
    setLoading(false);
  };

  const handleSave = () => {
    const cylinder = stock.find((s) => s.id === parseInt(formData.cylinderId));
    const cylinderType = types.find((t) => t.id === cylinder?.cylinderTypeId);

    const newTransaction = {
      ...formData,
      cylinderCode: cylinder?.cylinderCode,
      cylinderType: cylinderType?.name,
      amount: parseFloat(formData.amount) || 0,
    };

    addStockTransaction(newTransaction);
    loadData();
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cylinderId: "",
      type: "purchase",
      quantity: 1,
      date: new Date().toISOString().split("T")[0],
      fromLocation: "",
      toLocation: "",
      referenceNo: "",
      amount: "",
      notes: "",
    });
  };

  const getTransactionTypeBadge = (type) => {
    const config = {
      purchase: { bg: "success", icon: "↓", text: "Purchase" },
      sale: { bg: "danger", icon: "↑", text: "Sale" },
      return: { bg: "info", icon: "↺", text: "Return" },
      damage: { bg: "dark", icon: "⚠", text: "Damage" },
      transfer: { bg: "primary", icon: "→", text: "Transfer" },
    };
    const c = config[type] || config.purchase;
    return (
      <Badge bg={c.bg} className="rounded-pill px-3">
        {c.text}
      </Badge>
    );
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.cylinderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    totalTransactions: transactions.length,
    totalPurchaseValue: transactions
      .filter((t) => t.type === "purchase")
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    totalSalesValue: transactions
      .filter((t) => t.type === "sale")
      .reduce((sum, t) => sum + (t.amount || 0), 0),
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
      {/* Header */}
      <div className="bg-gradient-info text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaHistory className="me-2" /> Stock Transactions
            </h2>
            <p className="mb-0 opacity-75">
              Track all cylinder movements including purchases, sales, returns
              and transfers
            </p>
          </div>
          <Button
            variant="light"
            onClick={() => setShowModal(true)}
            className="rounded-pill px-4"
          >
            <FaPlus className="me-2" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Transactions</small>
                  <h4 className="text-primary mb-0 fw-bold">
                    {stats.totalTransactions}
                  </h4>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <FaHistory className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Purchases</small>
                  <h4 className="text-success mb-0 fw-bold">
                    ₹{stats.totalPurchaseValue.toLocaleString()}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FaRupeeSign className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Sales</small>
                  <h4 className="text-danger mb-0 fw-bold">
                    ₹{stats.totalSalesValue.toLocaleString()}
                  </h4>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                  <FaRupeeSign className="text-danger" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by transaction ID or cylinder code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-2"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Cylinder Code</th>
                  <th>Cylinder Type</th>
                  <th>Quantity</th>
                  <th>From → To</th>
                  <th>Reference</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="fw-semibold text-primary">
                      {transaction.transactionId}
                    </td>
                    <td>
                      <FaCalendarAlt className="text-muted me-1" />
                      {transaction.date}
                    </td>
                    <td>{getTransactionTypeBadge(transaction.type)}</td>
                    <td>
                      <code>{transaction.cylinderCode}</code>
                    </td>
                    <td>{transaction.cylinderType}</td>
                    <td className="fw-semibold">{transaction.quantity}</td>
                    <td>
                      <small>
                        {transaction.fromLocation}{" "}
                        <FaExchangeAlt className="mx-1 text-muted" size={10} />{" "}
                        {transaction.toLocation}
                      </small>
                    </td>
                    <td>{transaction.referenceNo || "-"}</td>
                    <td className="fw-semibold">
                      ₹{transaction.amount?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          className="bg-info text-white rounded-top-3 border-0"
        >
          <Modal.Title className="fw-bold">
            <FaPlus className="me-2" /> Add Stock Transaction
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction Type *</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="rounded-2"
                  >
                    <option value="purchase">Purchase</option>
                    <option value="sale">Sale</option>
                    <option value="return">Return</option>
                    <option value="damage">Damage</option>
                    <option value="transfer">Transfer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Cylinder *</Form.Label>
                  <Form.Select
                    value={formData.cylinderId}
                    onChange={(e) =>
                      setFormData({ ...formData, cylinderId: e.target.value })
                    }
                    className="rounded-2"
                  >
                    <option value="">Select Cylinder</option>
                    {stock.map((cylinder) => (
                      <option key={cylinder.id} value={cylinder.id}>
                        {cylinder.cylinderCode} - {cylinder.serialNumber}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>From Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.fromLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, fromLocation: e.target.value })
                    }
                    placeholder="Source location"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>To Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.toLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, toLocation: e.target.value })
                    }
                    placeholder="Destination location"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Reference No.</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.referenceNo}
                    onChange={(e) =>
                      setFormData({ ...formData, referenceNo: e.target.value })
                    }
                    placeholder="PO/Invoice number"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
                className="rounded-2"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            className="rounded-pill px-4"
          >
            Cancel
          </Button>
          <Button
            variant="info"
            onClick={handleSave}
            className="rounded-pill px-4"
          >
            Add Transaction
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx="true">{`
        .bg-gradient-info {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default StockTransactions;
