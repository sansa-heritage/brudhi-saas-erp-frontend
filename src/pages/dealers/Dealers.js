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
  FaUserTie,
  FaChartLine,
  FaPercent,
  FaIdCard,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getDealers,
  deleteDealer,
} from "../../components/services/dealerService";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const Dealers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dealerType, setDealerType] = useState("all");
  const [status, setStatus] = useState("all");
  const [dealers, setDealers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

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
        
        // Check for different types of errors
        if (errorMsg.includes("foreign key constraint") || 
            errorMsg.includes("cannot delete") ||
            errorMsg.includes("orders_ibfk")) {
          toast.warning(`⚠️ Cannot delete "${dealerName}" because they have existing orders. Please delete the orders first or mark dealer as inactive.`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Bounce,
          });
        } else if (errorMsg.includes("Unknown column") || errorMsg.includes("dealer_id")) {
          toast.error(`❌ Database error: The column 'dealer_id' does not exist in the database. Please contact support to fix this issue.`, {
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Bounce,
          });
        } else if (errorMsg.includes("404") || errorMsg.includes("not found")) {
          toast.error(`❌ Dealer "${dealerName}" not found or already deleted.`, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Bounce,
          });
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

  // Filter dealers
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
      (dealer.aadhaar_number &&
        dealer.aadhaar_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (dealer.dealer_code &&
        dealer.dealer_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dealer.address &&
        dealer.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      dealerType === "all" || dealer.dealer_type === dealerType;
    const matchesStatus = status === "all" || dealer.status === status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getDealerTypeBadge = (type) => {
    const types = {
      distributor: { text: "Distributor", color: "secondary" },
      retailer: { text: "Retailer", color: "secondary" },
      franchise: { text: "Franchise", color: "secondary" },
    };
    return types[type] || { text: "Regular", color: "secondary" };
  };

  // Stats
  const stats = {
    total: dealers.length,
    active: dealers.filter((d) => d.status === "active").length,
    distributor: dealers.filter((d) => d.dealer_type === "distributor").length,
    retailer: dealers.filter((d) => d.dealer_type === "retailer").length,
    franchise: dealers.filter((d) => d.dealer_type === "franchise").length,
    totalSales: dealers.reduce((sum, d) => sum + (d.total_sales || 0), 0),
    totalCommission: dealers.reduce(
      (sum, d) => sum + ((d.total_sales || 0) * (d.commission_rate || 0)) / 100,
      0,
    ),
  };

  const getFilterText = () => {
    const filters = [];
    if (dealerType !== "all") filters.push(`Type: ${dealerType}`);
    if (status !== "all") filters.push(`Status: ${status}`);
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters;
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Container fluid className="px-4 py-3">
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
      <div className="d-flex justify-content-end align-items-center mb-4">
        <Button
          variant="secondary"
          onClick={handleAddDealer}
          style={{
            backgroundColor: "#6c757d",
            border: "none",
            borderRadius: "8px",
          }}
        >
          <FaPlus className="me-2" /> Add Dealer
        </Button>
      </div>

      {/* Dealers Section Title */}
      <div className="mb-3">
        <h3 className="fw-bold mb-0">Dealers</h3>
        <p className="text-muted mb-0">
          Manage your dealer database, view sales and commissions
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
                    Total Dealers
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
                  <FaUserTie size={18} style={{ color: "#4361ee" }} />
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
                    Active Dealers
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
                  <FaStar size={18} style={{ color: "#2e7d32" }} />
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
                    Distributors
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.distributor}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Top tier
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
                    Total Sales
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
                  <FaChartLine size={18} style={{ color: "#2e7d32" }} />
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
                  placeholder="Search dealers..."
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
                <option value="all">All Dealer Types ({stats.total})</option>
                <option value="distributor">
                  Distributor ({stats.distributor})
                </option>
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
                  Inactive (
                  {dealers.filter((d) => d.status === "inactive").length})
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
        {filteredDealers.length === 0 && (
          <Button variant="link" onClick={clearFilters} className="p-0">
            Clear all filters
          </Button>
        )}
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
                  <th style={{ padding: "16px 12px" }}>Dealer Code</th>
                  <th style={{ padding: "16px 12px" }}>Dealer Name</th>
                  <th style={{ padding: "16px 12px" }}>Contact Info</th>
                  <th style={{ padding: "16px 12px" }}>GST / PAN / Aadhaar</th>
                  <th style={{ padding: "16px 12px" }}>Dealer Type</th>
                  <th style={{ padding: "16px 12px" }}>Commission</th>
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDealers.map((dealer) => {
                  const dealerTypeBadge = getDealerTypeBadge(
                    dealer.dealer_type,
                  );
                  return (
                    <tr
                      key={dealer.id}
                      style={{ borderBottom: "1px solid #e9ecef" }}
                    >
                      <td style={{ padding: "16px 12px" }}>
                        <div className="fw-semibold">{dealer.dealer_code}</div>
                        <small className="text-muted">ID: {dealer.id}</small>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <div className="fw-semibold">{dealer.name}</div>
                        <small className="text-muted">
                          {dealer.company_name || ""}
                        </small>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <div>
                          <small>{dealer.email}</small>
                        </div>
                        <div>
                          <small>{dealer.mobile}</small>
                        </div>
                        {dealer.alternate_mobile && (
                          <div>
                            <small>Alt: {dealer.alternate_mobile}</small>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <div>
                          <small className="text-muted">
                            GST: {dealer.gst_number || "N/A"}
                          </small>
                        </div>
                        <div>
                          <small className="text-muted">
                            PAN: {dealer.pan_number || "N/A"}
                          </small>
                        </div>
                        <div>
                          <small className="text-muted">
                            Aadhaar: {dealer.aadhaar_number || "N/A"}
                          </small>
                        </div>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <Badge
                          bg={dealerTypeBadge.color}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontWeight: "500",
                          }}
                        >
                          {dealerTypeBadge.text}
                        </Badge>
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
                          {dealer.commission_rate || 0}%
                        </Badge>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <Badge
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontWeight: "500",
                            backgroundColor:
                              dealer.status === "active"
                                ? "hsl(227, 81%, 42%)"
                                : dealer.status === "inactive"
                                  ? "#dc3545"
                                  : "#6c757d",
                            color: "#ffffff",
                          }}
                        >
                          {dealer.status}
                        </Badge>
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <Button
                          variant="link"
                          size="sm"
                          className="me-2"
                          onClick={() => handleViewDetails(dealer.id)}
                          title="View Details"
                          style={{ color: "#4361ee", textDecoration: "none" }}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(dealer.id)}
                          title="Edit"
                          style={{ color: "#ff9800", textDecoration: "none" }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleDelete(dealer.id, dealer.name)}
                          title="Delete"
                          style={{ color: "#dc3545", textDecoration: "none" }}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredDealers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No dealers found</h5>
                        <p className="text-muted small">
                          Try adjusting your search or filter criteria
                        </p>
                        <Button
                          variant="secondary"
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

export default Dealers;