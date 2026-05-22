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
  FaUsers,
  FaStar,
  FaTrophy,
  FaFilter,
  FaTimes,
  FaArrowLeft,
  FaHome,
  FaUserCheck,
  FaRupeeSign,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getCustomers,
  deleteCustomer,
} from "../../components/services/customerService";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [customerType, setCustomerType] = useState("all");
  const [status, setStatus] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await getCustomers();
      console.log("Loaded customers:", data);
      const customersArray = Array.isArray(data) ? data : [];
      setCustomers(customersArray);
    } catch (error) {
      console.error("Failed to load customers:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load customers. Please try again.",
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/customers/${id}`);
  };

  const handleAddCustomer = () => {
    navigate("/customers/add");
  };

  const handleEdit = (id) => {
    navigate(`/customers/edit/${id}`);
  };

  const handleDelete = async (id, customerName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete customer "${customerName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6c757d",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteCustomer(id);
        toast.success(`✓ Customer "${customerName}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
        await loadCustomers();
      } catch (error) {
        console.error("Failed to delete customer:", error);
        
        // Check for foreign key constraint error (customer has orders)
        const errorMsg = error.response?.data?.message || error.message || "";
        
        if (errorMsg.includes("foreign key constraint") || 
            errorMsg.includes("cannot delete") ||
            errorMsg.includes("orders_ibfk_1")) {
          toast.warning(`⚠️ Cannot delete "${customerName}" because they have existing orders. Please delete the orders first or mark customer as inactive.`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Bounce,
          });
        } else {
          toast.error(`✗ ${errorMsg || "Failed to delete customer"}`, {
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
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCustomerType("all");
    setStatus("all");
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchTerm === "" ||
      (customer.name &&
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.mobile && customer.mobile.includes(searchTerm)) ||
      (customer.gst_number &&
        customer.gst_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.customer_code &&
        customer.customer_code
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (customer.landmark &&
        customer.landmark.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.address &&
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      customerType === "all" || customer.customer_type === customerType;
    const matchesStatus = status === "all" || customer.status === status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getCustomerTypeBadge = (type) => {
    const types = {
      premium: { text: "Premium", color: "warning" },
      wholesale: { text: "Wholesale", color: "info" },
      regular: { text: "Regular", color: "secondary" },
    };
    return types[type] || types.regular;
  };

  // Stats
  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    premium: customers.filter((c) => c.customer_type === "premium").length,
    wholesale: customers.filter((c) => c.customer_type === "wholesale").length,
    regular: customers.filter((c) => c.customer_type === "regular").length,
    totalSales: customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0),
  };

  const getFilterText = () => {
    const filters = [];
    if (customerType !== "all") filters.push(`Type: ${customerType}`);
    if (status !== "all") filters.push(`Status: ${status}`);
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters;
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

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
          <h4 className="mt-3">Loading customers...</h4>
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
          <FaSignOutAlt className="me-1" /> Back to Dashboard{" "}
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
            {/* GST Billing */}
          </h2>
        </div>
        <Button
          variant="secondary"
          onClick={handleAddCustomer}
          style={{
            backgroundColor: "#6c757d",
            border: "none",
            borderRadius: "8px",
          }}
        >
          <FaPlus className="me-2" /> Add Customer
        </Button>
      </div>

      {/* Customers Section Title */}
      <div className="mb-3">
        <h3 className="fw-bold mb-0">Customers</h3>
        <p className="text-muted mb-0">
          Manage your customer database, view purchase history and documents
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
                    Total Customers
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.total}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Total: {stats.total}
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#e3f2fd",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaUsers size={18} style={{ color: "#4361ee" }} />
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
                    Active Customers
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.active}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Active: {stats.active}
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#e8f5e9",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaUserCheck size={18} style={{ color: "#4c08ec" }} />
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
                    Premium Customers
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.premium}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Premium: {stats.premium}
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#fff3e0",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaTrophy size={18} style={{ color: "#ff9800" }} />
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
                    Total Sales Value
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    ₹{stats.totalSales.toLocaleString()}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Lifetime revenue
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#e8f5e9",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaRupeeSign size={18} style={{ color: "#2e7d32" }} />
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
                  placeholder="Search customers..."
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
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value)}
              >
                <option value="all">All Customer Types ({stats.total})</option>
                <option value="premium">Premium ({stats.premium})</option>
                <option value="wholesale">Wholesale ({stats.wholesale})</option>
                <option value="regular">Regular ({stats.regular})</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Status ({stats.total})</option>
                <option value="active">Active ({stats.active})</option>
                <option value="inactive">
                  Inactive (
                  {customers.filter((c) => c.status === "inactive").length})
                </option>
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
                    if (filter.includes("Type")) setCustomerType("all");
                    if (filter.includes("Status")) setStatus("all");
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
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>
        {filteredCustomers.length === 0 && (
          <Button variant="link" onClick={clearFilters} className="p-0">
            Clear all filters
          </Button>
        )}
      </div>

      {/* Customers Table */}
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
                  <th style={{ padding: "16px 12px" }}>Customer Code</th>
                  <th style={{ padding: "16px 12px" }}>Customer Name</th>
                  <th style={{ padding: "16px 12px" }}>Contact Info</th>
                  <th style={{ padding: "16px 12px" }}>GST / PAN / Aadhaar</th>
                  <th style={{ padding: "16px 12px" }}>Customer Type</th>
                  <th style={{ padding: "16px 12px" }}>Credit Limit</th>
                  <th style={{ padding: "16px 12px" }}>Outstanding</th>
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const customerTypeBadge = getCustomerTypeBadge(
                    customer.customer_type,
                  );
                  return (
                    <tr
                      key={customer.id}
                      style={{ borderBottom: "1px solid #e9ecef" }}
                    >
                      <td style={{ padding: "16px 12px" }}>
                        <div className="fw-semibold">
                          {customer.customer_code}
                        </div>
                        <small className="text-muted">ID: {customer.id}</small>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <div className="fw-semibold">{customer.name}</div>
                        <small className="text-muted">
                          {customer.landmark || ""}
                        </small>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <div>
                          <small>{customer.email}</small>
                        </div>
                        <div>
                          <small>{customer.mobile}</small>
                        </div>
                        {customer.alternate_mobile && (
                          <div>
                            <small>Alt: {customer.alternate_mobile}</small>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <div>
                          <small className="text-muted">
                            GST: {customer.gst_number || "N/A"}
                          </small>
                        </div>
                        <div>
                          <small className="text-muted">
                            PAN: {customer.pan_number || "N/A"}
                          </small>
                        </div>
                        <div>
                          <small className="text-muted">
                            Aadhaar: {customer.aadhaar_number || "N/A"}
                          </small>
                        </div>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <Badge
                          bg={customerTypeBadge.color}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontWeight: "500",
                          }}
                        >
                          {customerTypeBadge.text}
                        </Badge>
                        {customer.credit_days > 0 && (
                          <div>
                            <small className="text-muted">
                              {customer.credit_days} days
                            </small>
                          </div>
                        )}
                      </td>
                      <td
                        className="fw-semibold"
                        style={{ padding: "16px 12px" }}
                      >
                        ₹{customer.credit_limit?.toLocaleString() || 0}
                      </td>
                      <td
                        style={{
                          padding: "16px 12px",
                          color:
                            customer.outstanding_amount > 0
                              ? "#000000"
                              : "#000000",
                          fontWeight: "600",
                        }}
                      >
                        ₹{customer.outstanding_amount?.toLocaleString() || 0}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <Badge
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontWeight: "500",
                            backgroundColor:
                              customer.status === "active"
                                ? "hsl(227, 81%, 42%)"
                                : customer.status === "inactive"
                                  ? "#dc3545"
                                  : "#6c757d",
                            color: "#ffffff",
                          }}
                        >
                          {customer.status}
                        </Badge>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <Button
                          variant="link"
                          size="sm"
                          className="me-2"
                          onClick={() => handleViewDetails(customer.id)}
                          title="View Details"
                          style={{ color: "#4361ee", textDecoration: "none" }}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(customer.id)}
                          title="Edit"
                          style={{ color: "#ff9800", textDecoration: "none" }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleDelete(customer.id, customer.name)}
                          title="Delete"
                          style={{ color: "#dc3545", textDecoration: "none" }}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No customers found</h5>
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
    </Container>
  );
};

export default Customers;