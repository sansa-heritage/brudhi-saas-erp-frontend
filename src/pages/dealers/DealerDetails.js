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
  FaMapMarker,
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
  FaUserTag,
  FaMobileAlt,
  FaCode,
  FaMoneyBillWave,
  FaWallet,
  FaPercent,
  FaDownload,
  FaInfoCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaStar,
} from "react-icons/fa";
import DocumentViewer from "../../components/Modals/DocumentViewer";
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

const DealerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullAadhaar, setShowFullAadhaar] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  // State for location names
  const [locationNames, setLocationNames] = useState({
    country: "",
    state: "",
    city: "",
    pincode: "",
  });
  const [loadingLocation, setLoadingLocation] = useState(false);

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
    return {
      isValid: false,
      message: "Invalid PAN Number Format (e.g., ABCDE1234F)",
    };
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
    return {
      isValid: false,
      message: "Invalid Mobile Number (10 digits, starts with 6-9)",
    };
  };

  const validateCommissionRate = (rate) => {
    if (!rate && rate !== 0) return { isValid: null, message: "Not provided" };
    const num = parseFloat(rate);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      return { isValid: true, message: "Valid Commission Rate" };
    }
    return { isValid: false, message: "Commission rate must be between 0% and 100%" };
  };

  // Get validation badge
  const getValidationBadge = (validation) => {
    if (validation.isValid === null) {
      return (
        <Badge bg="secondary" className="ms-2 rounded-pill">
          <FaInfoCircle className="me-1" size={10} /> Not Provided
        </Badge>
      );
    }
    if (validation.isValid) {
      return (
        <Badge bg="secondary" className="ms-2 rounded-pill">
          <FaCheckCircle className="me-1" size={10} /> {validation.message}
        </Badge>
      );
    }
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="tooltip-error">{validation.message}</Tooltip>}
      >
        <Badge
          bg="secondary"
          className="ms-2 rounded-pill"
          style={{ cursor: "pointer" }}
        >
          <FaExclamationTriangle className="me-1" size={10} /> Invalid
        </Badge>
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

  // Fetch location names based on IDs
  const fetchLocationNames = async (dealerData) => {
    setLoadingLocation(true);
    try {
      const names = {
        country: "",
        state: "",
        city: "",
        pincode: "",
      };

      if (dealerData.country_id) {
        try {
          const response = await countryApi.getAll();
          const countries = extractDataFromResponse(response);
          const country = countries.find(
            (c) => c.id === parseInt(dealerData.country_id)
          );
          names.country = country
            ? country.name
            : `ID: ${dealerData.country_id}`;
        } catch (error) {
          console.error("Error fetching country:", error);
          names.country = `ID: ${dealerData.country_id}`;
        }
      }

      if (dealerData.state_id) {
        try {
          const response = await stateApi.getAll(dealerData.country_id);
          const states = extractDataFromResponse(response);
          const state = states.find(
            (s) => s.id === parseInt(dealerData.state_id)
          );
          names.state = state ? state.name : `ID: ${dealerData.state_id}`;
        } catch (error) {
          console.error("Error fetching state:", error);
          names.state = `ID: ${dealerData.state_id}`;
        }
      }

      if (dealerData.city_id) {
        try {
          const response = await cityApi.getAll();
          const cities = extractDataFromResponse(response);
          const city = cities.find(
            (c) => c.id === parseInt(dealerData.city_id)
          );
          names.city = city ? city.name : `ID: ${dealerData.city_id}`;
        } catch (error) {
          console.error("Error fetching city:", error);
          names.city = `ID: ${dealerData.city_id}`;
        }
      }

      if (dealerData.pincode_id) {
        try {
          const response = await pincodeApi.getAll();
          const pincodes = extractDataFromResponse(response);
          const pincode = pincodes.find(
            (p) => p.id === parseInt(dealerData.pincode_id)
          );
          names.pincode = pincode
            ? `${pincode.code}${pincode.area ? ` - ${pincode.area}` : ""}`
            : `ID: ${dealerData.pincode_id}`;
        } catch (error) {
          console.error("Error fetching pincode:", error);
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
          error.response?.data?.message || "Failed to load dealer details"
        );
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to load dealer details",
        });
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
      text: `You are about to delete dealer "${dealer?.name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#666",
      cancelButtonColor: "#999",
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
        console.error("Failed to delete dealer:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete dealer",
        });
      }
    }
  };

  const handleUploadDocument = (newDoc) => {
    setDealer((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), newDoc],
    }));
  };

  const handleDeleteDocument = (docId) => {
    setDealer((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((doc) => doc.id !== docId),
    }));
  };

  const getStatusBadge = (status) => {
    const isActive = status === 1 || status === "active" || status === "1";
    return (
      <Badge
        bg="secondary"
        className="px-3 py-2 rounded-pill"
      >
        <span className={`me-1 text-white`}>
          {isActive ? "●" : "○"}
        </span>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getDealerTypeBadge = (type) => {
    const typeMap = {
      distributor: "secondary",
      retailer: "secondary",
      franchise: "secondary",
    };
    const color = typeMap[type?.toLowerCase()] || "secondary";
    return (
      <Badge bg={color} className="px-3 py-2 rounded-pill">
        {type?.toUpperCase() || "RETAILER"}
      </Badge>
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatAadhaar = (aadhaarNumber) => {
    if (!aadhaarNumber) return "N/A";
    const cleanNumber = aadhaarNumber.toString().replace(/[^\d]/g, "");
    if (cleanNumber.length === 12) {
      if (showFullAadhaar) {
        return cleanNumber.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
      } else {
        const last4 = cleanNumber.slice(-4);
        return `XXXX XXXX ${last4}`;
      }
    }
    return aadhaarNumber;
  };

  const toggleAadhaarVisibility = () => {
    setShowFullAadhaar(!showFullAadhaar);
  };

  const totalCommission =
    ((dealer?.total_sales || 0) * (dealer?.commission_rate || 0)) / 100;

  const availableCredit =
    (parseFloat(dealer?.credit_limit) || 0) -
    (parseFloat(dealer?.outstanding_amount) || 0);

  // Get validation results
  const gstValidation = validateGST(dealer?.gst_number);
  const panValidation = validatePAN(dealer?.pan_number);
  const aadhaarValidation = validateAadhaar(dealer?.aadhaar_number);
  const emailValidation = validateEmail(dealer?.email);
  const mobileValidation = validateMobile(dealer?.mobile);
  const commissionValidation = validateCommissionRate(dealer?.commission_rate);

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading dealer details...</h5>
        </div>
      </Container>
    );
  }

  if (error || !dealer) {
    return (
      <Container fluid className="p-4">
        <Alert variant="secondary" className="text-center">
          <h4>Dealer not found</h4>
          <p>
            {error ||
              "The dealer you're looking for doesn't exist or has been removed."}
          </p>
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
      className="p-4"
      style={{ background: "#f8f9fa", minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="mb-3 rounded-pill"
              onClick={() => navigate("/dealers")}
            >
              <FaArrowLeft className="me-2" /> Back to Dealers
            </Button>
            <h2 className="fw-bold mb-1 text-dark">{dealer.name}</h2>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <p className="mb-0 text-muted">
                <FaHashtag className="me-1" size={12} />
                <strong>Dealer Code:</strong>{" "}
                {dealer.dealer_code || `DLR_${String(dealer.id).padStart(6, "0")}`}
              </p>
              <p className="mb-0">{getDealerTypeBadge(dealer.dealer_type)}</p>
              <p className="mb-0">{getStatusBadge(dealer.status)}</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/dealers/edit/${dealer.id}`)}
              className="rounded-pill"
            >
              <FaEdit className="me-2" /> Edit Dealer
            </Button>
            <Button
              variant="secondary"
              onClick={handleDelete}
              className="rounded-pill"
            >
              <FaTrash className="me-2" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <Row className="g-3 mb-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">
                    Total Sales
                  </small>
                  <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                    {formatCurrency(dealer.total_sales || 0)}
                  </h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <FaChartLine className="text-secondary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">
                    Commission Rate
                  </small>
                  <div className="d-flex align-items-center flex-wrap">
                    <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                      {dealer.commission_rate || 0}%
                    </h3>
                    {getValidationBadge(commissionValidation)}
                  </div>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <FaPercent className="text-secondary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">
                    Total Commission
                  </small>
                  <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                    {formatCurrency(totalCommission)}
                  </h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <FaStar className="text-secondary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">
                    Credit Limit
                  </small>
                  <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                    {formatCurrency(dealer.credit_limit || 0)}
                  </h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <FaWallet className="text-secondary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Tabs
            defaultActiveKey="overview"
            className="px-3 pt-3 border-0 gap-2"
          >
            <Tab eventKey="overview" title="Overview" className="p-3">
              <Row className="g-4">
                {/* Dealer Information */}
                <Col lg={5}>
                  <Card className="border-0 bg-light rounded-4 h-100">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">
                        <FaUserCircle className="me-2 text-secondary" /> Dealer
                        Information
                      </h5>
                      <hr />
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Dealer Code
                        </small>
                        <strong>
                          {dealer.dealer_code ||
                            `DLR_${String(dealer.id).padStart(6, "0")}`}
                        </strong>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">Email Address</small>
                        <div className="d-flex align-items-center flex-wrap">
                          <strong>{dealer.email || "N/A"}</strong>
                          {getValidationBadge(emailValidation)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">Mobile Number</small>
                        <div className="d-flex align-items-center flex-wrap">
                          <strong>{dealer.mobile || "N/A"}</strong>
                          {getValidationBadge(mobileValidation)}
                        </div>
                      </div>
                      {dealer.alternate_mobile && (
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Alternate Mobile
                          </small>
                          <strong>{dealer.alternate_mobile}</strong>
                        </div>
                      )}
                      <div className="mb-3">
                        <small className="text-muted d-block">GST Number</small>
                        <div className="d-flex align-items-center flex-wrap">
                          <strong>{dealer.gst_number || "N/A"}</strong>
                          {getValidationBadge(gstValidation)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">PAN Number</small>
                        <div className="d-flex align-items-center flex-wrap">
                          <strong>{dealer.pan_number || "N/A"}</strong>
                          {getValidationBadge(panValidation)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">Aadhaar Number</small>
                        <div className="d-flex align-items-center flex-wrap">
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={toggleAadhaarVisibility}
                            className="me-2"
                          >
                            <strong>{formatAadhaar(dealer.aadhaar_number)}</strong>
                          </span>
                          {getValidationBadge(aadhaarValidation)}
                          {dealer.aadhaar_number && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={toggleAadhaarVisibility}
                              className="p-0 ms-2"
                            >
                              {showFullAadhaar ? "Hide" : "Show"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Address Information */}
                <Col lg={7}>
                  <Card className="border-0 bg-light rounded-4 mb-4">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">
                        <FaMapMarker className="me-2 text-secondary" /> Address
                        Information
                      </h5>
                      <hr />
                      {dealer.address && (
                        <div className="mb-3">
                          <small className="text-muted d-block">Address</small>
                          <strong>{dealer.address}</strong>
                        </div>
                      )}

                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Country
                            </small>
                            <strong>
                              {loadingLocation ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                locationNames.country ||
                                dealer.country_id ||
                                "N/A"
                              )}
                            </strong>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">State</small>
                            <strong>
                              {loadingLocation ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                locationNames.state || dealer.state_id || "N/A"
                              )}
                            </strong>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">City</small>
                            <strong>
                              {loadingLocation ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                locationNames.city || dealer.city_id || "N/A"
                              )}
                            </strong>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Pincode
                            </small>
                            <strong>
                              {loadingLocation ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                locationNames.pincode ||
                                dealer.pincode_id ||
                                "N/A"
                              )}
                            </strong>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Commission & Credit Details */}
                  <Card className="border-0 bg-light rounded-4">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">
                        <FaMoneyBillWave className="me-2 text-secondary" />
                        Commission & Credit Details
                      </h5>
                      <hr />
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Commission Rate
                            </small>
                            <div className="d-flex align-items-center flex-wrap">
                              <h5 className="mb-0" style={{ color: "#333" }}>
                                {dealer.commission_rate || 0}%
                              </h5>
                              {getValidationBadge(commissionValidation)}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Credit Limit
                            </small>
                            <h5 className="mb-0" style={{ color: "#333" }}>
                              {formatCurrency(dealer.credit_limit || 0)}
                            </h5>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Total Sales
                            </small>
                            <h5 className="mb-0" style={{ color: "#333" }}>
                              {formatCurrency(dealer.total_sales || 0)}
                            </h5>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Total Commission Earned
                            </small>
                            <h5 className="mb-0" style={{ color: "#333" }}>
                              {formatCurrency(totalCommission)}
                            </h5>
                          </div>
                        </Col>
                      </Row>
                      <div className="bg-white rounded-3 p-3 text-center">
                        <small className="text-muted d-block">
                          Available Credit
                        </small>
                        <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                          {formatCurrency(availableCredit)}
                        </h3>
                        <small className="text-muted">
                          Credit Limit - Outstanding Amount
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Documents Section */}
              <Row className="mt-4">
                <Col md={12}>
                  <Card className="border-0 bg-light rounded-4">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">
                          <FaDownload className="me-2 text-secondary" /> Documents
                        </h5>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="rounded-pill"
                          onClick={() => setShowDocs(true)}
                        >
                          View All ({dealer.documents?.length || 0})
                        </Button>
                      </div>
                      <hr />
                      {dealer.documents && dealer.documents.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {dealer.documents.slice(0, 4).map((doc) => (
                            <div
                              key={doc.id}
                              className="bg-white rounded-3 p-3 flex-grow-1"
                            >
                              <strong>{doc.name}</strong>
                              <div className="small text-muted">
                                {doc.upload_date || doc.uploadDate}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted text-center py-3">
                          No documents uploaded
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* System Info */}
              <Row className="mt-4">
                <Col md={12}>
                  <Card className="border-0 bg-light rounded-4">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">
                        <FaCalendarAlt className="me-2 text-secondary" /> System
                        Information
                      </h5>
                      <hr />
                      <Row>
                        <Col md={4}>
                          <small className="text-muted d-block">
                            Created By
                          </small>
                          <strong>{dealer.created_by || "System"}</strong>
                        </Col>
                        <Col md={4}>
                          <small className="text-muted d-block">
                            Created At
                          </small>
                          <strong>{formatDate(dealer.created_at)}</strong>
                        </Col>
                        <Col md={4}>
                          <small className="text-muted d-block">
                            Last Updated
                          </small>
                          <strong>{formatDate(dealer.updated_at)}</strong>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="sales" title="Sales History" className="p-3">
              <div className="text-center py-5">
                <FaChartLine size={60} className="text-muted mb-3" />
                <h5 className="text-muted">No sales records found</h5>
                <p className="text-muted small">
                  Add sales to see them here
                </p>
              </div>
            </Tab>

            <Tab eventKey="documents" title="Documents" className="p-3">
              <Card className="border-0 bg-light rounded-4">
                <Card.Body>
                  <h5 className="fw-bold mb-3">Dealer Documents</h5>
                  <hr />
                  {dealer.documents && dealer.documents.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Document Name</th>
                            <th>Type</th>
                            <th>Upload Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dealer.documents.map((doc) => (
                            <tr key={doc.id}>
                              <td>{doc.name}</td>
                              <td>{doc.type}</td>
                              <td>{doc.upload_date || doc.uploadDate}</td>
                              <td>
                                <Button size="sm" variant="outline-secondary" className="me-1">
                                  <FaDownload />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted text-center py-3">
                      No documents uploaded
                    </p>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Document Viewer Modal */}
      <DocumentViewer
        show={showDocs}
        onHide={() => setShowDocs(false)}
        documents={dealer.documents || []}
        onUpload={handleUploadDocument}
        onDelete={handleDeleteDocument}
      />
    </Container>
  );
};

export default DealerDetails;