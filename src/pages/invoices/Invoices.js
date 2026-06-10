// src/pages/invoices/Invoices.js

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
  FaFileInvoice,
  FaFilter,
  FaTimes,
  FaBox,
  FaDownload,
  FaMoneyBillWave,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaExclamationTriangle,
  FaInfoCircle,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import {
  getInvoices,
  deleteInvoice,
  downloadInvoice,
} from "../../api/tenant/invoice.api";

const Invoices = () => {
  const navigate = useNavigate();

  // State Management
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [partyTypeFilter, setPartyTypeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Constants
  const PAYMENT_STATUS_CONFIG = {
    paid: {
      bg: "#ECFDF3",
      color: "#027A48",
      label: "Paid",
      icon: <FaCheckCircle />,
    },
    unpaid: {
      bg: "#FEF6D7",
      color: "#FED229",
      label: "Unpaid",
      icon: <FaClock />,
    },
    partial: {
      bg: "#FFE4E6",
      color: "#E11D48",
      label: "Partial",
      icon: <FaMoneyBillWave />,
    },
    overdue: {
      bg: "#FFDCE2",
      color: "#F94765",
      label: "Overdue",
      icon: <FaBan />,
    },
  };

  // Load Invoices
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getInvoices();
      const invoicesData = extractInvoicesData(response);
      setInvoices(formatInvoicesData(invoicesData));
    } catch (error) {
      console.error("Failed to load invoices:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to load invoices",
      );
      toast.error("Failed to load invoices", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const extractInvoicesData = (response) => {
    if (response?.data?.data && Array.isArray(response.data.data))
      return response.data.data;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    if (response?.data?.data?.data && Array.isArray(response.data.data.data))
      return response.data.data.data;
    return [];
  };

  const formatInvoicesData = (invoicesData) => {
    return invoicesData.map((invoice) => ({
      id: invoice.id,
      invoice_no: invoice.invoice_no,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      party_type: invoice.party_type,
      party_name: invoice.party_name,
      party_gst: invoice.party_gst,
      party_address: invoice.party_address,
      subtotal: parseFloat(invoice.subtotal) || 0,
      discount_amount: parseFloat(invoice.discount_amount) || 0,
      taxable_amount: parseFloat(invoice.taxable_amount) || 0,
      gst_amount: parseFloat(invoice.gst_amount) || 0,
      cess_amount: parseFloat(invoice.cess_amount) || 0,
      round_off: parseFloat(invoice.round_off) || 0,
      net_amount: parseFloat(invoice.net_amount) || 0,
      payment_status: invoice.payment_status,
      paid_amount: parseFloat(invoice.paid_amount) || 0,
      balance_amount: parseFloat(invoice.balance_amount) || 0,
      payment_method: invoice.payment_method,
      transaction_id: invoice.transaction_id,
      notes: invoice.notes,
      terms_conditions: invoice.terms_conditions,
      items: invoice.items || [],
    }));
  };

  // CRUD Operations
  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleEdit = (id) => navigate(`/invoices/${id}`);
  const handleAdd = () => navigate("/invoices/create");

  const handleDelete = async (id, invoiceNo) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete invoice "${invoiceNo}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteInvoice(id);
        toast.success(`✅ Invoice "${invoiceNo}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
        await loadInvoices();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete invoice",
          {
            position: "top-right",
            autoClose: 4000,
            theme: "colored",
            transition: Bounce,
          },
        );
      }
    }
  };

  const handleDownload = async (invoiceId) => {
    try {
      const response = await downloadInvoice(invoiceId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    } catch (error) {
      toast.error("Failed to download invoice", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  // Filtering
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === "" ||
      invoice.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.party_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPartyType =
      partyTypeFilter === "all" || invoice.party_type === partyTypeFilter;
    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      invoice.payment_status === paymentStatusFilter;
    return matchesSearch && matchesPartyType && matchesPaymentStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setPartyTypeFilter("all");
    setPaymentStatusFilter("all");
    toast.info("Filters cleared", {
      position: "top-right",
      autoClose: 2000,
      theme: "colored",
      transition: Bounce,
    });
  };

  // Statistics
  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.net_amount || 0), 0),
    paidAmount: invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0),
    pendingAmount: invoices.reduce(
      (sum, inv) => sum + (inv.balance_amount || 0),
      0,
    ),
  };

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getPaymentStatusBadge = (status) => {
    const config =
      PAYMENT_STATUS_CONFIG[status?.toLowerCase()] ||
      PAYMENT_STATUS_CONFIG.unpaid;
    return (
      <span
        style={{
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          backgroundColor: config.bg,
          color: config.color,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  // Loading State
  if (loading) {
    return (
      <Container
        fluid
        className="p-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <ToastContainer />
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading invoices...</h4>
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
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {/* <h2 className="fw-bold mb-1" style={{ color: "rgb(30, 58, 111)" }}>
            <FaFileInvoice className="me-2" /> Invoice Management
          </h2> */}
          {/* <p className="text-muted">
            Manage all GST invoices and track payments
          </p> */}
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
          }}
        >
          <FaPlus size={14} /> Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <StatCard
          title="Total Invoices"
          value={stats.total}
          icon={<FaFileInvoice size={20} style={{ color: "#437EF7" }} />}
          bg="#D3EAFF"
        />
        <StatCard
          title="Total Amount"
          value={`₹${formatCurrency(stats.totalAmount)}`}
          icon={<FaRupeeSign size={20} style={{ color: "#027A48" }} />}
          bg="#ECFDF3"
        />
        <StatCard
          title="Paid Amount"
          value={`₹${formatCurrency(stats.paidAmount)}`}
          icon={<FaCheckCircle size={20} style={{ color: "#027A48" }} />}
          bg="#ECFDF3"
        />
        <StatCard
          title="Pending Amount"
          value={`₹${formatCurrency(stats.pendingAmount)}`}
          icon={<FaClock size={20} style={{ color: "#FED229" }} />}
          bg="#FEF6D7"
        />
      </Row>

      {/* Error Alert */}
      {errorMessage && (
        <Alert
          variant="danger"
          className="mb-4"
          onClose={() => setErrorMessage("")}
          dismissible
        >
          {errorMessage}
        </Alert>
      )}

      {/* Search and Filter */}
      <Card className="border-0 shadow-sm mb-4 rounded-3">
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
                  placeholder="Search by invoice no or party name..."
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
                value={partyTypeFilter}
                onChange={(e) => setPartyTypeFilter(e.target.value)}
              >
                <option value="all">All Parties</option>
                <option value="customer">Customers</option>
                <option value="dealer">Dealers</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
              >
                <option value="all">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partially Paid</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                className="w-100"
              >
                <FaFilter />
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          Showing {filteredInvoices.length} of {invoices.length} invoice records
        </p>
      </div>

      {/* Invoices Table */}
      <Card
        className="border-0 shadow-sm rounded-3"
        style={{ overflow: "hidden" }}
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
                  <th style={{ padding: "16px 12px" }}>Invoice No</th>
                  <th style={{ padding: "16px 12px" }}>Date</th>
                  <th style={{ padding: "16px 12px" }}>Party Name</th>
                  <th style={{ padding: "16px 12px" }}>Net Amount</th>
                  <th style={{ padding: "16px 12px" }}>Due Date</th>
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px", width: "60px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      invoice={invoice}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      formatDate={formatDate}
                      formatCurrency={formatCurrency}
                      getPaymentStatusBadge={getPaymentStatusBadge}
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <FaFileInvoice size={50} className="text-muted mb-3" />
                        <h5 className="text-muted">No invoices found</h5>
                        <p className="text-muted small">
                          Click 'Create Invoice' to add your first invoice
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* View Invoice Modal */}
      <InvoiceViewModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        invoice={selectedInvoice}
        onEdit={handleEdit}
        onDownload={handleDownload}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        getPaymentStatusBadge={getPaymentStatusBadge}
      />
    </Container>
  );
};

// ==============================================
// Stat Card Component
// ==============================================
const StatCard = ({ title, value, icon, bg }) => (
  <Col md={3}>
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Body className="py-3 px-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
              {title}
            </small>
            <h3 className="fw-bold mb-0" style={{ fontSize: "24px" }}>
              {value}
            </h3>
          </div>
          <div
            style={{
              backgroundColor: bg,
              padding: "10px",
              borderRadius: "12px",
            }}
          >
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

// ==============================================
// Table Row Component
// ==============================================
const TableRow = ({
  invoice,
  onView,
  onEdit,
  onDownload,
  onDelete,
  formatDate,
  formatCurrency,
  getPaymentStatusBadge,
  activeDropdown,
  setActiveDropdown,
}) => {
  const isOpen = activeDropdown === invoice.id;

  return (
    <tr style={{ borderBottom: "1px solid #e9ecef" }}>
      <td style={{ padding: "16px 12px" }}>
        <div className="fw-semibold" style={{ color: "rgb(30, 58, 111)" }}>
          {invoice.invoice_no}
        </div>
      </td>
      <td style={{ padding: "16px 12px" }}>
        {formatDate(invoice.invoice_date)}
      </td>
      <td style={{ padding: "16px 12px" }}>
        <div className="fw-semibold">{invoice.party_name}</div>
      </td>
      <td style={{ padding: "16px 12px" }}>
        <strong style={{ color: "#027A48" }}>
          ₹{formatCurrency(invoice.net_amount)}
        </strong>
      </td>
      <td style={{ padding: "16px 12px" }}>
        <span
          className={
            new Date(invoice.due_date) < new Date() ? "text-danger" : ""
          }
        >
          {formatDate(invoice.due_date)}
        </span>
      </td>
      <td style={{ padding: "16px 12px" }}>
        {getPaymentStatusBadge(invoice.payment_status)}
      </td>
      <td style={{ padding: "16px 12px" }}>
        <div className="action-dropdown">
          <button
            className="action-trigger"
            onClick={() => setActiveDropdown(isOpen ? null : invoice.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px",
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="6" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="18" r="2" fill="currentColor" />
            </svg>
          </button>
          {isOpen && (
            <div className="dropdown-menu-custom">
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  onView(invoice);
                }}
                className="dropdown-item-custom"
              >
                <FaEye style={{ color: "#4361ee", fontSize: "12px" }} />
              </button>
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  onEdit(invoice.id);
                }}
                className="dropdown-item-custom"
              >
                <FaEdit style={{ color: "#ff9800", fontSize: "12px" }} />
              </button>
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  onDownload(invoice.id);
                }}
                className="dropdown-item-custom"
              >
                <FaDownload style={{ color: "#4caf50", fontSize: "12px" }} />
              </button>
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  onDelete(invoice.id, invoice.invoice_no);
                }}
                className="dropdown-item-custom delete"
              >
                <FaTrash style={{ color: "#dc3545", fontSize: "12px" }} />
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// ==============================================
// Invoice View Modal Component
// ==============================================
const InvoiceViewModal = ({
  show,
  onHide,
  invoice,
  onEdit,
  onDownload,
  formatDate,
  formatCurrency,
  getPaymentStatusBadge,
}) => {
  if (!invoice) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header
        closeButton
        className="bg-dark text-white rounded-top-3 border-0"
      >
        <Modal.Title className="fw-bold">
          <FaEye className="me-2" /> Invoice Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="p-4"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <Row className="mb-4">
          <Col md={6}>
            <InfoCard title="Invoice Information" icon={<FaFileInvoice />}>
              <InfoRow
                label="Invoice Number"
                value={invoice.invoice_no}
                highlight
              />
              <InfoRow
                label="Invoice Date"
                value={formatDate(invoice.invoice_date)}
              />
              <InfoRow
                label="Due Date"
                value={formatDate(invoice.due_date)}
                danger={new Date(invoice.due_date) < new Date()}
              />
              <InfoRow
                label="Payment Status"
                value={getPaymentStatusBadge(invoice.payment_status)}
                isHtml
              />
            </InfoCard>
          </Col>
          <Col md={6}>
            <InfoCard title="Party Information" icon={<FaUser />}>
              <InfoRow label="Party Name" value={invoice.party_name} />
              <InfoRow
                label="Party Type"
                value={
                  <span
                    style={{
                      backgroundColor: "#ECFDF3",
                      color: "#027A48",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontWeight: "600",
                      fontSize: "13px",
                      display: "inline-block",
                    }}
                  >
                    {invoice.party_type?.toUpperCase()}
                  </span>
                }
                isHtml
              />
              <InfoRow label="GST Number" value={invoice.party_gst || "N/A"} />
              <InfoRow label="Address" value={invoice.party_address || "N/A"} />
            </InfoCard>
          </Col>
        </Row>

        {/* Items Table */}
        <Card className="border-0 shadow-sm rounded-3 mb-4">
          <Card.Header className="bg-white border-bottom pt-3 pb-2">
            <h6 className="fw-bold mb-0" style={{ color: "rgb(30, 58, 111)" }}>
              <FaBox className="me-2" /> Invoice Items
            </h6>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table bordered className="mb-0" style={{ fontSize: "14px" }}>
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th style={{ padding: "12px", width: "5%" }}>#</th>
                    <th style={{ padding: "12px", width: "30%" }}>Product</th>
                    <th style={{ padding: "12px", width: "8%" }}>Qty</th>
                    <th style={{ padding: "12px", width: "12%" }}>Rate (₹)</th>
                    <th style={{ padding: "12px", width: "10%" }}>Disc %</th>
                    <th style={{ padding: "12px", width: "12%" }}>Taxable</th>
                    <th style={{ padding: "12px", width: "8%" }}>GST%</th>
                    <th style={{ padding: "12px", width: "15%" }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>
                          <strong>
                            {item.product_name ||
                              `Cylinder Type ID: ${item.cylinder_type_id}`}
                          </strong>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">
                          ₹{formatCurrency(item.rate)}
                        </td>
                        <td className="text-end">
                          {item.discount_percent || 0}%
                        </td>
                        <td className="text-end">
                          ₹{formatCurrency(item.taxable_value)}
                        </td>
                        <td className="text-center">
                          {item.gst_percent || 0}%
                        </td>
                        <td
                          className="text-end fw-bold"
                          style={{ color: "#027A48" }}
                        >
                          ₹{formatCurrency(item.total_amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <td colSpan="7" className="text-end fw-bold">
                      Subtotal:
                    </td>
                    <td className="text-end">
                      ₹{formatCurrency(invoice.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="7" className="text-end fw-bold">
                      Discount:
                    </td>
                    <td className="text-end text-danger">
                      -₹{formatCurrency(invoice.discount_amount)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="7" className="text-end fw-bold">
                      Taxable Amount:
                    </td>
                    <td className="text-end">
                      ₹{formatCurrency(invoice.taxable_amount)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="7" className="text-end fw-bold">
                      GST Amount:
                    </td>
                    <td className="text-end">
                      ₹{formatCurrency(invoice.gst_amount)}
                    </td>
                  </tr>
                  {invoice.cess_amount > 0 && (
                    <tr>
                      <td colSpan="7" className="text-end fw-bold">
                        Cess Amount:
                      </td>
                      <td className="text-end">
                        ₹{formatCurrency(invoice.cess_amount)}
                      </td>
                    </tr>
                  )}
                  {invoice.round_off !== 0 && (
                    <tr>
                      <td colSpan="7" className="text-end fw-bold">
                        Round Off:
                      </td>
                      <td className="text-end">
                        ₹{formatCurrency(invoice.round_off)}
                      </td>
                    </tr>
                  )}
                  <tr style={{ backgroundColor: "#ECFDF3" }}>
                    <td
                      colSpan="7"
                      className="text-end fw-bold fs-5"
                      style={{ color: "#027A48" }}
                    >
                      Net Amount:
                    </td>
                    <td
                      className="text-end fw-bold fs-5"
                      style={{ color: "#027A48" }}
                    >
                      ₹{formatCurrency(invoice.net_amount)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Payment & Additional Info */}
        {invoice.paid_amount > 0 && (
          <Row className="mb-4">
            <Col md={6}>
              <InfoCard title="Payment Information" icon={<FaMoneyBillWave />}>
                <InfoRow
                  label="Paid Amount"
                  value={`₹${formatCurrency(invoice.paid_amount)}`}
                  success
                />
                <InfoRow
                  label="Balance Amount"
                  value={`₹${formatCurrency(invoice.balance_amount)}`}
                  danger={invoice.balance_amount > 0}
                />
                <InfoRow
                  label="Payment Method"
                  value={invoice.payment_method || "N/A"}
                />
                <InfoRow
                  label="Transaction ID"
                  value={invoice.transaction_id || "N/A"}
                />
              </InfoCard>
            </Col>
            <Col md={6}>
              <InfoCard title="Additional Information" icon={<FaInfoCircle />}>
                <InfoRow label="Notes" value={invoice.notes || "No notes"} />
                <InfoRow
                  label="Terms & Conditions"
                  value={invoice.terms_conditions || "N/A"}
                />
              </InfoCard>
            </Col>
          </Row>
        )}

        {invoice.payment_status === "partial" && (
          <Alert variant="warning" className="mb-0">
            <div className="d-flex align-items-center">
              <FaExclamationTriangle size={20} className="me-2" />
              <div>
                <strong>Partial Payment Alert!</strong> Balance amount of{" "}
                <strong>₹{formatCurrency(invoice.balance_amount)}</strong> is
                still pending.
              </div>
            </div>
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-white rounded-bottom-3 border-top">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          style={{ borderRadius: "10px", padding: "8px 20px" }}
        >
          Close
        </Button>
        <Button
          variant="success"
          onClick={() => onDownload(invoice.id)}
          style={{ borderRadius: "10px", padding: "8px 20px" }}
        >
          <FaDownload className="me-2" /> Download PDF
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onHide();
            onEdit(invoice.id);
          }}
          style={{ borderRadius: "10px", padding: "8px 20px" }}
        >
          <FaEdit className="me-2" /> Edit Invoice
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ==============================================
// Helper Components
// ==============================================
const InfoCard = ({ title, icon, children }) => (
  <Card className="border-0 shadow-sm rounded-3 h-100">
    <Card.Header className="bg-white border-bottom pt-3 pb-2">
      <h6 className="fw-bold mb-0" style={{ color: "rgb(30, 58, 111)" }}>
        {icon} {title}
      </h6>
    </Card.Header>
    <Card.Body>{children}</Card.Body>
  </Card>
);

const InfoRow = ({ label, value, isHtml, highlight, success, danger }) => (
  <div
    className={`mb-2 pb-2 border-bottom ${danger ? "text-danger fw-semibold" : success ? "text-success fw-semibold" : ""}`}
  >
    <small className="text-muted">{label}</small>
    <div
      className={highlight ? "fw-bold fs-5" : ""}
      style={highlight ? { color: "rgb(30, 58, 111)" } : {}}
    >
      {isHtml ? value : <span>{value}</span>}
    </div>
  </div>
);

// Styles
const styles = document.createElement("style");
styles.textContent = `
  .rounded-3 { border-radius: 0.75rem !important; }
  .table tbody tr:hover { background-color: #f8f9fa; }
  .action-dropdown { position: relative; }
  .action-trigger { color: #64748b; transition: all 0.2s; }
  .action-trigger:hover { color: #1e293b; background-color: #f1f5f9; }
  .dropdown-menu-custom {
    position: absolute; top: 100%; right: 0; margin-top: 4px; min-width: 36px;
    background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000; overflow: hidden; display: flex; flex-direction: column; gap: 2px; padding: 4px;
  }
  .dropdown-item-custom {
    display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;
    padding: 0; border: none; background: white; cursor: pointer; transition: background-color 0.2s;
    border-radius: 6px; font-size: 13px;
  }
  .dropdown-item-custom:hover { background-color: #f8fafc; }
  .dropdown-item-custom.delete:hover { background-color: #fef2f2; }
  .form-control:focus, .form-select:focus { border-color: rgb(30, 58, 111); box-shadow: 0 0 0 0.2rem rgba(30, 58, 111, 0.25); }
  .btn-primary { background-color: rgb(30, 58, 111); border-color: rgb(30, 58, 111); }
  .btn-primary:hover { background-color: #1e3a6f; border-color: #1e3a6f; }
`;
document.head.appendChild(styles);

export default Invoices;
