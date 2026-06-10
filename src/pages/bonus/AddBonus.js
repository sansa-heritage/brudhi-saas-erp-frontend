// src/pages/bonus/AddBonus.js

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
  FaGift,
  FaStar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createBonus, getBonusById } from "../../api/tenant/bonus.api";
import { getStaff } from "../../components/services/staffService";
import Swal from "sweetalert2";

const AddBonus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [activeTab, setActiveTab] = useState("bonus");
  const [formErrors, setFormErrors] = useState({});
  
  // View Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [createdBonus, setCreatedBonus] = useState(null);

  const [formData, setFormData] = useState({
    staff_id: "",
    bonus_type: "performance",
    amount: "",
    month: new Date().toISOString().slice(0, 7),
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
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.staff_id) {
      errors.staff_id = "Please select a staff member";
    }
    
    if (!formData.amount) {
      errors.amount = "Please enter bonus amount";
    } else if (parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    } else if (parseFloat(formData.amount) > 1000000) {
      errors.amount = "Amount cannot exceed ₹10,00,000";
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

  // Updated bonus types to match database ENUM
  const bonusTypes = [
    { value: "bonus", label: "Bonus", icon: "🎁", color: "#437EF7" },
    { value: "incentive", label: "Incentive", icon: "🎯", color: "#10b981" },
    { value: "commission", label: "Commission", icon: "💰", color: "#f59e0b" },
    { value: "performance", label: "Performance", icon: "⭐", color: "#8b5cf6" },
    { value: "festival", label: "Festival", icon: "🎉", color: "#ec4899" },
    { value: "diwali", label: "Diwali", icon: "🪔", color: "#ef4444" },
    { value: "other", label: "Other", icon: "📝", color: "#06b6d4" },
  ];

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

    const selectedBonusType = bonusTypes.find(b => b.value === formData.bonus_type);

    const result = await Swal.fire({
      title: '<span style="color: #1e3a6f;">🎁 Add Bonus?</span>',
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
                <small style="opacity: 0.8;">Bonus Amount</small>
                <h3 style="margin: 5px 0; font-weight: 700;">₹${parseFloat(formData.amount).toLocaleString()}</h3>
                <small style="opacity: 0.8;">${formData.month}</small>
              </div>
            </div>
          </div>
          <div style="padding: 10px;">
            <p style="margin: 5px 0;"><strong>🎯 Bonus Type:</strong> ${selectedBonusType?.label || formData.bonus_type}</p>
            ${formData.reason ? `<p style="margin: 5px 0;"><strong>📝 Reason:</strong> ${formData.reason}</p>` : ""}
            <p style="margin: 5px 0; color: #666; font-size: 13px;">⚠️ This bonus will be added to the staff's salary for the selected month</p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;">✅ Yes, Add Bonus!</span>',
      cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;">❌ Cancel</span>',
      confirmButtonColor: "#1e3a6f",
      cancelButtonColor: "#6c757d",
      backdrop: true,
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      setLoading(true);
      
      const loadingToast = toast.loading("Adding bonus...", {
        position: "top-right",
        theme: "colored",
      });
      
      try {
        const submitData = {
          staff_id: parseInt(formData.staff_id),
          bonus_type: formData.bonus_type,
          amount: parseFloat(formData.amount),
          month: formData.month,
          reason: formData.reason || null,
          created_by: formData.created_by,
        };

        const response = await createBonus(submitData);

        let bonusId = null;
        if (response?.data?.data?.id) {
          bonusId = response.data.data.id;
        } else if (response?.data?.id) {
          bonusId = response.data.id;
        } else if (response?.id) {
          bonusId = response.id;
        }

        // Fetch the created bonus details
        if (bonusId) {
          const bonusResponse = await getBonusById(bonusId);
          const newBonus = bonusResponse?.data?.data || bonusResponse?.data;
          setCreatedBonus(newBonus);
        } else {
          // Create a local object if API doesn't return full data
          setCreatedBonus({
            id: bonusId,
            staff_name: `${selectedStaff.first_name} ${selectedStaff.last_name}`,
            staff_code: selectedStaff.staff_code,
            amount: parseFloat(formData.amount),
            bonus_type: formData.bonus_type,
            month: formData.month,
            reason: formData.reason || null,
            status: "pending",
            created_at: new Date().toISOString(),
          });
        }

        toast.dismiss(loadingToast);
        
        toast.success(
          <div>
            <strong>✅ Bonus Added!</strong>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              Bonus of <strong>₹${parseFloat(formData.amount).toLocaleString()}</strong> added for <strong>${selectedStaff.first_name} ${selectedStaff.last_name}</strong>
            </div>
            <div style={{ fontSize: "11px", marginTop: "3px", color: "#666" }}>
              Type: ${selectedBonusType?.label} | Month: ${formData.month}
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
          bonus_type: "performance",
          amount: "",
          month: new Date().toISOString().slice(0, 7),
          reason: "",
          created_by: JSON.parse(localStorage.getItem("user"))?.id || 1,
        });

        // Show view modal instead of redirecting
        setShowViewModal(true);
        
      } catch (error) {
        console.error("Failed to add bonus:", error);
        toast.dismiss(loadingToast);
        toast.error(
          <div>
            <strong>❌ Addition Failed!</strong>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              {error.response?.data?.message || "Failed to add bonus"}
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
    navigate("/staff/bonuses");
  };

  const getBonusTypeLabel = (type) => {
    const config = bonusTypes.find(b => b.value === type);
    return config ? `${config.icon} ${config.label}` : type;
  };

  const paymentStatusConfig = {
    pending: { bg: "#FEF6D7", color: "#FED229", label: "Pending", icon: "⏳" },
    approved: { bg: "#D3EAFF", color: "#437EF7", label: "Approved", icon: "✅" },
    paid: { bg: "#ECFDF3", color: "#027A48", label: "Paid", icon: "💰" },
    rejected: { bg: "#FFDCE2", color: "#F94765", label: "Rejected", icon: "❌" },
  };

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ToastContainer />

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="bonus" className="fw-semibold">
                  <FaGift className="me-2" /> Bonus Information
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
              {/* Bonus Information Tab */}
              <Tab.Pane eventKey="bonus" active={activeTab === "bonus"}>
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
                      <FaMoneyBillWave className="me-2" /> Bonus Details
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-3">
                      <Form.Label>Bonus Type</Form.Label>
                      <Form.Select
                        name="bonus_type"
                        value={formData.bonus_type}
                        onChange={handleChange}
                        style={{ borderRadius: "10px", padding: "10px" }}
                      >
                        {bonusTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Amount (₹) *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="Enter bonus amount"
                          min="0"
                          step="100"
                          isInvalid={!!formErrors.amount}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.amount, formErrors.amount)}
                      </div>
                      {formErrors.amount && (
                        <Form.Text className="text-danger">{formErrors.amount}</Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Minimum amount: ₹100 | Maximum: ₹10,00,000
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
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
                        placeholder="Enter reason for bonus (e.g., Excellent performance, Festival celebration, etc.)"
                        style={{ borderRadius: "10px", padding: "10px" }}
                      />
                      <Form.Text className="text-muted">
                        Provide additional details about this bonus
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
                        <strong>💡 Bonus Information:</strong>
                        <br />
                        • Bonus will be added to staff's salary for the selected month
                        <br />
                        • Status will be "Pending" until approved
                        <br />
                        • Approved bonuses will be processed in next payroll
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
                    Adding Bonus...
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

      {/* View Bonus Modal - Shows after successful creation */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white rounded-top-3 border-0">
          <Modal.Title className="fw-bold">
            <FaEye className="me-2" /> Bonus Created Successfully!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {createdBonus && (
            <>
              <div className="text-center mb-4">
                <div style={{ fontSize: "48px" }}>🎉</div>
                <h4 className="mt-2 text-success">Bonus Added Successfully!</h4>
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
                        <div className="fw-semibold">{createdBonus.staff_name}</div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Staff Code</small>
                        <div>{createdBonus.staff_code || "N/A"}</div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Bonus Type</small>
                        <div>
                          <span className="badge" style={{
                            backgroundColor: "#D3EAFF",
                            color: "#437EF7",
                            padding: "4px 12px",
                            borderRadius: "20px",
                          }}>
                            {getBonusTypeLabel(createdBonus.bonus_type)}
                          </span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 shadow-sm rounded-3 h-100">
                    <Card.Header className="bg-white border-bottom pt-3 pb-2">
                      <h6 className="fw-bold mb-0" style={{ color: "rgb(30, 58, 111)" }}>
                        <FaMoneyBillWave className="me-2" /> Bonus Information
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Amount</small>
                        <div className="fw-bold fs-5" style={{ color: "#027A48" }}>
                          {formatCurrency(createdBonus.amount)}
                        </div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Month</small>
                        <div>{formatDate(createdBonus.month)}</div>
                      </div>
                      <div className="mb-2 pb-2 border-bottom">
                        <small className="text-muted">Reason</small>
                        <div>{createdBonus.reason || "N/A"}</div>
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
                            backgroundColor: "#FEF6D7",
                            color: "#FED229",
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
                        <div>{formatDate(createdBonus.created_at)}</div>
                      </div>
                      <div>
                        <small className="text-muted">Note</small>
                        <div className="mt-1" style={{ fontSize: "13px", color: "#666" }}>
                          This bonus is pending approval. Once approved, it will be added to the next payroll.
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
              navigate("/bonus");
            }}
            style={{ backgroundColor: "rgb(30, 58, 111)" }}
          >
            <FaEye className="me-2" /> View All Bonuses
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

export default AddBonus;