// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
// import {
//   FaShoppingCart,
//   FaUser,
//   FaBox,
//   FaRupeeSign,
//   FaCalendarAlt,
//   FaStickyNote,
//   FaTruck,
//   FaCreditCard,
//   FaUserTie,
// } from "react-icons/fa";
// import { getCustomers } from "../../components/services/customerService";
// import { getDealers } from "../../components/services/dealerService";
// import { getStaff } from "../../components/services/staffService";

// const OrderModal = ({ show, onHide, order, onSave }) => {
//   const [customers, setCustomers] = useState([]);
//   const [dealers, setDealers] = useState([]);
//   const [staffList, setStaffList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [partyType, setPartyType] = useState("customer");

//   const [formData, setFormData] = useState({
//     order_date: new Date().toISOString().split("T")[0],
//     customer_id: "",
//     customer_type: "customer",
//     order_type: "sales",
//     status: "pending",
//     payment_status: "pending",
//     payment_method: "",
//     subtotal: 0,
//     discount_type: "percentage",
//     discount_value: 0,
//     discount_amount: 0,
//     tax_amount: 0,
//     shipping_charge: 0,
//     total_amount: 0,
//     notes: "",
//     delivery_address: "",
//     delivery_date: "",
//     assigned_to: "",
//     created_by: "",
//   });

//   // Load data when modal opens
//   useEffect(() => {
//     if (show) {
//       loadData();
//     }
//   }, [show]);

//   // Populate form when editing an order
//   useEffect(() => {
//     if (order && show) {
//       setFormData({
//         order_date: order.order_date
//           ? order.order_date.split("T")[0]
//           : new Date().toISOString().split("T")[0],
//         customer_id: order.customer_id || "",
//         customer_type: order.customer_type || "customer",
//         order_type: order.order_type || "sales",
//         status: order.status || "pending",
//         payment_status: order.payment_status || "pending",
//         payment_method: order.payment_method || "",
//         subtotal: order.subtotal || 0,
//         discount_type: order.discount_type || "percentage",
//         discount_value: order.discount_value || 0,
//         discount_amount: order.discount_amount || 0,
//         tax_amount: order.tax_amount || 0,
//         shipping_charge: order.shipping_charge || 0,
//         total_amount: order.total_amount || 0,
//         notes: order.notes || "",
//         delivery_address: order.delivery_address || "",
//         delivery_date: order.delivery_date
//           ? order.delivery_date.split("T")[0]
//           : "",
//         assigned_to: order.assigned_to || "",
//         created_by: order.created_by || "",
//       });
//       setPartyType(order.customer_type === "dealer" ? "dealer" : "customer");
//     } else {
//       resetForm();
//     }
//   }, [order, show]);

//   // Calculate totals when relevant fields change
//   useEffect(() => {
//     calculateTotal();
//   }, [
//     formData.subtotal,
//     formData.discount_type,
//     formData.discount_value,
//     formData.tax_amount,
//     formData.shipping_charge,
//   ]);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [customersRes, dealersRes, staffRes] = await Promise.all([
//         getCustomers(),
//         getDealers(),
//         getStaff(),
//       ]);

//       const customersData =
//         customersRes?.data?.data?.data ||
//         customersRes?.data?.data ||
//         customersRes?.data ||
//         [];
//       const dealersData =
//         dealersRes?.data?.data?.data ||
//         dealersRes?.data?.data ||
//         dealersRes?.data ||
//         [];
//       const staffData =
//         staffRes?.data?.data?.staff ||
//         staffRes?.data?.staff ||
//         staffRes?.data ||
//         [];

//       setCustomers(Array.isArray(customersData) ? customersData : []);
//       setDealers(Array.isArray(dealersData) ? dealersData : []);
//       setStaffList(Array.isArray(staffData) ? staffData : []);
//     } catch (error) {
//       console.error("Failed to load data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateTotal = () => {
//     let subtotal = parseFloat(formData.subtotal) || 0;
//     let discountAmount = 0;

