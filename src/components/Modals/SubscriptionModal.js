// frontend/src/components/Modals/SubscriptionModal.jsx
import React from "react";
import { Modal, Button, Card, Row, Col, Badge, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaCrown, FaStar, FaGem } from "react-icons/fa";

const SubscriptionModal = ({
  show,
  onHide,
  plans,
  currentPlan,
  onSelect,
  upgrading,
}) => {
  const getPlanIcon = (planName) => {
    switch (planName) {
      case "Basic":
        return <FaStar size={30} className="text-primary" />;
      case "Standard":
        return <FaGem size={30} className="text-info" />;
      case "Premium":
        return <FaCrown size={30} className="text-warning" />;
      default:
        return <FaStar size={30} className="text-primary" />;
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

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaCrown className="me-2" /> Upgrade Your Plan
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="text-muted mb-4">
          Choose the perfect plan for your business needs. Upgrade anytime.
        </p>

        <Row className="g-4">
          {plans.map((plan) => (
            <Col md={4} key={plan.id}>
              <Card
                className={`h-100 border-2 shadow-sm ${currentPlan === plan.name ? "border-primary" : ""}`}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="text-center p-4">
                  <div className="mb-3">{getPlanIcon(plan.name)}</div>
                  <h4 className="fw-bold">{plan.name}</h4>
                  <h2 className="fw-bold text-primary">
                    ₹{plan.price}
                    <small className="fs-6 text-muted">
                      /{plan.billingCycle}
                    </small>
                  </h2>

                  <hr />

                  <div className="text-start mt-3">
                    <p>
                      <FaCheckCircle className="text-success me-2" />{" "}
                      {plan.users} Users
                    </p>
                    <p>
                      <FaCheckCircle className="text-success me-2" />{" "}
                      {plan.invoices} Invoices
                    </p>
                    <p>
                      <FaCheckCircle className="text-success me-2" /> Cylinder
                      Management
                    </p>
                    <p>
                      <FaCheckCircle className="text-success me-2" /> GST
                      Billing
                    </p>
                  </div>

                  {currentPlan === plan.name && (
                    <Badge bg="success" className="mt-3 px-3 py-2">
                      Current Plan
                    </Badge>
                  )}
                </Card.Body>
                <Card.Footer className="bg-transparent text-center border-0 pb-4">
                  <Button
                    variant={getPlanColor(plan.name)}
                    className="rounded-pill px-4"
                    onClick={() => onSelect(plan)}
                    disabled={currentPlan === plan.name || upgrading}
                  >
                    {upgrading ? (
                      <Spinner animation="border" size="sm" />
                    ) : currentPlan === plan.name ? (
                      "Current Plan"
                    ) : (
                      "Upgrade Now"
                    )}
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubscriptionModal;
