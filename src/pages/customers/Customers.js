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
  FaTrophy,
  FaFilter,
  FaTimes,
  FaUserCheck,
  FaRupeeSign,
  FaEnvelope,
  FaCheckCircle,
  FaPhone,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getCustomers,
  deleteCustomer,
} from "../../components/services/customerService";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Status color mapping
const statusConfig = {
  active: { bg: "#ECFDF3", color: "#027A48", label: "Active" },
  inactive: { bg: "#FFDCE2", color: "#F94765", label: "Inactive" },
  pending: { bg: "#FEF6D7", color: "#FED229", label: "Pending" },
  warning: { bg: "#FFE0CB", color: "#FF8532", label: "Warning" },
  info: { bg: "#D3EAFF", color: "#437EF7", label: "Info" },
  error: { bg: "#FFF2F0", color: "#E2341D", label: "Error" },
};

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [customerType, setCustomerType] = useState("all");
  const [status, setStatus] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

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

        const errorMsg = error.response?.data?.message || error.message || "";

        if (
          errorMsg.includes("foreign key constraint") ||
          errorMsg.includes("cannot delete") ||
          errorMsg.includes("orders_ibfk_1")
        ) {
          toast.warning(
            `⚠️ Cannot delete "${customerName}" because they have existing orders. Please delete the orders first or mark customer as inactive.`,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "colored",
              transition: Bounce,
            },
          );
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
          .includes(searchTerm.toLowerCase()));

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

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
            Customers
          </h2>
          <p className="text-muted mb-0">Manage your customer database</p> */}
        </div>
        <Button
          onClick={handleAddCustomer}
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
          Add Customer
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
                  <small
                    className="text-muted mb-0"
                    style={{ fontSize: "11px" }}
                  >
                    Total Customers
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.total}
                  </h5>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFDCE2",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaUsers size={18} style={{ color: "#F94765" }} />
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
                </div>
                <div
                  style={{
                    backgroundColor: "#FEF6D7",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaUserCheck size={18} style={{ color: "#FED229" }} />
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
                </div>
                <div
                  style={{
                    backgroundColor: "#FFE0CB",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaTrophy size={18} style={{ color: "#FF8532" }} />
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
                    Total Sales
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    ₹{stats.totalSales.toLocaleString()}
                  </h5>
                </div>
                <div
                  style={{
                    backgroundColor: "#D3EAFF",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaRupeeSign size={18} style={{ color: "#437EF7" }} />
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
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text
                  style={{ backgroundColor: "#fff", borderRight: "none" }}
                >
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, mobile, GST..."
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
                <option value="all">All Types ({stats.total})</option>
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
                  <th style={{ padding: "16px 12px" }}>Customer</th>
                  <th style={{ padding: "16px 12px" }}>Contact</th>
                  <th style={{ padding: "16px 12px" }}>GSTIN</th>
                  <th style={{ padding: "16px 12px" }}>Location</th>
                  {/* <th style={{ padding: "16px 12px" }}>Total Purchases</th> */}
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const sinceDate = formatDate(customer.created_at);
                  return (
                    <tr
                      key={customer.id}
                      style={{ borderBottom: "1px solid #e9ecef" }}
                    >
                      {/* Customer Name with Since Date */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="fw-semibold">{customer.name}</div>
                        <small className="text-muted">Since {sinceDate}</small>
                      </td>

                      {/* Contact with Email and Phone */}
                      <td style={{ padding: "16px 12px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "6px",
                          }}
                        >
                          <FaEnvelope size={12} color="#64748b" />
                          <small style={{ color: "#1e293b" }}>
                            {customer.email}
                          </small>
                          {customer.email_verified && (
                            <FaCheckCircle size={12} color="#027A48" />
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <FaPhone size={12} color="#64748b" />
                          <small>{customer.mobile}</small>
                        </div>
                      </td>

                      {/* GSTIN */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            backgroundColor: "hsl(214 32% 94%)",
                            color: "#333333",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            display: "inline-block",
                          }}
                        >
                          {customer.gst_number || "N/A"}
                        </span>
                      </td>

                      {/* Location */}
                      <td style={{ padding: "16px 12px" }}>
                        <div
                          className="fw-semibold"
                          style={{ fontSize: "14px", color: "#1e293b" }}
                        >
                          {customer.address || "No address"}
                        </div>
                      </td>

                      {/* Total Purchases */}
                      {/* <td style={{ padding: "16px 12px" }}>
                        <div
                          className="fw-semibold"
                          style={{ color: "#027A48" }}
                        >
                          ₹{(customer.total_purchases || 0).toLocaleString()}
                        </div>
                      </td> */}

                      {/* Status - Changed to span like Expenses list */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: statusConfig[customer.status]?.bg || "#f3f4f6",
                            color: statusConfig[customer.status]?.color || "#000000",
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {statusConfig[customer.status]?.label || customer.status}
                        </span>
                       </td>

                      {/* Actions Dropdown */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="action-dropdown">
                          <button
                            className="action-trigger"
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === customer.id
                                  ? null
                                  : customer.id,
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
                              (e.currentTarget.style.backgroundColor =
                                "#f1f5f9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="6"
                                r="2"
                                fill="currentColor"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="2"
                                fill="currentColor"
                              />
                              <circle
                                cx="12"
                                cy="18"
                                r="2"
                                fill="currentColor"
                              />
                            </svg>
                          </button>

                          {activeDropdown === customer.id && (
                            <div className="dropdown-menu-custom">
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleViewDetails(customer.id);
                                }}
                                className="dropdown-item-custom"
                                title="View Details"
                              >
                                <FaEye
                                  style={{ color: "#4361ee", fontSize: "14px" }}
                                />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleEdit(customer.id);
                                }}
                                className="dropdown-item-custom"
                                title="Edit"
                              >
                                <FaEdit
                                  style={{ color: "#ff9800", fontSize: "14px" }}
                                />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleDelete(customer.id, customer.name);
                                }}
                                className="dropdown-item-custom delete"
                                title="Delete"
                              >
                                <FaTrash
                                  style={{ color: "#dc3545", fontSize: "14px" }}
                                />
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
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
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