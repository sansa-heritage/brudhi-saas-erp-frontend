import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Spinner,
  Alert,
  Table,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaDownload,
  FaPrint,
  FaMoneyBillWave,
  FaUser,
  FaCalendarAlt,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBuilding,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPayrollById,
  downloadPDFPayslip,
} from "../../api/tenant/payroll.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PayrollDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadPayrollDetails();
  }, [id]);

  const loadPayrollDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPayrollById(id);
      let payrollData = null;

      if (response?.data?.data) {
        payrollData = response.data.data;
      } else if (response?.data) {
        payrollData = response.data;
      } else if (response) {
        payrollData = response;
      }

      setPayroll(payrollData);
    } catch (error) {
      console.error("Failed to load payroll details:", error);
      setError(
        error.response?.data?.message || "Failed to load payroll details",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = async () => {
    setDownloading(true);
    try {
      const response = await downloadPDFPayslip(id);

      // Check if response has data
      if (!response || !response.data) {
        throw new Error("No data received from server");
      }

      // Create blob from response data
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Verify blob is valid PDF
      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      // Create download URL
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Set filename
      const month = payroll?.payroll_month
        ? new Date(payroll.payroll_month)
            .toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
            })
            .replace(/ /g, "_")
        : "payslip";

      link.setAttribute(
        "download",
        `payslip_${payroll?.staff_code || "staff"}_${month}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Payslip downloaded successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download payslip", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    try {
      toast.info("Preparing payslip for print...", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      const response = await downloadPDFPayslip(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Open in new tab for printing
      const printWindow = window.open(url, "_blank");
      if (!printWindow) {
        toast.error("Popup blocked! Please allow popups for this site.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }

      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to open payslip for printing", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPaymentStatusBadge = (status) => {
    const config = {
      pending: {
        bg: "#FEF6D7",
        color: "#FED229",
        label: "Pending",
        icon: <FaClock size={12} />,
      },
      paid: {
        bg: "#ECFDF3",
        color: "#027A48",
        label: "Paid",
        icon: <FaCheckCircle size={12} />,
      },
      failed: {
        bg: "#FFDCE2",
        color: "#F94765",
        label: "Failed",
        icon: <FaTimesCircle size={12} />,
      },
      processing: {
        bg: "#D3EAFF",
        color: "#437EF7",
        label: "Processing",
        icon: <FaClock size={12} />,
      },
    };
    const c = config[status] || config.pending;
    return (
      <span
        style={{
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "600",
          backgroundColor: c.bg,
          color: c.color,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {c.icon}
        {c.label}
      </span>
    );
  };

  const getMonthName = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Container fluid className="px-4 py-3">
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading payroll details...</h4>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="px-4 py-3">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
          transition={Bounce}
        />
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
        <div className="text-center">
          <Button variant="primary" onClick={() => navigate("/payroll/list")}>
            Back to Payroll List
          </Button>
        </div>
      </Container>
    );
  }

  if (!payroll) {
    return (
      <Container fluid className="px-4 py-3">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
          transition={Bounce}
        />
        <Alert variant="warning" className="text-center">
          Payroll record not found
        </Alert>
        <div className="text-center">
          <Button variant="primary" onClick={() => navigate("/payroll/list")}>
            Back to Payroll List
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="px-4 py-3"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {/* <Button
            variant="outline-secondary"
            onClick={() => navigate("/payroll/list")}
            style={{ borderRadius: "10px" }}
            className="mb-2"
          >
            <FaArrowLeft className="me-2" />
            Back to List
          </Button>
          <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            Payroll Details
          </h2>
          <p className="text-muted mb-0">View complete payroll information</p> */}
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-success"
            onClick={handleDownloadPayslip}
            disabled={downloading}
            style={{ borderRadius: "10px" }}
          >
            {downloading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Downloading...
              </>
            ) : (
              <>
                <FaDownload className="me-2" />
                Download Payslip
              </>
            )}
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handlePrint}
            style={{ borderRadius: "10px" }}
          >
            <FaPrint className="me-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Employee Summary Card */}
      <Card
        className="border-0 mb-4"
        style={{ borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <Card.Body className="p-4">
          <Row>
            <Col md={8}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "rgb(30, 58, 111)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {payroll.staff_name?.charAt(0) || "S"}
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{payroll.staff_name}</h3>
                  <div className="text-muted">
                    {/* <FaIdCard className="me-1" size={12} />
                    {payroll.staff_code} */}
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="mb-2">
                <span className="text-muted me-2">Payroll Status:</span>
                {getPaymentStatusBadge(payroll.payment_status)}
              </div>
              <div>
                <span className="text-muted me-2">Payment Date:</span>
                <strong>
                  {payroll.payment_date
                    ? formatDate(payroll.payment_date)
                    : "Not Paid"}
                </strong>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        {/* Salary Breakdown */}
        <Col lg={6}>
          <Card
            className="border-0 mb-4"
            style={{
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Card.Header
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "16px 16px 0 0",
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h6 className="mb-0 fw-bold">
                <FaMoneyBillWave className="me-2" />
                Salary Breakdown
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0" style={{ fontSize: "14px" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 20px" }} className="text-muted">
                      Basic Salary
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-semibold"
                    >
                      {formatCurrency(payroll.base_salary)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 20px" }} className="text-muted">
                      Allowances
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-semibold"
                    >
                      {formatCurrency(payroll.allowances)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 20px" }} className="text-muted">
                      Overtime Amount
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-semibold"
                    >
                      {formatCurrency(payroll.overtime_amount)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 20px" }} className="text-muted">
                      Bonus Amount
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-semibold"
                    >
                      {formatCurrency(payroll.bonus_amount)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 20px" }} className="text-muted">
                      Incentive Amount
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-semibold"
                    >
                      {formatCurrency(payroll.incentive_amount)}
                    </td>
                  </tr>
                  <tr
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <td style={{ padding: "16px 20px" }} className="fw-bold">
                      Total Earnings
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-bold"
                      style={{ color: "#027A48" }}
                    >
                      {formatCurrency(payroll.total_earnings)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Deductions */}
        <Col lg={6}>
          <Card
            className="border-0 mb-4"
            style={{
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Card.Header
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "16px 16px 0 0",
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h6 className="mb-0 fw-bold">
                <FaRupeeSign className="me-2" />
                Deductions
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0" style={{ fontSize: "14px" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 20px" }} className="text-muted">
                      PF Deduction (12%)
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-semibold"
                    >
                      {formatCurrency(payroll.pf_deduction)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 20px" }} className="text-muted">
                      ESIC Deduction (0.75%)
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-semibold"
                    >
                      {formatCurrency(payroll.esic_deduction)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 20px" }} className="text-muted">
                      Professional Tax
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-semibold"
                    >
                      {formatCurrency(payroll.professional_tax)}
                    </td>
                  </tr>
                  <tr
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <td style={{ padding: "16px 20px" }} className="fw-bold">
                      Total Deductions
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-end fw-bold"
                      style={{ color: "#dc3545" }}
                    >
                      {formatCurrency(payroll.total_deductions)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Net Salary Card */}
      <Row>
        <Col lg={12}>
          <Card
            className="border-0 mb-4"
            style={{
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, rgb(30, 58, 111) 0%, rgb(30, 58, 111) 100%)",
              color: "white",
            }}
          >
            <Card.Body className="p-4 text-center">
              <h6 className="mb-2 opacity-75">Net Salary</h6>
              <h1 className="fw-bold mb-0" style={{ fontSize: "48px" }}>
                {formatCurrency(payroll.net_salary)}
              </h1>
              <p className="mb-0 mt-2 opacity-75">
                After all deductions and allowances
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Payment Details */}
        <Col lg={6}>
          <Card
            className="border-0 mb-4"
            style={{
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Card.Header
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "16px 16px 0 0",
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h6 className="mb-0 fw-bold">
                <FaCreditCard className="me-2" />
                Payment Details
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Payment Status</small>
                    <div className="mt-1">
                      {getPaymentStatusBadge(payroll.payment_status)}
                    </div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Payment Mode</small>
                    <strong>{payroll.payment_mode || "N/A"}</strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Payment Date</small>
                    <strong>
                      {payroll.payment_date
                        ? formatDate(payroll.payment_date)
                        : "Not Paid"}
                    </strong>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Transaction ID</small>
                    <strong>{payroll.transaction_id || "N/A"}</strong>
                  </div>
                </Col>
              </Row>
              {payroll.remarks && (
                <div className="mt-2">
                  <small className="text-muted d-block">Remarks</small>
                  <p className="mb-0">{payroll.remarks}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Payroll Period */}
        <Col lg={6}>
          <Card
            className="border-0 mb-4"
            style={{
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Card.Header
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "16px 16px 0 0",
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h6 className="mb-0 fw-bold">
                <FaCalendarAlt className="me-2" />
                Payroll Period
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-3">
                <small className="text-muted d-block">Payroll Month</small>
                <h5 className="mb-0">{getMonthName(payroll.payroll_month)}</h5>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Generated On</small>
                <strong>{formatDate(payroll.created_at)}</strong>
              </div>
              <div>
                <small className="text-muted d-block">Last Updated</small>
                <strong>{formatDate(payroll.updated_at)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PayrollDetails;
