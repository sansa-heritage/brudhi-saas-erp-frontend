import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTag,
  FaPercent,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getExpenses, deleteExpense } from "../../api/tenant/expense.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Status color mapping (same as dealers)
const statusConfig = {
  paid: { bg: "#ECFDF3", color: "#027A48", label: "Paid" },
  pending: { bg: "#FFDCE2", color: "#F94765", label: "Pending" },
  cancelled: { bg: "#FFF2F0", color: "#E2341D", label: "Cancelled" },
};

// Category color mapping
const categoryConfig = {
  Rent: { bg: "#D3EAFF", color: "#437EF7", label: "Rent" },
  Utilities: { bg: "#FFE0CB", color: "#FF8532", label: "Utilities" },
  Salary: { bg: "#ECFDF3", color: "#027A48", label: "Salary" },
  Marketing: { bg: "#FEF6D7", color: "#FED229", label: "Marketing" },
  Maintenance: { bg: "#FFDCE2", color: "#F94765", label: "Maintenance" },
  Supplies: { bg: "#D3EAFF", color: "#437EF7", label: "Supplies" },
  default: { bg: "#F3F4F6", color: "#1e293b", label: "Other" },
};

const Expenses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

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
        tax_amount: exp.taxAmount || exp.tax_amount || 0,
        total_amount: exp.totalAmount || exp.total_amount,
        description: exp.description,
        reference_no: exp.referenceNo || exp.reference_no || `EXP-${exp.id}`,
        payment_status: exp.paymentStatus || exp.payment_status || "Pending",
        created_by: exp.createdBy || exp.created_by,
        created_at: exp.created_at,
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
    navigate(`/expenses/view/${expense.id}`);
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

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const categories = [...new Set(expenses.map((exp) => exp.category))];

  if (loading) {
    return (
      <Container fluid className="p-4">
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
          {/* <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            Expenses
          </h2>
          <p className="text-muted mb-0">Manage business expenses</p> */}
        </div>
        <Button
          onClick={handleAdd}
          style={{
            backgroundColor: "rgb(30, 58, 111)",
            border: "none",
            borderRadius: "14px",
            padding: "12px 22px",
            fontWeight: "600",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
          }}
        >
          <FaPlus size={14} />
          Add Expense
        </Button>
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
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
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
                    backgroundColor: "#FFDCE2",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaMoneyBillWave size={18} style={{ color: "#F94765" }} />
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
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
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
                    backgroundColor: "#FEF6D7",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaPercent size={18} style={{ color: "#FED229" }} />
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
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
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
                    backgroundColor: "#FFE0CB",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaCheckCircle size={18} style={{ color: "#FF8532" }} />
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
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
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
                    backgroundColor: "#D3EAFF",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaClock size={18} style={{ color: "#437EF7" }} />
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
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text
                  style={{ backgroundColor: "#fff", borderRight: "none" }}
                >
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by reference or category..."
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
                    {cat} ({expenses.filter(e => e.category === cat).length})
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
                title="Clear filters"
              >
                <FaFilter />
              </Button>
            </Col>
          </Row>

          {getFilterText().length > 0 && (
            <div className="mt-3 pt-2 border-top">
              <small className="text-muted me-2">Active filters:</small>
              {getFilterText().map((filter, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px 12px",
                    marginRight: "8px",
                    borderRadius: "20px",
                    display: "inline-block",
                    fontSize: "12px",
                  }}
                  onClick={() => {
                    if (filter.includes("Category")) setCategoryFilter("all");
                    if (filter.includes("Status")) setPaymentStatusFilter("all");
                    if (filter.includes("Search")) setSearchTerm("");
                  }}
                >
                  {filter} <FaTimes size={10} className="ms-2" />
                </span>
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
      </div>

      {/* Expenses Table - Limited Fields */}
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
                  <th style={{ padding: "16px 12px" }}>Expense Details</th>
                  <th style={{ padding: "16px 12px" }}>Category</th>
                  <th style={{ padding: "16px 12px" }}>Amount</th>
                  <th style={{ padding: "16px 12px" }}>Tax</th>
                  <th style={{ padding: "16px 12px" }}>Total</th>
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const expenseDate = formatDate(expense.expense_date);
                  return (
                    <tr
                      key={expense.id}
                      style={{ borderBottom: "1px solid #e9ecef" }}
                    >
                      {/* Expense Details */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="fw-semibold">{expense.reference_no}</div>
                        <small className="text-muted">{expenseDate}</small>
                        {expense.description && (
                          <div>
                            <small className="text-muted" style={{ fontSize: "11px" }}>
                              {expense.description.length > 40
                                ? expense.description.substring(0, 40) + "..."
                                : expense.description}
                            </small>
                          </div>
                        )}
                       </td>

                      {/* Category */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: categoryConfig[expense.category]?.bg || categoryConfig.default.bg,
                            color: categoryConfig[expense.category]?.color || categoryConfig.default.color,
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {categoryConfig[expense.category]?.label || expense.category}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#1e293b",
                          }}
                        >
                          ₹{parseFloat(expense.amount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Tax */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            fontWeight: "500",
                            color: "#64748b",
                          }}
                        >
                          ₹{parseFloat(expense.tax_amount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            fontWeight: "700",
                            color: "#1e293b",
                          }}
                        >
                          ₹{parseFloat(expense.total_amount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: statusConfig[expense.payment_status?.toLowerCase()]?.bg || statusConfig.pending.bg,
                            color: statusConfig[expense.payment_status?.toLowerCase()]?.color || statusConfig.pending.color,
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {statusConfig[expense.payment_status?.toLowerCase()]?.label || expense.payment_status}
                        </span>
                      </td>

                      {/* Actions Dropdown */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="action-dropdown">
                          <button
                            className="action-trigger"
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === expense.id ? null : expense.id,
                              )
                            }
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#f1f5f9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "transparent")
                            }
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="6" r="2" fill="currentColor" />
                              <circle cx="12" cy="12" r="2" fill="currentColor" />
                              <circle cx="12" cy="18" r="2" fill="currentColor" />
                            </svg>
                          </button>

                          {activeDropdown === expense.id && (
                            <div className="dropdown-menu-custom">
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleView(expense);
                                }}
                                className="dropdown-item-custom"
                                title="View Details"
                              >
                                <FaEye style={{ color: "#4361ee", fontSize: "14px" }} />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleEdit(expense.id);
                                }}
                                className="dropdown-item-custom"
                                title="Edit"
                              >
                                <FaEdit style={{ color: "#ff9800", fontSize: "14px" }} />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleDelete(expense.id, expense.category);
                                }}
                                className="dropdown-item-custom delete"
                                title="Delete"
                              >
                                <FaTrash style={{ color: "#dc3545", fontSize: "14px" }} />
                              </button>
                            </div>
                          )}
                        </div>

                        <style>{`
                          .action-dropdown { position: relative; }
                          .action-trigger { color: #64748b; transition: all 0.2s; }
                          .action-trigger:hover { color: #1e293b; }
                          .dropdown-menu-custom {
                            position: absolute;
                            top: 100%;
                            right: 0;
                            margin-top: 4px;
                            min-width: 40px;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                            z-index: 1000;
                            overflow: hidden;
                            animation: dropdownSlide 0.2s ease;
                            display: flex;
                            flex-direction: column;
                            gap: 2px;
                            padding: 4px;
                          }
                          @keyframes dropdownSlide {
                            from { opacity: 0; transform: translateY(-5px); }
                            to { opacity: 1; transform: translateY(0); }
                          }
                          .dropdown-item-custom {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            padding: 6px;
                            border: none;
                            background: white;
                            cursor: pointer;
                            transition: background-color 0.2s;
                            border-radius: 6px;
                          }
                          .dropdown-item-custom:hover { background-color: #f8fafc; }
                          .dropdown-item-custom.delete:hover { background-color: #fef2f2; }
                        `}</style>
                      </td>
                    </tr>
                  );
                })}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No expenses found</h5>
                        <p className="text-muted small">
                          Try adjusting your search or filter criteria
                        </p>
                        <Button 
                          style={{
                            backgroundColor: "rgb(30, 58, 111)",
                            border: "none"
                          }}
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
    </Container>
  );
};

export default Expenses;