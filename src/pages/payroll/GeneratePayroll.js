// src/pages/payroll/GeneratePayroll.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Tab,
  Nav,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaSave,
  FaMoneyBillWave,
  FaPercent,
  FaTag,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes,
  FaCalendarAlt,
  FaFileInvoice,
  FaCreditCard,
  FaUser,
  FaBuilding,
  FaEye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { generatePayroll } from "../../api/tenant/payroll.api";
import { getStaff } from "../../components/services/staffService";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const GeneratePayroll = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [activeTab, setActiveTab] = useState("payroll");
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    staff_id: "",
    month: new Date().toISOString().slice(0, 7),
  });

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    setLoadingStaff(true);
    try {
      const response = await getStaff();
      let staffArray = [];
      if (response?.data?.data?.data) {
        staffArray = response.data.data.data;
      } else if (response?.data?.data) {
        staffArray = response.data.data;
      } else if (response?.data) {
        staffArray = response.data;
      } else if (Array.isArray(response)) {
        staffArray = response;
      }
      setStaffList(staffArray);
    } catch (error) {
      console.error("Failed to load staff:", error);
      toast.error("Failed to load staff list", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setLoadingStaff(false);
    }
  };

  const getValidationIcon = (fieldValue, validationError) => {
    if (!fieldValue) {
      return <FaInfoCircle className="text-secondary ms-2" size={14} />;
    }
    if (!validationError) {
      return <FaCheckCircle className="text-success ms-2" size={14} />;
    }
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-${fieldValue}`}>{validationError}</Tooltip>
        }
      >
        <span className="text-danger ms-2" style={{ cursor: "pointer" }}>
          <FaExclamationTriangle size={14} />
        </span>
      </OverlayTrigger>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.staff_id) {
      errors.staff_id = "Please select a staff member";
    }
    
    if (!formData.month) {
      errors.month = "Please select a month";
    } else {
      const selectedDate = new Date(formData.month);
      const today = new Date();
      const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      if (formData.month > currentYearMonth) {
        errors.month = "Month cannot be in the future";
      }
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.warning("⚠️ Please fix the validation errors", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedStaff = staffList.find(
      (s) => s.id === parseInt(formData.staff_id),
    );

    if (!selectedStaff) {
      toast.error("Selected staff member not found", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }

    const result = await Swal.fire({
      title: '<span style="color: #1e3a6f;">💰 Generate Payroll?</span>',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      border-radius: 12px; padding: 15px; margin-bottom: 20px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <small style="opacity: 0.8;">Staff Member</small>
                <h4 style="margin: 5px 0; font-weight: 600;">${selectedStaff.first_name} ${selectedStaff.last_name}</h4>
                <small style="opacity: 0.8;">${selectedStaff.staff_code || "EMP001"}</small>
              </div>
              <div style="text-align: right;">
                <small style="opacity: 0.8;">Payroll Month</small>
                <h4 style="margin: 5px 0; font-weight: 600;">${formData.month}</h4>
              </div>
            </div>
          </div>
          <div style="padding: 10px;">
            <p style="margin: 5px 0;"><strong>📋 Action:</strong> Generate payroll for this staff member</p>
            <p style="margin: 5px 0; color: #666; font-size: 13px;">⚠️ This will create a new payroll record based on the staff's salary structure</p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;">✅ Yes, Generate!</span>',
      cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;">❌ Cancel</span>',
      confirmButtonColor: "#1e3a6f",
      cancelButtonColor: "#6c757d",
      backdrop: true,
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      setLoading(true);
      
      const loadingToast = toast.loading("Generating payroll...", {
        position: "top-right",
        theme: "colored",
      });
      
      try {
        const response = await generatePayroll({
          staff_id: parseInt(formData.staff_id),
          month: formData.month,
        });

        let payrollId = null;
        let netSalary = null;
        
        if (response?.data?.data?.id) {
          payrollId = response.data.data.id;
          netSalary = response.data.data.net_salary;
        } else if (response?.data?.id) {
          payrollId = response.data.id;
          netSalary = response.data.net_salary;
        } else if (response?.id) {
          payrollId = response.id;
          netSalary = response.net_salary;
        }

        toast.dismiss(loadingToast);
        
        toast.success(
          <div>
            <strong>✅ Payroll Generated!</strong>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              Payroll for <strong>${selectedStaff.first_name} ${selectedStaff.last_name}</strong> has been generated
            </div>
            <div style={{ fontSize: "11px", marginTop: "3px", color: "#666" }}>
              Month: ${formData.month} | Net Salary: ₹${netSalary?.toLocaleString() || "Calculated"}
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 4000,
            theme: "colored",
            transition: Bounce,
          }
        );

        // Reset form
        setFormData({
          staff_id: "",
          month: new Date().toISOString().slice(0, 7),
        });

        // Ask if user wants to view the payroll
        const viewResult = await Swal.fire({
          title: '<span style="color: #1e3a6f;">🎉 Payroll Generated Successfully!</span>',
          html: `
            <div style="text-align: left;">
              <div style="background: #ECFDF3; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <small style="color: #027A48;">Staff Name</small>
                    <p style="margin: 5px 0; font-weight: 600;">${selectedStaff.first_name} ${selectedStaff.last_name}</p>
                  </div>
                  <div>
                    <small style="color: #027A48;">Payroll Month</small>
                    <p style="margin: 5px 0; font-weight: 600;">${formData.month}</p>
                  </div>
                </div>
                <hr style="margin: 10px 0; border-color: #ccc;">
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <small style="color: #027A48;">Net Salary</small>
                    <p style="margin: 5px 0; font-weight: 700; font-size: 18px;">₹${netSalary?.toLocaleString() || "Calculated"}</p>
                  </div>
                </div>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">What would you like to do next?</p>
            </div>
          `,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;">👁️ View Payroll</span>',
          cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;">➕ Generate Another</span>',
          confirmButtonColor: "#1e3a6f",
          cancelButtonColor: "#6c757d",
        });
        
        if (viewResult.isConfirmed && payrollId) {
          navigate(`/staff/payroll/${payrollId}`);
        }
        
      } catch (error) {
        console.error("Failed to generate payroll:", error);
        toast.dismiss(loadingToast);
        toast.error(
          <div>
            <strong>❌ Generation Failed!</strong>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              {error.response?.data?.message || "Failed to generate payroll"}
            </div>
            <div style={{ fontSize: "11px", marginTop: "3px", color: "#666" }}>
              Please check staff salary structure and try again
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            transition: Bounce,
          }
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoBack = () => {
    navigate("/payroll");
  };

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ToastContainer />

      {/* Header */}
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "rgb(30, 58, 111)" }}>
            <FaMoneyBillWave className="me-2" /> Generate Payroll
          </h2>
          <p className="text-muted mb-0">Create salary payroll for staff members</p>
        </div>
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/payroll")}
          style={{ borderRadius: "10px", padding: "10px 20px" }}
        >
          <FaEye className="me-2" /> View All Payrolls
        </Button>
      </div> */}

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="payroll" className="fw-semibold">
                  <FaUser className="me-2" /> Payroll Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="salary" className="fw-semibold">
                  <FaMoneyBillWave className="me-2" /> Salary Details
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* Payroll Information Tab */}
              <Tab.Pane eventKey="payroll" active={activeTab === "payroll"}>
                <Row>
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaUser className="me-2" /> Staff Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-3">
                      <Form.Label>Select Staff Member *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Select
                          name="staff_id"
                          value={formData.staff_id}
                          onChange={handleChange}
                          isInvalid={!!formErrors.staff_id}
                          disabled={loadingStaff || staffList.length === 0}
                          className="flex-grow-1"
                        >
                          <option value="">-- Select Staff Member --</option>
                          {staffList.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.first_name} {staff.last_name} - {staff.staff_code}
                            </option>
                          ))}
                        </Form.Select>
                        {getValidationIcon(formData.staff_id, formErrors.staff_id)}
                      </div>
                      {loadingStaff && (
                        <div className="mt-2">
                          <Spinner animation="border" size="sm" /> Loading staff...
                        </div>
                      )}
                      {!loadingStaff && staffList.length === 0 && (
                        <Form.Text className="text-warning">
                          No staff members found. Please add staff members first.
                        </Form.Text>
                      )}
                      {formErrors.staff_id && (
                        <Form.Text className="text-danger">{formErrors.staff_id}</Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaCalendarAlt className="me-1" /> Select Month *
                      </Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="month"
                          name="month"
                          value={formData.month}
                          onChange={handleChange}
                          isInvalid={!!formErrors.month}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.month, formErrors.month)}
                      </div>
                      {formErrors.month && (
                        <Form.Text className="text-danger">{formErrors.month}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaInfoCircle className="me-2" /> Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Alert variant="info" className="rounded-3">
                      <small>
                        <strong>💡 Payroll Generation Info:</strong>
                        <br />
                        • Payroll will be created based on staff's salary structure
                        <br />
                        • Status will be set to "Pending"
                        <br />
                        • You can process payment later from payroll list
                      </small>
                    </Alert>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Salary Details Tab */}
              <Tab.Pane eventKey="salary" active={activeTab === "salary"}>
                <Row>
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaMoneyBillWave className="me-2" /> Salary Components
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <div className="mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                      <div className="mb-2">
                        <strong>Salary Calculation:</strong>
                      </div>
                      <ul className="mb-0" style={{ fontSize: "13px", color: "#555" }}>
                        <li>Basic Salary (from staff record)</li>
                        <li>PF Deduction: 12% of total earnings</li>
                        <li>ESIC Deduction: 0.75% of total earnings</li>
                        <li>Professional Tax: ₹200</li>
                      </ul>
                    </div>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaCheckCircle className="me-2" /> Formula
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Alert variant="success" className="rounded-3">
                      <small>
                        <strong>Net Salary Formula:</strong>
                        <br />
                        <strong>Net Salary = Basic Salary - (PF + ESIC + Professional Tax)</strong>
                      </small>
                    </Alert>

                    <Alert variant="warning" className="rounded-3 mt-2">
                      <small>
                        <strong>⚠️ Note:</strong>
                        <br />
                        Make sure staff has an active salary structure before generating payroll.
                      </small>
                    </Alert>
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>

          {/* Action Buttons inside Card Footer */}
          <Card.Footer className="bg-white border-top-0 pb-4 px-4">
            <div className="d-flex justify-content-between gap-3">
              <Button
                onClick={handleGoBack}
                style={{
                  backgroundColor: "#6c757d",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#fff",
                }}
              >
                <FaTimes size={14} /> Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading || loadingStaff || staffList.length === 0}
                style={{
                  backgroundColor: "rgb(30, 58, 111)",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
                }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FaSave size={14} /> Generate Payroll
                  </>
                )}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Form>

      <style>{`
        .nav-tabs {
          border-bottom: 2px solid #e9ecef;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 12px 20px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .nav-tabs .nav-link:hover {
          color: rgb(30, 58, 111);
          background: transparent;
        }
        .nav-tabs .nav-link.active {
          color: rgb(30, 58, 111);
          background: transparent;
          border-bottom: 2px solid rgb(30, 58, 111);
        }
        .rounded-3 {
          border-radius: 12px !important;
        }
        .form-control:focus, .form-select:focus {
          border-color: rgb(30, 58, 111);
          box-shadow: 0 0 0 0.2rem rgba(30, 58, 111, 0.25);
        }
      `}</style>
    </Container>
  );
};

export default GeneratePayroll;