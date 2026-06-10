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
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAllLeaveHistory, deleteLeave } from "../../api/tenant/leave.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const LeaveHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadLeaves();
  }, [pagination.page, leaveTypeFilter]);

  const loadLeaves = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const filters = {};
      if (leaveTypeFilter !== "all") {
        filters.leave_type = leaveTypeFilter;
      }

      const response = await getAllLeaveHistory(filters, {
        page: pagination.page,
        limit: pagination.limit,
      });

      console.log("Full Response:", response);

      // FIX: Extract data correctly based on response structure
      let leavesData = [];
      let paginationData = {};

      // Check different possible response structures
      if (response?.data?.data?.data) {
        // Structure: { data: { data: { data: [...] } } }
        leavesData = response.data.data.data;
        paginationData = response.data.data.pagination || {};
      } else if (response?.data?.data) {
        // Structure: { data: { data: [...] } }
        leavesData = response.data.data;
        paginationData = response.data.pagination || {};
      } else if (response?.data) {
        // Structure: { data: [...] }
        leavesData = response.data;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response)) {
        // Structure: [...]
        leavesData = response;
      }

      // Ensure leavesData is always an array
      if (!Array.isArray(leavesData)) {
        leavesData = [];
      }

      console.log("Extracted leaves:", leavesData);
      setLeaves(leavesData);
      
      if (paginationData && paginationData.total) {
        setPagination({
          page: paginationData.page || 1,
          limit: paginationData.limit || 10,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load leaves:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load leave records");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLeave = () => {
    navigate("/staff/mark-leave");
  };

  const handleDeleteLeave = async (id, staffName, leaveDate) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete leave record for ${staffName} on ${leaveDate}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteLeave(id);
        toast.success(`Leave record deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
        loadLeaves();
      } catch (error) {
        console.error("Failed to delete leave:", error);
        toast.error(error.response?.data?.message || "Failed to delete leave", {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
          transition: Bounce,
        });
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLeaveTypeFilter("all");
  };

  const getLeaveTypeBadge = (type) => {
    const config = {
      casual: { bg: "#D3EAFF", color: "#437EF7", label: "Casual" },
      sick: { bg: "#FFDCE2", color: "#F94765", label: "Sick" },
      annual: { bg: "#ECFDF3", color: "#027A48", label: "Annual" },
      unpaid: { bg: "#FEF6D7", color: "#FED229", label: "Unpaid" },
      emergency: { bg: "#FFF3E0", color: "#FF9800", label: "Emergency" },
    };
    const c = config[type] || config.casual;
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          backgroundColor: c.bg,
          color: c.color,
          display: "inline-block",
        }}
      >
        {c.label}
      </span>
    );
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

  // FIX: Ensure leaves is an array before using filter
  const filteredLeaves = Array.isArray(leaves) 
    ? leaves.filter((leave) => {
        const matchesSearch =
          searchTerm === "" ||
          (leave.staff_name &&
            leave.staff_name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
      })
    : [];

  if (loading) {
    return (
      <Container fluid className="p-4">
        <ToastContainer position="top-right" autoClose={3000} theme="colored" transition={Bounce} />
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading leave records...</h4>
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
      <ToastContainer position="top-right" autoClose={3000} theme="colored" transition={Bounce} />

      {errorMessage && (
        <Alert variant="danger" className="mb-3" onClose={() => setErrorMessage("")} dismissible>
          {errorMessage}
        </Alert>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            Leave History
          </h3>
          <p className="text-muted mb-0">Manage staff leave records</p>
        </div>
        <Button
          onClick={handleMarkLeave}
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
          Mark Leave
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card
        className="border-0 mb-4"
        style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <Card.Body className="py-3">
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: "#fff", borderRight: "none" }}>
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by staff name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderLeft: "none" }}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)}>
                <option value="all">All Leave Types</option>
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="emergency">Emergency Leave</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={clearFilters} className="w-100" title="Clear filters">
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
          Showing {filteredLeaves.length} of {Array.isArray(leaves) ? leaves.length : 0} leave records
        </p>
      </div>

      {/* Leave Table */}
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
                  <th style={{ padding: "16px 12px" }}>Leave Date</th>
                  <th style={{ padding: "16px 12px" }}>Leave Type</th>
                  <th style={{ padding: "16px 12px" }}>Reason</th>
                  <th style={{ padding: "16px 12px" }}>Marked By</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold">{leave.staff_name}</div>
                      {/* <small className="text-muted">{leave.staff_code}</small> */}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div className="d-flex align-items-center gap-1">
                        <FaCalendarAlt size={12} className="text-muted" />
                        <span>{formatDate(leave.leave_date)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      {getLeaveTypeBadge(leave.leave_type)}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      {leave.reason || "-"}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <small className="text-muted">{leave.marked_by_name || "Admin"}</small>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteLeave(leave.id, leave.staff_name, formatDate(leave.leave_date))}
                        style={{ borderRadius: "8px" }}
                      >
                        <FaTrash size={12} className="me-1" /> 
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredLeaves.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="py-4">
                        <FaCalendarAlt size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No leave records found</h5>
                        <p className="text-muted small">Try adjusting your search or mark new leave</p>
                        <Button variant="primary" size="sm" onClick={handleMarkLeave}>
                          Mark Leave
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
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <span className="align-self-center px-3">Page {pagination.page} of {pagination.totalPages}</span>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .rounded-3 {
          border-radius: 12px !important;
        }
      `}</style>
    </Container>
  );
};

export default LeaveHistory;