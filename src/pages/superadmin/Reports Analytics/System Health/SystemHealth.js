import React, { useState } from "react";
import { Card, Row, Col, ProgressBar, Button, Modal } from "react-bootstrap";

const SystemHealth = () => {
  const [show, setShow] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  const metrics = [
    { name: "CPU Usage", value: 65, color: "primary" },
    { name: "Memory Usage", value: 75, color: "warning" },
    { name: "API Status", value: 90, color: "success" },
    { name: "Active Users", value: 120, color: "info" },
  ];

  const handleView = (metric) => {
    setSelectedMetric(metric);
    setShow(true);
  };

  return (
    <div className="p-4">
      <h3>System Health (Reports & Analytics)</h3>

      <Row className="mt-4">
        {metrics.map((m, i) => (
          <Col md={3} key={i}>
            <Card className="mb-3 shadow-sm">
              <Card.Body>
                <h5>{m.name}</h5>
                <h4>
                  {m.name === "Active Users" ? m.value : `${m.value}%`}
                </h4>

                <ProgressBar
                  now={m.value}
                  variant={m.color}
                  className="mb-2"
                />

                <Button size="sm" onClick={() => handleView(m)}>
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Metric Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMetric && (
            <>
              <h5>{selectedMetric.name}</h5>
              <p>
                Value:{" "}
                {selectedMetric.name === "Active Users"
                  ? selectedMetric.value
                  : `${selectedMetric.value}%`}
              </p>

              <p>
                Status:{" "}
                {selectedMetric.value > 80
                  ? "High ⚠️"
                  : selectedMetric.value > 50
                  ? "Moderate"
                  : "Normal ✅"}
              </p>

              <p>
                Description: This metric shows current system performance for{" "}
                {selectedMetric.name}.
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SystemHealth;