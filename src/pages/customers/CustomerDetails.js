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
} from "react-icons/fa";
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

// Status color mapping (matching Expenses list)
const statusConfig = {
  active: { bg: "#ECFDF3", color: "#027A48", label: "Active" },
  inactive: { bg: "#FFDCE2", color: "#F94765", label: "Inactive" },
  pending: { bg: "#FEF6D7", color: "#FED229", label: "Pending" },
};

// Customer type color mapping
const customerTypeConfig = {
  premium: { bg: "#D3EAFF", color: "#437EF7", label: "Premium" },
  wholesale: { bg: "#FFE0CB", color: "#FF8532", label: "Wholesale" },
  regular: { bg: "#F3F4F6", color: "#1e293b", label: "Regular" },
};

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
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
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
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
    return { isValid: false, message: "Invalid Aadhaar Number (12 digits required)" };
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

  const getValidationIcon = (validation) => {
    if (validation.isValid === null) {
      return <FaInfoCircle className="text-secondary ms-2" size={14} title={validation.message} />;
    }
    if (validation.isValid) {
      return <FaCheckCircle className="text-success ms-2" size={14} title={validation.message} />;
    }
    return <FaExclamationTriangle className="text-danger ms-2" size={14} title={validation.message} />;
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

  const fetchLocationNames = async (customerData) => {
    setLoadingLocation(true);
    try {
      const names = { country: "", state: "", city: "", pincode: "" };

      if (customerData.country_id) {
        try {
          const response = await countryApi.getAll();
          const countries = extractDataFromResponse(response);
          const country = countries.find(c => c.id === parseInt(customerData.country_id));
          names.country = country ? country.name : `ID: ${customerData.country_id}`;
        } catch (error) {
          names.country = `ID: ${customerData.country_id}`;
        }
      }

      if (customerData.state_id) {
        try {
          const response = await stateApi.getAll(customerData.country_id);
          const states = extractDataFromResponse(response);
          const state = states.find(s => s.id === parseInt(customerData.state_id));
          names.state = state ? state.name : `ID: ${customerData.state_id}`;
        } catch (error) {
          names.state = `ID: ${customerData.state_id}`;
        }
      }

      if (customerData.city_id) {
        try {
          const response = await cityApi.getAll();
          const cities = extractDataFromResponse(response);
          const city = cities.find(c => c.id === parseInt(customerData.city_id));
          names.city = city ? city.name : `ID: ${customerData.city_id}`;
        } catch (error) {
          names.city = `ID: ${customerData.city_id}`;
        }
      }

      if (customerData.pincode_id) {
        try {
          const response = await pincodeApi.getAll();
          const pincodes = extractDataFromResponse(response);
          const pincode = pincodes.find(p => p.id === parseInt(customerData.pincode_id));
          names.pincode = pincode ? `${pincode.code}` : `ID: ${customerData.pincode_id}`;
        } catch (error) {
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
        setError(error.response?.data?.message || "Failed to load customer details");
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
      text: `Delete customer "${customer?.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6c757d",
      cancelButtonColor: "#6c757d",
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
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete customer",
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

  const getCustomerTypeBadge = (type) => {
    const config = customerTypeConfig[type?.toLowerCase()] || customerTypeConfig.regular;
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

  const gstValidation = validateGST(customer?.gst_number);
  const panValidation = validatePAN(customer?.pan_number);
  const aadhaarValidation = validateAadhaar(customer?.aadhaar_number);
  const emailValidation = validateEmail(customer?.email);
  const mobileValidation = validateMobile(customer?.mobile);
  const alternateMobileValidation = validateAlternateMobile(customer?.alternate_mobile, customer?.mobile);

  if (loading) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading customer details...</h5>
        </div>
      </Container>
    );
  }

  if (error || !customer) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <Alert variant="secondary" className="text-center">
          <h4>Customer not found</h4>
          <p>{error || "The customer you're looking for doesn't exist."}</p>
          <Button variant="secondary" onClick={() => navigate("/customers")}>
            Back to Customers
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            {customer.name}
          </h2>
          {/* <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-muted" style={{ fontSize: "13px" }}>
              <FaHashtag size={12} className="me-1" /> Code: {customer.customer_code || `CUST_${String(customer.id).padStart(6, "0")}`}
            </span>
            <span>•</span>
            {getCustomerTypeBadge(customer.customer_type)}
            {getStatusBadge(customer.status)}
          </div> */}
        </div>
        <div className="d-flex gap-2">
          <Button
            onClick={() => navigate(`/customers/edit/${customer.id}`)}
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
                <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaUser className="me-2" /> Personal Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Customer Name</small>
                      <strong>{customer.name}</strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Customer Code</small>
                      <strong>{customer.customer_code || `CUST_${String(customer.id).padStart(6, "0")}`}</strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Customer Type</small>
                      {getCustomerTypeBadge(customer.customer_type)}
                    </div>
                  </Col>
                </Row>

                {/* Contact Information Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaPhone className="me-2" /> Contact Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Email Address</small>
                      <div className="d-flex align-items-center">
                        <strong>{customer.email || "N/A"}</strong>
                        {getValidationIcon(emailValidation)}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Mobile Number</small>
                      <div className="d-flex align-items-center">
                        <strong>{customer.mobile || "N/A"}</strong>
                        {getValidationIcon(mobileValidation)}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Alternate Mobile</small>
                      <div className="d-flex align-items-center">
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={toggleAlternateMobileVisibility}
                          className="me-1"
                        >
                          <strong>{formatAlternateMobile(customer.alternate_mobile)}</strong>
                        </span>
                        {customer.alternate_mobile && (
                          <Button variant="link" size="sm" onClick={toggleAlternateMobileVisibility} className="p-0 ms-1">
                            {showFullAlternateMobile ? "Hide" : "Show"}
                          </Button>
                        )}
                        {getValidationIcon(alternateMobileValidation)}
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Tax Information Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaIdCard className="me-2" /> Tax Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>GST Number</small>
                      <div className="d-flex align-items-center">
                        <strong>{customer.gst_number || "N/A"}</strong>
                        {getValidationIcon(gstValidation)}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>PAN Number</small>
                      <div className="d-flex align-items-center">
                        <strong>{customer.pan_number || "N/A"}</strong>
                        {getValidationIcon(panValidation)}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Aadhaar Number</small>
                      <div className="d-flex align-items-center">
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={toggleAadhaarVisibility}
                          className="me-1"
                        >
                          <strong>{formatAadhaar(customer.aadhaar_number)}</strong>
                        </span>
                        {customer.aadhaar_number && (
                          <Button variant="link" size="sm" onClick={toggleAadhaarVisibility} className="p-0 ms-1">
                            {showFullAadhaar ? "Hide" : "Show"}
                          </Button>
                        )}
                        {getValidationIcon(aadhaarValidation)}
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Address Information Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaMapMarkerAlt className="me-2" /> Address Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={6}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Full Address</small>
                      <strong>{customer.address || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Landmark</small>
                      <strong>{customer.landmark || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Country</small>
                      <strong>{loadingLocation ? <Spinner animation="border" size="sm" /> : locationNames.country || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>State</small>
                      <strong>{loadingLocation ? <Spinner animation="border" size="sm" /> : locationNames.state || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>City</small>
                      <strong>{loadingLocation ? <Spinner animation="border" size="sm" /> : locationNames.city || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Pincode</small>
                      <strong>{loadingLocation ? <Spinner animation="border" size="sm" /> : locationNames.pincode || "N/A"}</strong>
                    </div>
                  </Col>
                </Row>

                {/* Financial Information Section */}
                <h6 className="fw-bold mb-3 mt-4" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaMoneyBillWave className="me-2" /> Financial Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Credit Limit</small>
                      <strong>{formatCurrency(customer.credit_limit || 0)}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Outstanding Amount</small>
                      <strong>{formatCurrency(customer.outstanding_amount || 0)}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Status</small>
                      {getStatusBadge(customer.status)}
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>Created On</small>
                      <strong>{formatDate(customer.created_at)}</strong>
                    </div>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab
              eventKey="invoices"
              title={
                <span className="fw-semibold">
                  <FaFileInvoice className="me-2" /> Invoice History
                </span>
              }
            >
              <div className="p-5 text-center">
                <FaFileInvoice size={60} className="text-muted mb-3" />
                <h5 className="text-muted">No invoices found</h5>
                <p className="text-muted small">Invoices will appear here once added</p>
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

export default CustomerDetails;