// src/pages/bonus/BonusList.js

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
  Modal,
  Tab,
  Nav,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaTimes,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRupeeSign,
  FaUser,
  FaCalendarAlt,
  FaGift,
  FaInfoCircle,
  FaSave,
  FaBullseye,
  FaChartLine,
  FaTrophy,
  FaPercentage,
  FaHourglassHalf,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getBonuses,
  updateBonusStatus,
  deleteBonus,
  updateBonus,
} from "../../api/tenant/bonus.api";
import {
  getStaffTargets,
  updateTargetAchievement,
  deleteTarget,
} from "../../api/tenant/target.api";
import {
  getOvertimeRequests,
  updateOvertimeStatus,
  deleteOvertimeRequest,
} from "../../api/tenant/overtime.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Payment status color mapping
const paymentStatusConfig = {
  pending: {
    bg: "#FEF6D7",
    color: "#FED229",
    label: "Pending",
    icon: <FaClock />,
  },
  approved: {
    bg: "#D3EAFF",
    color: "#437EF7",
    label: "Approved",
    icon: <FaCheckCircle />,
  },
  paid: {
    bg: "#ECFDF3",
    color: "#027A48",
    label: "Paid",
    icon: <FaMoneyBillWave />,
  },
  rejected: {
    bg: "#FFDCE2",
    color: "#F94765",
    label: "Rejected",
    icon: <FaTimesCircle />,
  },
};

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

// Bonus types
const BONUS_TYPE_CONFIG = {
  bonus: { label: "Bonus", icon: "🎁", color: "#437EF7" },
  incentive: { label: "Incentive", icon: "🎯", color: "#10b981" },
  commission: { label: "Commission", icon: "💰", color: "#f59e0b" },
  performance: { label: "Performance", icon: "⭐", color: "#8b5cf6" },
  festival: { label: "Festival", icon: "🎉", color: "#ec4899" },
  diwali: { label: "Diwali", icon: "🪔", color: "#ef4444" },
  other: { label: "Other", icon: "📝", color: "#06b6d4" },
};

