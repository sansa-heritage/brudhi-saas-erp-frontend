// frontend/src/components/Modals/DealerModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import { countryApi, stateApi, cityApi, pincodeApi } from "../../api/superadmin/masterData.api";

const DealerModal = ({ show, onHide, dealer, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    address: "",
    countryId: "",
    stateId: "",
    cityId: "",
    pincodeId: "",
    gstNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    dealerType: "retailer",
    commissionRate: 0,
    createdBy: "",
    status: "active",
  });

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

  // Fetch countries on modal open
  useEffect(() => {
    if (show) {
      fetchCountries();
      // Reset form if no dealer is being edited
      if (!dealer) {
        resetForm();
      }
    }
  }, [show]);

  // Fetch states when country changes
  useEffect(() => {
    if (formData.countryId) {
      fetchStates(formData.countryId);
      // Reset dependent fields
      setFormData(prev => ({ ...prev, stateId: "", cityId: "", pincodeId: "" }));
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
      setFormData(prev => ({ ...prev, cityId: "", pincodeId: "" }));
      setPincodes([]);
    } else {
      setCities([]);
      setPincodes([]);
    }
  }, [formData.stateId]);

  // Fetch pincodes when city changes
  useEffect(() => {
    if (formData.cityId) {
      console.log("City selected, fetching pincodes for cityId:", formData.cityId);
      fetchPincodes(formData.cityId);
      setFormData(prev => ({ ...prev, pincodeId: "" }));
    } else {
      setPincodes([]);
    }
  }, [formData.cityId]);

  // Load dealer data for edit
  useEffect(() => {
    if (dealer) {
      setFormData({
        name: dealer.name || "",
        email: dealer.email || "",
        mobile: dealer.mobile || "",
        alternateMobile: dealer.alternate_mobile || dealer.alternateMobile || "",
        address: dealer.address || "",
        countryId: dealer.country_id || dealer.countryId || "",
        stateId: dealer.state_id || dealer.stateId || "",
        cityId: dealer.city_id || dealer.cityId || "",
        pincodeId: dealer.pincode_id || dealer.pincodeId || "",
        gstNumber: dealer.gst_number || dealer.gstNumber || "",
        panNumber: dealer.pan_number || dealer.panNumber || "",
        aadhaarNumber: dealer.aadhaar_number || dealer.aadhaarNumber || "",
        dealerType: dealer.dealer_type || dealer.dealerType || "retailer",
        commissionRate: parseFloat(dealer.commission_rate || dealer.commissionRate || 0),
        createdBy: dealer.created_by || dealer.createdBy || "",
        status: dealer.status || "active",
      });
      
      // Fetch dependent dropdowns for edit mode
      if (dealer.country_id || dealer.countryId) {
        fetchStates(dealer.country_id || dealer.countryId);
      }
      if (dealer.state_id || dealer.stateId) {
        fetchCities(dealer.state_id || dealer.stateId);
      }
      if (dealer.city_id || dealer.cityId) {
        fetchPincodes(dealer.city_id || dealer.cityId);
      }
    } else {
      resetForm();
    }
  }, [dealer, show]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      alternateMobile: "",
      address: "",
      countryId: "",
      stateId: "",
      cityId: "",
      pincodeId: "",
      gstNumber: "",
      panNumber: "",
      aadhaarNumber: "",
      dealerType: "retailer",
      commissionRate: 0,
      createdBy: "",
      status: "active",
    });
    setStates([]);
    setCities([]);
    setPincodes([]);
  };

  // Helper function to extract data from API response
  const extractDataFromResponse = (response) => {
    console.log("Extracting data from response:", response);
    
    // For pincodes API: { success: true, data: [...], timestamp: "..." }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      console.log("Case 1: response.data.data is array, length:", response.data.data.length);
      return response.data.data;
    }
    
    // For countries API: { success: true, data: { data: [...], pagination: {...} } }
    if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
      console.log("Case 2: response.data.data.data is array, length:", response.data.data.data.length);
      return response.data.data.data;
    }
    
    // Handle: { data: [...] }
    if (response?.data && Array.isArray(response.data)) {
      console.log("Case 3: response.data is array, length:", response.data.length);
      return response.data;
    }
    
    // Handle direct array
    if (Array.isArray(response)) {
      console.log("Case 4: response is array, length:", response.length);
      return response;
    }
    
    console.log("No matching case, returning empty array");
    return [];
  };

  // Fetch countries
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await countryApi.getAll();
      console.log("Countries API response:", response);
      
      const countriesData = extractDataFromResponse(response);
      console.log("Extracted countries:", countriesData);
      
      // Filter only active countries (status === 1)
      const activeCountries = countriesData.filter(country => country.status === 1);
      setCountries(activeCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setError("Failed to load countries");
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states by country ID
  const fetchStates = async (countryId) => {
    setLoadingStates(true);
    try {
      const response = await stateApi.getDropdown(countryId);
      console.log("States API response:", response);
      
      const statesData = extractDataFromResponse(response);
      console.log("Extracted states:", statesData);
      
      // Filter only active states if status field exists
      const activeStates = statesData.filter(state => state.status === undefined || state.status === 1);
      setStates(activeStates);
    } catch (error) {
      console.error("Error fetching states:", error);
      setError("Failed to load states");
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch cities by state ID
  const fetchCities = async (stateId) => {
    setLoadingCities(true);
    try {
      const response = await cityApi.getDropdown(stateId);
      console.log("Cities API response:", response);
      
      const citiesData = extractDataFromResponse(response);
      console.log("Extracted cities:", citiesData);
      
      // Filter only active cities if status field exists
      const activeCities = citiesData.filter(city => city.status === undefined || city.status === 1);
      setCities(activeCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setError("Failed to load cities");
    } finally {
      setLoadingCities(false);
    }
  };

  // Fetch pincodes by city ID
  const fetchPincodes = async (cityId) => {
    if (!cityId) {
      console.log("No cityId provided, skipping pincode fetch");
      return;
    }
    
    setLoadingPincodes(true);
    try {
      console.log("Fetching pincodes for cityId:", cityId);
      
      // Use getAll method with cityId parameter
      const response = await pincodeApi.getAll({ cityId });
      console.log("Pincodes API response:", response);
      
      const pincodesData = extractDataFromResponse(response);
      console.log("Extracted pincodes:", pincodesData);
      
      setPincodes(pincodesData);
      
      if (pincodesData.length === 0) {
        console.log("No pincodes found for this city");
      }
    } catch (error) {
      console.error("Error fetching pincodes:", error);
      setError("Failed to load pincodes");
    } finally {
      setLoadingPincodes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || formData.name.trim() === "") {
      setError("Dealer name is required");
      return;
    }
    if (!formData.mobile || formData.mobile.trim() === "") {
      setError("Mobile number is required");
      return;
    }
    if (!formData.email || formData.email.trim() === "") {
      setError("Email is required");
      return;
    }
    // Email format validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    // Mobile number validation (10 digits)
    if (!/^\d{10}$/.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      // Prepare payload - matching your required format
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        alternateMobile: formData.alternateMobile || null,
        address: formData.address || null,
        countryId: formData.countryId ? Number(formData.countryId) : null,
        stateId: formData.stateId ? Number(formData.stateId) : null,
        cityId: formData.cityId ? Number(formData.cityId) : null,
        pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,
        gstNumber: formData.gstNumber || null,
        panNumber: formData.panNumber || null,
        aadhaarNumber: formData.aadhaarNumber || null,
        dealerType: formData.dealerType,
        commissionRate: parseFloat(formData.commissionRate) || 0,
        createdBy: formData.createdBy ? Number(formData.createdBy) : null,
        status: formData.status,
      };

      console.log("📤 Sending dealer payload:", JSON.stringify(submitData, null, 2));
      await onSave(submitData);
      onHide();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.message || "Failed to save dealer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {dealer ? "Edit Dealer" : "Add New Dealer"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {error && <Alert variant="danger">{error}</Alert>}

          <h6 className="mb-3 text-primary">📋 Basic Information</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dealer Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter dealer name"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
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
            </Col>
          </Row>

          <h6 className="mb-3 text-primary">📞 Contact Information</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="dealer@example.com"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Mobile Number *</Form.Label>
                <Form.Control
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Alternate Mobile</Form.Label>
                <Form.Control
                  type="tel"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleChange}
                  placeholder="Alternate mobile number"
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="mb-3 text-primary">📍 Location Information</h6>
          
          {/* Country Dropdown */}
          <Row>
            <Col md={6}>
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
                    <Spinner animation="border" size="sm" /> Loading countries...
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            {/* State Dropdown */}
            <Col md={6}>
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
            </Col>
          </Row>

          <Row>
            {/* City Dropdown */}
            <Col md={6}>
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
            </Col>

            {/* Pincode Dropdown */}
            <Col md={6}>
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
                {!formData.cityId && formData.stateId && (
                  <Form.Text className="text-muted">
                    Please select a city first
                  </Form.Text>
                )}
                {formData.cityId && pincodes.length === 0 && !loadingPincodes && (
                  <Form.Text className="text-warning">
                    No pincodes found for this city
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Full Address */}
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

          <h6 className="mb-3 text-primary">📄 Tax Information</h6>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>GST Number</Form.Label>
                <Form.Control
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
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
                  name="panNumber"
                  value={formData.panNumber}
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
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="123456789012"
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="mb-3 text-primary">💰 Financial Information</h6>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Commission Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate}
                  onChange={handleChange}
                  placeholder="Enter commission rate"
                  min="0"
                  step="0.5"
                />
                <Form.Text className="text-muted">
                  Commission percentage for this dealer
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
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
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Dealer"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DealerModal;