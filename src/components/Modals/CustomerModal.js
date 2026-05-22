// // frontend/src/components/Modals/CustomerModal.jsx
// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
// import { countryApi, stateApi, cityApi, pincodeApi } from "../../api/superadmin/masterData.api";

// const CustomerModal = ({ show, onHide, customer, onSave }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     alternateMobile: "",
//     address: "",
//     landmark: "",
//     countryId: "",
//     stateId: "",
//     cityId: "",
//     pincodeId: "",
//     gstNumber: "",
//     panNumber: "",
//     aadhaarNumber: "",
//     customerType: "regular",
//     creditLimit: 0,
//     createdBy: "",
//     status: "active",
//   });

//   // Location data states
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [pincodes, setPincodes] = useState([]);

//   // Loading states
//   const [loadingCountries, setLoadingCountries] = useState(false);
//   const [loadingStates, setLoadingStates] = useState(false);
//   const [loadingCities, setLoadingCities] = useState(false);
//   const [loadingPincodes, setLoadingPincodes] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Fetch countries on modal open
//   useEffect(() => {
//     if (show) {
//       fetchCountries();
//     }
//   }, [show]);

//   // Fetch states when country changes
//   useEffect(() => {
//     if (formData.countryId) {
//       fetchStates(formData.countryId);
//       // Reset dependent fields
//       setFormData(prev => ({ ...prev, stateId: "", cityId: "", pincodeId: "" }));
//       setCities([]);
//       setPincodes([]);
//     } else {
//       setStates([]);
//       setCities([]);
//       setPincodes([]);
//     }
//   }, [formData.countryId]);

//   // Fetch cities when state changes
//   useEffect(() => {
//     if (formData.stateId) {
//       fetchCities(formData.stateId);
//       setFormData(prev => ({ ...prev, cityId: "", pincodeId: "" }));
//       setPincodes([]);
//     } else {
//       setCities([]);
//       setPincodes([]);
//     }
//   }, [formData.stateId]);

//   // ✅ FIXED: Fetch pincodes when city changes
//   useEffect(() => {
//     if (formData.cityId) {
//       console.log("City selected, fetching pincodes for cityId:", formData.cityId);
//       fetchPincodes(formData.cityId);
//       setFormData(prev => ({ ...prev, pincodeId: "" }));
//     } else {
//       setPincodes([]);
//     }
//   }, [formData.cityId]);

//   // Load customer data for edit
//   useEffect(() => {
//     if (customer) {
//       setFormData({
//         name: customer.name || "",
//         email: customer.email || "",
//         mobile: customer.mobile || "",
//         alternateMobile: customer.alternate_mobile || customer.alternateMobile || "",
//         address: customer.address || "",
//         landmark: customer.landmark || "",
//         countryId: customer.country_id || customer.countryId || "",
//         stateId: customer.state_id || customer.stateId || "",
//         cityId: customer.city_id || customer.cityId || "",
//         pincodeId: customer.pincode_id || customer.pincodeId || "",
//         gstNumber: customer.gst_number || customer.gstNumber || "",
//         panNumber: customer.pan_number || customer.panNumber || "",
//         aadhaarNumber: customer.aadhaar_number || customer.aadhaarNumber || "",
//         customerType: customer.customer_type || customer.customerType || "regular",
//         creditLimit: parseFloat(customer.credit_limit || customer.creditLimit || 0),
//         createdBy: customer.created_by || customer.createdBy || "",
//         status: customer.status || "active",
//       });

//       // Fetch dependent dropdowns for edit mode
//       if (customer.country_id || customer.countryId) {
//         fetchStates(customer.country_id || customer.countryId);
//       }
//       if (customer.state_id || customer.stateId) {
//         fetchCities(customer.state_id || customer.stateId);
//       }
//       if (customer.city_id || customer.cityId) {
//         fetchPincodes(customer.city_id || customer.cityId);
//       }
//     }
//   }, [customer, show]);

//   // Helper function to extract data from API response
//   const extractDataFromResponse = (response) => {
//     console.log("Extracting data from response:", response);

//     // For pincodes API: { success: true, data: [...], timestamp: "..." }
//     if (response?.data?.data && Array.isArray(response.data.data)) {
//       console.log("Case 1: response.data.data is array, length:", response.data.data.length);
//       return response.data.data;
//     }

//     // For countries API: { success: true, data: { data: [...], pagination: {...} } }
//     if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
//       console.log("Case 2: response.data.data.data is array, length:", response.data.data.data.length);
//       return response.data.data.data;
//     }

//     // Handle: { data: [...] }
//     if (response?.data && Array.isArray(response.data)) {
//       console.log("Case 3: response.data is array, length:", response.data.length);
//       return response.data;
//     }

//     // Handle direct array
//     if (Array.isArray(response)) {
//       console.log("Case 4: response is array, length:", response.length);
//       return response;
//     }

//     console.log("No matching case, returning empty array");
//     return [];
//   };

//   // Fetch countries
//   const fetchCountries = async () => {
//     setLoadingCountries(true);
//     try {
//       const response = await countryApi.getAll();
//       console.log("Countries API response:", response);

//       const countriesData = extractDataFromResponse(response);
//       console.log("Extracted countries:", countriesData);

//       // Filter only active countries (status === 1)
//       const activeCountries = countriesData.filter(country => country.status === 1);
//       setCountries(activeCountries);
//     } catch (error) {
//       console.error("Error fetching countries:", error);
//       setError("Failed to load countries");
//     } finally {
//       setLoadingCountries(false);
//     }
//   };

//   // Fetch states by country ID
//   const fetchStates = async (countryId) => {
//     setLoadingStates(true);
//     try {
//       const response = await stateApi.getDropdown(countryId);
//       console.log("States API response:", response);

//       const statesData = extractDataFromResponse(response);
//       console.log("Extracted states:", statesData);

//       // Filter only active states if status field exists
//       const activeStates = statesData.filter(state => state.status === undefined || state.status === 1);
//       setStates(activeStates);
//     } catch (error) {
//       console.error("Error fetching states:", error);
//       setError("Failed to load states");
//     } finally {
//       setLoadingStates(false);
//     }
//   };

//   // Fetch cities by state ID
//   const fetchCities = async (stateId) => {
//     setLoadingCities(true);
//     try {
//       const response = await cityApi.getDropdown(stateId);
//       console.log("Cities API response:", response);

//       const citiesData = extractDataFromResponse(response);
//       console.log("Extracted cities:", citiesData);

