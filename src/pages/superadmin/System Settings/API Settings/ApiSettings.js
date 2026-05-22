import React, { useState } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";

const ApiSettings = () => {
  const [apis, setApis] = useState([
    {
      id: 1,
      name: "SMS API",
      baseUrl: "https://sms.api.com",
      apiKey: "123456",
      status: "Active",
    },
  ]);

  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);

  const [currentApi, setCurrentApi] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    baseUrl: "",
    apiKey: "",
    status: "Active",
  });

  // Handle Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add API
  const handleAdd = () => {
    setApis([...apis, { ...formData, id: Date.now() }]);
    setFormData({ name: "", baseUrl: "", apiKey: "", status: "Active" });
    setShow(false);
  };

  // Delete
  const handleDelete = (id) => {
    setApis(apis.filter((api) => api.id !== id));
  };

  // View
  const handleView = (api) => {
    setCurrentApi(api);
    setViewShow(true);
  };

  // Edit Open
  const handleEditOpen = (api) => {
    setCurrentApi(api);
    setFormData(api);
    setEditShow(true);
  };

  // Update
  const handleUpdate = () => {
    const updated = apis.map((api) =>
      api.id === currentApi.id ? { ...formData, id: api.id } : api
    );
    setApis(updated);
    setEditShow(false);
  };

  return (
    <div className="p-4">
      <h3>API Settings (System Settings)</h3>

      <Button className="mb-3" onClick={() => setShow(true)}>
        + Add API
      </Button>

      {/* Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>API Name</th>
            <th>Base URL</th>
            <th>API Key</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {apis.map((api, i) => (
            <tr key={api.id}>
              <td>{i + 1}</td>
              <td>{api.name}</td>
              <td>{api.baseUrl}</td>
              <td>****{api.apiKey.slice(-4)}</td>
              <td>
                <Badge bg={api.status === "Active" ? "success" : "secondary"}>
                  {api.status}
                </Badge>
              </td>
              <td>
                <Button size="sm" onClick={() => handleView(api)}>View</Button>{" "}
                <Button size="sm" variant="warning" onClick={() => handleEditOpen(api)}>Edit</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(api.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add API</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              name="name"
              placeholder="API Name"
              value={formData.name}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="baseUrl"
              placeholder="Base URL"
              value={formData.baseUrl}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="apiKey"
              placeholder="API Key"
              value={formData.apiKey}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Inactive</option>
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
          <Modal.Title>API Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentApi && (
            <>
              <p><strong>Name:</strong> {currentApi.name}</p>
              <p><strong>Base URL:</strong> {currentApi.baseUrl}</p>
              <p><strong>API Key:</strong> {currentApi.apiKey}</p>
              <p><strong>Status:</strong> {currentApi.status}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit API</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="baseUrl"
              value={formData.baseUrl}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Inactive</option>
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

export default ApiSettings;