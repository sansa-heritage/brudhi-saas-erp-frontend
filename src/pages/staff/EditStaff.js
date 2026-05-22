import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
  Tabs,
  Tab,
  Badge,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaArrowLeft,
  FaHome,
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
  const [loadingMasterData, setLoadingMasterData] = useState(false);
  const [errors, setErrors] = useState({});
  const [staff, setStaff] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Master data state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);

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
    country_id: "",
    state_id: "",
    city_id: "",
    pincode_id: "",
    status: "active",
    notes: "",
  });

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
    setLoadingMasterData(true);
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
      setLoadingMasterData(false);
    }
  };

  // Load states by country ID
  const loadStates = async (countryId) => {
    if (!countryId) return;
    setLoadingMasterData(true);
    try {
      const response = await stateApi.getAll(countryId);
      const statesData = extractDataFromResponse(response);
      setStates(statesData);
    } catch (error) {
      console.error("Failed to load states:", error);
      setStates([]);
    } finally {
      setLoadingMasterData(false);
    }
  };

  // Load cities by state ID
  const loadCities = async (stateId) => {
    if (!stateId) return;
    setLoadingMasterData(true);
    try {
      const response = await cityApi.getDropdown(stateId);
      const citiesData = extractDataFromResponse(response);
      setCities(citiesData);
    } catch (error) {
      console.error("Failed to load cities:", error);
      setCities([]);
    } finally {
      setLoadingMasterData(false);
    }
  };

  // Load pincodes by city ID
  const loadPincodes = async (cityId) => {
    if (!cityId) return;
    setLoadingMasterData(true);
    try {
      const response = await pincodeApi.getAll({ cityId });
      const pincodesData = extractDataFromResponse(response);
      setPincodes(pincodesData);
    } catch (error) {
      console.error("Failed to load pincodes:", error);
      setPincodes([]);
    } finally {
      setLoadingMasterData(false);
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

  // Load staff data
  useEffect(() => {
    const loadStaffData = async () => {
      setLoading(true);
      try {
        await loadCountries();
        await loadRoles();

        const data = await getStaffById(id);
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
            country_id: data.country_id || "",
            state_id: data.state_id || "",
            city_id: data.city_id || "",
            pincode_id: data.pincode_id || "",
            status: data.status || "active",
            notes: data.notes || "",
          });

          // Fetch dependent dropdowns for edit mode
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.designation) {
      newErrors.designation = "Designation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
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
        first_name: formData.first_name,
        last_name: formData.last_name || null,
        email: formData.email,
        phone: formData.phone,
        role_id: parseInt(formData.role_id),
        department: formData.department,
        designation: formData.designation,
        joining_date: formData.joining_date,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        address: formData.address || null,
        country_id: formData.country_id ? parseInt(formData.country_id) : null,
        state_id: formData.state_id ? parseInt(formData.state_id) : null,
        city_id: formData.city_id ? parseInt(formData.city_id) : null,
        pincode_id: formData.pincode_id ? parseInt(formData.pincode_id) : null,
        status: formData.status,
        notes: formData.notes || null,
      };

      console.log("Updating staff data:", submitData);
      await updateStaff(id, submitData);

      // ✅ SUCCESS TOAST MESSAGE
      toast.success(`✅ Staff "${formData.first_name} ${formData.last_name}" updated successfully! 🎉`, {
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
        navigate(`/staffs/view/${id}`);
      }, 1500);
    } catch (error) {
      console.error("Failed to update staff:", error);
      const errorMessage = error.response?.data?.message || "Failed to update staff member";
      
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

  const handleGoBack = () => {
    navigate(`/staffs/view/${id}`);
  };

  if (loading) {
    return (
      <Container fluid className="p-4" style={{ background: "#f8f9fa" }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3">Loading staff data...</h5>
        </div>
      </Container>
    );
  }

  if (!staff) {
    return (
      <Container fluid className="p-4" style={{ background: "#f8f9fa" }}>
        <Alert variant="secondary" className="text-center">
          <h4>Staff member not found</h4>
          <p>The staff member you're looking for doesn't exist.</p>
          <Button variant="secondary" onClick={() => navigate("/staffs")}>
            Back to Staff
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
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
            onClick={() => navigate(`/staffs/view/${id}`)}
            style={{ color: "#6c757d" }}
          >
            <FaArrowLeft className="me-2" /> Back to Staff Details
          </Button>
          <h2 className="fw-bold mb-1">Edit Staff Member</h2>
          <p className="text-muted">
            Update staff information for {staff.first_name} {staff.last_name}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Badge bg="secondary" className="p-2">
            {staff.status?.toUpperCase()}
          </Badge>
          <Badge bg="secondary" className="p-2">
            ID: {staff.id}
          </Badge>
          <Badge bg="secondary" className="p-2">
            Code: {staff.staff_code}
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

      <Form>
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
                        First Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        isInvalid={!!errors.first_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.first_name}
                      </Form.Control.Feedback>
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
                      <Form.Label>
                        Email <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="staff@company.com"
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
                        Phone Number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        isInvalid={!!errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mb-3 mt-4">
                  <FaBriefcase className="text-secondary me-2" /> Employment Details
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Designation <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g., Sales Manager"
                        isInvalid={!!errors.designation}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.designation}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
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

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
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
                        step="1000"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
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

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes about staff member..."
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
                  <FaMapMarkerAlt className="text-secondary me-2" /> Location Information
                </h5>

                {/* Country Dropdown */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Select
                        value={formData.country_id}
                        onChange={handleCountryChange}
                        disabled={loadingMasterData}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingMasterData && (
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
                        disabled={!formData.country_id || loadingMasterData}
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingMasterData && (
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
                        disabled={!formData.state_id || loadingMasterData}
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingMasterData && (
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
                        disabled={!formData.city_id || loadingMasterData}
                      >
                        <option value="">Select Pincode</option>
                        {pincodes.map((pincode) => (
                          <option key={pincode.id} value={pincode.id}>
                            {pincode.code}{" "}
                            {pincode.area ? `- ${pincode.area}` : ""}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingMasterData && (
                        <Spinner animation="border" size="sm" />
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={8}>
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
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Form Actions */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button variant="secondary" onClick={handleSubmit} disabled={saving}>
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

      <style>{`
        .rounded-4 {
          border-radius: 1rem !important;
        }
      `}</style>
    </Container>
  );
};

export default EditStaff;