//     if (formData.discount_type === "percentage") {
//       discountAmount =
//         (subtotal * (parseFloat(formData.discount_value) || 0)) / 100;
//     } else {
//       discountAmount = parseFloat(formData.discount_value) || 0;
//     }

//     // Ensure discount doesn't exceed subtotal
//     if (discountAmount > subtotal) {
//       discountAmount = subtotal;
//     }

//     const afterDiscount = subtotal - discountAmount;
//     const taxAmount = parseFloat(formData.tax_amount) || 0;
//     const shippingCharge = parseFloat(formData.shipping_charge) || 0;
//     const totalAmount = afterDiscount + taxAmount + shippingCharge;

//     setFormData((prev) => ({
//       ...prev,
//       discount_amount: discountAmount,
//       total_amount: totalAmount,
//     }));
//   };

//   const resetForm = () => {
//     setFormData({
//       order_date: new Date().toISOString().split("T")[0],
//       customer_id: "",
//       customer_type: "customer",
//       order_type: "sales",
//       status: "pending",
//       payment_status: "pending",
//       payment_method: "",
//       subtotal: 0,
//       discount_type: "percentage",
//       discount_value: 0,
//       discount_amount: 0,
//       tax_amount: 0,
//       shipping_charge: 0,
//       total_amount: 0,
//       notes: "",
//       delivery_address: "",
//       delivery_date: "",
//       assigned_to: "",
//       created_by: "",
//     });
//     setErrors({});
//     setPartyType("customer");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const handlePartyTypeChange = (type) => {
//     setPartyType(type);
//     setFormData((prev) => ({ ...prev, customer_type: type, customer_id: "" }));
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.order_date) {
//       newErrors.order_date = "Order date is required";
//     }
//     if (!formData.customer_id) {
//       newErrors.customer_id = `Please select a ${partyType === "customer" ? "customer" : "dealer"}`;
//     }
//     if (formData.subtotal <= 0 && formData.total_amount <= 0) {
//       newErrors.subtotal = "Order amount must be greater than 0";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setIsSubmitting(true);

//     try {
//       const submitData = {
//         ...formData,
//         customer_id: parseInt(formData.customer_id),
//         assigned_to: formData.assigned_to
//           ? parseInt(formData.assigned_to)
//           : null,
//         subtotal: parseFloat(formData.subtotal) || 0,
//         discount_value: parseFloat(formData.discount_value) || 0,
//         tax_amount: parseFloat(formData.tax_amount) || 0,
//         shipping_charge: parseFloat(formData.shipping_charge) || 0,
//       };

//       await onSave(submitData);
//       resetForm();
//       onHide();
//     } catch (error) {
//       console.error("Error saving order:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleClose = () => {
//     resetForm();
//     onHide();
//   };

//   const getPartyOptions = () => {
//     if (partyType === "customer") {
//       return customers.map((customer) => (
//         <option key={customer.id} value={customer.id}>
//           {customer.name || customer.company_name}
//         </option>
//       ));
//     } else {
//       return dealers.map((dealer) => (
//         <option key={dealer.id} value={dealer.id}>
//           {dealer.name || dealer.company_name}
//         </option>
//       ));
//     }
//   };

//   if (loading) {
//     return (
//       <Modal show={show} onHide={handleClose} size="lg" centered>
//         <Modal.Body className="text-center py-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="mt-3">Loading data...</p>
//         </Modal.Body>
//       </Modal>
//     );
//   }

//   return (
//     <Modal
//       show={show}
//       onHide={handleClose}
//       size="lg"
//       centered
//       backdrop="static"
//     >
//       <Modal.Header
//         closeButton
//         className="bg-primary text-white border-0 rounded-top-3"
//       >
//         <Modal.Title className="fw-bold">
//           <FaShoppingCart className="me-2" />
//           {order ? "Edit Order" : "Add New Order"}
//         </Modal.Title>
//       </Modal.Header>

//       <Modal.Body
//         className="p-4"
//         style={{ maxHeight: "70vh", overflowY: "auto" }}
//       >
//         <Form>
//           {/* ORDER INFO */}
//           <div className="bg-light p-3 rounded-3 mb-3">
//             <h6 className="text-primary mb-0 fw-bold">
//               <FaCalendarAlt className="me-2" /> Order Information
//             </h6>
//           </div>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Order Date *</Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="order_date"
//                   value={formData.order_date}
//                   onChange={handleChange}
//                   isInvalid={!!errors.order_date}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.order_date}
//                 </Form.Control.Feedback>
//               </Form.Group>
//             </Col>

//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Order Type</Form.Label>
//                 <Form.Select
//                   name="order_type"
//                   value={formData.order_type}
//                   onChange={handleChange}
//                 >
//                   <option value="sales">Sales Order</option>
//                   <option value="purchase">Purchase Order</option>
//                   <option value="return">Return Order</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Status</Form.Label>
//                 <Form.Select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="approved">Approved</option>
//                   <option value="processing">Processing</option>
//                   <option value="shipped">Shipped</option>
//                   <option value="delivered">Delivered</option>
//                   <option value="completed">Completed</option>
//                   <option value="cancelled">Cancelled</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>

//           {/* PARTY INFORMATION */}
//           <div className="bg-light p-3 rounded-3 mb-3">
//             <h6 className="text-primary mb-0 fw-bold">
//               <FaUser className="me-2" /> Party Information
//             </h6>
//           </div>

//           <Form.Group className="mb-3">
//             <Form.Label>Party Type</Form.Label>
//             <div className="d-flex gap-3">
//               <Form.Check
//                 type="radio"
//                 label="Customer"
//                 name="partyType"
//                 checked={partyType === "customer"}
//                 onChange={() => handlePartyTypeChange("customer")}
//               />
//               <Form.Check
//                 type="radio"
//                 label="Dealer"
//                 name="partyType"
//                 checked={partyType === "dealer"}
//                 onChange={() => handlePartyTypeChange("dealer")}
//               />
//             </div>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>
//               Select {partyType === "customer" ? "Customer" : "Dealer"} *
//             </Form.Label>
//             <Form.Select
//               name="customer_id"
//               value={formData.customer_id}
//               onChange={handleChange}
//               isInvalid={!!errors.customer_id}
//             >
//               <option value="">
//                 Select {partyType === "customer" ? "Customer" : "Dealer"}
//               </option>
//               {getPartyOptions()}
//             </Form.Select>
//             <Form.Control.Feedback type="invalid">
//               {errors.customer_id}
//             </Form.Control.Feedback>
//           </Form.Group>

//           {/* FINANCIAL DETAILS */}
//           <div className="bg-light p-3 rounded-3 mb-3">
//             <h6 className="text-primary mb-0 fw-bold">
//               <FaRupeeSign className="me-2" /> Financial Details
//             </h6>
//           </div>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Payment Status</Form.Label>
//                 <Form.Select
//                   name="payment_status"
//                   value={formData.payment_status}
//                   onChange={handleChange}
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="partial">Partial</option>
//                   <option value="paid">Paid</option>
//                   <option value="refunded">Refunded</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>

//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Payment Method</Form.Label>
//                 <Form.Select
//                   name="payment_method"
//                   value={formData.payment_method}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Payment Method</option>
//                   <option value="cash">Cash</option>
//                   <option value="card">Card</option>
//                   <option value="bank_transfer">Bank Transfer</option>
//                   <option value="upi">UPI</option>
//                   <option value="cheque">Cheque</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Subtotal (₹) *</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="subtotal"
//                   value={formData.subtotal}
//                   onChange={handleChange}
//                   placeholder="0"
//                   min="0"
//                   step="0.01"
//                   isInvalid={!!errors.subtotal}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.subtotal}
//                 </Form.Control.Feedback>
//               </Form.Group>
//             </Col>

//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Discount Type</Form.Label>
//                 <Form.Select
//                   name="discount_type"
//                   value={formData.discount_type}
//                   onChange={handleChange}
//                 >
//                   <option value="percentage">Percentage (%)</option>
//                   <option value="fixed">Fixed Amount (₹)</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>

//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Discount Value</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="discount_value"
//                   value={formData.discount_value}
//                   onChange={handleChange}
//                   placeholder="0"
//                   min="0"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Tax Amount (₹)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="tax_amount"
//                   value={formData.tax_amount}
//                   onChange={handleChange}
//                   placeholder="0"
//                   min="0"
//                   step="0.01"
//                 />
//               </Form.Group>
//             </Col>

//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Shipping Charge (₹)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="shipping_charge"
//                   value={formData.shipping_charge}
//                   onChange={handleChange}
//                   placeholder="0"
//                   min="0"
//                   step="0.01"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <div className="bg-light p-3 rounded-3 mb-3">
//             <Row>
//               <Col md={6}>
//                 <h6 className="text-primary mb-0 fw-bold">
//                   Discount Amount: ₹{formData.discount_amount.toFixed(2)}
//                 </h6>
//               </Col>
//               <Col md={6}>
//                 <h6 className="text-primary mb-0 fw-bold">
//                   Total Amount: ₹{formData.total_amount.toFixed(2)}
//                 </h6>
//               </Col>
//             </Row>
//           </div>

//           {/* SHIPPING INFORMATION */}
//           <div className="bg-light p-3 rounded-3 mb-3">
//             <h6 className="text-primary mb-0 fw-bold">
//               <FaTruck className="me-2" /> Shipping Information
//             </h6>
//           </div>

//           <Form.Group className="mb-3">
//             <Form.Label>Delivery Address</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               name="delivery_address"
//               value={formData.delivery_address}
//               onChange={handleChange}
//               placeholder="Enter delivery address"
//             />
//           </Form.Group>

//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Delivery Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="delivery_date"
//                   value={formData.delivery_date}
//                   onChange={handleChange}
//                 />
//               </Form.Group>
//             </Col>

//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Assign To (Staff)</Form.Label>
//                 <Form.Select
//                   name="assigned_to"
//                   value={formData.assigned_to}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Staff</option>
//                   {staffList.map((staff) => (
//                     <option key={staff.id} value={staff.id}>
//                       {staff.first_name} {staff.last_name}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>

//           {/* NOTES */}
//           <div className="bg-light p-3 rounded-3 mb-3">
//             <h6 className="text-primary mb-0 fw-bold">
//               <FaStickyNote className="me-2" /> Notes
//             </h6>
//           </div>

//           <Form.Group className="mb-3">
//             <Form.Control
//               as="textarea"
//               rows={3}
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               placeholder="Add order notes..."
//             />
//           </Form.Group>

//           <Alert variant="info" className="mt-3">
//             <small>
//               <FaCreditCard className="me-1" />
//               Orders can be tracked by status and payment details. Ensure
//               correct amounts before saving.
//             </small>
//           </Alert>
//         </Form>
//       </Modal.Body>

//       <Modal.Footer className="bg-light border-0 rounded-bottom-3">
//         <Button
//           variant="secondary"
//           onClick={handleClose}
//           disabled={isSubmitting}
//         >
//           Cancel
//         </Button>
//         <Button
//           variant="primary"
//           onClick={handleSubmit}
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? (
//             <>
//               <Spinner animation="border" size="sm" className="me-2" />
//               Saving...
//             </>
//           ) : order ? (
//             "Update Order"
//           ) : (
//             "Save Order"
//           )}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default OrderModal;