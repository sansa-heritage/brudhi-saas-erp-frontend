import React, { useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";

const RestoreBackup = () => {
  const [backups, setBackups] = useState([
    {
      id: 1,
      name: "backup_2026_04_10.sql",
      date: "2026-04-10",
      size: "2MB",
    },
  ]);

  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);

  const [currentBackup, setCurrentBackup] = useState(null);
  const [file, setFile] = useState(null);

  // Handle file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Add Backup
  const handleAdd = () => {
    if (!file) return;

    const newBackup = {
      id: Date.now(),
      name: file.name,
      date: new Date().toISOString().split("T")[0],
      size: `${(file.size / 1024).toFixed(2)} KB`,
    };

    setBackups([...backups, newBackup]);
    setFile(null);
    setShow(false);
  };

  // Delete
  const handleDelete = (id) => {
    setBackups(backups.filter((b) => b.id !== id));
  };

  // View
  const handleView = (backup) => {
    setCurrentBackup(backup);
    setViewShow(true);
  };

  // Restore (simulate)
  const handleRestore = (backup) => {
    alert(`Restored backup: ${backup.name}`);
  };

  return (
    <div className="p-4">
      <h3>Backup & Restore Management</h3>

      <Button className="mb-3" onClick={() => setShow(true)}>
        + Upload Backup
      </Button>

      {/* Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>File Name</th>
            <th>Date</th>
            <th>Size</th>
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
                <Button size="sm" onClick={() => handleView(b)}>View</Button>{" "}
                <Button size="sm" variant="success" onClick={() => handleRestore(b)}>Restore</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Upload Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Backup File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control type="file" onChange={handleFileChange} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAdd}>Upload</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Backup Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentBackup && (
            <>
              <p><strong>Name:</strong> {currentBackup.name}</p>
              <p><strong>Date:</strong> {currentBackup.date}</p>
              <p><strong>Size:</strong> {currentBackup.size}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RestoreBackup;