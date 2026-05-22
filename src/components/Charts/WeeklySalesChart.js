import React from "react";
import { Card } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", sales: 38000, tax: 6840, expenses: 25000 },
  { day: "Tue", sales: 52000, tax: 9360, expenses: 28000 },
  { day: "Wed", sales: 48000, tax: 8640, expenses: 26000 },
  { day: "Thu", sales: 65000, tax: 11700, expenses: 30000 },
  { day: "Fri", sales: 71000, tax: 12780, expenses: 32000 },
  { day: "Sat", sales: 45000, tax: 8100, expenses: 24000 },
  { day: "Sun", sales: 28000, tax: 5040, expenses: 18000 },
];

const WeeklySalesChart = () => {
  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Card.Title className="mb-3">This Week's Performance</Card.Title>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#0d6efd"
              name="Sales"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="tax"
              stroke="#198754"
              name="Tax Collected"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default WeeklySalesChart;
