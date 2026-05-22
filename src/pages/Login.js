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
  FaFileInvoice,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaPercentage,
  FaFilePdf,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBoxes,
  FaMoneyBillWave,
  FaRupeeSign,
  FaExchangeAlt,
  FaKey,
} from "react-icons/fa";
import apiClient from "../../../gasflow-erp-frontend/src/api/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [userType, setUserType] = useState("superadmin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Forgot Password Modal State
  const [showModal, setShowModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubdomain, setForgotSubdomain] = useState("");
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      toast.error("Please enter both email and password", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
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
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
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
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
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
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
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
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Open Forgot Password Modal
  const openForgotPasswordModal = () => {
    setForgotEmail(email || "");
    setForgotSubdomain(subdomain || "");
    setShowModal(true);
    setEmailSent(false);
  };

  // Handle Send Reset Link
  const handleSendResetLink = async () => {
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
      
      if (response.data.success) {
        setEmailSent(true);
        toast.success("Password reset link sent to your email!", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });
      } else {
        throw new Error(response.data.message || "Failed to send reset link");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      let errorMessage = "Failed to send reset link. Please try again.";
      
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
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      {/* React Toastify Container */}
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
          {/* Left Side - EXACT DESIGN FROM IMAGE + Rupees Icon */}
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
              {/* Icon Box */}
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

              {/* Heading */}
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  marginBottom: "15px",
                }}
              >
                GST Billing Pro
              </h1>

              {/* Description */}
              <p
                style={{
                  maxWidth: "450px",
                  fontSize: "1.2rem",
                  lineHeight: "1.7",
                  opacity: 0.9,
                  marginBottom: "60px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  textAlign: "left",
                }}
              >
                Complete GST-compliant invoicing solution for Indian businesses.
                Manage customers, products, and generate professional invoices
                with automatic tax calculations.
              </p>

              {/* Feature Cards */}
              <div className="container-fluid" style={{ maxWidth: "450px" }}>
                <div className="row g-3">
                  {/* Card 1 */}
                  <div className="col-6">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        textAlign: "left",
                        height: "78px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
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
                          lineHeight: "1.3",
                        }}
                      >
                        Intra-state invoicing
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="col-6">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        textAlign: "left",
                        height: "78px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
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
                          lineHeight: "1.3",
                        }}
                      >
                        Inter-state invoicing
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="col-6">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        textAlign: "left",
                        height: "78px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
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
                          lineHeight: "1.3",
                        }}
                      >
                        0%, 5%, 12%, 18%, 28%
                      </p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="col-6">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        textAlign: "left",
                        height: "78px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
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
                          lineHeight: "1.3",
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

                  {/* User Type Toggle Buttons */}
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

                      <Form.Text className="text-muted">
                        {userType === "superadmin"
                          ? "superadmin@gasflow.com"
                          : "admin@company.com"}
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Password</Form.Label>

                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="rounded-2 py-2"
                      />

                      <Form.Text className="text-muted">
                        Minimum 4 characters
                      </Form.Text>
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

                        <Form.Text className="text-muted">
                          Your company's unique subdomain
                        </Form.Text>
                      </Form.Group>
                    )}

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3 py-2 rounded-pill"
                      disabled={loading}
                      style={{
                        backgroundColor: "#4361ee",
                        border: "none",
                      }}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>

                    {/* Forgot Password Button - Opens Modal */}
                    <Button
                      variant="outline-primary"
                      onClick={openForgotPasswordModal}
                      className="w-100 mb-3 py-2 rounded-pill"
                      style={{
                        borderColor: "#4361ee",
                        color: "#4361ee",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#4361ee";
                        e.target.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#4361ee";
                      }}
                    >
                      <FaKey className="me-2" />
                      Forgot Password?
                    </Button>

                    <div className="text-center">
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

      {/* Forgot Password Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaKey className="me-2" />
            Reset Password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!emailSent ? (
            <>
              <p className="text-muted mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoFocus
                />
              </Form.Group>

              {userType === "tenant" && (
                <Form.Group className="mb-3">
                  <Form.Label>Tenant Subdomain</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your subdomain"
                    value={forgotSubdomain}
                    onChange={(e) => setForgotSubdomain(e.target.value.toLowerCase())}
                  />
                  <Form.Text className="text-muted">
                    Required for tenant accounts
                  </Form.Text>
                </Form.Group>
              )}
            </>
          ) : (
            <div className="text-center py-3">
              <FaCheckCircle size={60} className="text-success mb-3" />
              <h5>Check Your Email</h5>
              <p className="text-muted mt-3">
                We've sent a password reset link to <strong>{forgotEmail}</strong>
              </p>
              <p className="text-muted small">
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!emailSent ? (
            <>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSendResetLink}
                disabled={sending}
                style={{ backgroundColor: "#4361ee", border: "none" }}
              >
                {sending ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleCloseModal} style={{ backgroundColor: "#4361ee", border: "none" }}>
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;