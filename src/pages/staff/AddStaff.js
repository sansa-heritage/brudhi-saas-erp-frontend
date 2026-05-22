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
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaHome,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaCalendarAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaMapPin,
  FaUserTag,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaIdCard,
  FaRupeeSign,
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
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Location data states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);

  // Loading states
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);

  // State for existing staff (for duplicate check)
  const [existingStaff, setExistingStaff] = useState([]);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: "",
    name: "",
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
    country_id: "",
    state_id: "",
    city_id: "",
    pincode_id: "",
    status: "active",
    notes: "",
  });

  // Load existing staff for duplicate check
  useEffect(() => {
    loadExistingStaff();
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

  useEffect(() => {
    loadRoles();
    fetchCountries();
  }, []);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return { isValid: true, message: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Invalid email format (e.g., name@company.com)",
    };
  };

  const validatePhone = (phone) => {
    if (!phone) return { isValid: true, message: "" };
    const phoneRegex = /^[6-9]\d{9}$/;
    if (phoneRegex.test(phone)) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Mobile number must be 10 digits starting with 6-9",
    };
  };

  // Check for duplicate staff
  const validateStaffDuplicate = (
    firstName,
    lastName,
    email,
    phone,
    excludeId = null,
  ) => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName || fullName === "") {
      return { isValid: false, message: "Staff name is required" };
    }

    const duplicateStaff = existingStaff.find((staff) => {
      const staffFullName =
        `${staff.first_name || ""} ${staff.last_name || ""}`.trim();
      const sameName = staffFullName.toLowerCase() === fullName.toLowerCase();
      const sameEmail =
        staff.email && staff.email.toLowerCase() === email.toLowerCase();
      const samePhone = staff.phone === phone;
      const isSameStaff = excludeId ? staff.id !== parseInt(excludeId) : true;

      return sameName && (sameEmail || samePhone) && isSameStaff;
    });

    if (duplicateStaff) {
      if (
        duplicateStaff.email &&
        duplicateStaff.email.toLowerCase() === email.toLowerCase()
      ) {
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

  // Helper function to extract data from API response
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
    if (!countryId) {
      setStates([]);
      return;
    }
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
    if (!stateId) {
      setCities([]);
      return;
    }
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
    if (!cityId) {
      setPincodes([]);
      return;
    }
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

  const handleCountryChange = (e) => {
    const countryId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      country_id: countryId,
      state_id: "",
      city_id: "",
      pincode_id: "",
    }));
    fetchStates(countryId);
    setCities([]);
    setPincodes([]);
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state_id: stateId,
      city_id: "",
      pincode_id: "",
    }));
    fetchCities(stateId);
    setPincodes([]);
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setFormData((prev) => ({ ...prev, city_id: cityId, pincode_id: "" }));
    fetchPincodes(cityId);
  };

  const loadRoles = async () => {
    try {
      const rolesData = await getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  const validateForm = () => {
    const fullName = `${formData.first_name} ${formData.last_name}`.trim();

    if (!fullName || fullName === "") {
      setError("Staff name is required");
      return false;
    }

    if (!formData.email || formData.email.trim() === "") {
      setError("Email is required");
      return false;
    }

    if (!formData.phone || formData.phone.trim() === "") {
      setError("Phone number is required");
      return false;
    }

    if (formData.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (!formData.designation) {
      setError("Designation is required");
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
      return false;
    }

    const emailValid = validateEmail(formData.email).isValid;
    const phoneValid = validatePhone(formData.phone).isValid;

    if (!emailValid) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!phoneValid) {
      setError(
        "Please enter a valid mobile number (10 digits starting with 6-9)",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError("");

    try {
      const selectedCountry = countries.find(
        (c) => c.id === parseInt(formData.country_id),
      );
      const selectedState = states.find(
        (s) => s.id === parseInt(formData.state_id),
      );
      const selectedCity = cities.find(
        (c) => c.id === parseInt(formData.city_id),
      );
      const selectedPincode = pincodes.find(
        (p) => p.id === parseInt(formData.pincode_id),
      );

      const staffData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name?.trim() || null,
        email: formData.email.trim(),
        password: formData.password,
        role_id: parseInt(formData.role_id),
        phone: formData.phone.trim(),
        department: formData.department,
        designation: formData.designation,
        joining_date: formData.joining_date,
        address: formData.address?.trim() || null,
        city: selectedCity?.name || null,
        state: selectedState?.name || null,
        country: selectedCountry?.name || null,
        zip_code: selectedPincode?.code || null,
        status: formData.status,
        notes: formData.notes?.trim() || null,
      };

      console.log("Sending staff data:", staffData);
      await createStaff(staffData);

      // ✅ SUCCESS TOAST MESSAGE
      toast.success(`✅ Staff "${formData.first_name} ${formData.last_name}" added successfully! 🎉`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });

      setTimeout(() => {
        navigate("/staffs");
      }, 1500);
    } catch (error) {
      console.error("Failed to add staff:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add staff member";
      setError(errorMessage);
      
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    navigate("/staffs");
  };

  return (
    <Container
      fluid
      className="px-4 py-3"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      {/* React Toastify Container */}
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
      <div className="bg-secondary text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaUser className="me-2" /> Add New Staff
            </h2>
            <p className="mb-0 opacity-75">
              Fill in the details to add a new staff
            </p>
          </div>
          <Button
            variant="light"
            onClick={handleGoBack}
            className="rounded-pill px-4"
          >
            <FaArrowLeft className="me-2" /> Back to Staffs
          </Button>
        </div>
      </div>

      <Form>
        <Row className="g-4">
          {/* Personal Information */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaUser className="me-2 text-secondary" /> Personal
                  Information
                </h6>
                <hr />

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleFirstNameChange}
                        placeholder="Enter first name"
                      />
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

                {validationErrors.name &&
                  (formData.first_name || formData.last_name) && (
                    <Alert variant="danger" className="py-2 mb-3">
                      <small>{validationErrors.name}</small>
                    </Alert>
                  )}
                <Form.Text className="text-muted mb-3 d-block">
                  Note: Same name allowed with different email or mobile
                </Form.Text>

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
                    <Form.Text className="text-danger">
                      {validationErrors.email}
                    </Form.Text>
                  )}
                  <Form.Text className="text-muted">
                    Enter a valid email address (e.g., name@company.com)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
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
                    <Form.Text className="text-danger">
                      {validationErrors.phone}
                    </Form.Text>
                  )}
                  <Form.Text className="text-muted">
                    10 digits only, starts with 6-9
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                  />
                  <Form.Text className="text-muted">
                    Minimum 6 characters
                  </Form.Text>
                </Form.Group>

                <h6 className="fw-bold mb-3 mt-4">
                  <FaBriefcase className="me-2 text-secondary" /> Employment
                  Details
                </h6>
                <hr />

                <Row>
                  <Col md={6}>
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
                  </Col>
                  <Col md={6}>
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
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
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
                  </Col>
                  <Col md={6}>
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
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Salary (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
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
              </Card.Body>
            </Card>
          </Col>

          {/* Address Details */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaMapMarkerAlt className="me-2 text-secondary" /> Address
                  Information
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Select
                    name="country_id"
                    value={formData.country_id}
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
                      <Spinner animation="border" size="sm" /> Loading
                      countries...
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="state_id"
                    value={formData.state_id}
                    onChange={handleStateChange}
                    disabled={!formData.country_id || loadingStates}
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
                  {!formData.country_id && (
                    <Form.Text className="text-muted">
                      Please select a country first
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Select
                    name="city_id"
                    value={formData.city_id}
                    onChange={handleCityChange}
                    disabled={!formData.state_id || loadingCities}
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
                  {!formData.state_id && formData.country_id && (
                    <Form.Text className="text-muted">
                      Please select a state first
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Pincode</Form.Label>
                  <Form.Select
                    name="pincode_id"
                    value={formData.pincode_id}
                    onChange={handleChange}
                    disabled={!formData.city_id || loadingPincodes}
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
                      <Spinner animation="border" size="sm" /> Loading
                      pincodes...
                    </Form.Text>
                  )}
                  {!formData.city_id && formData.state_id && (
                    <Form.Text className="text-muted">
                      Please select a city first
                    </Form.Text>
                  )}
                  {formData.city_id &&
                    pincodes.length === 0 &&
                    !loadingPincodes && (
                      <Form.Text className="text-warning">
                        No pincodes found for this city
                      </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address, building name, etc."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes about the staff member..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mt-3">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-pill px-4"
            style={{ backgroundColor: "#6c757d", border: "none" }}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Submit
              </>
            )}
          </Button>
        </div>
      </Form>

      <style>{`
        .bg-secondary {
          background: #6c757d !important;
        }
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
      `}</style>
    </Container>
  );
};

export default AddStaff;