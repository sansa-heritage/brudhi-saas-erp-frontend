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
} from "react-icons/fa";
import DocumentViewer from "../../components/Modals/DocumentViewer";
import {
  getCustomerById,
  deleteCustomer,
} from "../../components/services/customerService";
import {
  countryApi,
  stateApi,
  cityApi,
  pincodeApi,
} from "../../api/superadmin/masterData.api";
import Swal from "sweetalert2";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
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

  // Get validation status icon and color (B&W version)
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
  const fetchLocationNames = async (customerData) => {
    setLoadingLocation(true);
    try {
      const names = {
        country: "",
        state: "",
        city: "",
        pincode: "",
      };

      if (customerData.country_id) {
        try {
          const response = await countryApi.getAll();
          const countries = extractDataFromResponse(response);
          const country = countries.find(
            (c) => c.id === parseInt(customerData.country_id),
          );
          names.country = country
            ? country.name
            : `ID: ${customerData.country_id}`;
        } catch (error) {
          console.error("Error fetching country:", error);
          names.country = `ID: ${customerData.country_id}`;
        }
      }

      if (customerData.state_id) {
        try {
          const response = await stateApi.getAll(customerData.country_id);
          const states = extractDataFromResponse(response);
          const state = states.find(
            (s) => s.id === parseInt(customerData.state_id),
          );
          names.state = state ? state.name : `ID: ${customerData.state_id}`;
        } catch (error) {
          console.error("Error fetching state:", error);
          names.state = `ID: ${customerData.state_id}`;
        }
      }

      if (customerData.city_id) {
        try {
          const response = await cityApi.getAll();
          const cities = extractDataFromResponse(response);
          const city = cities.find(
            (c) => c.id === parseInt(customerData.city_id),
          );
          names.city = city ? city.name : `ID: ${customerData.city_id}`;
        } catch (error) {
          console.error("Error fetching city:", error);
          names.city = `ID: ${customerData.city_id}`;
        }
      }

      if (customerData.pincode_id) {
        try {
          const response = await pincodeApi.getAll();
          const pincodes = extractDataFromResponse(response);
          const pincode = pincodes.find(
            (p) => p.id === parseInt(customerData.pincode_id),
          );
          names.pincode = pincode
            ? `${pincode.code}${pincode.area ? ` - ${pincode.area}` : ""}`
            : `ID: ${customerData.pincode_id}`;
        } catch (error) {
          console.error("Error fetching pincode:", error);
          names.pincode = `ID: ${customerData.pincode_id}`;
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
    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomerById(id);

        let customerData = null;
        if (data?.data?.success && data.data.data) {
          customerData = data.data.data;
        } else if (data?.data) {
          customerData = data.data;
        } else if (data) {
          customerData = data;
        }

        setCustomer(customerData);

        if (customerData) {
          await fetchLocationNames(customerData);
        }
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        setError(
          error.response?.data?.message || "Failed to load customer details",
        );
        Swal.fire({
          icon: "error",
          title: "Error!",
          text:
            error.response?.data?.message || "Failed to load customer details",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete customer "${customer?.name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#666",
      cancelButtonColor: "#999",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteCustomer(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Customer has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/customers");
      } catch (error) {
        console.error("Failed to delete customer:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete customer",
        });
      }
    }
  };

  const handleUploadDocument = (newDoc) => {
    setCustomer((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), newDoc],
    }));
  };

  const handleDeleteDocument = (docId) => {
    setCustomer((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((doc) => doc.id !== docId),
    }));
  };

  const getStatusBadge = (status) => {
    const isActive = status === 1 || status === "active" || status === "1";
    return (
      <Badge
        bg={isActive ? "secondary" : "secondary"}
        className="px-3 py-2 rounded-pill"
      >
        <span className={`me-1`}>
          {isActive ? "●" : "○"}
        </span>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getCustomerTypeBadge = (type) => {
    return (
      <Badge bg="secondary" className="px-3 py-2 rounded-pill">
        {type?.toUpperCase() || "REGULAR"}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const availableCredit =
    (parseFloat(customer?.credit_limit) || 0) -
    (parseFloat(customer?.outstanding_amount) || 0);

  // Get validation results
  const gstValidation = validateGST(customer?.gst_number);
  const panValidation = validatePAN(customer?.pan_number);
  const aadhaarValidation = validateAadhaar(customer?.aadhaar_number);
  const emailValidation = validateEmail(customer?.email);
  const mobileValidation = validateMobile(customer?.mobile);

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading customer details...</h5>
        </div>
      </Container>
    );
  }

  if (error || !customer) {
    return (
      <Container fluid className="p-4">
        <Alert variant="secondary" className="text-center">
          <h4>Customer not found</h4>
          <p>
            {error ||
              "The customer you're looking for doesn't exist or has been removed."}
          </p>
          <Button variant="secondary" onClick={() => navigate("/customers")}>
            Back to Customers
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
              onClick={() => navigate("/customers")}
            >
              <FaArrowLeft className="me-2" /> Back to Customers
            </Button>
            <h2 className="fw-bold mb-1 text-dark">{customer.name}</h2>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <p className="mb-0 text-muted">
                <FaHashtag className="me-1" size={12} />
                <strong>Customer Code:</strong>{" "}
                {customer.customer_code || "N/A"}
              </p>
              <p className="mb-0">
                {getCustomerTypeBadge(customer.customer_type)}
              </p>
              <p className="mb-0">{getStatusBadge(customer.status)}</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/customers/edit/${customer.id}`)}
              className="rounded-pill"
            >
              <FaEdit className="me-2" /> Edit Customer
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

      {/* Stats Cards Row - B&W */}
      <Row className="g-3 mb-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted text-uppercase">
                    Credit Limit
                  </small>
                  <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                    ₹{parseFloat(customer.credit_limit || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <FaWallet className="text-secondary" size={24} />
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
                    Outstanding
                  </small>
                  <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                    ₹
                    {parseFloat(
                      customer.outstanding_amount || 0,
                    ).toLocaleString()}
                  </h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <FaCreditCard className="text-secondary" size={24} />
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
                    Credit Days
                  </small>
                  <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                    {customer.credit_days || 0}{" "}
                    <small className="fs-6">days</small>
                  </h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <FaClock className="text-secondary" size={24} />
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
                    Available Credit
                  </small>
                  <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                    ₹{availableCredit.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-light rounded-circle p-3">
                  <FaPercent className="text-secondary" size={24} />
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
                {/* Personal Information */}
                <Col lg={5}>
                  <Card className="border-0 bg-light rounded-4 h-100">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">
                        <FaUserCircle className="me-2 text-secondary" /> Personal Information
                      </h5>
                      <hr />
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Customer Code
                        </small>
                        <strong>
                          {customer.customer_code ||
                            `CUST_${String(customer.id).padStart(6, "0")}`}
                        </strong>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Email Address
                        </small>
                        <div className="d-flex align-items-center flex-wrap">
                          <strong>{customer.email || "N/A"}</strong>
                          {getValidationBadge(emailValidation)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Mobile Number
                        </small>
                        <div className="d-flex align-items-center flex-wrap">
                          <strong>{customer.mobile || "N/A"}</strong>
                          {getValidationBadge(mobileValidation)}
                        </div>
                      </div>
                      {customer.alternate_mobile && (
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Alternate Mobile
                          </small>
                          <strong>{customer.alternate_mobile}</strong>
                        </div>
                      )}
                      <div className="mb-3">
                        <small className="text-muted d-block">GST Number</small>
                        <div className="d-flex align-items-center flex-wrap">
                          <strong>{customer.gst_number || "N/A"}</strong>
                          {getValidationBadge(gstValidation)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">PAN Number</small>
                        <div className="d-flex align-items-center flex-wrap">
                          <strong>{customer.pan_number || "N/A"}</strong>
                          {getValidationBadge(panValidation)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Aadhaar Number
                        </small>
                        <div className="d-flex align-items-center flex-wrap">
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={toggleAadhaarVisibility}
                            className="me-2"
                          >
                            <strong>
                              {formatAadhaar(customer.aadhaar_number)}
                            </strong>
                          </span>
                          {getValidationBadge(aadhaarValidation)}
                          {customer.aadhaar_number && (
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
                        <FaMapMarker className="me-2 text-secondary" /> Address Information
                      </h5>
                      <hr />
                      {customer.address && (
                        <div className="mb-3">
                          <small className="text-muted d-block">Address</small>
                          <strong>{customer.address}</strong>
                        </div>
                      )}
                      {customer.landmark && (
                        <div className="mb-3">
                          <small className="text-muted d-block">Landmark</small>
                          <strong>{customer.landmark}</strong>
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
                                customer.country_id ||
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
                                locationNames.state ||
                                customer.state_id ||
                                "N/A"
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
                                locationNames.city || customer.city_id || "N/A"
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
                                customer.pincode_id ||
                                "N/A"
                              )}
                            </strong>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Credit Details */}
                  <Card className="border-0 bg-light rounded-4">
                    <Card.Body>
                      <h5 className="fw-bold mb-3">
                        <FaMoneyBillWave className="me-2 text-secondary" /> Credit Details
                      </h5>
                      <hr />
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Credit Limit
                            </small>
                            <h5 className="mb-0" style={{ color: "#333" }}>
                              ₹
                              {parseFloat(
                                customer.credit_limit || 0,
                              ).toLocaleString()}
                            </h5>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Credit Days
                            </small>
                            <h5 className="mb-0" style={{ color: "#333" }}>
                              {customer.credit_days || 0} days
                            </h5>
                          </div>
                        </Col>
                      </Row>
                      <div className="bg-white rounded-3 p-3 text-center">
                        <small className="text-muted d-block">
                          Available Credit
                        </small>
                        <h3 className="fw-bold mb-0" style={{ color: "#333" }}>
                          ₹{availableCredit.toLocaleString()}
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
                          View All ({customer.documents?.length || 0})
                        </Button>
                      </div>
                      <hr />
                      {customer.documents && customer.documents.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {customer.documents.slice(0, 4).map((doc) => (
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
                        <FaCalendarAlt className="me-2 text-secondary" /> System Information
                      </h5>
                      <hr />
                      <Row>
                        <Col md={4}>
                          <small className="text-muted d-block">
                            Created By
                          </small>
                          <strong>{customer.created_by || "System"}</strong>
                        </Col>
                        <Col md={4}>
                          <small className="text-muted d-block">
                            Created At
                          </small>
                          <strong>{formatDate(customer.created_at)}</strong>
                        </Col>
                        <Col md={4}>
                          <small className="text-muted d-block">
                            Last Updated
                          </small>
                          <strong>{formatDate(customer.updated_at)}</strong>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="invoices" title="Invoice History" className="p-3">
              <div className="text-center py-5">
                <FaFileInvoice size={60} className="text-muted mb-3" />
                <h5 className="text-muted">No invoices found</h5>
                <p className="text-muted small">
                  Add invoices to see them here
                </p>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Document Viewer Modal */}
      <DocumentViewer
        show={showDocs}
        onHide={() => setShowDocs(false)}
        documents={customer.documents || []}
        onUpload={handleUploadDocument}
        onDelete={handleDeleteDocument}
      />
    </Container>
  );
};

export default CustomerDetails;