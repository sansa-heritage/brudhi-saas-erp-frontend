import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaRupeeSign,
  FaFileInvoice,
  FaChartLine,
  FaMoneyBillWave,
  FaUsers
} from "react-icons/fa";
import WeeklySalesChart from "../components/Charts/WeeklySalesChart";

const Dashboard = () => {
  const [role, setRole] = useState("admin");

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole) setRole(userRole);
  }, []);

  // ✅ Admin Stats
  const adminStats = [
    {
      title: "Total Sales",
      value: "₹5,42,800",
      change: "+12.5% from last month",
      icon: <FaRupeeSign size={32} />,
      color: "primary",
      bg: "bg-primary-subtle",
    },
    {
      title: "Tax Collected",
      value: "₹82,800",
      change: "+8.2% from last month",
      icon: <FaChartLine size={32} />,
      color: "success",
      bg: "bg-success-subtle",
    },
    {
      title: "Total Expenses",
      value: "₹3,50,500",
      change: "+5.1% from last month",
      icon: <FaMoneyBillWave size={32} />,
      color: "danger",
      bg: "bg-danger-subtle",
    },
    {
      title: "Pending Invoices",
      value: "1",
      change: "3 total invoices",
      icon: <FaFileInvoice size={32} />,
      color: "warning",
      bg: "bg-warning-subtle",
    },
  ];

  // ✅ SuperAdmin Stats (Analytics)
  const superAdminStats = [
    {
      title: "Total Admins",
      value: "12",
      change: "+2 added this month",
      icon: <FaUsers size={32} />,
      color: "primary",
      bg: "bg-primary-subtle",
    },
    {
      title: "Total Revenue",
      value: "₹25,42,800",
      change: "+15% growth",
      icon: <FaRupeeSign size={32} />,
      color: "success",
      bg: "bg-success-subtle",
    },
    {
      title: "Active Businesses",
      value: "8",
      change: "+1 new onboarded",
      icon: <FaChartLine size={32} />,
      color: "info",
      bg: "bg-info-subtle",
    },
    {
      title: "System Alerts",
      value: "2",
      change: "Needs attention",
      icon: <FaFileInvoice size={32} />,
      color: "danger",
      bg: "bg-danger-subtle",
    },
  ];

  const stats = role === "superadmin" ? superAdminStats : adminStats;

  return (
    <Container fluid className="p-4">
      
      {/* ✅ Updated Title */}
      <h2 className="mb-2">
        {role === "superadmin" ? "Overview / Analytics" : "Dashboard"}
      </h2>

      {/* ✅ Updated Subtitle */}
      <p className="text-muted mb-4">
        {role === "superadmin"
          ? "System-wide insights and analytics"
          : "Overview of your business performance"}
      </p>

      <Row className="mb-4">
        {stats.map((stat, idx) => (
          <Col lg={3} md={6} key={idx}>
            <Card className="stat-card shadow-sm mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2">{stat.title}</h6>
                    <h3 className="mb-2">{stat.value}</h3>
                    <small className={`text-${stat.color}`}>
                      {stat.change}
                    </small>
                  </div>
                  <div className={`p-3 rounded ${stat.bg} text-${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ✅ Hide chart for superadmin */}
      {role !== "superadmin" && (
        <Row>
          <Col lg={8}>
            <WeeklySalesChart />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Dashboard;