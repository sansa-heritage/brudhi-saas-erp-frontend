// frontend/src/pages/expenses/Expenses.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Form,
  Row,
  Col,
  InputGroup,
  Alert,
  Spinner,
  Modal,
  Container,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaMoneyBillWave,
  FaPercent,
  FaCalendarAlt,
  FaTag,
  FaTimes,
  FaArrowLeft,
  FaHome,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaFileInvoice,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getExpenses,
  deleteExpense,
} from "../../api/tenant/expense.api";
import Swal from "sweetalert2";

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getExpenses();
      console.log("Fetched expenses response:", response);

      let expensesData = [];

      // Handle different response structures
      if (response?.data?.data && Array.isArray(response.data.data)) {
        expensesData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        expensesData = response.data;
      } else if (response && Array.isArray(response)) {
        expensesData = response;
      } else if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        expensesData = response.data.data.data;
      }

      const formattedExpenses = expensesData.map((exp) => ({
        id: exp.id,
        category: exp.category,
        expense_date: exp.expenseDate || exp.expense_date,
        amount: exp.amount,
        tax_amount: exp.taxAmount || exp.tax_amount,
        total_amount: exp.totalAmount || exp.total_amount,
        description: exp.description,
        reference_no: exp.referenceNo || exp.reference_no || `EXP-${exp.id}`,
        payment_status: exp.paymentStatus || exp.payment_status || "Pending",
        created_by: exp.createdBy || exp.created_by,
        created_at: exp.created_at,
        updated_at: exp.updated_at,
      }));

      setExpenses(formattedExpenses);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to load expenses"
      );
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    navigate(`/expenses/edit/${id}`);
  };

  const handleAdd = () => {
    navigate("/expenses/add");
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete expense "${name || id}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteExpense(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Expense deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        await fetchExpenses();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete expense",
        });
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setPaymentStatusFilter("all");
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      searchTerm === "" ||
      (expense.category &&
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (expense.description &&
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (expense.reference_no &&
        expense.reference_no.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;
    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      expense.payment_status === paymentStatusFilter;

    return matchesSearch && matchesCategory && matchesPaymentStatus;
  });

  const stats = {
    total: expenses.length,
    totalAmount: expenses.reduce(
      (sum, exp) => sum + (parseFloat(exp.amount) || 0),
      0
    ),
    totalTax: expenses.reduce(
      (sum, exp) => sum + (parseFloat(exp.tax_amount) || 0),
      0
    ),
    paid: expenses.filter((e) => e.payment_status === "Paid").length,
    pending: expenses.filter((e) => e.payment_status === "Pending").length,
  };

  const getFilterText = () => {
    const filters = [];
    if (categoryFilter !== "all") filters.push(`Category: ${categoryFilter}`);
    if (paymentStatusFilter !== "all")
      filters.push(`Status: ${paymentStatusFilter}`);
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters;
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  const categories = [...new Set(expenses.map((exp) => exp.category))];

  const getPaymentStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <Badge bg="success" className="rounded-pill px-3 py-2">Paid</Badge>;
      case "pending":
        return <Badge bg="warning" className="rounded-pill px-3 py-2">Pending</Badge>;
      default:
        return <Badge bg="secondary" className="rounded-pill px-3 py-2">{status || "Pending"}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">Loading expenses...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
      {/* Back Button */}
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

      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          className="mb-3"
          onClose={() => setSuccessMessage("")}
          dismissible
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert
          variant="danger"
          className="mb-3"
          onClose={() => setErrorMessage("")}
          dismissible
        >
          {errorMessage}
        </Alert>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FaMoneyBillWave className="me-2" /> Expense Management
          </h2>
          <p className="text-muted">
            Track and manage all business expenses, claim input tax credit
          </p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <FaPlus className="me-2" /> Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Expenses</h6>
                  <h3 className="mb-0">
                    ₹{stats.totalAmount.toLocaleString()}
                  </h3>
                  <small className="text-muted">{stats.total} entries</small>
                </div>
                <div className="bg-danger bg-opacity-10 rounded p-3">
                  <FaMoneyBillWave size={24} className="text-danger" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Input Tax Credit (ITC)</h6>
                  <h3 className="mb-0">₹{stats.totalTax.toLocaleString()}</h3>
                  <small className="text-muted">Total GST claimed</small>
                </div>
                <div className="bg-success bg-opacity-10 rounded p-3">
                  <FaPercent size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Paid Expenses</h6>
                  <h3 className="mb-0">{stats.paid}</h3>
                  <small className="text-muted">Settled payments</small>
                </div>
                <div className="bg-info bg-opacity-10 rounded p-3">
                  <FaCheckCircle size={24} className="text-info" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Pending Expenses</h6>
                  <h3 className="mb-0">{stats.pending}</h3>
                  <small className="text-muted">Awaiting payment</small>
                </div>
                <div className="bg-warning bg-opacity-10 rounded p-3">
                  <FaClock size={24} className="text-warning" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <Card className="border-0 shadow-sm mb-4 rounded-3">
        <Card.Body>
          <Row>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by category, description, reference number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories ({stats.total})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
              >
                <option value="all">All Status ({stats.total})</option>
                <option value="Paid">Paid ({stats.paid})</option>
                <option value="Pending">Pending ({stats.pending})</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                className="w-100"
                title="Clear all filters"
              >
                <FaFilter />
              </Button>
            </Col>
          </Row>

          {getFilterText().length > 0 && (
            <div className="mt-3 pt-2 border-top">
              <small className="text-muted me-2">Active filters:</small>
              {getFilterText().map((filter, index) => (
                <Badge
                  key={index}
                  bg="secondary"
                  className="me-2 px-3 py-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (filter.includes("Category")) setCategoryFilter("all");
                    if (filter.includes("Status"))
                      setPaymentStatusFilter("all");
                    if (filter.includes("Search")) setSearchTerm("");
                  }}
                >
                  {filter} <FaTimes size={10} className="ms-2" />
                </Badge>
              ))}
              <Button
                variant="link"
                size="sm"
                onClick={clearFilters}
                className="p-0 ms-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          Showing {filteredExpenses.length} of {expenses.length} expenses
        </p>
        {filteredExpenses.length === 0 && (
          <Button variant="link" onClick={clearFilters} className="p-0">
            Clear all filters
          </Button>
        )}
      </div>

      {/* Expenses Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Reference No</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount (₹)</th>
                  <th>GST Amount</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="fw-semibold">{expense.id}</td>
                    <td>
                      <div className="fw-semibold text-primary">
                        {expense.reference_no}
                      </div>
                      <small className="text-muted">EXP-{expense.id}</small>
                    </td>
                    <td>
                      <FaCalendarAlt className="text-muted me-2" size={12} />
                      {expense.expense_date?.split("T")[0] ||
                        expense.expense_date}
                    </td>
                    <td>
                      <Badge bg="secondary" className="rounded-pill px-3">
                        {expense.category}
                      </Badge>
                    </td>
                    <td className="text-muted" style={{ maxWidth: "200px" }}>
                      {expense.description?.length > 50 
                        ? expense.description.substring(0, 50) + "..." 
                        : expense.description || "-"}
                    </td>
                    <td className="fw-semibold">
                      ₹{parseFloat(expense.amount || 0).toLocaleString()}
                    </td>
                    <td className="text-muted">
                      ₹{parseFloat(expense.tax_amount || 0).toLocaleString()}
                    </td>
                    <td className="fw-semibold text-primary">
                      ₹{parseFloat(expense.total_amount || 0).toLocaleString()}
                    </td>
                    <td>{getPaymentStatusBadge(expense.payment_status)}</td>
                    <td className="text-muted">
                      <FaUser className="me-1" size={12} />
                      {expense.created_by || "Admin"}
                    </td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => handleView(expense)}
                        title="View Details"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => handleEdit(expense.id)}
                        title="Edit"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => handleDelete(expense.id, expense.category)}
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No expenses found</h5>
                        <p className="text-muted small">
                          Try adjusting your search or filter criteria
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* View Expense Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        size="lg"
      >
        <Modal.Header
          closeButton
          className="bg-primary text-white rounded-top-3 border-0"
        >
          <Modal.Title className="fw-bold">
            <FaEye className="me-2" /> Expense Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedExpense && (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">ID</small>
                  <p className="fw-semibold mb-0">{selectedExpense.id}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Reference No</small>
                  <p className="fw-semibold mb-0 text-primary">
                    {selectedExpense.reference_no || `EXP-${selectedExpense.id}`}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Date</small>
                  <p className="fw-semibold mb-0">
                    {selectedExpense.expense_date?.split("T")[0] ||
                      selectedExpense.expense_date}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Category</small>
                  <p className="fw-semibold mb-0">{selectedExpense.category}</p>
                </div>
              </Col>
              <Col md={12}>
                <div className="mb-3">
                  <small className="text-muted">Description</small>
                  <p className="mb-0">{selectedExpense.description || "-"}</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Amount</small>
                  <p className="fw-semibold mb-0 text-danger">
                    ₹{parseFloat(selectedExpense.amount || 0).toLocaleString()}
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">GST Amount</small>
                  <p className="fw-semibold mb-0">
                    ₹{parseFloat(selectedExpense.tax_amount || 0).toLocaleString()}
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Total Amount</small>
                  <p className="fw-semibold mb-0 text-primary">
                    ₹{parseFloat(selectedExpense.total_amount || 0).toLocaleString()}
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Payment Status</small>
                  <div>
                    {getPaymentStatusBadge(selectedExpense.payment_status)}
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Created By</small>
                  <p className="mb-0">{selectedExpense.created_by || "Admin"}</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Created At</small>
                  <p className="mb-0">
                    {selectedExpense.created_at
                      ? new Date(selectedExpense.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedExpense && (
            <Button
              variant="primary"
              onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedExpense.id);
              }}
            >
              <FaEdit className="me-2" /> Edit Expense
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </Container>
  );
};

export default Expenses;