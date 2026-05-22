// src/components/Profile/ChangePassword.js (Fixed - send confirm_password to backend)
import React, { useState } from "react";
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner, 
  Row, 
  Col 
} from "react-bootstrap";
import { 
  FaLock, 
  FaKey, 
  FaSave, 
  FaArrowLeft, 
  FaHome, 
  FaShieldAlt 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/tenant/auth.api";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    // Clear specific field error when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: null,
      });
    }
    // Clear general error when user makes changes
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!passwordData.current_password) {
      errors.current_password = "Current password is required";
    }

    if (!passwordData.new_password) {
      errors.new_password = "New password is required";
    } else if (passwordData.new_password.length < 6) {
      errors.new_password = "Password must be at least 6 characters";
    }

    if (!passwordData.confirm_password) {
      errors.confirm_password = "Please confirm your password";
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send ALL THREE fields to backend (including confirm_password)
      const response = await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,  // Added this field
      });
      
      setSuccess("Password changed successfully!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      // Enhanced error handling to show validation errors from backend
      if (err.response?.data?.errors) {
        // Handle validation errors array
        const backendErrors = err.response.data.errors;
        const formattedErrors = {};
        
        backendErrors.forEach(error => {
          // Map backend error messages to form fields
          if (error.message.toLowerCase().includes("current password")) {
            formattedErrors.current_password = error.message;
          } else if (error.message.toLowerCase().includes("new password")) {
            formattedErrors.new_password = error.message;
          } else if (error.message.toLowerCase().includes("confirm") || 
                     error.message.toLowerCase().includes("match")) {
            formattedErrors.confirm_password = error.message;
          } else {
            // If can't map, show as general error
            setError(error.message);
          }
        });
        
        if (Object.keys(formattedErrors).length > 0) {
          setValidationErrors(formattedErrors);
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Back Button - Like Customers page */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none d-flex align-items-center"
          onClick={() => navigate("/profile")}
          style={{ color: "#6c757d" }}
        >
          <FaArrowLeft className="me-1" /> Back to Profile
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

      {/* Header Section - Like Customers page */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            <FaLock className="me-2" /> Change Password
          </h2>
          <p className="text-muted mb-0">Update your password to keep your account secure</p>
        </div>
      </div>

      {/* Password Form Card */}
      <Row className="justify-content-center">
        <Col lg={6} xl={5}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                  {success}
                </Alert>
              )}

              <div className="text-center mb-4">
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "#e8f0fe",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaShieldAlt size={35} style={{ color: "#6c757d" }} />
                </div>
                <h5 className="mt-3 mb-0">Password Security</h5>
                <small className="text-muted">Use a strong password for better security</small>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    isInvalid={!!validationErrors.current_password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.current_password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handleChange}
                    placeholder="Enter new password (min. 6 characters)"
                    isInvalid={!!validationErrors.new_password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.new_password}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    isInvalid={!!validationErrors.confirm_password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.confirm_password}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password strength indicator */}
                {passwordData.new_password && passwordData.new_password.length > 0 && (
                  <div className="mb-4">
                    <small className="text-muted">Password strength:</small>
                    <div className="mt-1">
                      <div 
                        style={{
                          height: "4px",
                          width: "100%",
                          backgroundColor: "#e9ecef",
                          borderRadius: "2px",
                          overflow: "hidden"
                        }}
                      >
                        <div 
                          style={{
                            height: "100%",
                            width: `${Math.min((passwordData.new_password.length / 20) * 100, 100)}%`,
                            backgroundColor: 
                              passwordData.new_password.length < 6 ? "#dc3545" :
                              passwordData.new_password.length < 8 ? "#ffc107" :
                              "#28a745",
                            transition: "width 0.3s ease"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex gap-3 mt-4">
                  <Button 
                    type="submit" 
                    variant="secondary" 
                    disabled={loading}
                    className="flex-grow-1 rounded-pill py-2"
                    style={{ backgroundColor: "#6c757d", border: "none" }}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/profile")}
                    className="rounded-pill px-4"
                  >
                    Cancel
                  </Button>
                </div>
              </Form>

              <div className="mt-4 pt-3 border-top">
                <small className="text-muted d-block text-center">
                  <FaShieldAlt className="me-1" size={12} />
                  For security, avoid using easily guessable passwords
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
        .form-control:focus {
          border-color: #6c757d;
          box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
        }
      `}</style>
    </Container>
  );
};

export default ChangePassword;