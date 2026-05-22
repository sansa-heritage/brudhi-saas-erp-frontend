import React, { useState } from "react";
import { Table, Button, Modal, Badge } from "react-bootstrap";

const LoginHistory = () => {
  const [logs] = useState([
    {
      id: 1,
      user: "Tophan",
      ip: "192.168.1.1",
      device: "Chrome - Windows",
      location: "Kolkata, India",
      date: "2026-04-14 10:30 AM",
      status: "Success",
    },
    {
      id: 2,
      user: "Admin",
      ip: "192.168.1.5",
      device: "Mobile - Android",
      location: "Delhi, India",
      date: "2026-04-14 09:10 AM",
      status: "Failed",
    },
  ]);

  const [viewShow, setViewShow] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);

  // View Details
  const handleView = (log) => {
    setCurrentLog(log);
    setViewShow(true);
  };

  return (
    <div className="p-4">
      <h3>🔐 Login History (Security)</h3>

      {/* Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>IP Address</th>
            <th>Device</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log, i) => (
            <tr key={log.id}>
              <td>{i + 1}</td>
              <td>{log.user}</td>
              <td>{log.ip}</td>
              <td>{log.device}</td>
              <td>{log.date}</td>
              <td>
                <Badge bg={log.status === "Success" ? "success" : "danger"}>
                  {log.status}
                </Badge>
              </td>
              <td>
                <Button size="sm" onClick={() => handleView(log)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentLog && (
            <>
              <p><strong>User:</strong> {currentLog.user}</p>
              <p><strong>IP Address:</strong> {currentLog.ip}</p>
              <p><strong>Device:</strong> {currentLog.device}</p>
              <p><strong>Location:</strong> {currentLog.location}</p>
              <p><strong>Date:</strong> {currentLog.date}</p>
              <p><strong>Status:</strong> {currentLog.status}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LoginHistory;