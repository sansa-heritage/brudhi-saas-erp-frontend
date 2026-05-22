import React, { useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";

const Permissions = () => {
  const [permissions, setPermissions] = useState([
    {
      id: 1,
      module: "Customers",
      actions: ["Create", "Read", "Update", "Delete"],
    },
  ]);

  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);

  const [current, setCurrent] = useState(null);
  const [formData, setFormData] = useState({
    module: "",
    actions: [],
  });

  const allActions = ["Create", "Read", "Update", "Delete"];

  // Handle module name
  const handleChange = (e) => {
    setFormData({ ...formData, module: e.target.value });
  };

  // Handle checkbox
  const handleActionChange = (action) => {
    const updated = formData.actions.includes(action)
      ? formData.actions.filter((a) => a !== action)
      : [...formData.actions, action];

    setFormData({ ...formData, actions: updated });
  };

  // Add
  const handleAdd = () => {
    setPermissions([...permissions, { ...formData, id: Date.now() }]);
    setFormData({ module: "", actions: [] });
    setShow(false);
  };

  // Delete
  const handleDelete = (id) => {
    setPermissions(permissions.filter((p) => p.id !== id));
  };

  // View
  const handleView = (p) => {
    setCurrent(p);
    setViewShow(true);
  };

  // Edit open
  const handleEditOpen = (p) => {
    setCurrent(p);
    setFormData(p);
    setEditShow(true);
  };

  // Update
  const handleUpdate = () => {
    const updated = permissions.map((p) =>
      p.id === current.id ? { ...formData, id: p.id } : p
    );
    setPermissions(updated);
    setEditShow(false);
  };

  return (
    <div className="p-4">
      <h3>Permission Management (Security)</h3>

      <Button className="mb-3" onClick={() => setShow(true)}>
        + Add Permission
      </Button>

      {/* Table */}
      <Table bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Module</th>
            <th>Actions</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {permissions.map((p, i) => (
            <tr key={p.id}>
              <td>{i + 1}</td>
              <td>{p.module}</td>
              <td>{p.actions.join(", ")}</td>
              <td>
                <Button size="sm" onClick={() => handleView(p)}>View</Button>{" "}
                <Button size="sm" variant="warning" onClick={() => handleEditOpen(p)}>Edit</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Permission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              placeholder="Module Name (e.g. Customers)"
              value={formData.module}
              onChange={handleChange}
              className="mb-2"
            />

            {allActions.map((action) => (
              <Form.Check
                key={action}
                label={action}
                onChange={() => handleActionChange(action)}
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
          <Modal.Title>Permission Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {current && (
            <>
              <p><strong>Module:</strong> {current.module}</p>
              <p><strong>Actions:</strong> {current.actions.join(", ")}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Permission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              value={formData.module}
              onChange={handleChange}
              className="mb-2"
            />

            {allActions.map((action) => (
              <Form.Check
                key={action}
                label={action}
                checked={formData.actions.includes(action)}
                onChange={() => handleActionChange(action)}
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

export default Permissions;