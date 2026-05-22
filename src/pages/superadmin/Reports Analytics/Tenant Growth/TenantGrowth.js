import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { Button, Modal, Form, Table } from "react-bootstrap";

const TenantGrowth = () => {
  const [data, setData] = useState([
    { id: 1, month: "Jan", tenants: 20 },
    { id: 2, month: "Feb", tenants: 30 },
  ]);

  const [show, setShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);

  const [formData, setFormData] = useState({ month: "", tenants: "" });
  const [current, setCurrent] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setData([...data, { ...formData, id: Date.now() }]);
    setFormData({ month: "", tenants: "" });
    setShow(false);
  };

  const handleDelete = (id) => {
    setData(data.filter((d) => d.id !== id));
  };

  const handleEditOpen = (item) => {
    setCurrent(item);
    setFormData(item);
    setEditShow(true);
  };

  const handleUpdate = () => {
    const updated = data.map((d) =>
      d.id === current.id ? { ...formData, id: d.id } : d
    );
    setData(updated);
    setEditShow(false);
  };

  const handleView = (item) => {
    setCurrent(item);
    setViewShow(true);
  };

  return (
    <div className="p-4">
      <h3>Tenant Growth Analytics</h3>

      <Button className="mb-3" onClick={() => setShow(true)}>
        + Add Data
      </Button>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="tenants" stroke="#007bff" />
        </LineChart>
      </ResponsiveContainer>

      {/* Table */}
      <Table bordered className="mt-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Month</th>
            <th>Tenants</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={d.id}>
              <td>{i + 1}</td>
              <td>{d.month}</td>
              <td>{d.tenants}</td>
              <td>
                <Button size="sm" onClick={() => handleView(d)}>View</Button>{" "}
                <Button size="sm" variant="warning" onClick={() => handleEditOpen(d)}>Edit</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(d.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Growth Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              name="month"
              placeholder="Month (Jan, Feb...)"
              value={formData.month}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="tenants"
              type="number"
              placeholder="Number of Tenants"
              value={formData.tenants}
              onChange={handleChange}
              className="mb-2"
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAdd}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {current && (
            <>
              <p><strong>Month:</strong> {current.month}</p>
              <p><strong>Tenants:</strong> {current.tenants}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="tenants"
              type="number"
              value={formData.tenants}
              onChange={handleChange}
              className="mb-2"
            />
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

export default TenantGrowth;