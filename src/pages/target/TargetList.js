// src/pages/target/TargetList.js

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
  FaBullseye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRupeeSign,
  FaUser,
  FaChartLine,
  FaMoneyBillWave,
  FaSave,
  FaTrophy,
  FaEdit,
  FaCalendarAlt,
  FaInfoCircle,
  FaPercentage,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getStaffTargets,
  updateTargetAchievement,
  deleteTarget,
} from "../../api/tenant/target.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Target status configuration
const targetStatusConfig = {
  pending: {
    bg: "#FEF6D7",
    color: "#FED229",
    label: "Pending",
    icon: <FaClock />,
  },
  partial: {
    bg: "#FFE4B5",
    color: "#FF8C00",
    label: "Partial",
    icon: <FaChartLine />,
  },
  achieved: {
    bg: "#ECFDF3",
    color: "#027A48",
    label: "Achieved",
    icon: <FaTrophy />,
  },
  missed: {
    bg: "#FFDCE2",
    color: "#F94765",
    label: "Missed",
    icon: <FaTimesCircle />,
  },
};

const TargetList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievedAmount, setAchievedAmount] = useState("");
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadTargets();
  }, [pagination.page]);

  const loadTargets = async () => {
    setLoading(true);
    try {
      const response = await getStaffTargets(
        {},
        { page: pagination.page, limit: pagination.limit },
      );
      let targetsArray = [];
      let paginationData = {};

      if (response?.data?.data?.data) {
        targetsArray = response.data.data.data;
        paginationData = response.data.data.pagination || {};
      } else if (response?.data?.data) {
        targetsArray = response.data.data;
        paginationData = response.data.pagination || {};
      } else if (response?.data) {
        targetsArray = response.data;
      } else if (Array.isArray(response)) {
        targetsArray = response;
      }

      setTargets(targetsArray);
      setPagination({
        page: paginationData.page || pagination.page,
        limit: paginationData.limit || pagination.limit,
        total: paginationData.total || targetsArray.length,
        totalPages:
          paginationData.totalPages ||
          Math.ceil(targetsArray.length / pagination.limit),
      });
    } catch (error) {
      setErrorMessage("Failed to load targets");
      setTargets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (target) => {
    setSelectedTarget(target);
    setShowViewModal(true);
  };

  const handleUpdateAchievement = (target) => {
    setSelectedTarget(target);
    setAchievedAmount(target.achieved_amount || "");
    setShowAchievementModal(true);
  };

  const handleSubmitAchievement = async () => {
    if (!achievedAmount) {
      toast.error("Please enter achieved amount");
      return;
    }

    setUpdating(true);
    const loadingToast = toast.loading("Updating achievement...", {
      position: "top-right",
      theme: "colored",
    });

    try {
      await updateTargetAchievement(selectedTarget.id, {
        achieved_amount: parseFloat(achievedAmount),
        month: new Date().toISOString().slice(0, 7),
        created_by: currentUser?.id || 1,
      });
      toast.update(loadingToast, {
        render: "✅ Achievement updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setShowAchievementModal(false);
      loadTargets();
    } catch (error) {
      toast.update(loadingToast, {
        render:
          error.response?.data?.message || "❌ Failed to update achievement",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTarget = async (id, staffName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete target for "${staffName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteTarget(id);
        toast.success("Target deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        loadTargets();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete target",
          {
            position: "top-right",
            autoClose: 4000,
            theme: "colored",
          },
        );
      }
    }
  };

  const handleAddTarget = () => navigate("/staff/targets/add");

  const clearFilters = () => {
    setSearchTerm("");
    setPagination({ ...pagination, page: 1 });
  };

  const filteredTargets = targets.filter(
    (target) =>
      searchTerm === "" ||
      target.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      target.staff_code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatMonth = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
    });
  };

  const getProgressPercentage = (achieved, target) => {
    if (!target || target === 0) return 0;
    return Math.min((achieved / target) * 100, 100).toFixed(0);
  };

  const getTargetTypeLabel = (type) => {
    const types = {
      monthly: { label: "Monthly", color: "#437EF7", icon: "📅" },
      quarterly: { label: "Quarterly", color: "#10b981", icon: "📊" },
      yearly: { label: "Yearly", color: "#f59e0b", icon: "🎯" },
    };
    return types[type] || { label: type, color: "#6c757d", icon: "📋" };
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <ToastContainer />
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading...</h4>
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
      <div className="d-flex justify-content-end mb-4">
        <Button
          onClick={handleAddTarget}
          style={{
            backgroundColor: "rgb(30, 58, 111)",
            border: "none",
            borderRadius: "8px",
            padding: "8px 20px",
          }}
        >
          <FaPlus size={14} className="me-2" /> Add Target
        </Button>
      </div>

      {/* Search */}
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
                  <th style={{ padding: "12px" }}>Month</th>
                  <th style={{ padding: "12px" }}>Target</th>
                  <th style={{ padding: "12px" }}>Achieved</th>
                  <th style={{ padding: "12px" }}>Progress</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map((target) => (
                  <tr key={target.id}>
                    <td style={{ padding: "12px" }}>
                      <div className="fw-semibold">{target.staff_name}</div>
                      {/* <small className="text-muted">{target.staff_code}</small> */}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {formatMonth(target.target_month)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {formatCurrency(target.target_amount)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {target.achieved_amount
                        ? formatCurrency(target.achieved_amount)
                        : "-"}
                    </td>
                    <td style={{ padding: "12px", minWidth: "100px" }}>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: "60px",
                            height: "6px",
                            backgroundColor: "#e9ecef",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${getProgressPercentage(target.achieved_amount || 0, target.target_amount)}%`,
                              height: "100%",
                              backgroundColor:
                                target.status === "achieved"
                                  ? "#027A48"
                                  : target.status === "partial"
                                    ? "#FF8C00"
                                    : "#FED229",
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                        <small>
                          {getProgressPercentage(
                            target.achieved_amount || 0,
                            target.target_amount,
                          )}
                          %
                        </small>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            targetStatusConfig[target.status]?.bg,
                          color: targetStatusConfig[target.status]?.color,
                        }}
                      >
                        {targetStatusConfig[target.status]?.icon}{" "}
                        {targetStatusConfig[target.status]?.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div className="action-dropdown">
                        <button
                          className="action-trigger"
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === target.id ? null : target.id,
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
                        {activeDropdown === target.id && (
                          <div className="dropdown-menu-custom">
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleViewDetails(target);
                              }}
                              className="dropdown-item-custom"
                              title="View Details"
                            >
                              <FaEye style={{ color: "#4361ee" }} />
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleUpdateAchievement(target);
                              }}
                              className="dropdown-item-custom"
                              title="Update Achievement"
                            >
                              <FaChartLine style={{ color: "#4caf50" }} />
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleDeleteTarget(
                                  target.id,
                                  target.staff_name,
                                );
                              }}
                              className="dropdown-item-custom delete"
                              title="Delete Target"
                            >
                              <FaTrash style={{ color: "#dc3545" }} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTargets.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaBullseye size={40} className="text-muted mb-3" />
                      <h5 className="text-muted">No targets found</h5>
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

      {/* View Modal - Redesigned */}
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
            <FaEye className="me-2" /> Target Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-4"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedTarget && (
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
                          {selectedTarget.staff_name}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Staff Code
                        </small>
                        <div>{selectedTarget.staff_code || "N/A"}</div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Target Information Card */}
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaBullseye className="me-2" /> Target Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaCalendarAlt className="me-1" /> Target Month
                        </small>
                        <div className="fw-semibold">
                          {formatMonth(selectedTarget.target_month)}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaBullseye className="me-1" /> Target Type
                        </small>
                        <div>
                          <span
                            style={{
                              backgroundColor: "#ECFDF3",
                              color: "#027A48",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontWeight: "500",
                              fontSize: "12px",
                              display: "inline-block",
                            }}
                          >
                            {
                              getTargetTypeLabel(selectedTarget.target_type)
                                .icon
                            }{" "}
                            {
                              getTargetTypeLabel(selectedTarget.target_type)
                                .label
                            }
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaMoneyBillWave className="me-1" /> Target Amount
                        </small>
                        <div
                          className="fw-bold fs-4"
                          style={{ color: "#027A48" }}
                        >
                          {formatCurrency(selectedTarget.target_amount)}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaPercentage className="me-1" /> Incentive Rate
                        </small>
                        <div
                          className="fw-semibold fs-5"
                          style={{ color: "#437EF7" }}
                        >
                          {selectedTarget.incentive_rate}%
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Achievement Information Card */}
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaChartLine className="me-2" /> Achievement Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  {selectedTarget.achieved_amount ? (
                    <>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block mb-1">
                              Achieved Amount
                            </small>
                            <div
                              className="fw-semibold fs-5"
                              style={{ color: "#027A48" }}
                            >
                              {formatCurrency(selectedTarget.achieved_amount)}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block mb-1">
                              Incentive Amount
                            </small>
                            <div
                              className="fw-semibold fs-5"
                              style={{ color: "#f59e0b" }}
                            >
                              {formatCurrency(
                                selectedTarget.incentive_amount || 0,
                              )}
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={12}>
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">
                              Progress
                            </small>
                            <div className="d-flex align-items-center gap-3">
                              <div
                                style={{
                                  flex: 1,
                                  height: "10px",
                                  backgroundColor: "#e9ecef",
                                  borderRadius: "5px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.min(
                                      getProgressPercentage(
                                        selectedTarget.achieved_amount || 0,
                                        selectedTarget.target_amount,
                                      ),
                                      100,
                                    )}%`,
                                    height: "100%",
                                    backgroundColor:
                                      selectedTarget.status === "achieved"
                                        ? "#027A48"
                                        : selectedTarget.status === "partial"
                                          ? "#FF8C00"
                                          : "#F94765",
                                    borderRadius: "5px",
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              </div>
                              <span className="fw-bold">
                                {getProgressPercentage(
                                  selectedTarget.achieved_amount || 0,
                                  selectedTarget.target_amount,
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={12}>
                          <div className="mb-2">
                            <small className="text-muted d-block mb-1">
                              Status
                            </small>
                            <span
                              style={{
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontWeight: "600",
                                fontSize: "13px",
                                backgroundColor:
                                  targetStatusConfig[selectedTarget.status]?.bg,
                                color:
                                  targetStatusConfig[selectedTarget.status]
                                    ?.color,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {targetStatusConfig[selectedTarget.status]?.icon}{" "}
                              {targetStatusConfig[selectedTarget.status]?.label}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <FaInfoCircle size={40} className="text-muted mb-3" />
                      <h6 className="text-muted">
                        No achievement data available
                      </h6>
                      <p className="text-muted small mb-0">
                        Achievement has not been updated for this target yet.
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-white rounded-bottom-3 border-top">
          <Button
            variant="outline-secondary"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </Button>
          {selectedTarget && (
            <Button
              variant="primary"
              onClick={() => {
                setShowViewModal(false);
                handleUpdateAchievement(selectedTarget);
              }}
              style={{ backgroundColor: "rgb(30, 58, 111)" }}
            >
              <FaChartLine className="me-2" /> Update Achievement
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Achievement Modal */}
      {/* Achievement Modal */}
      <Modal
        show={showAchievementModal}
        onHide={() => setShowAchievementModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          className="rounded-top-3 border-0"
          style={{ backgroundColor: "rgb(30, 58, 111)" }}
        >
          <Modal.Title className="fw-bold text-white">
            <FaChartLine className="me-2" /> Update Achievement
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="p-4"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedTarget && (
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
                          {selectedTarget.staff_name}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          Staff Code
                        </small>
                        <div>{selectedTarget.staff_code || "N/A"}</div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Target Information Card */}
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaBullseye className="me-2" /> Target Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaCalendarAlt className="me-1" /> Target Month
                        </small>
                        <div className="fw-semibold">
                          {formatMonth(selectedTarget.target_month)}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaBullseye className="me-1" /> Target Type
                        </small>
                        <div>
                          <span
                            style={{
                              backgroundColor: "#ECFDF3",
                              color: "#027A48",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontWeight: "500",
                              fontSize: "12px",
                              display: "inline-block",
                            }}
                          >
                            {
                              getTargetTypeLabel(selectedTarget.target_type)
                                .icon
                            }{" "}
                            {
                              getTargetTypeLabel(selectedTarget.target_type)
                                .label
                            }
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaMoneyBillWave className="me-1" /> Target Amount
                        </small>
                        <div
                          className="fw-bold fs-4"
                          style={{ color: "#027A48" }}
                        >
                          {formatCurrency(selectedTarget.target_amount)}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <FaPercentage className="me-1" /> Incentive Rate
                        </small>
                        <div
                          className="fw-semibold fs-5"
                          style={{ color: "#437EF7" }}
                        >
                          {selectedTarget.incentive_rate}%
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Current Achievement Card (if exists) */}
              {selectedTarget.achieved_amount > 0 && (
                <Card className="border-0 shadow-sm rounded-3 mb-4">
                  <Card.Header className="bg-white border-bottom pt-3 pb-2">
                    <h6
                      className="fw-bold mb-0"
                      style={{ color: "rgb(30, 58, 111)" }}
                    >
                      <FaChartLine className="me-2" /> Current Achievement
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            Achieved Amount
                          </small>
                          <div
                            className="fw-semibold fs-5"
                            style={{ color: "#027A48" }}
                          >
                            {formatCurrency(selectedTarget.achieved_amount)}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            Incentive Amount
                          </small>
                          <div
                            className="fw-semibold fs-5"
                            style={{ color: "#f59e0b" }}
                          >
                            {formatCurrency(
                              selectedTarget.incentive_amount || 0,
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-2">
                            Progress
                          </small>
                          <div className="d-flex align-items-center gap-3">
                            <div
                              style={{
                                flex: 1,
                                height: "10px",
                                backgroundColor: "#e9ecef",
                                borderRadius: "5px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(
                                    getProgressPercentage(
                                      selectedTarget.achieved_amount || 0,
                                      selectedTarget.target_amount,
                                    ),
                                    100,
                                  )}%`,
                                  height: "100%",
                                  backgroundColor:
                                    selectedTarget.status === "achieved"
                                      ? "#027A48"
                                      : selectedTarget.status === "partial"
                                        ? "#FF8C00"
                                        : "#F94765",
                                  borderRadius: "5px",
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                            <span className="fw-bold">
                              {getProgressPercentage(
                                selectedTarget.achieved_amount || 0,
                                selectedTarget.target_amount,
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <div className="mb-2">
                          <small className="text-muted d-block mb-1">
                            Status
                          </small>
                          <span
                            style={{
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontWeight: "600",
                              fontSize: "13px",
                              backgroundColor:
                                targetStatusConfig[selectedTarget.status]?.bg,
                              color:
                                targetStatusConfig[selectedTarget.status]
                                  ?.color,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {targetStatusConfig[selectedTarget.status]?.icon}{" "}
                            {targetStatusConfig[selectedTarget.status]?.label}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Update Achievement Card */}
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-bottom pt-3 pb-2">
                  <h6
                    className="fw-bold mb-0"
                    style={{ color: "rgb(30, 58, 111)" }}
                  >
                    <FaMoneyBillWave className="me-2" /> Update Achievement
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      New Achieved Amount (₹) *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={achievedAmount}
                      onChange={(e) => setAchievedAmount(e.target.value)}
                      min="0"
                      step="100"
                      autoFocus
                      placeholder="Enter achieved amount"
                      className="rounded-3"
                      style={{ padding: "10px" }}
                    />
                    <Form.Text className="text-muted">
                      Enter the total amount achieved by the staff member for
                      this target period
                    </Form.Text>
                  </Form.Group>

                  <Alert variant="info" className="rounded-3 mt-3 mb-0">
                    <div className="d-flex">
                      <div className="me-2">
                        <FaInfoCircle size={18} />
                      </div>
                      <div>
                        <strong className="d-block mb-1">How it works:</strong>
                        <small>
                          Achievement percentage = (Achieved Amount / Target
                          Amount) × 100%
                          <br />
                          • ≥100% = Achieved | • ≥50% = Partial | • &lt;50% =
                          Missed
                          <br />
                          Incentive bonus is automatically generated when
                          applicable.
                        </small>
                      </div>
                    </div>
                  </Alert>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-white rounded-bottom-3 border-top">
          <div className="d-flex justify-content-between w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setShowAchievementModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAchievement}
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
                  <FaSave className="me-2" /> Save Achievement
                </>
              )}
            </Button>
          </div>
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

export default TargetList;
