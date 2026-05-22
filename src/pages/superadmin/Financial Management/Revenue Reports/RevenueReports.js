import React, { useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";

const RevenueReports = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      date: "2026-04-10",
      revenue: 20000,
      expense: 8000,
      profit: 12000,
    },
  ]);

  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);

  const [current, setCurrent] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    revenue: "",
    expense: "",
  });

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate profit
  const calculateProfit = (revenue, expense) => {
    return revenue - expense;
  };

  // Add
  const handleAdd = () => {
    const profit = calculateProfit(
      Number(formData.revenue),
      Number(formData.expense)
    );

    setReports([
      ...reports,
      { ...formData, profit, id: Date.now() },
    ]);

    setFormData({ date: "", revenue: "", expense: "" });
    setShow(false);
  };

  // Delete
  const handleDelete = (id) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  // View
  const handleView = (data) => {
    setCurrent(data);
    setViewShow(true);
  };

  // Edit Open
  const handleEditOpen = (data) => {
    setCurrent(data);
    setFormData(data);
    setEditShow(true);
  };

  // Update
  const handleUpdate = () => {
    const profit = calculateProfit(
      Number(formData.revenue),
      Number(formData.expense)
    );

    const updated = reports.map((r) =>
      r.id === current.id
        ? { ...formData, profit, id: r.id }
        : r
    );

    setReports(updated);
    setEditShow(false);
  };

  return (
    <div className="p-4">
      <h3>Revenue Reports</h3>

      <Button className="mb-3" onClick={() => setShow(true)}>
        + Add Record
      </Button>

      {/* Table */}
      <Table bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Revenue</th>
            <th>Expense</th>
            <th>Profit</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              <td>{r.date}</td>
              <td>₹{r.revenue}</td>
              <td>₹{r.expense}</td>
              <td style={{ color: "green" }}>₹{r.profit}</td>
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
          <Modal.Title>Add Revenue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="revenue"
              placeholder="Revenue Amount"
              value={formData.revenue}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="expense"
              placeholder="Expense Amount"
              value={formData.expense}
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
          <Modal.Title>Report Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {current && (
            <>
              <p><strong>Date:</strong> {current.date}</p>
              <p><strong>Revenue:</strong> ₹{current.revenue}</p>
              <p><strong>Expense:</strong> ₹{current.expense}</p>
              <p><strong>Profit:</strong> ₹{current.profit}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="expense"
              value={formData.expense}
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

export default RevenueReports;