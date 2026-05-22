// frontend/src/pages/subscription/Subscription.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Badge,
  ProgressBar,
  Alert,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { FaSearch, FaTimes, FaFilter, FaExclamationTriangle, FaArrowLeft, FaHome, FaCrown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import SubscriptionModal from "../../components/Modals/SubscriptionModal";
import {
  getPlans,
  getSubscriptions,
  upgradePlan,
  getSubscriptionStats,
} from "../../components/services/subscriptionService";

const Subscription = () => {
  const navigate = useNavigate();
  const tenantId = localStorage.getItem("tenantId") || 1;

  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState({
    plan_name: "Basic",
    amount: 999,
    billing_cycle: "Monthly",
    status: "Active",
    invoices_used: 0,
    invoice_limit: 500,
    users_used: 0,
    user_limit: 3,
    cylinders_used: 0,
    cylinder_limit: 500,
    start_date: "",
    end_date: "",
  });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      // Load plans
      const plansResponse = await getPlans();
      console.log("Plans response:", plansResponse);
      
      let plansData = [];
      if (plansResponse.data && plansResponse.data.data) {
        plansData = plansResponse.data.data;
      } else if (plansResponse.data && Array.isArray(plansResponse.data)) {
        plansData = plansResponse.data;
      } else if (Array.isArray(plansResponse)) {
        plansData = plansResponse;
      }
      setPlans(plansData);

      // Load current subscription
      const subResponse = await getSubscriptions(tenantId);
      console.log("Subscription response:", subResponse);
      
      let subData = {};
      if (subResponse.data && subResponse.data.data) {
        subData = subResponse.data.data;
      } else if (subResponse.data) {
        subData = subResponse.data;
      }
      
      setSubscription({
        plan_name: subData.plan_name || subData.plan || "Basic",
        amount: subData.amount || subData.price || 999,
        billing_cycle: subData.billing_cycle || subData.billingCycle || "Monthly",
        status: subData.status || "Active",
        invoices_used: subData.invoices_used || subData.invoicesUsed || 0,
        invoice_limit: subData.invoice_limit || subData.invoiceLimit || 500,
        users_used: subData.users_used || subData.usersUsed || 0,
        user_limit: subData.user_limit || subData.userLimit || 3,
        cylinders_used: subData.cylinders_used || subData.cylindersUsed || 0,
        cylinder_limit: subData.cylinder_limit || subData.cylinderLimit || 500,
        start_date: subData.start_date || subData.startDate || "N/A",
        end_date: subData.end_date || subData.endDate || "N/A",
      });

      // Load stats
      const statsResponse = await getSubscriptionStats();
      if (statsResponse.data && statsResponse.data.data) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setUpgrading(true);
    try {
      const response = await upgradePlan({
        plan_id: plan.id,
        plan_name: plan.name,
        billing_cycle: plan.billingCycle.toLowerCase(),
        amount: plan.price,
        tenant_id: tenantId,
      });
      
      console.log("Upgrade response:", response);
      
      // Reload subscription data
      await loadData();
      
      setShowModal(false);
      Swal.fire({
        icon: "success",
        title: "Upgraded!",
        text: `Successfully upgraded to ${plan.name} plan`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to upgrade:", error);
      Swal.fire({
        icon: "error",
        title: "Upgrade Failed",
        text: error.response?.data?.message || "Failed to upgrade plan",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const usagePercent = (subscription.invoices_used / subscription.invoice_limit) * 100 || 0;
  const userPercent = (subscription.users_used / subscription.user_limit) * 100 || 0;
  const cylinderPercent = (subscription.cylinders_used / subscription.cylinder_limit) * 100 || 0;

  const getProgressBarColor = (percent) => {
    if (percent >= 90) return "danger";
    if (percent >= 70) return "warning";
    return "success";
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h5 className="mt-3">Loading subscription data...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4" style={{ background: "#f0f2f5" }}>
      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center"
          onClick={handleGoBack}
        >
          <FaArrowLeft className="me-2" /> Back to Dashboard
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

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="mb-3" onClose={() => setSuccessMessage("")} dismissible>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="danger" className="mb-3" onClose={() => setErrorMessage("")} dismissible>
          {errorMessage}
        </Alert>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FaCrown className="me-2 text-warning" /> GasFlow Subscription
          </h2>
          <p className="text-muted mb-0">
            Manage cylinders, billing & business growth
          </p>
        </div>

        <div>
          <Button
            variant="success"
            className="rounded-pill px-4"
            onClick={() => setShowModal(true)}
          >
            🚀 Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">Current Plan</small>
                  <h2 className="fw-bold mb-0">{subscription.plan_name}</h2>
                  <Badge bg={subscription.status === "Active" ? "success" : "danger"} className="mt-2">
                    {subscription.status}
                  </Badge>
                  <p className="mt-2 mb-0">
                    <strong>₹{subscription.amount}</strong>/{subscription.billing_cycle}
                  </p>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <FaCrown size={24} className="text-primary" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">Invoice Usage</small>
                  <h3 className="fw-bold mb-0">
                    {subscription.invoices_used} / {subscription.invoice_limit}
                  </h3>
                  <div className="mt-2">
                    <ProgressBar 
                      now={usagePercent} 
                      variant={getProgressBarColor(usagePercent)}
                      style={{ height: "8px", borderRadius: "4px" }}
                    />
                  </div>
                  {usagePercent > 80 && (
                    <small className="text-warning mt-1 d-block">
                      <FaExclamationTriangle size={10} /> Limit near
                    </small>
                  )}
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <FaExclamationTriangle size={24} className="text-info" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">User Usage</small>
                  <h3 className="fw-bold mb-0">
                    {subscription.users_used} / {subscription.user_limit}
                  </h3>
                  <div className="mt-2">
                    <ProgressBar 
                      now={userPercent} 
                      variant={getProgressBarColor(userPercent)}
                      style={{ height: "8px", borderRadius: "4px" }}
                    />
                  </div>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FaExclamationTriangle size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">Cylinder Usage</small>
                  <h3 className="fw-bold mb-0">
                    {subscription.cylinders_used} / {subscription.cylinder_limit}
                  </h3>
                  <div className="mt-2">
                    <ProgressBar 
                      now={cylinderPercent} 
                      variant={getProgressBarColor(cylinderPercent)}
                      style={{ height: "8px", borderRadius: "4px" }}
                    />
                  </div>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <FaExclamationTriangle size={24} className="text-warning" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Smart Alert */}
      {usagePercent > 70 && (
        <Alert variant="warning" className="mb-4 rounded-4">
          <FaExclamationTriangle className="me-2" />
          ⚡ You're nearing your invoice limit. Upgrade recommended!
        </Alert>
      )}

      {/* Subscription Details */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-3">Subscription Details</h5>
          <hr />
          <Row>
            <Col md={4}>
              <div className="mb-3">
                <small className="text-muted d-block">Start Date</small>
                <strong>{subscription.start_date}</strong>
              </div>
            </Col>
            <Col md={4}>
              <div className="mb-3">
                <small className="text-muted d-block">Expiry Date</small>
                <strong>{subscription.end_date}</strong>
              </div>
            </Col>
            <Col md={4}>
              <div className="mb-3">
                <small className="text-muted d-block">Billing Cycle</small>
                <strong>{subscription.billing_cycle}</strong>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Plan Features */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-3">Included Features</h5>
          <hr />
          <Row>
            <Col md={6}>
              <ul className="mb-0">
                <li className="mb-2">✔ Cylinder Management</li>
                <li className="mb-2">✔ GST Billing</li>
                <li className="mb-2">✔ Invoice Generation</li>
                <li className="mb-2">✔ Stock Tracking</li>
              </ul>
            </Col>
            <Col md={6}>
              <ul className="mb-0">
                <li className="mb-2">✔ Multi-user Access</li>
                <li className="mb-2">✔ Advanced Reports</li>
                <li className="mb-2">✔ Cloud Backup</li>
                <li className="mb-2">✔ 24/7 Support</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Subscription Modal */}
      <SubscriptionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        plans={plans}
        currentPlan={subscription.plan_name}
        onSelect={handleUpgrade}
        upgrading={upgrading}
      />
    </Container>
  );
};

export default Subscription;