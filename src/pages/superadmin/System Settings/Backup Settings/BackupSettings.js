import React, { useState } from "react";
import { Card, Button, Modal, Form, Table, Badge } from "react-bootstrap";

const BackupSettings = () => {
  const [autoBackup, setAutoBackup] = useState(false);
  const [schedule, setSchedule] = useState("Daily");

  const [backups, setBackups] = useState([
    { id: 1, name: "Backup_2026_04_10", date: "2026-04-10", status: "Success" },
  ]);

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);

  const [currentBackup, setCurrentBackup] = useState(null);

  // Create Backup
  const handleBackupNow = () => {
    const newBackup = {
      id: Date.now(),
      name: `Backup_${new Date().toISOString().slice(0, 10)}`,
      date: new Date().toISOString().slice(0, 10),
      status: "Success",
    };
    setBackups([newBackup, ...backups]);
    setShowBackupModal(false);
  };

  // Delete Backup
  const handleDelete = (id) => {
    setBackups(backups.filter((b) => b.id !== id));
  };

  // View
  const handleView = (backup) => {
    setCurrentBackup(backup);
    setViewModal(true);
  };

  return (
    <div className="p-4">
      <h3>Backup Settings</h3>

      {/* Settings Card */}
      <Card className="mb-4 p-3">
        <h5>Auto Backup</h5>

        <Form.Check
          type="switch"
          label={autoBackup ? "Enabled" : "Disabled"}
          checked={autoBackup}
          onChange={() => setAutoBackup(!autoBackup)}
        />

        <Form.Select
          className="mt-3"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
        >
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </Form.Select>

        <Button
          className="mt-3"
          variant="primary"
          onClick={() => setShowBackupModal(true)}
        >
          Backup Now
        </Button>
      </Card>

      {/* Backup History */}
      <h5>Backup History</h5>
      <Table bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {backups.map((b, i) => (
            <tr key={b.id}>
              <td>{i + 1}</td>
              <td>{b.name}</td>
              <td>{b.date}</td>
              <td>
                <Badge bg="success">{b.status}</Badge>
              </td>
              <td>
                <Button size="sm" onClick={() => handleView(b)}>View</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Backup Confirmation Modal */}
      <Modal show={showBackupModal} onHide={() => setShowBackupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Backup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to create a backup?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBackupModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBackupNow}>
            Yes, Backup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewModal} onHide={() => setViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Backup Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentBackup && (
            <>
              <p><strong>Name:</strong> {currentBackup.name}</p>
              <p><strong>Date:</strong> {currentBackup.date}</p>
              <p><strong>Status:</strong> {currentBackup.status}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BackupSettings;