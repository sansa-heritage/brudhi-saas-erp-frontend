// src/pages/payroll/PayrollList.js

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
  Tab,
  Nav,
  Badge,
} from "react-bootstrap";
import {
  FaPlus,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaMoneyBillWave,
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaRupeeSign,
  FaCalendarAlt,
  FaCreditCard,
  FaIdCard,
  FaCommentDots,
  FaUmbrella,
  FaFileInvoice,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getAllPayrolls,
  processPayrollPayment,
  deletePayroll,
  downloadPDFPayslip,
} from "../../api/tenant/payroll.api";
import { getAllLeaveHistory } from "../../api/tenant/leave.api";
import {
  getAllSalaryStructures,
  deleteSalaryStructure,
} from "../../api/tenant/salartStructure.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Constants
const PAYMENT_STATUS_CONFIG = {
  pending: {
    bg: "#FEF6D7",
    color: "#FED229",
    label: "Pending",
    icon: <FaClock />,
  },
  processing: {
    bg: "#D3EAFF",
    color: "#437EF7",
    label: "Processing",
    icon: <FaMoneyBillWave />,
  },
  paid: {
    bg: "#ECFDF3",
    color: "#027A48",
    label: "Paid",
    icon: <FaCheckCircle />,
  },
  failed: {
    bg: "#FFDCE2",
    color: "#F94765",
    label: "Failed",
    icon: <FaTimes />,
  },
};

const LEAVE_STATUS_CONFIG = {
  approved: { bg: "#ECFDF3", color: "#027A48", label: "Approved" },
  pending: { bg: "#FEF6D7", color: "#FED229", label: "Pending" },
  rejected: { bg: "#FFDCE2", color: "#F94765", label: "Rejected" },
};

const LEAVE_TYPE_CONFIG = {
  sick: { bg: "#D3EAFF", color: "#437EF7", label: "Sick Leave" },
  casual: { bg: "#ECFDF3", color: "#027A48", label: "Casual Leave" },
  annual: { bg: "#FFE4B5", color: "#FF8C00", label: "Annual Leave" },
  unpaid: { bg: "#FFDCE2", color: "#F94765", label: "Unpaid Leave" },
  emergency: { bg: "#E8D5FF", color: "#8b5cf6", label: "Emergency Leave" },
};

const PAYMENT_METHODS = [
  { value: "Bank Transfer", label: "🏦 Bank Transfer" },
  { value: "Cash", label: "💵 Cash" },
  { value: "Cheque", label: "📝 Cheque" },
  { value: "UPI", label: "📱 UPI" },
  { value: "Credit Card", label: "💳 Credit Card" },
  { value: "Debit Card", label: "💳 Debit Card" },
];

