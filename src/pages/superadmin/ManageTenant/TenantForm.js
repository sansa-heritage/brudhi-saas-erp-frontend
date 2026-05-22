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
  Tabs,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaBuilding,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCrown,
  FaCalendar,
  FaCog,
  FaDatabase,
  FaShieldAlt,
  FaCheckCircle,
  FaFileInvoice,
} from "react-icons/fa";
import {
  createTenant,
  updateTenant,
  getTenantById,
} from "../../../api/superadmin/tenant.api";
import { getPlans } from "../../../api/superadmin/plans.api";

const TenantForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [tenantPlanName, setTenantPlanName] = useState("");

  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    subdomain: "",
    email: "",
    phone: "",
    
    // Admin Account (only for create)
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminMobile: "",
    confirmPassword: "",
    
    // Subscription
    subscriptionPlanId: "",
    trialDays: 14,
    status: "active",
    
    // Configuration
    config: {
      theme: "default",
      timezone: "Asia/Kolkata",
      currency: "INR",
      dateFormat: "DD/MM/YYYY",
      invoicePrefix: "INV",
    }
  });

  const [errors, setErrors] = useState({});

  // Load plans first
  useEffect(() => {
    loadPlans();
  }, []);

  // After plans are loaded, load tenant data if editing
  useEffect(() => {
    if (!loadingPlans && id) {
      loadTenantData();
    }
  }, [loadingPlans, id]);

  // Update selected plan details when plan changes
  useEffect(() => {
    if (formData.subscriptionPlanId) {
      const plan = plans.find(p => p.id === parseInt(formData.subscriptionPlanId));
      setSelectedPlanDetails(plan);
    } else {
      setSelectedPlanDetails(null);
    }
  }, [formData.subscriptionPlanId, plans]);

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await getPlans();
      console.log("Plans API response:", response);
      
      let plansData = [];
      if (response?.data?.data) plansData = response.data.data;
      else if (response?.data) plansData = response.data;
      else if (Array.isArray(response)) plansData = response;
      
      // Filter only active plans
      const activePlans = plansData.filter(plan => plan.is_active === 1);
      setPlans(activePlans);
      console.log("Active plans loaded:", activePlans);
    } catch (error) {
      console.error("Failed to load plans:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to load subscription plans",
      });
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadTenantData = async () => {
    setLoading(true);
    try {
      const response = await getTenantById(id);
      console.log("Tenant response:", response);
      
      let tenantData = null;
      if (response?.data?.data) tenantData = response.data.data;
      else if (response?.data) tenantData = response.data;
      else tenantData = response;
      
      console.log("Tenant plan_name:", tenantData.plan_name);
      console.log("Available plans:", plans.map(p => ({ id: p.id, name: p.name })));
      
      // Store the tenant's plan name for matching
      setTenantPlanName(tenantData.plan_name);
      
      // FIX: Find the plan ID by matching the plan name
      let matchedPlanId = "";
      if (tenantData.plan_name && plans.length > 0) {
        const matchedPlan = plans.find(
          plan => plan.name.toLowerCase() === tenantData.plan_name.toLowerCase()
        );
        if (matchedPlan) {
          matchedPlanId = String(matchedPlan.id);
          console.log(`Matched plan "${tenantData.plan_name}" to ID: ${matchedPlanId}`);
        } else {
          console.warn(`No plan found with name: ${tenantData.plan_name}`);
        }
      }
      
      setFormData({
        name: tenantData.name || "",
        subdomain: tenantData.subdomain || "",
        email: tenantData.email || "",
        phone: tenantData.phone || "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        adminMobile: "",
        confirmPassword: "",
        subscriptionPlanId: matchedPlanId, // Use the matched plan ID
        trialDays: tenantData.trial_days || 14,
        status: tenantData.status || "active",
        config: tenantData.config || {
          theme: "default",
          timezone: "Asia/Kolkata",
          currency: "INR",
          dateFormat: "DD/MM/YYYY",
          invoicePrefix: "INV",
        }
      });
    } catch (error) {
      console.error("Failed to load tenant:", error);
      setError("Failed to load tenant data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Organization name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Organization name must be at least 2 characters";
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = "Subdomain is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = "Subdomain can only contain lowercase letters, numbers, and hyphens";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!id) {
      if (!formData.adminName.trim()) {
        newErrors.adminName = "Admin name is required";
      }
      if (!formData.adminEmail.trim()) {
        newErrors.adminEmail = "Admin email is required";
      }
      if (!formData.adminPassword) {
        newErrors.adminPassword = "Admin password is required";
      } else if (formData.adminPassword.length < 6) {
        newErrors.adminPassword = "Password must be at least 6 characters";
      }
      if (formData.confirmPassword !== formData.adminPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (!formData.subscriptionPlanId) {
      newErrors.subscriptionPlanId = "Please select a subscription plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please check the form for errors",
      });
      return;
    }

    setSaving(true);
    try {
      if (id) {
        const updateData = {
          name: formData.name,
          subdomain: formData.subdomain,
          email: formData.email,
          phone: formData.phone || null,
          subscriptionPlanId: parseInt(formData.subscriptionPlanId),
          status: formData.status,
          config: formData.config
        };
        
        await updateTenant(id, updateData);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Tenant updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const createData = {
          name: formData.name,
          subdomain: formData.subdomain,
          email: formData.email,
          phone: formData.phone || null,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          adminMobile: formData.adminMobile || null,
          subscriptionPlanId: parseInt(formData.subscriptionPlanId),
          trialDays: formData.trialDays,
          config: formData.config
        };
        
        await createTenant(createData);
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: "Tenant created successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      navigate("/superadmin/tenants");
    } catch (error) {
      console.error("Failed to save tenant:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to save tenant",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading || loadingPlans) {
    return (
      <Container fluid className="p-4 bg-light">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h5 className="mt-3">Loading tenant data...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 d-flex align-items-center text-primary mb-2"
            onClick={() => navigate("/superadmin/tenants")}
          >
            <FaArrowLeft className="me-2" /> Back to Tenants
          </Button>
          <h2 className="fw-bold mb-1">
            <FaBuilding className="me-2 text-primary" />
            {id ? "Edit Tenant" : "Create New Tenant"}
          </h2>
          <p className="text-muted">
            {id ? "Update tenant information and configuration" : "Register a new organization on the platform"}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <FaShieldAlt className="me-2" /> {error}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="basic" title="Basic Information">
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Organization Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Aditya Gas Service"
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Subdomain <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="subdomain"
                      value={formData.subdomain}
                      onChange={handleChange}
                      placeholder="e.g., aditya-gas"
                      isInvalid={!!errors.subdomain}
                    />
                    <Form.Control.Feedback type="invalid">{errors.subdomain}</Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      URL: https://{formData.subdomain || "your-tenant"}.yourdomain.com
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@company.com"
                      isInvalid={!!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      isInvalid={!!errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {!id && (
          <Tab eventKey="admin" title="Admin Account">
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <Alert variant="info" className="mb-4">
                  <FaUser className="me-2" />
                  This will be the super admin account for the tenant.
                </Alert>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Admin Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleChange}
                        placeholder="Full name"
                        isInvalid={!!errors.adminName}
                      />
                      <Form.Control.Feedback type="invalid">{errors.adminName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Admin Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        name="adminEmail"
                        value={formData.adminEmail}
                        onChange={handleChange}
                        placeholder="admin@company.com"
                        isInvalid={!!errors.adminEmail}
                      />
                      <Form.Control.Feedback type="invalid">{errors.adminEmail}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Admin Password <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="password"
                        name="adminPassword"
                        value={formData.adminPassword}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        isInvalid={!!errors.adminPassword}
                      />
                      <Form.Control.Feedback type="invalid">{errors.adminPassword}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        isInvalid={!!errors.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Admin Mobile</Form.Label>
                      <Form.Control
                        type="tel"
                        name="adminMobile"
                        value={formData.adminMobile}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>
        )}

        <Tab eventKey="subscription" title="Subscription & Plan">
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-4">
              <Row className="d-flex">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Subscription Plan <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="subscriptionPlanId"
                      value={formData.subscriptionPlanId}
                      onChange={handleChange}
                      isInvalid={!!errors.subscriptionPlanId}
                    >
                      <option value="">-- Select a Plan --</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={String(plan.id)}>
                          {plan.name} - ₹{formatCurrency(plan.price)}/month
                          {plan.max_users && ` | Max ${plan.max_users} Users`}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.subscriptionPlanId}
                    </Form.Control.Feedback>
                    
                    {/* Show current plan info in edit mode */}
                    {id && formData.subscriptionPlanId && (
                      <Form.Text className="text-success mt-2 d-block">
                        <FaCheckCircle className="me-1" />
                        Current plan: {plans.find(p => String(p.id) === formData.subscriptionPlanId)?.name || tenantPlanName} 
                        {tenantPlanName && ` (${tenantPlanName})`}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  {!id && (
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaCalendar className="me-1" /> Trial Period (Days)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="trialDays"
                        value={formData.trialDays}
                        onChange={handleChange}
                        min="0"
                        max="90"
                        isInvalid={!!errors.trialDays}
                      />
                      <Form.Control.Feedback type="invalid">{errors.trialDays}</Form.Control.Feedback>
                    </Form.Group>
                  )}
                </Col>
                <Col md={6}>
                  {id && (
                    <Form.Group className="mb-3">
                      <Form.Label>Tenant Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </Form.Select>
                    </Form.Group>
                  )}
                </Col>
              </Row>

              {/* Plan Details Card */}
              {selectedPlanDetails && (
                <Card className="mt-4 bg-light border-0">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">
                      <FaCrown className="text-warning me-2" />
                      Plan Details: {selectedPlanDetails.name}
                    </h6>
                    <Row>
                      <Col md={6}>
                        <div className="mb-2">
                          <small className="text-muted">Price</small>
                          <div className="fw-bold">₹{formatCurrency(selectedPlanDetails.price)}/month</div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-2">
                          <small className="text-muted">Description</small>
                          <div>{selectedPlanDetails.description}</div>
                        </div>
                      </Col>
                    </Row>
                    
                    <h6 className="fw-bold mt-3 mb-2">Features Included:</h6>
                    <Row>
                      {selectedPlanDetails.features?.features?.map((feature, idx) => (
                        <Col md={6} key={idx}>
                          <small className="text-muted">
                            <FaCheckCircle className="text-success me-1" size={12} />
                            {feature}
                          </small>
                        </Col>
                      ))}
                    </Row>

                    <hr className="my-3" />
                    
                    <h6 className="fw-bold mb-2">Limits:</h6>
                    <Row>
                      <Col md={3}>
                        <small className="text-muted">Max Users</small>
                        <div><strong>{selectedPlanDetails.max_users || 'Unlimited'}</strong></div>
                      </Col>
                      <Col md={3}>
                        <small className="text-muted">Max Invoices</small>
                        <div><strong>{selectedPlanDetails.max_invoices || 'Unlimited'}</strong></div>
                      </Col>
                      <Col md={3}>
                        <small className="text-muted">Max Customers</small>
                        <div><strong>{selectedPlanDetails.max_customers || 'Unlimited'}</strong></div>
                      </Col>
                      <Col md={3}>
                        <small className="text-muted">Max Stock Items</small>
                        <div><strong>{selectedPlanDetails.max_stock_items || 'Unlimited'}</strong></div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="configuration" title="Configuration">
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Theme</Form.Label>
                    <Form.Select
                      value={formData.config.theme}
                      onChange={(e) => handleConfigChange("theme", e.target.value)}
                    >
                      <option value="default">Default (Light)</option>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date Format</Form.Label>
                    <Form.Select
                      value={formData.config.dateFormat}
                      onChange={(e) => handleConfigChange("dateFormat", e.target.value)}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Timezone</Form.Label>
                    <Form.Select
                      value={formData.config.timezone}
                      onChange={(e) => handleConfigChange("timezone", e.target.value)}
                    >
                      <option value="Asia/Kolkata">IST (India)</option>
                      <option value="America/New_York">EST (USA)</option>
                      <option value="Europe/London">GMT (UK)</option>
                      <option value="Asia/Dubai">GST (UAE)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Currency</Form.Label>
                    <Form.Select
                      value={formData.config.currency}
                      onChange={(e) => handleConfigChange("currency", e.target.value)}
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Invoice Prefix</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.config.invoicePrefix}
                      onChange={(e) => handleConfigChange("invoicePrefix", e.target.value)}
                      placeholder="INV"
                    />
                    <Form.Text className="text-muted">
                      Prefix for invoice numbers (e.g., INV-0001)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <div className="d-flex justify-content-end gap-3 mt-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/superadmin/tenants")}
          className="rounded-pill px-4"
          disabled={saving}
        >
          <FaTimes className="me-2" /> Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-pill px-4"
        >
          {saving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {id ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <FaSave className="me-2" />
              {id ? "Update Tenant" : "Create Tenant"}
            </>
          )}
        </Button>
      </div>
    </Container>
  );
};

export default TenantForm;