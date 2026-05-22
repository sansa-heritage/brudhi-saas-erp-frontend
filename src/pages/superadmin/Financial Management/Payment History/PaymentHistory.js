import React, { useState } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      customer: "Rahul Sharma",
      amount: 5000,
      method: "Cash",
      status: "Paid",
      date: "2026-04-10",
    },
  ]);

  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);

  const [currentPayment, setCurrentPayment] = useState(null);
  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    method: "Cash",
    status: "Paid",
    date: "",
  });

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Payment
  const handleAdd = () => {
    setPayments([...payments, { ...formData, id: Date.now() }]);
    setFormData({
      customer: "",
      amount: "",
      method: "Cash",
      status: "Paid",
      date: "",
    });
    setShow(false);
  };

  // Delete
  const handleDelete = (id) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  // View
  const handleView = (payment) => {
    setCurrentPayment(payment);
    setViewShow(true);
  };

  // Edit Open
  const handleEditOpen = (payment) => {
    setCurrentPayment(payment);
    setFormData(payment);
    setEditShow(true);
  };

  // Update
  const handleUpdate = () => {
    const updated = payments.map((p) =>
      p.id === currentPayment.id ? { ...formData, id: p.id } : p
    );
    setPayments(updated);
    setEditShow(false);
  };

  return (
    <div className="p-4">
      <h3>Payment History</h3>

      <Button className="mb-3" onClick={() => setShow(true)}>
        + Add Payment
      </Button>

      {/* Table */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Amount (₹)</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((p, i) => (
            <tr key={p.id}>
              <td>{i + 1}</td>
              <td>{p.customer}</td>
              <td>₹{p.amount}</td>
              <td>{p.method}</td>
              <td>
                <Badge bg={p.status === "Paid" ? "success" : "warning"}>
                  {p.status}
                </Badge>
              </td>
              <td>{p.date}</td>
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
          <Modal.Title>Add Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control name="customer" placeholder="Customer Name" value={formData.customer} onChange={handleChange} className="mb-2" />
            <Form.Control name="amount" type="number" placeholder="Amount" value={formData.amount} onChange={handleChange} className="mb-2" />

            <Form.Select name="method" value={formData.method} onChange={handleChange} className="mb-2">
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </Form.Select>

            <Form.Select name="status" value={formData.status} onChange={handleChange} className="mb-2">
              <option>Paid</option>
              <option>Pending</option>
            </Form.Select>

            <Form.Control name="date" type="date" value={formData.date} onChange={handleChange} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAdd}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentPayment && (
            <>
              <p><strong>Customer:</strong> {currentPayment.customer}</p>
              <p><strong>Amount:</strong> ₹{currentPayment.amount}</p>
              <p><strong>Method:</strong> {currentPayment.method}</p>
              <p><strong>Status:</strong> {currentPayment.status}</p>
              <p><strong>Date:</strong> {currentPayment.date}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control name="customer" value={formData.customer} onChange={handleChange} className="mb-2" />
            <Form.Control name="amount" type="number" value={formData.amount} onChange={handleChange} className="mb-2" />

            <Form.Select name="method" value={formData.method} onChange={handleChange} className="mb-2">
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </Form.Select>

            <Form.Select name="status" value={formData.status} onChange={handleChange} className="mb-2">
              <option>Paid</option>
              <option>Pending</option>
            </Form.Select>

            <Form.Control name="date" type="date" value={formData.date} onChange={handleChange} />
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

export default PaymentHistory;