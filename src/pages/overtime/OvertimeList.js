// src/pages/overtime/OvertimeList.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Alert,
  Spinner,
  Modal,
  Badge,
} from "react-bootstrap";
import {
  FaPlus,
  FaTrash,
  FaEye,
  FaSearch,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaRupeeSign,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaSave,
  FaEdit,
  FaInfoCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getOvertimeRequests,
  updateOvertimeStatus,
  deleteOvertimeRequest,
} from "../../api/tenant/overtime.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Overtime status configuration
const overtimeStatusConfig = {
  pending: {
    bg: "#FEF6D7",
    color: "#FED229",
    label: "Pending",
    icon: <FaHourglassHalf />,
  },
  approved: {
    bg: "#ECFDF3",
    color: "#027A48",
    label: "Approved",
    icon: <FaCheckCircle />,
  },
  rejected: {
    bg: "#FFDCE2",
    color: "#F94765",
    label: "Rejected",
    icon: <FaTimesCircle />,
  },
  paid: {
    bg: "#D3EAFF",
    color: "#437EF7",
    label: "Paid",
    icon: <FaMoneyBillWave />,
  },
};

const OvertimeList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState({
    status: "",
    remarks: "",
  });
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadOvertimeRequests();
  }, [statusFilter, pagination.page]);

  const loadOvertimeRequests = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;

      const response = await getOvertimeRequests(filters, {
        page: pagination.page,
        limit: pagination.limit,
      });

      let requestsArray = [];
      let paginationData = {};

      if (response?.data?.data?.data) {
        requestsArray = response.data.data.data;
        paginationData = response.data.data.pagination || {};
      } else if (response?.data?.data) {
        requestsArray = response.data.data;
        paginationData = response.data.pagination || {};
      } else if (response?.data) {
        requestsArray = response.data;
      } else if (Array.isArray(response)) {
        requestsArray = response;
      }

      setOvertimeRequests(requestsArray);
      setPagination({
        page: paginationData.page || pagination.page,
        limit: paginationData.limit || pagination.limit,
        total: paginationData.total || requestsArray.length,
        totalPages:
          paginationData.totalPages ||
          Math.ceil(requestsArray.length / pagination.limit),
      });
    } catch (error) {
      setErrorMessage("Failed to load overtime requests");
      setOvertimeRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleUpdateStatus = (request) => {
    setSelectedRequest(request);
    setStatusData({
      status: request.status || "pending",
      remarks: request.remarks || "",
    });
    setShowStatusModal(true);
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitStatus = async () => {
    if (!statusData.status) {
      toast.error("Please select a status");
      return;
    }

    setUpdating(true);
    const loadingToast = toast.loading("Updating overtime status...", {
      position: "top-right",
      theme: "colored",
    });

    try {
      await updateOvertimeStatus(selectedRequest.id, {
        status: statusData.status,
        remarks: statusData.remarks,
        approved_by: currentUser?.id || 1,
      });

      toast.update(loadingToast, {
        render: `✅ Overtime ${statusData.status} successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setShowStatusModal(false);
      loadOvertimeRequests();
    } catch (error) {
      toast.update(loadingToast, {
        render: error.response?.data?.message || "❌ Failed to update status",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRequest = async (id, staffName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete overtime request for "${staffName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteOvertimeRequest(id);
        toast.success("Overtime request deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        loadOvertimeRequests();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete request",
          {
            position: "top-right",
            autoClose: 4000,
            theme: "colored",
          },
        );
      }
    }
  };

  const handleAddRequest = () => {
    navigate("/staff/overtime/add");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPagination({ ...pagination, page: 1 });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <ToastContainer />
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading overtime requests...</h4>
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
          onClick={handleAddRequest}
          style={{
            backgroundColor: "rgb(30, 58, 111)",
            border: "none",
            borderRadius: "8px",
            padding: "8px 20px",
          }}
        >
          <FaPlus size={14} className="me-2" /> Add Overtime Request
        </Button>
      </div>

      {/* Search and Filter */}
      <Card
        className="border-0 mb-4"
        style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <Card.Body className="py-3">
          <Row className="align-items-center">
            <Col md={8}>
              <InputGroup style={{ borderRadius: "8px", overflow: "hidden" }}>
                <InputGroup.Text
                  style={{
                    backgroundColor: "#fff",
                    borderRight: "none",
                    color: "#6c757d",
                  }}
                >
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by staff name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderLeft: "none", borderRight: "none" }}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                    style={{ borderLeft: "none", backgroundColor: "#fff" }}
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
                style={{
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: "500",
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ fontSize: "14px" }}>
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: "12px" }}>Staff</th>
                  <th style={{ padding: "12px" }}>Date</th>
                  <th style={{ padding: "12px" }}>Hours</th>
                  <th style={{ padding: "12px" }}>Rate/Hour</th>
                  <th style={{ padding: "12px" }}>Amount</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overtimeRequests.map((request) => (
                  <tr key={request.id}>
                    <td style={{ padding: "12px" }}>
                      <div className="fw-semibold">{request.staff_name}</div>
                      <small className="text-muted">{request.staff_code}</small>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {formatDate(request.date)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <strong>{request.hours} hrs</strong>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {formatCurrency(request.rate_per_hour)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <strong style={{ color: "#027A48" }}>
                        {formatCurrency(request.amount)}
                      </strong>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            overtimeStatusConfig[request.status]?.bg,
                          color: overtimeStatusConfig[request.status]?.color,
                        }}
                      >
                        {overtimeStatusConfig[request.status]?.icon}{" "}
                        {overtimeStatusConfig[request.status]?.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div className="action-dropdown">
                        <button
                          className="action-trigger"
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === request.id ? null : request.id,
                            )
                          }
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle cx="12" cy="6" r="2" fill="currentColor" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                            <circle cx="12" cy="18" r="2" fill="currentColor" />
                          </svg>
                        </button>
                        {activeDropdown === request.id && (
                          <div className="dropdown-menu-custom">
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleViewDetails(request);
                              }}
                              className="dropdown-item-custom"
                              title="View Details"
                            >
                              <FaEye style={{ color: "#4361ee" }} />
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleUpdateStatus(request);
                              }}
                              className="dropdown-item-custom"
                              title="Update Status"
                            >
                              <FaEdit style={{ color: "#ff9800" }} />
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleDeleteRequest(
                                  request.id,
                                  request.staff_name,
                                );
                              }}
                              className="dropdown-item-custom delete"
                              title="Delete Request"
                            >
                              <FaTrash style={{ color: "#dc3545" }} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {overtimeRequests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaClock size={40} className="text-muted mb-3" />
                      <h5 className="text-muted">No overtime requests found</h5>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={clearFilters}
                        className="mt-2"
                      >
                        Clear Filters
                      </Button>
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
          <div className="text-muted small">
            Page {pagination.page} of {pagination.totalPages}
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

      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          className="rounded-top-3 border-0"
          style={{ backgroundColor: "rgb(30, 58, 111)" }}
        >
          <Modal.Title className="fw-bold text-white">
            <FaEye className="me-2" /> Overtime Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-4"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedRequest && (
            <>
              {/* Staff Information Card */}
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaUser className="me-2" /> Staff Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Staff Name
                        </small>
                        <div className="fw-semibold fs-5">
                          {selectedRequest.staff_name}
                        </div>
                      </div>
                    </Col>
                    {/* <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Staff Code
                        </small>
                        <div>{selectedRequest.staff_code || "N/A"}</div>
                      </div>
                    </Col> */}
                  </Row>
                </Card.Body>
              </Card>

              {/* Overtime Information Card */}
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaClock className="me-2" /> Overtime Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaCalendarAlt className="me-1" /> Date
                        </small>
                        <div className="fw-semibold">
                          {formatDate(selectedRequest.date)}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Hours</small>
                        <div className="fw-semibold fs-5">
                          {selectedRequest.hours} hours
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Rate per Hour
                        </small>
                        <div className="fw-semibold">
                          {formatCurrency(selectedRequest.rate_per_hour)}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Total Amount
                        </small>
                        <div
                          className="fw-bold fs-4"
                          style={{ color: "#027A48" }}
                        >
                          {formatCurrency(selectedRequest.amount)}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  {selectedRequest.reason && (
                    <Row>
                      <Col md={12}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            Reason
                          </small>
                          <div
                            className="p-2 rounded"
                            style={{ backgroundColor: "#f8f9fa" }}
                          >
                            {selectedRequest.reason}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>

              {/* Status Information Card */}
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaInfoCircle className="me-2" /> Status Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Current Status
                        </small>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor:
                              overtimeStatusConfig[selectedRequest.status]?.bg,
                            color:
                              overtimeStatusConfig[selectedRequest.status]
                                ?.color,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {overtimeStatusConfig[selectedRequest.status]?.icon}{" "}
                          {overtimeStatusConfig[selectedRequest.status]?.label}
                        </span>
                      </div>
                    </Col>
                  </Row>
                  {selectedRequest.remarks && (
                    <Row>
                      <Col md={12}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            Remarks
                          </small>
                          <div>{selectedRequest.remarks}</div>
                        </div>
                      </Col>
                    </Row>
                  )}
                  {selectedRequest.approved_by_name && (
                    <Row>
                      <Col md={12}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            Approved By
                          </small>
                          <div>{selectedRequest.approved_by_name}</div>
                        </div>
                      </Col>
                    </Row>
                  )}
                  {selectedRequest.approved_at && (
                    <Row>
                      <Col md={12}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            Approved At
                          </small>
                          <div>{formatDate(selectedRequest.approved_at)}</div>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-white rounded-bottom-3 border-top d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </Button>
          {selectedRequest && selectedRequest.status === "pending" && (
            <Button
              onClick={() => {
                setShowViewModal(false);
                handleUpdateStatus(selectedRequest);
              }}
              style={{
                backgroundColor: "rgb(30, 58, 111)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
              }}
            >
              <FaEdit className="me-2" /> Update Status
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Update Status Modal */}
      {/* Status Modal - Fixed Card Design */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          className="rounded-top-3 border-0"
          style={{ backgroundColor: "rgb(30, 58, 111)" }}
        >
          <Modal.Title className="fw-bold text-white">
            <FaEdit className="me-2" /> Update Overtime Status
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="p-4"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedRequest && (
            <>
              {/* Staff Information Card */}
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaUser className="me-2" /> Staff Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Staff Name
                        </small>
                        <div className="fw-semibold fs-5">
                          {selectedRequest.staff_name}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Staff Code
                        </small>
                        <div>{selectedRequest.staff_code || "N/A"}</div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Overtime Information Card */}
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaClock className="me-2" /> Overtime Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaCalendarAlt className="me-1" /> Date
                        </small>
                        <div className="fw-semibold">
                          {formatDate(selectedRequest.date)}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Hours</small>
                        <div className="fw-semibold fs-5">
                          {selectedRequest.hours} hours
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Rate per Hour
                        </small>
                        <div className="fw-semibold">
                          {formatCurrency(selectedRequest.rate_per_hour)}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Total Amount
                        </small>
                        <div
                          className="fw-bold fs-4"
                          style={{ color: "#027A48" }}
                        >
                          {formatCurrency(selectedRequest.amount)}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  {selectedRequest.reason && (
                    <Row>
                      <Col md={12}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            Reason
                          </small>
                          <div
                            className="p-2 rounded"
                            style={{ backgroundColor: "#f8f9fa" }}
                          >
                            {selectedRequest.reason}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>

              {/* Status Update Card */}
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaEdit className="me-2" /> Update Status
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Status *</Form.Label>
                    <Form.Select
                      name="status"
                      value={statusData.status}
                      onChange={handleStatusChange}
                      className="rounded-3"
                      style={{ padding: "10px" }}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="approved">✅ Approved</option>
                      <option value="rejected">❌ Rejected</option>
                      <option value="paid">💰 Paid</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Remarks</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="remarks"
                      value={statusData.remarks}
                      onChange={handleStatusChange}
                      placeholder="Enter remarks (optional)"
                      className="rounded-3"
                      style={{ padding: "10px" }}
                    />
                  </Form.Group>

                  <Alert variant="info" className="rounded-3 mb-0">
                    <div className="d-flex">
                      <div className="me-2">
                        <FaInfoCircle size={18} />
                      </div>
                      <div>
                        <strong className="d-block mb-1">Note:</strong>
                        <small>
                          Changing status will update the overtime request
                          record.
                          {statusData.status === "approved" &&
                            " Approved overtime can be processed for payment."}
                          {statusData.status === "paid" &&
                            " Paid status indicates payment has been made."}
                          {statusData.status === "rejected" &&
                            " Rejected overtime will not be included in payroll."}
                        </small>
                      </div>
                    </div>
                  </Alert>

                  {/* Current Status Display */}
                  <div className="mt-3 pt-2">
                    <small className="text-muted d-block mb-2">
                      Current Status
                    </small>
                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontWeight: "600",
                        fontSize: "13px",
                        backgroundColor:
                          overtimeStatusConfig[selectedRequest.status]?.bg,
                        color:
                          overtimeStatusConfig[selectedRequest.status]?.color,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {overtimeStatusConfig[selectedRequest.status]?.icon}{" "}
                      {overtimeStatusConfig[selectedRequest.status]?.label}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-white rounded-bottom-3 border-top d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => setShowStatusModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitStatus}
            disabled={updating}
            style={{
              backgroundColor: "rgb(30, 58, 111)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
            }}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Update Status
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <style>{`
        .action-dropdown { position: relative; }
        .action-trigger { color: #64748b; width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; border-radius: 6px; }
        .action-trigger:hover { background-color: #f1f5f9; }
        .dropdown-menu-custom { position: absolute; top: 100%; right: 0; margin-top: 4px; min-width: 80px; background: white; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 1000; display: flex; flex-direction: column; gap: 2px; padding: 4px; }
        .dropdown-item-custom { display: flex; justify-content: center; width: 100%; padding: 6px 8px; border: none; background: white; cursor: pointer; border-radius: 4px; }
        .dropdown-item-custom:hover { background-color: #f8fafc; }
        .dropdown-item-custom.delete:hover { background-color: #fef2f2; }
        .rounded-3 { border-radius: 12px !important; }
        .rounded-top-3 { border-top-left-radius: 12px !important; border-top-right-radius: 12px !important; }
        .rounded-bottom-3 { border-bottom-left-radius: 12px !important; border-bottom-right-radius: 12px !important; }
      `}</style>
    </Container>
  );
};

export default OvertimeList;
