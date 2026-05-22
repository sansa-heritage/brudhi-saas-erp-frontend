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
  FaHome,
  FaUserCheck,
  FaRupeeSign,
  FaSignOutAlt,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaIdCard,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import {
  getStaff,
  deleteStaff,
  getStaffStatistics,
} from "../../components/services/staffService";

const StaffManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [status, setStatus] = useState("all");
  const [staff, setStaff] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
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
            role:
              member.role_id === 1
                ? "admin"
                : member.role_id === 2
                  ? "accounts"
                  : member.role_id === 3
                    ? "store"
                    : "staff",
            status: member.status,
            address: member.address,
            city: member.city,
            state: member.state,
            country: member.country,
            zip_code: member.zip_code,
            profile_image: member.profile_image,
            email_verified: member.email_verified,
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
        
        // Check for foreign key constraint error
        if (errorMsg.includes("foreign key constraint") || 
            errorMsg.includes("cannot delete") ||
            errorMsg.includes("orders_ibfk")) {
          toast.warning(`⚠️ Cannot delete "${staffName}" because they have associated records. Please remove associated records first or mark as inactive.`, {
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
    setDepartmentFilter("all");
    setStatus("all");
  };

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      searchTerm === "" ||
      (member.name &&
        member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.first_name &&
        member.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.last_name &&
        member.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.email &&
        member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.staff_code &&
        member.staff_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.employee_id &&
        member.employee_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.phone && member.phone.includes(searchTerm)) ||
      (member.designation &&
        member.designation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = status === "all" || member.status === status;
    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getRoleBadge = (role_id, role) => {
    const roles = {
      1: { text: "Admin", color: "danger" },
      2: { text: "Accounts", color: "info" },
      3: { text: "Store Manager", color: "success" },
      4: { text: "Staff", color: "secondary" },
    };
    const r = roles[role_id] || { text: role || "Staff", color: "secondary" };
    return (
      <Badge
        bg={r.color}
        style={{ padding: "6px 12px", borderRadius: "20px", fontWeight: "500" }}
      >
        {r.text}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    return (
      <Badge
        bg={status === "active" ? "success" : "danger"}
        style={{ padding: "6px 12px", borderRadius: "20px", fontWeight: "500" }}
      >
        {status === "active" ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getFilterText = () => {
    const filters = [];
    if (departmentFilter !== "all")
      filters.push(`Department: ${departmentFilter}`);
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

      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none d-flex align-items-center"
          onClick={handleGoBack}
          style={{ color: "#6c757d" }}
        >
          <FaSignOutAlt className="me-1" /> Back to Dashboard
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
          onClick={handleAddStaff}
          style={{
            backgroundColor: "#6c757d",
            border: "none",
            borderRadius: "8px",
          }}
        >
          <FaPlus className="me-2" /> Add Staff
        </Button>
      </div>

      {/* Staff Section Title */}
      <div className="mb-3">
        <h3 className="fw-bold mb-0">Staff Members</h3>
        <p className="text-muted mb-0">
          Manage your team members, roles and permissions
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
                    Total Staff
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.totalStaff}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Total: {stats.totalStaff}
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
                    Active Staff
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.activeStaff}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Active: {stats.activeStaff}
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#e8f5e9",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaUserCheck size={18} style={{ color: "#2e7d32" }} />
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
                    Total Roles
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.totalRoles}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Roles: {stats.totalRoles}
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#fff3e0",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaUserShield size={18} style={{ color: "#ff9800" }} />
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
                    Monthly Salary
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    ₹{stats.monthlySalary.toLocaleString()}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Total per month
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
                  placeholder="Search staff by name, email, staff code or phone..."
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
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="Sales">Sales</option>
                <option value="Accounts">Accounts</option>
                <option value="Inventory">Inventory</option>
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Status ({stats.totalStaff})</option>
                <option value="active">Active ({stats.activeStaff})</option>
                <option value="inactive">
                  Inactive ({stats.inactiveStaff})
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
                    if (filter.includes("Department"))
                      setDepartmentFilter("all");
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
        {filteredStaff.length === 0 && (
          <Button variant="link" onClick={clearFilters} className="p-0">
            Clear all filters
          </Button>
        )}
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
                  <th style={{ padding: "16px 12px" }}>Staff Code</th>
                  <th style={{ padding: "16px 12px" }}>Staff Name</th>
                  <th style={{ padding: "16px 12px" }}>Contact Info</th>
                  <th style={{ padding: "16px 12px" }}>Designation</th>
                  <th style={{ padding: "16px 12px" }}>Department</th>
                  <th style={{ padding: "16px 12px" }}>Role</th>
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    style={{ borderBottom: "1px solid #e9ecef" }}
                  >
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold">
                        {member.staff_code ||
                          member.employee_id ||
                          `STF-${String(member.id).padStart(3, "0")}`}
                      </div>
                      <small className="text-muted">ID: {member.id}</small>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold">{member.name}</div>
                      <small className="text-muted">
                        Joined: {member.joining_date || "N/A"}
                      </small>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div>
                        <small>{member.email}</small>
                      </div>
                      <div>
                        <small>{member.phone || "N/A"}</small>
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold">
                        {member.designation || "-"}
                      </div>
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
                        {member.department || "-"}
                      </Badge>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      {getRoleBadge(member.role_id, member.role)}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <Badge
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: "500",
                          backgroundColor:
                            member.status === "active"
                              ? "hsl(227, 81%, 42%)"
                              : member.status === "inactive"
                                ? "#dc3545"
                                : "#6c757d",
                          color: "#ffffff",
                        }}
                      >
                        {member.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <Button
                        variant="link"
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewDetails(member.id)}
                        title="View Details"
                        style={{ color: "#4361ee", textDecoration: "none" }}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(member.id)}
                        title="Edit"
                        style={{ color: "#ff9800", textDecoration: "none" }}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleDelete(member.id, member.name)}
                        title="Delete"
                        style={{ color: "#dc3545", textDecoration: "none" }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No staff members found</h5>
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

export default StaffManagement;