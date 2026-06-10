import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaArrowLeft,
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
  FaIdCard,
  FaRupeeSign,
  FaUserTag,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  getStaffById,
  updateStaff,
  getRoles,
} from "../../components/services/staffService";
import {
  countryApi,
  stateApi,
  cityApi,
  pincodeApi,
} from "../../api/superadmin/masterData.api";

const EditStaff = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState(null);
  const [activeTab, setActiveTab] = useState("staff");

  // Master data state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);

  // Loading states for dropdowns
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    first_name: "",
    email: "",
    phone: "",
    designation: "",
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_id: "2",
    department: "Sales",
    designation: "",
    joining_date: new Date().toISOString().split("T")[0],
    salary: "",
    address: "",
    landmark: "",
    country_id: "",
    state_id: "",
    city_id: "",
    pincode_id: "",
    status: "active",
  });

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
    if (!phone) return { isValid: false, message: "Phone number is required" };
    const phoneRegex = /^[6-9]\d{9}$/;
    if (phoneRegex.test(phone)) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Mobile number must be 10 digits starting with 6-9",
    };
  };

  const getValidationIcon = (fieldValue, error) => {
    if (!fieldValue) {
      return <FaInfoCircle className="text-secondary ms-2" size={14} title="Required field" />;
    }
    if (!error) {
      return <FaCheckCircle className="text-success ms-2" size={14} title="Valid" />;
    }
    return (
      <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-error">{error}</Tooltip>}>
        <span className="text-danger ms-2" style={{ cursor: "pointer" }}>
          <FaExclamationTriangle size={14} />
        </span>
      </OverlayTrigger>
    );
  };

  // Helper function to extract data from API response
  const extractDataFromResponse = (response) => {
    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  };

  // Load countries
  const loadCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await countryApi.getAll();
      const countriesData = extractDataFromResponse(response);
      const activeCountries = countriesData.filter(
        (country) => country.status === 1,
      );
      setCountries(activeCountries);
    } catch (error) {
      console.error("Failed to load countries:", error);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Load states by country ID
  const loadStates = async (countryId) => {
    if (!countryId) return;
    setLoadingStates(true);
    try {
      const response = await stateApi.getAll(countryId);
      const statesData = extractDataFromResponse(response);
      setStates(statesData);
    } catch (error) {
      console.error("Failed to load states:", error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Load cities by state ID
  const loadCities = async (stateId) => {
    if (!stateId) return;
    setLoadingCities(true);
    try {
      const response = await cityApi.getDropdown(stateId);
      const citiesData = extractDataFromResponse(response);
      setCities(citiesData);
    } catch (error) {
      console.error("Failed to load cities:", error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Load pincodes by city ID
  const loadPincodes = async (cityId) => {
    if (!cityId) return;
    setLoadingPincodes(true);
    try {
      const response = await pincodeApi.getAll({ cityId });
      const pincodesData = extractDataFromResponse(response);
      setPincodes(pincodesData);
    } catch (error) {
      console.error("Failed to load pincodes:", error);
      setPincodes([]);
    } finally {
      setLoadingPincodes(false);
    }
  };

  // Load roles
  const loadRoles = async () => {
    try {
      const rolesData = await getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
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
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, first_name: value }));
    if (!value || value.trim() === "") {
      setValidationErrors((prev) => ({
        ...prev,
        first_name: "First name is required",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, first_name: "" }));
    }
  };

  const handleDesignationChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, designation: value }));
    if (!value || value.trim() === "") {
      setValidationErrors((prev) => ({
        ...prev,
        designation: "Designation is required",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, designation: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Load staff data
  useEffect(() => {
    const loadStaffData = async () => {
      setLoading(true);
      try {
        await loadCountries();
        await loadRoles();

        const response = await getStaffById(id);
        
        let data = response;
        if (response?.data?.data) {
          data = response.data.data;
        } else if (response?.data) {
          data = response.data;
        }

        if (data) {
          setStaff(data);
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            role_id: data.role_id?.toString() || "2",
            department: data.department || "Sales",
            designation: data.designation || "",
            joining_date: data.joining_date
              ? data.joining_date.split("T")[0]
              : new Date().toISOString().split("T")[0],
            salary: data.salary || "",
            address: data.address || "",
            landmark: data.landmark || "",
            country_id: data.country_id || "",
            state_id: data.state_id || "",
            city_id: data.city_id || "",
            pincode_id: data.pincode_id || "",
            status: data.status || "active",
          });

          if (data.country_id) {
            await loadStates(data.country_id);
          }
          if (data.state_id) {
            await loadCities(data.state_id);
          }
          if (data.city_id) {
            await loadPincodes(data.city_id);
          }
        }
      } catch (error) {
        console.error("Failed to load staff:", error);
        toast.error("Failed to load staff details", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadStaffData();
    }
  }, [id]);

  // Handle country change
  const handleCountryChange = async (e) => {
    const countryId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      country_id: countryId,
      state_id: "",
      city_id: "",
      pincode_id: "",
    }));
    setCities([]);
    setPincodes([]);
    if (countryId) {
      await loadStates(countryId);
    } else {
      setStates([]);
    }
  };

  // Handle state change
  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state_id: stateId,
      city_id: "",
      pincode_id: "",
    }));
    setPincodes([]);
    if (stateId) {
      await loadCities(stateId);
    } else {
      setCities([]);
    }
  };

  // Handle city change
  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      city_id: cityId,
      pincode_id: "",
    }));
    if (cityId) {
      await loadPincodes(cityId);
    } else {
      setPincodes([]);
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!formData.first_name || formData.first_name.trim() === "") {
      setValidationErrors((prev) => ({
        ...prev,
        first_name: "First name is required",
      }));
      isValid = false;
      setActiveTab("staff");
    }

    if (!formData.email) {
      setValidationErrors((prev) => ({ ...prev, email: "Email is required" }));
      isValid = false;
      setActiveTab("staff");
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          email: emailValidation.message,
        }));
        isValid = false;
        setActiveTab("staff");
      }
    }

    if (!formData.phone) {
      setValidationErrors((prev) => ({
        ...prev,
        phone: "Phone number is required",
      }));
      isValid = false;
      setActiveTab("staff");
    } else {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          phone: phoneValidation.message,
        }));
        isValid = false;
        setActiveTab("staff");
      }
    }

    if (!formData.designation) {
      setValidationErrors((prev) => ({
        ...prev,
        designation: "Designation is required",
      }));
      isValid = false;
      setActiveTab("staff");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name || null,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role_id: parseInt(formData.role_id),
        department: formData.department,
        designation: formData.designation,
        joining_date: formData.joining_date,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        address: formData.address || null,
        landmark: formData.landmark || null,
        country_id: formData.country_id ? parseInt(formData.country_id) : null,
        state_id: formData.state_id ? parseInt(formData.state_id) : null,
        city_id: formData.city_id ? parseInt(formData.city_id) : null,
        pincode_id: formData.pincode_id ? parseInt(formData.pincode_id) : null,
        status: formData.status,
      };

      console.log("Updating staff data:", submitData);
      await updateStaff(id, submitData);

      toast.success(`✅ Staff "${formData.first_name} ${formData.last_name}" updated successfully! 🎉`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });

      setTimeout(() => {
        navigate(`/staffs/view/${id}`);
      }, 1500);
    } catch (error) {
      console.error("Failed to update staff:", error);
      const errorMessage = error.response?.data?.message || "Failed to update staff member";
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading staff data...</h5>
        </div>
      </Container>
    );
  }

  if (!staff) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <Alert variant="secondary" className="text-center">
          <h4>Staff member not found</h4>
          <p>The staff member you're looking for doesn't exist.</p>
          <Button variant="secondary" onClick={() => navigate("/staffs")}>
            Back to Staffs
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
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
          <Card.Header className="bg-white border-0 pt-3 px-4">
            <div className="d-flex gap-2 border-bottom pb-2">
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("staff")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "staff" ? "bg-light" : ""}`}
                style={{ color: activeTab === "staff" ? "rgb(30, 58, 111)" : "#6c757d" }}
              >
                <FaUser className="me-2" /> Staff Information
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("employment")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "employment" ? "bg-light" : ""}`}
                style={{ color: activeTab === "employment" ? "rgb(30, 58, 111)" : "#6c757d" }}
              >
                <FaBriefcase className="me-2" /> Employment Details
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("address")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "address" ? "bg-light" : ""}`}
                style={{ color: activeTab === "address" ? "rgb(30, 58, 111)" : "#6c757d" }}
              >
                <FaMapMarkerAlt className="me-2" /> Address Information
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="p-4">
            {/* Staff Information Tab */}
            {activeTab === "staff" && (
              <div>
                {/* Basic Information Section */}
                <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaUser className="me-2" /> Basic Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>First Name *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleFirstNameChange}
                          placeholder="Enter first name"
                          isInvalid={!!validationErrors.first_name && !!formData.first_name}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.first_name, validationErrors.first_name)}
                      </div>
                      {validationErrors.first_name && formData.first_name && (
                        <Form.Text className="text-danger">{validationErrors.first_name}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Enter last name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Contact Information Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaPhone className="me-2" /> Contact Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleEmailChange}
                          placeholder="staff@company.com"
                          isInvalid={!!validationErrors.email && !!formData.email}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.email, validationErrors.email)}
                      </div>
                      {validationErrors.email && formData.email && (
                        <Form.Text className="text-danger">{validationErrors.email}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone Number *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="9876543210"
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
                  </Col>
                </Row>

                {/* Role & Status Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaUserTag className="me-2" /> Role & Status
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
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
                    <Form.Group>
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
              </div>
            )}

            {/* Employment Details Tab */}
            {activeTab === "employment" && (
              <div>
                <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaBriefcase className="me-2" /> Employment Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Designation *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleDesignationChange}
                          placeholder="e.g., Sales Manager"
                          isInvalid={!!validationErrors.designation && !!formData.designation}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.designation, validationErrors.designation)}
                      </div>
                      {validationErrors.designation && formData.designation && (
                        <Form.Text className="text-danger">{validationErrors.designation}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
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

                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Joining Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="joining_date"
                        value={formData.joining_date}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Salary (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="Enter salary"
                        min="0"
                        step="1000"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}

            {/* Address Information Tab */}
            {activeTab === "address" && (
              <div>
                <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaMapMarkerAlt className="me-2" /> Location Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Select
                        value={formData.country_id}
                        onChange={handleCountryChange}
                        disabled={loadingCountries}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Select
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
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Select
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
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pincode</Form.Label>
                      <Form.Select
                        value={formData.pincode_id}
                        onChange={handleChange}
                        name="pincode_id"
                        disabled={!formData.city_id || loadingPincodes}
                      >
                        <option value="">Select Pincode</option>
                        {pincodes.map((pincode) => (
                          <option key={pincode.id} value={pincode.id}>
                            {pincode.code} {pincode.area ? `- ${pincode.area}` : ""}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
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
                  <Col md={12}>
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
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Action Buttons */}
        <div className="d-flex justify-content-between gap-3 mt-4">
          <Button
            onClick={() => navigate(`/staffs/view/${id}`)}
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
            disabled={saving}
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
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Update Staff
              </>
            )}
          </Button>
        </div>
      </Form>

      <style>{`
        .rounded-3 {
          borderRadius: "12px !important";
        }
      `}</style>
    </Container>
  );
};

export default EditStaff;