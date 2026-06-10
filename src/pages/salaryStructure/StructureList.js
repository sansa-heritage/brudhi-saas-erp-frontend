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
  FaMoneyBillWave,
  FaDownload,
  FaPrint,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getAllSalaryStructures,
  deleteSalaryStructure,
} from "../../api/tenant/salartStructure.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const SalaryStructureList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadSalaryStructures();
  }, [pagination.page]);

  const loadSalaryStructures = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getAllSalaryStructures(
        {},
        { page: pagination.page, limit: pagination.limit },
      );
      console.log("Full Response:", response);

      // FIX: Extract data correctly based on response structure
      let structuresData = [];
      let paginationData = {};

      // Check different possible response structures
      if (response?.data?.data?.data) {
        // Structure: { data: { data: { data: [...] } } }
        structuresData = response.data.data.data;
        paginationData = response.data.data.pagination || {};
      } else if (response?.data?.data) {
        // Structure: { data: { data: [...] } }
        structuresData = response.data.data;
        paginationData = response.data.pagination || {};
      } else if (response?.data) {
        // Structure: { data: [...] }
        structuresData = response.data;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response)) {
        // Structure: [...]
        structuresData = response;
      }

      // Ensure structuresData is always an array
      if (!Array.isArray(structuresData)) {
        structuresData = [];
      }

      console.log("Extracted structures:", structuresData);
      setSalaryStructures(structuresData);

      if (paginationData && paginationData.total) {
        setPagination({
          page: paginationData.page || 1,
          limit: paginationData.limit || 10,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load salary structures:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load salary structures. Please try again.",
      );
      setSalaryStructures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/staff/salary-structure/${id}`);
  };

  const handleAddStructure = () => {
    navigate("/salary-structure/add");
  };

  const handleEditStructure = (id) => {
    navigate(`/salary-structure/edit/${id}`);
  };

  const handleDeleteStructure = async (id, staffName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete salary structure for "${staffName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteSalaryStructure(id);
        toast.success(`Salary structure deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
        loadSalaryStructures();
      } catch (error) {
        console.error("Failed to delete salary structure:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete salary structure",
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

  const clearFilters = () => {
    setSearchTerm("");
  };

  // FIX: Ensure salaryStructures is an array before using filter
  const filteredStructures = Array.isArray(salaryStructures)
    ? salaryStructures.filter((structure) => {
        const matchesSearch =
          searchTerm === "" ||
          (structure.staff_name &&
            structure.staff_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (structure.staff_code &&
            structure.staff_code
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));
        return matchesSearch;
      })
    : [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateTotalAllowances = (structure) => {
    const allowances =
      (structure.house_rent_allowance || 0) +
      (structure.travel_allowance || 0) +
      (structure.medical_allowance || 0) +
      (structure.special_allowance || 0) +
      (structure.other_allowances || 0);
    return allowances;
  };

  const calculateTotalEarnings = (structure) => {
    return (structure.basic_salary || 0) + calculateTotalAllowances(structure);
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
          <h4 className="mt-3">Loading salary structures...</h4>
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
          {/* <h3 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            Salary Structures
          </h3>
          <p className="text-muted mb-0">
            Manage employee salary components and allowances
          </p> */}
        </div>
        <Button
          onClick={handleAddStructure}
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
          Add Salary Structure
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
                    Total Structures
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {Array.isArray(salaryStructures)
                      ? salaryStructures.length
                      : 0}
                  </h5>
                </div>
                <div
                  style={{
                    backgroundColor: "#D3EAFF",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaMoneyBillWave size={18} style={{ color: "#437EF7" }} />
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
                    Avg Basic Salary
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "16px" }}>
                    {formatCurrency(
                      Array.isArray(salaryStructures) &&
                        salaryStructures.length > 0
                        ? salaryStructures.reduce(
                            (sum, s) => sum + (s.basic_salary || 0),
                            0,
                          ) / salaryStructures.length
                        : 0,
                    )}
                  </h5>
                </div>
                <div
                  style={{
                    backgroundColor: "#ECFDF3",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaRupeeSign size={18} style={{ color: "#027A48" }} />
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
                    Active Structures
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {Array.isArray(salaryStructures)
                      ? salaryStructures.length
                      : 0}
                  </h5>
                </div>
                <div
                  style={{
                    backgroundColor: "#ECFDF3",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaCheckCircle size={18} style={{ color: "#027A48" }} />
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
                    Total Allowances
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "16px" }}>
                    {formatCurrency(
                      Array.isArray(salaryStructures)
                        ? salaryStructures.reduce(
                            (sum, s) => sum + calculateTotalAllowances(s),
                            0,
                          )
                        : 0,
                    )}
                  </h5>
                </div>
                <div
                  style={{
                    backgroundColor: "#FEF6D7",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaClock size={18} style={{ color: "#FED229" }} />
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
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text
                  style={{ backgroundColor: "#fff", borderRight: "none" }}
                >
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by staff name or code..."
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
            <Col md={4}>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                className="w-100"
                title="Clear filters"
              >
                <FaFilter className="me-2" />
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          Showing {filteredStructures.length} of{" "}
          {Array.isArray(salaryStructures) ? salaryStructures.length : 0} salary
          structures
        </p>
      </div>

      {/* Salary Structures Table */}
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
                  <th style={{ padding: "16px 12px" }}>Employee</th>
                  <th style={{ padding: "16px 12px" }}>Basic Salary</th>
                  {/* <th style={{ padding: "16px 12px" }}>Total Allowances</th>
                  <th style={{ padding: "16px 12px" }}>Total Earnings</th> */}
                  <th style={{ padding: "16px 12px" }}>PF %</th>
                  <th style={{ padding: "16px 12px" }}>Professional Tax</th>
                  <th style={{ padding: "16px 12px" }}>Effective From</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStructures.map((structure) => (
                  <tr
                    key={structure.id}
                    style={{ borderBottom: "1px solid #e9ecef" }}
                  >
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold">{structure.staff_name}</div>
                      {/* <small className="text-muted">{structure.staff_code}</small> */}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <strong>{formatCurrency(structure.basic_salary)}</strong>
                    </td>
                    {/* <td style={{ padding: "16px 12px" }}>
                      {formatCurrency(calculateTotalAllowances(structure))}
                    </td> */}
                    {/* <td style={{ padding: "16px 12px" }}>
                      <strong style={{ color: "#027A48" }}>
                        {formatCurrency(calculateTotalEarnings(structure))}
                      </strong>
                    </td> */}
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          backgroundColor: "#ECFDF3",
                          color: "#027A48",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: "600",
                          display: "inline-block",
                        }}
                      >
                        {structure.pf_percent || 12}%
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      {formatCurrency(structure.professional_tax || 200)}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div className="d-flex align-items-center gap-1">
                        <FaCalendarAlt size={12} className="text-muted" />
                        <span>{formatDate(structure.effective_from)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div className="action-dropdown">
                        <button
                          className="action-trigger"
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === structure.id
                                ? null
                                : structure.id,
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
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle cx="12" cy="6" r="2" fill="currentColor" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                            <circle cx="12" cy="18" r="2" fill="currentColor" />
                          </svg>
                        </button>

                        {activeDropdown === structure.id && (
                          <div className="dropdown-menu-custom">
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleViewDetails(structure.id);
                              }}
                              className="dropdown-item-custom"
                            >
                              <FaEye
                                style={{ color: "#4361ee", fontSize: "14px" }}
                              />
                              {/* <span>View Details</span> */}
                            </button>
                            {/* <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleEditStructure(structure.id);
                              }}
                              className="dropdown-item-custom"
                            >
                              <FaEdit
                                style={{ color: "#ff9800", fontSize: "14px" }}
                              />
                              <span>Edit Structure</span>
                            </button> */}
                            {/* <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleDeleteStructure(
                                  structure.id,
                                  structure.staff_name,
                                );
                              }}
                              className="dropdown-item-custom delete"
                            >
                              <FaTrash
                                style={{ color: "#dc3545", fontSize: "14px" }}
                              />
                              <span>Delete Structure</span>
                            </button> */}
                          </div>
                        )}
                      </div>

                      <style jsx>{`
                        .action-dropdown {
                          position: relative;
                        }
                        .action-trigger {
                          color: #64748b;
                          transition: all 0.2s;
                        }
                        .action-trigger:hover {
                          color: #1e293b;
                        }
                        .dropdown-menu-custom {
                          position: absolute;
                          top: 100%;
                          right: 0;
                          margin-top: 4px;
                          min-width: 160px;
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
                          from {
                            opacity: 0;
                            transform: translateY(-5px);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0);
                          }
                        }
                        .dropdown-item-custom {
                          display: flex;
                          align-items: center;
                          gap: 10px;
                          width: 100%;
                          padding: 10px 14px;
                          border: none;
                          background: white;
                          cursor: pointer;
                          transition: background-color 0.2s;
                          border-radius: 6px;
                          font-size: 13px;
                          font-weight: 500;
                          color: #1e293b;
                        }
                        .dropdown-item-custom:hover {
                          background-color: #f8fafc;
                        }
                        .dropdown-item-custom.delete:hover {
                          background-color: #fef2f2;
                          color: #dc3545;
                        }
                        .dropdown-item-custom:disabled {
                          opacity: 0.5;
                          cursor: not-allowed;
                        }
                      `}</style>
                    </td>
                  </tr>
                ))}
                {filteredStructures.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">
                          No salary structures found
                        </h5>
                        <p className="text-muted small">
                          Try adjusting your search or create a new salary
                          structure
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div>
            <small className="text-muted">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} entries
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
            >
              Previous
            </Button>
            <span className="align-self-center px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default SalaryStructureList;
