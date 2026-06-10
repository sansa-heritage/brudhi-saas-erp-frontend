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
  Tab,
  Nav,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaSave,
  FaTimes,
  FaMoneyBillWave,
  FaUser,
  FaCalendarAlt,
  FaRupeeSign,
  FaBuilding,
  FaCar,
  FaMedkit,
  FaGift,
  FaPercent,
  FaArrowLeft,
} from "react-icons/fa";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createSalaryStructure } from "../../api/tenant/salartStructure.api";
import { getStaff } from "../../components/services/staffService";

const AddSalaryStructure = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("employee");

  const [formData, setFormData] = useState({
    staff_id: "",
    effective_from: new Date().toISOString().split("T")[0],
    basic_salary: "",
    house_rent_allowance: "",
    travel_allowance: "",
    medical_allowance: "",
    special_allowance: "",
    other_allowances: "",
    pf_percent: "12",
    esic_percent: "0.75",
    professional_tax: "200",
    created_by: 1,
  });

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    setLoadingStaff(true);
    try {
      const response = await getStaff();
      let staffArray = [];
      if (response?.data?.data) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.staff_id) {
      newErrors.staff_id = "Please select a staff member";
    }

    if (!formData.effective_from) {
      newErrors.effective_from = "Effective from date is required";
    }

    if (!formData.basic_salary) {
      newErrors.basic_salary = "Basic salary is required";
    } else if (isNaN(formData.basic_salary) || parseFloat(formData.basic_salary) <= 0) {
      newErrors.basic_salary = "Basic salary must be a positive number";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.staff_id || newErrors.effective_from || newErrors.basic_salary) {
        setActiveTab("employee");
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedStaff = staffList.find((s) => s.id === parseInt(formData.staff_id));

    setLoading(true);
    try {
      const submitData = {
        staff_id: parseInt(formData.staff_id),
        effective_from: formData.effective_from,
        basic_salary: parseFloat(formData.basic_salary),
        house_rent_allowance: parseFloat(formData.house_rent_allowance) || 0,
        travel_allowance: parseFloat(formData.travel_allowance) || 0,
        medical_allowance: parseFloat(formData.medical_allowance) || 0,
        special_allowance: parseFloat(formData.special_allowance) || 0,
        other_allowances: parseFloat(formData.other_allowances) || 0,
        pf_percent: parseFloat(formData.pf_percent) || 12,
        esic_percent: parseFloat(formData.esic_percent) || 0.75,
        professional_tax: parseFloat(formData.professional_tax) || 200,
        created_by: 1,
      };

      console.log("Creating salary structure:", submitData);
      await createSalaryStructure(submitData);

      toast.success(`✅ Salary structure created for ${selectedStaff?.first_name} ${selectedStaff?.last_name}!`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });

      setTimeout(() => {
        navigate("/staff/salary-structure");
      }, 1500);
    } catch (error) {
      console.error("Failed to create salary structure:", error);
      toast.error(error.response?.data?.message || "Failed to create salary structure", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAllowances = () => {
    const allowances = 
      (parseFloat(formData.house_rent_allowance) || 0) +
      (parseFloat(formData.travel_allowance) || 0) +
      (parseFloat(formData.medical_allowance) || 0) +
      (parseFloat(formData.special_allowance) || 0) +
      (parseFloat(formData.other_allowances) || 0);
    return allowances;
  };

  const calculateTotalEarnings = () => {
    return (parseFloat(formData.basic_salary) || 0) + calculateTotalAllowances();
  };

  const calculatePFDeduction = () => {
    return calculateTotalEarnings() * ((parseFloat(formData.pf_percent) || 12) / 100);
  };

  const calculateESICDeduction = () => {
    return calculateTotalEarnings() * ((parseFloat(formData.esic_percent) || 0.75) / 100);
  };

  const calculateTotalDeductions = () => {
    return calculatePFDeduction() + calculateESICDeduction() + (parseFloat(formData.professional_tax) || 200);
  };

  const calculateNetSalary = () => {
    return calculateTotalEarnings() - calculateTotalDeductions();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

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

      {/* Breadcrumb Navigation */}
      {/* <div className="mb-4">
        <Button
          variant="link"
          onClick={() => navigate("/staff/salary-structure")}
          className="text-decoration-none p-0 mb-2"
          style={{ color: "rgb(30, 58, 111)" }}
        >
          <FaArrowLeft className="me-1" size={14} />
          Back to Salary Structures
        </Button>
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            Add Salary Structure
          </h3>
          <p className="text-muted mb-0">
            Create a new salary structure with allowances and deductions
          </p>
        </div>
      </div> */}

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
            <Nav
              variant="tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav.Item>
                <Nav.Link eventKey="employee" className="fw-semibold">
                  <FaUser className="me-2" /> Employee Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="allowances" className="fw-semibold">
                  <FaGift className="me-2" /> Allowances
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="deductions" className="fw-semibold">
                  <FaPercent className="me-2" /> Deductions
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="summary" className="fw-semibold">
                  <FaMoneyBillWave className="me-2" /> Summary
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* Employee Information Tab */}
              <Tab.Pane eventKey="employee" active={activeTab === "employee"}>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Staff Member *</Form.Label>
                      <Form.Select
                        name="staff_id"
                        value={formData.staff_id}
                        onChange={handleChange}
                        isInvalid={!!errors.staff_id}
                        disabled={loadingStaff}
                      >
                        <option value="">-- Select Staff Member --</option>
                        {staffList.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.first_name} {staff.last_name} - {staff.staff_code}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingStaff && (
                        <Form.Text className="text-muted">
                          <Spinner animation="border" size="sm" /> Loading staff...
                        </Form.Text>
                      )}
                      {errors.staff_id && (
                        <Form.Text className="text-danger">{errors.staff_id}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaCalendarAlt className="me-1" /> Effective From *
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="effective_from"
                        value={formData.effective_from}
                        onChange={handleChange}
                        isInvalid={!!errors.effective_from}
                      />
                      {errors.effective_from && (
                        <Form.Text className="text-danger">{errors.effective_from}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaRupeeSign className="me-1" /> Basic Salary *
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="basic_salary"
                        value={formData.basic_salary}
                        onChange={handleChange}
                        placeholder="Enter basic salary"
                        step="1000"
                        min="0"
                        isInvalid={!!errors.basic_salary}
                      />
                      {errors.basic_salary && (
                        <Form.Text className="text-danger">{errors.basic_salary}</Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        This is the base salary before any allowances or deductions
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Allowances Tab */}
              <Tab.Pane eventKey="allowances" active={activeTab === "allowances"}>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaBuilding className="me-1" /> House Rent Allowance (HRA)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="house_rent_allowance"
                        value={formData.house_rent_allowance}
                        onChange={handleChange}
                        placeholder="Enter HRA"
                        step="500"
                        min="0"
                      />
                      <Form.Text className="text-muted">
                        Typically 40-50% of basic salary
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaCar className="me-1" /> Travel Allowance
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="travel_allowance"
                        value={formData.travel_allowance}
                        onChange={handleChange}
                        placeholder="Enter travel allowance"
                        step="500"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaMedkit className="me-1" /> Medical Allowance
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="medical_allowance"
                        value={formData.medical_allowance}
                        onChange={handleChange}
                        placeholder="Enter medical allowance"
                        step="500"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaGift className="me-1" /> Special Allowance
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="special_allowance"
                        value={formData.special_allowance}
                        onChange={handleChange}
                        placeholder="Enter special allowance"
                        step="500"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Other Allowances</Form.Label>
                      <Form.Control
                        type="number"
                        name="other_allowances"
                        value={formData.other_allowances}
                        onChange={handleChange}
                        placeholder="Enter other allowances"
                        step="500"
                        min="0"
                      />
                      <Form.Text className="text-muted">
                        Any additional allowances not covered above
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Deductions Tab */}
              <Tab.Pane eventKey="deductions" active={activeTab === "deductions"}>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>PF Percentage (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="pf_percent"
                        value={formData.pf_percent}
                        onChange={handleChange}
                        placeholder="Enter PF percentage"
                        step="0.5"
                        min="0"
                        max="100"
                      />
                      <Form.Text className="text-muted">Default: 12% (Employee contribution)</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>ESIC Percentage (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="esic_percent"
                        value={formData.esic_percent}
                        onChange={handleChange}
                        placeholder="Enter ESIC percentage"
                        step="0.25"
                        min="0"
                        max="100"
                      />
                      <Form.Text className="text-muted">Default: 0.75% (for salary up to ₹21,000)</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Professional Tax (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        name="professional_tax"
                        value={formData.professional_tax}
                        onChange={handleChange}
                        placeholder="Enter professional tax"
                        step="50"
                        min="0"
                      />
                      <Form.Text className="text-muted">
                        Default: ₹200 (varies by state)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Summary Tab */}
              <Tab.Pane eventKey="summary" active={activeTab === "summary"}>
                <Row>
                  <Col lg={12}>
                    <Card className="border-0 bg-light rounded-3">
                      <Card.Body className="p-4">
                        <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                          <FaMoneyBillWave className="me-2" />
                          Salary Summary
                        </h6>
                        <hr className="mt-0 mb-3" />
                        
                        <Row className="mb-4">
                          <Col md={6}>
                            <div className="mb-3">
                              <small className="text-muted d-block">Staff Member</small>
                              <strong>
                                {staffList.find(s => s.id === parseInt(formData.staff_id))?.first_name || "Not Selected"}{" "}
                                {staffList.find(s => s.id === parseInt(formData.staff_id))?.last_name || ""}
                              </strong>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block">Effective From</small>
                              <strong>{formData.effective_from || "Not Set"}</strong>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block">Basic Salary</small>
                              <strong>{formatCurrency(formData.basic_salary)}</strong>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <small className="text-muted d-block">PF Percentage</small>
                              <strong>{formData.pf_percent}%</strong>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block">ESIC Percentage</small>
                              <strong>{formData.esic_percent}%</strong>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block">Professional Tax</small>
                              <strong>{formatCurrency(formData.professional_tax)}</strong>
                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={3}>
                            <div className="mb-2 p-2 bg-white rounded-2">
                              <small className="text-muted d-block">Basic Salary</small>
                              <strong>{formatCurrency(formData.basic_salary)}</strong>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="mb-2 p-2 bg-white rounded-2">
                              <small className="text-muted d-block">Total Allowances</small>
                              <strong>{formatCurrency(calculateTotalAllowances())}</strong>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="mb-2 p-2 bg-white rounded-2">
                              <small className="text-muted d-block">Total Earnings</small>
                              <strong style={{ color: "#027A48" }}>
                                {formatCurrency(calculateTotalEarnings())}
                              </strong>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="mb-2 p-2 bg-white rounded-2">
                              <small className="text-muted d-block">Total Deductions</small>
                              <strong style={{ color: "#dc3545" }}>
                                {formatCurrency(calculateTotalDeductions())}
                              </strong>
                            </div>
                          </Col>
                        </Row>

                        <div className="bg-white p-3 rounded-2 mt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted">Net Salary (Take Home)</small>
                              <h3 className="mb-0 fw-bold" style={{ color: "#027A48" }}>
                                {formatCurrency(calculateNetSalary())}
                              </h3>
                            </div>
                            <div className="text-end">
                              <small className="text-muted">Breakdown</small>
                              <div className="small">
                                <div>PF: {formatCurrency(calculatePFDeduction())}</div>
                                <div>ESIC: {formatCurrency(calculateESICDeduction())}</div>
                                <div>Professional Tax: {formatCurrency(formData.professional_tax)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>

          {/* Action Buttons inside Card Footer */}
          <Card.Footer className="bg-white border-top-0 pb-4 px-4">
            <div className="d-flex justify-content-between gap-3">
              <Button
                onClick={() => navigate("/staff/salary-structure")}
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

              <div className="d-flex gap-2">
                {activeTab !== "employee" && (
                  <Button
                    type="button"
                    onClick={() => {
                      const tabs = ["employee", "allowances", "deductions", "summary"];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                    style={{
                      backgroundColor: "#6c757d",
                      border: "none",
                      borderRadius: "30px",
                      padding: "10px 20px",
                      fontWeight: "600",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#fff",
                    }}
                  >
                    Previous
                  </Button>
                )}
                
                {activeTab !== "summary" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (activeTab === "employee") {
                        if (!formData.staff_id || !formData.effective_from || !formData.basic_salary) {
                          toast.error("Please fill all required fields in Employee Information tab");
                          return;
                        }
                      }
                      const tabs = ["employee", "allowances", "deductions", "summary"];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
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
                      color: "#fff",
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
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
                        <FaSave className="me-2" /> Create Salary Structure
                      </>
                    )}
                  </Button>
                )}
              </div>
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
        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </Container>
  );
};

export default AddSalaryStructure;