const BonusList = () => {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("bonus");

  // ============ BONUS STATE ============
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    amount: "",
    bonus_type: "",
    month: "",
    reason: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // ============ TARGET STATE ============
  const [targets, setTargets] = useState([]);
  const [targetLoading, setTargetLoading] = useState(true);
  const [targetSearchTerm, setTargetSearchTerm] = useState("");
  const [targetActiveDropdown, setTargetActiveDropdown] = useState(null);
  const [showTargetViewModal, setShowTargetViewModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievedAmount, setAchievedAmount] = useState("");
  const [targetPagination, setTargetPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // ============ OVERTIME STATE ============
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [overtimeLoading, setOvertimeLoading] = useState(true);
  const [overtimeSearchTerm, setOvertimeSearchTerm] = useState("");
  const [overtimeStatusFilter, setOvertimeStatusFilter] = useState("all");
  const [overtimeActiveDropdown, setOvertimeActiveDropdown] = useState(null);
  const [showOvertimeViewModal, setShowOvertimeViewModal] = useState(false);
  const [selectedOvertime, setSelectedOvertime] = useState(null);
  const [showOvertimeStatusModal, setShowOvertimeStatusModal] = useState(false);
  const [overtimeStatusData, setOvertimeStatusData] = useState({
    status: "",
    remarks: "",
  });
  const [overtimePagination, setOvertimePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "bonus") {
      loadBonuses();
    } else if (activeTab === "target") {
      loadTargets();
    } else if (activeTab === "overtime") {
      loadOvertimeRequests();
    }
  }, [
    activeTab,
    pagination.page,
    targetPagination.page,
    overtimePagination.page,
  ]);

  // ============ BONUS FUNCTIONS ============
  const loadBonuses = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;

      const response = await getBonuses(filters, {
        page: pagination.page,
        limit: pagination.limit,
      });

      let bonusesArray = [];
      let paginationData = {};

      if (response?.data?.data?.data) {
        bonusesArray = response.data.data.data;
        paginationData = response.data.data.pagination || {};
      } else if (response?.data?.data) {
        bonusesArray = response.data.data;
        paginationData = response.data.pagination || {};
      } else if (response?.data) {
        bonusesArray = response.data;
      } else if (Array.isArray(response)) {
        bonusesArray = response;
      }

      setBonuses(bonusesArray);
      setPagination({
        page: paginationData.page || pagination.page,
        limit: paginationData.limit || pagination.limit,
        total: paginationData.total || bonusesArray.length,
        totalPages:
          paginationData.totalPages ||
          Math.ceil(bonusesArray.length / pagination.limit),
      });
    } catch (error) {
      console.error("Failed to load bonuses:", error);
      setErrorMessage("Failed to load bonuses. Please try again.");
      setBonuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBonusDetails = (bonus) => {
    setSelectedBonus(bonus);
    setShowViewModal(true);
  };

  const handleEditBonusClick = (bonus) => {
    setSelectedBonus(bonus);
    setEditFormData({
      amount: bonus.amount,
      bonus_type: bonus.bonus_type,
      month: bonus.month,
      reason: bonus.reason || "",
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.amount) {
      errors.amount = "Amount is required";
    } else if (parseFloat(editFormData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    } else if (parseFloat(editFormData.amount) > 1000000) {
      errors.amount = "Amount cannot exceed ₹10,00,000";
    }
    if (!editFormData.month) {
      errors.month = "Month is required";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateBonus = async () => {
    if (!validateEditForm()) return;

    setUpdating(true);
    const loadingToast = toast.loading("Updating bonus...");

    try {
      await updateBonus(selectedBonus.id, {
        amount: parseFloat(editFormData.amount),
        bonus_type: editFormData.bonus_type,
        month: editFormData.month,
        reason: editFormData.reason || null,
      });

      toast.update(loadingToast, {
        render: "✅ Bonus updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setShowEditModal(false);
      loadBonuses();
    } catch (error) {
      toast.update(loadingToast, {
        render: error.response?.data?.message || "❌ Failed to update bonus",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBonus = async (id, staffName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete bonus for "${staffName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteBonus(id);
        toast.success(`Bonus deleted successfully!`);
        loadBonuses();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete bonus");
      }
    }
  };

  const handleUpdateBonusStatus = async (bonus) => {
    const { value: formValues } = await Swal.fire({
      title: "Update Bonus Status",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Status *</label>
            <select id="status" style="width: 100%; padding: 10px; border-radius: 8px;">
              <option value="approved" ${bonus.status === "pending" ? "selected" : ""}>Approved</option>
              <option value="paid" ${bonus.status === "approved" ? "selected" : ""}>Paid</option>
              <option value="rejected" ${bonus.status === "rejected" ? "selected" : ""}>Rejected</option>
            </select>
          </div>
          <div id="paid_date_div" style="margin-bottom: 20px; display: ${bonus.status === "paid" ? "block" : "none"};">
            <label>Paid Date *</label>
            <input id="paid_date" type="date" value="${new Date().toISOString().split("T")[0]}" style="width: 100%; padding: 10px; border-radius: 8px;">
          </div>
          <div style="margin-bottom: 20px;">
            <label>Remarks</label>
            <textarea id="remarks" rows="3" style="width: 100%; padding: 10px; border-radius: 8px;"></textarea>
          </div>
        </div>
      `,
      width: "480px",
      showCancelButton: true,
      confirmButtonText: "Update Status",
      confirmButtonColor: "#1e3a6f",
      preConfirm: () => {
        const status = document.getElementById("status").value;
        const paid_date = document.getElementById("paid_date")?.value;
        if (status === "paid" && !paid_date) {
          Swal.showValidationMessage("Please select paid date");
          return false;
        }
        return {
          status: status,
          remarks: document.getElementById("remarks").value || null,
          paid_date: paid_date || null,
        };
      },
    });

    if (formValues) {
      const loadingToast = toast.loading("Updating bonus status...");
      try {
        await updateBonusStatus(bonus.id, formValues);
        toast.update(loadingToast, {
          render: `Bonus ${formValues.status} successfully!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        loadBonuses();
      } catch (error) {
        toast.update(loadingToast, {
          render: error.response?.data?.message || "Failed to update status",
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });
      }
    }
  };

  const handleAddBonus = () => {
    navigate("/staff/bonuses/add");
  };

  // ============ TARGET FUNCTIONS ============
  const loadTargets = async () => {
    setTargetLoading(true);
    try {
      const response = await getStaffTargets(
        {},
        { page: targetPagination.page, limit: targetPagination.limit },
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
      setTargetPagination({
        page: paginationData.page || targetPagination.page,
        limit: paginationData.limit || targetPagination.limit,
        total: paginationData.total || targetsArray.length,
        totalPages:
          paginationData.totalPages ||
          Math.ceil(targetsArray.length / targetPagination.limit),
      });
    } catch (error) {
      toast.error("Failed to load targets");
      setTargets([]);
    } finally {
      setTargetLoading(false);
    }
  };

  const handleViewTargetDetails = (target) => {
    setSelectedTarget(target);
    setShowTargetViewModal(true);
  };

  const handleUpdateTargetAchievement = (target) => {
    setSelectedTarget(target);
    setAchievedAmount(target.achieved_amount || "");
    setShowAchievementModal(true);
  };

  const handleSubmitAchievement = async () => {
    if (!achievedAmount) {
      toast.error("Please enter achieved amount");
      return;
    }

    const loadingToast = toast.loading("Updating achievement...");
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
    });

    if (result.isConfirmed) {
      try {
        await deleteTarget(id);
        toast.success("Target deleted successfully!");
        loadTargets();
      } catch (error) {
        toast.error("Failed to delete target");
      }
    }
  };

  const handleAddTarget = () => navigate("/staff/targets/add");

  // ============ OVERTIME FUNCTIONS ============
  const loadOvertimeRequests = async () => {
    setOvertimeLoading(true);
    try {
      const filters = {};
      if (overtimeStatusFilter !== "all") filters.status = overtimeStatusFilter;
      if (overtimeSearchTerm) filters.search = overtimeSearchTerm;

      const response = await getOvertimeRequests(filters, {
        page: overtimePagination.page,
        limit: overtimePagination.limit,
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
      setOvertimePagination({
        page: paginationData.page || overtimePagination.page,
        limit: paginationData.limit || overtimePagination.limit,
        total: paginationData.total || requestsArray.length,
        totalPages:
          paginationData.totalPages ||
          Math.ceil(requestsArray.length / overtimePagination.limit),
      });
    } catch (error) {
      toast.error("Failed to load overtime requests");
      setOvertimeRequests([]);
    } finally {
      setOvertimeLoading(false);
    }
  };

  const handleViewOvertimeDetails = (request) => {
    setSelectedOvertime(request);
    setShowOvertimeViewModal(true);
  };

  const handleUpdateOvertimeStatus = (request) => {
    setSelectedOvertime(request);
    setOvertimeStatusData({
      status: request.status || "pending",
      remarks: request.remarks || "",
    });
    setShowOvertimeStatusModal(true);
  };

  const handleOvertimeStatusChange = (e) => {
    const { name, value } = e.target;
    setOvertimeStatusData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOvertimeStatus = async () => {
    if (!overtimeStatusData.status) {
      toast.error("Please select a status");
      return;
    }

    const loadingToast = toast.loading("Updating overtime status...");
    try {
      await updateOvertimeStatus(selectedOvertime.id, {
        status: overtimeStatusData.status,
        remarks: overtimeStatusData.remarks,
        approved_by: currentUser?.id || 1,
      });
      toast.update(loadingToast, {
        render: `✅ Overtime ${overtimeStatusData.status} successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setShowOvertimeStatusModal(false);
      loadOvertimeRequests();
    } catch (error) {
      toast.update(loadingToast, {
        render: error.response?.data?.message || "❌ Failed to update status",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const handleDeleteOvertime = async (id, staffName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete overtime request for "${staffName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteOvertimeRequest(id);
        toast.success("Overtime request deleted successfully!");
        loadOvertimeRequests();
      } catch (error) {
        toast.error("Failed to delete request");
      }
    }
  };

  const handleAddOvertime = () => navigate("/staff/overtime/add");

  // ============ FILTERING ============
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTargetSearchTerm("");
    setOvertimeSearchTerm("");
    setOvertimeStatusFilter("all");
  };

  // ============ HELPERS ============
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
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

  const getBonusTypeLabel = (type) => {
    const config = BONUS_TYPE_CONFIG[type] || BONUS_TYPE_CONFIG.other;
    return `${config.icon} ${config.label}`;
  };

  // Stats
  const stats = {
    total: bonuses.length,
    totalAmount: bonuses.reduce(
      (sum, b) => sum + (parseFloat(b.amount) || 0),
      0,
    ),
    pending: bonuses.filter((b) => b.status === "pending").length,
    approved: bonuses.filter((b) => b.status === "approved").length,
    paid: bonuses.filter((b) => b.status === "paid").length,
    rejected: bonuses.filter((b) => b.status === "rejected").length,
  };

  const filteredTargets = targets.filter(
    (target) =>
      targetSearchTerm === "" ||
      target.staff_name
        ?.toLowerCase()
        .includes(targetSearchTerm.toLowerCase()) ||
      target.staff_code?.toLowerCase().includes(targetSearchTerm.toLowerCase()),
  );

  const filteredOvertime = overtimeRequests.filter(
    (request) =>
      overtimeSearchTerm === "" ||
      request.staff_name
        ?.toLowerCase()
        .includes(overtimeSearchTerm.toLowerCase()) ||
      request.staff_code
        ?.toLowerCase()
        .includes(overtimeSearchTerm.toLowerCase()),
  );

  if (loading && activeTab === "bonus") {
    return (
      <Container fluid className="p-4">
        <ToastContainer />
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading records...</h4>
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

      {/* Header Buttons */}
      <div className="d-flex justify-content-end mb-4 gap-3">
        {activeTab === "bonus" && (
          <Button
            onClick={handleAddBonus}
            style={{
              backgroundColor: "rgb(30, 58, 111)",
              border: "none",
              borderRadius: "14px",
              padding: "10px 22px",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
            }}
          >
            <FaPlus size={14} /> Add Bonus
          </Button>
        )}
        {activeTab === "target" && (
          <Button
            onClick={handleAddTarget}
            style={{
              backgroundColor: "rgb(30, 58, 111)",
              border: "none",
              borderRadius: "14px",
              padding: "10px 22px",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
            }}
          >
            <FaPlus size={14} /> Add Target
          </Button>
        )}
        {activeTab === "overtime" && (
          <Button
            onClick={handleAddOvertime}
            style={{
              backgroundColor: "rgb(30, 58, 111)",
              border: "none",
              borderRadius: "14px",
              padding: "10px 22px",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
            }}
          >
            <FaPlus size={14} /> Add Overtime
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Header className="bg-white border-bottom-0 pt-3 px-4">
          <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
            <Nav.Item>
              <Nav.Link eventKey="bonus" className="fw-semibold">
                <FaGift className="me-2" /> Bonus List
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="target" className="fw-semibold">
                <FaBullseye className="me-2" /> Target List
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="overtime" className="fw-semibold">
                <FaClock className="me-2" /> Overtime List
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
      </Card>

      {/* ============ BONUS TAB ============ */}
      {activeTab === "bonus" && (
        <>
          {/* Stats Cards */}
          <Row className="g-3 mb-4">
            <StatCard
              title="Total Bonuses"
              value={stats.total}
              icon={<FaMoneyBillWave size={18} style={{ color: "#437EF7" }} />}
              bg="#D3EAFF"
            />
            <StatCard
              title="Total Amount"
              value={formatCurrency(stats.totalAmount)}
              icon={<FaRupeeSign size={18} style={{ color: "#027A48" }} />}
              bg="#ECFDF3"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={<FaClock size={18} style={{ color: "#FED229" }} />}
              bg="#FEF6D7"
            />
            <StatCard
              title="Approved"
              value={stats.approved}
              icon={<FaCheckCircle size={18} style={{ color: "#437EF7" }} />}
              bg="#D3EAFF"
            />
          </Row>

          {/* Search */}
          <Card
            className="border-0 mb-4"
            style={{
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Card.Body className="py-3">
              <Row>
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text
                      style={{ backgroundColor: "#fff", borderRight: "none" }}
                    >
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by staff name..."
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
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button
                    variant="outline-secondary"
                    onClick={clearFilters}
                    className="w-100"
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Results Summary */}
          <div className="d-flex justify-content-between mb-3">
            <p className="text-muted mb-0">
              Showing {bonuses.length} bonus records
            </p>
          </div>

          {/* Bonuses Table */}
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
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th style={{ padding: "12px" }}>Staff</th>
                      <th style={{ padding: "12px" }}>Amount</th>
                      <th style={{ padding: "12px" }}>Reason</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonuses.map((bonus) => (
                      <tr key={bonus.id}>
                        <td style={{ padding: "12px" }}>
                          <div className="fw-semibold">{bonus.staff_name}</div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <strong
                            style={{
                              backgroundColor: "#ECFDF3",
                              color: "#027A48",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              display: "inline-block",
                            }}
                          >
                            {formatCurrency(bonus.amount)}
                          </strong>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {bonus.reason || "-"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                              backgroundColor:
                                paymentStatusConfig[bonus.status]?.bg,
                              color: paymentStatusConfig[bonus.status]?.color,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {paymentStatusConfig[bonus.status]?.icon}{" "}
                            {paymentStatusConfig[bonus.status]?.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <ActionDropdown
                            items={[
                              {
                                icon: <FaEye />,
                                color: "#4361ee",
                                onClick: () => handleViewBonusDetails(bonus),
                              },
                              {
                                icon: <FaEdit />,
                                color: "#ff9800",
                                onClick: () => handleEditBonusClick(bonus),
                              },
                              {
                                icon: <FaCheckCircle />,
                                color: "#4caf50",
                                onClick: () => handleUpdateBonusStatus(bonus),
                                show: bonus.status === "pending",
                              },
                              {
                                icon: <FaTrash />,
                                color: "#dc3545",
                                onClick: () =>
                                  handleDeleteBonus(bonus.id, bonus.staff_name),
                                className: "delete",
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                    {bonuses.length === 0 && (
                      <EmptyRow colSpan={5} message="No bonus records found" />
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
        </>
      )}

      {/* ============ TARGET TAB ============ */}
      {activeTab === "target" && (
        <>
          {targetLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" size="lg" />
              <h4 className="mt-3">Loading targets...</h4>
            </div>
          ) : (
            <>
              <Card
                className="border-0 mb-4"
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Body className="py-3">
                  <Row>
                    <Col md={8}>
                      <InputGroup>
                        <InputGroup.Text
                          style={{
                            backgroundColor: "#fff",
                            borderRight: "none",
                          }}
                        >
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search by staff name..."
                          value={targetSearchTerm}
                          onChange={(e) => setTargetSearchTerm(e.target.value)}
                          style={{ borderLeft: "none" }}
                        />
                        {targetSearchTerm && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => setTargetSearchTerm("")}
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
                      >
                        Clear Filters
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-between mb-3">
                <p className="text-muted mb-0">
                  Showing {filteredTargets.length} of {targets.length} target
                  records
                </p>
              </div>

              <Card
                className="border-0 shadow-sm"
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
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
                              <div className="fw-semibold">
                                {target.staff_name}
                              </div>
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
                                  color:
                                    targetStatusConfig[target.status]?.color,
                                }}
                              >
                                {targetStatusConfig[target.status]?.icon}{" "}
                                {targetStatusConfig[target.status]?.label}
                              </span>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <ActionDropdown
                                items={[
                                  {
                                    icon: <FaEye />,
                                    color: "#4361ee",
                                    onClick: () =>
                                      handleViewTargetDetails(target),
                                  },
                                  {
                                    icon: <FaChartLine />,
                                    color: "#4caf50",
                                    onClick: () =>
                                      handleUpdateTargetAchievement(target),
                                  },
                                  {
                                    icon: <FaTrash />,
                                    color: "#dc3545",
                                    onClick: () =>
                                      handleDeleteTarget(
                                        target.id,
                                        target.staff_name,
                                      ),
                                    className: "delete",
                                  },
                                ]}
                              />
                            </td>
                          </tr>
                        ))}
                        {filteredTargets.length === 0 && (
                          <EmptyRow
                            colSpan={7}
                            message="No target records found"
                          />
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              {targetPagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted small">
                    Page {targetPagination.page} of{" "}
                    {targetPagination.totalPages}
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={targetPagination.page === 1}
                      onClick={() =>
                        setTargetPagination({
                          ...targetPagination,
                          page: targetPagination.page - 1,
                        })
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={
                        targetPagination.page === targetPagination.totalPages
                      }
                      onClick={() =>
                        setTargetPagination({
                          ...targetPagination,
                          page: targetPagination.page + 1,
                        })
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ============ OVERTIME TAB ============ */}
      {activeTab === "overtime" && (
        <>
          {overtimeLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" size="lg" />
              <h4 className="mt-3">Loading overtime requests...</h4>
            </div>
          ) : (
            <>
              <Card
                className="border-0 mb-4"
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Card.Body className="py-3">
                  <Row>
                    <Col md={4}>
                      <InputGroup>
                        <InputGroup.Text
                          style={{
                            backgroundColor: "#fff",
                            borderRight: "none",
                          }}
                        >
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search by staff..."
                          value={overtimeSearchTerm}
                          onChange={(e) =>
                            setOvertimeSearchTerm(e.target.value)
                          }
                          style={{ borderLeft: "none" }}
                        />
                        {overtimeSearchTerm && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => setOvertimeSearchTerm("")}
                          >
                            <FaTimes />
                          </Button>
                        )}
                      </InputGroup>
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        value={overtimeStatusFilter}
                        onChange={(e) =>
                          setOvertimeStatusFilter(e.target.value)
                        }
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="paid">Paid</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Button
                        variant="outline-secondary"
                        onClick={clearFilters}
                        className="w-100"
                      >
                        Clear
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-between mb-3">
                <p className="text-muted mb-0">
                  Showing {filteredOvertime.length} of {overtimeRequests.length}{" "}
                  overtime records
                </p>
              </div>

              <Card
                className="border-0 shadow-sm"
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0" style={{ fontSize: "14px" }}>
                      <thead style={{ backgroundColor: "#f8f9fa" }}>
                        <tr>
                          <th style={{ padding: "12px" }}>Staff</th>
                          <th style={{ padding: "12px" }}>Date</th>
                          <th style={{ padding: "12px" }}>Hours</th>
                          <th style={{ padding: "12px" }}>Amount</th>
                          <th style={{ padding: "12px" }}>Status</th>
                          <th style={{ padding: "12px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOvertime.map((request) => (
                          <tr key={request.id}>
                            <td style={{ padding: "12px" }}>
                              <div className="fw-semibold">
                                {request.staff_name}
                              </div>
                              {/* <small>{request.staff_code}</small> */}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {formatDate(request.date)}
                            </td>
                            <td style={{ padding: "12px" }}>
                              <strong>{request.hours} hrs</strong>
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
                                  color:
                                    overtimeStatusConfig[request.status]?.color,
                                }}
                              >
                                {overtimeStatusConfig[request.status]?.icon}{" "}
                                {overtimeStatusConfig[request.status]?.label}
                              </span>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <ActionDropdown
                                items={[
                                  {
                                    icon: <FaEye />,
                                    color: "#4361ee",
                                    onClick: () =>
                                      handleViewOvertimeDetails(request),
                                  },
                                  {
                                    icon: <FaEdit />,
                                    color: "#ff9800",
                                    onClick: () =>
                                      handleUpdateOvertimeStatus(request),
                                  },
                                  {
                                    icon: <FaTrash />,
                                    color: "#dc3545",
                                    onClick: () =>
                                      handleDeleteOvertime(
                                        request.id,
                                        request.staff_name,
                                      ),
                                    className: "delete",
                                  },
                                ]}
                              />
                            </td>
                          </tr>
                        ))}
                        {filteredOvertime.length === 0 && (
                          <EmptyRow
                            colSpan={6}
                            message="No overtime requests found"
                          />
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              {overtimePagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted small">
                    Page {overtimePagination.page} of{" "}
                    {overtimePagination.totalPages}
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={overtimePagination.page === 1}
                      onClick={() =>
                        setOvertimePagination({
                          ...overtimePagination,
                          page: overtimePagination.page - 1,
                        })
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={
                        overtimePagination.page ===
                        overtimePagination.totalPages
                      }
                      onClick={() =>
                        setOvertimePagination({
                          ...overtimePagination,
                          page: overtimePagination.page + 1,
                        })
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <style>{`
        .rounded-3 { border-radius: 0.75rem !important; }
        .table tbody tr:hover { background-color: #f8f9fa; }
        .form-control:focus, .form-select:focus { border-color: rgb(30, 58, 111); box-shadow: 0 0 0 0.2rem rgba(30, 58, 111, 0.25); }
        .nav-tabs { border-bottom: 2px solid #e9ecef; }
        .nav-tabs .nav-link { border: none; color: #6c757d; padding: 12px 20px; font-size: 14px; transition: all 0.2s; }
        .nav-tabs .nav-link:hover { color: rgb(30, 58, 111); background: transparent; }
        .nav-tabs .nav-link.active { color: rgb(30, 58, 111); background: transparent; border-bottom: 2px solid rgb(30, 58, 111); }
      `}</style>
    </Container>
  );
};

// ============================================
// Reusable Components
// ============================================

const StatCard = ({ title, value, icon, bg }) => (
  <Col md={3}>
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Body className="py-3 px-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
              {title}
            </small>
            <h3 className="fw-bold mb-0" style={{ fontSize: "24px" }}>
              {value}
            </h3>
          </div>
          <div
            style={{
              backgroundColor: bg,
              padding: "10px",
              borderRadius: "12px",
            }}
          >
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

const ActionDropdown = ({ items }) => {
  const [open, setOpen] = useState(false);
  const visibleItems = items.filter((item) => item.show !== false);
  return (
    <div className="position-relative">
      <button
        className="action-trigger"
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="6" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="18" r="2" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div
          className="dropdown-custom"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            minWidth: "50px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            padding: "4px",
          }}
        >
          {visibleItems.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`dropdown-item-custom ${item.className || ""}`}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                padding: "6px 8px",
                border: "none",
                background: "white",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              <span style={{ color: item.color }}>{item.icon}</span>
            </button>
          ))}
        </div>
      )}
      <style>{`
        .action-trigger { color: #64748b; transition: all 0.2s; }
        .action-trigger:hover { color: #1e293b; background-color: #f1f5f9; }
        .dropdown-item-custom { transition: background-color 0.2s; }
        .dropdown-item-custom:hover { background-color: #f8fafc; }
        .dropdown-item-custom.delete:hover { background-color: #fef2f2; }
      `}</style>
    </div>
  );
};

const EmptyRow = ({ colSpan, message, icon }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-5">
      <div className="py-4">
        {icon || <FaSearch size={40} className="text-muted mb-3" />}
        <h5 className="text-muted">{message}</h5>
      </div>
    </td>
  </tr>
);

export default BonusList;