//       // Filter only active cities if status field exists
//       const activeCities = citiesData.filter(city => city.status === undefined || city.status === 1);
//       setCities(activeCities);
//     } catch (error) {
//       console.error("Error fetching cities:", error);
//       setError("Failed to load cities");
//     } finally {
//       setLoadingCities(false);
//     }
//   };

//   // ✅ FIXED: Fetch pincodes by city ID
//   const fetchPincodes = async (cityId) => {
//     if (!cityId) {
//       console.log("No cityId provided, skipping pincode fetch");
//       return;
//     }

//     setLoadingPincodes(true);
//     try {
//       console.log("Fetching pincodes for cityId:", cityId);

//       // Use getAll method with cityId parameter
//       const response = await pincodeApi.getAll({ cityId });
//       console.log("Pincodes API response:", response);

//       const pincodesData = extractDataFromResponse(response);
//       console.log("Extracted pincodes:", pincodesData);

//       setPincodes(pincodesData);

//       if (pincodesData.length === 0) {
//         console.log("No pincodes found for this city");
//       }
//     } catch (error) {
//       console.error("Error fetching pincodes:", error);
//       setError("Failed to load pincodes");
//     } finally {
//       setLoadingPincodes(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     console.log(`Field changed: ${name} = ${value}`);
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Validation
//     if (!formData.name || formData.name.trim() === "") {
//       setError("Customer name is required");
//       return;
//     }
//     if (!formData.mobile || formData.mobile.trim() === "") {
//       setError("Mobile number is required");
//       return;
//     }
//     if (!formData.email || formData.email.trim() === "") {
//       setError("Email is required");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Prepare payload - using camelCase as your backend accepts
//       const submitData = {
//         name: formData.name.trim(),
//         email: formData.email.trim(),
//         mobile: formData.mobile.trim(),
//         alternateMobile: formData.alternateMobile || null,
//         address: formData.address || null,
//         landmark: formData.landmark || null,
//         countryId: formData.countryId ? Number(formData.countryId) : null,
//         stateId: formData.stateId ? Number(formData.stateId) : null,
//         cityId: formData.cityId ? Number(formData.cityId) : null,
//         pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,
//         gstNumber: formData.gstNumber || null,
//         panNumber: formData.panNumber || null,
//         aadhaarNumber: formData.aadhaarNumber || null,
//         customerType: formData.customerType,
//         creditLimit: Number(formData.creditLimit) || 0,
//         createdBy: formData.createdBy ? Number(formData.createdBy) : null,
//         status: formData.status,
//       };

//       console.log("📤 Sending payload:", JSON.stringify(submitData, null, 2));
//       await onSave(submitData);
//       onHide();
//     } catch (err) {
//       console.error("Save error:", err);
//       setError(err.response?.data?.message || "Failed to save customer");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide} size="lg" centered>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {customer ? "Edit Customer" : "Add New Customer"}
//         </Modal.Title>
//       </Modal.Header>
//       <Form onSubmit={handleSubmit}>
//         <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
//           {error && <Alert variant="danger">{error}</Alert>}

//           <h6 className="mb-3 text-primary">📋 Basic Information</h6>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Customer Name *</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Enter customer name"
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Customer Type</Form.Label>
//                 <Form.Select
//                   name="customerType"
//                   value={formData.customerType}
//                   onChange={handleChange}
//                 >
//                   <option value="regular">Regular</option>
//                   <option value="wholesale">Wholesale</option>
//                   <option value="premium">Premium</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary">📞 Contact Information</h6>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Email *</Form.Label>
//                 <Form.Control
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="customer@example.com"
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Mobile Number *</Form.Label>
//                 <Form.Control
//                   type="tel"
//                   name="mobile"
//                   value={formData.mobile}
//                   onChange={handleChange}
//                   placeholder="9876543210"
//                   required
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Alternate Mobile</Form.Label>
//                 <Form.Control
//                   type="tel"
//                   name="alternateMobile"
//                   value={formData.alternateMobile}
//                   onChange={handleChange}
//                   placeholder="Alternate mobile number"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary">📍 Location Information</h6>

//           {/* Country Dropdown */}
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Country</Form.Label>
//                 <Form.Select
//                   name="countryId"
//                   value={formData.countryId}
//                   onChange={handleChange}
//                   disabled={loadingCountries}
//                 >
//                   <option value="">Select Country</option>
//                   {countries.map((country) => (
//                     <option key={country.id} value={country.id}>
//                       {country.name} {country.code ? `(${country.code})` : ""}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {loadingCountries && (
//                   <Form.Text className="text-muted">
//                     <Spinner animation="border" size="sm" /> Loading countries...
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>

//             {/* State Dropdown */}
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>State</Form.Label>
//                 <Form.Select
//                   name="stateId"
//                   value={formData.stateId}
//                   onChange={handleChange}
//                   disabled={!formData.countryId || loadingStates}
//                 >
//                   <option value="">Select State</option>
//                   {states.map((state) => (
//                     <option key={state.id} value={state.id}>
//                       {state.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {loadingStates && (
//                   <Form.Text className="text-muted">
//                     <Spinner animation="border" size="sm" /> Loading states...
//                   </Form.Text>
//                 )}
//                 {!formData.countryId && (
//                   <Form.Text className="text-muted">
//                     Please select a country first
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             {/* City Dropdown */}
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>City</Form.Label>
//                 <Form.Select
//                   name="cityId"
//                   value={formData.cityId}
//                   onChange={handleChange}
//                   disabled={!formData.stateId || loadingCities}
//                 >
//                   <option value="">Select City</option>
//                   {cities.map((city) => (
//                     <option key={city.id} value={city.id}>
//                       {city.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {loadingCities && (
//                   <Form.Text className="text-muted">
//                     <Spinner animation="border" size="sm" /> Loading cities...
//                   </Form.Text>
//                 )}
//                 {!formData.stateId && formData.countryId && (
//                   <Form.Text className="text-muted">
//                     Please select a state first
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>

//             {/* Pincode Dropdown - FIXED */}
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Pincode</Form.Label>
//                 <Form.Select
//                   name="pincodeId"
//                   value={formData.pincodeId}
//                   onChange={handleChange}
//                   disabled={!formData.cityId || loadingPincodes}
//                 >
//                   <option value="">Select Pincode</option>
//                   {pincodes.map((pincode) => (
//                     <option key={pincode.id} value={pincode.id}>
//                       {pincode.code} {pincode.area ? `- ${pincode.area}` : ""}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {loadingPincodes && (
//                   <Form.Text className="text-muted">
//                     <Spinner animation="border" size="sm" /> Loading pincodes...
//                   </Form.Text>
//                 )}
//                 {!formData.cityId && formData.stateId && (
//                   <Form.Text className="text-muted">
//                     Please select a city first
//                   </Form.Text>
//                 )}
//                 {formData.cityId && pincodes.length === 0 && !loadingPincodes && (
//                   <Form.Text className="text-warning">
//                     No pincodes found for this city
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>
//           </Row>

