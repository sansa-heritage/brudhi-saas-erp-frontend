// src/components/Profile/ChangePassword.js (Modern Design)
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
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: null,
      });
    }
    if (error) {
      setError(null);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthText = (password) => {
    const strength = getPasswordStrength(password);
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = (password) => {
    const strength = getPasswordStrength(password);
    if (strength === 0) return "#dc3545";
    if (strength === 1) return "#ff6b6b";
    if (strength === 2) return "#ffc107";
    if (strength === 3) return "#20c997";
    return "#28a745";
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
    } else {
      // Check password strength
      const strength = getPasswordStrength(passwordData.new_password);
      if (strength < 2) {
        errors.new_password = "Please use a stronger password (add numbers, uppercase, or special characters)";
      }
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
      const response = await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });
      
      setSuccess("Password changed successfully!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        const formattedErrors = {};
        
        backendErrors.forEach(error => {
          if (error.message.toLowerCase().includes("current password")) {
            formattedErrors.current_password = error.message;
          } else if (error.message.toLowerCase().includes("new password")) {
            formattedErrors.new_password = error.message;
          } else if (error.message.toLowerCase().includes("confirm") || 
                     error.message.toLowerCase().includes("match")) {
            formattedErrors.confirm_password = error.message;
          } else {
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

  const passwordStrength = getPasswordStrength(passwordData.new_password);
  const passwordStrengthText = getPasswordStrengthText(passwordData.new_password);
  const passwordStrengthColor = getPasswordStrengthColor(passwordData.new_password);

  return (
    // <div style={{ 
    //   background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    //   minHeight: "100vh",
    //   padding: "2rem 0"
    // }}>
      <Container>
        {/* Navigation Buttons */}
      

        {/* Main Card */}
        <Row className="justify-content-center">
          <Col lg={7} xl={6}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Header with gradient */}
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "2rem",
                textAlign: "center",
                color: "white"
              }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  backdropFilter: "blur(10px)"
                }}>
                  <FaLock size={40} />
                </div>
                <h2 className="fw-bold mb-2">Change Password</h2>
                <p className="mb-0 opacity-75">Update your password to keep your account secure</p>
              </div>

              <Card.Body className="p-4 p-lg-5">
                {error && (
                  <Alert 
                    variant="danger" 
                    onClose={() => setError(null)} 
                    dismissible
                    className="rounded-3 border-0 shadow-sm"
                  >
                    <FaExclamationTriangle className="me-2" />
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert 
                    variant="success" 
                    onClose={() => setSuccess(null)} 
                    dismissible
                    className="rounded-3 border-0 shadow-sm"
                  >
                    <FaCheckCircle className="me-2" />
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Current Password */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold mb-2">
                      Current Password
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showCurrentPassword ? "text" : "password"}
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handleChange}
                        placeholder="Enter your current password"
                        isInvalid={!!validationErrors.current_password}
                        style={{
                          paddingRight: "45px",
                          borderRadius: "12px",
                          border: "1px solid #e0e0e0",
                          padding: "12px 15px"
                        }}
                      />
                      <Button
                        variant="link"
                        className="position-absolute top-50 end-0 translate-middle-y"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{ textDecoration: "none", color: "#6c757d" }}
                      >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.current_password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* New Password */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold mb-2">
                      New Password
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showNewPassword ? "text" : "password"}
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        isInvalid={!!validationErrors.new_password}
                        style={{
                          paddingRight: "45px",
                          borderRadius: "12px",
                          border: "1px solid #e0e0e0",
                          padding: "12px 15px"
                        }}
                      />
                      <Button
                        variant="link"
                        className="position-absolute top-50 end-0 translate-middle-y"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ textDecoration: "none", color: "#6c757d" }}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.new_password}
                    </Form.Control.Feedback>
                    
                    {/* Password Strength Indicator */}
                    {passwordData.new_password && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">Password Strength:</small>
                          <small style={{ color: passwordStrengthColor, fontWeight: 600 }}>
                            {passwordStrengthText}
                          </small>
                        </div>
                        <div style={{
                          height: "6px",
                          borderRadius: "3px",
                          background: "#e9ecef",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: `${(passwordStrength / 4) * 100}%`,
                            height: "100%",
                            background: passwordStrengthColor,
                            transition: "width 0.3s ease",
                            borderRadius: "3px"
                          }} />
                        </div>
                        <div className="mt-2">
                          <small className="text-muted">
                            Tips: Use at least 8 characters with uppercase, numbers & symbols
                          </small>
                        </div>
                      </div>
                    )}
                  </Form.Group>

                  {/* Confirm Password */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold mb-2">
                      Confirm New Password
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm your new password"
                        isInvalid={!!validationErrors.confirm_password}
                        style={{
                          paddingRight: "45px",
                          borderRadius: "12px",
                          border: "1px solid #e0e0e0",
                          padding: "12px 15px"
                        }}
                      />
                      <Button
                        variant="link"
                        className="position-absolute top-50 end-0 translate-middle-y"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ textDecoration: "none", color: "#6c757d" }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.confirm_password}
                    </Form.Control.Feedback>
                    
                    {/* Match Indicator */}
                    {passwordData.confirm_password && passwordData.new_password && (
                      <div className="mt-2">
                        {passwordData.new_password === passwordData.confirm_password ? (
                          <small className="text-success">
                            <FaCheckCircle className="me-1" /> Passwords match
                          </small>
                        ) : (
                          <small className="text-danger">
                            <FaExclamationTriangle className="me-1" /> Passwords do not match
                          </small>
                        )}
                      </div>
                    )}
                  </Form.Group>

                  {/* Action Buttons */}
                  <div className="d-flex gap-3 mt-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-grow-1 rounded-pill py-3 fw-semibold"
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate("/profile")}
                      className="rounded-pill px-4 py-3"
                      style={{ borderRadius: "50px" }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>

                {/* Security Tips */}
                <div className="mt-5 pt-3 border-top">
                  <h6 className="fw-semibold mb-3">
                    <FaShieldAlt className="me-2" style={{ color: "#667eea" }} />
                    Password Security Tips
                  </h6>
                  <div className="d-flex flex-wrap gap-3">
                    <small className="text-muted">✓ Use at least 8 characters</small>
                    <small className="text-muted">✓ Include uppercase letters</small>
                    <small className="text-muted">✓ Add numbers & symbols</small>
                    <small className="text-muted">✓ Avoid common passwords</small>
                  </div>
                </div>
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
          .btn:focus {
            box-shadow: none !important;
          }
        `}</style>
      </Container>
    // </div>
  );
};

export default ChangePassword;