const PayrollList = () => {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("payroll");

  // Payroll State
  const [payrolls, setPayrolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Leave State
  const [leaves, setLeaves] = useState([]);
  const [leaveSearch, setLeaveSearch] = useState("");
  const [leaveStatus, setLeaveStatus] = useState("all");
  const [leaveType, setLeaveType] = useState("all");
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Salary Structure State (matching SalaryStructureList)
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [salarySearchTerm, setSalarySearchTerm] = useState("");
  const [salaryLoading, setSalaryLoading] = useState(true);
  const [salaryErrorMessage, setSalaryErrorMessage] = useState("");
  const [salaryActiveDropdown, setSalaryActiveDropdown] = useState(null);
  const [salaryPagination, setSalaryPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "payroll") loadPayrolls();
    if (activeTab === "leave") loadLeaves();
    if (activeTab === "salary") loadSalaryStructures();
  }, [activeTab, salaryPagination.page]);

  const loadPayrolls = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getAllPayrolls();
      setPayrolls(extractData(response));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to load payrolls",
      );
      toast.error("Failed to load payrolls");
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaves = async () => {
    setLeaveLoading(true);
    try {
      const response = await getAllLeaveHistory();
      setLeaves(extractData(response));
    } catch (error) {
      toast.error("Failed to load leave history");
      setLeaves([]);
    } finally {
      setLeaveLoading(false);
    }
  };

  const loadSalaryStructures = async () => {
    setSalaryLoading(true);
    setSalaryErrorMessage("");
    try {
      const response = await getAllSalaryStructures(
        {},
        { page: salaryPagination.page, limit: salaryPagination.limit },
      );

      let structuresData = [];
      let paginationData = {};

      if (response?.data?.data?.data) {
        structuresData = response.data.data.data;
        paginationData = response.data.data.pagination || {};
      } else if (response?.data?.data) {
        structuresData = response.data.data;
        paginationData = response.data.pagination || {};
      } else if (response?.data) {
        structuresData = response.data;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response)) {
        structuresData = response;
      }

      setSalaryStructures(Array.isArray(structuresData) ? structuresData : []);

      if (paginationData && paginationData.total) {
        setSalaryPagination({
          page: paginationData.page || 1,
          limit: paginationData.limit || 10,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load salary structures:", error);
      setSalaryErrorMessage(
        error.response?.data?.message || "Failed to load salary structures",
      );
      setSalaryStructures([]);
    } finally {
      setSalaryLoading(false);
    }
  };

  const extractData = (response) => {
    if (response?.data?.data?.data) return response.data.data.data;
    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  // Payroll Handlers
  const handleViewDetails = (id) => navigate(`/staff/payroll/${id}`);
  const handleGeneratePayroll = () => navigate("/staff/payroll/generate");
  const handleMarkLeave = () => navigate("/staff/mark-leave");
  const handleAddSalaryStructure = () => navigate("/salary-structure/add");
  const handleViewSalaryStructure = (id) =>
    navigate(`/staff/salary-structure/${id}`);
  const handleEditSalaryStructure = (id) =>
    navigate(`/salary-structure/edit/${id}`);

  const handleDeleteSalaryStructure = async (id, staffName) => {
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
        toast.success(`Salary structure deleted successfully!`);
        loadSalaryStructures();
      } catch (error) {
        toast.error("Failed to delete salary structure");
      }
    }
  };

  const handleProcessPayment = async (id, payroll) => {
    if (payroll.payment_status === "paid") {
      toast.warning("This payroll has already been paid!");
      return;
    }

    const result = await Swal.fire({
      title: '<span style="color: #1e3a6f;">💳 Process Payment</span>',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      border-radius: 12px; padding: 15px; margin-bottom: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <small style="opacity: 0.8;">Employee</small>
                <h4 style="margin: 5px 0; font-weight: 600;">${payroll.staff_name}</h4>
                <small style="opacity: 0.8;">${payroll.staff_code || "EMP001"}</small>
              </div>
              <div style="text-align: right;">
                <small style="opacity: 0.8;">Net Salary</small>
                <h3 style="margin: 5px 0; font-weight: 700;">₹${payroll.net_salary?.toLocaleString()}</h3>
                <small style="opacity: 0.8;">${getMonthName(payroll.payroll_month)}</small>
              </div>
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <label>Payment Status *</label>
            <select id="status" style="width: 100%; padding: 12px; border-radius: 10px;">
              <option value="paid">✅ Paid</option>
              <option value="processing">⏳ Processing</option>
              <option value="failed">❌ Failed</option>
            </select>
          </div>
          <div style="margin-bottom: 20px;">
            <label>Payment Mode *</label>
            <select id="payment_mode" style="width: 100%; padding: 12px; border-radius: 10px;">
              <option value="">Select Mode</option>
              ${PAYMENT_METHODS.map((m) => `<option value="${m.value}">${m.label}</option>`).join("")}
            </select>
          </div>
          <div style="margin-bottom: 20px;">
            <label>Transaction ID</label>
            <input type="text" id="transaction_id" style="width: 100%; padding: 12px; border-radius: 10px;">
          </div>
          <div style="margin-bottom: 20px;">
            <label>Payment Date *</label>
            <input type="date" id="payment_date" value="${new Date().toISOString().split("T")[0]}" style="width: 100%; padding: 12px; border-radius: 10px;">
          </div>
          <div>
            <label>Remarks</label>
            <textarea id="remarks" rows="3" style="width: 100%; padding: 12px; border-radius: 10px;"></textarea>
          </div>
        </div>
      `,
      width: "520px",
      showCancelButton: true,
      confirmButtonText: "✅ Process Payment",
      cancelButtonText: "❌ Cancel",
      confirmButtonColor: "#1e3a6f",
      preConfirm: () => {
        const status = document.getElementById("status").value;
        const mode = document.getElementById("payment_mode").value;
        const date = document.getElementById("payment_date").value;
        if (!mode || !date) {
          Swal.showValidationMessage("Please fill all required fields");
          return false;
        }
        return {
          status,
          payment_mode: mode,
          transaction_id:
            document.getElementById("transaction_id").value || null,
          payment_date: date,
          remarks: document.getElementById("remarks").value || null,
        };
      },
    });

    if (result.value) {
      const toastId = toast.loading("Processing payment...");
      try {
        await processPayrollPayment(id, result.value);
        toast.dismiss(toastId);
        toast.success(`Payment ${result.value.status}!`);
        loadPayrolls();
      } catch (error) {
        toast.dismiss(toastId);
        toast.error("Payment failed");
      }
    }
  };

  const handleDownloadPayslip = async (id, staffName) => {
    const result = await Swal.fire({
      title: "Download Payslip",
      text: `Download payslip for ${staffName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Download PDF",
    });

    if (result.isConfirmed) {
      const toastId = toast.loading("Generating payslip...");
      try {
        const response = await downloadPDFPayslip(id);
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `payslip_${staffName.replace(/\s/g, "_")}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.dismiss(toastId);
        toast.success("Payslip downloaded!");
      } catch (error) {
        toast.dismiss(toastId);
        toast.error("Download failed");
      }
    }
  };

  const handleDelete = async (id, staffName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete payroll for "${staffName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    });

    if (result.isConfirmed) {
      try {
        await deletePayroll(id);
        toast.success(`Payroll deleted!`);
        loadPayrolls();
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMonthFilter("");
    setLeaveSearch("");
    setLeaveStatus("all");
    setLeaveType("all");
    setSalarySearchTerm("");
    toast.info("Filters cleared!");
  };

  // Filtering
  const filteredPayrolls = payrolls.filter((p) => {
    const matchSearch =
      !searchTerm ||
      p.staff_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "all" || p.payment_status === statusFilter;
    const matchMonth = !monthFilter || p.payroll_month?.startsWith(monthFilter);
    return matchSearch && matchStatus && matchMonth;
  });

  const filteredLeaves = leaves.filter((l) => {
    const matchSearch =
      !leaveSearch ||
      l.staff_name?.toLowerCase().includes(leaveSearch.toLowerCase());
    const matchStatus = leaveStatus === "all" || l.status === leaveStatus;
    const matchType = leaveType === "all" || l.leave_type === leaveType;
    return matchSearch && matchStatus && matchType;
  });

  const filteredSalaryStructures = Array.isArray(salaryStructures)
    ? salaryStructures.filter((structure) => {
        const matchesSearch =
          salarySearchTerm === "" ||
          (structure.staff_name &&
            structure.staff_name
              .toLowerCase()
              .includes(salarySearchTerm.toLowerCase())) ||
          (structure.staff_code &&
            structure.staff_code
              .toLowerCase()
              .includes(salarySearchTerm.toLowerCase()));
        return matchesSearch;
      })
    : [];

  // Statistics
  const stats = {
    total: payrolls.length,
    totalAmount: payrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0),
    paid: payrolls.filter((p) => p.payment_status === "paid").length,
    pending: payrolls.filter((p) => p.payment_status === "pending").length,
  };

  // Salary Statistics
  const calculateTotalAllowances = (structure) => {
    return (
      (structure.house_rent_allowance || 0) +
      (structure.travel_allowance || 0) +
      (structure.medical_allowance || 0) +
      (structure.special_allowance || 0) +
      (structure.other_allowances || 0)
    );
  };

  const calculateTotalEarnings = (structure) => {
    return (structure.basic_salary || 0) + calculateTotalAllowances(structure);
  };

  // Helpers
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";
  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amt || 0);
  const getMonthName = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "N/A";

  const getPaymentBadge = (status) => {
    const c = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pending;
    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: c.bg,
          color: c.color,
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {c.icon} {c.label}
      </span>
    );
  };

  const getLeaveStatusBadge = (status) => {
    const c = LEAVE_STATUS_CONFIG[status] || LEAVE_STATUS_CONFIG.pending;
    return (
      <Badge
        style={{
          backgroundColor: c.bg,
          color: c.color,
          padding: "5px 10px",
          borderRadius: "20px",
        }}
      >
        {c.label}
      </Badge>
    );
  };

  const getLeaveTypeBadge = (type) => {
    const c = LEAVE_TYPE_CONFIG[type] || LEAVE_TYPE_CONFIG.casual;
    return (
      <Badge
        style={{
          backgroundColor: c.bg,
          color: c.color,
          padding: "5px 10px",
          borderRadius: "20px",
        }}
      >
        {c.label}
      </Badge>
    );
  };

  if (loading && activeTab === "payroll") {
    return (
      <Container
        fluid
        className="px-4 py-3"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
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
          dismissible
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Header Buttons */}
      <div className="d-flex justify-content-end mb-4 gap-3">
        {activeTab === "payroll" && (
          <Button
            onClick={handleGeneratePayroll}
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
            }}
          >
            <FaPlus size={14} /> Generate Payroll
          </Button>
        )}
        {activeTab === "leave" && (
          <Button
            onClick={handleMarkLeave}
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
            }}
          >
            <FaPlus size={14} /> Mark Leave
          </Button>
        )}
        {activeTab === "salary" && (
          <Button
            onClick={handleAddSalaryStructure}
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
            }}
          >
            <FaPlus size={14} /> Add Salary Structure
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Header className="bg-white border-bottom-0 pt-3 px-4">
          <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
            <Nav.Item>
              <Nav.Link eventKey="payroll" className="fw-semibold">
                <FaMoneyBillWave className="me-2" /> Payroll List
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="leave" className="fw-semibold">
                <FaUmbrella className="me-2" /> Leave Management
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="salary" className="fw-semibold">
                <FaFileInvoice className="me-2" /> Salary Structure
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
      </Card>

      {/* ============ PAYROLL TAB ============ */}
      {activeTab === "payroll" && (
        <>
          <Row className="g-3 mb-4">
            <StatCard
              title="Total Payrolls"
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
              title="Paid"
              value={stats.paid}
              icon={<FaCheckCircle size={18} style={{ color: "#027A48" }} />}
              bg="#ECFDF3"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={<FaClock size={18} style={{ color: "#FED229" }} />}
              bg="#FEF6D7"
            />
          </Row>

          <Card className="border-0 shadow-sm mb-4 rounded-3">
            <Card.Body className="py-3">
              <Row>
                <Col md={5}>
                  <InputGroup>
                    <InputGroup.Text
                      style={{ backgroundColor: "#fff", borderRight: "none" }}
                    >
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by staff..."
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Button
                    variant="outline-secondary"
                    onClick={clearFilters}
                    className="w-100"
                  >
                    <FaFilter className="me-2" /> Clear
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-between mb-3">
            <p className="text-muted mb-0">
              Showing {filteredPayrolls.length} of {payrolls.length} records
            </p>
          </div>

          <Card
            className="border-0 shadow-sm rounded-3"
            style={{ overflow: "hidden" }}
          >
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0" style={{ fontSize: "14px" }}>
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th style={{ padding: "12px" }}>Employee</th>
                      <th style={{ padding: "12px" }}>Month</th>
                      <th style={{ padding: "12px" }}>Basic Salary</th>
                      <th style={{ padding: "12px" }}>Net Salary</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Payment Date</th>
                      <th style={{ padding: "12px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayrolls.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="fw-semibold">{p.staff_name}</div>
                          <small>{p.staff_code}</small>
                        </td>
                        <td>{getMonthName(p.payroll_month)}</td>
                        <td>{formatCurrency(p.base_salary)}</td>
                        <td>
                          <strong className="text-success">
                            {formatCurrency(p.net_salary)}
                          </strong>
                        </td>
                        <td>{getPaymentBadge(p.payment_status)}</td>
                        <td>
                          {p.payment_date ? formatDate(p.payment_date) : "-"}
                        </td>
                        <td>
                          <ActionDropdown
                            isPaid={p.payment_status === "paid"}
                            onView={() => handleViewDetails(p.id)}
                            onProcess={() => handleProcessPayment(p.id, p)}
                            onDownload={() =>
                              handleDownloadPayslip(p.id, p.staff_name)
                            }
                            onDelete={() => handleDelete(p.id, p.staff_name)}
                            active={activeDropdown === p.id}
                            onToggle={() =>
                              setActiveDropdown(
                                activeDropdown === p.id ? null : p.id,
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                    {!filteredPayrolls.length && (
                      <EmptyRow
                        colSpan={7}
                        message="No payroll records found"
                      />
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* ============ LEAVE TAB ============ */}
      {activeTab === "leave" && (
        <>
          {leaveLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" size="lg" />
              <h4 className="mt-3">Loading leave records...</h4>
            </div>
          ) : (
            <>
              <Card className="border-0 shadow-sm mb-4 rounded-3">
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
                          value={leaveSearch}
                          onChange={(e) => setLeaveSearch(e.target.value)}
                          style={{ borderLeft: "none" }}
                        />
                        {leaveSearch && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => setLeaveSearch("")}
                          >
                            <FaTimes />
                          </Button>
                        )}
                      </InputGroup>
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        value={leaveStatus}
                        onChange={(e) => setLeaveStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="approved">✅ Approved</option>
                        <option value="rejected">❌ Rejected</option>
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                      >
                        <option value="all">All Types</option>
                        <option value="sick">🤒 Sick Leave</option>
                        <option value="casual">🏖️ Casual Leave</option>
                        <option value="annual">📅 Annual Leave</option>
                        <option value="unpaid">💰 Unpaid Leave</option>
                        <option value="emergency">🚨 Emergency Leave</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Button
                        variant="outline-secondary"
                        onClick={clearFilters}
                        className="w-100"
                      >
                        <FaFilter className="me-2" /> Clear
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-between mb-3">
                <p className="text-muted mb-0">
                  Showing {filteredLeaves.length} of {leaves.length} leave
                  records
                </p>
              </div>

              <Card
                className="border-0 shadow-sm rounded-3"
                style={{ overflow: "hidden" }}
              >
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0" style={{ fontSize: "14px" }}>
                      <thead style={{ backgroundColor: "#f8f9fa" }}>
                        <tr>
                          <th style={{ padding: "12px" }}>Staff</th>
                          <th style={{ padding: "12px" }}>Leave Date</th>
                          <th style={{ padding: "12px" }}>Leave Type</th>
                          <th style={{ padding: "12px" }}>Reason</th>
                          {/* <th style={{ padding: "12px" }}>Status</th> */}
                          <th style={{ padding: "12px" }}>Marked By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeaves.map((l) => (
                          <tr key={l.id}>
                            <td style={{ padding: "12px" }}>
                              <div className="fw-semibold">{l.staff_name}</div>
                              {/* <small>{l.staff_code}</small> */}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {formatDate(l.leave_date)}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {/* Leave Type Badge with separate colors */}
                              {l.leave_type === "sick" && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: "#FFDCE2",
                                    color: "#F94765",
                                    display: "inline-block",
                                  }}
                                >
                                  🤒 Sick Leave
                                </span>
                              )}
                              {l.leave_type === "casual" && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: "#ECFDF3",
                                    color: "#027A48",
                                    display: "inline-block",
                                  }}
                                >
                                  🏖️ Casual Leave
                                </span>
                              )}
                              {l.leave_type === "annual" && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: "#FFE0CB",
                                    color: "#FF8532",
                                    display: "inline-block",
                                  }}
                                >
                                  📅 Annual Leave
                                </span>
                              )}
                              {l.leave_type === "unpaid" && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: "#FFF2F0",
                                    color: "#E2341D",
                                    display: "inline-block",
                                  }}
                                >
                                  💰 Unpaid Leave
                                </span>
                              )}
                              {l.leave_type === "emergency" && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: "#D3EAFF",
                                    color: "#437EF7",
                                    display: "inline-block",
                                  }}
                                >
                                  🚨 Emergency Leave
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {l.reason || "-"}
                            </td>
                            
                            <td style={{ padding: "12px" }}>
                              {l.marked_by_name || "-"}
                            </td>
                          </tr>
                        ))}
                        {!filteredLeaves.length && (
                          <EmptyRow
                            colSpan={6}
                            message="No leave records found"
                            icon={<FaUmbrella size={40} />}
                          />
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </>
      )}

      {/* ============ SALARY STRUCTURE TAB ============ */}
      {activeTab === "salary" && (
        <>
          {salaryErrorMessage && (
            <Alert
              variant="danger"
              className="mb-3"
              onClose={() => setSalaryErrorMessage("")}
              dismissible
            >
              {salaryErrorMessage}
            </Alert>
          )}

          {salaryLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" size="lg" />
              <h4 className="mt-3">Loading salary structures...</h4>
            </div>
          ) : (
            <>
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
                          <h5
                            className="mb-0 fw-bold"
                            style={{ fontSize: "20px" }}
                          >
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
                          <FaMoneyBillWave
                            size={18}
                            style={{ color: "#437EF7" }}
                          />
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
                          <h5
                            className="mb-0 fw-bold"
                            style={{ fontSize: "16px" }}
                          >
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
                          <h5
                            className="mb-0 fw-bold"
                            style={{ fontSize: "20px" }}
                          >
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
                          <FaCheckCircle
                            size={18}
                            style={{ color: "#027A48" }}
                          />
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
                          <h5
                            className="mb-0 fw-bold"
                            style={{ fontSize: "16px" }}
                          >
                            {formatCurrency(
                              Array.isArray(salaryStructures)
                                ? salaryStructures.reduce(
                                    (sum, s) =>
                                      sum + calculateTotalAllowances(s),
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
                          style={{
                            backgroundColor: "#fff",
                            borderRight: "none",
                          }}
                        >
                          <FaSearch className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search by staff name or code..."
                          value={salarySearchTerm}
                          onChange={(e) => setSalarySearchTerm(e.target.value)}
                          style={{ borderLeft: "none" }}
                        />
                        {salarySearchTerm && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => setSalarySearchTerm("")}
                          >
                            <FaTimes />
                          </Button>
                        )}
                      </InputGroup>
                    </Col>
                    <Col md={4}>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSalarySearchTerm("")}
                        className="w-100"
                        title="Clear filters"
                      >
                        <FaFilter className="me-2" /> Clear
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Results Summary */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted mb-0">
                  Showing {filteredSalaryStructures.length} of{" "}
                  {Array.isArray(salaryStructures)
                    ? salaryStructures.length
                    : 0}{" "}
                  salary structures
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
                          <th style={{ padding: "16px 12px" }}>PF %</th>
                          <th style={{ padding: "16px 12px" }}>
                            Professional Tax
                          </th>
                          <th style={{ padding: "16px 12px" }}>
                            Effective From
                          </th>
                          <th style={{ padding: "16px 12px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSalaryStructures.map((structure) => (
                          <tr
                            key={structure.id}
                            style={{ borderBottom: "1px solid #e9ecef" }}
                          >
                            <td style={{ padding: "16px 12px" }}>
                              <div className="fw-semibold">
                                {structure.staff_name}
                              </div>
                            </td>
                            <td style={{ padding: "16px 12px" }}>
                              <strong>
                                {formatCurrency(structure.basic_salary)}
                              </strong>
                            </td>
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
                              {formatCurrency(
                                structure.professional_tax || 200,
                              )}
                            </td>
                            <td style={{ padding: "16px 12px" }}>
                              <div className="d-flex align-items-center gap-1">
                                <FaCalendarAlt
                                  size={12}
                                  className="text-muted"
                                />
                                <span>
                                  {formatDate(structure.effective_from)}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "16px 12px" }}>
                              <div className="action-dropdown">
                                <button
                                  className="action-trigger"
                                  onClick={() =>
                                    setSalaryActiveDropdown(
                                      salaryActiveDropdown === structure.id
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

                                {salaryActiveDropdown === structure.id && (
                                  <div className="dropdown-menu-custom-salary">
                                    <button
                                      onClick={() => {
                                        setSalaryActiveDropdown(null);
                                        handleViewSalaryStructure(structure.id);
                                      }}
                                      className="dropdown-item-custom-salary"
                                    >
                                      <FaEye
                                        style={{
                                          color: "#4361ee",
                                          fontSize: "14px",
                                        }}
                                      />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSalaryActiveDropdown(null);
                                        handleDeleteSalaryStructure(
                                          structure.id,
                                          structure.staff_name,
                                        );
                                      }}
                                      className="dropdown-item-custom-salary delete"
                                    >
                                      <FaTrash
                                        style={{
                                          color: "#dc3545",
                                          fontSize: "14px",
                                        }}
                                      />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredSalaryStructures.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center py-5">
                              <div className="py-4">
                                <FaSearch
                                  size={40}
                                  className="text-muted mb-3"
                                />
                                <h5 className="text-muted">
                                  No salary structures found
                                </h5>
                                <p className="text-muted small">
                                  Try adjusting your search or create a new
                                  salary structure
                                </p>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setSalarySearchTerm("")}
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
              {salaryPagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <small className="text-muted">
                      Showing{" "}
                      {(salaryPagination.page - 1) * salaryPagination.limit + 1}{" "}
                      to{" "}
                      {Math.min(
                        salaryPagination.page * salaryPagination.limit,
                        salaryPagination.total,
                      )}{" "}
                      of {salaryPagination.total} entries
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={salaryPagination.page === 1}
                      onClick={() =>
                        setSalaryPagination({
                          ...salaryPagination,
                          page: salaryPagination.page - 1,
                        })
                      }
                    >
                      Previous
                    </Button>
                    <span className="align-self-center px-3">
                      Page {salaryPagination.page} of{" "}
                      {salaryPagination.totalPages}
                    </span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={
                        salaryPagination.page === salaryPagination.totalPages
                      }
                      onClick={() =>
                        setSalaryPagination({
                          ...salaryPagination,
                          page: salaryPagination.page + 1,
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
        
        .action-dropdown { position: relative; }
        .action-trigger { color: #64748b; transition: all 0.2s; }
        .action-trigger:hover { color: #1e293b; background-color: #f1f5f9; }
        
        .dropdown-menu-custom-salary {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          min-width: 80px;
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
        
        .dropdown-item-custom-salary {
          display: flex;
          justify-content: center;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: white;
          cursor: pointer;
          transition: background-color 0.2s;
          border-radius: 6px;
        }
        
        .dropdown-item-custom-salary:hover { background-color: #f8fafc; }
        .dropdown-item-custom-salary.delete:hover { background-color: #fef2f2; }
        
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Container>
  );
};

// ============================================
// Sub-Components
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

const ActionDropdown = ({
  isPaid,
  onView,
  onProcess,
  onDownload,
  onDelete,
  active,
  onToggle,
}) => (
  <div className="action-dropdown">
    <button className="action-trigger" onClick={onToggle}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="6" r="2" fill="currentColor" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="12" cy="18" r="2" fill="currentColor" />
      </svg>
    </button>
    {active && (
      <div className="dropdown-menu-custom">
        <button
          onClick={() => {
            onToggle();
            onView();
          }}
          className="dropdown-item-custom"
        >
          <FaEye style={{ color: "#4361ee" }} />
        </button>
        {!isPaid && (
          <button
            onClick={() => {
              onToggle();
              onProcess();
            }}
            className="dropdown-item-custom"
          >
            <FaMoneyBillWave style={{ color: "#ff9800" }} />
          </button>
        )}
        <button
          onClick={() => {
            onToggle();
            onDownload();
          }}
          className="dropdown-item-custom"
        >
          <FaDownload style={{ color: "#4caf50" }} />
        </button>
        <button
          onClick={() => {
            onToggle();
            onDelete();
          }}
          className="dropdown-item-custom delete"
        >
          <FaTrash style={{ color: "#dc3545" }} />
        </button>
      </div>
    )}
    <style>{`
      .action-dropdown { position: relative; }
      .action-trigger { color: #64748b; width: 28px; height: 28px; padding: 0; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; border-radius: 6px; }
      .action-trigger:hover { background-color: #f1f5f9; }
      .dropdown-menu-custom { position: absolute; top: 100%; right: 0; margin-top: 4px; min-width: 50px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 1000; display: flex; flex-direction: column; gap: 2px; padding: 4px; }
      .dropdown-item-custom { display: flex; justify-content: center; width: 100%; padding: 6px 8px; border: none; background: white; cursor: pointer; border-radius: 4px; }
      .dropdown-item-custom:hover { background-color: #f8fafc; }
      .dropdown-item-custom.delete:hover { background-color: #fef2f2; }
    `}</style>
  </div>
);

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

export default PayrollList;
