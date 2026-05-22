// src/pages/ProfileManagement.js
import React, { useState } from "react";
import { Container, Row, Col, Nav, Card } from "react-bootstrap";
import { FaUser, FaKey, FaBell } from "react-icons/fa";
import MyProfile from "../components/Profile/MyProfile";
import ChangePassword from "../components/Profile/ChangePassword";

const ProfileManagement = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Container fluid className="p-4">
      <Row>
        {/* <Col lg={12}>
          <h2 className="mb-4">Account Settings</h2>
          <p className="text-muted mb-4">
            Manage your profile information and password
          </p>
        </Col> */}
      </Row>

      <Row>
        <Col lg={3} className="mb-4">
          {/* <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column p-3">
                <Nav.Link
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                  className="d-flex align-items-center gap-2 mb-2"
                >
                  <FaUser />
                  <span>My Profile</span>
                </Nav.Link>
                
                <Nav.Link
                  active={activeTab === "password"}
                  onClick={() => setActiveTab("password")}
                  className="d-flex align-items-center gap-2 mb-2"
                >
                  <FaKey />
                  <span>Change Password</span>
                </Nav.Link>
                
                <Nav.Link
                  active={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                  className="d-flex align-items-center gap-2"
                >
                  <FaBell />
                  <span>Notifications</span>
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card> */}
        </Col>

        <Col lg={9}>
          {activeTab === "profile" && <MyProfile />}
          {activeTab === "password" && <ChangePassword />}
          {activeTab === "notifications" && (
            <Card className="shadow-sm">
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-0">Notification settings coming soon...</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileManagement;