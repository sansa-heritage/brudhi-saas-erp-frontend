// src/pages/MyProfile.js - Complete with Edit and Cancel Buttons
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
  FaSave,
  FaEdit,
  FaArrowLeft,
  FaCamera,
  FaUserCircle,
  FaCheckCircle,
  FaTimesCircle,
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
    mobile: "",
    role: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [originalProfile, setOriginalProfile] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      console.log("Profile response:", response);

      const responseData = response?.data || response;

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
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

      const response = await updateProfile(profileData, selectedImage);
      console.log("Update response:", response);

      await fetchProfile();
      setSelectedImage(null);
      setImagePreview(null);

      toast.success("✅ Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to update profile";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setProfile(originalProfile);
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
    toast.info("Edit cancelled");
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  if (loading) {
    return (
      <Container
        fluid
        className="p-4"
        style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}
      >
        <ToastContainer
          position="top-right"
          theme="colored"
          transition={Bounce}
        />
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3 text-muted">Loading profile...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="px-4 py-4"
      style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      {/* Profile Card */}
      <Row className="justify-content-center">
        <Col lg={10} xl={9} xxl={10}>
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Card Header with Gradient */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "30px",
                color: "white",
              }}
            >
              <div>
                <h3 className="mb-1 fw-bold">Profile Information</h3>
                <p className="mb-0 opacity-75">
                  View and manage your personal details
                </p>
              </div>
            </div>

            <Card.Body className="p-4 p-lg-5">
              {error && (
                <Alert
                  variant="danger"
                  onClose={() => setError(null)}
                  dismissible
                  className="rounded-3 mb-4"
                >
                  <FaTimesCircle className="me-2" /> {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* Left Column - Avatar */}
                  <Col md={4} className="text-center mb-4 mb-md-0">
                    <div className="position-relative d-inline-block">
                      <div
                        style={{
                          width: "150px",
                          height: "150px",
                          borderRadius: "50%",
                          background: imagePreview
                            ? "none"
                            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "64px",
                          margin: "0 auto",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                          overflow: "hidden",
                          cursor: editMode ? "pointer" : "default",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (editMode)
                            e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                        onClick={() =>
                          editMode &&
                          document.getElementById("profileImageInput").click()
                        }
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : profile.name ? (
                          <span
                            style={{ fontSize: "64px", fontWeight: "bold" }}
                          >
                            {profile.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <FaUserCircle size={80} />
                        )}
                      </div>
                      {editMode && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-circle position-absolute"
                          style={{
                            bottom: "5px",
                            right: "5px",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            padding: "0",
                            backgroundColor: "#667eea",
                            border: "2px solid white",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#764ba2";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#667eea";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                          onClick={() =>
                            document.getElementById("profileImageInput").click()
                          }
                        >
                          <FaCamera size={14} />
                        </Button>
                      )}
                      <input
                        type="file"
                        id="profileImageInput"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                        disabled={!editMode}
                      />
                    </div>
                    <h5 className="mt-3 mb-1 fw-bold">
                      {profile.name || "User"}
                    </h5>
                    <span
                      className="badge px-3 py-2 rounded-pill"
                      style={{
                        backgroundColor: "#e9ecef",
                        color: "#667eea",
                        fontWeight: "500",
                      }}
                    >
                      {profile.role || "Role"}
                    </span>
                  </Col>

                  {/* Right Column - Form Fields */}
                  <Col md={8}>
                    {/* Name Field */}
                    <div className="mb-4">
                      <Form.Label className="fw-semibold mb-2">
                        <FaUser className="me-2" style={{ color: "#667eea" }} />{" "}
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profile.name || ""}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={!editMode ? "bg-light" : ""}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 15px",
                          border: editMode
                            ? "2px solid #667eea"
                            : "1px solid #e0e0e0",
                          transition: "all 0.3s ease",
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email Field */}
                    <div className="mb-4">
                      <Form.Label className="fw-semibold mb-2">
                        <FaEnvelope
                          className="me-2"
                          style={{ color: "#667eea" }}
                        />{" "}
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profile.email || ""}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={!editMode ? "bg-light" : ""}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 15px",
                          border: editMode
                            ? "2px solid #667eea"
                            : "1px solid #e0e0e0",
                          transition: "all 0.3s ease",
                        }}
                        placeholder="Enter your email address"
                      />
                    </div>

                    {/* Mobile Field */}
                    <div className="mb-4">
                      <Form.Label className="fw-semibold mb-2">
                        <FaPhone
                          className="me-2"
                          style={{ color: "#667eea" }}
                        />{" "}
                        Mobile Number
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="mobile"
                        value={profile.mobile || ""}
                        onChange={handleChange}
                        disabled={!editMode}
                        className={!editMode ? "bg-light" : ""}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 15px",
                          border: editMode
                            ? "2px solid #667eea"
                            : "1px solid #e0e0e0",
                          transition: "all 0.3s ease",
                        }}
                        placeholder="Enter your mobile number"
                      />
                    </div>

                    {/* Role Field */}
                    <div className="mb-4">
                      <Form.Label className="fw-semibold mb-2">
                        <FaUser className="me-2" style={{ color: "#667eea" }} />{" "}
                        Role
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={profile.role || ""}
                        disabled
                        className="bg-light"
                        style={{
                          borderRadius: "12px",
                          padding: "12px 15px",
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #e0e0e0",
                        }}
                      />
                      <Form.Text className="text-muted mt-2 d-block">
                        <FaCheckCircle
                          className="me-1"
                          style={{ color: "#28a745", fontSize: "12px" }}
                        />
                        Role cannot be changed. Contact administrator for role
                        changes.
                      </Form.Text>
                    </div>
                  </Col>
                </Row>

                {/* Action Buttons - At the BOTTOM of the form */}
                {!editMode ? (
                  <div
                    className="d-flex justify-content-end mt-4 pt-3"
                    style={{ borderTop: "1px solid #e9ecef" }}
                  >
                    <Button
                      onClick={handleEditClick}
                      className="rounded-pill px-5 py-2 fw-semibold"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        color: "white",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.9";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <FaEdit className="me-2" /> Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div
                    className="d-flex gap-3 mt-4 pt-3"
                    style={{ borderTop: "1px solid #e9ecef" }}
                  >
                    <Button
                      variant="light"
                      onClick={handleCancel}
                      className="rounded-pill px-4 py-2 fw-semibold flex-grow-1"
                      style={{
                        border: "2px solid #dc3545",
                        color: "#dc3545",
                        backgroundColor: "white",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#dc3545";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#dc3545";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.color = "#dc3545";
                        e.currentTarget.style.borderColor = "#dc3545";
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="light"
                      type="submit"
                      disabled={saving}
                      className="rounded-pill px-4 py-2 fw-semibold flex-grow-1"
                      style={{
                        border: "2px solid #28a745",
                        color: "#28a745",
                        backgroundColor: "white",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#28a745";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#28a745";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.color = "#28a745";
                        e.currentTarget.style.borderColor = "#28a745";
                      }}
                    >
                      {saving ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
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
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .rounded-4 {
          border-radius: 1rem !important;
        }
        
        .form-control:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }
        
        .form-control.bg-light:disabled {
          background-color: #f8f9fa !important;
          opacity: 1;
        }
        
        .btn:focus {
          box-shadow: none !important;
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #764ba2;
        }
        
        /* Animation for card */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card {
          animation: fadeInUp 0.5s ease-out;
        }
        
        /* Hover effect for form controls */
        .form-control:not(:disabled):hover {
          border-color: #667eea;
        }
      `}</style>
    </Container>
  );
};

export default MyProfile;
