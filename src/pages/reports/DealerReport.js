import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Row,
  Col,
  Form,
  Alert,
} from "react-bootstrap";
import {
  FaUserTie,
  FaDownload,
  FaArrowLeft,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getDealerReportData,
  exportReport,
} from "../../components/services/reportService";

const DealerReport = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const data = getDealerReportData();
      console.log("Loaded dealer report data:", data);
      setReportData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading dealer report:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData) {
      exportReport("Dealer", reportData);
    }
  };

  const filteredDealers = reportData?.dealers?.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.dealerCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dealer report data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <Alert variant="danger" className="text-center">
          <h5>Error Loading Data</h5>
          <p>{error}</p>
          <Button variant="primary" onClick={loadData}>Retry</Button>
        </Alert>
      </Container>
    );
  }

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
            <FaUserTie className="me-2 text-danger" /> Dealer Report
          </h2>
          <p className="text-muted">
            Dealer performance and commission analysis
          </p>
        </div>
        <Button
          variant="danger"
          onClick={handleExport}
          className="rounded-pill px-4"
          disabled={!reportData}
        >
          <FaDownload className="me-2" /> Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small className="text-muted">Total Dealers</small>
                <h3 className="text-primary mb-0">{reportData?.totalDealers || 0}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small className="text-muted">Active Dealers</small>
                <h3 className="text-success mb-0">{reportData?.activeDealers || 0}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small className="text-muted">Total Sales</small>
                <h3 className="text-info mb-0">
                  ₹{(reportData?.totalSales || 0).toLocaleString()}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div>
                <small className="text-muted">Total Commission</small>
                <h3 className="text-warning mb-0">
                  ₹{(reportData?.totalCommission || 0).toLocaleString()}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Form.Control
            type="text"
            placeholder="Search by dealer name, company or dealer code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-pill"
          />
        </Card.Body>
      </Card>

      {/* No Data Message */}
      {(!reportData?.dealers || reportData.dealers.length === 0) && (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="text-center py-5">
            <FaUserTie size={50} className="text-muted mb-3" />
            <h5 className="text-muted">No Dealer Data Available</h5>
            <p className="text-muted">Add dealers to see the report.</p>
            <Button variant="primary" onClick={() => navigate("/dealers")}>
              Go to Dealers
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Dealers Table */}
      {reportData?.dealers && reportData.dealers.length > 0 && (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Dealer Code</th>
                    <th>Dealer Name</th>
                    <th>Type</th>
                    <th>Territory</th>
                    <th>Orders</th>
                    <th>Sales</th>
                    <th>Commission</th>
                    <th className="pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDealers?.map((dealer) => (
                    <tr key={dealer.id}>
                      <td className="ps-4">
                        <code>{dealer.dealerCode}</code>
                      </td>
                      <td>
                        <div className="fw-semibold">{dealer.name}</div>
                        <small className="text-muted">{dealer.companyName}</small>
                      </td>
                      <td>
                        <Badge bg="info" className="rounded-pill">
                          {dealer.dealerType}
                        </Badge>
                      </td>
                      <td>{dealer.territory}</td>
                      <td>{dealer.totalOrders || 0}</td>
                      <td className="fw-semibold text-primary">
                        ₹{(dealer.totalSales || 0).toLocaleString()}
                      </td>
                      <td className="fw-semibold text-success">
                        ₹{(dealer.totalCommission || 0).toLocaleString()}
                      </td>
                      <td className="pe-4">
                        <Badge
                          bg={dealer.status === "active" ? "success" : "danger"}
                          className="rounded-pill"
                        >
                          {dealer.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredDealers?.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No dealers found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      <style jsx="true">{`
        .rounded-4 {
          border-radius: 1rem !important;
        }
      `}</style>
    </Container>
  );
};

export default DealerReport;