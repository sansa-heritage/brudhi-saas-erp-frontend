import React, { useState } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";

const DatabaseBackup = () => {
  const [backups, setBackups] = useState([
    {
      id: 1,
      name: "Backup_April_10",
      date: "2026-04-10",
      size: "2.5 MB",
      status: "Success",
    },
  ]);

  const [show, setShow] = useState(false);
  const [restoreShow, setRestoreShow] = useState(false);

  const [currentBackup, setCurrentBackup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Full Backup",
  });

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create Backup
  const handleAdd = () => {
    const newBackup = {
      id: Date.now(),
      name: formData.name,
      date: new Date().toISOString().split("T")[0],
      size: "3 MB",
      status: "Success",
    };

    setBackups([...backups, newBackup]);
    setFormData({ name: "", type: "Full Backup" });
    setShow(false);
  };

  // Delete
  const handleDelete = (id) => {
    setBackups(backups.filter((b) => b.id !== id));
  };

  // Restore
  const handleRestore = () => {
    alert("Backup Restored Successfully ✅");
    setRestoreShow(false);
  };

  return (
    <div className="p-4">
      <h3>Database Backup (Backup & Maintenance)</h3>

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
                <Badge bg={b.status === "Success" ? "success" : "danger"}>
                  {b.status}
                </Badge>
              </td>
              <td>
                <Button size="sm" variant="info">
                  Download
                </Button>{" "}
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => {
                    setCurrentBackup(b);
                    setRestoreShow(true);
                  }}
                >
                  Restore
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(b.id)}
                >
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
              className="mb-2"
            />

            <Form.Select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option>Full Backup</option>
              <option>Partial Backup</option>
            </Form.Select>
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
          {currentBackup && (
            <p>
              Are you sure you want to restore <b>{currentBackup.name}</b>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRestoreShow(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleRestore}>
            Restore
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DatabaseBackup;