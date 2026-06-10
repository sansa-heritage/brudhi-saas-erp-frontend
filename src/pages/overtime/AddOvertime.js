// src/pages/overtime/AddOvertime.js

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
  Modal,
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
  FaClock,
  FaCalculator,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createOvertimeRequest, getOvertimeRequestById } from "../../api/tenant/overtime.api";
import { getStaff } from "../../components/services/staffService";
import Swal from "sweetalert2";

const AddOvertime = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [activeTab, setActiveTab] = useState("overtime");
  const [formErrors, setFormErrors] = useState({});
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  
  // View Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [createdOvertime, setCreatedOvertime] = useState(null);

  const [formData, setFormData] = useState({
    staff_id: "",
    date: new Date().toISOString().slice(0, 10),
    hours: "",
    rate_per_hour: "",
    reason: "",
    created_by: JSON.parse(localStorage.getItem("user"))?.id || 1,
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
    
    // Calculate amount when hours or rate changes
    if (name === "hours" || name === "rate_per_hour") {
      const hours = name === "hours" ? parseFloat(value) : parseFloat(formData.hours);
      const rate = name === "rate_per_hour" ? parseFloat(value) : parseFloat(formData.rate_per_hour);
      if (hours && rate && !isNaN(hours) && !isNaN(rate)) {
        setCalculatedAmount(hours * rate);
      } else {
        setCalculatedAmount(0);
      }
    }
    
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.staff_id) {
      errors.staff_id = "Please select a staff member";
    }
    
    if (!formData.date) {
      errors.date = "Please select date";
    }
    
    if (!formData.hours) {
      errors.hours = "Please enter hours";
    } else if (parseFloat(formData.hours) <= 0) {
      errors.hours = "Hours must be greater than 0";
    } else if (parseFloat(formData.hours) > 24) {
      errors.hours = "Hours cannot exceed 24 per day";
    }
    
    if (!formData.rate_per_hour) {
      errors.rate_per_hour = "Please enter rate per hour";
    } else if (parseFloat(formData.rate_per_hour) <= 0) {
      errors.rate_per_hour = "Rate per hour must be greater than 0";
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const overtimeStatusConfig = {
    pending: { bg: "#FEF6D7", color: "#FED229", label: "Pending", icon: "⏳" },
    approved: { bg: "#D3EAFF", color: "#437EF7", label: "Approved", icon: "✅" },
    paid: { bg: "#ECFDF3", color: "#027A48", label: "Paid", icon: "💰" },
    rejected: { bg: "#FFDCE2", color: "#F94765", label: "Rejected", icon: "❌" },
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
      title: '<span style="color: #1e3a6f;">⏰ Add Overtime?</span>',
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
                <small style="opacity: 0.8;">Total Amount</small>
                <h3 style="margin: 5px 0; font-weight: 700;">₹${calculatedAmount.toLocaleString()}</h3>
                <small style="opacity: 0.8;">${formData.date}</small>
              </div>
            </div>
          </div>
          <div style="padding: 10px;">
            <p style="margin: 5px 0;"><strong>⏰ Hours:</strong> ${formData.hours} hrs</p>
            <p style="margin: 5px 0;"><strong>💰 Rate per Hour:</strong> ₹${parseFloat(formData.rate_per_hour).toLocaleString()}</p>
            ${formData.reason ? `<p style="margin: 5px 0;"><strong>📝 Reason:</strong> ${formData.reason}</p>` : ""}
            <p style="margin: 5px 0; color: #666; font-size: 13px;">⚠️ This overtime will be added to the staff's salary for the month</p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;">✅ Yes, Add Overtime!</span>',
      cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;">❌ Cancel</span>',
      confirmButtonColor: "#1e3a6f",
      cancelButtonColor: "#6c757d",
      backdrop: true,
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      setLoading(true);
      
      const loadingToast = toast.loading("Adding overtime...", {
        position: "top-right",
        theme: "colored",
      });
      
      try {
        const submitData = {
          staff_id: parseInt(formData.staff_id),
          date: formData.date,
          hours: parseFloat(formData.hours),
          rate_per_hour: parseFloat(formData.rate_per_hour),
          amount: calculatedAmount,
          reason: formData.reason || null,
          created_by: formData.created_by,
        };

        const response = await createOvertimeRequest(submitData);

        let overtimeId = null;
        if (response?.data?.data?.id) {
          overtimeId = response.data.data.id;
        } else if (response?.data?.id) {
          overtimeId = response.data.id;
        } else if (response?.id) {
          overtimeId = response.id;
        }

        // Fetch the created overtime details
        if (overtimeId) {
          const overtimeResponse = await getOvertimeRequestById(overtimeId);
          const newOvertime = overtimeResponse?.data?.data || overtimeResponse?.data;
          setCreatedOvertime(newOvertime);
        } else {
          // Create a local object if API doesn't return full data
          setCreatedOvertime({
            id: overtimeId,
            staff_name: `${selectedStaff.first_name} ${selectedStaff.last_name}`,
            staff_code: selectedStaff.staff_code,
            date: formData.date,
            hours: parseFloat(formData.hours),
            rate_per_hour: parseFloat(formData.rate_per_hour),
            amount: calculatedAmount,
            reason: formData.reason || null,
            status: "pending",
            created_at: new Date().toISOString(),
          });
        }

        toast.dismiss(loadingToast);
        
        toast.success(
          <div>
            <strong>✅ Overtime Added!</strong>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              Overtime of <strong>₹${calculatedAmount.toLocaleString()}</strong> added for <strong>${selectedStaff.first_name} ${selectedStaff.last_name}</strong>
            </div>
            <div style={{ fontSize: "11px", marginTop: "3px", color: "#666" }}>
              Hours: ${formData.hours} hrs | Date: ${formData.date}
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
            transition: Bounce,
          }
        );

        // Reset form
        setFormData({
          staff_id: "",
          date: new Date().toISOString().slice(0, 10),
          hours: "",
          rate_per_hour: "",
          reason: "",
          created_by: JSON.parse(localStorage.getItem("user"))?.id || 1,
        });
        setCalculatedAmount(0);

        // Show view modal instead of redirecting
        setShowViewModal(true);
        
      } catch (error) {
        console.error("Failed to add overtime:", error);
        toast.dismiss(loadingToast);
        toast.error(
          <div>
            <strong>❌ Addition Failed!</strong>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              {error.response?.data?.message || "Failed to add overtime"}
            </div>
            <div style={{ fontSize: "11px", marginTop: "3px", color: "#666" }}>
              Please check the details and try again
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
    navigate("/staff/overtime");
  };

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ToastContainer />

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="overtime" className="fw-semibold">
                  <FaClock className="me-2" /> Overtime Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="details" className="fw-semibold">
                  <FaInfoCircle className="me-2" /> Additional Details
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* Overtime Information Tab */}
              <Tab.Pane eventKey="overtime" active={activeTab === "overtime"}>
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
                        <FaCalendarAlt className="me-1" /> Select Date *
                      </Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          isInvalid={!!formErrors.date}
                          max={getMaxDate()}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.date, formErrors.date)}
                      </div>
                      {formErrors.date && (
                        <Form.Text className="text-danger">{formErrors.date}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaMoneyBillWave className="me-2" /> Overtime Details
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-3">
                      <Form.Label>Hours *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="hours"
                          value={formData.hours}
                          onChange={handleChange}
                          placeholder="Enter hours"
                          min="0"
                          max="24"
                          step="0.5"
                          isInvalid={!!formErrors.hours}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.hours, formErrors.hours)}
                      </div>
                      {formErrors.hours && (
                        <Form.Text className="text-danger">{formErrors.hours}</Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Maximum 24 hours per day
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Rate per Hour (₹) *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="rate_per_hour"
                          value={formData.rate_per_hour}
                          onChange={handleChange}
                          placeholder="Enter rate per hour"
                          min="0"
                          step="10"
                          isInvalid={!!formErrors.rate_per_hour}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.rate_per_hour, formErrors.rate_per_hour)}
                      </div>
                      {formErrors.rate_per_hour && (
                        <Form.Text className="text-danger">{formErrors.rate_per_hour}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Calculated Amount */}
                {calculatedAmount > 0 && (
                  <Alert variant="success" className="rounded-3 mt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <FaCalculator className="me-2" />
                        <span className="fw-semibold">Total Amount:</span>
                      </div>
                      <span className="fw-bold fs-4" style={{ color: "#027A48" }}>
                        {formatCurrency(calculatedAmount)}
                      </span>
                    </div>
                  </Alert>
                )}
              </Tab.Pane>

              {/* Additional Details Tab */}
              <Tab.Pane eventKey="details" active={activeTab === "details"}>
                <Row>
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaFileInvoice className="me-2" /> Reason & Remarks
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-3">
                      <Form.Label>Reason / Remarks</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Enter reason for overtime (e.g., Project deadline, Maintenance work, etc.)"
                        style={{ borderRadius: "10px", padding: "10px" }}
                      />
                      <Form.Text className="text-muted">
                        Provide additional details about this overtime
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaInfoCircle className="me-2" /> Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Alert variant="info" className="rounded-3">
                      <small>
                        <strong>💡 Overtime Information:</strong>
                        <br />
                        • Overtime will be added to staff's salary for the month
                        <br />
                        • Status will be "Pending" until approved
                        <br />
                        • Approved overtime will be processed in next payroll
                      </small>
                    </Alert>

                    <Alert variant="warning" className="rounded-3 mt-2">
                      <small>
                        <strong>⚠️ Note:</strong>
                        <br />
                        Make sure the staff member has an active salary structure
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
                    Adding Overtime...
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

      {/* View Overtime Modal - Shows after successful creation */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white rounded-top-3 border-0">
          <Modal.Title className="fw-bold">
            <FaEye className="me-2" /> Overtime Created Successfully!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {createdOvertime && (
            <>
              <div className="text-center mb-4">
                <div style={{ fontSize: "48px" }}>🎉</div>
                <h4 className="mt-2 text-success">Overtime Added Successfully!</h4>
              </div>
              
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-0 shadow-sm rounded-3 h-100">
                    <Card.Header className="bg-white border-bottom pt-3 pb-2">
                      <h6 className="fw-bold mb-0" style={{ color: "rgb(30, 58, 111)" }}>
                        <FaUser className="me-2" /> Staff Information
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Staff Name</small>
                        <div className="fw-semibold">{createdOvertime.staff_name}</div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Staff Code</small>
                        <div>{createdOvertime.staff_code || "N/A"}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 shadow-sm rounded-3 h-100">
                    <Card.Header className="bg-white border-bottom pt-3 pb-2">
                      <h6 className="fw-bold mb-0" style={{ color: "rgb(30, 58, 111)" }}>
                        <FaMoneyBillWave className="me-2" /> Overtime Information
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Date</small>
                        <div>{formatDate(createdOvertime.date)}</div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Hours</small>
                        <div className="fw-semibold">{createdOvertime.hours} hrs</div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Rate per Hour</small>
                        <div>{formatCurrency(createdOvertime.rate_per_hour)}</div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Total Amount</small>
                        <div className="fw-bold fs-5" style={{ color: "#027A48" }}>
                          {formatCurrency(createdOvertime.amount)}
                        </div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Reason</small>
                        <div>{createdOvertime.reason || "N/A"}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Card className="border-0 shadow-sm rounded-3">
                    <Card.Header className="bg-white border-bottom pt-3 pb-2">
                      <h6 className="fw-bold mb-0" style={{ color: "rgb(30, 58, 111)" }}>
                        <FaInfoCircle className="me-2" /> Status Information
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Current Status</small>
                        <div>
                          <span style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: overtimeStatusConfig.pending.bg,
                            color: overtimeStatusConfig.pending.color,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}>
                            ⏳ Pending
                          </span>
                        </div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Created At</small>
                        <div>{formatDate(createdOvertime.created_at)}</div>
                      </div>
                      <div>
                        <small className="text-muted">Note</small>
                        <div className="mt-1" style={{ fontSize: "13px", color: "#666" }}>
                          This overtime is pending approval. Once approved, it will be added to the next payroll.
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-white rounded-bottom-3 border-top">
          <Button variant="outline-secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowViewModal(false);
              navigate("/staff/overtime");
            }}
            style={{ backgroundColor: "rgb(30, 58, 111)" }}
          >
            <FaEye className="me-2" /> View All Overtime
          </Button>
        </Modal.Footer>
      </Modal>

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

export default AddOvertime;