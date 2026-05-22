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
  Tabs,
  Tab,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUser,
  FaBuilding,
  FaMapMarker,
  FaCreditCard,
  FaRupeeSign,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaFileInvoice,
  FaWallet,
  FaPercent,
  FaTruck,
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

  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    mobile: "",
    alternate_mobile: "",
    address: "",
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
    territory: "",
    status: "active",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

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
            company_name: data.company_name || "",
            email: data.email || "",
            mobile: data.mobile || "",
            alternate_mobile: data.alternate_mobile || "",
            address: data.address || "",
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
            territory: data.territory || "",
            status: data.status || "active",
            notes: data.notes || "",
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
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDealer();
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
      await fetchStates(countryId);
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
      await fetchCities(stateId);
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
      await fetchPincodes(cityId);
    } else {
      setPincodes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Dealer name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.mobile?.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        alternate_mobile: formData.alternate_mobile || null,
        alternateMobile: formData.alternate_mobile || null,
        address: formData.address || null,
        country_id: formData.country_id ? Number(formData.country_id) : null,
        countryId: formData.country_id ? Number(formData.country_id) : null,
        state_id: formData.state_id ? Number(formData.state_id) : null,
        stateId: formData.state_id ? Number(formData.state_id) : null,
        city_id: formData.city_id ? Number(formData.city_id) : null,
        cityId: formData.city_id ? Number(formData.city_id) : null,
        pincode_id: formData.pincode_id ? Number(formData.pincode_id) : null,
        pincodeId: formData.pincode_id ? Number(formData.pincode_id) : null,
        gst_number: formData.gst_number || null,
        gstNumber: formData.gst_number || null,
        pan_number: formData.pan_number || null,
        panNumber: formData.pan_number || null,
        aadhaar_number: formData.aadhaar_number || null,
        aadhaarNumber: formData.aadhaar_number || null,
        dealer_type: formData.dealer_type,
        dealerType: formData.dealer_type,
        commission_rate: Number(formData.commission_rate) || 0,
        commissionRate: Number(formData.commission_rate) || 0,
        credit_limit: Number(formData.credit_limit) || 0,
        creditLimit: Number(formData.credit_limit) || 0,
        territory: formData.territory || null,
        status: formData.status,
        notes: formData.notes || null,
      };

      console.log(
        "📤 Submitting update with payload:",
        JSON.stringify(submitData, null, 2),
      );

      const response = await updateDealer(id, submitData);
      console.log("✅ Update response:", response);

      // ✅ SUCCESS TOAST MESSAGE
      toast.success(`✅ Dealer "${formData.name}" updated successfully! 🎉`, {
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
        navigate(`/dealers/${id}`);
      }, 1500);
    } catch (error) {
      console.error("❌ Error updating dealer:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to update dealer";
      
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

  const handleCancel = () => {
    navigate(`/dealers/${id}`);
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3">Loading dealer data...</h5>
        </div>
      </Container>
    );
  }

  if (!dealer) {
    return (
      <Container fluid className="p-4">
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
    <Container fluid className="p-4" style={{ background: "#f8f9fa" }}>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 mb-2"
            onClick={() => navigate(`/dealers/${id}`)}
            style={{ color: "#6c757d" }}
          >
            <FaArrowLeft className="me-2" /> Back to Dealer Details
          </Button>
          <h2 className="fw-bold mb-1">Edit Dealer</h2>
          <p className="text-muted">
            Update dealer information for {dealer.name}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Badge
            bg="secondary"
            className="p-2"
          >
            {dealer.status?.toUpperCase()}
          </Badge>
          <Badge bg="secondary" className="p-2">
            ID: {dealer.id}
          </Badge>
          <Badge bg="secondary" className="p-2">
            Code: {dealer.dealer_code}
          </Badge>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="secondary"
          className="mb-4"
          onClose={() => setSuccessMessage("")}
          dismissible
        >
          {successMessage}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Tabs defaultActiveKey="basic" className="mb-4">
          {/* Basic Information Tab */}
          <Tab eventKey="basic" title="Basic Information">
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body>
                <h5 className="mb-3">
                  <FaUser className="text-secondary me-2" /> Personal Information
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Dealer Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter dealer name"
                        isInvalid={!!errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Enter company name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Email <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="dealer@example.com"
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Mobile Number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="9876543210"
                        isInvalid={!!errors.mobile}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.mobile}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Alternate Mobile</Form.Label>
                      <Form.Control
                        type="tel"
                        name="alternate_mobile"
                        value={formData.alternate_mobile}
                        onChange={handleChange}
                        placeholder="Alternate mobile number"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mb-3 mt-4">
                  <FaIdCard className="text-secondary me-2" /> Tax Information
                </h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>GST Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="gst_number"
                        value={formData.gst_number}
                        onChange={handleChange}
                        placeholder="22ABCDE1234F1Z5"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>PAN Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="pan_number"
                        value={formData.pan_number}
                        onChange={handleChange}
                        placeholder="ABCDE1234F"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Aadhaar Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="aadhaar_number"
                        value={formData.aadhaar_number}
                        onChange={handleChange}
                        placeholder="123456789012"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mb-3 mt-4">
                  <FaTruck className="text-secondary me-2" /> Dealer Settings
                </h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
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
                  <Col md={4}>
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
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Territory</Form.Label>
                      <Form.Select
                        name="territory"
                        value={formData.territory}
                        onChange={handleChange}
                      >
                        <option value="">Select Territory</option>
                        <option value="North Region">North Region</option>
                        <option value="South Region">South Region</option>
                        <option value="East Region">East Region</option>
                        <option value="West Region">West Region</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mb-3 mt-4">
                  <FaPercent className="text-secondary me-2" /> Financial Settings
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Commission Rate (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="commission_rate"
                        value={formData.commission_rate}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="0.5"
                      />
                      <Form.Text className="text-muted">
                        Commission percentage for this dealer
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Credit Limit (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        name="credit_limit"
                        value={formData.credit_limit}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="1000"
                      />
                      <Form.Text className="text-muted">
                        Maximum credit limit for this dealer
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes about dealer..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Tab>

          {/* Address Tab with Location Dropdowns */}
          <Tab eventKey="address" title="Address">
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body>
                <h5 className="mb-3">
                  <FaMapMarker className="text-secondary me-2" /> Location
                  Information
                </h5>

                {/* Country Dropdown */}
                <Row>
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
                      {loadingCountries && (
                        <Spinner animation="border" size="sm" />
                      )}
                    </Form.Group>
                  </Col>

                  {/* State Dropdown */}
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
                      {loadingStates && (
                        <Spinner animation="border" size="sm" />
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  {/* City Dropdown */}
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
                      {loadingCities && (
                        <Spinner animation="border" size="sm" />
                      )}
                    </Form.Group>
                  </Col>

                  {/* Pincode Dropdown */}
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
                      {loadingPincodes && (
                        <Spinner animation="border" size="sm" />
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street address, building name, area, etc."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Form Actions */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button variant="secondary" type="submit" disabled={saving}>
            {saving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
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
    </Container>
  );
};

export default EditDealer;