//           {/* Full Address */}
//           <Row>
//             <Col md={8}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Full Address</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="address"
//                   value={formData.address}
//                   onChange={handleChange}
//                   placeholder="Street address, building name, etc."
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Landmark</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="landmark"
//                   value={formData.landmark}
//                   onChange={handleChange}
//                   placeholder="Near landmark"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary">📄 Tax Information</h6>
//           <Row>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>GST Number</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="gstNumber"
//                   value={formData.gstNumber}
//                   onChange={handleChange}
//                   placeholder="22ABCDE1234F1Z5"
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>PAN Number</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="panNumber"
//                   value={formData.panNumber}
//                   onChange={handleChange}
//                   placeholder="ABCDE1234F"
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Aadhaar Number</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="aadhaarNumber"
//                   value={formData.aadhaarNumber}
//                   onChange={handleChange}
//                   placeholder="123456789012"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary">💰 Financial Information</h6>
//           <Row>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Credit Limit (₹)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="creditLimit"
//                   value={formData.creditLimit}
//                   onChange={handleChange}
//                   placeholder="Enter credit limit"
//                   min="0"
//                   step="1000"
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Created By (User ID)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="createdBy"
//                   value={formData.createdBy}
//                   onChange={handleChange}
//                   placeholder="e.g., 4"
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Status</Form.Label>
//                 <Form.Select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                 >
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                   <option value="suspended">Suspended</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={onHide} disabled={loading}>
//             Cancel
//           </Button>
//           <Button variant="primary" type="submit" disabled={loading}>
//             {loading ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" />
//                 Saving...
//               </>
//             ) : (
//               "Save Customer"
//             )}
//           </Button>
//         </Modal.Footer>
//       </Form>
//     </Modal>
//   );
// };

// export default CustomerModal;

// frontend/src/components/Modals/CustomerModal.jsx
// frontend/src/components/Modals/CustomerModal.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Button,
//   Form,
//   Row,
//   Col,
//   Alert,
//   Spinner,
//   OverlayTrigger,
//   Tooltip,
// } from "react-bootstrap";
// import {
//   FaCheckCircle,
//   FaExclamationTriangle,
//   FaInfoCircle,
// } from "react-icons/fa";
// import {
//   countryApi,
//   stateApi,
//   cityApi,
//   pincodeApi,
// } from "../../api/superadmin/masterData.api";

// const CustomerModal = ({ show, onHide, customer, onSave }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     alternateMobile: "",
//     address: "",
//     landmark: "",
//     countryId: "",
//     stateId: "",
//     cityId: "",
//     pincodeId: "",
//     gstNumber: "",
//     panNumber: "",
//     aadhaarNumber: "",
//     customerType: "regular",
//     creditLimit: 0,
//     createdBy: "",
//     status: "active",
//   });

//   // Validation errors state
//   const [validationErrors, setValidationErrors] = useState({
//     email: "",
//     mobile: "",
//     alternateMobile: "",
//     gstNumber: "",
//     panNumber: "",
//     aadhaarNumber: "",
//   });

//   // Location data states
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [pincodes, setPincodes] = useState([]);

