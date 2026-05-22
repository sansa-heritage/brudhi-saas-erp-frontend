// src/pages/MyProfile.js - Updated with correct field names
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaSave,
  FaEdit,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getProfile, updateProfile } from "../../api/tenant/auth.api";

const MyProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",        // Changed from 'phone' to 'mobile'
    role: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [originalProfile, setOriginalProfile] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);  // ✅ ADD THIS
  const [imagePreview, setImagePreview] = useState(null);    // ✅ ADD THIS

  useEffect(() => {
    fetchProfile();
  }, []);

  // src/pages/MyProfile.js - Fixed fetchProfile
const fetchProfile = async () => {
  try {
    setLoading(true);
    const response = await getProfile();
    console.log("Profile response:", response);
    
    // Handle the nested data structure
    const responseData = response?.data || response;
    
    // The user data is inside responseData["0"] or responseData.data["0"]
    let userData;
    if (responseData["0"]) {
      userData = responseData["0"];
    } else if (responseData.data && responseData.data["0"]) {
      userData = responseData.data["0"];
    } else {
      userData = responseData;
    }
    
    console.log("Extracted user data:", userData);
    
    const newProfile = {
      name: userData.name || "",
      email: userData.email || "",
      mobile: userData.mobile || userData.phone || "",
      role: userData.role || "User",
    };
    
    console.log("Profile data set:", newProfile);
    
    setProfile(newProfile);
    setOriginalProfile(newProfile);
    setError(null);
  } catch (err) {
    console.error("Failed to load profile:", err);
    setError(err.response?.data?.message || "Failed to load profile");
    toast.error("❌ Failed to load profile");
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // In MyProfile.js
const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError(null);

  try {
    // Prepare profile data
    const profileData = {};
    let hasChanges = false;
    
    if (profile.name !== originalProfile.name && profile.name) {
      profileData.name = profile.name;
      hasChanges = true;
    }
    if (profile.mobile !== originalProfile.mobile && profile.mobile) {
      profileData.mobile = profile.mobile;
      hasChanges = true;
    }
    if (profile.email !== originalProfile.email && profile.email) {
      profileData.email = profile.email;
      hasChanges = true;
    }
    
    if (!hasChanges && !selectedImage) {
      toast.info("No changes to update");
      setEditMode(false);
      setSaving(false);
      return;
    }
    
    // Call API with FormData
    const response = await updateProfile(profileData, selectedImage);
    console.log("Update response:", response);
    
    // Refresh profile
    await fetchProfile();
    setSelectedImage(null);
    setImagePreview(null);
    
    toast.success("✅ Profile updated successfully!");
    setEditMode(false);
  } catch (err) {
    console.error("Failed to update profile:", err);
    const errorMsg = err.response?.data?.message || "Failed to update profile";
    setError(errorMsg);
    toast.error(`❌ ${errorMsg}`);
  } finally {
    setSaving(false);
  }
};
  const handleCancel = () => {
    setEditMode(false);
    fetchProfile();
    setError(null);
    setSuccess(null);
    toast.info("Edit cancelled");
  };

  if (loading) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <ToastContainer position="top-right" theme="colored" transition={Bounce} />
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading profile...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" transition={Bounce} />

      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none d-flex align-items-center"
          onClick={() => navigate("/dashboard")}
          style={{ color: "#6c757d" }}
        >
          <FaArrowLeft className="me-1" /> Back to Dashboard
        </Button>
        {/* <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/dashboard")}
        >
          <FaHome className="me-1" /> Dashboard
        </Button> */}
      </div>

      {/* Header Section */}
      <div className="bg-secondary text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaUser className="me-2" /> My Profile
            </h2>
            <p className="mb-0 opacity-75">View and manage your personal information</p>
          </div>
          {!editMode && (
            <Button variant="light" onClick={() => setEditMode(true)} className="rounded-pill px-4">
              <FaEdit className="me-2" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-4 p-lg-5">
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible className="rounded-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* Left Column - Avatar */}
                  <Col md={4} className="text-center mb-4 mb-md-0">
                    <div
                      className="mx-auto"
                      style={{
                        width: "140px",
                        height: "140px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "56px",
                        marginBottom: "16px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      }}
                    >
                      {profile.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <h5 className="mb-1 fw-bold">{profile.name || "User"}</h5>
                    <span className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: "#6c757d", color: "#ffffff" }}>
                      {profile.role || "Role"}
                    </span>
                  </Col>

                  {/* Right Column - Form Fields */}
                  <Col md={8}>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <FaUser className="me-2 text-secondary" /> Full Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={profile.name || ""}
                            onChange={handleChange}
                            disabled={!editMode}
                            className={!editMode ? "bg-light" : ""}
                            style={{ borderRadius: "10px" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <FaEnvelope className="me-2 text-secondary" /> Email Address
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profile.email || ""}
                            onChange={handleChange}
                            disabled={!editMode}
                            className={!editMode ? "bg-light" : ""}
                            style={{ borderRadius: "10px" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <FaPhone className="me-2 text-secondary" /> Mobile Number
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            name="mobile"
                            value={profile.mobile || ""}
                            onChange={handleChange}
                            disabled={!editMode}
                            className={!editMode ? "bg-light" : ""}
                            style={{ borderRadius: "10px" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <FaUser className="me-2 text-secondary" /> Role
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={profile.role || ""}
                            disabled
                            className="bg-light"
                            style={{ borderRadius: "10px" }}
                          />
                          <Form.Text className="text-muted">
                            Role cannot be changed. Contact administrator for role changes.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    {editMode && (
                      <div className="d-flex gap-3 mt-3 justify-content-end">
                        <Button
                          variant="secondary"
                          onClick={handleCancel}
                          className="rounded-pill px-4"
                          style={{ backgroundColor: "#6c757d", border: "none" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="secondary"
                          disabled={saving}
                          className="rounded-pill px-4"
                          style={{ backgroundColor: "#6c757d", border: "none" }}
                        >
                          {saving ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" className="me-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="me-2" /> Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Footer */}
      {/* <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
        <div className="d-flex gap-3">
          <Button variant="link" className="text-decoration-none" onClick={() => navigate("/dashboard")} style={{ color: "#6c757d" }}>
            <FaArrowLeft className="me-1" /> Back to Dashboard
          </Button>
          <Button variant="outline-secondary" size="sm" className="rounded-pill" onClick={() => navigate("/dashboard")}>
            <FaHome className="me-1" /> Dashboard
          </Button>
        </div>
        <small className="text-muted">© {new Date().getFullYear()} GasFlow ERP</small>
      </div> */}

      <style>{`
        .rounded-3 { border-radius: 0.75rem !important; }
        .bg-secondary { background: #6c757d !important; }
        .form-control:focus, .form-select:focus {
          border-color: #6c757d;
          box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
        }
        .form-control.bg-light:disabled {
          background-color: #e9ecef !important;
          opacity: 1;
        }
      `}</style>
    </Container>
  );
};

export default MyProfile;