import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Modal,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBuilding,
  FaShieldAlt,
  FaPercentage,
  FaFilePdf,
  FaRupeeSign,
  FaKey,
  FaEnvelope,
  FaInfoCircle,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";
import apiClient from "../api/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [userType, setUserType] = useState("superadmin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Modal State
  const [showModal, setShowModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubdomain, setForgotSubdomain] = useState("");
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseEmail, setResponseEmail] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      toast.error("Please enter both email and password", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      setLoading(false);
      return;
    }

    if (userType === "tenant" && !subdomain) {
      toast.error("Please enter tenant subdomain", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      setLoading(false);
      return;
    }

    try {
      let requestPayload;
      let endpoint = "/auth/login";

      if (userType === "superadmin") {
        requestPayload = { email, password };
      } else {
        requestPayload = { email, password, subdomain };
      }

      const response = await apiClient.post(endpoint, requestPayload);
      const responseData = response.data;

      let user, token, tenant;

      if (responseData && responseData.success === true && responseData.data) {
        user = responseData.data.user;
        token = responseData.data.token;
        tenant = responseData.data.tenant;
      } else if (responseData && responseData.user && responseData.token) {
        user = responseData.user;
        token = responseData.token;
        tenant = responseData.tenant;
      } else {
        throw new Error(responseData?.message || "Invalid response structure");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);
      localStorage.setItem("userType", userType);

      if (tenant) {
        localStorage.setItem("tenant", JSON.stringify(tenant));
        localStorage.setItem("subdomain", tenant.subdomain || subdomain);
      } else if (subdomain) {
        localStorage.setItem("subdomain", subdomain);
      }

      toast.success(`Welcome back, ${user.name || user.email}!`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Login error details:", err);

      let errorMessage = "Login failed. Please try again.";

      if (err.response) {
        const { status, data } = err.response;
        if (status === 401) {
          errorMessage =
            data.message || "Invalid email or password. Please try again.";
        } else if (status === 403) {
          errorMessage =
            "Your account is not authorized to access this system.";
        } else if (status === 400) {
          errorMessage =
            data.message || "Please check your credentials and try again.";
        } else if (status === 404) {
          errorMessage = "Login service not found. Please contact support.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data.message || "An error occurred. Please try again.";
        }
      } else if (err.request) {
        errorMessage =
          "Cannot connect to server. Please check if the backend is running.";
      } else {
        errorMessage = err.message || "An unexpected error occurred";
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
        transition: Bounce,
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Open Forgot Password Modal - WITH AUTO-DETECTION
  const openForgotPasswordModal = () => {
    // Auto-detect user type based on email and subdomain
    const emailDomain = forgotEmail || email;
    const hasSubdomain = forgotSubdomain || subdomain;

    // If there's a subdomain entered, it must be a tenant user
    if (hasSubdomain && userType !== "tenant") {
      setUserType("tenant");
      toast.info("Switched to Tenant User mode based on subdomain", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    }
    // If email doesn't contain 'superadmin' and there's no subdomain, suggest tenant mode
    else if (
      emailDomain &&
      !emailDomain.includes("superadmin") &&
      !hasSubdomain &&
      userType === "superadmin"
    ) {
      // Show a hint that they might need to select tenant mode
      toast.info(
        "For tenant accounts, please select 'Tenant User' and enter your subdomain",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
        },
      );
    }

    setForgotEmail(email || "");
    setForgotSubdomain(subdomain || "");
    setShowModal(true);
    setEmailSent(false);
    setOtpSent(false);
    setResetStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResponseMessage("");
    setResponseEmail("");
    setTimestamp("");
  };

  // Handle Send OTP - Updated to match backend response exactly
  const handleSendOTP = async () => {
    if (!forgotEmail) {
      toast.error("Please enter your email address", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    if (userType === "tenant" && !forgotSubdomain) {
      toast.error("Please enter your tenant subdomain", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setSending(true);

    try {
      const payload = { email: forgotEmail };
      if (userType === "tenant") {
        payload.subdomain = forgotSubdomain;
      }

      const response = await apiClient.post("/auth/forgot-password", payload);

      // Handle the exact response structure from your backend
      if (response.data.success) {
        setEmailSent(true);

        // Store the response data for display in modal
        setResponseMessage(response.data.message || "OTP sent to your email");
        setResponseEmail(response.data.data?.email || forgotEmail);
        setTimestamp(response.data.timestamp || new Date().toISOString());

        // Show toast with the exact message
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });

        console.log("Reset response:", response.data);

        // In development, show OTP in console if available
        if (process.env.NODE_ENV === "development" && response.data.otp) {
          console.log("🔑 Development OTP:", response.data.otp);
          toast.info(`Development OTP: ${response.data.otp}`, {
            position: "top-right",
            autoClose: 10000,
            theme: "dark",
          });
        }
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      let errorMessage = "Failed to send OTP. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    } finally {
      setSending(false);
    }
  };

  // Handle Verify OTP and Reset Password
  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error("Please enter the OTP", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    if (!newPassword) {
      toast.error("Please enter new password", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setSending(true);

    try {
      const payload = {
        email: forgotEmail,
        otp: otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };

      if (userType === "tenant") {
        payload.subdomain = forgotSubdomain;
      }

      const response = await apiClient.post("/auth/reset-password", payload);

      if (response.data.success) {
        setResetStep(3);
        toast.success(
          "Password reset successful! Please login with your new password.",
          {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
          },
        );

        // Close modal after 3 seconds
        setTimeout(() => {
          handleCloseModal();
          // Pre-fill email in login form
          setEmail(forgotEmail);
          if (userType === "tenant") {
            setSubdomain(forgotSubdomain);
          }
        }, 3000);
      } else {
        throw new Error(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      let errorMessage = "Failed to reset password. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    } finally {
      setSending(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForgotEmail("");
    setForgotSubdomain("");
    setEmailSent(false);
    setOtpSent(false);
    setResetStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResponseMessage("");
    setResponseEmail("");
    setTimestamp("");
  };

  // Handle Resend OTP
  const handleResendOTP = () => {
    setResetStep(1);
    setEmailSent(false);
    setOtp("");
  };

  const renderModalContent = () => {
    // If email sent successfully (Step 1 complete)
    if (emailSent && resetStep === 1) {
      return (
        <div className="text-center py-4">
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              animation: "fadeInUp 0.5s ease",
            }}
          >
            <FaCheckCircle size={45} style={{ color: "white" }} />
          </div>

          {/* Exact message from backend */}
          <h5 className="fw-bold mb-3" style={{ color: "#28a745" }}>
            {responseMessage || "OTP Sent Successfully!"}
          </h5>

          <div
            className="alert alert-success rounded-3"
            style={{ backgroundColor: "#d4edda", border: "none" }}
          >
            <p className="mb-2">
              <strong>📧 Email:</strong> {responseEmail}
            </p>
            <p className="mb-0">
              <small>
                <FaClock className="me-1" size={12} />
                {timestamp
                  ? new Date(timestamp).toLocaleString()
                  : new Date().toLocaleString()}
              </small>
            </p>
          </div>

          <div className="mt-3">
            <p className="text-muted mb-2">
              We've sent a password reset OTP to your email address.
            </p>
            <p className="text-muted small">
              Please check your inbox and enter the OTP to reset your password.
            </p>
            <hr className="my-3" />
            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="outline-primary"
                onClick={() => {
                  setEmailSent(false);
                  setResetStep(1);
                }}
                size="sm"
                className="rounded-pill"
              >
                Edit Email
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setResetStep(2);
                }}
                size="sm"
                className="rounded-pill"
                style={{
                  background:
                    "linear-gradient(135deg, #4361ee 0%, #3454D1 100%)",
                  border: "none",
                }}
              >
                Enter OTP <FaArrowRight className="ms-1" size={12} />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (resetStep) {
      case 1: // Send OTP
        return (
          <>
            <div className="text-center mb-4">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#f0f2ff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <FaEnvelope size={25} style={{ color: "#4361ee" }} />
              </div>
              <p className="text-muted" style={{ fontSize: "0.95rem" }}>
                Enter your email address and we'll send you an OTP to reset your
                password.
              </p>
            </div>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold mb-2">
                  <FaEnvelope
                    className="me-2"
                    size={14}
                    style={{ color: "#4361ee" }}
                  />
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoFocus
                  className="rounded-3 py-2"
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "11px 15px",
                    borderRadius: "10px",
                  }}
                />
              </Form.Group>

              {userType === "tenant" && (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold mb-2">
                    <FaBuilding
                      className="me-2"
                      size={14}
                      style={{ color: "#4361ee" }}
                    />
                    Tenant Subdomain
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your subdomain (e.g., aditya-gas)"
                    value={forgotSubdomain}
                    onChange={(e) =>
                      setForgotSubdomain(e.target.value.toLowerCase())
                    }
                    className="rounded-3 py-2"
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "11px 15px",
                      borderRadius: "10px",
                    }}
                  />
                  <Form.Text className="text-muted d-flex align-items-center mt-2">
                    <FaInfoCircle className="me-1" size={12} />
                    Required for tenant accounts
                  </Form.Text>
                </Form.Group>
              )}
            </Form>

            <div
              className="mt-4 p-3 rounded-3"
              style={{
                backgroundColor: "#f8f9fa",
                borderLeft: "3px solid #4361ee",
              }}
            >
              <small className="text-muted d-block mb-2">
                <FaShieldAlt className="me-2" size={12} />
                <strong>Having trouble?</strong>
              </small>
              <small className="text-muted d-block">
                • Check your spam folder if you don't see the email
              </small>
              <small className="text-muted d-block">
                • Contact your system administrator for subdomain information
              </small>
              <small className="text-muted d-block">
                • Make sure you're using the registered email address
              </small>
            </div>
          </>
        );

      case 2: // Verify OTP and Set New Password
        return (
          <>
            <div className="text-center mb-4">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#f0f2ff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <FaKey size={25} style={{ color: "#4361ee" }} />
              </div>
              <p className="text-muted" style={{ fontSize: "0.95rem" }}>
                Enter the OTP sent to <strong>{forgotEmail}</strong> and set
                your new password.
              </p>
            </div>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold mb-2">OTP Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  autoFocus
                  className="rounded-3 py-2 text-center"
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "11px 15px",
                    borderRadius: "10px",
                    fontSize: "18px",
                    letterSpacing: "2px",
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold mb-2">
                  New Password
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-3 py-2"
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "11px 15px",
                      borderRadius: "10px",
                      paddingRight: "45px",
                    }}
                  />
                  <Button
                    variant="link"
                    className="position-absolute top-50 end-0 translate-middle-y"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ textDecoration: "none", color: "#6c757d" }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold mb-2">
                  Confirm New Password
                </Form.Label>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-3 py-2"
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "11px 15px",
                    borderRadius: "10px",
                  }}
                />
              </Form.Group>
            </Form>

            <div className="mt-3 text-center">
              <Button
                variant="link"
                onClick={handleResendOTP}
                style={{ fontSize: "0.9rem", textDecoration: "none" }}
              >
                ← Didn't receive OTP? Resend
              </Button>
            </div>
          </>
        );

      case 3: // Success
        return (
          <div className="text-center py-4">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
                animation: "fadeInUp 0.5s ease",
              }}
            >
              <FaCheckCircle size={45} style={{ color: "white" }} />
            </div>
            <h5 className="fw-bold mb-3">Password Reset Successful!</h5>
            <p className="text-muted mb-2">
              Your password has been changed successfully.
            </p>
            <p className="text-muted">
              You can now login with your new password.
            </p>
            <div className="alert alert-success rounded-3 mt-3">
              <small>Redirecting to login...</small>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderModalFooter = () => {
    // If email sent but still in step 1, show continue button
    if (emailSent && resetStep === 1) {
      return (
        <div className="d-flex gap-2 w-100">
          <Button
            variant="light"
            onClick={handleCloseModal}
            className="flex-grow-1 rounded-pill py-2"
            style={{ fontWeight: 500 }}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => setResetStep(2)}
            className="flex-grow-1 rounded-pill py-2"
            style={{
              background: "linear-gradient(135deg, #4361ee 0%, #3454D1 100%)",
              border: "none",
              fontWeight: 500,
            }}
          >
            Continue <FaArrowRight className="ms-2" />
          </Button>
        </div>
      );
    }

    switch (resetStep) {
      case 1:
        return (
          <div className="d-flex gap-2 w-100">
            <Button
              variant="light"
              onClick={handleCloseModal}
              className="flex-grow-1 rounded-pill py-2"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendOTP}
              disabled={sending}
              className="flex-grow-1 rounded-pill py-2"
              style={{
                background: "linear-gradient(135deg, #4361ee 0%, #3454D1 100%)",
                border: "none",
                fontWeight: 500,
                boxShadow: "0 4px 15px rgba(67, 97, 238, 0.3)",
              }}
            >
              {sending ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Sending OTP...
                </>
              ) : (
                <>
                  <FaKey className="me-2" />
                  Send OTP
                </>
              )}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="d-flex gap-2 w-100">
            <Button
              variant="light"
              onClick={handleCloseModal}
              className="flex-grow-1 rounded-pill py-2"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleVerifyOTP}
              disabled={sending}
              className="flex-grow-1 rounded-pill py-2"
              style={{
                background: "linear-gradient(135deg, #4361ee 0%, #3454D1 100%)",
                border: "none",
                fontWeight: 500,
                boxShadow: "0 4px 15px rgba(67, 97, 238, 0.3)",
              }}
            >
              {sending ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Resetting Password...
                </>
              ) : (
                <>
                  <FaCheckCircle className="me-2" />
                  Reset Password
                </>
              )}
            </Button>
          </div>
        );

      case 3:
        return (
          <Button
            variant="primary"
            onClick={handleCloseModal}
            className="w-100 rounded-pill py-2"
            style={{
              background: "linear-gradient(135deg, #4361ee 0%, #3454D1 100%)",
              border: "none",
              fontWeight: 500,
            }}
          >
            Close
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />

      <Container fluid className="px-0">
        <Row className="g-0">
          {/* Left Side */}
          <Col
            lg={6}
            className="d-none d-lg-block p-0"
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "50%",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            <div
              className="h-100 d-flex flex-column justify-content-center align-items-center text-center"
              style={{
                background: "#3454D1",
                color: "white",
                minHeight: "100vh",
                padding: "60px",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center mb-4"
                style={{
                  width: "100px",
                  height: "100px",
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                }}
              >
                <FaRupeeSign size={42} color="white" />
              </div>

              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  marginBottom: "15px",
                }}
              >
                GST Billing Pro
              </h1>

              <p
                style={{
                  maxWidth: "450px",
                  fontSize: "1.2rem",
                  lineHeight: "1.7",
                  opacity: 0.9,
                  marginBottom: "60px",
                  textAlign: "left",
                }}
              >
                Complete GST-compliant invoicing solution for Indian businesses.
                Manage customers, products, and generate professional invoices
                with automatic tax calculations.
              </p>

              <div className="container-fluid" style={{ maxWidth: "450px" }}>
                <div className="row g-3">
                  <div className="col-6">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        textAlign: "left",
                      }}
                    >
                      <h3
                        style={{
                          fontWeight: "700",
                          fontSize: "1.5rem",
                          marginBottom: "4px",
                          color: "#fff",
                        }}
                      >
                        CGST/SGST
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          color: "rgba(255,255,255,0.75)",
                        }}
                      >
                        Intra-state invoicing
                      </p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        textAlign: "left",
                      }}
                    >
                      <h3
                        style={{
                          fontWeight: "700",
                          fontSize: "1.5rem",
                          marginBottom: "4px",
                          color: "#fff",
                        }}
                      >
                        IGST
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          color: "rgba(255,255,255,0.75)",
                        }}
                      >
                        Inter-state invoicing
                      </p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        textAlign: "left",
                      }}
                    >
                      <h3
                        style={{
                          fontWeight: "700",
                          fontSize: "1.5rem",
                          marginBottom: "4px",
                          color: "#fff",
                        }}
                      >
                        5 Slabs
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          color: "rgba(255,255,255,0.75)",
                        }}
                      >
                        0%, 5%, 12%, 18%, 28%
                      </p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        textAlign: "left",
                      }}
                    >
                      <h3
                        style={{
                          fontWeight: "700",
                          fontSize: "1.5rem",
                          marginBottom: "4px",
                          color: "#fff",
                        }}
                      >
                        PDF Export
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          color: "rgba(255,255,255,0.75)",
                        }}
                      >
                        Download invoices
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col lg={{ span: 6, offset: 6 }}>
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ minHeight: "100vh" }}
            >
              <Card
                className="border-0 shadow-lg mx-3"
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  borderRadius: "16px",
                }}
              >
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <h2 className="fw-bold mb-1">Welcome back</h2>
                    <p className="text-muted">
                      {userType === "superadmin"
                        ? "Sign in to your super admin account"
                        : "Sign in to your tenant account"}
                    </p>
                  </div>

                  <div className="d-flex justify-content-center gap-3 mb-4">
                    <Button
                      variant={
                        userType === "superadmin"
                          ? "primary"
                          : "outline-secondary"
                      }
                      onClick={() => {
                        setUserType("superadmin");
                        setSubdomain("");
                        setError("");
                        // Clear modal state if open
                        if (showModal) {
                          setForgotSubdomain("");
                          setForgotEmail("");
                        }
                      }}
                      className="px-4 rounded-pill"
                      style={
                        userType === "superadmin"
                          ? { backgroundColor: "#4361ee", border: "none" }
                          : {}
                      }
                    >
                      Super Admin
                    </Button>
                    <Button
                      variant={
                        userType === "tenant" ? "primary" : "outline-secondary"
                      }
                      onClick={() => {
                        setUserType("tenant");
                        setError("");
                        // Clear modal state if open
                        if (showModal) {
                          setForgotSubdomain("");
                          setForgotEmail("");
                        }
                      }}
                      className="px-4 rounded-pill"
                      style={
                        userType === "tenant"
                          ? { backgroundColor: "#4361ee", border: "none" }
                          : {}
                      }
                    >
                      Tenant User
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="danger" className="rounded-3">
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Email address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="rounded-2 py-2"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="rounded-2 py-2"
                          style={{ paddingRight: "45px" }}
                        />
                        <Button
                          variant="link"
                          className="position-absolute top-50 end-0 translate-middle-y"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ textDecoration: "none", color: "#6c757d" }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                    </Form.Group>

                    {userType === "tenant" && (
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Tenant Subdomain
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., aditya-gas"
                          value={subdomain}
                          onChange={(e) =>
                            setSubdomain(e.target.value.toLowerCase())
                          }
                          required
                          disabled={loading}
                          className="rounded-2 py-2"
                        />
                      </Form.Group>
                    )}

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3 py-2 rounded-pill"
                      disabled={loading}
                      style={{ backgroundColor: "#4361ee", border: "none" }}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In <FaArrowRight className="ms-2" />
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline-primary"
                      onClick={openForgotPasswordModal}
                      className="w-100 py-2 rounded-pill"
                    >
                      <FaKey className="me-2" />
                      Forgot Password?
                    </Button>

                    <div className="text-center mt-4">
                      <small className="text-muted">
                        © 2024 GST Billing Pro. All rights reserved.
                      </small>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Forgot Password Modal with Warning Alerts */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="md"
        className="forgot-password-modal"
      >
        <Modal.Header
          closeButton
          className="border-0 pb-0"
          style={{
            background: "linear-gradient(135deg, #4361ee 0%, #3454D1 100%)",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            padding: "2rem 1.5rem 1rem 1.5rem",
          }}
        >
          <Modal.Title className="w-100">
            <div className="text-center">
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                {resetStep === 1 && !emailSent && (
                  <FaEnvelope size={30} style={{ color: "white" }} />
                )}
                {resetStep === 1 && emailSent && (
                  <FaCheckCircle size={30} style={{ color: "white" }} />
                )}
                {resetStep === 2 && (
                  <FaKey size={30} style={{ color: "white" }} />
                )}
                {resetStep === 3 && (
                  <FaCheckCircle size={30} style={{ color: "white" }} />
                )}
              </div>
              <h4 className="fw-bold mb-1" style={{ color: "white" }}>
                {resetStep === 1 && !emailSent && "Reset Password"}
                {resetStep === 1 && emailSent && "OTP Sent!"}
                {resetStep === 2 && "Verify OTP"}
                {resetStep === 3 && "Success!"}
              </h4>
              <p
                className="mb-0 opacity-75"
                style={{ color: "white", fontSize: "0.9rem" }}
              >
                {resetStep === 1 &&
                  !emailSent &&
                  "We'll help you recover your account"}
                {resetStep === 1 && emailSent && "Check your email for OTP"}
                {resetStep === 2 && "Enter OTP and set new password"}
                {resetStep === 3 && "Password changed successfully"}
              </p>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 py-4">
          {/* Warning Alerts for User Type */}
          {!emailSent &&
            resetStep === 1 &&
            userType === "superadmin" &&
            forgotEmail &&
            !forgotEmail.includes("superadmin") && (
              <Alert
                variant="warning"
                className="rounded-3 mb-3"
                style={{ fontSize: "0.85rem" }}
              >
                <FaInfoCircle className="me-2" />
                <strong>Note:</strong> "{forgotEmail}" appears to be a tenant
                email address. Please make sure you've selected{" "}
                <strong>"Tenant User"</strong> and entered your subdomain above.
              </Alert>
            )}

          {!emailSent &&
            resetStep === 1 &&
            userType === "tenant" &&
            !forgotSubdomain &&
            forgotEmail && (
              <Alert
                variant="info"
                className="rounded-3 mb-3"
                style={{ fontSize: "0.85rem" }}
              >
                <FaInfoCircle className="me-2" />
                <strong>Tenant Subdomain Required:</strong> Please enter your
                tenant subdomain to reset your password.
              </Alert>
            )}

          {renderModalContent()}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 pb-4 px-4">
          {renderModalFooter()}
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .forgot-password-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .forgot-password-modal .modal-header .btn-close {
          filter: brightness(0) invert(1);
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .forgot-password-modal .modal-header .btn-close:hover {
          opacity: 1;
        }

        .forgot-password-modal .form-control:focus {
          border-color: #4361ee;
          box-shadow: 0 0 0 0.2rem rgba(67, 97, 238, 0.25);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .forgot-password-modal .modal-body {
          animation: fadeInUp 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Login;
