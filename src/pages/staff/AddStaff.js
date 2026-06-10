import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
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
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaIdCard,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes,
  FaPhone,
  FaBuilding,
  FaFileInvoice,
  FaCreditCard,
  FaBriefcase,
  FaCalendarAlt,
  FaUserTag,
  FaLock,
} from "react-icons/fa";
import {
  createStaff,
  getRoles,
  getStaff,
} from "../../components/services/staffService";
import {
  countryApi,
  stateApi,
  cityApi,
  pincodeApi,
} from "../../api/superadmin/masterData.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddStaff = () => {
  const navigate = useNavigate();

  // Location data states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [roles, setRoles] = useState([]);

  // Loading states
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("staff");

  // State for existing staff (for duplicate check)
  const [existingStaff, setExistingStaff] = useState([]);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: "",
    name: "",
    password: "",
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    role_id: "2",
    department: "Sales",
    designation: "",
    joining_date: new Date().toISOString().split("T")[0],
    salary: "",
    address: "",
    landmark: "",
    countryId: "",
    stateId: "",
    cityId: "",
    pincodeId: "",
    status: "active",
  });

  // Load existing staff for duplicate check
  useEffect(() => {
    loadExistingStaff();
    loadRoles();
    fetchCountries();
  }, []);

  const loadExistingStaff = async () => {
    try {
      const response = await getStaff();
      let staffData = [];
      if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        staffData = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        staffData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        staffData = response.data;
      } else if (Array.isArray(response)) {
        staffData = response;
      }
      setExistingStaff(staffData);
    } catch (error) {
      console.error("Failed to load staff for validation:", error);
    }
  };

  const loadRoles = async () => {
    try {
      const rolesData = await getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return { isValid: false, message: "Email is required" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return { isValid: true, message: "" };
    }
    return { isValid: false, message: "Invalid email format" };
  };

  const validatePhone = (phone) => {
    if (!phone) return { isValid: false, message: "Mobile number is required" };
    const phoneRegex = /^[6-9]\d{9}$/;
    if (phoneRegex.test(phone)) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Mobile number must be 10 digits starting with 6-9",
    };
  };

  const validatePassword = (password) => {
    if (!password) return { isValid: false, message: "Password is required" };
    if (password.length >= 6) {
      return { isValid: true, message: "" };
    }
    return { isValid: false, message: "Password must be at least 6 characters" };
  };

  // Check for duplicate staff
  const validateStaffDuplicate = (firstName, lastName, email, phone, excludeId = null) => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName || fullName === "") {
      return { isValid: false, message: "Staff name is required" };
    }

    const duplicateStaff = existingStaff.find((staff) => {
      const staffFullName = `${staff.first_name || ""} ${staff.last_name || ""}`.trim();
      const sameName = staffFullName.toLowerCase() === fullName.toLowerCase();
      const sameEmail = staff.email && staff.email.toLowerCase() === email.toLowerCase();
      const samePhone = staff.phone === phone;
      const isSameStaff = excludeId ? staff.id !== parseInt(excludeId) : true;

      return sameName && (sameEmail || samePhone) && isSameStaff;
    });

    if (duplicateStaff) {
      if (duplicateStaff.email && duplicateStaff.email.toLowerCase() === email.toLowerCase()) {
        return {
          isValid: false,
          message: `Staff with name "${fullName}" already exists with same email "${email}". Please use different email.`,
        };
      }
      if (duplicateStaff.phone === phone) {
        return {
          isValid: false,
          message: `Staff with name "${fullName}" already exists with same phone number "${phone}". Please use different phone number.`,
        };
      }
    }

    return { isValid: true, message: "" };
  };

  // Real-time validation handlers
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));
    const validation = validateEmail(value);
    setValidationErrors((prev) => ({
      ...prev,
      email: validation.isValid ? "" : validation.message,
    }));

    if (formData.first_name && formData.phone) {
      const duplicateCheck = validateStaffDuplicate(
        formData.first_name,
        formData.last_name,
        value,
        formData.phone,
      );
      setValidationErrors((prev) => ({
        ...prev,
        name: duplicateCheck.isValid ? "" : duplicateCheck.message,
      }));
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));

    if (value.length === 10) {
      const validation = validatePhone(value);
      setValidationErrors((prev) => ({
        ...prev,
        phone: validation.isValid ? "" : validation.message,
      }));
    } else if (value.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        phone: "Mobile number must be 10 digits",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, phone: "" }));
    }

    if (formData.first_name && formData.email) {
      const duplicateCheck = validateStaffDuplicate(
        formData.first_name,
        formData.last_name,
        formData.email,
        value,
      );
      setValidationErrors((prev) => ({
        ...prev,
        name: duplicateCheck.isValid ? "" : duplicateCheck.message,
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));
    const validation = validatePassword(value);
    setValidationErrors((prev) => ({
      ...prev,
      password: validation.isValid ? "" : validation.message,
    }));
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, first_name: value }));
    validateNameDuplicate();
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, last_name: value }));
    validateNameDuplicate();
  };

  const validateNameDuplicate = () => {
    const fullName = `${formData.first_name} ${formData.last_name}`.trim();

    if (!fullName || fullName === "") {
      setValidationErrors((prev) => ({
        ...prev,
        name: "Staff name is required",
      }));
    } else if (formData.email && formData.phone) {
      const duplicateCheck = validateStaffDuplicate(
        formData.first_name,
        formData.last_name,
        formData.email,
        formData.phone,
      );
      setValidationErrors((prev) => ({
        ...prev,
        name: duplicateCheck.isValid ? "" : duplicateCheck.message,
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getValidationIcon = (fieldValue, validationError) => {
    if (!fieldValue) {
      return <FaInfoCircle className="text-secondary ms-1" size={14} />;
    }
    if (!validationError) {
      return <FaCheckCircle className="text-success ms-1" size={14} />;
    }
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-${fieldValue}`}>{validationError}</Tooltip>
        }
      >
        <span className="text-danger ms-1" style={{ cursor: "pointer" }}>
          <FaExclamationTriangle size={14} />
        </span>
      </OverlayTrigger>
    );
  };

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (formData.countryId) {
      fetchStates(formData.countryId);
      setFormData((prev) => ({
        ...prev,
        stateId: "",
        cityId: "",
        pincodeId: "",
      }));
      setCities([]);
      setPincodes([]);
    } else {
      setStates([]);
      setCities([]);
      setPincodes([]);
    }
  }, [formData.countryId]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.stateId) {
      fetchCities(formData.stateId);
      setFormData((prev) => ({ ...prev, cityId: "", pincodeId: "" }));
      setPincodes([]);
    } else {
      setCities([]);
      setPincodes([]);
    }
  }, [formData.stateId]);

  // Fetch pincodes when city changes
  useEffect(() => {
    if (formData.cityId) {
      fetchPincodes(formData.cityId);
      setFormData((prev) => ({ ...prev, pincodeId: "" }));
    } else {
      setPincodes([]);
    }
  }, [formData.cityId]);

  const extractDataFromResponse = (response) => {
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  };

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await countryApi.getAll();
      const countriesData = extractDataFromResponse(response);
      const activeCountries = countriesData.filter(
        (country) => country.status === 1,
      );
      setCountries(activeCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setError("Failed to load countries");
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryId) => {
    setLoadingStates(true);
    try {
      const response = await stateApi.getDropdown(countryId);
      const statesData = extractDataFromResponse(response);
      const activeStates = statesData.filter(
        (state) => state.status === undefined || state.status === 1,
      );
      setStates(activeStates);
    } catch (error) {
      console.error("Error fetching states:", error);
      setError("Failed to load states");
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateId) => {
    setLoadingCities(true);
    try {
      const response = await cityApi.getDropdown(stateId);
      const citiesData = extractDataFromResponse(response);
      const activeCities = citiesData.filter(
        (city) => city.status === undefined || city.status === 1,
      );
      setCities(activeCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setError("Failed to load cities");
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchPincodes = async (cityId) => {
    if (!cityId) return;
    setLoadingPincodes(true);
    try {
      const response = await pincodeApi.getAll({ cityId });
      const pincodesData = extractDataFromResponse(response);
      setPincodes(pincodesData);
    } catch (error) {
      console.error("Error fetching pincodes:", error);
      setError("Failed to load pincodes");
    } finally {
      setLoadingPincodes(false);
    }
  };

  // Handle country selection - update both ID and fetch states
  const handleCountryChange = async (e) => {
    const countryId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      countryId: countryId,
      stateId: "",
      cityId: "",
      pincodeId: "",
    }));
    setCities([]);
    setPincodes([]);
    if (countryId) {
      await fetchStates(countryId);
    } else {
      setStates([]);
    }
  };

  // Handle state selection - update both ID and fetch cities
  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      stateId: stateId,
      cityId: "",
      pincodeId: "",
    }));
    setPincodes([]);
    if (stateId) {
      await fetchCities(stateId);
    } else {
      setCities([]);
    }
  };

  // Handle city selection - update both ID and fetch pincodes
  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      cityId: cityId,
      pincodeId: "",
    }));
    if (cityId) {
      await fetchPincodes(cityId);
    } else {
      setPincodes([]);
    }
  };

  const validateForm = () => {
    if (!formData.first_name || formData.first_name.trim() === "") {
      setError("First name is required");
      setActiveTab("staff");
      return false;
    }
    if (!formData.email || formData.email.trim() === "") {
      setError("Email is required");
      setActiveTab("staff");
      return false;
    }
    if (!formData.phone || formData.phone.trim() === "") {
      setError("Mobile number is required");
      setActiveTab("staff");
      return false;
    }
    if (formData.phone.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      setActiveTab("staff");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      setActiveTab("staff");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setActiveTab("staff");
      return false;
    }
    if (!formData.designation) {
      setError("Designation is required");
      setActiveTab("employment");
      return false;
    }

    const duplicateCheck = validateStaffDuplicate(
      formData.first_name,
      formData.last_name,
      formData.email,
      formData.phone,
    );
    if (!duplicateCheck.isValid) {
      setError(duplicateCheck.message);
      setActiveTab("staff");
      return false;
    }

    const emailValid = validateEmail(formData.email).isValid;
    const phoneValid = validatePhone(formData.phone).isValid;

    if (!emailValid) {
      setError("Please enter a valid email address");
      setActiveTab("staff");
      return false;
    }
    if (!phoneValid) {
      setError("Please enter a valid mobile number (10 digits starting with 6-9)");
      setActiveTab("staff");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      // Get the selected country, state, city names from the dropdown arrays
      const selectedCountry = countries.find(c => c.id === parseInt(formData.countryId));
      const selectedState = states.find(s => s.id === parseInt(formData.stateId));
      const selectedCity = cities.find(c => c.id === parseInt(formData.cityId));
      const selectedPincode = pincodes.find(p => p.id === parseInt(formData.pincodeId));

      const submitData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name?.trim() || null,
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role_id: parseInt(formData.role_id),
        department: formData.department,
        designation: formData.designation,
        joining_date: formData.joining_date,
        salary: parseFloat(formData.salary) || 0,
        address: formData.address || null,
        landmark: formData.landmark || null,
        // Send the actual text values from dropdown selections
        country: selectedCountry?.name || null,
        state: selectedState?.name || null,
        city: selectedCity?.name || null,
        zip_code: selectedPincode?.code || null,
        countryId: formData.countryId ? Number(formData.countryId) : null,
        stateId: formData.stateId ? Number(formData.stateId) : null,
        cityId: formData.cityId ? Number(formData.cityId) : null,
        pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,
        status: formData.status,
      };

      console.log("📤 Sending payload:", JSON.stringify(submitData, null, 2));
      await createStaff(submitData);

      toast.success(`✅ Staff "${formData.first_name} ${formData.last_name}" added successfully! 🎉`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });

      setTimeout(() => {
        navigate("/staffs");
      }, 2000);
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err.response?.data?.message || "Failed to save staff";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
            <Nav
              variant="tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav.Item>
                <Nav.Link eventKey="staff" className="fw-semibold">
                  <FaUser className="me-2" /> Staff Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="employment" className="fw-semibold">
                  <FaBriefcase className="me-2" /> Employment Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="address" className="fw-semibold">
                  <FaMapMarkerAlt className="me-2" /> Address Information
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* Staff Information Tab */}
              <Tab.Pane eventKey="staff" active={activeTab === "staff"}>
                <Row>
                  {/* Left Column - Basic Information */}
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaUser className="me-2" /> Basic Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name *</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleFirstNameChange}
                              placeholder="Enter first name"
                              required
                              className="flex-grow-1"
                            />
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleLastNameChange}
                            placeholder="Enter last name"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleEmailChange}
                          placeholder="staff@company.com"
                          required
                          isInvalid={!!validationErrors.email && !!formData.email}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.email, validationErrors.email)}
                      </div>
                      {validationErrors.email && formData.email && (
                        <Form.Text className="text-danger">{validationErrors.email}</Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Mobile Number *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="9876543210"
                          required
                          maxLength="10"
                          isInvalid={!!validationErrors.phone && !!formData.phone}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.phone, validationErrors.phone)}
                      </div>
                      {validationErrors.phone && formData.phone && (
                        <Form.Text className="text-danger">{validationErrors.phone}</Form.Text>
                      )}
                      <Form.Text className="text-muted">10 digits only, starts with 6-9</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handlePasswordChange}
                          placeholder="Enter password"
                          required
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.password, validationErrors.password)}
                      </div>
                      {validationErrors.password && formData.password && (
                        <Form.Text className="text-danger">{validationErrors.password}</Form.Text>
                      )}
                      <Form.Text className="text-muted">Minimum 6 characters</Form.Text>
                    </Form.Group>
                  </Col>

                  {/* Right Column - Role & Status */}
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaUserTag className="me-2" /> Role & Status
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-3">
                      <Form.Label>Role / Access Level</Form.Label>
                      <Form.Select
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="Sales">Sales</option>
                        <option value="Accounts">Accounts</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Admin">Admin</option>
                        <option value="HR">HR</option>
                        <option value="Operations">Operations</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Employment Details Tab */}
              <Tab.Pane eventKey="employment" active={activeTab === "employment"}>
                <Row>
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaBriefcase className="me-2" /> Employment Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-3">
                      <Form.Label>Designation *</Form.Label>
                      <Form.Control
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g., Sales Manager"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Joining Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="joining_date"
                        value={formData.joining_date}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaRupeeSign className="me-2" /> Financial Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-3">
                      <Form.Label>Salary (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="Enter salary amount"
                        min="0"
                        step="1000"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Address Information Tab */}
              <Tab.Pane eventKey="address" active={activeTab === "address"}>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Select
                        name="countryId"
                        value={formData.countryId}
                        onChange={handleCountryChange}
                        disabled={loadingCountries}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name} {country.code ? `(${country.code})` : ""}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingCountries && (
                        <Form.Text className="text-muted">
                          <Spinner animation="border" size="sm" /> Loading countries...
                        </Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Select
                        name="stateId"
                        value={formData.stateId}
                        onChange={handleStateChange}
                        disabled={!formData.countryId || loadingStates}
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingStates && (
                        <Form.Text className="text-muted">
                          <Spinner animation="border" size="sm" /> Loading states...
                        </Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Select
                        name="cityId"
                        value={formData.cityId}
                        onChange={handleCityChange}
                        disabled={!formData.stateId || loadingCities}
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingCities && (
                        <Form.Text className="text-muted">
                          <Spinner animation="border" size="sm" /> Loading cities...
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pincode</Form.Label>
                      <Form.Select
                        name="pincodeId"
                        value={formData.pincodeId}
                        onChange={handleChange}
                        disabled={!formData.cityId || loadingPincodes}
                      >
                        <option value="">Select Pincode</option>
                        {pincodes.map((pincode) => (
                          <option key={pincode.id} value={pincode.id}>
                            {pincode.code} {pincode.area ? `- ${pincode.area}` : ""}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingPincodes && (
                        <Form.Text className="text-muted">
                          <Spinner animation="border" size="sm" /> Loading pincodes...
                        </Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Landmark</Form.Label>
                      <Form.Control
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        placeholder="Near landmark"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street address, building name, etc."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>

          {/* Action Buttons inside Card Footer */}
          <Card.Footer className="bg-white border-top-0 pb-4 px-4">
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            <div className="d-flex justify-content-between gap-3">
              <Button
                onClick={() => navigate("/staffs")}
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Submit
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
      `}</style>
    </Container>
  );
};

export default AddStaff;