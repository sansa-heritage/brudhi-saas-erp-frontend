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
  FaUserShield,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getStaff,
  deleteStaff,
  getStaffStatistics,
} from "../../components/services/staffService";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Status color mapping - MATCHING DEALERS PAGE
const statusConfig = {
  active: { bg: "#ECFDF3", color: "#027A48", label: "Active" },
  inactive: { bg: "#FFDCE2", color: "#F94765", label: "Inactive" },
};

// Role color mapping - MATCHING DEALERS PAGE DEALER TYPE COLORS
const roleConfig = {
  1: { bg: "#D3EAFF", color: "#437EF7", label: "Admin" },
  2: { bg: "#FFE0CB", color: "#FF8532", label: "Accounts" },
  3: { bg: "#FEF6D7", color: "#FED229", label: "Store Manager" },
  4: { bg: "#ECFDF3", color: "#027A48", label: "Staff" },
};

const StaffManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [status, setStatus] = useState("all");
  const [staff, setStaff] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    totalRoles: 0,
    monthlySalary: 0,
  });

  useEffect(() => {
    loadStaff();
    loadStats();
  }, []);

  const calculateStatsFromStaff = (staffData) => {
    const totalStaff = staffData.length;
    const activeStaff = staffData.filter(
      (member) => member.status === "active",
    ).length;
    const inactiveStaff = staffData.filter(
      (member) => member.status === "inactive",
    ).length;
    const monthlySalary = staffData.reduce((total, member) => {
      return total + (parseFloat(member.salary) || 0);
    }, 0);
    const uniqueRoles = new Set(staffData.map((member) => member.role_id));
    const totalRoles = uniqueRoles.size;

    return {
      totalStaff,
      activeStaff,
      inactiveStaff,
      monthlySalary,
      totalRoles,
    };
  };

  const loadStaff = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await getStaff();
      console.log("Loaded staff data:", data);

      const transformedStaff = Array.isArray(data)
        ? data.map((member) => ({
            id: member.id,
            staff_code: member.staff_code,
            employee_id: member.employee_id,
            first_name: member.first_name,
            last_name: member.last_name,
            name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
            email: member.email,
            phone: member.phone,
            department: member.department,
            designation: member.designation,
            joining_date: member.joining_date,
            role_id: member.role_id,
            role: member.role,
            status: member.status,
            salary: member.salary || 0,
            created_at: member.created_at,
          }))
        : [];

      setStaff(transformedStaff);

      const calculatedStats = calculateStatsFromStaff(transformedStaff);
      setStats((prev) => ({
        ...prev,
        totalStaff: calculatedStats.totalStaff,
        activeStaff: calculatedStats.activeStaff,
        inactiveStaff: calculatedStats.inactiveStaff,
        totalRoles: calculatedStats.totalRoles,
        monthlySalary: calculatedStats.monthlySalary,
      }));
    } catch (error) {
      console.error("Failed to load staff:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load staff. Please try again.",
      );
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getStaffStatistics();
      if (data && (data.totalStaff > 0 || data.activeStaff > 0)) {
        setStats({
          totalStaff: data?.totalStaff || stats.totalStaff,
          activeStaff: data?.activeStaff || stats.activeStaff,
          inactiveStaff: data?.inactiveStaff || stats.inactiveStaff,
          totalRoles: data?.totalRoles || stats.totalRoles,
          monthlySalary: data?.monthlySalary || stats.monthlySalary,
        });
      }
    } catch (error) {
      console.error("Failed to load stats from API:", error);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/staffs/view/${id}`);
  };

  const handleAddStaff = () => {
    navigate("/staffs/add");
  };

  const handleEdit = (id) => {
    navigate(`/staffs/edit/${id}`);
  };

  const handleDelete = async (id, staffName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete staff member "${staffName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6c757d",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteStaff(id);
        toast.success(`✓ Staff member "${staffName}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
        await loadStaff();
        await loadStats();
      } catch (error) {
        console.error("Failed to delete staff:", error);
        const errorMsg = error.response?.data?.message || error.message || "";

        if (
          errorMsg.includes("foreign key constraint") ||
          errorMsg.includes("cannot delete") ||
          errorMsg.includes("orders_ibfk")
        ) {
          toast.warning(
            `⚠️ Cannot delete "${staffName}" because they have associated records. Please remove associated records first or mark as inactive.`,
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
          toast.error(`✗ ${errorMsg || "Failed to delete staff member"}`, {
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
    setRoleFilter("all");
    setStatus("all");
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      searchTerm === "" ||
      (member.name &&
        member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.email &&
        member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.phone && member.phone.includes(searchTerm)) ||
      (member.staff_code &&
        member.staff_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.designation &&
        member.designation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = status === "all" || member.status === status;
    const matchesRole = roleFilter === "all" || member.role_id === parseInt(roleFilter);

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getFilterText = () => {
    const filters = [];
    if (roleFilter !== "all") {
      const roleName = roleConfig[roleFilter]?.label || roleFilter;
      filters.push(`Role: ${roleName}`);
    }
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
          <h4 className="mt-3">Loading staff members...</h4>
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
            Staff Members
          </h2>
          <p className="text-muted mb-0">Manage your team members</p> */}
        </div>
        <Button
          onClick={handleAddStaff}
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
          Add Staff
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
                    Total Staff
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.totalStaff}
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
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
                    Active Staff
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.activeStaff}
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
                    Total Roles
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.totalRoles}
                  </h5>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFE0CB",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaUserShield size={18} style={{ color: "#FF8532" }} />
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
                    Monthly Salary
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    ₹{stats.monthlySalary.toLocaleString()}
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
                  placeholder="Search by name, email, phone, staff code..."
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles ({stats.totalStaff})</option>
                <option value="1">Admin ({staff.filter(s => s.role_id === 1).length})</option>
                <option value="2">Accounts ({staff.filter(s => s.role_id === 2).length})</option>
                <option value="3">Store Manager ({staff.filter(s => s.role_id === 3).length})</option>
                <option value="4">Staff ({staff.filter(s => s.role_id === 4).length})</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Status ({stats.totalStaff})</option>
                <option value="active">Active ({stats.activeStaff})</option>
                <option value="inactive">Inactive ({stats.inactiveStaff})</option>
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
                    if (filter.includes("Role")) setRoleFilter("all");
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
          Showing {filteredStaff.length} of {staff.length} staff members
        </p>
      </div>

      {/* Staff Table */}
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
                  <th style={{ padding: "16px 12px" }}>Staff Member</th>
                  <th style={{ padding: "16px 12px" }}>Contact</th>
                  <th style={{ padding: "16px 12px" }}>Role</th>
                  <th style={{ padding: "16px 12px" }}>Designation</th>
                  {/* <th style={{ padding: "16px 12px" }}>Salary</th> */}
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => {
                  const sinceDate = formatDate(member.created_at || member.joining_date);
                  return (
                    <tr
                      key={member.id}
                      style={{ borderBottom: "1px solid #e9ecef" }}
                    >
                      {/* Staff Name with Since Date */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="fw-semibold">{member.name}</div>
                        <small className="text-muted">Since {sinceDate}</small>
                        {/* <div>
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            Code: {member.staff_code || `STF-${String(member.id).padStart(3, "0")}`}
                          </small>
                        </div> */}
                      </td>

                      {/* Contact with Email and Phone */}
                      <td style={{ padding: "16px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <FaEnvelope size={12} color="#64748b" />
                          <small style={{ color: "#1e293b" }}>{member.email}</small>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <FaPhone size={12} color="#64748b" />
                          <small>{member.phone || "N/A"}</small>
                        </div>
                      </td>

                      {/* Role - MATCHING DEALERS PAGE COLORS */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: roleConfig[member.role_id]?.bg || "#f3f4f6",
                            color: roleConfig[member.role_id]?.color || "#000000",
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {roleConfig[member.role_id]?.label || member.role || "Staff"}
                        </span>
                      </td>

                      {/* Designation */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            backgroundColor: "#F3F4F6",
                            color: "#1e293b",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "500",
                            display: "inline-block",
                          }}
                        >
                          {member.designation || "Staff"}
                        </span>
                      </td>

                      {/* Status - MATCHING DEALERS PAGE COLORS */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: statusConfig[member.status]?.bg || "#f3f4f6",
                            color: statusConfig[member.status]?.color || "#000000",
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {statusConfig[member.status]?.label || member.status}
                        </span>
                       </td>

                      {/* Actions Dropdown */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="action-dropdown">
                          <button
                            className="action-trigger"
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === member.id ? null : member.id,
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

                          {activeDropdown === member.id && (
                            <div className="dropdown-menu-custom">
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleViewDetails(member.id);
                                }}
                                className="dropdown-item-custom"
                                title="View Details"
                              >
                                <FaEye style={{ color: "#4361ee", fontSize: "14px" }} />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleEdit(member.id);
                                }}
                                className="dropdown-item-custom"
                                title="Edit"
                              >
                                <FaEdit style={{ color: "#ff9800", fontSize: "14px" }} />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleDelete(member.id, member.name);
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
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No staff members found</h5>
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

export default StaffManagement;