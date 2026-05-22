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
  FaDownload,
  FaBox,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getInvoices, deleteInvoice, downloadInvoicePDF } from "../../api/tenant/invoice.api";
import Swal from "sweetalert2";

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [partyTypeFilter, setPartyTypeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getInvoices();
      console.log("Invoices response:", response);

      let invoicesData = [];

      if (response?.data?.data && Array.isArray(response.data.data)) {
        invoicesData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        invoicesData = response.data;
      } else if (Array.isArray(response)) {
        invoicesData = response;
      } else if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        invoicesData = response.data.data.data;
      }

      const formattedInvoices = invoicesData.map((invoice) => ({
        id: invoice.id,
        invoice_no: invoice.invoice_no,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        party_type: invoice.party_type,
        party_id: invoice.party_id,
        party_name: invoice.party_name,
        party_gst: invoice.party_gst,
        party_address: invoice.party_address,
        subtotal: parseFloat(invoice.subtotal) || 0,
        discount_type: invoice.discount_type,
        discount_value: parseFloat(invoice.discount_value) || 0,
        discount_amount: parseFloat(invoice.discount_amount) || 0,
        taxable_amount: parseFloat(invoice.taxable_amount) || 0,
        gst_amount: parseFloat(invoice.gst_amount) || 0,
        cess_amount: parseFloat(invoice.cess_amount) || 0,
        total_amount: parseFloat(invoice.total_amount) || 0,
        round_off: parseFloat(invoice.round_off) || 0,
        net_amount: parseFloat(invoice.net_amount) || 0,
        payment_status: invoice.payment_status,
        paid_amount: parseFloat(invoice.paid_amount) || 0,
        balance_amount: parseFloat(invoice.balance_amount) || 0,
        payment_method: invoice.payment_method,
        transaction_id: invoice.transaction_id,
        notes: invoice.notes,
        terms_conditions: invoice.terms_conditions,
        created_by: invoice.created_by,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at,
        items: invoice.items || [],
        item_count: invoice.items?.length || 0,
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load invoices");
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

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    navigate(`/invoices/edit/${id}`);
  };

  const handleAdd = () => {
    navigate("/invoices/create");
  };

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
        console.error("Delete error:", error);
        toast.error(error.response?.data?.message || "Failed to delete invoice", {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
          transition: Bounce,
        });
      }
    }
  };

  const handleDownload = async (invoice) => {
    setDownloading(true);
    try {
      const response = await downloadInvoicePDF(invoice.id);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoice.invoice_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`✅ Invoice "${invoice.invoice_no}" downloaded successfully!`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.response?.data?.message || "Failed to download invoice", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setDownloading(false);
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { bg: "success", text: "Paid" },
      unpaid: { bg: "danger", text: "Unpaid" },
      partial: { bg: "warning", text: "Partially Paid" },
      overdue: { bg: "danger", text: "Overdue" },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.unpaid;
    return (
      <Badge bg={config.bg} className="rounded-pill px-3 py-2">
        {config.text}
      </Badge>
    );
  };

  const getPartyTypeBadge = (type) => {
    const typeConfig = {
      customer: { bg: "info", text: "Customer" },
      dealer: { bg: "secondary", text: "Dealer" },
    };
    const config = typeConfig[type] || typeConfig.customer;
    return (
      <Badge bg={config.bg} className="rounded-pill px-2 py-1">
        {config.text}
      </Badge>
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
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

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

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === "" ||
      invoice.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.party_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPartyType = partyTypeFilter === "all" || invoice.party_type === partyTypeFilter;
    const matchesPaymentStatus = paymentStatusFilter === "all" || invoice.payment_status === paymentStatusFilter;

    return matchesSearch && matchesPartyType && matchesPaymentStatus;
  });

  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.net_amount || 0), 0),
    paidAmount: invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0),
    pendingAmount: invoices.reduce((sum, inv) => sum + (inv.balance_amount || 0), 0),
    paid: invoices.filter((inv) => inv.payment_status === "paid").length,
    unpaid: invoices.filter((inv) => inv.payment_status === "unpaid").length,
    partial: invoices.filter((inv) => inv.payment_status === "partial").length,
  };

  const getFilterText = () => {
    const filters = [];
    if (partyTypeFilter !== "all") filters.push(`Party: ${partyTypeFilter}`);
    if (paymentStatusFilter !== "all") filters.push(`Status: ${paymentStatusFilter}`);
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters;
  };

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light">
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
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">Loading invoices...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
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
          <h2 className="fw-bold mb-1">
            <FaFileInvoice className="me-2 text-primary" /> Invoice Management
          </h2>
          <p className="text-muted">Manage all GST invoices and track payments</p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <FaPlus className="me-2" /> Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Total Invoices</small>
              <h3 className="fw-bold mb-0">{stats.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Total Amount</small>
              <h3 className="fw-bold text-primary mb-0">₹{formatCurrency(stats.totalAmount)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Paid Amount</small>
              <h3 className="fw-bold text-success mb-0">₹{formatCurrency(stats.paidAmount)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Pending Amount</small>
              <h3 className="fw-bold text-warning mb-0">₹{formatCurrency(stats.pendingAmount)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="danger" className="mb-4">
          <div className="d-flex align-items-center">
            <FaFileInvoice size={24} className="me-3" />
            <div>
              <strong>{errorMessage}</strong>
            </div>
          </div>
        </Alert>
      )}

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
                  placeholder="Search by invoice no or party name..."
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
              <Form.Select value={partyTypeFilter} onChange={(e) => setPartyTypeFilter(e.target.value)}>
                <option value="all">All Parties</option>
                <option value="customer">Customers</option>
                <option value="dealer">Dealers</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
                <option value="all">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partially Paid</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
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
                    if (filter.includes("Party")) setPartyTypeFilter("all");
                    if (filter.includes("Status")) setPaymentStatusFilter("all");
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

      {/* Invoices Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Party</th>
                  <th>Party Name</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Taxable</th>
                  <th>GST</th>
                  <th>Net Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="fw-semibold">{invoice.id}</td>
                      <td>
                        <div className="fw-semibold text-primary">{invoice.invoice_no}</div>
                        <small className="text-muted">ID: {invoice.id}</small>
                      </td>
                      <td>{formatDate(invoice.invoice_date)}</td>
                      <td>{getPartyTypeBadge(invoice.party_type)}</td>
                      <td>
                        <div className="fw-semibold">{invoice.party_name}</div>
                        <small className="text-muted">GST: {invoice.party_gst || "N/A"}</small>
                      </td>
                      <td className="text-center">
                        <Badge bg="info" className="rounded-pill">
                          <FaBox className="me-1" size={10} />
                          {invoice.item_count || invoice.items?.length || 0}
                        </Badge>
                      </td>
                      <td className="text-end">₹{formatCurrency(invoice.subtotal)}</td>
                      <td className="text-end text-danger">-₹{formatCurrency(invoice.discount_amount)}</td>
                      <td className="text-end">₹{formatCurrency(invoice.taxable_amount)}</td>
                      <td className="text-end">₹{formatCurrency(invoice.gst_amount)}</td>
                      <td className="text-end fw-bold text-primary">₹{formatCurrency(invoice.net_amount)}</td>
                      <td className="text-end text-success">₹{formatCurrency(invoice.paid_amount)}</td>
                      <td className="text-end text-warning">₹{formatCurrency(invoice.balance_amount)}</td>
                      <td className={new Date(invoice.due_date) < new Date() ? "text-danger" : ""}>
                        {formatDate(invoice.due_date)}
                      </td>
                      <td>{getPaymentStatusBadge(invoice.payment_status)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="rounded-circle"
                            style={{ width: "32px", height: "32px", padding: "0" }}
                            onClick={() => handleDownload(invoice)}
                            title="Download PDF"
                            disabled={downloading}
                          >
                            <FaDownload />
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="rounded-circle"
                            style={{ width: "32px", height: "32px", padding: "0" }}
                            onClick={() => handleView(invoice)}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-circle"
                            style={{ width: "32px", height: "32px", padding: "0" }}
                            onClick={() => handleEdit(invoice.id)}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-circle"
                            style={{ width: "32px", height: "32px", padding: "0" }}
                            onClick={() => handleDelete(invoice.id, invoice.invoice_no)}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="16" className="text-center py-5">
                      <div className="py-4">
                        <FaFileInvoice size={50} className="text-muted mb-3" />
                        <h5 className="text-muted">No invoices found</h5>
                        <p className="text-muted small">
                          {searchTerm || partyTypeFilter !== "all" || paymentStatusFilter !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "Click 'Create Invoice' to add your first invoice"}
                        </p>
                        {(searchTerm || partyTypeFilter !== "all" || paymentStatusFilter !== "all") && (
                          <Button variant="primary" size="sm" onClick={clearFilters}>
                            Clear all filters
                          </Button>
                        )}
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
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-primary text-white rounded-top-3 border-0">
          <Modal.Title className="fw-bold">
            <FaEye className="me-2" /> Invoice Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedInvoice && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 bg-light rounded-3">
                    <Card.Body>
                      <h6 className="fw-bold mb-3">Invoice Information</h6>
                      <hr />
                      <div><strong>Invoice No:</strong> {selectedInvoice.invoice_no}</div>
                      <div><strong>Invoice Date:</strong> {formatDate(selectedInvoice.invoice_date)}</div>
                      <div><strong>Due Date:</strong> {formatDate(selectedInvoice.due_date)}</div>
                      <div><strong>Payment Status:</strong> {getPaymentStatusBadge(selectedInvoice.payment_status)}</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light rounded-3">
                    <Card.Body>
                      <h6 className="fw-bold mb-3">Party Information</h6>
                      <hr />
                      <div><strong>Name:</strong> {selectedInvoice.party_name}</div>
                      <div><strong>Type:</strong> {selectedInvoice.party_type?.toUpperCase()}</div>
                      <div><strong>GSTIN:</strong> {selectedInvoice.party_gst || "N/A"}</div>
                      <div><strong>Address:</strong> {selectedInvoice.party_address || "N/A"}</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Invoice Items Table */}
              <h6 className="fw-bold mb-3">
                <FaBox className="me-2 text-primary" /> Invoice Items
              </h6>
              <div className="table-responsive mb-4">
                <Table bordered className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Rate (₹)</th>
                      <th>Discount %</th>
                      <th>Taxable Value</th>
                      <th>GST%</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="text-center">{idx + 1}</td>
                          <td>
                            <strong>{item.product_name || `Cylinder Type ID: ${item.cylinder_type_id}`}</strong>
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">₹{formatCurrency(item.rate)}</td>
                          <td className="text-end">{item.discount_percent || 0}%</td>
                          <td className="text-end">₹{formatCurrency(item.taxable_value)}</td>
                          <td className="text-center">{item.gst_percent || 0}%</td>
                          <td className="text-end fw-bold text-primary">₹{formatCurrency(item.total_amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted">No items found</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan="7" className="text-end fw-bold">Subtotal:</td>
                      <td className="text-end">₹{formatCurrency(selectedInvoice.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan="7" className="text-end fw-bold">Discount:</td>
                      <td className="text-end text-danger">-₹{formatCurrency(selectedInvoice.discount_amount)}</td>
                    </tr>
                    <tr>
                      <td colSpan="7" className="text-end fw-bold">Taxable Amount:</td>
                      <td className="text-end">₹{formatCurrency(selectedInvoice.taxable_amount)}</td>
                    </tr>
                    <tr>
                      <td colSpan="7" className="text-end fw-bold">GST Amount:</td>
                      <td className="text-end">₹{formatCurrency(selectedInvoice.gst_amount)}</td>
                    </tr>
                    <tr>
                      <td colSpan="7" className="text-end fw-bold">Cess Amount:</td>
                      <td className="text-end">₹{formatCurrency(selectedInvoice.cess_amount)}</td>
                    </tr>
                    <tr>
                      <td colSpan="7" className="text-end fw-bold">Round Off:</td>
                      <td className="text-end">₹{formatCurrency(selectedInvoice.round_off)}</td>
                    </tr>
                    <tr className="table-primary">
                      <td colSpan="7" className="text-end fw-bold fs-5">Net Amount:</td>
                      <td className="text-end fw-bold fs-5 text-primary">
                        ₹{formatCurrency(selectedInvoice.net_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              {/* Payment Information */}
              {selectedInvoice.paid_amount > 0 && (
                <Row>
                  <Col md={6}>
                    <Card className="border-0 bg-light rounded-3">
                      <Card.Body>
                        <h6 className="fw-bold mb-3">Payment Information</h6>
                        <hr />
                        <div><strong>Paid Amount:</strong> ₹{formatCurrency(selectedInvoice.paid_amount)}</div>
                        <div><strong>Payment Method:</strong> {selectedInvoice.payment_method || "N/A"}</div>
                        <div><strong>Transaction ID:</strong> {selectedInvoice.transaction_id || "N/A"}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-light rounded-3">
                      <Card.Body>
                        <h6 className="fw-bold mb-3">Additional Notes</h6>
                        <hr />
                        <div>{selectedInvoice.notes || "No notes"}</div>
                        <div className="mt-2"><strong>Terms:</strong> {selectedInvoice.terms_conditions || "N/A"}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
          {selectedInvoice && (
            <>
              <Button 
                variant="success" 
                onClick={() => handleDownload(selectedInvoice)}
                disabled={downloading}
              >
                <FaDownload className="me-2" /> 
                {downloading ? "Downloading..." : "Download PDF"}
              </Button>
              <Button variant="primary" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedInvoice.id);
              }}>
                <FaEdit className="me-2" /> Edit Invoice
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <style>{`
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

export default Invoices;