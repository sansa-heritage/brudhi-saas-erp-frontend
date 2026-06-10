import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Tabs,
  Tab,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaCreditCard,
  FaFileInvoice,
  FaCalendarAlt,
  FaUserCircle,
  FaIdCard,
  FaHashtag,
  FaMoneyBill,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
  FaCity,
  FaMapPin,
  FaLandmark,
  FaUserTag,
  FaMobileAlt,
  FaCode,
  FaMoneyBillWave,
  FaWallet,
  FaInfoCircle,
  FaExclamationTriangle,
  FaBriefcase,
  FaRupeeSign,
} from "react-icons/fa";
import {
  getStaffById,
  deleteStaff,
} from "../../components/services/staffService";
import Swal from "sweetalert2";

// Status color mapping - MATCHING STAFFMANAGEMENT PAGE
const statusConfig = {
  active: { bg: "#ECFDF3", color: "#027A48", label: "Active" },
  inactive: { bg: "#FFDCE2", color: "#F94765", label: "Inactive" },
};

// Role color mapping - MATCHING STAFFMANAGEMENT PAGE
const roleConfig = {
  1: { bg: "#D3EAFF", color: "#437EF7", label: "Admin" },
  2: { bg: "#FFE0CB", color: "#FF8532", label: "Accounts" },
  3: { bg: "#FEF6D7", color: "#FED229", label: "Store Manager" },
  4: { bg: "#ECFDF3", color: "#027A48", label: "Staff" },
};

const ViewStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validation helper functions
  const validateEmail = (email) => {
    if (!email) return { isValid: null, message: "Not provided" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return { isValid: true, message: "Valid Email" };
    }
    return { isValid: false, message: "Invalid Email Format" };
  };

  const validatePhone = (phone) => {
    if (!phone) return { isValid: null, message: "Not provided" };
    const phoneRegex = /^[6-9]\d{9}$/;
    if (phoneRegex.test(phone)) {
      return { isValid: true, message: "Valid Mobile Number" };
    }
    return { isValid: false, message: "Invalid Mobile Number" };
  };

  const getValidationIcon = (validation) => {
    if (validation.isValid === null) {
      return <FaInfoCircle className="text-secondary ms-2" size={14} title={validation.message} />;
    }
    if (validation.isValid) {
      return <FaCheckCircle className="text-success ms-2" size={14} title={validation.message} />;
    }
    return <FaExclamationTriangle className="text-danger ms-2" size={14} title={validation.message} />;
  };

  useEffect(() => {
    loadStaff();
  }, [id]);

  const loadStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStaffById(id);
      console.log("Staff data:", data);

      if (data) {
        const transformedStaff = {
          id: data.id,
          staff_code: data.staff_code,
          employee_id: data.employee_id,
          first_name: data.first_name,
          last_name: data.last_name,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email,
          phone: data.phone,
          department: data.department,
          designation: data.designation,
          joining_date: data.joining_date,
          joiningDate: data.joining_date ? new Date(data.joining_date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }) : 'N/A',
          role_id: data.role_id,
          role_name: data.role_name,
          status: data.status,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zip_code: data.zip_code,
          profile_image: data.profile_image,
          email_verified: data.email_verified === 1,
          salary: data.salary || 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
          created_by: data.created_by,
        };
        setStaff(transformedStaff);
      } else {
        setStaff(null);
      }
    } catch (error) {
      console.error("Failed to load staff:", error);
      setError(error.response?.data?.message || "Failed to load staff details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete staff member "${staff?.name}"?`,
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
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Staff member has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/staffs");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete staff member",
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.active;
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role_id, role_name) => {
    const config = roleConfig[role_id] || { bg: "#F3F4F6", color: "#1e293b", label: role_name || "Staff" };
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const emailValidation = validateEmail(staff?.email);
  const phoneValidation = validatePhone(staff?.phone);

  if (loading) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading staff details...</h5>
        </div>
      </Container>
    );
  }

  if (error || !staff) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <Alert variant="secondary" className="text-center">
          <h4>Staff member not found</h4>
          <p>{error || "The staff member you're looking for doesn't exist."}</p>
          <Button variant="secondary" onClick={() => navigate("/staffs")}>
            Back to Staffs
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            {staff.name}
          </h2>
          {/* <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
            <span className="text-muted" style={{ fontSize: "13px" }}>
              <FaCode size={12} className="me-1" /> Code: {staff.staff_code || `STF-${String(staff.id).padStart(6, "0")}`}
            </span>
            <span>•</span>
            {getRoleBadge(staff.role_id, staff.role_name)}
            {getStatusBadge(staff.status)}
          </div> */}
        </div>
        <div className="d-flex gap-2">
          <Button
            onClick={() => navigate(`/staffs/edit/${staff.id}`)}
            style={{
              backgroundColor: "rgb(30, 58, 111)",
              border: "none",
              borderRadius: "30px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaEdit size={14} /> Edit
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3 px-4">
          <Tabs
            defaultActiveKey="overview"
            className="border-0 gap-2"
            style={{ borderBottom: "2px solid #e9ecef" }}
          >
            <Tab
              eventKey="overview"
              title={
                <span className="fw-semibold">
                  <FaUserCircle className="me-2" /> Overview
                </span>
              }
              tabClassName="border-0"
            >
              <div className="p-3">
                {/* Personal Information Section */}
                <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaUser className="me-2" /> Personal Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>First Name</small>
                      <strong>{staff.first_name}</strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Last Name</small>
                      <strong>{staff.last_name || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Staff Code</small>
                      <strong>{staff.staff_code || `STF-${String(staff.id).padStart(6, "0")}`}</strong>
                    </div>
                  </Col>
                </Row>

                {/* Contact Information Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaPhone className="me-2" /> Contact Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Email Address</small>
                      <div className="d-flex align-items-center">
                        <strong>{staff.email || "N/A"}</strong>
                        {getValidationIcon(emailValidation)}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Phone Number</small>
                      <div className="d-flex align-items-center">
                        <strong>{staff.phone || "N/A"}</strong>
                        {getValidationIcon(phoneValidation)}
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Employment Information Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaBriefcase className="me-2" /> Employment Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Designation</small>
                      <strong>{staff.designation || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Department</small>
                      <strong>{staff.department || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Joining Date</small>
                      <strong>{staff.joiningDate}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Employee ID</small>
                      <strong>{staff.employee_id || "N/A"}</strong>
                    </div>
                  </Col>
                </Row>

                {/* Financial Information Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaRupeeSign className="me-2" /> Financial Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Salary</small>
                      <strong>{formatCurrency(staff.salary)}</strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Role / Access Level</small>
                      <div>{getRoleBadge(staff.role_id, staff.role_name)}</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Status</small>
                      <div>{getStatusBadge(staff.status)}</div>
                    </div>
                  </Col>
                </Row>

                {/* Address Information Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaMapMarkerAlt className="me-2" /> Address Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={12}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Full Address</small>
                      <strong>{staff.address || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Country</small>
                      <strong>{staff.country || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>State</small>
                      <strong>{staff.state || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>City</small>
                      <strong>{staff.city || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Zip Code</small>
                      <strong>{staff.zip_code || "N/A"}</strong>
                    </div>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab
              eventKey="documents"
              title={
                <span className="fw-semibold">
                  <FaFileInvoice className="me-2" /> Documents
                </span>
              }
            >
              <div className="p-5 text-center">
                <FaFileInvoice size={60} className="text-muted mb-3" />
                <h5 className="text-muted">No documents found</h5>
                <p className="text-muted small">Documents will appear here once added</p>
              </div>
            </Tab>
          </Tabs>
        </Card.Header>
      </Card>

      <style>{`
        .nav-tabs {
          border-bottom: none !important;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 10px 16px;
          font-size: 14px;
          transition: all 0.2s;
          border-radius: 30px;
          margin-right: 8px;
        }
        .nav-tabs .nav-link:hover {
          color: rgb(30, 58, 111);
          background: #f1f5f9;
        }
        .nav-tabs .nav-link.active {
          color: rgb(30, 58, 111);
          background: #eef2ff;
          border: none;
        }
        .rounded-3 {
          border-radius: 12px !important;
        }
      `}</style>
    </Container>
  );
};

export default ViewStaff;