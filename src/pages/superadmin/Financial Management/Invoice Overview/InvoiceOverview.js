import React, { useState } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";

const InvoiceOverview = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      customer: "Rahul Sharma",
      amount: 5000,
      date: "2026-04-10",
      status: "Paid",
    },
  ]);

  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);

  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    date: "",
    status: "Pending",
  });

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Invoice
  const handleAdd = () => {
    setInvoices([...invoices, { ...formData, id: Date.now() }]);
    setFormData({ customer: "", amount: "", date: "", status: "Pending" });
    setShow(false);
  };

  // Delete
  const handleDelete = (id) => {
    setInvoices(invoices.filter((inv) => inv.id !== id));
  };

  // View
  const handleView = (invoice) => {
    setCurrentInvoice(invoice);
    setViewShow(true);
  };

  // Edit Open
  const handleEditOpen = (invoice) => {
    setCurrentInvoice(invoice);
    setFormData(invoice);
    setEditShow(true);
  };

  // Update
  const handleUpdate = () => {
    const updated = invoices.map((inv) =>
      inv.id === currentInvoice.id ? { ...formData, id: inv.id } : inv
    );
    setInvoices(updated);
    setEditShow(false);
  };

  return (
    <div className="p-4">
      <h3>Invoice Overview (Financial Management)</h3>

      <Button className="mb-3" onClick={() => setShow(true)}>
        + Add Invoice
      </Button>

      {/* Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv, i) => (
            <tr key={inv.id}>
              <td>{i + 1}</td>
              <td>{inv.customer}</td>
              <td>₹{inv.amount}</td>
              <td>{inv.date}</td>
              <td>
                <Badge bg={inv.status === "Paid" ? "success" : "warning"}>
                  {inv.status}
                </Badge>
              </td>
              <td>
                <Button size="sm" onClick={() => handleView(inv)}>View</Button>{" "}
                <Button size="sm" variant="warning" onClick={() => handleEditOpen(inv)}>Edit</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(inv.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              name="customer"
              placeholder="Customer Name"
              value={formData.customer}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="amount"
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Paid</option>
              <option>Pending</option>
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
          <Modal.Title>Invoice Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentInvoice && (
            <>
              <p><strong>Customer:</strong> {currentInvoice.customer}</p>
              <p><strong>Amount:</strong> ₹{currentInvoice.amount}</p>
              <p><strong>Date:</strong> {currentInvoice.date}</p>
              <p><strong>Status:</strong> {currentInvoice.status}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Paid</option>
              <option>Pending</option>
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

export default InvoiceOverview;