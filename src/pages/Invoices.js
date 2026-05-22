// frontend/src/pages/invoices/Invoices.jsx
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
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaArrowLeft,
  FaHome,
  FaFileInvoice,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaMoneyBillWave,
  FaPrint,
  FaEnvelope,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import InvoiceModal from "../components/Modals/InvoiceModal";
import {
  getInvoices,
  deleteInvoice,
  createInvoice,
  updateInvoice,
  getInvoiceStats,
  generateInvoicePDF,
  sendInvoiceEmail,
} from "../components/services/invoiceService";
import Swal from "sweetalert2";

const Invoices = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
    loadStats();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await getInvoices();
      console.log("Loaded invoices:", data);
      const invoicesArray = Array.isArray(data) ? data : [];
      setInvoices(invoicesArray);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load invoices. Please try again.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getInvoiceStats();
      console.log("Invoice stats:", data);
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/invoices/${id}`);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteInvoice(id);
      await loadInvoices();
      await loadStats();
      setShowDeleteConfirm(null);
      setSuccessMessage("Invoice deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      setErrorMessage(error.response?.data?.message || "Failed to delete invoice. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleSave = async (invoiceData) => {
    try {
      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.id, invoiceData);
        setSuccessMessage("Invoice updated successfully!");
      } else {
        await createInvoice(invoiceData);
        setSuccessMessage("Invoice created successfully!");
      }
      await loadInvoices();
      await loadStats();
      setShowModal(false);
      setSelectedInvoice(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save invoice:", error);
      setErrorMessage(error.response?.data?.message || "Failed to save invoice. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handlePrint = async (id) => {
    try {
      await generateInvoicePDF(id);
    } catch (error) {
      console.error("Failed to print invoice:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to generate PDF",
      });
    }
  };

  const handleSendEmail = async (id) => {
    const { value: email } = await Swal.fire({
      title: "Send Invoice via Email",
      input: "email",
      inputLabel: "Email Address",
      inputPlaceholder: "customer@example.com",
      showCancelButton: true,
      confirmButtonText: "Send",
      cancelButtonText: "Cancel",
    });

    if (email) {
      try {
        await sendInvoiceEmail(id, { to: email });
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Invoice sent successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Failed to send email:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to send email",
        });
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPaymentStatus("all");
    setDateRange("all");
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === "" ||
      (invoice.invoice_no && invoice.invoice_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.party_name && invoice.party_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.party_gst && invoice.party_gst.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = paymentStatus === "all" || invoice.payment_status === paymentStatus;
    
    let matchesDate = true;
    if (dateRange !== "all") {
      const today = new Date();
      const invoiceDate = new Date(invoice.invoice_date);
      const dueDate = new Date(invoice.due_date);
      
      if (dateRange === "overdue") {
        matchesDate = dueDate < today && invoice.payment_status !== "Paid";
      } else if (dateRange === "this_month") {
        matchesDate = invoiceDate.getMonth() === today.getMonth() && 
                      invoiceDate.getFullYear() === today.getFullYear();
      } else if (dateRange === "last_month") {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        matchesDate = invoiceDate.getMonth() === lastMonth.getMonth() &&
                      invoiceDate.getFullYear() === lastMonth.getFullYear();
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    const statuses = {
      Paid: { text: "Paid", color: "success" },
      Unpaid: { text: "Unpaid", color: "danger" },
      "Partially Paid": { text: "Partially Paid", color: "warning" },
      Overdue: { text: "Overdue", color: "danger" },
    };
    return statuses[status] || { text: status, color: "secondary" };
  };

  const getFilterText = () => {
    const filters = [];
    if (paymentStatus !== "all") filters.push(`Status: ${paymentStatus}`);
    if (dateRange !== "all") filters.push(`Date: ${dateRange.replace("_", " ")}`);
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters;
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  // Calculate summary totals
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.net_amount || 0), 0);
  const paidAmount = filteredInvoices
    .filter(inv => inv.payment_status === "Paid")
    .reduce((sum, inv) => sum + (inv.net_amount || 0), 0);
  const unpaidAmount = filteredInvoices
    .filter(inv => inv.payment_status === "Unpaid" || inv.payment_status === "Overdue")
    .reduce((sum, inv) => sum + (inv.balance_amount || inv.net_amount || 0), 0);

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">Loading invoices...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4" style={{ background: "#f0f2f5" }}>
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
        <Alert variant="success" className="mb-3" onClose={() => setSuccessMessage("")} dismissible>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="danger" className="mb-3" onClose={() => setErrorMessage("")} dismissible>
          {errorMessage}
        </Alert>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FaFileInvoice className="me-2" /> Invoice Management
          </h2>
          <p className="text-muted">
            Manage all invoices, track payments, and generate reports
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedInvoice(null);
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" /> Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Invoices</h6>
                  <h3 className="mb-0">{stats.totalInvoices}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded p-3">
                  <FaFileInvoice size={24} className="text-primary" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Amount</h6>
                  <h3 className="mb-0">₹{stats.totalAmount?.toLocaleString() || 0}</h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded p-3">
                  <FaRupeeSign size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Amount Collected</h6>
                  <h3 className="mb-0">₹{stats.paidAmount?.toLocaleString() || 0}</h3>
                </div>
                <div className="bg-info bg-opacity-10 rounded p-3">
                  <FaMoneyBillWave size={24} className="text-info" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Pending Amount</h6>
                  <h3 className="mb-0">₹{stats.unpaidAmount?.toLocaleString() || 0}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded p-3">
                  <FaCalendarAlt size={24} className="text-warning" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by invoice number, customer name, GST..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="all">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="all">All Dates</option>
                <option value="overdue">Overdue Invoices</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button variant="outline-secondary" onClick={clearFilters} className="w-100" title="Clear all filters">
                <FaFilter />
              </Button>
            </Col>
          </Row>

          {/* Summary Row */}
          <div className="mt-3 pt-2 border-top">
            <Row>
              <Col md={4}>
                <small className="text-muted">Filtered Total: </small>
                <strong>₹{totalAmount.toLocaleString()}</strong>
              </Col>
              <Col md={4}>
                <small className="text-muted text-success">Collected: </small>
                <strong className="text-success">₹{paidAmount.toLocaleString()}</strong>
              </Col>
              <Col md={4}>
                <small className="text-muted text-danger">Pending: </small>
                <strong className="text-danger">₹{unpaidAmount.toLocaleString()}</strong>
              </Col>
            </Row>
          </div>

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
                    if (filter.includes("Status")) setPaymentStatus("all");
                    if (filter.includes("Date")) setDateRange("all");
                    if (filter.includes("Search")) setSearchTerm("");
                  }}
                >
                  {filter} <FaTimes size={10} className="ms-2" />
                </Badge>
              ))}
              <Button variant="link" size="sm" onClick={clearFilters} className="p-0 ms-2">
                Clear all
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>
        {filteredInvoices.length === 0 && (
          <Button variant="link" onClick={clearFilters} className="p-0">
            Clear all filters
          </Button>
        )}
      </div>

      {/* Invoices Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Invoice No.</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Customer Name</th>
                  <th>GSTIN</th>
                  <th>Amount (₹)</th>
                  <th>Paid / Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const statusBadge = getStatusBadge(invoice.payment_status);
                  const isOverdue = new Date(invoice.due_date) < new Date() && invoice.payment_status !== "Paid";
                  
                  return (
                    <tr key={invoice.id} className={isOverdue ? "table-danger-light" : ""}>
                      <td>
                        <div className="fw-semibold">{invoice.invoice_no}</div>
                        <small className="text-muted">ID: {invoice.id}</small>
                      </td>
                      <td>{invoice.invoice_date}</td>
                      <td className={isOverdue ? "text-danger fw-semibold" : ""}>
                        {invoice.due_date}
                        {isOverdue && <Badge bg="danger" className="ms-2">OVERDUE</Badge>}
                      </td>
                      <td>
                        <div className="fw-semibold">{invoice.party_name}</div>
                        <small className="text-muted">{invoice.party_type}</small>
                      </td>
                      <td>{invoice.party_gst || "N/A"}</td>
                      <td className="fw-semibold">₹{(invoice.net_amount || 0).toLocaleString()}</td>
                      <td>
                        <div>Paid: ₹{(invoice.paid_amount || 0).toLocaleString()}</div>
                        <div className="text-danger">Balance: ₹{(invoice.balance_amount || invoice.net_amount || 0).toLocaleString()}</div>
                      </td>
                      <td>
                        <Badge bg={statusBadge.color}>{statusBadge.text}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="light"
                          size="sm"
                          className="me-1"
                          onClick={() => handleViewDetails(invoice.id)}
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEdit(invoice)}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="me-1"
                          onClick={() => handlePrint(invoice.id)}
                          title="Print PDF"
                        >
                          <FaPrint />
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="me-1"
                          onClick={() => handleSendEmail(invoice.id)}
                          title="Send Email"
                        >
                          <FaEnvelope />
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(invoice.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No invoices found</h5>
                        <p className="text-muted small">
                          Try adjusting your search or filter criteria
                        </p>
                        <Button variant="primary" size="sm" onClick={clearFilters}>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <Card style={{ width: "400px" }}>
            <Card.Body>
              <h5>Confirm Delete</h5>
              <p>
                Are you sure you want to delete this invoice? This action
                cannot be undone.
              </p>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => handleDelete(showDeleteConfirm)}>
                  Delete
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onSave={handleSave}
      />

      <style jsx="true">{`
        .table-danger-light {
          background-color: rgba(220, 53, 69, 0.05);
        }
      `}</style>
    </Container>
  );
};

export default Invoices;