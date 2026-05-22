import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import {
  FaRupeeSign,
  FaChartLine,
  FaDownload,
  FaArrowLeft,
  FaWallet,
  FaPercent,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getFinancialReportData,
  exportReport,
} from "../../components/services/reportService";

const FinancialReport = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);
  const loadData = () => {
    setReportData(getFinancialReportData());
    setLoading(false);
  };
  const handleExport = () => exportReport("Financial", reportData);

  if (loading)
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">Loading...</div>
      </Container>
    );

  return (
    <Container fluid className="p-4 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 mb-2"
            onClick={() => navigate("/reports")}
          >
            <FaArrowLeft className="me-2" /> Back to Reports
          </Button>
          <h2 className="fw-bold mb-1">
            <FaWallet className="me-2 text-info" /> Financial Report
          </h2>
          <p className="text-muted">
            Revenue, expenses, profit and GST analysis
          </p>
        </div>
        <Button
          variant="info"
          onClick={handleExport}
          className="rounded-pill px-4"
        >
          <FaDownload className="me-2" /> Export Report
        </Button>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Total Revenue</small>
                  <h3 className="text-primary">
                    ₹{reportData?.totalRevenue?.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                  <FaRupeeSign size={24} className="text-primary" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Total Expenses</small>
                  <h3 className="text-danger">
                    ₹{reportData?.totalExpenses?.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-3 p-3">
                  <FaWallet size={24} className="text-danger" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Net Profit</small>
                  <h3 className="text-success">
                    ₹{reportData?.netProfit?.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded-3 p-3">
                  <FaChartLine size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Profit Margin</small>
                  <h3 className="text-warning">
                    {reportData?.profitMargin?.toFixed(1)}%
                  </h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                  <FaPercent size={24} className="text-warning" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <h6 className="fw-bold">GST Summary</h6>
              <Table borderless className="mb-0">
                <tbody>
                  <tr>
                    <td>Total GST Collected</td>
                    <td className="text-end fw-bold">
                      ₹{reportData?.totalGSTCollected?.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td>Input Tax Credit (ITC)</td>
                    <td className="text-end fw-bold text-success">
                      ₹{reportData?.totalITC?.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-top">
                    <td>
                      <strong>Net GST Payable</strong>
                    </td>
                    <td className="text-end fw-bold text-primary">
                      ₹{reportData?.netGSTPayable?.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <h6 className="fw-bold">Expenses by Category</h6>
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.expensesByCategory?.map((exp, idx) => (
                    <tr key={idx}>
                      <td>{exp.category}</td>
                      <td>₹{exp.amount.toLocaleString()}</td>
                      <td>
                        {(
                          (exp.amount / reportData.totalExpenses) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx="true">{`
        .rounded-4 {
          border-radius: 1rem !important;
        }
      `}</style>
    </Container>
  );
};

export default FinancialReport;
