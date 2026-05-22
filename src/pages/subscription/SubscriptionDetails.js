// frontend/src/pages/subscription/SubscriptionDetails.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaCreditCard, FaArrowLeft, FaArrowUp, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getSubscription } from "../../components/services/subscriptionService";
import Swal from "sweetalert2";
import { getSubscriptions } from "../../api/tenant/subscription.api";

const SubscriptionDetails = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState({
    plan_name: "Basic",
    amount: 999,
    billing_cycle: "Monthly",
    start_date: "N/A",
    end_date: "N/A",
    status: "Active",
    features: [
      "500 Invoices / month",
      "3 Users",
      "GST Billing",
      "Basic Reports",
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getSubscriptions();
      console.log("Subscription response:", response);
      
      let subData = {};
      if (response.data && response.data.data) {
        subData = response.data.data;
      } else if (response.data) {
        subData = response.data;
      }
      
      setSubscription({
        plan_name: subData.plan_name || subData.plan || "Basic",
        amount: subData.amount || subData.price || 999,
        billing_cycle: subData.billing_cycle || subData.billingCycle || "Monthly",
        start_date: subData.start_date || subData.startDate || "N/A",
        end_date: subData.end_date || subData.endDate || "N/A",
        status: subData.status || "Active",
        features: subData.features || [
          `${subData.invoice_limit || 500} Invoices / month`,
          `${subData.user_limit || 3} Users`,
          "GST Billing",
          "Basic Reports",
        ],
      });
    } catch (error) {
      console.error("Failed to load subscription:", error);
      setError(error.response?.data?.message || "Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  // Status Color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "expired":
        return "danger";
      case "trial":
        return "warning";
      case "cancelled":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleUpgrade = () => {
    navigate("/subscription");
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h5 className="mt-3">Loading subscription details...</h5>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <Alert variant="danger" className="text-center">
          <h5>Error Loading Subscription</h5>
          <p>{error}</p>
          <Button variant="primary" onClick={loadSubscription}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4" style={{ background: "#f0f2f5" }}>
      {/* 🔥 Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 mb-2 d-flex align-items-center"
            onClick={handleGoBack}
            style={{ color: "#6c757d" }}
          >
            <FaArrowLeft className="me-2" /> Back
          </Button>
          <h2 className="fw-bold mb-0">
            <FaCreditCard className="me-2 text-primary" /> Subscription Details
          </h2>
          <p className="text-muted mt-1">View your current plan and billing information</p>
        </div>

        <Button
          variant="primary"
          className="rounded-pill px-4"
          onClick={handleUpgrade}
        >
          <FaArrowUp className="me-2" /> Upgrade Plan
        </Button>
      </div>

      <Row className="g-4">
        {/* ✅ Plan Info */}
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">
                <FaCreditCard className="me-2 text-primary" /> Plan Information
              </h5>
              <hr />

              <Table borderless className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: "40%" }}>Plan Name</td>
                    <td className="fw-semibold">{subscription.plan_name}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Price</td>
                    <td className="fw-semibold">
                      ₹{subscription.amount} / {subscription.billing_cycle}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Status</td>
                    <td>
                      <Badge bg={getStatusColor(subscription.status)} className="px-3 py-2 rounded-pill">
                        {subscription.status}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* ✅ Billing Info */}
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">
                <FaCreditCard className="me-2 text-primary" /> Billing Details
              </h5>
              <hr />

              <Table borderless className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: "40%" }}>Start Date</td>
                    <td className="fw-semibold">{subscription.start_date}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Expiry Date</td>
                    <td className="fw-semibold">{subscription.end_date}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Billing Cycle</td>
                    <td className="fw-semibold">{subscription.billing_cycle}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* ✅ Features */}
        <Col md={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">
                ✨ Plan Features
              </h5>
              <hr />

              <Row>
                {subscription.features.map((feature, index) => (
                  <Col md={4} key={index} className="mb-3">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <span className="text-success me-2">✔</span> {feature}
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* ✅ Summary Card */}
        <Col md={12}>
          <Card className="border-0 shadow-sm rounded-4 bg-primary bg-opacity-10">
            <Card.Body className="text-center p-4">
              <h5 className="fw-bold mb-3">💡 Subscription Summary</h5>
              <p className="mb-2">
                You are currently on <strong className="text-primary">{subscription.plan_name}</strong> plan
              </p>
              <p className="mb-0">
                Valid till <strong>{subscription.end_date}</strong>
              </p>
              {subscription.status?.toLowerCase() !== "active" && (
                <Button
                  variant="danger"
                  className="mt-3 rounded-pill"
                  onClick={handleUpgrade}
                >
                  Renew Now
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionDetails;