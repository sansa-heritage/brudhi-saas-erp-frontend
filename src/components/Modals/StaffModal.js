import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaRupeeSign,
  FaCalendarAlt,
  FaBuilding,
  FaCreditCard,
  FaUserShield,
  FaMapMarkerAlt,
  FaSave,
  FaTimes,
  FaCity,
  FaGlobe,
  FaMapPin,
  FaIdCard,
  FaUserTag,
} from "react-icons/fa";
import { createStaff, updateStaff, getRoles } from "../../services/staffService";
import { countryApi, stateApi, cityApi, pincodeApi } from "../../api/superadmin/masterData.api";

const StaffModal = ({ show, onHide, staff, onSuccess }) => {
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

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
    landmark: "",
    country_id: "",
    state_id: "",
    city_id: "",
    pincode_id: "",
    status: "active",
    notes: "",
  });

  // Fetch countries on modal open
  useEffect(() => {
    if (show) {
      fetchCountries();
      loadRoles();
    }
  }, [show]);

  // Fetch states when country changes
  useEffect(() => {
    if (formData.country_id) {
      fetchStates(formData.country_id);
      setFormData(prev => ({ ...prev, state_id: "", city_id: "", pincode_id: "" }));
      setCities([]);
      setPincodes([]);
    } else {
      setStates([]);
      setCities([]);
      setPincodes([]);
    }
  }, [formData.country_id]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state_id) {
      fetchCities(formData.state_id);
      setFormData(prev => ({ ...prev, city_id: "", pincode_id: "" }));
      setPincodes([]);
    } else {
      setCities([]);
      setPincodes([]);
    }
  }, [formData.state_id]);

  // Fetch pincodes when city changes
  useEffect(() => {
    if (formData.city_id) {
      fetchPincodes(formData.city_id);
      setFormData(prev => ({ ...prev, pincode_id: "" }));
    } else {
      setPincodes([]);
    }
  }, [formData.city_id]);

  // Load staff data for edit mode
  useEffect(() => {
    if (staff && show) {
      setFormData({
        first_name: staff.first_name || "",
        last_name: staff.last_name || "",
        email: staff.email || "",
        password: "",
        phone: staff.phone || "",
        role_id: staff.role_id || "2",
        department: staff.department || "Sales",
        designation: staff.designation || "",
        joining_date: staff.joining_date ? staff.joining_date.split("T")[0] : new Date().toISOString().split("T")[0],
        salary: staff.salary || "",
        address: staff.address || "",
        landmark: staff.landmark || "",
        country_id: staff.country_id || "",
        state_id: staff.state_id || "",
        city_id: staff.city_id || "",
        pincode_id: staff.pincode_id || "",
        status: staff.status || "active",
        notes: staff.notes || "",
      });

      // Fetch dependent dropdowns for edit mode
      if (staff.country_id) {
        fetchStates(staff.country_id);
      }
      if (staff.state_id) {
        fetchCities(staff.state_id);
      }
      if (staff.city_id) {
        fetchPincodes(staff.city_id);
      }
    } else {
      resetForm();
    }
  }, [staff, show]);

  const loadRoles = async () => {
    try {
      const rolesData = await getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  const resetForm = () => {
    setFormData({
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
      landmark: "",
      country_id: "",
      state_id: "",
      city_id: "",
      pincode_id: "",
      status: "active",
      notes: "",
    });
    setError("");
    setActiveTab("personal");
    setStates([]);
    setCities([]);
    setPincodes([]);
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
      const response = await stateApi.getAll(countryId);
      const statesData = extractDataFromResponse(response);
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
      const response = await cityApi.getAll();
      const citiesData = extractDataFromResponse(response);
      const filteredCities = citiesData.filter(city => city.state_id === parseInt(stateId));
      const activeCities = filteredCities.filter(city => city.status === undefined || city.status === 1);
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
    if (!cityId) return;
    setLoadingPincodes(true);
    try {
      const response = await pincodeApi.getAll();
      const pincodesData = extractDataFromResponse(response);
      const filteredPincodes = pincodesData.filter(pincode => pincode.city_id === parseInt(cityId));
      setPincodes(filteredPincodes);
    } catch (error) {
      console.error("Error fetching pincodes:", error);
      setError("Failed to load pincodes");
    } finally {
      setLoadingPincodes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password && !staff) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.designation) newErrors.designation = "Designation is required";
    
    setError(Object.values(newErrors)[0] || "");
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setError("");

    try {
      const submitData = {
        first_name: formData.first_name,
        last_name: formData.last_name || null,
        email: formData.email,
        phone: formData.phone,
        role_id: parseInt(formData.role_id),
        department: formData.department,
        designation: formData.designation,
        joining_date: formData.joining_date,
        address: formData.address || null,
        landmark: formData.landmark || null,
        country_id: formData.country_id ? parseInt(formData.country_id) : null,
        state_id: formData.state_id ? parseInt(formData.state_id) : null,
        city_id: formData.city_id ? parseInt(formData.city_id) : null,
        pincode_id: formData.pincode_id ? parseInt(formData.pincode_id) : null,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (formData.password) {
        submitData.password = formData.password;
      }

      if (staff) {
        await updateStaff(staff.id, submitData);
      } else {
        await createStaff(submitData);
      }

      if (onSuccess) {
        await onSuccess();
      }
      onHide();
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.message || "Failed to save staff member");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === parseInt(roleId));
    return role ? role.name : "Select Role";
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white rounded-top-3 border-0">
        <Modal.Title className="fw-bold">
          <FaUser className="me-2" />
          {staff ? "Edit Staff Member" : "Add New Staff Member"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {error && <Alert variant="danger">{error}</Alert>}

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3 border-0">
          {/* Personal Information Tab */}
          <Tab eventKey="personal" title="Personal Info">
            <div className="mt-3">
              <h6 className="mb-3 text-primary fw-bold">
                <FaUser className="me-2" /> Basic Information
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
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
                      onChange={handleChange}
                      placeholder="Enter last name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="staff@company.com"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {!staff && (
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password (min 6 characters)"
                  />
                  <Form.Text className="text-muted">Minimum 6 characters</Form.Text>
                </Form.Group>
              )}

              <h6 className="mb-3 mt-4 text-primary fw-bold">
                <FaBriefcase className="me-2" /> Employment Details
              </h6>

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
                    <Form.Select name="department" value={formData.department} onChange={handleChange}>
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
                    <Form.Select name="role_id" value={formData.role_id} onChange={handleChange}>
                      <option value="">Select Role</option>
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
                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Tab>

          {/* Address Tab */}
          <Tab eventKey="address" title="Address">
            <div className="mt-3">
              <h6 className="mb-3 text-primary fw-bold">
                <FaMapMarkerAlt className="me-2" /> Address Information
              </h6>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
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

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaGlobe className="me-1" /> Country
                    </Form.Label>
                    <Form.Select
                      name="country_id"
                      value={formData.country_id}
                      onChange={handleChange}
                      disabled={loadingCountries}
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingCountries && <Spinner animation="border" size="sm" />}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaMapPin className="me-1" /> State
                    </Form.Label>
                    <Form.Select
                      name="state_id"
                      value={formData.state_id}
                      onChange={handleChange}
                      disabled={!formData.country_id || loadingStates}
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingStates && <Spinner animation="border" size="sm" />}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaCity className="me-1" /> City
                    </Form.Label>
                    <Form.Select
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleChange}
                      disabled={!formData.state_id || loadingCities}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </Form.Select>
                    {loadingCities && <Spinner animation="border" size="sm" />}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaMapMarkerAlt className="me-1" /> Pincode
                    </Form.Label>
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
                    {loadingPincodes && <Spinner animation="border" size="sm" />}
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Tab>

          {/* Notes Tab */}
          <Tab eventKey="notes" title="Notes">
            <div className="mt-3">
              <h6 className="mb-3 text-primary fw-bold">
                <FaUserShield className="me-2" /> Additional Information
              </h6>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes about the staff member..."
                />
              </Form.Group>

              {staff && (
                <Alert variant="info" className="mt-3">
                  <small>
                    <strong>Staff Code:</strong> {staff.staff_code}<br />
                    <strong>Created:</strong> {new Date(staff.created_at).toLocaleString()}
                  </small>
                </Alert>
              )}
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer className="bg-light rounded-bottom-3 border-0">
        <Button variant="secondary" onClick={handleClose} disabled={saving} className="rounded-pill px-4">
          <FaTimes className="me-2" /> Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={saving} className="rounded-pill px-4">
          {saving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <FaSave className="me-2" />
              {staff ? "Update Staff" : "Save Staff"}
            </>
          )}
        </Button>
      </Modal.Footer>

      <style>{`
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
        .rounded-top-3 {
          border-radius: 0.75rem 0.75rem 0 0 !important;
        }
        .rounded-bottom-3 {
          border-radius: 0 0 0.75rem 0.75rem !important;
        }
      `}</style>
    </Modal>
  );
};

export default StaffModal;