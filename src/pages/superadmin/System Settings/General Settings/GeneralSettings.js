import React, { useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";

const GeneralSettings = () => {
  const [show, setShow] = useState(false);

  const [settings, setSettings] = useState({
    companyName: "LPG Gas Agency",
    email: "info@gmail.com",
    phone: "9876543210",
    address: "Kolkata, India",
    gst: "22AAAAA0000A1Z5",
    currency: "INR",
    darkMode: false,
    notifications: true,
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="p-4">
      <h3>System Settings</h3>

      <Button onClick={() => setShow(true)}>
        ⚙️ Open General Settings
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>General Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  name="companyName"
                  value={settings.companyName}
                  onChange={handleChange}
                />
              </Col>

              <Col md={6}>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={6}>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                />
              </Col>

              <Col md={6}>
                <Form.Label>GST Number</Form.Label>
                <Form.Control
                  name="gst"
                  value={settings.gst}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={6}>
                <Form.Label>Currency</Form.Label>
                <Form.Select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                >
                  <option>INR</option>
                  <option>USD</option>
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            {/* Toggles */}
            <Row className="mt-4">
              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Dark Mode"
                  name="darkMode"
                  checked={settings.darkMode}
                  onChange={handleChange}
                />
              </Col>

              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Enable Notifications"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShow(false)}>
            Save Settings
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GeneralSettings;