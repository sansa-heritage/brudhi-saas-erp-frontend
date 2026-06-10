import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Tabs,
  Tab,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaCreditCard,
  FaFileInvoice,
  FaCalendarAlt,
  FaUserCircle,
  FaIdCard,
  FaHashtag,
  FaMoneyBill,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
  FaCity,
  FaMapPin,
  FaLaptop,
  FaTag,
  FaDownload,
  FaInfoCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaPercent,
  FaReceipt,
  FaStore,
  FaChartLine,
} from "react-icons/fa";
import { getExpenseById, deleteExpense } from "../../api/tenant/expense.api";
import Swal from "sweetalert2";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Status color mapping (same as Expenses list)
const statusConfig = {
  paid: { bg: "#ECFDF3", color: "#027A48", label: "Paid" },
  pending: { bg: "#FFDCE2", color: "#F94765", label: "Pending" },
  cancelled: { bg: "#FFF2F0", color: "#E2341D", label: "Cancelled" },
};

// Category color mapping (same as Expenses list)
const categoryConfig = {
  Rent: { bg: "#D3EAFF", color: "#437EF7", label: "Rent" },
  Utilities: { bg: "#FFE0CB", color: "#FF8532", label: "Utilities" },
  Salary: { bg: "#ECFDF3", color: "#027A48", label: "Salary" },
  Marketing: { bg: "#FEF6D7", color: "#FED229", label: "Marketing" },
  Maintenance: { bg: "#FFDCE2", color: "#F94765", label: "Maintenance" },
  Supplies: { bg: "#D3EAFF", color: "#437EF7", label: "Supplies" },
  Travel: { bg: "#FFDCE2", color: "#F94765", label: "Travel" },
  default: { bg: "#F3F4F6", color: "#1e293b", label: "Other" },
};

const ViewExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpense = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getExpenseById(id);
        console.log("Expense response:", response);

        let expenseData = null;
        if (response?.data?.data) expenseData = response.data.data;
        else if (response?.data) expenseData = response.data;
        else expenseData = response;

        if (!expenseData) {
          setError("Expense not found");
          setLoading(false);
          return;
        }

        // Calculate GST rate from tax_amount and amount
        let gstRate = 0;
        if (expenseData.amount > 0 && expenseData.tax_amount > 0) {
          gstRate = (expenseData.tax_amount / expenseData.amount) * 100;
        }

        setExpense({
          ...expenseData,
          gst_rate: gstRate.toFixed(0),
          expense_date: expenseData.expense_date || expenseData.expenseDate,
          reference_no: expenseData.reference_no || expenseData.referenceNo || `EXP-${expenseData.id}`,
          created_by: expenseData.created_by || expenseData.createdBy || "Admin",
        });
      } catch (error) {
        console.error("Failed to fetch expense:", error);
        setError(error.response?.data?.message || "Failed to load expense details");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchExpense();
    }
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete expense "${expense?.category}"?`,
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
        toast.success(`✓ Expense deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
        setTimeout(() => {
          navigate("/expenses");
        }, 1500);
      } catch (error) {
        toast.error(`✗ ${error.response?.data?.message || "Failed to delete expense"}`, {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
          transition: Bounce,
        });
      }
    }
  };

  const getPaymentStatusBadge = (status) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const config = categoryConfig[category] || categoryConfig.default;
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <Container
        fluid
        className="p-4"
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
          <h5 className="mt-3 text-muted">Loading expense details...</h5>
        </div>
      </Container>
    );
  }

  if (error || !expense) {
    return (
      <Container
        fluid
        className="p-4"
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
        <Alert variant="secondary" className="text-center">
          <h4>Expense not found</h4>
          <p>{error || "The expense you're looking for doesn't exist."}</p>
          <Button variant="secondary" onClick={() => navigate("/expenses")}>
            Back to Expenses
          </Button>
        </Alert>
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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {/* <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            {expense.category} Expense
          </h2>
          <p className="text-muted mb-0">Reference: {expense.reference_no}</p> */}
        </div>
        <div className="d-flex gap-2">
          <Button
            onClick={() => navigate(`/expenses/edit/${expense.id}`)}
            style={{
              backgroundColor: "rgb(30, 58, 111)",
              border: "none",
              borderRadius: "30px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaEdit size={14} /> Edit
          </Button>
          {/* <Button
            onClick={handleDelete}
            style={{
              backgroundColor: "#dc3545",
              border: "none",
              borderRadius: "30px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaTrash size={14} /> Delete
          </Button> */}
        </div>
      </div>

      {/* Tabs Section */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3 px-4">
          <Tabs
            defaultActiveKey="overview"
            className="border-0 gap-2"
            style={{ borderBottom: "2px solid #e9ecef" }}
          >
            <Tab
              eventKey="overview"
              title={
                <span className="fw-semibold">
                  <FaFileInvoice className="me-2" /> Overview
                </span>
              }
              tabClassName="border-0"
            >
              <div className="p-3">
                {/* Basic Information Section */}
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaTag className="me-2" /> Basic Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Reference Number
                      </small>
                      <strong>{expense.reference_no}</strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Category
                      </small>
                      {getCategoryBadge(expense.category)}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Expense Date
                      </small>
                      <strong>
                        <FaCalendarAlt className="me-1" size={12} />
                        {formatDate(expense.expense_date)}
                      </strong>
                    </div>
                  </Col>
                </Row>

                {/* Description Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaLaptop className="me-2" /> Description
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={12}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Description
                      </small>
                      <strong>{expense.description || "No description provided"}</strong>
                    </div>
                  </Col>
                </Row>

                {/* Financial Information Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaMoneyBillWave className="me-2" /> Financial Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Amount
                      </small>
                      <strong>{formatCurrency(expense.amount)}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        GST Rate
                      </small>
                      <strong>{expense.gst_rate || 0}%</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Tax Amount
                      </small>
                      <strong>{formatCurrency(expense.tax_amount || 0)}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Total Amount
                      </small>
                      <strong className="text-primary">
                        {formatCurrency(expense.total_amount || expense.amount || 0)}
                      </strong>
                    </div>
                  </Col>
                </Row>

                {/* Payment Information Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaCreditCard className="me-2" /> Payment Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Payment Status
                      </small>
                      {getPaymentStatusBadge(expense.payment_status)}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Created By
                      </small>
                      <strong>
                        <FaUser className="me-1" size={12} />
                        {expense.created_by || "Admin"}
                      </strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Created On
                      </small>
                      <strong>
                        <FaClock className="me-1" size={12} />
                        {formatDate(expense.created_at)}
                      </strong>
                    </div>
                  </Col>
                </Row>

                {/* Tax Calculation Summary */}
                {parseFloat(expense.gst_rate) > 0 && parseFloat(expense.amount) > 0 && (
                  <Alert variant="info" className="mt-4 rounded-3">
                    <small>
                      <strong>Tax Calculation Summary:</strong>
                      <br />• Amount: {formatCurrency(expense.amount)}
                      <br />• GST ({expense.gst_rate}%): {formatCurrency((parseFloat(expense.amount) * parseFloat(expense.gst_rate)) / 100)}
                      <br />•{" "}
                      <strong>
                        Total Amount: {formatCurrency(
                          parseFloat(expense.amount) +
                          (parseFloat(expense.amount) * parseFloat(expense.gst_rate)) / 100
                        )}
                      </strong>
                    </small>
                  </Alert>
                )}
              </div>
            </Tab>

            {/* <Tab
              eventKey="history"
              title={
                <span className="fw-semibold">
                  <FaChartLine className="me-2" /> History
                </span>
              }
            >
              <div className="p-5 text-center">
                <FaClock size={60} className="text-muted mb-3" />
                <h5 className="text-muted">No history records found</h5>
                <p className="text-muted small">
                  Expense history will appear here when available
                </p>
              </div>
            </Tab> */}
          </Tabs>
        </Card.Header>
      </Card>

      <style>{`
        .nav-tabs {
          border-bottom: none !important;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 10px 16px;
          font-size: 14px;
          transition: all 0.2s;
          border-radius: 30px;
          margin-right: 8px;
        }
        .nav-tabs .nav-link:hover {
          color: rgb(30, 58, 111);
          background: #f1f5f9;
        }
        .nav-tabs .nav-link.active {
          color: rgb(30, 58, 111);
          background: #eef2ff;
          border: none;
        }
        .rounded-3 {
          border-radius: 12px !important;
        }
      `}</style>
    </Container>
  );
};

export default ViewExpense;