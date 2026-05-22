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
  InputGroup,
  Alert,
  Spinner,
  Modal,
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
  FaHome,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaFileInvoice,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getExpenses, deleteExpense } from "../../api/tenant/expense.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
        error.response?.data?.message || "Failed to load expenses",
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

  const handleDelete = async (id, category) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete expense "${category}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6c757d",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteExpense(id);
        toast.success(`✓ Expense "${category}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
        await fetchExpenses();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(`✗ ${error.response?.data?.message || "Failed to delete expense"}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
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
      0,
    ),
    totalTax: expenses.reduce(
      (sum, exp) => sum + (parseFloat(exp.tax_amount) || 0),
      0,
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
        return (
          <Badge
            bg="success"
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontWeight: "500",
            }}
          >
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontWeight: "500",
              backgroundColor: "hsl(227, 81%, 42%)",
              color: "#ffffff",
              border: "none",
            }}
          >
            Pending
          </Badge>
        );
      default:
        return (
          <Badge
            bg="secondary"
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontWeight: "500",
            }}
          >
            {status || "Pending"}
          </Badge>
        );
    }
  };
  
  if (loading) {
    return (
      <Container
        fluid
        className="px-4 py-3"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading expenses...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="px-4 py-3"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />

      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none d-flex align-items-center"
          onClick={handleGoBack}
          style={{ color: "#6c757d" }}
        >
          <FaSignOutAlt className="me-1" /> Back to Dashboard
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
          <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            {/* Expense Management */}
          </h2>
        </div>
        <Button
          variant="secondary"
          onClick={handleAdd}
          style={{
            backgroundColor: "#6c757d",
            border: "none",
            borderRadius: "8px",
          }}
        >
          <FaPlus className="me-2" /> Add Expense
        </Button>
      </div>

      {/* Expenses Section Title */}
      <div className="mb-3">
        <h3 className="fw-bold mb-0">Expense Management</h3>
        <p className="text-muted mb-0">
          Track and manage all business expenses, claim input tax credit
        </p>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card
            className="border-0"
            style={{
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small
                    className="text-muted mb-0"
                    style={{ fontSize: "11px" }}
                  >
                    Total Expenses
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    ₹{stats.totalAmount.toLocaleString()}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    {stats.total} entries
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#e3f2fd",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaMoneyBillWave size={18} style={{ color: "#4361ee" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="border-0"
            style={{
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small
                    className="text-muted mb-0"
                    style={{ fontSize: "11px" }}
                  >
                    Input Tax Credit
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    ₹{stats.totalTax.toLocaleString()}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Total GST claimed
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#e8f5e9",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaPercent size={18} style={{ color: "#2e7d32" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="border-0"
            style={{
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small
                    className="text-muted mb-0"
                    style={{ fontSize: "11px" }}
                  >
                    Paid Expenses
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.paid}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Settled payments
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#fff3e0",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaCheckCircle size={18} style={{ color: "#ff9800" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="border-0"
            style={{
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small
                    className="text-muted mb-0"
                    style={{ fontSize: "11px" }}
                  >
                    Pending Expenses
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.pending}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Awaiting payment
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#e8f5e9",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaClock size={18} style={{ color: "#2e7d32" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <Card
        className="border-0 mb-4"
        style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <Card.Body className="py-3">
          <Row>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text
                  style={{ backgroundColor: "#fff", borderRight: "none" }}
                >
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderLeft: "none" }}
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

          {/* Active Filters Display */}
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
      <Card
        className="border-0"
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ fontSize: "14px" }}>
              <thead
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                <tr>
                  <th style={{ padding: "16px 12px" }}>ID</th>
                  <th style={{ padding: "16px 12px" }}>Reference No</th>
                  <th style={{ padding: "16px 12px" }}>Date</th>
                  <th style={{ padding: "16px 12px" }}>Category</th>
                  <th style={{ padding: "16px 12px" }}>Description</th>
                  <th style={{ padding: "16px 12px" }}>Amount</th>
                  <th style={{ padding: "16px 12px" }}>GST Amount</th>
                  <th style={{ padding: "16px 12px" }}>Total</th>
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    style={{ borderBottom: "1px solid #e9ecef" }}
                  >
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold">{expense.id}</div>
                      <small className="text-muted">EXP-{expense.id}</small>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold text-primary">
                        {expense.reference_no}
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <FaCalendarAlt className="text-muted me-2" size={12} />
                      {expense.expense_date?.split("T")[0] ||
                        expense.expense_date}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <Badge
                        bg="secondary"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: "500",
                        }}
                      >
                        {expense.category}
                      </Badge>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <small className="text-muted">
                        {expense.description?.length > 50
                          ? expense.description.substring(0, 50) + "..."
                          : expense.description || "-"}
                      </small>
                    </td>
                    <td
                      className="fw-semibold"
                      style={{ padding: "16px 12px" }}
                    >
                      ₹{parseFloat(expense.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      ₹{parseFloat(expense.tax_amount || 0).toLocaleString()}
                    </td>
                    <td
                      className="fw-semibold text-primary"
                      style={{ padding: "16px 12px" }}
                    >
                      ₹{parseFloat(expense.total_amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <Badge
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: "500",
                          backgroundColor:
                            expense.payment_status === "Paid"
                              ? "#28a745"
                              : expense.payment_status === "Pending"
                                ? "hsl(227, 81%, 42%)"
                                : "#6c757d",
                          color: "#ffffff",
                        }}
                      >
                        {expense.payment_status}
                      </Badge>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <Button
                        variant="link"
                        size="sm"
                        className="me-2"
                        onClick={() => handleView(expense)}
                        title="View Details"
                        style={{ color: "#4361ee", textDecoration: "none" }}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(expense.id)}
                        title="Edit"
                        style={{ color: "#ff9800", textDecoration: "none" }}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          handleDelete(expense.id, expense.category)
                        }
                        title="Delete"
                        style={{ color: "#dc3545", textDecoration: "none" }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
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
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <FaEye className="me-2 text-secondary" /> Expense Details
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
                    {selectedExpense.reference_no ||
                      `EXP-${selectedExpense.id}`}
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
                  <p className="fw-semibold mb-0" style={{ color: "#000000" }}>
                    ₹{parseFloat(selectedExpense.amount || 0).toLocaleString()}
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">GST Amount</small>
                  <p className="fw-semibold mb-0" style={{ color: "#000000" }}>
                    ₹
                    {parseFloat(
                      selectedExpense.tax_amount || 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Total Amount</small>
                  <p className="fw-semibold mb-0 text-primary">
                    ₹
                    {parseFloat(
                      selectedExpense.total_amount || 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Payment Status</small>
                  <div>
                    {getPaymentStatusBadge(selectedExpense.payment_status)}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Created By</small>
                  <p className="mb-0">
                    {selectedExpense.created_by || "Admin"}
                  </p>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button
            variant="secondary"
            onClick={() => setShowViewModal(false)}
            style={{ backgroundColor: "#6c757d", border: "none" }}
          >
            Close
          </Button>
          {selectedExpense && (
            <Button
              variant="primary"
              onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedExpense.id);
              }}
              style={{ backgroundColor: "#6c757d", border: "none" }}
            >
              <FaEdit className="me-2" /> Edit Expense
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Expenses;