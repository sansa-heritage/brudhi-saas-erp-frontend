import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const RevenueAnalytics = () => {
  const [show, setShow] = useState(false);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "All",
  });

  const data = [
    { month: "Jan", revenue: 10000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 20000 },
    { month: "Apr", revenue: 18000 },
  ];

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4">
      <h3>Revenue Analytics</h3>

      {/* Filter Button */}
      <Button className="mb-3" onClick={() => setShow(true)}>
        Filter
      </Button>

      {/* Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="p-3 shadow">
            <h5>Total Revenue</h5>
            <h3>₹{totalRevenue}</h3>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow">
            <h5>Monthly Avg</h5>
            <h3>₹{Math.round(totalRevenue / data.length)}</h3>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 shadow">
            <h5>Growth</h5>
            <h3>+12%</h3>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col md={6}>
          <Card className="p-3 shadow">
            <h6>Monthly Revenue</h6>
            <LineChart width={400} height={250} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#007bff" />
            </LineChart>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-3 shadow">
            <h6>Revenue Breakdown</h6>
            <BarChart width={400} height={250} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#28a745" />
            </BarChart>
          </Card>
        </Col>
      </Row>

      {/* Filter Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Filter Revenue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Select
              name="status"
              value={filters.status}
              onChange={handleChange}
            >
              <option>All</option>
              <option>Paid</option>
              <option>Pending</option>
            </Form.Select>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Apply</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RevenueAnalytics;