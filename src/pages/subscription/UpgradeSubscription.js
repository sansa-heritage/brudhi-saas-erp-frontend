// frontend/src/pages/subscription/UpgradeSubscription.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaArrowLeft, FaCheckCircle, FaCrown, FaGem, FaStar, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getPlans,
  getSubscriptions,
  upgradePlan,
} from "../../components/services/subscriptionService";

const UpgradeSubscription = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
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
      const subResponse = await getSubscriptions();
      console.log("Subscription response:", subResponse);
      
      let subData = {};
      if (subResponse.data && subResponse.data.data) {
        subData = subResponse.data.data;
      } else if (subResponse.data) {
        subData = subResponse.data;
      }
      
      setCurrentSubscription({
        id: subData.id,
        plan: subData.plan_name || subData.plan,
        price: subData.amount || subData.price,
        billingCycle: subData.billing_cycle || subData.billingCycle,
        users: subData.user_limit || subData.users,
        invoices: subData.invoice_limit || subData.invoices,
      });
    } catch (error) {
      console.error("Failed to load data:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to load subscription data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setSelectedPlan(plan);
    const result = await Swal.fire({
      title: "Confirm Upgrade",
      text: `Are you sure you want to upgrade to ${plan.name} plan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Upgrade!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setUpgrading(true);
      try {
        const response = await upgradePlan({
          plan_id: plan.id,
          plan_name: plan.name,
          billing_cycle: plan.billingCycle.toLowerCase(),
          amount: plan.price,
        });
        
        console.log("Upgrade response:", response);
        
        Swal.fire({
          icon: "success",
          title: "Upgraded!",
          text: `Successfully upgraded to ${plan.name} plan`,
          timer: 2000,
          showConfirmButton: false,
        });
        
        setTimeout(() => {
          navigate("/subscription");
        }, 2000);
      } catch (error) {
        console.error("Failed to upgrade:", error);
        Swal.fire({
          icon: "error",
          title: "Upgrade Failed",
          text: error.response?.data?.message || "Failed to upgrade plan",
        });
      } finally {
        setUpgrading(false);
        setSelectedPlan(null);
      }
    }
  };

  const getPlanIcon = (planName, size = 40) => {
    switch (planName) {
      case "Basic":
        return <FaStar size={size} className="text-primary" />;
      case "Standard":
        return <FaGem size={size} className="text-info" />;
      case "Premium":
        return <FaCrown size={size} className="text-warning" />;
      default:
        return <FaStar size={size} className="text-primary" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName) {
      case "Basic":
        return "primary";
      case "Standard":
        return "info";
      case "Premium":
        return "warning";
      default:
        return "primary";
    }
  };

  const handleGoBack = () => {
    navigate("/subscription");
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h5 className="mt-3">Loading plans...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4" style={{ background: "#f0f2f5" }}>
      {/* Header */}
      <div className="mb-4">
        <Button
          variant="link"
          className="text-decoration-none p-0 mb-3 d-flex align-items-center gap-2"
          onClick={handleGoBack}
          style={{ color: "#6c757d" }}
        >
          <FaArrowLeft /> Back to Subscription
        </Button>

        <Card className="border-0 shadow rounded-4 overflow-hidden">
          <div className="bg-gradient-primary p-4 text-white">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-25 rounded-circle p-3">
                <FaCrown size={40} />
              </div>
              <div>
                <h1 className="display-6 fw-bold mb-1">Upgrade Subscription</h1>
                <p className="mb-0 opacity-75">
                  Choose the perfect plan for your business needs
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Plan Info */}
      {currentSubscription && (
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-3">Current Plan</h5>
            <hr />
            <Row className="align-items-center">
              <Col md={3}>
                <div className="text-center">
                  {getPlanIcon(currentSubscription.plan, 48)}
                  <h3 className="mt-2 mb-0">{currentSubscription.plan}</h3>
                  <Badge bg="success" className="mt-2">Active</Badge>
                </div>
              </Col>
              <Col md={9}>
                <Row>
                  <Col md={4}>
                    <small className="text-muted d-block">Price</small>
                    <strong>₹{currentSubscription.price}/{currentSubscription.billingCycle}</strong>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Users</small>
                    <strong>{currentSubscription.users} Users</strong>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Invoices</small>
                    <strong>{currentSubscription.invoices} per month</strong>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Available Plans */}
      <h4 className="fw-bold mb-4 text-center">Choose Your Plan</h4>
      <Row className="g-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan === plan.name;
          const isUpgradingPlan = selectedPlan?.id === plan.id;
          
          return (
            <Col lg={4} key={plan.id}>
              <Card className={`border-0 shadow-sm rounded-4 h-100 ${isCurrentPlan ? 'border-primary border-2' : ''}`}>
                <Card.Body className="p-4 text-center">
                  <div className="mb-3">{getPlanIcon(plan.name, 50)}</div>
                  <h3 className="fw-bold">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="display-5 fw-bold text-primary">₹{plan.price}</span>
                    <span className="text-muted">/{plan.billingCycle}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="text-start mt-3">
                    <p className="mb-2">
                      <FaCheckCircle className="text-success me-2" /> 
                      <strong>{plan.users}</strong> Users
                    </p>
                    <p className="mb-2">
                      <FaCheckCircle className="text-success me-2" /> 
                      <strong>{plan.invoices === "Unlimited" ? "Unlimited" : plan.invoices + " invoices"}</strong> per month
                    </p>
                    <p className="mb-2">
                      <FaCheckCircle className="text-success me-2" /> Cylinder Management
                    </p>
                    <p className="mb-2">
                      <FaCheckCircle className="text-success me-2" /> GST Billing
                    </p>
                    <p className="mb-2">
                      <FaCheckCircle className="text-success me-2" /> Invoice Generation
                    </p>
                    {plan.name === "Standard" && (
                      <>
                        <p className="mb-2">
                          <FaCheckCircle className="text-success me-2" /> Advanced Reports
                        </p>
                        <p className="mb-2">
                          <FaCheckCircle className="text-success me-2" /> API Access
                        </p>
                      </>
                    )}
                    {plan.name === "Premium" && (
                      <>
                        <p className="mb-2">
                          <FaCheckCircle className="text-success me-2" /> Unlimited Everything
                        </p>
                        <p className="mb-2">
                          <FaCheckCircle className="text-success me-2" /> Priority Support
                        </p>
                        <p className="mb-2">
                          <FaCheckCircle className="text-success me-2" /> Dedicated Account Manager
                        </p>
                      </>
                    )}
                  </div>
                  
                  {isCurrentPlan ? (
                    <Badge bg="success" className="mt-3 px-3 py-2 rounded-pill">
                      Current Plan
                    </Badge>
                  ) : (
                    <Button
                      variant={getPlanColor(plan.name)}
                      className="rounded-pill px-4 mt-3 w-100"
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgrading}
                    >
                      {isUpgradingPlan ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Upgrading...
                        </>
                      ) : (
                        "Upgrade Now"
                      )}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Comparison Table */}
      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-3 text-center">Feature Comparison</h5>
          <hr />
          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "30%" }}>Features</th>
                  {plans.map((plan) => (
                    <th key={plan.id} style={{ width: "23%" }}>{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-start fw-semibold">Price</td>
                  {plans.map((plan) => (
                    <td key={plan.id}>₹{plan.price}/{plan.billingCycle}</td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-semibold">Users</td>
                  {plans.map((plan) => (
                    <td key={plan.id}>{plan.users} Users</td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-semibold">Invoices/Month</td>
                  {plans.map((plan) => (
                    <td key={plan.id}>{plan.invoices}</td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-semibold">Cylinder Management</td>
                  {plans.map((plan) => (
                    <td key={plan.id}><FaCheckCircle className="text-success" /></td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-semibold">GST Billing</td>
                  {plans.map((plan) => (
                    <td key={plan.id}><FaCheckCircle className="text-success" /></td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-semibold">Advanced Reports</td>
                  {plans.map((plan) => (
                    <td key={plan.id}>
                      {plan.name !== "Basic" ? <FaCheckCircle className="text-success" /> : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-semibold">API Access</td>
                  {plans.map((plan) => (
                    <td key={plan.id}>
                      {plan.name !== "Basic" ? <FaCheckCircle className="text-success" /> : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-semibold">Priority Support</td>
                  {plans.map((plan) => (
                    <td key={plan.id}>
                      {plan.name === "Premium" ? <FaCheckCircle className="text-success" /> : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* FAQ Note */}
      <Alert variant="info" className="mt-4 rounded-4">
        <small>
          <strong>Note:</strong> Upgrade will be effective immediately. 
          The price will be prorated based on your remaining subscription period.
          For any questions, contact our support team.
        </small>
      </Alert>

      <style jsx="true">{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </Container>
  );
};

export default UpgradeSubscription;