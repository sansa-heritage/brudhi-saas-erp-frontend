// src/pages/target/AddTarget.js

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
  FaSave,
  FaArrowLeft,
  FaBullseye,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPercentage,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes,
  FaChartLine,
  FaTrophy,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createStaffTarget } from "../../api/tenant/target.api";
import { getStaff } from "../../components/services/staffService";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const AddTarget = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [activeTab, setActiveTab] = useState("target");
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    staff_id: "",
    target_month: "",
    target_type: "monthly",
    target_amount: "",
    incentive_rate: "",
    created_by: "",
  });

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadStaffList();
    setFormData(prev => ({
      ...prev,
      created_by: currentUser?.id || 1
    }));
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.staff_id) {
      errors.staff_id = "Please select a staff member";
    }
    
    if (!formData.target_month) {
      errors.target_month = "Please select target month";
    }
    
    if (!formData.target_amount) {
      errors.target_amount = "Please enter target amount";
    } else if (parseFloat(formData.target_amount) <= 0) {
      errors.target_amount = "Target amount must be greater than 0";
    } else if (parseFloat(formData.target_amount) > 10000000) {
      errors.target_amount = "Target amount cannot exceed ₹1,00,00,000";
    }
    
    if (!formData.incentive_rate) {
      errors.incentive_rate = "Please enter incentive rate";
    } else if (parseFloat(formData.incentive_rate) < 0) {
      errors.incentive_rate = "Incentive rate cannot be negative";
    } else if (parseFloat(formData.incentive_rate) > 100) {
      errors.incentive_rate = "Incentive rate cannot exceed 100%";
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
      title: '<span style="color: #1e3a6f;">🎯 Create New Target?</span>',
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
                <small style="opacity: 0.8;">Target Month</small>
                <h4 style="margin: 5px 0; font-weight: 600;">${formData.target_month}</h4>
              </div>
            </div>
          </div>
          <div style="padding: 10px;">
            <p style="margin: 5px 0;"><strong>📊 Target Amount:</strong> ₹${parseFloat(formData.target_amount).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>💰 Incentive Rate:</strong> ${formData.incentive_rate}%</p>
            <p style="margin: 5px 0;"><strong>📋 Target Type:</strong> ${formData.target_type.charAt(0).toUpperCase() + formData.target_type.slice(1)}</p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;">✅ Yes, Create Target!</span>',
      cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;">❌ Cancel</span>',
      confirmButtonColor: "#1e3a6f",
      cancelButtonColor: "#6c757d",
      backdrop: true,
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      setLoading(true);
      
      const loadingToast = toast.loading("Creating target...", {
        position: "top-right",
        theme: "colored",
      });
      
      try {
        // Send only YYYY-MM format, backend will add -01
        const submitData = {
          staff_id: parseInt(formData.staff_id),
          target_month: formData.target_month, // This is YYYY-MM format
          target_type: formData.target_type,
          target_amount: parseFloat(formData.target_amount),
          incentive_rate: parseFloat(formData.incentive_rate),
          created_by: formData.created_by,
        };
        
        console.log("Submitting target data:", submitData);
        
        await createStaffTarget(submitData);

        toast.dismiss(loadingToast);
        
        toast.success(
          <div>
            <strong>✅ Target Created Successfully!</strong>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              Target for <strong>${selectedStaff.first_name} ${selectedStaff.last_name}</strong> has been created
            </div>
            <div style={{ fontSize: "11px", marginTop: "3px", color: "#666" }}>
              Month: ${formData.target_month} | Target: ₹${parseFloat(formData.target_amount).toLocaleString()}
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
          target_month: "",
          target_type: "monthly",
          target_amount: "",
          incentive_rate: "",
          created_by: currentUser?.id || 1,
        });
        setActiveTab("target");

        // Ask if user wants to view targets
        const viewResult = await Swal.fire({
          title: '<span style="color: #1e3a6f;">🎉 Target Created Successfully!</span>',
          html: `
            <div style="text-align: left;">
              <div style="background: #ECFDF3; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <small style="color: #027A48;">Staff Name</small>
                    <p style="margin: 5px 0; font-weight: 600;">${selectedStaff.first_name} ${selectedStaff.last_name}</p>
                  </div>
                  <div>
                    <small style="color: #027A48;">Target Month</small>
                    <p style="margin: 5px 0; font-weight: 600;">${formData.target_month}</p>
                  </div>
                </div>
                <hr style="margin: 10px 0; border-color: #ccc;">
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <small style="color: #027A48;">Target Amount</small>
                    <p style="margin: 5px 0; font-weight: 700; font-size: 16px;">₹${parseFloat(formData.target_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <small style="color: #027A48;">Incentive Rate</small>
                    <p style="margin: 5px 0; font-weight: 700; font-size: 16px;">${formData.incentive_rate}%</p>
                  </div>
                </div>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">What would you like to do next?</p>
            </div>
          `,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;">👁️ View Targets</span>',
          cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;">➕ Create Another</span>',
          confirmButtonColor: "#1e3a6f",
          cancelButtonColor: "#6c757d",
        });
        
        if (viewResult.isConfirmed) {
          navigate("/staff/targets");
        }
        
      } catch (error) {
        console.error("Failed to create target:", error);
        console.error("Error response:", error.response?.data);
        toast.dismiss(loadingToast);
        toast.error(
          <div>
            <strong>❌ Creation Failed!</strong>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              {error.response?.data?.message || error.response?.data?.errors || "Failed to create target"}
            </div>
            <div style={{ fontSize: "11px", marginTop: "3px", color: "#666" }}>
              Please check the data and try again
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
    navigate("/staff/targets");
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ToastContainer />

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="target" className="fw-semibold">
                  <FaBullseye className="me-2" /> Target Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="incentive" className="fw-semibold">
                  <FaPercentage className="me-2" /> Incentive Details
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* Target Information Tab */}
              <Tab.Pane eventKey="target" active={activeTab === "target"}>
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
                        <FaCalendarAlt className="me-1" /> Target Month *
                      </Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="month"
                          name="target_month"
                          value={formData.target_month}
                          onChange={handleChange}
                          isInvalid={!!formErrors.target_month}
                          min={getCurrentMonth()}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.target_month, formErrors.target_month)}
                      </div>
                      {formErrors.target_month && (
                        <Form.Text className="text-danger">{formErrors.target_month}</Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Select the target month (YYYY-MM format)
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaBullseye className="me-1" /> Target Type
                      </Form.Label>
                      <div className="d-flex gap-3 mt-2">
                        <Form.Check
                          type="radio"
                          label="Monthly"
                          name="target_type"
                          value="monthly"
                          checked={formData.target_type === "monthly"}
                          onChange={handleChange}
                          inline
                        />
                        <Form.Check
                          type="radio"
                          label="Quarterly"
                          name="target_type"
                          value="quarterly"
                          checked={formData.target_type === "quarterly"}
                          onChange={handleChange}
                          inline
                        />
                        <Form.Check
                          type="radio"
                          label="Yearly"
                          name="target_type"
                          value="yearly"
                          checked={formData.target_type === "yearly"}
                          onChange={handleChange}
                          inline
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaInfoCircle className="me-2" /> Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Alert variant="info" className="rounded-3">
                      <small>
                        <strong>💡 Target Info:</strong>
                        <br />
                        • Targets help track staff performance
                        <br />
                        • Achievement is calculated based on target vs actual
                        <br />
                        • Status updates automatically when achievement is entered
                      </small>
                    </Alert>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Incentive Details Tab */}
              <Tab.Pane eventKey="incentive" active={activeTab === "incentive"}>
                <Row>
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaMoneyBillWave className="me-2" /> Target & Incentive
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaMoneyBillWave className="me-1" /> Target Amount (₹) *
                      </Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="target_amount"
                          value={formData.target_amount}
                          onChange={handleChange}
                          placeholder="Enter target amount"
                          min="0"
                          step="1000"
                          isInvalid={!!formErrors.target_amount}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.target_amount, formErrors.target_amount)}
                      </div>
                      {formErrors.target_amount && (
                        <Form.Text className="text-danger">{formErrors.target_amount}</Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        The sales/revenue target the staff needs to achieve
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaPercentage className="me-1" /> Incentive Rate (%) *
                      </Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="incentive_rate"
                          value={formData.incentive_rate}
                          onChange={handleChange}
                          placeholder="Enter incentive rate"
                          min="0"
                          max="100"
                          step="0.5"
                          isInvalid={!!formErrors.incentive_rate}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.incentive_rate, formErrors.incentive_rate)}
                      </div>
                      {formErrors.incentive_rate && (
                        <Form.Text className="text-danger">{formErrors.incentive_rate}</Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Percentage of achieved amount to be given as incentive
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaTrophy className="me-2" /> How It Works
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Alert variant="success" className="rounded-3">
                      <small>
                        <strong>📊 Status Calculation:</strong>
                        <br />
                        <strong>Achieved:</strong> ≥100% of target
                        <br />
                        <strong>Partial:</strong> 50% - 99% of target
                        <br />
                        <strong>Missed:</strong> &lt;50% of target
                      </small>
                    </Alert>

                    <Alert variant="warning" className="rounded-3 mt-2">
                      <small>
                        <strong>💰 Incentive Calculation:</strong>
                        <br />
                        Incentive Amount = Achieved Amount × (Incentive Rate / 100)
                        <br />
                        <strong>Note:</strong> Incentive will be added as a bonus to the staff member
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
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave size={14} /> Submit
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

export default AddTarget;