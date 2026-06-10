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
  FaUserTie,
  FaChartLine,
  FaPercent,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getDealers,
  deleteDealer,
} from "../../components/services/dealerService";
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

// Dealer type color mapping
const dealerTypeConfig = {
  distributor: { bg: "#D3EAFF", color: "#437EF7", label: "Distributor" },
  retailer: { bg: "#FFE0CB", color: "#FF8532", label: "Retailer" },
  franchise: { bg: "#FEF6D7", color: "#FED229", label: "Franchise" },
};

const Dealers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dealerType, setDealerType] = useState("all");
  const [status, setStatus] = useState("all");
  const [dealers, setDealers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await getDealers();
      console.log("Loaded dealers:", data);
      const dealersArray = Array.isArray(data) ? data : [];
      setDealers(dealersArray);
    } catch (error) {
      console.error("Failed to load dealers:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load dealers. Please try again.",
      );
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/dealers/${id}`);
  };

  const handleAddDealer = () => {
    navigate("/dealers/add");
  };

  const handleEdit = (id) => {
    navigate(`/dealers/edit/${id}`);
  };

  const handleDelete = async (id, dealerName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete dealer "${dealerName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6c757d",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteDealer(id);
        toast.success(`✓ Dealer "${dealerName}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
        await loadDealers();
      } catch (error) {
        console.error("Failed to delete dealer:", error);
        const errorMsg = error.response?.data?.message || error.message || "";

        if (
          errorMsg.includes("foreign key constraint") ||
          errorMsg.includes("cannot delete") ||
          errorMsg.includes("orders_ibfk")
        ) {
          toast.warning(
            `⚠️ Cannot delete "${dealerName}" because they have existing orders. Please delete the orders first or mark dealer as inactive.`,
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
          toast.error(`✗ ${errorMsg || "Failed to delete dealer"}`, {
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
    setDealerType("all");
    setStatus("all");
  };

  const filteredDealers = dealers.filter((dealer) => {
    const matchesSearch =
      searchTerm === "" ||
      (dealer.name &&
        dealer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dealer.email &&
        dealer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dealer.mobile && dealer.mobile.includes(searchTerm)) ||
      (dealer.gst_number &&
        dealer.gst_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dealer.dealer_code &&
        dealer.dealer_code
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesType =
      dealerType === "all" || dealer.dealer_type === dealerType;
    const matchesStatus = status === "all" || dealer.status === status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: dealers.length,
    active: dealers.filter((d) => d.status === "active").length,
    distributor: dealers.filter((d) => d.dealer_type === "distributor").length,
    retailer: dealers.filter((d) => d.dealer_type === "retailer").length,
    franchise: dealers.filter((d) => d.dealer_type === "franchise").length,
    totalSales: dealers.reduce((sum, d) => sum + (d.total_sales || 0), 0),
  };

  const getFilterText = () => {
    const filters = [];
    if (dealerType !== "all") filters.push(`Type: ${dealerType}`);
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
          <h4 className="mt-3">Loading dealers...</h4>
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
            Dealers
          </h2>
          <p className="text-muted mb-0">Manage your dealer database</p> */}
        </div>
        <Button
          onClick={handleAddDealer}
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
          Add Dealer
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
                    Total Dealers
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
                  <FaUserTie size={18} style={{ color: "#F94765" }} />
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
                    Active Dealers
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
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
                    Distributors
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.distributor}
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
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
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
                  <FaChartLine size={18} style={{ color: "#437EF7" }} />
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
                value={dealerType}
                onChange={(e) => setDealerType(e.target.value)}
              >
                <option value="all">All Types ({stats.total})</option>
                <option value="distributor">Distributor ({stats.distributor})</option>
                <option value="retailer">Retailer ({stats.retailer})</option>
                <option value="franchise">Franchise ({stats.franchise})</option>
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
                  Inactive ({dealers.filter((d) => d.status === "inactive").length})
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
                    if (filter.includes("Type")) setDealerType("all");
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
          Showing {filteredDealers.length} of {dealers.length} dealers
        </p>
      </div>

      {/* Dealers Table */}
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
                  <th style={{ padding: "16px 12px" }}>Dealer</th>
                  <th style={{ padding: "16px 12px" }}>Contact</th>
                  <th style={{ padding: "16px 12px" }}>GSTIN</th>
                  <th style={{ padding: "16px 12px" }}>Type</th>
                  <th style={{ padding: "16px 12px" }}>Commission</th>
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDealers.map((dealer) => {
                  const sinceDate = formatDate(dealer.created_at);
                  return (
                    <tr
                      key={dealer.id}
                      style={{ borderBottom: "1px solid #e9ecef" }}
                    >
                      {/* Dealer Name with Since Date */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="fw-semibold">{dealer.name}</div>
                        <small className="text-muted">Since {sinceDate}</small>
                       </td>

                      {/* Contact with Email and Phone */}
                      <td style={{ padding: "16px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <FaEnvelope size={12} color="#64748b" />
                          <small style={{ color: "#1e293b" }}>{dealer.email}</small>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <FaPhone size={12} color="#64748b" />
                          <small>{dealer.mobile}</small>
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
                          {dealer.gst_number || "N/A"}
                        </span>
                      </td>

                      {/* Dealer Type - Changed to span */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: dealerTypeConfig[dealer.dealer_type]?.bg || "#f3f4f6",
                            color: dealerTypeConfig[dealer.dealer_type]?.color || "#000000",
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {dealerTypeConfig[dealer.dealer_type]?.label || dealer.dealer_type || "Regular"}
                        </span>
                      </td>

                      {/* Commission Rate */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            backgroundColor: "#F3F4F6",
                            color: "#1e293b",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            display: "inline-block",
                          }}
                        >
                          {dealer.commission_rate || 0}%
                        </span>
                      </td>

                      {/* Status - Changed to span */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: statusConfig[dealer.status]?.bg || "#f3f4f6",
                            color: statusConfig[dealer.status]?.color || "#000000",
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {statusConfig[dealer.status]?.label || dealer.status}
                        </span>
                      </td>

                      {/* Actions Dropdown */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="action-dropdown">
                          <button
                            className="action-trigger"
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === dealer.id ? null : dealer.id,
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

                          {activeDropdown === dealer.id && (
                            <div className="dropdown-menu-custom">
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleViewDetails(dealer.id);
                                }}
                                className="dropdown-item-custom"
                                title="View Details"
                              >
                                <FaEye style={{ color: "#4361ee", fontSize: "14px" }} />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleEdit(dealer.id);
                                }}
                                className="dropdown-item-custom"
                                title="Edit"
                              >
                                <FaEdit style={{ color: "#ff9800", fontSize: "14px" }} />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleDelete(dealer.id, dealer.name);
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
                {filteredDealers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No dealers found</h5>
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
    </Container>
  );
};

export default Dealers;