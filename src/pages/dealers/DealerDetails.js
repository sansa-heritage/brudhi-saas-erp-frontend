import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Tabs,
  Tab,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaCreditCard,
  FaFileInvoice,
  FaCalendarAlt,
  FaUserCircle,
  FaIdCard,
  FaHashtag,
  FaMoneyBill,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
  FaCity,
  FaMapPin,
  FaLandmark,
  FaQrcode,
  FaUserTag,
  FaAddressCard,
  FaMobileAlt,
  FaCode,
  FaLocationArrow,
  FaMoneyBillWave,
  FaWallet,
  FaPercent,
  FaDownload,
  FaInfoCircle,
  FaExclamationTriangle,
  FaRegBuilding,
  FaRegAddressCard,
  FaChartLine,
  FaStar,
} from "react-icons/fa";
import {
  getDealerById,
  deleteDealer,
} from "../../components/services/dealerService";
import {
  countryApi,
  stateApi,
  cityApi,
  pincodeApi,
} from "../../api/superadmin/masterData.api";
import Swal from "sweetalert2";

// Status color mapping (matching Customers page)
const statusConfig = {
  active: { bg: "#ECFDF3", color: "#027A48", label: "Active" },
  inactive: { bg: "#FFDCE2", color: "#F94765", label: "Inactive" },
};

// Dealer type color mapping (matching Customers page)
const dealerTypeConfig = {
  distributor: { bg: "#D3EAFF", color: "#437EF7", label: "Distributor" },
  retailer: { bg: "#FFE0CB", color: "#FF8532", label: "Retailer" },
  franchise: { bg: "#FEF6D7", color: "#FED229", label: "Franchise" },
};

const DealerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullAadhaar, setShowFullAadhaar] = useState(false);
  const [showFullAlternateMobile, setShowFullAlternateMobile] = useState(false);

  // State for location names
  const [locationNames, setLocationNames] = useState({
    country: "",
    state: "",
    city: "",
    pincode: "",
  });
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Toggle functions for visibility
  const toggleAadhaarVisibility = () => {
    setShowFullAadhaar(!showFullAadhaar);
  };

  const toggleAlternateMobileVisibility = () => {
    setShowFullAlternateMobile(!showFullAlternateMobile);
  };

  // Validation helper functions
  const validateGST = (gstNumber) => {
    if (!gstNumber) return { isValid: null, message: "Not provided" };
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    if (gstRegex.test(gstNumber)) {
      return { isValid: true, message: "Valid GST Number" };
    }
    return { isValid: false, message: "Invalid GST Number Format" };
  };

  const validatePAN = (panNumber) => {
    if (!panNumber) return { isValid: null, message: "Not provided" };
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (panRegex.test(panNumber)) {
      return { isValid: true, message: "Valid PAN Number" };
    }
    return { isValid: false, message: "Invalid PAN Number Format" };
  };

  const validateAadhaar = (aadhaarNumber) => {
    if (!aadhaarNumber) return { isValid: null, message: "Not provided" };
    const cleanNumber = aadhaarNumber.toString().replace(/\s/g, "");
    const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
    if (aadhaarRegex.test(cleanNumber)) {
      return { isValid: true, message: "Valid Aadhaar Number" };
    }
    return {
      isValid: false,
      message: "Invalid Aadhaar Number (12 digits required)",
    };
  };

  const validateEmail = (email) => {
    if (!email) return { isValid: null, message: "Not provided" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return { isValid: true, message: "Valid Email" };
    }
    return { isValid: false, message: "Invalid Email Format" };
  };

  const validateMobile = (mobile) => {
    if (!mobile) return { isValid: null, message: "Not provided" };
    const mobileRegex = /^[6-9]\d{9}$/;
    if (mobileRegex.test(mobile)) {
      return { isValid: true, message: "Valid Mobile Number" };
    }
    return { isValid: false, message: "Invalid Mobile Number" };
  };

  const validateAlternateMobile = (alternateMobile, primaryMobile) => {
    if (!alternateMobile) return { isValid: null, message: "Not provided" };
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(alternateMobile)) {
      return { isValid: false, message: "Invalid Mobile Number" };
    }
    if (alternateMobile === primaryMobile) {
      return { isValid: false, message: "Cannot be same as primary mobile" };
    }
    return { isValid: true, message: "Valid Alternate Mobile" };
  };

  const validateCommissionRate = (rate) => {
    if (!rate && rate !== 0) return { isValid: null, message: "Not provided" };
    const num = parseFloat(rate);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      return { isValid: true, message: "Valid Commission Rate" };
    }
    return {
      isValid: false,
      message: "Commission rate must be between 0% and 100%",
    };
  };

  const getValidationIcon = (validation) => {
    if (validation.isValid === null) {
      return (
        <FaInfoCircle
          className="text-secondary ms-2"
          size={14}
          title={validation.message}
        />
      );
    }
    if (validation.isValid) {
      return (
        <FaCheckCircle
          className="text-success ms-2"
          size={14}
          title={validation.message}
        />
      );
    }
    return (
      <FaExclamationTriangle
        className="text-danger ms-2"
        size={14}
        title={validation.message}
      />
    );
  };

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

  const fetchLocationNames = async (dealerData) => {
    setLoadingLocation(true);
    try {
      const names = { country: "", state: "", city: "", pincode: "" };

      if (dealerData.country_id) {
        try {
          const response = await countryApi.getAll();
          const countries = extractDataFromResponse(response);
          const country = countries.find(
            (c) => c.id === parseInt(dealerData.country_id),
          );
          names.country = country
            ? country.name
            : `ID: ${dealerData.country_id}`;
        } catch (error) {
          names.country = `ID: ${dealerData.country_id}`;
        }
      }

      if (dealerData.state_id) {
        try {
          const response = await stateApi.getAll(dealerData.country_id);
          const states = extractDataFromResponse(response);
          const state = states.find(
            (s) => s.id === parseInt(dealerData.state_id),
          );
          names.state = state ? state.name : `ID: ${dealerData.state_id}`;
        } catch (error) {
          names.state = `ID: ${dealerData.state_id}`;
        }
      }

      if (dealerData.city_id) {
        try {
          const response = await cityApi.getAll();
          const cities = extractDataFromResponse(response);
          const city = cities.find(
            (c) => c.id === parseInt(dealerData.city_id),
          );
          names.city = city ? city.name : `ID: ${dealerData.city_id}`;
        } catch (error) {
          names.city = `ID: ${dealerData.city_id}`;
        }
      }

      if (dealerData.pincode_id) {
        try {
          const response = await pincodeApi.getAll();
          const pincodes = extractDataFromResponse(response);
          const pincode = pincodes.find(
            (p) => p.id === parseInt(dealerData.pincode_id),
          );
          names.pincode = pincode
            ? `${pincode.code}`
            : `ID: ${dealerData.pincode_id}`;
        } catch (error) {
          names.pincode = `ID: ${dealerData.pincode_id}`;
        }
      }

      setLocationNames(names);
    } catch (error) {
      console.error("Error fetching location names:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    const fetchDealer = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDealerById(id);
        let dealerData = null;
        if (data?.data?.success && data.data.data) {
          dealerData = data.data.data;
        } else if (data?.data) {
          dealerData = data.data;
        } else if (data) {
          dealerData = data;
        }
        setDealer(dealerData);
        if (dealerData) {
          await fetchLocationNames(dealerData);
        }
      } catch (error) {
        console.error("Failed to fetch dealer:", error);
        setError(
          error.response?.data?.message || "Failed to load dealer details",
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchDealer();
    }
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete dealer "${dealer?.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6c757d",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteDealer(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Dealer has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/dealers");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete dealer",
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.active;
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    );
  };

  const getDealerTypeBadge = (type) => {
    const config = dealerTypeConfig[type?.toLowerCase()] || dealerTypeConfig.retailer;
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAadhaar = (aadhaarNumber) => {
    if (!aadhaarNumber) return "N/A";
    const cleanNumber = aadhaarNumber.toString().replace(/[^\d]/g, "");
    if (cleanNumber.length === 12) {
      if (showFullAadhaar) {
        return cleanNumber.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
      }
      return `XXXX XXXX ${cleanNumber.slice(-4)}`;
    }
    return aadhaarNumber;
  };

  const formatAlternateMobile = (alternateMobile) => {
    if (!alternateMobile) return "N/A";
    const cleanNumber = alternateMobile.toString().replace(/[^\d]/g, "");
    if (cleanNumber.length === 10) {
      if (showFullAlternateMobile) {
        return cleanNumber.replace(/(\d{5})(\d{5})/, "$1 $2");
      }
      return `XXXXXX ${cleanNumber.slice(-4)}`;
    }
    return alternateMobile;
  };

  const totalCommission =
    ((dealer?.total_sales || 0) * (dealer?.commission_rate || 0)) / 100;
  const availableCredit =
    (parseFloat(dealer?.credit_limit) || 0) -
    (parseFloat(dealer?.outstanding_amount) || 0);

  const gstValidation = validateGST(dealer?.gst_number);
  const panValidation = validatePAN(dealer?.pan_number);
  const aadhaarValidation = validateAadhaar(dealer?.aadhaar_number);
  const emailValidation = validateEmail(dealer?.email);
  const mobileValidation = validateMobile(dealer?.mobile);
  const alternateMobileValidation = validateAlternateMobile(
    dealer?.alternate_mobile,
    dealer?.mobile,
  );
  const commissionValidation = validateCommissionRate(dealer?.commission_rate);

  if (loading) {
    return (
      <Container
        fluid
        className="p-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading dealer details...</h5>
        </div>
      </Container>
    );
  }

  if (error || !dealer) {
    return (
      <Container
        fluid
        className="p-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <Alert variant="secondary" className="text-center">
          <h4>Dealer not found</h4>
          <p>{error || "The dealer you're looking for doesn't exist."}</p>
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            {dealer.name}
          </h2>
          {/* <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
            <span className="text-muted" style={{ fontSize: "13px" }}>
              <FaHashtag size={12} className="me-1" /> Code: {dealer.dealer_code || `DLR_${String(dealer.id).padStart(6, "0")}`}
            </span>
            <span>•</span>
            {getDealerTypeBadge(dealer.dealer_type)}
            {getStatusBadge(dealer.status)}
          </div> */}
        </div>
        <div className="d-flex gap-2">
          <Button
            onClick={() => navigate(`/dealers/edit/${dealer.id}`)}
            style={{
              backgroundColor: "rgb(30, 58, 111)",
              border: "none",
              borderRadius: "30px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaEdit size={14} /> Edit
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3 px-4">
          <Tabs
            defaultActiveKey="overview"
            className="border-0 gap-2"
            style={{ borderBottom: "2px solid #e9ecef" }}
          >
            <Tab
              eventKey="overview"
              title={
                <span className="fw-semibold">
                  <FaUserCircle className="me-2" /> Overview
                </span>
              }
              tabClassName="border-0"
            >
              <div className="p-3">
                {/* Personal Information Section */}
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaUser className="me-2" /> Personal Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Dealer Name
                      </small>
                      <strong>{dealer.name}</strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Dealer Code
                      </small>
                      <strong>
                        {dealer.dealer_code ||
                          `DLR_${String(dealer.id).padStart(6, "0")}`}
                      </strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Dealer Type
                      </small>
                      {getDealerTypeBadge(dealer.dealer_type)}
                    </div>
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
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Email Address
                      </small>
                      <div className="d-flex align-items-center">
                        <strong>{dealer.email || "N/A"}</strong>
                        {getValidationIcon(emailValidation)}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Mobile Number
                      </small>
                      <div className="d-flex align-items-center">
                        <strong>{dealer.mobile || "N/A"}</strong>
                        {getValidationIcon(mobileValidation)}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Alternate Mobile
                      </small>
                      <div className="d-flex align-items-center">
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={toggleAlternateMobileVisibility}
                          className="me-1"
                        >
                          <strong>
                            {formatAlternateMobile(dealer.alternate_mobile)}
                          </strong>
                        </span>
                        {dealer.alternate_mobile && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={toggleAlternateMobileVisibility}
                            className="p-0 ms-1"
                          >
                            {showFullAlternateMobile ? "Hide" : "Show"}
                          </Button>
                        )}
                        {getValidationIcon(alternateMobileValidation)}
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Tax Information Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaIdCard className="me-2" /> Tax Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        GST Number
                      </small>
                      <div className="d-flex align-items-center">
                        <strong>{dealer.gst_number || "N/A"}</strong>
                        {getValidationIcon(gstValidation)}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        PAN Number
                      </small>
                      <div className="d-flex align-items-center">
                        <strong>{dealer.pan_number || "N/A"}</strong>
                        {getValidationIcon(panValidation)}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Aadhaar Number
                      </small>
                      <div className="d-flex align-items-center">
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={toggleAadhaarVisibility}
                          className="me-1"
                        >
                          <strong>
                            {formatAadhaar(dealer.aadhaar_number)}
                          </strong>
                        </span>
                        {dealer.aadhaar_number && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={toggleAadhaarVisibility}
                            className="p-0 ms-1"
                          >
                            {showFullAadhaar ? "Hide" : "Show"}
                          </Button>
                        )}
                        {getValidationIcon(aadhaarValidation)}
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Address Information Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaMapMarkerAlt className="me-2" /> Address Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={6}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Full Address
                      </small>
                      <strong>{dealer.address || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Landmark
                      </small>
                      <strong>{dealer.landmark || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Country
                      </small>
                      <strong>
                        {loadingLocation ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          locationNames.country || "N/A"
                        )}
                      </strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        State
                      </small>
                      <strong>
                        {loadingLocation ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          locationNames.state || "N/A"
                        )}
                      </strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        City
                      </small>
                      <strong>
                        {loadingLocation ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          locationNames.city || "N/A"
                        )}
                      </strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Pincode
                      </small>
                      <strong>
                        {loadingLocation ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          locationNames.pincode || "N/A"
                        )}
                      </strong>
                    </div>
                  </Col>
                </Row>

                {/* Financial Information Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaMoneyBillWave className="me-2" /> Financial Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Commission Rate
                      </small>
                      <strong>{dealer.commission_rate || 0}%</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Credit Limit
                      </small>
                      <strong>
                        {formatCurrency(dealer.credit_limit || 0)}
                      </strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Total Sales
                      </small>
                      <strong>{formatCurrency(dealer.total_sales || 0)}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Status
                      </small>
                      {getStatusBadge(dealer.status)}
                    </div>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab
              eventKey="sales"
              title={
                <span className="fw-semibold">
                  <FaChartLine className="me-2" /> Sales History
                </span>
              }
            >
              <div className="p-5 text-center">
                <FaChartLine size={60} className="text-muted mb-3" />
                <h5 className="text-muted">No sales records found</h5>
                <p className="text-muted small">
                  Sales records will appear here once added
                </p>
              </div>
            </Tab>
          </Tabs>
        </Card.Header>
      </Card>

      <style>{`
        .nav-tabs {
          border-bottom: none !important;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 10px 16px;
          font-size: 14px;
          transition: all 0.2s;
          border-radius: 30px;
          margin-right: 8px;
        }
        .nav-tabs .nav-link:hover {
          color: rgb(30, 58, 111);
          background: #f1f5f9;
        }
        .nav-tabs .nav-link.active {
          color: rgb(30, 58, 111);
          background: #eef2ff;
          border: none;
        }
        .rounded-3 {
          border-radius: 12px !important;
        }
      `}</style>
    </Container>
  );
};

export default DealerDetails;