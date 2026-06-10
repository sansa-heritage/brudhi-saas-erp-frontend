// frontend/src/pages/EditDealer.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaCreditCard,
  FaRupeeSign,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaFileInvoice,
  FaWallet,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPercent,
  FaUserTie,
} from "react-icons/fa";
import {
  getDealerById,
  updateDealer,
} from "../../components/services/dealerService";
import {
  countryApi,
  stateApi,
  cityApi,
  pincodeApi,
} from "../../api/superadmin/masterData.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditDealer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dealer, setDealer] = useState(null);
  const [activeTab, setActiveTab] = useState("dealer");

  // Location data states
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
    name: "",
    email: "",
    mobile: "",
    gstNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    commissionRate: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    alternate_mobile: "",
    address: "",
    landmark: "",
    country_id: "",
    state_id: "",
    city_id: "",
    pincode_id: "",
    gst_number: "",
    pan_number: "",
    aadhaar_number: "",
    dealer_type: "retailer",
    commission_rate: 0,
    credit_limit: 0,
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

  const validateMobile = (mobile) => {
    if (!mobile)
      return { isValid: false, message: "Mobile number is required" };
    const mobileRegex = /^[6-9]\d{9}$/;
    if (mobileRegex.test(mobile)) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Mobile number must be 10 digits starting with 6-9",
    };
  };

  const validateGST = (gstNumber) => {
    if (!gstNumber) return { isValid: true, message: "" };
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    if (gstRegex.test(gstNumber.toUpperCase())) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Invalid GST format (e.g., 22ABCDE1234F1Z5)",
    };
  };

  const validatePAN = (panNumber) => {
    if (!panNumber) return { isValid: true, message: "" };
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (panRegex.test(panNumber.toUpperCase())) {
      return { isValid: true, message: "" };
    }
    return { isValid: false, message: "Invalid PAN format (e.g., ABCDE1234F)" };
  };

  const validateAadhaar = (aadhaarNumber) => {
    if (!aadhaarNumber) return { isValid: true, message: "" };
    const cleanNumber = aadhaarNumber.toString().replace(/\s/g, "");
    const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
    if (aadhaarRegex.test(cleanNumber)) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Aadhaar must be 12 digits starting with 2-9",
    };
  };

  const validateCommissionRate = (rate) => {
    const num = parseFloat(rate);
    if (isNaN(num) || rate === "") return { isValid: true, message: "" };
    if (num >= 0 && num <= 100) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Commission rate must be between 0% and 100%",
    };
  };

  const getValidationIcon = (fieldValue, error) => {
    if (!fieldValue) {
      return (
        <FaInfoCircle
          className="text-secondary ms-2"
          size={14}
          title="Optional field"
        />
      );
    }
    if (!error) {
      return (
        <FaCheckCircle className="text-success ms-2" size={14} title="Valid" />
      );
    }
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="tooltip-error">{error}</Tooltip>}
      >
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

  // Fetch countries
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
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states by country ID
  const fetchStates = async (countryId) => {
    if (!countryId) return;
    setLoadingStates(true);
    try {
      const response = await stateApi.getAll(countryId);
      const statesData = extractDataFromResponse(response);
      setStates(statesData);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch cities by state ID
  const fetchCities = async (stateId) => {
    if (!stateId) return;
    setLoadingCities(true);
    try {
      const response = await cityApi.getDropdown(stateId);
      const citiesData = extractDataFromResponse(response);
      setCities(citiesData);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  // Fetch pincodes by city ID
  const fetchPincodes = async (cityId) => {
    if (!cityId) return;
    setLoadingPincodes(true);
    try {
      const response = await pincodeApi.getAll({ cityId });
      const pincodesData = extractDataFromResponse(response);
      setPincodes(pincodesData);
    } catch (error) {
      console.error("Error fetching pincodes:", error);
    } finally {
      setLoadingPincodes(false);
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

  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: value }));
    if (value.length === 10) {
      const validation = validateMobile(value);
      setValidationErrors((prev) => ({
        ...prev,
        mobile: validation.isValid ? "" : validation.message,
      }));
    } else if (value.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        mobile: "Mobile number must be 10 digits",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, mobile: "" }));
    }
  };

  const handleGSTChange = (e) => {
    let value = e.target.value.toUpperCase();
    if (value.length > 15) value = value.slice(0, 15);
    setFormData((prev) => ({ ...prev, gst_number: value }));
    if (value.length === 15) {
      const validation = validateGST(value);
      setValidationErrors((prev) => ({
        ...prev,
        gstNumber: validation.isValid ? "" : validation.message,
      }));
    } else if (value.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        gstNumber: "GST must be 15 characters",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, gstNumber: "" }));
    }
  };

  const handlePANChange = (e) => {
    let value = e.target.value.toUpperCase();
    if (value.length > 10) value = value.slice(0, 10);
    setFormData((prev) => ({ ...prev, pan_number: value }));
    if (value.length === 10) {
      const validation = validatePAN(value);
      setValidationErrors((prev) => ({
        ...prev,
        panNumber: validation.isValid ? "" : validation.message,
      }));
    } else if (value.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        panNumber: "PAN must be 10 characters",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, panNumber: "" }));
    }
  };

  const handleAadhaarChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 12) value = value.slice(0, 12);
    setFormData((prev) => ({ ...prev, aadhaar_number: value }));
    if (value.length === 12) {
      const validation = validateAadhaar(value);
      setValidationErrors((prev) => ({
        ...prev,
        aadhaarNumber: validation.isValid ? "" : validation.message,
      }));
    } else if (value.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        aadhaarNumber: "Aadhaar must be 12 digits",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, aadhaarNumber: "" }));
    }
  };

  const handleCommissionRateChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, commission_rate: value }));
    const validation = validateCommissionRate(value);
    setValidationErrors((prev) => ({
      ...prev,
      commissionRate: validation.isValid ? "" : validation.message,
    }));
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, name: value }));
    if (!value || value.trim() === "") {
      setValidationErrors((prev) => ({
        ...prev,
        name: "Dealer name is required",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const loadDealer = async () => {
      setLoading(true);
      try {
        await fetchCountries();
        const data = await getDealerById(id);
        console.log("Loaded dealer data:", data);

        if (data) {
          setDealer(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            mobile: data.mobile || "",
            alternate_mobile: data.alternate_mobile || "",
            address: data.address || "",
            landmark: data.landmark || "",
            country_id: data.country_id || "",
            state_id: data.state_id || "",
            city_id: data.city_id || "",
            pincode_id: data.pincode_id || "",
            gst_number: data.gst_number || "",
            pan_number: data.pan_number || "",
            aadhaar_number: data.aadhaar_number || "",
            dealer_type: data.dealer_type || "retailer",
            commission_rate: parseFloat(data.commission_rate) || 0,
            credit_limit: parseFloat(data.credit_limit) || 0,
            status: data.status || "active",
          });

          if (data.country_id) {
            await fetchStates(data.country_id);
          }
          if (data.state_id) {
            await fetchCities(data.state_id);
          }
          if (data.city_id) {
            await fetchPincodes(data.city_id);
          }
        }
      } catch (error) {
        console.error("Error loading dealer:", error);
        toast.error("Failed to load dealer data", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
      } finally {
        setLoading(false);
      }
    };
    loadDealer();
  }, [id]);

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
      await fetchStates(countryId);
    } else {
      setStates([]);
    }
  };

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
      await fetchCities(stateId);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = async (e) => {
    const cityId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      city_id: cityId,
      pincode_id: "",
    }));
    if (cityId) {
      await fetchPincodes(cityId);
    } else {
      setPincodes([]);
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!formData.name || formData.name.trim() === "") {
      setValidationErrors((prev) => ({
        ...prev,
        name: "Dealer name is required",
      }));
      isValid = false;
      setActiveTab("dealer");
    }

    if (!formData.email) {
      setValidationErrors((prev) => ({ ...prev, email: "Email is required" }));
      isValid = false;
      setActiveTab("dealer");
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          email: emailValidation.message,
        }));
        isValid = false;
        setActiveTab("dealer");
      }
    }

    if (!formData.mobile) {
      setValidationErrors((prev) => ({
        ...prev,
        mobile: "Mobile number is required",
      }));
      isValid = false;
      setActiveTab("dealer");
    } else {
      const mobileValidation = validateMobile(formData.mobile);
      if (!mobileValidation.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          mobile: mobileValidation.message,
        }));
        isValid = false;
        setActiveTab("dealer");
      }
    }

    if (formData.gst_number && formData.gst_number.length === 15) {
      const gstValidation = validateGST(formData.gst_number);
      if (!gstValidation.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          gstNumber: gstValidation.message,
        }));
        isValid = false;
        setActiveTab("tax");
      }
    }

    if (formData.pan_number && formData.pan_number.length === 10) {
      const panValidation = validatePAN(formData.pan_number);
      if (!panValidation.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          panNumber: panValidation.message,
        }));
        isValid = false;
        setActiveTab("tax");
      }
    }

    if (formData.aadhaar_number && formData.aadhaar_number.length === 12) {
      const aadhaarValidation = validateAadhaar(formData.aadhaar_number);
      if (!aadhaarValidation.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          aadhaarNumber: aadhaarValidation.message,
        }));
        isValid = false;
        setActiveTab("tax");
      }
    }

    if (formData.commission_rate) {
      const commissionValidation = validateCommissionRate(
        formData.commission_rate,
      );
      if (!commissionValidation.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          commissionRate: commissionValidation.message,
        }));
        isValid = false;
        setActiveTab("dealer");
      }
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
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        alternateMobile: formData.alternate_mobile || null,
        address: formData.address || null,
        landmark: formData.landmark || null,
        countryId: formData.country_id ? Number(formData.country_id) : null,
        stateId: formData.state_id ? Number(formData.state_id) : null,
        cityId: formData.city_id ? Number(formData.city_id) : null,
        pincodeId: formData.pincode_id ? Number(formData.pincode_id) : null,
        gstNumber: formData.gst_number || null,
        panNumber: formData.pan_number || null,
        aadhaarNumber: formData.aadhaar_number || null,
        dealerType: formData.dealer_type,
        commissionRate: parseFloat(formData.commission_rate) || 0,
        creditLimit: Number(formData.credit_limit) || 0,
        status: formData.status,
      };

      console.log("📤 Submitting update with payload:", submitData);
      await updateDealer(id, submitData);

      toast.success(`✅ Dealer "${formData.name}" updated successfully! 🎉`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });

      setTimeout(() => {
        navigate(`/dealers/${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating dealer:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update dealer";
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
      <Container
        fluid
        className="p-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading dealer data...</h5>
        </div>
      </Container>
    );
  }

  if (!dealer) {
    return (
      <Container
        fluid
        className="p-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <Alert variant="secondary" className="text-center">
          <h4>Dealer not found</h4>
          <p>The dealer you're looking for doesn't exist.</p>
          <Button variant="secondary" onClick={() => navigate("/dealers")}>
            Back to Dealers
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

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-0 pt-3 px-4">
            <div className="d-flex gap-2 border-bottom pb-2">
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("dealer")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "dealer" ? "bg-light" : ""}`}
                style={{
                  color:
                    activeTab === "dealer" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaUserTie className="me-2" /> Dealer Information
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("tax")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "tax" ? "bg-light" : ""}`}
                style={{
                  color: activeTab === "tax" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaIdCard className="me-2" /> Tax Information
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("address")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "address" ? "bg-light" : ""}`}
                style={{
                  color:
                    activeTab === "address" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaMapMarkerAlt className="me-2" /> Address Information
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="p-4">
            {/* Dealer Information Tab */}
            {activeTab === "dealer" && (
              <div>
                {/* Basic Information Section */}
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaUser className="me-2" /> Basic Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Dealer Name *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleNameChange}
                          placeholder="Enter dealer name"
                          isInvalid={!!validationErrors.name && !!formData.name}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(
                          formData.name,
                          validationErrors.name,
                        )}
                      </div>
                      {validationErrors.name && formData.name && (
                        <Form.Text className="text-danger">
                          {validationErrors.name}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Dealer Type</Form.Label>
                      <Form.Select
                        name="dealer_type"
                        value={formData.dealer_type}
                        onChange={handleChange}
                      >
                        <option value="distributor">Distributor</option>
                        <option value="retailer">Retailer</option>
                        <option value="franchise">Franchise</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Contact Information Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
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
                          placeholder="dealer@example.com"
                          isInvalid={
                            !!validationErrors.email && !!formData.email
                          }
                          className="flex-grow-1"
                        />
                        {getValidationIcon(
                          formData.email,
                          validationErrors.email,
                        )}
                      </div>
                      {validationErrors.email && formData.email && (
                        <Form.Text className="text-danger">
                          {validationErrors.email}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Mobile Number *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleMobileChange}
                          placeholder="9876543210"
                          maxLength="10"
                          isInvalid={
                            !!validationErrors.mobile && !!formData.mobile
                          }
                          className="flex-grow-1"
                        />
                        {getValidationIcon(
                          formData.mobile,
                          validationErrors.mobile,
                        )}
                      </div>
                      {validationErrors.mobile && formData.mobile && (
                        <Form.Text className="text-danger">
                          {validationErrors.mobile}
                        </Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        10 digits only, starts with 6-9
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Alternate Mobile</Form.Label>
                      <Form.Control
                        type="tel"
                        name="alternate_mobile"
                        value={formData.alternate_mobile}
                        onChange={handleChange}
                        placeholder="Alternate mobile number"
                        maxLength="10"
                      />
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
                        <option value="suspended">Suspended</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Financial Information Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaWallet className="me-2" /> Financial Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FaPercent className="me-1" /> Commission Rate (%)
                      </Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="commission_rate"
                          value={formData.commission_rate}
                          onChange={handleCommissionRateChange}
                          placeholder="Enter commission rate (0-100)"
                          min="0"
                          max="100"
                          step="0.5"
                          className="flex-grow-1"
                        />
                        {getValidationIcon(
                          formData.commission_rate,
                          validationErrors.commissionRate,
                        )}
                      </div>
                      {validationErrors.commissionRate && (
                        <Form.Text className="text-danger">
                          {validationErrors.commissionRate}
                        </Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Commission percentage (0% - 100%)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Credit Limit (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        name="credit_limit"
                        value={formData.credit_limit}
                        onChange={handleChange}
                        placeholder="Enter credit limit"
                        min="0"
                        step="1000"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}

            {/* Tax Information Tab */}
            {activeTab === "tax" && (
              <div>
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaIdCard className="me-2" /> Tax Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>GST Number</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="gst_number"
                          value={formData.gst_number}
                          onChange={handleGSTChange}
                          placeholder="22ABCDE1234F1Z5"
                          maxLength="15"
                          className="flex-grow-1"
                          isInvalid={
                            !!validationErrors.gstNumber &&
                            !!formData.gst_number
                          }
                        />
                        {getValidationIcon(
                          formData.gst_number,
                          validationErrors.gstNumber,
                        )}
                      </div>
                      {validationErrors.gstNumber && formData.gst_number && (
                        <Form.Text className="text-danger">
                          {validationErrors.gstNumber}
                        </Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Format: 2 digits, 5 letters, 4 digits, 1 letter, 1
                        alphanumeric, Z, 1 alphanumeric
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>PAN Number</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="pan_number"
                          value={formData.pan_number}
                          onChange={handlePANChange}
                          placeholder="ABCDE1234F"
                          maxLength="10"
                          className="flex-grow-1"
                          isInvalid={
                            !!validationErrors.panNumber &&
                            !!formData.pan_number
                          }
                        />
                        {getValidationIcon(
                          formData.pan_number,
                          validationErrors.panNumber,
                        )}
                      </div>
                      {validationErrors.panNumber && formData.pan_number && (
                        <Form.Text className="text-danger">
                          {validationErrors.panNumber}
                        </Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Aadhaar Number</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="aadhaar_number"
                          value={formData.aadhaar_number}
                          onChange={handleAadhaarChange}
                          placeholder="123456789012"
                          maxLength="12"
                          className="flex-grow-1"
                          isInvalid={
                            !!validationErrors.aadhaarNumber &&
                            !!formData.aadhaar_number
                          }
                        />
                        {getValidationIcon(
                          formData.aadhaar_number,
                          validationErrors.aadhaarNumber,
                        )}
                      </div>
                      {validationErrors.aadhaarNumber &&
                        formData.aadhaar_number && (
                          <Form.Text className="text-danger">
                            {validationErrors.aadhaarNumber}
                          </Form.Text>
                        )}
                      <Form.Text className="text-muted">
                        12 digits only, starting with 2-9
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}

            {/* Address Information Tab */}
            {activeTab === "address" && (
              <div>
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
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
                            {pincode.code}{" "}
                            {pincode.area ? `- ${pincode.area}` : ""}
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
            onClick={() => navigate(`/dealers/${id}`)}
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
                <FaSave className="me-2" /> Update Dealer
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

export default EditDealer;
