import React, { useState } from "react";
import { Table, Button, Modal, Badge } from "react-bootstrap";

const AuditLogs = () => {
  const [logs] = useState([
    {
      id: 1,
      user: "Tophan",
      action: "Login",
      module: "Auth",
      ip: "192.168.1.1",
      date: "2026-04-14 10:30 AM",
      status: "Success",
      details: "User logged into the system",
    },
    {
      id: 2,
      user: "Admin",
      action: "Delete",
      module: "Invoices",
      ip: "192.168.1.2",
      date: "2026-04-14 11:00 AM",
      status: "Warning",
      details: "Deleted invoice #102",
    },
  ]);

  const [viewShow, setViewShow] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);

  // View
  const handleView = (log) => {
    setCurrentLog(log);
    setViewShow(true);
  };

  return (
    <div className="p-4">
      <h3>Audit Logs (Security)</h3>

      {/* Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Action</th>
            <th>Module</th>
            <th>IP</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log, i) => (
            <tr key={log.id}>
              <td>{i + 1}</td>
              <td>{log.user}</td>
              <td>{log.action}</td>
              <td>{log.module}</td>
              <td>{log.ip}</td>
              <td>{log.date}</td>
              <td>
                <Badge
                  bg={
                    log.status === "Success"
                      ? "success"
                      : log.status === "Warning"
                      ? "warning"
                      : "danger"
                  }
                >
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
          <Modal.Title>Log Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentLog && (
            <>
              <p><strong>User:</strong> {currentLog.user}</p>
              <p><strong>Action:</strong> {currentLog.action}</p>
              <p><strong>Module:</strong> {currentLog.module}</p>
              <p><strong>IP Address:</strong> {currentLog.ip}</p>
              <p><strong>Date:</strong> {currentLog.date}</p>
              <p><strong>Status:</strong> {currentLog.status}</p>
              <p><strong>Details:</strong> {currentLog.details}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AuditLogs;