//   // Loading states
//   const [loadingCountries, setLoadingCountries] = useState(false);
//   const [loadingStates, setLoadingStates] = useState(false);
//   const [loadingCities, setLoadingCities] = useState(false);
//   const [loadingPincodes, setLoadingPincodes] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Validation functions
//   const validateEmail = (email) => {
//     if (!email) return { isValid: true, message: "" };
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (emailRegex.test(email)) {
//       return { isValid: true, message: "" };
//     }
//     return { isValid: false, message: "Invalid email format" };
//   };

//   const validateMobile = (mobile) => {
//     if (!mobile) return { isValid: true, message: "" };
//     const mobileRegex = /^[6-9]\d{9}$/;
//     if (mobileRegex.test(mobile)) {
//       return { isValid: true, message: "" };
//     }
//     return {
//       isValid: false,
//       message: "Mobile number must be 10 digits starting with 6-9",
//     };
//   };

//   const validateGST = (gstNumber) => {
//     if (!gstNumber) return { isValid: true, message: "" };
//     const gstRegex =
//       /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
//     if (gstRegex.test(gstNumber.toUpperCase())) {
//       return { isValid: true, message: "" };
//     }
//     return {
//       isValid: false,
//       message: "Invalid GST format (e.g., 22ABCDE1234F1Z5)",
//     };
//   };

//   const validatePAN = (panNumber) => {
//     if (!panNumber) return { isValid: true, message: "" };
//     const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//     if (panRegex.test(panNumber.toUpperCase())) {
//       return { isValid: true, message: "" };
//     }
//     return { isValid: false, message: "Invalid PAN format (e.g., ABCDE1234F)" };
//   };

//   const validateAadhaar = (aadhaarNumber) => {
//     if (!aadhaarNumber) return { isValid: true, message: "" };
//     const cleanNumber = aadhaarNumber.toString().replace(/\s/g, "");
//     const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
//     if (aadhaarRegex.test(cleanNumber)) {
//       return { isValid: true, message: "" };
//     }
//     return {
//       isValid: false,
//       message: "Aadhaar must be 12 digits starting with 2-9",
//     };
//   };

//   // Mobile number handler with restrictions
//   const handleMobileChange = (e) => {
//     let value = e.target.value;
//     // Remove any non-digit characters
//     value = value.replace(/\D/g, "");
//     // Limit to 10 digits
//     if (value.length > 10) {
//       value = value.slice(0, 10);
//     }
//     setFormData((prev) => ({ ...prev, mobile: value }));

//     if (value.length === 10) {
//       const validation = validateMobile(value);
//       setValidationErrors((prev) => ({
//         ...prev,
//         mobile: validation.isValid ? "" : validation.message,
//       }));
//     } else if (value.length > 0) {
//       setValidationErrors((prev) => ({
//         ...prev,
//         mobile: "Mobile number must be 10 digits",
//       }));
//     } else {
//       setValidationErrors((prev) => ({ ...prev, mobile: "" }));
//     }
//   };

//   // Alternate mobile handler with restrictions
//   const handleAlternateMobileChange = (e) => {
//     let value = e.target.value;
//     value = value.replace(/\D/g, "");
//     if (value.length > 10) {
//       value = value.slice(0, 10);
//     }
//     setFormData((prev) => ({ ...prev, alternateMobile: value }));

//     if (value.length === 10) {
//       const validation = validateMobile(value);
//       setValidationErrors((prev) => ({
//         ...prev,
//         alternateMobile: validation.isValid ? "" : validation.message,
//       }));
//     } else if (value.length > 0) {
//       setValidationErrors((prev) => ({
//         ...prev,
//         alternateMobile: "Mobile number must be 10 digits",
//       }));
//     } else {
//       setValidationErrors((prev) => ({ ...prev, alternateMobile: "" }));
//     }
//   };

//   // Aadhaar handler with restrictions (12 digits only)
//   const handleAadhaarChange = (e) => {
//     let value = e.target.value.replace(/\D/g, "");
//     if (value.length > 12) {
//       value = value.slice(0, 12);
//     }
//     // Format with spaces for better readability
//     let formattedValue = value;
//     if (value.length > 4) {
//       formattedValue = value.slice(0, 4) + " " + value.slice(4);
//     }
//     if (value.length > 8) {
//       formattedValue =
//         value.slice(0, 4) + " " + value.slice(4, 8) + " " + value.slice(8);
//     }
//     setFormData((prev) => ({ ...prev, aadhaarNumber: value }));

//     if (value.length === 12) {
//       const validation = validateAadhaar(value);
//       setValidationErrors((prev) => ({
//         ...prev,
//         aadhaarNumber: validation.isValid ? "" : validation.message,
//       }));
//     } else if (value.length > 0) {
//       setValidationErrors((prev) => ({
//         ...prev,
//         aadhaarNumber: "Aadhaar must be 12 digits",
//       }));
//     } else {
//       setValidationErrors((prev) => ({ ...prev, aadhaarNumber: "" }));
//     }
//   };

//   const handleEmailChange = (e) => {
//     const value = e.target.value;
//     setFormData((prev) => ({ ...prev, email: value }));
//     const validation = validateEmail(value);
//     setValidationErrors((prev) => ({
//       ...prev,
//       email: validation.isValid ? "" : validation.message,
//     }));
//   };

//   const handleGSTChange = (e) => {
//     let value = e.target.value.toUpperCase();
//     // GST is 15 characters, restrict length
//     if (value.length > 15) {
//       value = value.slice(0, 15);
//     }
//     setFormData((prev) => ({ ...prev, gstNumber: value }));
//     if (value.length === 15) {
//       const validation = validateGST(value);
//       setValidationErrors((prev) => ({
//         ...prev,
//         gstNumber: validation.isValid ? "" : validation.message,
//       }));
//     } else if (value.length > 0) {
//       setValidationErrors((prev) => ({
//         ...prev,
//         gstNumber: "GST must be 15 characters",
//       }));
//     } else {
//       setValidationErrors((prev) => ({ ...prev, gstNumber: "" }));
//     }
//   };

//   const handlePANChange = (e) => {
//     let value = e.target.value.toUpperCase();
//     if (value.length > 10) {
//       value = value.slice(0, 10);
//     }
//     setFormData((prev) => ({ ...prev, panNumber: value }));
//     if (value.length === 10) {
//       const validation = validatePAN(value);
//       setValidationErrors((prev) => ({
//         ...prev,
//         panNumber: validation.isValid ? "" : validation.message,
//       }));
//     } else if (value.length > 0) {
//       setValidationErrors((prev) => ({
//         ...prev,
//         panNumber: "PAN must be 10 characters",
//       }));
//     } else {
//       setValidationErrors((prev) => ({ ...prev, panNumber: "" }));
//     }
//   };

//   // Get validation icon
//   const getValidationIcon = (fieldValue, validationError) => {
//     if (!fieldValue) {
//       return <FaInfoCircle className="text-secondary ms-1" size={14} />;
//     }
//     if (!validationError) {
//       return <FaCheckCircle className="text-success ms-1" size={14} />;
//     }
//     return (
//       <OverlayTrigger
//         placement="top"
//         overlay={
//           <Tooltip id={`tooltip-${fieldValue}`}>{validationError}</Tooltip>
//         }
//       >
//         <FaExclamationTriangle
//           className="text-danger ms-1"
//           size={14}
//           style={{ cursor: "pointer" }}
//         />
//       </OverlayTrigger>
//     );
//   };

//   // Format Aadhaar for display
//   const getFormattedAadhaar = () => {
//     const value = formData.aadhaarNumber;
//     if (!value) return "";
//     if (value.length > 8) {
//       return value.slice(0, 4) + " " + value.slice(4, 8) + " " + value.slice(8);
//     }
//     if (value.length > 4) {
//       return value.slice(0, 4) + " " + value.slice(4);
//     }
//     return value;
//   };

//   // Fetch countries on modal open
//   useEffect(() => {
//     if (show) {
//       fetchCountries();
//     }
//   }, [show]);

//   // Fetch states when country changes
//   useEffect(() => {
//     if (formData.countryId) {
//       fetchStates(formData.countryId);
//       setFormData((prev) => ({
//         ...prev,
//         stateId: "",
//         cityId: "",
//         pincodeId: "",
//       }));
//       setCities([]);
//       setPincodes([]);
//     } else {
//       setStates([]);
//       setCities([]);
//       setPincodes([]);
//     }
//   }, [formData.countryId]);

//   // Fetch cities when state changes
//   useEffect(() => {
//     if (formData.stateId) {
//       fetchCities(formData.stateId);
//       setFormData((prev) => ({ ...prev, cityId: "", pincodeId: "" }));
//       setPincodes([]);
//     } else {
//       setCities([]);
//       setPincodes([]);
//     }
//   }, [formData.stateId]);

//   // Fetch pincodes when city changes
//   useEffect(() => {
//     if (formData.cityId) {
//       fetchPincodes(formData.cityId);
//       setFormData((prev) => ({ ...prev, pincodeId: "" }));
//     } else {
//       setPincodes([]);
//     }
//   }, [formData.cityId]);

//   // Load customer data for edit
//   useEffect(() => {
//     if (customer) {
//       setFormData({
//         name: customer.name || "",
//         email: customer.email || "",
//         mobile: customer.mobile || "",
//         alternateMobile:
//           customer.alternate_mobile || customer.alternateMobile || "",
//         address: customer.address || "",
//         landmark: customer.landmark || "",
//         countryId: customer.country_id || customer.countryId || "",
//         stateId: customer.state_id || customer.stateId || "",
//         cityId: customer.city_id || customer.cityId || "",
//         pincodeId: customer.pincode_id || customer.pincodeId || "",
//         gstNumber: customer.gst_number || customer.gstNumber || "",
//         panNumber: customer.pan_number || customer.panNumber || "",
//         aadhaarNumber: customer.aadhaar_number || customer.aadhaarNumber || "",
//         customerType:
//           customer.customer_type || customer.customerType || "regular",
//         creditLimit: parseFloat(
//           customer.credit_limit || customer.creditLimit || 0,
//         ),
//         createdBy: customer.created_by || customer.createdBy || "",
//         status: customer.status || "active",
//       });

//       setValidationErrors({
//         email: validateEmail(customer.email).isValid
//           ? ""
//           : validateEmail(customer.email).message,
//         mobile:
//           customer.mobile && customer.mobile.length === 10
//             ? validateMobile(customer.mobile).isValid
//               ? ""
//               : validateMobile(customer.mobile).message
//             : "",
//         alternateMobile:
//           customer.alternate_mobile && customer.alternate_mobile.length === 10
//             ? validateMobile(customer.alternate_mobile).isValid
//               ? ""
//               : validateMobile(customer.alternate_mobile).message
//             : "",
//         gstNumber:
//           customer.gst_number && customer.gst_number.length === 15
//             ? validateGST(customer.gst_number).isValid
//               ? ""
//               : validateGST(customer.gst_number).message
//             : "",
//         panNumber:
//           customer.pan_number && customer.pan_number.length === 10
//             ? validatePAN(customer.pan_number).isValid
//               ? ""
//               : validatePAN(customer.pan_number).message
//             : "",
//         aadhaarNumber:
//           customer.aadhaar_number && customer.aadhaar_number.length === 12
//             ? validateAadhaar(customer.aadhaar_number).isValid
//               ? ""
//               : validateAadhaar(customer.aadhaar_number).message
//             : "",
//       });

//       if (customer.country_id || customer.countryId) {
//         fetchStates(customer.country_id || customer.countryId);
//       }
//       if (customer.state_id || customer.stateId) {
//         fetchCities(customer.state_id || customer.stateId);
//       }
//       if (customer.city_id || customer.cityId) {
//         fetchPincodes(customer.city_id || customer.cityId);
//       }
//     }
//   }, [customer, show]);

//   // Helper function to extract data from API response
//   const extractDataFromResponse = (response) => {
//     if (response?.data?.data && Array.isArray(response.data.data)) {
//       return response.data.data;
//     }
//     if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
//       return response.data.data.data;
//     }
//     if (response?.data && Array.isArray(response.data)) {
//       return response.data;
//     }
//     if (Array.isArray(response)) {
//       return response;
//     }
//     return [];
//   };

//   const fetchCountries = async () => {
//     setLoadingCountries(true);
//     try {
//       const response = await countryApi.getAll();
//       const countriesData = extractDataFromResponse(response);
//       const activeCountries = countriesData.filter(
//         (country) => country.status === 1,
//       );
//       setCountries(activeCountries);
//     } catch (error) {
//       console.error("Error fetching countries:", error);
//       setError("Failed to load countries");
//     } finally {
//       setLoadingCountries(false);
//     }
//   };

//   const fetchStates = async (countryId) => {
//     setLoadingStates(true);
//     try {
//       const response = await stateApi.getDropdown(countryId);
//       const statesData = extractDataFromResponse(response);
//       const activeStates = statesData.filter(
//         (state) => state.status === undefined || state.status === 1,
//       );
//       setStates(activeStates);
//     } catch (error) {
//       console.error("Error fetching states:", error);
//       setError("Failed to load states");
//     } finally {
//       setLoadingStates(false);
//     }
//   };

//   const fetchCities = async (stateId) => {
//     setLoadingCities(true);
//     try {
//       const response = await cityApi.getDropdown(stateId);
//       const citiesData = extractDataFromResponse(response);
//       const activeCities = citiesData.filter(
//         (city) => city.status === undefined || city.status === 1,
//       );
//       setCities(activeCities);
//     } catch (error) {
//       console.error("Error fetching cities:", error);
//       setError("Failed to load cities");
//     } finally {
//       setLoadingCities(false);
//     }
//   };

//   const fetchPincodes = async (cityId) => {
//     if (!cityId) return;
//     setLoadingPincodes(true);
//     try {
//       const response = await pincodeApi.getAll({ cityId });
//       const pincodesData = extractDataFromResponse(response);
//       setPincodes(pincodesData);
//     } catch (error) {
//       console.error("Error fetching pincodes:", error);
//       setError("Failed to load pincodes");
//     } finally {
//       setLoadingPincodes(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!formData.name || formData.name.trim() === "") {
//       setError("Customer name is required");
//       return;
//     }
//     if (!formData.mobile || formData.mobile.trim() === "") {
//       setError("Mobile number is required");
//       return;
//     }
//     if (formData.mobile.length !== 10) {
//       setError("Mobile number must be exactly 10 digits");
//       return;
//     }
//     if (!formData.email || formData.email.trim() === "") {
//       setError("Email is required");
//       return;
//     }

//     const emailValid = validateEmail(formData.email).isValid;
//     const mobileValid = validateMobile(formData.mobile).isValid;
//     const gstValid = validateGST(formData.gstNumber).isValid;
//     const panValid = validatePAN(formData.panNumber).isValid;
//     const aadhaarValid = validateAadhaar(formData.aadhaarNumber).isValid;

//     if (!emailValid) {
//       setError("Please enter a valid email address");
//       return;
//     }
//     if (!mobileValid) {
//       setError(
//         "Please enter a valid mobile number (10 digits starting with 6-9)",
//       );
//       return;
//     }
//     if (formData.gstNumber && !gstValid) {
//       setError("Please enter a valid GST number");
//       return;
//     }
//     if (formData.panNumber && !panValid) {
//       setError("Please enter a valid PAN number");
//       return;
//     }
//     if (formData.aadhaarNumber && !aadhaarValid) {
//       setError("Please enter a valid Aadhaar number (12 digits)");
//       return;
//     }

//     setLoading(true);
//     try {
//       const submitData = {
//         name: formData.name.trim(),
//         email: formData.email.trim(),
//         mobile: formData.mobile.trim(),
//         alternateMobile: formData.alternateMobile || null,
//         address: formData.address || null,
//         landmark: formData.landmark || null,
//         countryId: formData.countryId ? Number(formData.countryId) : null,
//         stateId: formData.stateId ? Number(formData.stateId) : null,
//         cityId: formData.cityId ? Number(formData.cityId) : null,
//         pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,
//         gstNumber: formData.gstNumber || null,
//         panNumber: formData.panNumber || null,
//         aadhaarNumber: formData.aadhaarNumber || null,
//         customerType: formData.customerType,
//         creditLimit: Number(formData.creditLimit) || 0,
//         createdBy: formData.createdBy ? Number(formData.createdBy) : null,
//         status: formData.status,
//       };

//       console.log("📤 Sending payload:", JSON.stringify(submitData, null, 2));
//       await onSave(submitData);
//       onHide();
//     } catch (err) {
//       console.error("Save error:", err);
//       setError(err.response?.data?.message || "Failed to save customer");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide} size="lg" centered>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {customer ? "Edit Customer" : "Add New Customer"}
//         </Modal.Title>
//       </Modal.Header>
//       <Form onSubmit={handleSubmit}>
//         <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
//           {error && <Alert variant="danger">{error}</Alert>}

//           <h6 className="mb-3 text-primary">📋 Basic Information</h6>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Customer Name *</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Enter customer name"
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Customer Type</Form.Label>
//                 <Form.Select
//                   name="customerType"
//                   value={formData.customerType}
//                   onChange={handleChange}
//                 >
//                   <option value="regular">Regular</option>
//                   <option value="wholesale">Wholesale</option>
//                   <option value="premium">Premium</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary">📞 Contact Information</h6>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Email *</Form.Label>
//                 <div className="d-flex align-items-center">
//                   <Form.Control
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleEmailChange}
//                     placeholder="customer@example.com"
//                     required
//                     isInvalid={!!validationErrors.email && !!formData.email}
//                     className="flex-grow-1"
//                   />
//                   {getValidationIcon(formData.email, validationErrors.email)}
//                 </div>
//                 {validationErrors.email && formData.email && (
//                   <Form.Text className="text-danger">
//                     {validationErrors.email}
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Mobile Number *</Form.Label>
//                 <div className="d-flex align-items-center">
//                   <Form.Control
//                     type="tel"
//                     name="mobile"
//                     value={formData.mobile}
//                     onChange={handleMobileChange}
//                     placeholder="9876543210"
//                     required
//                     maxLength="10"
//                     isInvalid={!!validationErrors.mobile && !!formData.mobile}
//                     className="flex-grow-1"
//                   />
//                   {getValidationIcon(formData.mobile, validationErrors.mobile)}
//                 </div>
//                 {validationErrors.mobile && formData.mobile && (
//                   <Form.Text className="text-danger">
//                     {validationErrors.mobile}
//                   </Form.Text>
//                 )}
//                 <Form.Text className="text-muted">
//                   10 digits only, starts with 6-9
//                 </Form.Text>
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Alternate Mobile</Form.Label>
//                 <div className="d-flex align-items-center">
//                   <Form.Control
//                     type="tel"
//                     name="alternateMobile"
//                     value={formData.alternateMobile}
//                     onChange={handleAlternateMobileChange}
//                     placeholder="Alternate mobile number"
//                     maxLength="10"
//                     className="flex-grow-1"
//                   />
//                   {getValidationIcon(
//                     formData.alternateMobile,
//                     validationErrors.alternateMobile,
//                   )}
//                 </div>
//                 {validationErrors.alternateMobile &&
//                   formData.alternateMobile && (
//                     <Form.Text className="text-danger">
//                       {validationErrors.alternateMobile}
//                     </Form.Text>
//                   )}
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary">📍 Location Information</h6>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Country</Form.Label>
//                 <Form.Select
//                   name="countryId"
//                   value={formData.countryId}
//                   onChange={handleChange}
//                   disabled={loadingCountries}
//                 >
//                   <option value="">Select Country</option>
//                   {countries.map((country) => (
//                     <option key={country.id} value={country.id}>
//                       {country.name} {country.code ? `(${country.code})` : ""}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {loadingCountries && (
//                   <Form.Text className="text-muted">
//                     <Spinner animation="border" size="sm" /> Loading
//                     countries...
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>

//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>State</Form.Label>
//                 <Form.Select
//                   name="stateId"
//                   value={formData.stateId}
//                   onChange={handleChange}
//                   disabled={!formData.countryId || loadingStates}
//                 >
//                   <option value="">Select State</option>
//                   {states.map((state) => (
//                     <option key={state.id} value={state.id}>
//                       {state.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {loadingStates && (
//                   <Form.Text className="text-muted">
//                     <Spinner animation="border" size="sm" /> Loading states...
//                   </Form.Text>
//                 )}
//                 {!formData.countryId && (
//                   <Form.Text className="text-muted">
//                     Please select a country first
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>City</Form.Label>
//                 <Form.Select
//                   name="cityId"
//                   value={formData.cityId}
//                   onChange={handleChange}
//                   disabled={!formData.stateId || loadingCities}
//                 >
//                   <option value="">Select City</option>
//                   {cities.map((city) => (
//                     <option key={city.id} value={city.id}>
//                       {city.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {loadingCities && (
//                   <Form.Text className="text-muted">
//                     <Spinner animation="border" size="sm" /> Loading cities...
//                   </Form.Text>
//                 )}
//                 {!formData.stateId && formData.countryId && (
//                   <Form.Text className="text-muted">
//                     Please select a state first
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>

//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Pincode</Form.Label>
//                 <Form.Select
//                   name="pincodeId"
//                   value={formData.pincodeId}
//                   onChange={handleChange}
//                   disabled={!formData.cityId || loadingPincodes}
//                 >
//                   <option value="">Select Pincode</option>
//                   {pincodes.map((pincode) => (
//                     <option key={pincode.id} value={pincode.id}>
//                       {pincode.code} {pincode.area ? `- ${pincode.area}` : ""}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {loadingPincodes && (
//                   <Form.Text className="text-muted">
//                     <Spinner animation="border" size="sm" /> Loading pincodes...
//                   </Form.Text>
//                 )}
//                 {!formData.cityId && formData.stateId && (
//                   <Form.Text className="text-muted">
//                     Please select a city first
//                   </Form.Text>
//                 )}
//                 {formData.cityId &&
//                   pincodes.length === 0 &&
//                   !loadingPincodes && (
//                     <Form.Text className="text-warning">
//                       No pincodes found for this city
//                     </Form.Text>
//                   )}
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={8}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Full Address</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="address"
//                   value={formData.address}
//                   onChange={handleChange}
//                   placeholder="Street address, building name, etc."
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Landmark</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="landmark"
//                   value={formData.landmark}
//                   onChange={handleChange}
//                   placeholder="Near landmark"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary">📄 Tax Information</h6>
//           <Row>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>GST Number</Form.Label>
//                 <div className="d-flex align-items-center">
//                   <Form.Control
//                     type="text"
//                     name="gstNumber"
//                     value={formData.gstNumber}
//                     onChange={handleGSTChange}
//                     placeholder="22ABCDE1234F1Z5"
//                     maxLength="15"
//                     className="flex-grow-1"
//                     isInvalid={
//                       !!validationErrors.gstNumber && !!formData.gstNumber
//                     }
//                   />
//                   {getValidationIcon(
//                     formData.gstNumber,
//                     validationErrors.gstNumber,
//                   )}
//                 </div>
//                 {validationErrors.gstNumber && formData.gstNumber && (
//                   <Form.Text className="text-danger">
//                     {validationErrors.gstNumber}
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>PAN Number</Form.Label>
//                 <div className="d-flex align-items-center">
//                   <Form.Control
//                     type="text"
//                     name="panNumber"
//                     value={formData.panNumber}
//                     onChange={handlePANChange}
//                     placeholder="ABCDE1234F"
//                     maxLength="10"
//                     className="flex-grow-1"
//                     isInvalid={
//                       !!validationErrors.panNumber && !!formData.panNumber
//                     }
//                   />
//                   {getValidationIcon(
//                     formData.panNumber,
//                     validationErrors.panNumber,
//                   )}
//                 </div>
//                 {validationErrors.panNumber && formData.panNumber && (
//                   <Form.Text className="text-danger">
//                     {validationErrors.panNumber}
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Aadhaar Number</Form.Label>
//                 <div className="d-flex align-items-center">
//                   <Form.Control
//                     type="text"
//                     name="aadhaarNumber"
//                     value={formData.aadhaarNumber}
//                     onChange={handleAadhaarChange}
//                     placeholder="1234 5678 9012"
//                     maxLength="14"
//                     className="flex-grow-1"
//                     isInvalid={
//                       !!validationErrors.aadhaarNumber &&
//                       !!formData.aadhaarNumber
//                     }
//                   />
//                   {getValidationIcon(
//                     formData.aadhaarNumber,
//                     validationErrors.aadhaarNumber,
//                   )}
//                 </div>
//                 {validationErrors.aadhaarNumber && formData.aadhaarNumber && (
//                   <Form.Text className="text-danger">
//                     {validationErrors.aadhaarNumber}
//                   </Form.Text>
//                 )}
//                 <Form.Text className="text-muted">12 digits only</Form.Text>
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary">💰 Financial Information</h6>
//           <Row>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Credit Limit (₹)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="creditLimit"
//                   value={formData.creditLimit}
//                   onChange={handleChange}
//                   placeholder="Enter credit limit"
//                   min="0"
//                   step="1000"
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Created By (User ID)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="createdBy"
//                   value={formData.createdBy}
//                   onChange={handleChange}
//                   placeholder="e.g., 4"
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Status</Form.Label>
//                 <Form.Select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                 >
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                   <option value="suspended">Suspended</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={onHide} disabled={loading}>
//             Cancel
//           </Button>
//           <Button variant="primary" type="submit" disabled={loading}>
//             {loading ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" />
//                 Saving...
//               </>
//             ) : (
//               "Save Customer"
//             )}
//           </Button>
//         </Modal.Footer>
//       </Form>
//     </Modal>
//   );
// };

