import React, { useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";

const Roles = () => {
  const [roles, setRoles] = useState([
    { id: 1, name: "Admin", permissions: ["Add", "Edit", "Delete"] },
  ]);

  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);

  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });

  const allPermissions = ["Add", "Edit", "Delete", "View"];

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  // Handle checkbox
  const handlePermissionChange = (perm) => {
    const updated = formData.permissions.includes(perm)
      ? formData.permissions.filter((p) => p !== perm)
      : [...formData.permissions, perm];

    setFormData({ ...formData, permissions: updated });
  };

  // Add Role
  const handleAdd = () => {
    setRoles([...roles, { ...formData, id: Date.now() }]);
    setFormData({ name: "", permissions: [] });
    setShow(false);
  };

  // Delete
  const handleDelete = (id) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  // View
  const handleView = (role) => {
    setCurrentRole(role);
    setViewShow(true);
  };

  // Edit Open
  const handleEditOpen = (role) => {
    setCurrentRole(role);
    setFormData(role);
    setEditShow(true);
  };

  // Update
  const handleUpdate = () => {
    const updated = roles.map((r) =>
      r.id === currentRole.id ? { ...formData, id: r.id } : r
    );
    setRoles(updated);
    setEditShow(false);
  };

  return (
    <div className="p-4">
      <h3>Role Management</h3>

      <Button className="mb-3" onClick={() => setShow(true)}>
        + Add Role
      </Button>

      {/* Table */}
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Role Name</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {roles.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td>{r.name}</td>
              <td>{r.permissions.join(", ")}</td>
              <td>
                <Button size="sm" onClick={() => handleView(r)}>View</Button>{" "}
                <Button size="sm" variant="warning" onClick={() => handleEditOpen(r)}>Edit</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              placeholder="Role Name"
              value={formData.name}
              onChange={handleChange}
              className="mb-2"
            />

            {allPermissions.map((perm) => (
              <Form.Check
                key={perm}
                label={perm}
                onChange={() => handlePermissionChange(perm)}
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAdd}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Role Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentRole && (
            <>
              <p><strong>Name:</strong> {currentRole.name}</p>
              <p><strong>Permissions:</strong> {currentRole.permissions.join(", ")}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              value={formData.name}
              onChange={handleChange}
              className="mb-2"
            />

            {allPermissions.map((perm) => (
              <Form.Check
                key={perm}
                label={perm}
                checked={formData.permissions.includes(perm)}
                onChange={() => handlePermissionChange(perm)}
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Roles;