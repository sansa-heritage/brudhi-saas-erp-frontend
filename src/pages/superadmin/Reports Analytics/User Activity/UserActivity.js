import React, { useState } from "react";
import { Table, Button, Modal, Form, Badge, Row, Col } from "react-bootstrap";

const UserActivity = () => {
  const [activities, setActivities] = useState([
    {
      id: 1,
      user: "Tophan",
      action: "Login",
      date: "2026-04-13",
      time: "10:30 AM",
      status: "Success",
      details: "User logged into system",
    },
  ]);

  const [viewShow, setViewShow] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [search, setSearch] = useState("");

  // Filter
  const filtered = activities.filter(
    (a) =>
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.action.toLowerCase().includes(search.toLowerCase())
  );

  // View
  const handleView = (activity) => {
    setCurrentActivity(activity);
    setViewShow(true);
  };

  // Delete
  const handleDelete = (id) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  return (
    <div className="p-4">
      <h3>User Activity (Reports & Analytics)</h3>

      {/* Filter */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder="Search by user or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      {/* Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Action</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((a, i) => (
            <tr key={a.id}>
              <td>{i + 1}</td>
              <td>{a.user}</td>
              <td>{a.action}</td>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>
                <Badge bg={a.status === "Success" ? "success" : "danger"}>
                  {a.status}
                </Badge>
              </td>
              <td>
                <Button size="sm" onClick={() => handleView(a)}>View</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Activity Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentActivity && (
            <>
              <p><strong>User:</strong> {currentActivity.user}</p>
              <p><strong>Action:</strong> {currentActivity.action}</p>
              <p><strong>Date:</strong> {currentActivity.date}</p>
              <p><strong>Time:</strong> {currentActivity.time}</p>
              <p><strong>Status:</strong> {currentActivity.status}</p>
              <p><strong>Details:</strong> {currentActivity.details}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserActivity;