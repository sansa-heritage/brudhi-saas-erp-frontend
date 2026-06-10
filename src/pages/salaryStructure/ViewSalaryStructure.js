import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaMoneyBillWave,
  FaUser,
  FaCalendarAlt,
  FaRupeeSign,
  FaBuilding,
  FaCar,
  FaMedkit,
  FaGift,
  FaPercent,
  FaPrint,
  FaDownload,
} from "react-icons/fa";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getSalaryStructure } from "../../api/tenant/salartStructure.api";
import Swal from "sweetalert2";

const ViewSalaryStructure = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSalaryStructure();
  }, [id]);

  const loadSalaryStructure = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSalaryStructure(id);
      console.log("Salary Structure Response:", response);

      let structureData = null;
      if (response?.data?.data) {
        structureData = response.data.data;
      } else if (response?.data) {
        structureData = response.data;
      } else if (response) {
        structureData = response;
      }

      setSalaryStructure(structureData);
    } catch (error) {
      console.error("Failed to load salary structure:", error);
      setError(
        error.response?.data?.message || "Failed to load salary structure",
      );
    } finally {
      setLoading(false);
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
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateTotalAllowances = () => {
    const allowances =
      (salaryStructure?.house_rent_allowance || 0) +
      (salaryStructure?.travel_allowance || 0) +
      (salaryStructure?.medical_allowance || 0) +
      (salaryStructure?.special_allowance || 0) +
      (salaryStructure?.other_allowances || 0);
    return allowances;
  };

  const calculateTotalEarnings = () => {
    return (salaryStructure?.basic_salary || 0) + calculateTotalAllowances();
  };

  const calculatePFDeduction = () => {
    return (
      calculateTotalEarnings() * ((salaryStructure?.pf_percent || 12) / 100)
    );
  };

  const calculateESICDeduction = () => {
    return (
      calculateTotalEarnings() * ((salaryStructure?.esic_percent || 0.75) / 100)
    );
  };

  const calculateTotalDeductions = () => {
    return (
      calculatePFDeduction() +
      calculateESICDeduction() +
      (salaryStructure?.professional_tax || 200)
    );
  };

  const calculateNetSalary = () => {
    return calculateTotalEarnings() - calculateTotalDeductions();
  };

  const handleEdit = () => {
    navigate(`/staff/salary-structure/edit/${id}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete salary structure for ${salaryStructure?.staff_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // Call delete API here
      toast.success("Salary structure deleted successfully!");
      navigate("/staff/salary-structure");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container
        fluid
        className="px-4 py-3"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading salary structure...</h4>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        fluid
        className="px-4 py-3"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
          transition={Bounce}
        />
        <Alert variant="danger" className="text-center">
          <h4>Error</h4>
          <p>{error}</p>
          <Button
            variant="secondary"
            onClick={() => navigate("/staff/salary-structure")}
          >
            Back to Salary Structures
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!salaryStructure) {
    return (
      <Container
        fluid
        className="px-4 py-3"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
          transition={Bounce}
        />
        <Alert variant="warning" className="text-center">
          <h4>Salary Structure Not Found</h4>
          <p>The salary structure you're looking for doesn't exist.</p>
          <Button
            variant="secondary"
            onClick={() => navigate("/staff/salary-structure")}
          >
            Back to Salary Structures
          </Button>
        </Alert>
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
      <div className="mb-4">
        {/* <Button
          variant="link"
          onClick={() => navigate("/staff/salary-structure")}
          className="text-decoration-none p-0 mb-2"
          style={{ color: "rgb(30, 58, 111)" }}
        >
          <FaArrowLeft className="me-1" size={14} />
          Back to Salary Structures
        </Button> */}
        <div className="d-flex justify-content-between align-items-start">
          <div>
            {/* <h3 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
              Salary Structure Details
            </h3>
            <p className="text-muted mb-0">
              View complete salary breakdown and components
            </p> */}
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={handlePrint}
              style={{ borderRadius: "10px" }}
            >
              <FaPrint className="me-2" /> Print
            </Button>
            {/* <Button
              variant="outline-primary"
              onClick={handleEdit}
              style={{ borderRadius: "10px" }}
            >
              <FaEdit className="me-2" /> Edit Structure
            </Button>
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              style={{ borderRadius: "10px" }}
            >
              <FaTrash className="me-2" /> Delete
            </Button> */}
          </div>
        </div>
      </div>

      {/* Employee Summary Card */}
      <div
        className="d-flex justify-content-between align-items-start mb-4 p-3"
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div className="d-flex align-items-center gap-3">
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
            {salaryStructure.staff_name?.charAt(0) || "S"}
          </div>
          <div>
            <h4 className="fw-bold mb-0">{salaryStructure.staff_name}</h4>
            {/* <div className="text-muted">
              <small>{salaryStructure.staff_code}</small>
            </div> */}
          </div>
        </div>
        <div className="text-end">
          <div className="mb-2">
            <small className="text-muted d-block">Effective From</small>
            <strong>{formatDate(salaryStructure.effective_from)}</strong>
          </div>
          <div>
            <small className="text-muted d-block">Status</small>
            <span
              style={{
                backgroundColor: "#ECFDF3",
                color: "#027A48",
                padding: "6px 12px",
                borderRadius: "20px",
                fontWeight: "600",
                fontSize: "12px",
                display: "inline-block",
              }}
            >
              Active
            </span>
          </div>
        </div>
      </div>

      <Row>
        {/* Salary Components */}
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
              <div className="p-4">
                <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                  <strong>Component</strong>
                  <strong>Amount (₹)</strong>
                </div>

                {/* Earnings Section */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Basic Salary</span>
                    <span className="fw-semibold">
                      {formatCurrency(salaryStructure.basic_salary)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      House Rent Allowance (HRA)
                    </span>
                    <span>
                      {formatCurrency(salaryStructure.house_rent_allowance)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Travel Allowance</span>
                    <span>
                      {formatCurrency(salaryStructure.travel_allowance)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Medical Allowance</span>
                    <span>
                      {formatCurrency(salaryStructure.medical_allowance)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Special Allowance</span>
                    <span>
                      {formatCurrency(salaryStructure.special_allowance)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Other Allowances</span>
                    <span>
                      {formatCurrency(salaryStructure.other_allowances)}
                    </span>
                  </div>
                </div>

                {/* Total Earnings */}
                <div
                  className="d-flex justify-content-between pt-2 mt-2 border-top"
                  style={{ borderTop: "2px solid #dee2e6" }}
                >
                  <strong>Total Earnings</strong>
                  <strong className="text-success">
                    {formatCurrency(calculateTotalEarnings())}
                  </strong>
                </div>
              </div>
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
                <FaPercent className="me-2" />
                Deductions
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="p-4">
                <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                  <strong>Component</strong>
                  <strong>Amount (₹)</strong>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      PF Deduction ({salaryStructure.pf_percent || 12}%)
                    </span>
                    <span>{formatCurrency(calculatePFDeduction())}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      ESIC Deduction ({salaryStructure.esic_percent || 0.75}%)
                    </span>
                    <span>{formatCurrency(calculateESICDeduction())}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Professional Tax</span>
                    <span>
                      {formatCurrency(salaryStructure.professional_tax || 200)}
                    </span>
                  </div>
                </div>

                {/* Total Deductions */}
                <div
                  className="d-flex justify-content-between pt-2 mt-2 border-top"
                  style={{ borderTop: "2px solid #dee2e6" }}
                >
                  <strong>Total Deductions</strong>
                  <strong className="text-danger">
                    {formatCurrency(calculateTotalDeductions())}
                  </strong>
                </div>
              </div>
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
              <h6 className="mb-2 opacity-75">Net Salary (Take Home)</h6>
              <h1 className="fw-bold mb-0" style={{ fontSize: "48px" }}>
                {formatCurrency(calculateNetSalary())}
              </h1>
              <p className="mb-0 mt-2 opacity-75">
                After all deductions and allowances
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        @media print {
          .btn,
          .breadcrumb-wrapper {
            display: none !important;
          }
          .container-fluid {
            padding: 0 !important;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default ViewSalaryStructure;
