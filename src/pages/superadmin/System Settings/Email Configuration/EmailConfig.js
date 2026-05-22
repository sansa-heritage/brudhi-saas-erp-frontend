import React, { useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";

const EmailConfig = () => {
  const [configs, setConfigs] = useState([
    {
      id: 1,
      host: "smtp.gmail.com",
      port: "587",
      username: "admin@gmail.com",
      password: "123456",
      encryption: "TLS",
    },
  ]);

  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);

  const [currentConfig, setCurrentConfig] = useState(null);
  const [formData, setFormData] = useState({
    host: "",
    port: "",
    username: "",
    password: "",
    encryption: "TLS",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add
  const handleAdd = () => {
    setConfigs([...configs, { ...formData, id: Date.now() }]);
    setFormData({ host: "", port: "", username: "", password: "", encryption: "TLS" });
    setShow(false);
  };

  // Delete
  const handleDelete = (id) => {
    setConfigs(configs.filter((c) => c.id !== id));
  };

  // View
  const handleView = (config) => {
    setCurrentConfig(config);
    setViewShow(true);
  };

  // Edit Open
  const handleEditOpen = (config) => {
    setCurrentConfig(config);
    setFormData(config);
    setEditShow(true);
  };

  // Update
  const handleUpdate = () => {
    const updated = configs.map((c) =>
      c.id === currentConfig.id ? { ...formData, id: c.id } : c
    );
    setConfigs(updated);
    setEditShow(false);
  };

  return (
    <div className="p-4">
      <h3>Email Configuration (System Settings)</h3>

      <Button className="mb-3" onClick={() => setShow(true)}>
        + Add Config
      </Button>

      {/* Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Host</th>
            <th>Port</th>
            <th>Username</th>
            <th>Encryption</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {configs.map((c, i) => (
            <tr key={c.id}>
              <td>{i + 1}</td>
              <td>{c.host}</td>
              <td>{c.port}</td>
              <td>{c.username}</td>
              <td>{c.encryption}</td>
              <td>
                <Button size="sm" onClick={() => handleView(c)}>View</Button>{" "}
                <Button size="sm" variant="warning" onClick={() => handleEditOpen(c)}>Edit</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Email Config</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control name="host" placeholder="SMTP Host" onChange={handleChange} className="mb-2" />
            <Form.Control name="port" placeholder="Port" onChange={handleChange} className="mb-2" />
            <Form.Control name="username" placeholder="Email" onChange={handleChange} className="mb-2" />

            <Form.Control
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              className="mb-2"
            />

            <Form.Check
              label="Show Password"
              onChange={() => setShowPassword(!showPassword)}
            />

            <Form.Select name="encryption" onChange={handleChange}>
              <option>TLS</option>
              <option>SSL</option>
            </Form.Select>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAdd}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Config Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentConfig && (
            <>
              <p><strong>Host:</strong> {currentConfig.host}</p>
              <p><strong>Port:</strong> {currentConfig.port}</p>
              <p><strong>Email:</strong> {currentConfig.username}</p>
              <p><strong>Password:</strong> {currentConfig.password}</p>
              <p><strong>Encryption:</strong> {currentConfig.encryption}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Config</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control name="host" value={formData.host} onChange={handleChange} className="mb-2" />
            <Form.Control name="port" value={formData.port} onChange={handleChange} className="mb-2" />
            <Form.Control name="username" value={formData.username} onChange={handleChange} className="mb-2" />

            <Form.Control
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="mb-2"
            />

            <Form.Check
              label="Show Password"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />

            <Form.Select name="encryption" value={formData.encryption} onChange={handleChange}>
              <option>TLS</option>
              <option>SSL</option>
            </Form.Select>
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

export default EmailConfig;