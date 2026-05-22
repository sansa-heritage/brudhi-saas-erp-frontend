import React, { useState } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";

const SystemMaintenance = () => {
  const [backups, setBackups] = useState([
    {
      id: 1,
      name: "Backup-April",
      date: "2026-04-14",
      size: "120MB",
      status: "Completed",
    },
  ]);

  const [show, setShow] = useState(false);
  const [restoreShow, setRestoreShow] = useState(false);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });

  const [selectedBackup, setSelectedBackup] = useState(null);

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  // Create Backup
  const handleAdd = () => {
    setBackups([
      ...backups,
      {
        id: Date.now(),
        name: formData.name,
        date: new Date().toISOString().split("T")[0],
        size: "100MB",
        status: "Completed",
      },
    ]);
    setFormData({ name: "" });
    setShow(false);
  };

  // Delete Backup
  const handleDelete = (id) => {
    setBackups(backups.filter((b) => b.id !== id));
  };

  // Open Restore Modal
  const handleRestore = (backup) => {
    setSelectedBackup(backup);
    setRestoreShow(true);
  };

  return (
    <div className="p-4">
      <h3>System Maintenance (Backup & Restore)</h3>

      {/* Maintenance Toggle */}
      <div className="mb-3">
        <Form.Check
          type="switch"
          label="Maintenance Mode"
          checked={maintenanceMode}
          onChange={() => setMaintenanceMode(!maintenanceMode)}
        />
      </div>

      {/* Add Backup Button */}
      <Button className="mb-3" onClick={() => setShow(true)}>
        + Create Backup
      </Button>

      {/* Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Backup Name</th>
            <th>Date</th>
            <th>Size</th>
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
              <td>{b.size}</td>
              <td>
                <Badge bg={b.status === "Completed" ? "success" : "danger"}>
                  {b.status}
                </Badge>
              </td>
              <td>
                <Button size="sm" variant="info" onClick={() => handleRestore(b)}>
                  Restore
                </Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create Backup Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Backup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              name="name"
              placeholder="Backup Name"
              value={formData.name}
              onChange={handleChange}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAdd}>Create</Button>
        </Modal.Footer>
      </Modal>

      {/* Restore Modal */}
      <Modal show={restoreShow} onHide={() => setRestoreShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Restore Backup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBackup && (
            <p>
              Are you sure you want to restore <strong>{selectedBackup.name}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRestoreShow(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={() => setRestoreShow(false)}>
            Confirm Restore
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SystemMaintenance;