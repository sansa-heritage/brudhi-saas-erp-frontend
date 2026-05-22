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
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaMapPin,
  FaRupeeSign,
  FaIdCard,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaPercent,
} from "react-icons/fa";
import {
  countryApi,
  stateApi,
  cityApi,
  pincodeApi,
} from "../../api/superadmin/masterData.api";
import { addDealer, getDealers } from "../../components/services/dealerService";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Breadcrumb } from "react-bootstrap";

const AddDealer = () => {
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for existing dealers (for duplicate check)
  const [existingDealers, setExistingDealers] = useState([]);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    mobile: "",
    alternateMobile: "",
    gstNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    name: "",
    commissionRate: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    address: "",
    landmark: "",
    countryId: "",
    stateId: "",
    cityId: "",
    pincodeId: "",
    gstNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    dealerType: "retailer",
    commissionRate: 0,
    creditLimit: 0,
    createdBy: "",
    status: "active",
  });

  // Load existing dealers for duplicate check
  useEffect(() => {
    loadExistingDealers();
  }, []);

  const loadExistingDealers = async () => {
    try {
      const response = await getDealers();
      let dealersData = [];
      if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        dealersData = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        dealersData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        dealersData = response.data;
      } else if (Array.isArray(response)) {
        dealersData = response;
      }
      setExistingDealers(dealersData);
    } catch (error) {
      console.error("Failed to load dealers for validation:", error);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return { isValid: true, message: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return { isValid: true, message: "" };
    }
    return { isValid: false, message: "Invalid email format" };
  };

  const validateMobile = (mobile) => {
    if (!mobile) return { isValid: true, message: "" };
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
    if (isNaN(num)) return { isValid: true, message: "" };
    if (num >= 0 && num <= 100) {
      return { isValid: true, message: "" };
    }
    return {
      isValid: false,
      message: "Commission rate must be between 0% and 100%",
    };
  };

  // Check for duplicate dealer name
  const validateDealerDuplicate = (name, email, mobile, excludeId = null) => {
    if (!name || name.trim() === "") {
      return { isValid: false, message: "Dealer name is required" };
    }

    const duplicateDealer = existingDealers.find((dealer) => {
      const sameName =
        dealer.name && dealer.name.toLowerCase() === name.trim().toLowerCase();
      const sameEmail =
        dealer.email && dealer.email.toLowerCase() === email.toLowerCase();
      const sameMobile = dealer.mobile === mobile;

      const isSameDealer = excludeId ? dealer.id !== parseInt(excludeId) : true;

      return sameName && (sameEmail || sameMobile) && isSameDealer;
    });

    if (duplicateDealer) {
      if (
        duplicateDealer.email &&
        duplicateDealer.email.toLowerCase() === email.toLowerCase()
      ) {
        return {
          isValid: false,
          message: `Dealer with name "${name}" already exists with same email "${email}". Please use different email.`,
        };
      }
      if (duplicateDealer.mobile === mobile) {
        return {
          isValid: false,
          message: `Dealer with name "${name}" already exists with same mobile number "${mobile}". Please use different mobile number.`,
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

    if (formData.name && formData.mobile) {
      const duplicateCheck = validateDealerDuplicate(
        formData.name,
        value,
        formData.mobile,
      );
      setValidationErrors((prev) => ({
        ...prev,
        name: duplicateCheck.isValid ? "" : duplicateCheck.message,
      }));
    }
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

    if (formData.name && formData.email) {
      const duplicateCheck = validateDealerDuplicate(
        formData.name,
        formData.email,
        value,
      );
      setValidationErrors((prev) => ({
        ...prev,
        name: duplicateCheck.isValid ? "" : duplicateCheck.message,
      }));
    }
  };

  const handleAlternateMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setFormData((prev) => ({ ...prev, alternateMobile: value }));

    if (value.length === 10) {
      const validation = validateMobile(value);
      setValidationErrors((prev) => ({
        ...prev,
        alternateMobile: validation.isValid ? "" : validation.message,
      }));
    } else if (value.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        alternateMobile: "Mobile number must be 10 digits",
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, alternateMobile: "" }));
    }
  };

  const handleGSTChange = (e) => {
    let value = e.target.value.toUpperCase();
    if (value.length > 15) value = value.slice(0, 15);
    setFormData((prev) => ({ ...prev, gstNumber: value }));
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
    setFormData((prev) => ({ ...prev, panNumber: value }));
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
    setFormData((prev) => ({ ...prev, aadhaarNumber: value }));

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
    let value = e.target.value;
    setFormData((prev) => ({ ...prev, commissionRate: value }));
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
    } else if (formData.email && formData.mobile) {
      const duplicateCheck = validateDealerDuplicate(
        value,
        formData.email,
        formData.mobile,
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

  // Get validation icon
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

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === "") {
      setError("Dealer name is required");
      return false;
    }
    if (!formData.mobile || formData.mobile.trim() === "") {
      setError("Mobile number is required");
      return false;
    }
    if (formData.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return false;
    }
    if (!formData.email || formData.email.trim() === "") {
      setError("Email is required");
      return false;
    }

    const duplicateCheck = validateDealerDuplicate(
      formData.name,
      formData.email,
      formData.mobile,
    );
    if (!duplicateCheck.isValid) {
      setError(duplicateCheck.message);
      return false;
    }

    const emailValid = validateEmail(formData.email).isValid;
    const mobileValid = validateMobile(formData.mobile).isValid;
    const gstValid = validateGST(formData.gstNumber).isValid;
    const panValid = validatePAN(formData.panNumber).isValid;
    const aadhaarValid = validateAadhaar(formData.aadhaarNumber).isValid;
    const commissionValid = validateCommissionRate(
      formData.commissionRate,
    ).isValid;

    if (!emailValid) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!mobileValid) {
      setError(
        "Please enter a valid mobile number (10 digits starting with 6-9)",
      );
      return false;
    }
    if (formData.gstNumber && !gstValid) {
      setError("Please enter a valid GST number");
      return false;
    }
    if (formData.panNumber && !panValid) {
      setError("Please enter a valid PAN number");
      return false;
    }
    if (formData.aadhaarNumber && !aadhaarValid) {
      setError("Please enter a valid Aadhaar number (12 digits)");
      return false;
    }
    if (!commissionValid) {
      setError(validateCommissionRate(formData.commissionRate).message);
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
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        alternateMobile: formData.alternateMobile || null,
        address: formData.address || null,
        landmark: formData.landmark || null,
        countryId: formData.countryId ? Number(formData.countryId) : null,
        stateId: formData.stateId ? Number(formData.stateId) : null,
        cityId: formData.cityId ? Number(formData.cityId) : null,
        pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,
        gstNumber: formData.gstNumber || null,
        panNumber: formData.panNumber || null,
        aadhaarNumber: formData.aadhaarNumber || null,
        commissionRate: parseFloat(formData.commissionRate) || 0,
        dealerType: formData.dealerType,
        creditLimit: Number(formData.creditLimit) || 0,
        createdBy: formData.createdBy ? Number(formData.createdBy) : null,
        status: formData.status,
      };

      console.log("📤 Sending payload:", JSON.stringify(submitData, null, 2));
      await addDealer(submitData);

      // ✅ ONLY SUCCESS TOAST MESSAGE
      toast.success(`✅ Dealer "${formData.name}" added successfully! 🎉`, {
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
        navigate("/dealers");
      }, 2000);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.message || "Failed to save dealer");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/dealers");
  };

  return (
    <Container
      fluid
      className="p-4"
      style={{ background: "#f8f9fa", minHeight: "100vh" }}
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
              <FaUser className="me-2" /> Add New Dealer
            </h2>
            <p className="mb-0 opacity-75">
              Fill in the details to add a new dealer
            </p>
          </div>
          <Button
            variant="light"
            onClick={handleGoBack}
            className="rounded-pill px-4"
          >
            <FaArrowLeft className="me-2" /> Back to Dealers
          </Button>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Basic Information */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaUser className="me-2 text-secondary" /> Basic Information
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Dealer Name *</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Enter dealer name"
                      required
                      isInvalid={!!validationErrors.name && !!formData.name}
                      className="flex-grow-1"
                    />
                    {getValidationIcon(formData.name, validationErrors.name)}
                  </div>
                  {validationErrors.name && formData.name && (
                    <Form.Text className="text-danger">
                      {validationErrors.name}
                    </Form.Text>
                  )}
                  <Form.Text className="text-muted">
                    Note: Same name allowed with different email or mobile
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Dealer Type</Form.Label>
                  <Form.Select
                    name="dealerType"
                    value={formData.dealerType}
                    onChange={handleChange}
                  >
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                    <option value="franchise">Franchise</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaPercent className="me-1" /> Commission Rate (%)
                  </Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="number"
                      name="commissionRate"
                      value={formData.commissionRate}
                      onChange={handleCommissionRateChange}
                      placeholder="Enter commission rate (0-100)"
                      min="0"
                      max="100"
                      step="0.01"
                      isInvalid={
                        !!validationErrors.commissionRate &&
                        formData.commissionRate !== ""
                      }
                      className="flex-grow-1"
                    />
                    {getValidationIcon(
                      formData.commissionRate,
                      validationErrors.commissionRate,
                    )}
                  </div>
                  {validationErrors.commissionRate && (
                    <Form.Text className="text-danger">
                      {validationErrors.commissionRate}
                    </Form.Text>
                  )}
                  <Form.Text className="text-muted">
                    Commission percentage for this dealer (0% - 100%)
                  </Form.Text>
                </Form.Group>

                <h6 className="fw-bold mb-3 mt-4">
                  <FaEnvelope className="me-2 text-secondary" /> Contact
                  Information
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      placeholder="dealer@example.com"
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
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number *</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleMobileChange}
                      placeholder="9876543210"
                      required
                      maxLength="10"
                      isInvalid={!!validationErrors.mobile && !!formData.mobile}
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

                <Form.Group className="mb-3">
                  <Form.Label>Alternate Mobile</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="tel"
                      name="alternateMobile"
                      value={formData.alternateMobile}
                      onChange={handleAlternateMobileChange}
                      placeholder="Alternate mobile number"
                      maxLength="10"
                      className="flex-grow-1"
                    />
                    {getValidationIcon(
                      formData.alternateMobile,
                      validationErrors.alternateMobile,
                    )}
                  </div>
                  {validationErrors.alternateMobile &&
                    formData.alternateMobile && (
                      <Form.Text className="text-danger">
                        {validationErrors.alternateMobile}
                      </Form.Text>
                    )}
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Tax Information */}
            <Card className="border-0 shadow-sm rounded-3 mt-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaIdCard className="me-2 text-secondary" /> Tax Information
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>GST Number</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleGSTChange}
                      placeholder="22ABCDE1234F1Z5"
                      maxLength="15"
                      className="flex-grow-1"
                      isInvalid={
                        !!validationErrors.gstNumber && !!formData.gstNumber
                      }
                    />
                    {getValidationIcon(
                      formData.gstNumber,
                      validationErrors.gstNumber,
                    )}
                  </div>
                  {validationErrors.gstNumber && formData.gstNumber && (
                    <Form.Text className="text-danger">
                      {validationErrors.gstNumber}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>PAN Number</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handlePANChange}
                      placeholder="ABCDE1234F"
                      maxLength="10"
                      className="flex-grow-1"
                      isInvalid={
                        !!validationErrors.panNumber && !!formData.panNumber
                      }
                    />
                    {getValidationIcon(
                      formData.panNumber,
                      validationErrors.panNumber,
                    )}
                  </div>
                  {validationErrors.panNumber && formData.panNumber && (
                    <Form.Text className="text-danger">
                      {validationErrors.panNumber}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Aadhaar Number</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleAadhaarChange}
                      placeholder="123456789012"
                      maxLength="12"
                      className="flex-grow-1"
                      isInvalid={
                        !!validationErrors.aadhaarNumber &&
                        !!formData.aadhaarNumber
                      }
                    />
                    {getValidationIcon(
                      formData.aadhaarNumber,
                      validationErrors.aadhaarNumber,
                    )}
                  </div>
                  {validationErrors.aadhaarNumber && formData.aadhaarNumber && (
                    <Form.Text className="text-danger">
                      {validationErrors.aadhaarNumber}
                    </Form.Text>
                  )}
                  <Form.Text className="text-muted">12 digits only</Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Address Information */}
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
                    name="countryId"
                    value={formData.countryId}
                    onChange={handleChange}
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
                    name="stateId"
                    value={formData.stateId}
                    onChange={handleChange}
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
                  {!formData.countryId && (
                    <Form.Text className="text-muted">
                      Please select a country first
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Select
                    name="cityId"
                    value={formData.cityId}
                    onChange={handleChange}
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
                  {!formData.stateId && formData.countryId && (
                    <Form.Text className="text-muted">
                      Please select a state first
                    </Form.Text>
                  )}
                </Form.Group>

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
                      <Spinner animation="border" size="sm" /> Loading
                      pincodes...
                    </Form.Text>
                  )}
                  {!formData.cityId && formData.stateId && (
                    <Form.Text className="text-muted">
                      Please select a city first
                    </Form.Text>
                  )}
                  {formData.cityId &&
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
                  <Form.Label>Landmark</Form.Label>
                  <Form.Control
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Near landmark"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Financial Information */}
            <Card className="border-0 shadow-sm rounded-3 mt-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaRupeeSign className="me-2 text-secondary" /> Financial
                  Information
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Credit Limit (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleChange}
                    placeholder="Enter credit limit"
                    min="0"
                    step="1000"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Created By (User ID)</Form.Label>
                  <Form.Control
                    type="number"
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleChange}
                    placeholder="e.g., 4"
                  />
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
                    <option value="suspended">Suspended</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <Alert variant="secondary" className="mt-3">
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button
            variant="secondary"
            type="submit"
            disabled={loading}
            className="rounded-pill px-4"
          >
            {loading ? (
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

export default AddDealer;