import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Table,
  Tabs,
  Tab,
  Alert,
  Modal,
  Spinner,
  Image,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaMapMarker,
  FaBuilding,
  FaCalendarAlt,
  FaUser,
  FaBriefcase,
  FaIdCard,
  FaHome,
  FaFolderOpen,
  FaRegFileAlt,
  FaRegClock,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
  FaCity,
  FaMapPin,
  FaUserTag,
  FaCode,
  FaRegCalendarAlt,
  FaMapMarkerAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { getStaffById, deleteStaff } from "../../components/services/staffService";

const ViewStaff = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadStaff();
  }, [id]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await getStaffById(id);
      console.log("Staff data:", data);
      
      if (data) {
        const transformedStaff = {
          id: data.id,
          staff_code: data.staff_code,
          employee_id: data.employee_id,
          tenant_id: data.tenant_id,
          first_name: data.first_name,
          last_name: data.last_name,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email,
          phone: data.phone,
          department: data.department,
          designation: data.designation,
          joining_date: data.joining_date,
          joiningDate: data.joining_date ? new Date(data.joining_date).toLocaleDateString() : 'N/A',
          role_id: data.role_id,
          role_name: data.role_name,
          role: data.role_id === 1 ? 'admin' : data.role_id === 2 ? 'accounts' : data.role_id === 3 ? 'store' : 'staff',
          status: data.status,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zip_code: data.zip_code,
          profile_image: data.profile_image,
          email_verified: data.email_verified === 1,
          last_login: data.last_login,
          last_login_ip: data.last_login_ip,
          created_by: data.created_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
          deleted_at: data.deleted_at,
          salary: data.salary || 0,
          staffId: data.staff_code,
        };
        setStaff(transformedStaff);
      } else {
        setStaff(null);
      }
    } catch (error) {
      console.error("Failed to load staff:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load staff details',
        confirmButtonColor: '#4361ee'
      });
      setStaff(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    
    const result = await Swal.fire({
      title: 'Confirm Delete',
      text: 'Are you sure you want to delete this staff member?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4361ee',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteStaff(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Staff member deleted successfully!',
          timer: 1500,
          showConfirmButton: false
        });
        navigate("/staffs");
      } catch (error) {
        console.error("Failed to delete staff:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete staff member',
          confirmButtonColor: '#4361ee'
        });
      }
    }
  };

  const getRoleBadge = (role_id, role_name) => {
    const roles = {
      1: { text: "Admin", color: "#dc3545" },
      2: { text: "Accounts", color: "#17a2b8" },
      3: { text: "Store Manager", color: "#28a745" },
      4: { text: "Sales Staff", color: "#6c757d" },
    };
    const r = roles[role_id] || { text: role_name || "Staff", color: "#6c757d" };
    return (
      <span 
        style={{ 
          padding: "6px 12px", 
          borderRadius: "20px", 
          fontWeight: "500",
          backgroundColor: r.color,
          color: "white",
          display: "inline-block",
          fontSize: "12px"
        }}
      >
        {r.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <span 
        style={{ 
          padding: "6px 12px", 
          borderRadius: "20px", 
          fontWeight: "500",
          backgroundColor: "hsl(227, 81%, 42%)",
          color: "white",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px"
        }}
      >
        <FaCheckCircle size={12} /> Active
      </span>
    ) : (
      <span 
        style={{ 
          padding: "6px 12px", 
          borderRadius: "20px", 
          fontWeight: "500",
          backgroundColor: "#dc3545",
          color: "white",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px"
        }}
      >
        <FaTimesCircle size={12} /> Inactive
      </span>
    );
  };

  const getEmailVerifiedBadge = (verified) => {
    return verified ? (
      <span 
        style={{ 
          backgroundColor: "#28a745", 
          borderRadius: "50px", 
          padding: "4px 10px",
          fontSize: "10px",
          color: "white",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        <FaCheckCircle size={10} /> Verified
      </span>
    ) : (
      <span 
        style={{ 
          backgroundColor: "#ffc107", 
          borderRadius: "50px", 
          padding: "4px 10px",
          fontSize: "10px",
          color: "#000",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        Unverified
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const handleGoBack = () => {
    navigate("/staffs");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">Loading staff details...</h4>
        </div>
      </Container>
    );
  }

  if (!staff) {
    return (
      <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <Alert variant="danger" className="text-center">
          <h5>Staff Member Not Found</h5>
          <p>The staff member you're looking for doesn't exist.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate("/staffs")}
            style={{ backgroundColor: "#4361ee", border: "none" }}
          >
            Back to Staff
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Back Button */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={handleGoBack}
          style={{
            background: "none",
            border: "none",
            color: "#6c757d",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(67, 97, 238, 0.08)";
            e.currentTarget.style.color = "#4361ee";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#6c757d";
          }}
        >
          <FaArrowLeft style={{ marginRight: "6px" }} /> Back to Staff
        </button>
        <button
          onClick={handleDashboard}
          style={{
            background: "transparent",
            border: "1px solid #6c757d",
            color: "#6c757d",
            borderRadius: "50px",
            padding: "6px 16px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#6c757d";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#6c757d";
          }}
        >
          <FaHome style={{ marginRight: "6px" }} /> Dashboard
        </button>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontWeight: "bold", marginBottom: "4px", color: "#1a1a2e" }}>Staff Details</h2>
          <p style={{ color: "#6c757d", marginBottom: 0 }}>View complete information about staff member</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate(`/staffs/edit/${staff.id}`)}
            style={{
              backgroundColor: "#4361ee",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3451c4"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4361ee"}
          >
            <FaEdit /> Edit Profile
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              backgroundColor: "#dc3545",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Staff Info Header Card */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "12px", 
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: "24px",
        padding: "24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          {staff.profile_image && (
            <img
              src={staff.profile_image}
              alt={staff.name}
              style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "50%", border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            />
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
              <h3 style={{ fontWeight: "bold", marginBottom: 0, color: "#1a1a2e" }}>{staff.name}</h3>
              <span style={{ 
                backgroundColor: "#6c757d", 
                padding: "6px 12px", 
                borderRadius: "20px", 
                fontWeight: "500",
                color: "white",
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <FaCode size={12} /> {staff.staff_code}
              </span>
              {getStatusBadge(staff.status)}
            </div>
            <p style={{ color: "#6c757d", marginBottom: 0 }}>
              <FaBriefcase style={{ marginRight: "8px" }} />
              {staff.designation} • {staff.department} Department
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "white", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)", padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <small style={{ color: "#6c757d", fontSize: "11px" }}>Staff Code</small>
              <h6 style={{ marginBottom: 0, fontWeight: "bold", fontSize: "16px" }}>{staff.staff_code}</h6>
            </div>
            <div style={{ backgroundColor: "#e3f2fd", padding: "8px", borderRadius: "10px" }}>
              <FaIdCard size={18} style={{ color: "#4361ee" }} />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: "white", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)", padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <small style={{ color: "#6c757d", fontSize: "11px" }}>Employee ID</small>
              <h6 style={{ marginBottom: 0, fontWeight: "bold", fontSize: "16px" }}>{staff.employee_id || "N/A"}</h6>
            </div>
            <div style={{ backgroundColor: "#e8f5e9", padding: "8px", borderRadius: "10px" }}>
              <FaRegCalendarAlt size={18} style={{ color: "#2e7d32" }} />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: "white", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)", padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <small style={{ color: "#6c757d", fontSize: "11px" }}>Joining Date</small>
              <h6 style={{ marginBottom: 0, fontWeight: "bold", fontSize: "16px" }}>{staff.joiningDate}</h6>
            </div>
            <div style={{ backgroundColor: "#fff3e0", padding: "8px", borderRadius: "10px" }}>
              <FaCalendarAlt size={18} style={{ color: "#ff9800" }} />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: "white", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)", padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <small style={{ color: "#6c757d", fontSize: "11px" }}>Role</small>
              <h6 style={{ marginBottom: 0, fontWeight: "bold", fontSize: "16px" }}>{staff.role_name || "Staff"}</h6>
            </div>
            <div style={{ backgroundColor: "#e8f5e9", padding: "8px", borderRadius: "10px" }}>
              <FaUserTag size={18} style={{ color: "#2e7d32" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "8px", borderBottom: "none" }}>
          {["overview", "documents", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => {}}
              style={{
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "500",
                transition: "all 0.2s",
                cursor: "pointer",
                backgroundColor: "transparent",
                color: "#6c757d"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e9ecef";
                e.currentTarget.style.color = "#4361ee";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#6c757d";
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Content */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "24px", marginTop: "16px" }}>
        {/* Personal Information */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "24px" }}>
          <h6 style={{ fontWeight: "bold", marginBottom: "16px", color: "hsl(227, 81%, 42%)" }}>
            <FaUser style={{ marginRight: "8px" }} /> Personal Information
          </h6>
          <hr style={{ margin: "0 0 16px 0" }} />
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>First Name</small>
            <p style={{ fontWeight: "600", marginBottom: 0 }}>{staff.first_name}</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Last Name</small>
            <p style={{ fontWeight: "600", marginBottom: 0 }}>{staff.last_name || "N/A"}</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Full Name</small>
            <p style={{ fontWeight: "600", marginBottom: 0 }}>{staff.name}</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Email Address</small>
            <p style={{ marginBottom: 0 }}>
              <FaEnvelope style={{ marginRight: "8px", color: "#6c757d" }} />
              {staff.email}
              <span style={{ marginLeft: "8px" }}>{getEmailVerifiedBadge(staff.email_verified)}</span>
            </p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Phone Number</small>
            <p style={{ marginBottom: 0 }}>
              <FaPhone style={{ marginRight: "8px", color: "#6c757d" }} />
              {staff.phone}
            </p>
          </div>
        </div>

        {/* Employment Information */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "24px" }}>
          <h6 style={{ fontWeight: "bold", marginBottom: "16px", color: "hsl(227, 81%, 42%)" }}>
            <FaBriefcase style={{ marginRight: "8px" }} /> Employment Information
          </h6>
          <hr style={{ margin: "0 0 16px 0" }} />
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Staff Code</small>
            <p style={{ fontWeight: "600", marginBottom: 0 }}>{staff.staff_code}</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Employee ID</small>
            <p style={{ marginBottom: 0 }}>{staff.employee_id || "N/A"}</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Designation</small>
            <p style={{ marginBottom: 0 }}>{staff.designation}</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Department</small>
            <p style={{ marginBottom: 0 }}>{staff.department}</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Role / Access Level</small>
            <div style={{ marginTop: "8px" }}>{getRoleBadge(staff.role_id, staff.role_name)}</div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <small style={{ color: "#6c757d" }}>Joining Date</small>
            <p style={{ marginBottom: 0 }}>
              <FaCalendarAlt style={{ marginRight: "8px", color: "#6c757d" }} />
              {staff.joiningDate}
            </p>
          </div>
          <div>
            <small style={{ color: "#6c757d" }}>Status</small>
            <div style={{ marginTop: "8px" }}>{getStatusBadge(staff.status)}</div>
          </div>
        </div>

        {/* Address Information */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "24px", gridColumn: "1 / -1" }}>
          <h6 style={{ fontWeight: "bold", marginBottom: "16px", color: "hsl(227, 81%, 42%)" }}>
            <FaMapMarker style={{ marginRight: "8px" }} /> Address Information
          </h6>
          <hr style={{ margin: "0 0 16px 0" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <div style={{ marginBottom: "16px" }}>
                <small style={{ color: "#6c757d" }}>Address</small>
                <p style={{ marginBottom: 0 }}>{staff.address || "N/A"}</p>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <small style={{ color: "#6c757d" }}>City</small>
                <p style={{ marginBottom: 0 }}>{staff.city || "N/A"}</p>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <small style={{ color: "#6c757d" }}>State</small>
                <p style={{ marginBottom: 0 }}>{staff.state || "N/A"}</p>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: "16px" }}>
                <small style={{ color: "#6c757d" }}>Country</small>
                <p style={{ marginBottom: 0 }}>{staff.country || "N/A"}</p>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <small style={{ color: "#6c757d" }}>Zip Code</small>
                <p style={{ marginBottom: 0 }}>{staff.zip_code || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "24px", gridColumn: "1 / -1" }}>
          <h6 style={{ fontWeight: "bold", marginBottom: "16px", color: "hsl(227, 81%, 42%)" }}>
            <FaRegClock style={{ marginRight: "8px" }} /> System Information
          </h6>
          <hr style={{ margin: "0 0 16px 0" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <div>
              <small style={{ color: "#6c757d" }}>Created By</small>
              <p style={{ marginBottom: 0 }}>{staff.created_by || "System"}</p>
            </div>
            <div>
              <small style={{ color: "#6c757d" }}>Created At</small>
              <p style={{ marginBottom: 0 }}>{formatDate(staff.created_at)}</p>
            </div>
            <div>
              <small style={{ color: "#6c757d" }}>Last Updated</small>
              <p style={{ marginBottom: 0 }}>{formatDate(staff.updated_at)}</p>
            </div>
          </div>
          {staff.last_login && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginTop: "16px" }}>
              <div>
                <small style={{ color: "#6c757d" }}>Last Login</small>
                <p style={{ marginBottom: 0 }}>{formatDate(staff.last_login)}</p>
              </div>
              <div>
                <small style={{ color: "#6c757d" }}>Last Login IP</small>
                <p style={{ marginBottom: 0 }}>{staff.last_login_ip || "N/A"}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title style={{ fontWeight: "bold" }}>
            <FaTrash style={{ marginRight: "8px", color: "#dc3545" }} /> Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete <strong>{staff.name}</strong>?
          </p>
          <Alert variant="danger" style={{ borderRadius: "12px" }}>
            <small>
              This action cannot be undone. All staff data will be permanently removed.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#f8f9fa", borderTop: "none", borderRadius: "12px" }}>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            style={{
              backgroundColor: "#6c757d",
              border: "none",
              borderRadius: "50px",
              padding: "8px 24px",
              color: "white",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            style={{
              backgroundColor: "#dc3545",
              border: "none",
              borderRadius: "50px",
              padding: "8px 24px",
              color: "white",
              cursor: "pointer"
            }}
          >
            Delete Staff
          </button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ViewStaff;