// export default CustomerModal;

import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import {
  countryApi,
  stateApi,
  cityApi,
  pincodeApi,
} from "../../api/superadmin/masterData.api";
import { getCustomers } from "../../components/services/customerService";

const CustomerModal = ({ show, onHide, customer, onSave }) => {
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
    customerType: "regular",
    creditLimit: 0,
    createdBy: "",
    status: "active",
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    mobile: "",
    alternateMobile: "",
    gstNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    name: "", // Added for name validation
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
  
  // State for existing customers (for duplicate check)
  const [existingCustomers, setExistingCustomers] = useState([]);

  // Load existing customers for duplicate check
  useEffect(() => {
    if (show) {
      loadExistingCustomers();
    }
  }, [show]);

  const loadExistingCustomers = async () => {
    try {
      const response = await getCustomers();
      let customersData = [];
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        customersData = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        customersData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        customersData = response.data;
      } else if (Array.isArray(response)) {
        customersData = response;
      }
      setExistingCustomers(customersData);
    } catch (error) {
      console.error("Failed to load customers for validation:", error);
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

  // Check for duplicate customer name
  const validateCustomerName = (name, excludeId = null) => {
    if (!name || name.trim() === "") {
      return { isValid: false, message: "Customer name is required" };
    }
    
    const isDuplicate = existingCustomers.some(customer => 
      customer.name && customer.name.toLowerCase() === name.trim().toLowerCase() && 
      (excludeId ? customer.id !== parseInt(excludeId) : true)
    );
    
    if (isDuplicate) {
      return { isValid: false, message: "Customer name already exists. Please use a different name." };
    }
    return { isValid: true, message: "" };
  };

  // Customer name change handler with duplicate check
  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    
    if (!value || value.trim() === "") {
      setValidationErrors(prev => ({ ...prev, name: "Customer name is required" }));
    } else {
      const validation = validateCustomerName(value, customer?.id);
      setValidationErrors(prev => ({ ...prev, name: validation.isValid ? "" : validation.message }));
    }
  };

  // Mobile number handler with restrictions
  const handleMobileChange = (e) => {
    let value = e.target.value;
    // Remove any non-digit characters
    value = value.replace(/\D/g, "");
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
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

  // Alternate mobile handler with restrictions
  const handleAlternateMobileChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
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

  // Aadhaar handler with restrictions (12 digits only)
  const handleAadhaarChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    // Format with spaces for better readability
    let formattedValue = value;
    if (value.length > 4) {
      formattedValue = value.slice(0, 4) + " " + value.slice(4);
    }
    if (value.length > 8) {
      formattedValue =
        value.slice(0, 4) + " " + value.slice(4, 8) + " " + value.slice(8);
    }
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

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));
    const validation = validateEmail(value);
    setValidationErrors((prev) => ({
      ...prev,
      email: validation.isValid ? "" : validation.message,
    }));
  };

  const handleGSTChange = (e) => {
    let value = e.target.value.toUpperCase();
    // GST is 15 characters, restrict length
    if (value.length > 15) {
      value = value.slice(0, 15);
    }
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
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
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
        <FaExclamationTriangle
          className="text-danger ms-1"
          size={14}
          style={{ cursor: "pointer" }}
        />
      </OverlayTrigger>
    );
  };

  // Format Aadhaar for display
  const getFormattedAadhaar = () => {
    const value = formData.aadhaarNumber;
    if (!value) return "";
    if (value.length > 8) {
      return value.slice(0, 4) + " " + value.slice(4, 8) + " " + value.slice(8);
    }
    if (value.length > 4) {
      return value.slice(0, 4) + " " + value.slice(4);
    }
    return value;
  };

  // Fetch countries on modal open
  useEffect(() => {
    if (show) {
      fetchCountries();
    }
  }, [show]);

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

  // Load customer data for edit
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        mobile: customer.mobile || "",
        alternateMobile:
          customer.alternate_mobile || customer.alternateMobile || "",
        address: customer.address || "",
        landmark: customer.landmark || "",
        countryId: customer.country_id || customer.countryId || "",
        stateId: customer.state_id || customer.stateId || "",
        cityId: customer.city_id || customer.cityId || "",
        pincodeId: customer.pincode_id || customer.pincodeId || "",
        gstNumber: customer.gst_number || customer.gstNumber || "",
        panNumber: customer.pan_number || customer.panNumber || "",
        aadhaarNumber: customer.aadhaar_number || customer.aadhaarNumber || "",
        customerType:
          customer.customer_type || customer.customerType || "regular",
        creditLimit: parseFloat(
          customer.credit_limit || customer.creditLimit || 0,
        ),
        createdBy: customer.created_by || customer.createdBy || "",
        status: customer.status || "active",
      });

      setValidationErrors({
        email: validateEmail(customer.email).isValid
          ? ""
          : validateEmail(customer.email).message,
        mobile:
          customer.mobile && customer.mobile.length === 10
            ? validateMobile(customer.mobile).isValid
              ? ""
              : validateMobile(customer.mobile).message
            : "",
        alternateMobile:
          customer.alternate_mobile && customer.alternate_mobile.length === 10
            ? validateMobile(customer.alternate_mobile).isValid
              ? ""
              : validateMobile(customer.alternate_mobile).message
            : "",
        gstNumber:
          customer.gst_number && customer.gst_number.length === 15
            ? validateGST(customer.gst_number).isValid
              ? ""
              : validateGST(customer.gst_number).message
            : "",
        panNumber:
          customer.pan_number && customer.pan_number.length === 10
            ? validatePAN(customer.pan_number).isValid
              ? ""
              : validatePAN(customer.pan_number).message
            : "",
        aadhaarNumber:
          customer.aadhaar_number && customer.aadhaar_number.length === 12
            ? validateAadhaar(customer.aadhaar_number).isValid
              ? ""
              : validateAadhaar(customer.aadhaar_number).message
            : "",
        name: "", // Clear name validation error for edit
      });

      if (customer.country_id || customer.countryId) {
        fetchStates(customer.country_id || customer.countryId);
      }
      if (customer.state_id || customer.stateId) {
        fetchCities(customer.state_id || customer.stateId);
      }
      if (customer.city_id || customer.cityId) {
        fetchPincodes(customer.city_id || customer.cityId);
      }
    }
  }, [customer, show]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate name with duplicate check
    const nameValidation = validateCustomerName(formData.name, customer?.id);
    if (!nameValidation.isValid) {
      setError(nameValidation.message);
      return;
    }
    
    if (!formData.name || formData.name.trim() === "") {
      setError("Customer name is required");
      return;
    }
    if (!formData.mobile || formData.mobile.trim() === "") {
      setError("Mobile number is required");
      return;
    }
    if (formData.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }
    if (!formData.email || formData.email.trim() === "") {
      setError("Email is required");
      return;
    }

    const emailValid = validateEmail(formData.email).isValid;
    const mobileValid = validateMobile(formData.mobile).isValid;
    const gstValid = validateGST(formData.gstNumber).isValid;
    const panValid = validatePAN(formData.panNumber).isValid;
    const aadhaarValid = validateAadhaar(formData.aadhaarNumber).isValid;

    if (!emailValid) {
      setError("Please enter a valid email address");
      return;
    }
    if (!mobileValid) {
      setError(
        "Please enter a valid mobile number (10 digits starting with 6-9)",
      );
      return;
    }
    if (formData.gstNumber && !gstValid) {
      setError("Please enter a valid GST number");
      return;
    }
    if (formData.panNumber && !panValid) {
      setError("Please enter a valid PAN number");
      return;
    }
    if (formData.aadhaarNumber && !aadhaarValid) {
      setError("Please enter a valid Aadhaar number (12 digits)");
      return;
    }

    setLoading(true);
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
        customerType: formData.customerType,
        creditLimit: Number(formData.creditLimit) || 0,
        createdBy: formData.createdBy ? Number(formData.createdBy) : null,
        status: formData.status,
      };

      console.log("📤 Sending payload:", JSON.stringify(submitData, null, 2));
      await onSave(submitData);
      onHide();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.message || "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {customer ? "Edit Customer" : "Add New Customer"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {error && <Alert variant="danger">{error}</Alert>}

          <h6 className="mb-3 text-primary">📋 Basic Information</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Customer Name *</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Enter customer name"
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
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Customer Type</Form.Label>
                <Form.Select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleChange}
                >
                  <option value="regular">Regular</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="premium">Premium</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Rest of the form remains exactly the same as your original */}
          <h6 className="mb-3 text-primary">📞 Contact Information</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    placeholder="customer@example.com"
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
            </Col>
            <Col md={6}>
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
                  {getValidationIcon(formData.mobile, validationErrors.mobile)}
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

          <Row>
            <Col md={6}>
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
            </Col>
          </Row>

          {/* Keep all your existing code below exactly as it is */}
          {/* ... (rest of your form fields remain unchanged) ... */}
          
          <h6 className="mb-3 text-primary">📍 Location Information</h6>

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
                    <Spinner animation="border" size="sm" /> Loading
                    countries...
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

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
                {formData.cityId &&
                  pincodes.length === 0 &&
                  !loadingPincodes && (
                    <Form.Text className="text-warning">
                      No pincodes found for this city
                    </Form.Text>
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
            <Col md={4}>
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

          <h6 className="mb-3 text-primary">📄 Tax Information</h6>
          <Row>
            <Col md={4}>
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
            </Col>
            <Col md={4}>
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
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Aadhaar Number</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleAadhaarChange}
                    placeholder="1234 5678 9012"
                    maxLength="14"
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
            </Col>
          </Row>

          <h6 className="mb-3 text-primary">💰 Financial Information</h6>
          <Row>
            <Col md={4}>
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
              "Save Customer"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CustomerModal;
