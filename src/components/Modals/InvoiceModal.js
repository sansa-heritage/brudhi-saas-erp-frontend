// // frontend/src/components/Modals/InvoiceModal.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Button,
//   Form,
//   Row,
//   Col,
//   Alert,
//   Spinner,
//   Table,
// } from "react-bootstrap";
// import {
//   FaPlus,
//   FaTrash,
//   FaRupeeSign,
//   FaPercent,
//   FaBoxes,
//   FaFileInvoice,
//   FaCalendarAlt,
//   FaUser,
//   FaBuilding,
//   FaCreditCard,
// } from "react-icons/fa";
// import { getCustomers } from "../services/customerService";

// const InvoiceModal = ({ show, onHide, invoice, onSave }) => {
//   const [formData, setFormData] = useState({
//     party_type: "customer",
//     party_id: "",
//     party_name: "",
//     party_gst: "",
//     party_address: "",
//     invoice_date: new Date().toISOString().split("T")[0],
//     due_date: "",
//     discount_type: "percentage",
//     discount_value: 0,
//     discount_amount: 0,
//     cess_amount: 0,
//     notes: "",
//     terms_conditions: "",
//     payment_status: "Unpaid",
//     payment_method: "",
//     transaction_id: "",
//   });

//   const [items, setItems] = useState([
//     {
//       id: 1,
//       product_name: "",
//       hsn_code: "",
//       quantity: 1,
//       rate: 0,
//       gst_rate: 18,
//       amount: 0,
//     },
//   ]);

//   const [customers, setCustomers] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [loadingCustomers, setLoadingCustomers] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Calculations
//   const [calculations, setCalculations] = useState({
//     subtotal: 0,
//     taxable_amount: 0,
//     gst_amount: 0,
//     total_amount: 0,
//     round_off: 0,
//     net_amount: 0,
//     balance_amount: 0,
//   });

//   // Fetch customers on modal open
//   useEffect(() => {
//     if (show) {
//       fetchCustomers();
//     }
//   }, [show]);

//   // Load invoice data for edit
//   useEffect(() => {
//     if (invoice) {
//       setFormData({
//         party_type: invoice.party_type || "customer",
//         party_id: invoice.party_id || "",
//         party_name: invoice.party_name || "",
//         party_gst: invoice.party_gst || "",
//         party_address: invoice.party_address || "",
//         invoice_date:
//           invoice.invoice_date || new Date().toISOString().split("T")[0],
//         due_date: invoice.due_date || "",
//         discount_type: invoice.discount_type || "percentage",
//         discount_value: invoice.discount_value || 0,
//         discount_amount: invoice.discount_amount || 0,
//         cess_amount: invoice.cess_amount || 0,
//         notes: invoice.notes || "",
//         terms_conditions: invoice.terms_conditions || "",
//         payment_status: invoice.payment_status || "Unpaid",
//         payment_method: invoice.payment_method || "",
//         transaction_id: invoice.transaction_id || "",
//       });

//       if (invoice.items && invoice.items.length > 0) {
//         setItems(invoice.items.map((item, idx) => ({ ...item, id: idx + 1 })));
//       }

//       if (invoice.party_id) {
//         // Fetch customer details if needed
//         const customer = customers.find((c) => c.id === invoice.party_id);
//         if (customer) {
//           setSelectedCustomer(customer);
//         }
//       }
//     } else {
//       resetForm();
//     }
//   }, [invoice, show, customers]);

//   useEffect(() => {
//     calculateTotals();
//   }, [
//     items,
//     formData.discount_type,
//     formData.discount_value,
//     formData.cess_amount,
//   ]);

//   const resetForm = () => {
//     setFormData({
//       party_type: "customer",
//       party_id: "",
//       party_name: "",
//       party_gst: "",
//       party_address: "",
//       invoice_date: new Date().toISOString().split("T")[0],
//       due_date: "",
//       discount_type: "percentage",
//       discount_value: 0,
//       discount_amount: 0,
//       cess_amount: 0,
//       notes: "",
//       terms_conditions: "",
//       payment_status: "Unpaid",
//       payment_method: "",
//       transaction_id: "",
//     });
//     setItems([
//       {
//         id: 1,
//         product_name: "",
//         hsn_code: "",
//         quantity: 1,
//         rate: 0,
//         gst_rate: 18,
//         amount: 0,
//       },
//     ]);
//     setSelectedCustomer(null);
//     setCalculations({
//       subtotal: 0,
//       taxable_amount: 0,
//       gst_amount: 0,
//       total_amount: 0,
//       round_off: 0,
//       net_amount: 0,
//       balance_amount: 0,
//     });
//   };

//   const fetchCustomers = async () => {
//     setLoadingCustomers(true);
//     try {
//       const data = await getCustomers();
//       console.log("Fetched customers:", data);
//       setCustomers(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//       setError("Failed to load customers");
//     } finally {
//       setLoadingCustomers(false);
//     }
//   };

//   const handleCustomerSelect = (customerId) => {
//     const customer = customers.find((c) => c.id === parseInt(customerId));
//     setSelectedCustomer(customer);
//     setFormData((prev) => ({
//       ...prev,
//       party_id: customerId,
//       party_name: customer?.name || "",
//       party_gst: customer?.gst_number || "",
//       party_address: customer?.address || "",
//     }));
//   };

//   const addItem = () => {
//     setItems([
//       ...items,
//       {
//         id: Date.now(),
//         product_name: "",
//         hsn_code: "",
//         quantity: 1,
//         rate: 0,
//         gst_rate: 18,
//         amount: 0,
//       },
//     ]);
//   };

//   const removeItem = (index) => {
//     if (items.length > 1) {
//       const newItems = items.filter((_, i) => i !== index);
//       setItems(newItems);
//     }
//   };

//   const handleItemChange = (index, field, value) => {
//     const newItems = [...items];
//     newItems[index][field] = value;

//     if (field === "quantity" || field === "rate") {
//       newItems[index].amount = newItems[index].quantity * newItems[index].rate;
//     }

//     setItems(newItems);
//   };

//   const calculateTotals = () => {
//     // Calculate subtotal
//     const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);

//     // Calculate GST amount
//     const gstAmount = items.reduce((sum, item) => {
//       const itemGst = (item.amount * (item.gst_rate || 0)) / 100;
//       return sum + itemGst;
//     }, 0);

//     // Apply discount
//     let discountAmount = 0;
//     if (formData.discount_type === "percentage") {
//       discountAmount = (subtotal * (formData.discount_value || 0)) / 100;
//     } else {
//       discountAmount = formData.discount_value || 0;
//     }

//     const taxableAmount = subtotal - discountAmount;
//     const totalAmount = taxableAmount + gstAmount + (formData.cess_amount || 0);
//     const roundOff = Math.round(totalAmount) - totalAmount;
//     const netAmount = Math.round(totalAmount);
//     const balanceAmount = netAmount - (formData.paid_amount || 0);

//     setCalculations({
//       subtotal,
//       taxable_amount: taxableAmount,
//       gst_amount: gstAmount,
//       total_amount: totalAmount,
//       round_off: roundOff,
//       net_amount: netAmount,
//       balance_amount: balanceAmount,
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Validation
//     if (!formData.party_id) {
//       setError("Please select a customer");
//       return;
//     }
//     if (!formData.due_date) {
//       setError("Please select due date");
//       return;
//     }
//     if (items.length === 0 || items[0].product_name === "") {
//       setError("Please add at least one item");
//       return;
//     }

//     setLoading(true);
//     try {
//       const submitData = {
//         invoice_no: invoice?.invoice_no || `INV-${Date.now()}`,
//         invoice_date: formData.invoice_date,
//         due_date: formData.due_date,
//         party_type: formData.party_type,
//         party_id: Number(formData.party_id),
//         party_name: formData.party_name,
//         party_gst: formData.party_gst || null,
//         party_address: formData.party_address || null,
//         items: items.map(({ id, ...item }) => item),
//         subtotal: calculations.subtotal,
//         discount_type: formData.discount_type,
//         discount_value: formData.discount_value,
//         discount_amount: calculations.subtotal - calculations.taxable_amount,
//         taxable_amount: calculations.taxable_amount,
//         gst_amount: calculations.gst_amount,
//         cess_amount: formData.cess_amount,
//         total_amount: calculations.total_amount,
//         round_off: calculations.round_off,
//         net_amount: calculations.net_amount,
//         payment_status: formData.payment_status,
//         paid_amount: invoice?.paid_amount || 0,
//         balance_amount: calculations.balance_amount,
//         payment_method: formData.payment_method || null,
//         transaction_id: formData.transaction_id || null,
//         notes: formData.notes || null,
//         terms_conditions: formData.terms_conditions || null,
//         created_by: formData.created_by ? Number(formData.created_by) : null,
//       };

//       console.log(
//         "📤 Sending invoice payload:",
//         JSON.stringify(submitData, null, 2),
//       );
//       await onSave(submitData);
//       onHide();
//     } catch (err) {
//       console.error("Save error:", err);
//       setError(err.response?.data?.message || "Failed to save invoice");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide} size="xl" centered>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           <FaFileInvoice className="me-2" />
//           {invoice ? "Edit Invoice" : "Create New Invoice"}
//         </Modal.Title>
//       </Modal.Header>
//       <Form onSubmit={handleSubmit}>
//         <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
//           {error && <Alert variant="danger">{error}</Alert>}

//           <h6 className="mb-3 text-primary">
//             <FaUser className="me-2" /> Customer Information
//           </h6>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Select Customer *</Form.Label>
//                 <Form.Select
//                   name="party_id"
//                   value={formData.party_id}
//                   onChange={(e) => handleCustomerSelect(e.target.value)}
//                   disabled={loadingCustomers}
//                   required
//                 >
//                   <option value="">Select Customer</option>
//                   {customers.map((customer) => (
//                     <option key={customer.id} value={customer.id}>
//                       {customer.name} - {customer.customer_code}
//                     </option>
//                   ))}
//                 </Form.Select>
//                 {loadingCustomers && (
//                   <Form.Text className="text-muted">
//                     <Spinner animation="border" size="sm" /> Loading
//                     customers...
//                   </Form.Text>
//                 )}
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>GST Number</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={formData.party_gst}
//                   disabled
//                   placeholder="Customer GST will appear here"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           {selectedCustomer && (
//             <div className="bg-light p-3 rounded-3 mb-3">
//               <small className="text-muted">Customer Details</small>
//               <div className="mt-2">
//                 <div>
//                   <strong>Name:</strong> {selectedCustomer.name}
//                 </div>
//                 <div>
//                   <strong>Email:</strong> {selectedCustomer.email}
//                 </div>
//                 <div>
//                   <strong>Mobile:</strong> {selectedCustomer.mobile}
//                 </div>
//                 <div>
//                   <strong>Address:</strong> {selectedCustomer.address || "N/A"}
//                 </div>
//               </div>
//             </div>
//           )}

//           <h6 className="mb-3 text-primary mt-3">
//             <FaCalendarAlt className="me-2" /> Invoice Details
//           </h6>
//           <Row>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Invoice Date *</Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="invoice_date"
//                   value={formData.invoice_date}
//                   onChange={handleChange}
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Due Date *</Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="due_date"
//                   value={formData.due_date}
//                   onChange={handleChange}
//                   required
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={4}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Payment Status</Form.Label>
//                 <Form.Select
//                   name="payment_status"
//                   value={formData.payment_status}
//                   onChange={handleChange}
//                 >
//                   <option value="Unpaid">Unpaid</option>
//                   <option value="Partially Paid">Partially Paid</option>
//                   <option value="Paid">Paid</option>
//                   <option value="Overdue">Overdue</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary mt-3">
//             <FaBoxes className="me-2" /> Invoice Items
//           </h6>
//           <div className="table-responsive">
//             <Table className="mb-0 align-middle">
//               <thead className="table-light">
//                 <tr>
//                   <th>Product/Service</th>
//                   <th>HSN/SAC Code</th>
//                   <th style={{ width: "80px" }}>Qty</th>
//                   <th style={{ width: "100px" }}>Rate (₹)</th>
//                   <th style={{ width: "80px" }}>GST%</th>
//                   <th style={{ width: "100px" }}>Amount (₹)</th>
//                   <th style={{ width: "50px" }}></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((item, index) => (
//                   <tr key={item.id}>
//                     <td>
//                       <Form.Control
//                         type="text"
//                         size="sm"
//                         value={item.product_name}
//                         onChange={(e) =>
//                           handleItemChange(
//                             index,
//                             "product_name",
//                             e.target.value,
//                           )
//                         }
//                         placeholder="Enter product/service"
//                       />
//                     </td>
//                     <td>
//                       <Form.Control
//                         type="text"
//                         size="sm"
//                         value={item.hsn_code}
//                         onChange={(e) =>
//                           handleItemChange(index, "hsn_code", e.target.value)
//                         }
//                         placeholder="HSN/SAC"
//                       />
//                     </td>
//                     <td>
//                       <Form.Control
//                         type="number"
//                         size="sm"
//                         value={item.quantity}
//                         onChange={(e) =>
//                           handleItemChange(
//                             index,
//                             "quantity",
//                             parseFloat(e.target.value) || 0,
//                           )
//                         }
//                         min="1"
//                       />
//                     </td>
//                     <td>
//                       <Form.Control
//                         type="number"
//                         size="sm"
//                         value={item.rate}
//                         onChange={(e) =>
//                           handleItemChange(
//                             index,
//                             "rate",
//                             parseFloat(e.target.value) || 0,
//                           )
//                         }
//                         min="0"
//                       />
//                     </td>
//                     <td>
//                       <Form.Select
//                         size="sm"
//                         value={item.gst_rate}
//                         onChange={(e) =>
//                           handleItemChange(
//                             index,
//                             "gst_rate",
//                             parseInt(e.target.value),
//                           )
//                         }
//                       >
//                         <option value="0">0%</option>
//                         <option value="5">5%</option>
//                         <option value="12">12%</option>
//                         <option value="18">18%</option>
//                         <option value="28">28%</option>
//                       </Form.Select>
//                     </td>
//                     <td className="fw-semibold text-primary">
//                       ₹{(item.amount || 0).toLocaleString()}
//                     </td>
//                     <td>
//                       <Button
//                         variant="link"
//                         size="sm"
//                         className="text-danger p-0"
//                         onClick={() => removeItem(index)}
//                         disabled={items.length === 1}
//                       >
//                         <FaTrash />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           </div>

//           <Button
//             variant="outline-primary"
//             size="sm"
//             onClick={addItem}
//             className="mt-2"
//           >
//             <FaPlus className="me-1" /> Add Item
//           </Button>

//           <h6 className="mb-3 text-primary mt-4">
//             <FaPercent className="me-2" /> Discount & Charges
//           </h6>
//           <Row>
//             <Col md={3}>
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
//             <Col md={3}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Discount Value</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="discount_value"
//                   value={formData.discount_value}
//                   onChange={handleChange}
//                   min="0"
//                   step={formData.discount_type === "percentage" ? "1" : "100"}
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={3}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Cess Amount (₹)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="cess_amount"
//                   value={formData.cess_amount}
//                   onChange={handleChange}
//                   min="0"
//                   step="10"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary mt-3">
//             <FaRupeeSign className="me-2" /> Summary
//           </h6>
//           <Row>
//             <Col md={12}>
//               <div className="bg-light p-3 rounded-3">
//                 <Row>
//                   <Col md={6}>
//                     <div className="mb-2">
//                       <span className="text-muted">Subtotal:</span>
//                       <strong className="float-end">
//                         ₹{calculations.subtotal.toLocaleString()}
//                       </strong>
//                     </div>
//                     <div className="mb-2">
//                       <span className="text-muted">Discount:</span>
//                       <strong className="float-end text-danger">
//                         - ₹
//                         {formData.discount_amount ||
//                           (
//                             calculations.subtotal - calculations.taxable_amount
//                           ).toLocaleString()}
//                       </strong>
//                     </div>
//                     <div className="mb-2">
//                       <span className="text-muted">Taxable Amount:</span>
//                       <strong className="float-end">
//                         ₹{calculations.taxable_amount.toLocaleString()}
//                       </strong>
//                     </div>
//                     <div className="mb-2">
//                       <span className="text-muted">GST Amount:</span>
//                       <strong className="float-end">
//                         ₹{calculations.gst_amount.toLocaleString()}
//                       </strong>
//                     </div>
//                   </Col>
//                   <Col md={6}>
//                     <div className="mb-2">
//                       <span className="text-muted">Cess:</span>
//                       <strong className="float-end">
//                         ₹{formData.cess_amount.toLocaleString()}
//                       </strong>
//                     </div>
//                     <div className="mb-2">
//                       <span className="text-muted">Total Amount:</span>
//                       <strong className="float-end">
//                         ₹{calculations.total_amount.toLocaleString()}
//                       </strong>
//                     </div>
//                     <div className="mb-2">
//                       <span className="text-muted">Round Off:</span>
//                       <strong className="float-end">
//                         ₹{calculations.round_off.toLocaleString()}
//                       </strong>
//                     </div>
//                     <div className="pt-2 border-top">
//                       <h5 className="text-primary mb-0">
//                         Net Amount:{" "}
//                         <span className="float-end">
//                           ₹{calculations.net_amount.toLocaleString()}
//                         </span>
//                       </h5>
//                     </div>
//                   </Col>
//                 </Row>
//               </div>
//             </Col>
//           </Row>

//           <h6 className="mb-3 text-primary mt-3">
//             <FaBuilding className="me-2" /> Additional Information
//           </h6>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Payment Method</Form.Label>
//                 <Form.Select
//                   name="payment_method"
//                   value={formData.payment_method}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Payment Method</option>
//                   <option value="Cash">Cash</option>
//                   <option value="Bank Transfer">Bank Transfer</option>
//                   <option value="Cheque">Cheque</option>
//                   <option value="UPI">UPI</option>
//                   <option value="Credit Card">Credit Card</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Transaction ID</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="transaction_id"
//                   value={formData.transaction_id}
//                   onChange={handleChange}
//                   placeholder="Transaction reference"
//                 />
//               </Form.Group>
//             </Col>
//           </Row>

//           <Form.Group className="mb-3">
//             <Form.Label>Notes</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               placeholder="Additional notes..."
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Terms & Conditions</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               name="terms_conditions"
//               value={formData.terms_conditions}
//               onChange={handleChange}
//               placeholder="Payment terms, delivery terms, etc."
//             />
//           </Form.Group>
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
//               <>
//                 <FaFileInvoice className="me-2" />
//                 {invoice ? "Update Invoice" : "Generate Invoice"}
//               </>
//             )}
//           </Button>
//         </Modal.Footer>
//       </Form>
//     </Modal>
//   );
// };

// export default InvoiceModal;

// frontend/src/components/Modals/InvoiceModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  FaPlus,
  FaTrash,
  FaRupeeSign,
  FaPercent,
  FaBoxes,
  FaFileInvoice,
  FaCalendarAlt,
  FaUser,
  FaBuilding,
  FaCreditCard,
} from "react-icons/fa";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";

const InvoiceModal = ({ show, onHide, invoice, onSave }) => {
  const [formData, setFormData] = useState({
    party_type: "customer",
    party_id: "",
    party_name: "",
    party_gst: "",
    party_address: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: "",
    discount_type: "percentage",
    discount_value: 0,
    discount_amount: 0,
    cess_amount: 0,
    notes: "",
    terms_conditions: "",
    payment_status: "Unpaid",
    payment_method: "",
    transaction_id: "",
  });

  const [items, setItems] = useState([
    {
      id: 1,
      product_id: "",
      product_name: "",
      hsn_code: "",
      quantity: 1,
      rate: 0,
      gst_rate: 18,
      amount: 0,
    },
  ]);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculations
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    taxable_amount: 0,
    gst_amount: 0,
    total_amount: 0,
    round_off: 0,
    net_amount: 0,
    balance_amount: 0,
  });

  // Fetch customers and products on modal open
  useEffect(() => {
    if (show) {
      fetchCustomers();
      fetchProducts();
    }
  }, [show]);

  // Load invoice data for edit
  useEffect(() => {
    if (invoice) {
      setFormData({
        party_type: invoice.party_type || "customer",
        party_id: invoice.party_id || "",
        party_name: invoice.party_name || "",
        party_gst: invoice.party_gst || "",
        party_address: invoice.party_address || "",
        invoice_date: invoice.invoice_date || new Date().toISOString().split("T")[0],
        due_date: invoice.due_date || "",
        discount_type: invoice.discount_type || "percentage",
        discount_value: invoice.discount_value || 0,
        discount_amount: invoice.discount_amount || 0,
        cess_amount: invoice.cess_amount || 0,
        notes: invoice.notes || "",
        terms_conditions: invoice.terms_conditions || "",
        payment_status: invoice.payment_status || "Unpaid",
        payment_method: invoice.payment_method || "",
        transaction_id: invoice.transaction_id || "",
      });

      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items.map((item, idx) => ({ 
          ...item, 
          id: idx + 1,
          product_id: item.product_id || "",
        })));
      }

      if (invoice.party_id) {
        const customer = customers.find((c) => c.id === invoice.party_id);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }
    } else {
      resetForm();
    }
  }, [invoice, show, customers]);

  useEffect(() => {
    calculateTotals();
  }, [items, formData.discount_type, formData.discount_value, formData.cess_amount]);

  const resetForm = () => {
    setFormData({
      party_type: "customer",
      party_id: "",
      party_name: "",
      party_gst: "",
      party_address: "",
      invoice_date: new Date().toISOString().split("T")[0],
      due_date: "",
      discount_type: "percentage",
      discount_value: 0,
      discount_amount: 0,
      cess_amount: 0,
      notes: "",
      terms_conditions: "",
      payment_status: "Unpaid",
      payment_method: "",
      transaction_id: "",
    });
    setItems([
      {
        id: 1,
        product_id: "",
        product_name: "",
        hsn_code: "",
        quantity: 1,
        rate: 0,
        gst_rate: 18,
        amount: 0,
      },
    ]);
    setSelectedCustomer(null);
    setCalculations({
      subtotal: 0,
      taxable_amount: 0,
      gst_amount: 0,
      total_amount: 0,
      round_off: 0,
      net_amount: 0,
      balance_amount: 0,
    });
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const data = await getCustomers();
      console.log("Fetched customers:", data);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to load customers");
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await getProducts();
      console.log("Fetched products:", data);
      
      let activeProducts = [];
      if (Array.isArray(data)) {
        activeProducts = data.filter(p => p.is_active === 1 || p.is_active === true);
      } else if (data && data.data && Array.isArray(data.data)) {
        activeProducts = data.data.filter(p => p.is_active === 1 || p.is_active === true);
      } else if (data && data.data && data.data.data && Array.isArray(data.data.data)) {
        activeProducts = data.data.data.filter(p => p.is_active === 1 || p.is_active === true);
      }
      
      setProducts(activeProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Don't set error for products, just log it
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find((c) => c.id === parseInt(customerId));
    setSelectedCustomer(customer);
    setFormData((prev) => ({
      ...prev,
      party_id: customerId,
      party_name: customer?.name || "",
      party_gst: customer?.gst_number || "",
      party_address: customer?.address || "",
    }));
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    if (!product) return;

    const newItems = [...items];
    const rate = product.selling_price || product.unit_price || 0;
    const gstRate = product.gst_rate || 0;
    const quantity = newItems[index].quantity || 1;
    const amount = quantity * rate;

    newItems[index] = {
      ...newItems[index],
      product_id: product.id,
      product_name: product.product_name,
      hsn_code: product.hsn_code,
      rate: rate,
      gst_rate: gstRate,
      amount: amount,
    };

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        product_id: "",
        product_name: "",
        hsn_code: "",
        quantity: 1,
        rate: 0,
        gst_rate: 18,
        amount: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "quantity" || field === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Calculate GST amount
    const gstAmount = items.reduce((sum, item) => {
      const itemGst = (item.amount * (item.gst_rate || 0)) / 100;
      return sum + itemGst;
    }, 0);

    // Apply discount
    let discountAmount = 0;
    if (formData.discount_type === "percentage") {
      discountAmount = (subtotal * (formData.discount_value || 0)) / 100;
    } else {
      discountAmount = formData.discount_value || 0;
    }

    const taxableAmount = subtotal - discountAmount;
    const totalAmount = taxableAmount + gstAmount + (formData.cess_amount || 0);
    const roundOff = Math.round(totalAmount) - totalAmount;
    const netAmount = Math.round(totalAmount);
    const balanceAmount = netAmount - (formData.paid_amount || 0);

    setCalculations({
      subtotal,
      taxable_amount: taxableAmount,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      round_off: roundOff,
      net_amount: netAmount,
      balance_amount: balanceAmount,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.party_id) {
      setError("Please select a customer");
      return;
    }
    if (!formData.due_date) {
      setError("Please select due date");
      return;
    }
    if (items.length === 0 || items[0].product_name === "") {
      setError("Please add at least one item");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        invoice_no: invoice?.invoice_no || `INV-${Date.now()}`,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        party_type: formData.party_type,
        party_id: Number(formData.party_id),
        party_name: formData.party_name,
        party_gst: formData.party_gst || null,
        party_address: formData.party_address || null,
        items: items.map(({ id, ...item }) => item),
        subtotal: calculations.subtotal,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        discount_amount: calculations.subtotal - calculations.taxable_amount,
        taxable_amount: calculations.taxable_amount,
        gst_amount: calculations.gst_amount,
        cess_amount: formData.cess_amount,
        total_amount: calculations.total_amount,
        round_off: calculations.round_off,
        net_amount: calculations.net_amount,
        payment_status: formData.payment_status,
        paid_amount: invoice?.paid_amount || 0,
        balance_amount: calculations.balance_amount,
        payment_method: formData.payment_method || null,
        transaction_id: formData.transaction_id || null,
        notes: formData.notes || null,
        terms_conditions: formData.terms_conditions || null,
        created_by: formData.created_by ? Number(formData.created_by) : null,
      };

      console.log("📤 Sending invoice payload:", JSON.stringify(submitData, null, 2));
      await onSave(submitData);
      onHide();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.message || "Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaFileInvoice className="me-2" />
          {invoice ? "Edit Invoice" : "Create New Invoice"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {error && <Alert variant="danger">{error}</Alert>}

          <h6 className="mb-3 text-primary">
            <FaUser className="me-2" /> Customer Information
          </h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Customer *</Form.Label>
                <Form.Select
                  name="party_id"
                  value={formData.party_id}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  disabled={loadingCustomers}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.customer_code}
                    </option>
                  ))}
                </Form.Select>
                {loadingCustomers && (
                  <Form.Text className="text-muted">
                    <Spinner animation="border" size="sm" /> Loading customers...
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>GST Number</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.party_gst}
                  disabled
                  placeholder="Customer GST will appear here"
                />
              </Form.Group>
            </Col>
          </Row>

          {selectedCustomer && (
            <div className="bg-light p-3 rounded-3 mb-3">
              <small className="text-muted">Customer Details</small>
              <div className="mt-2">
                <div><strong>Name:</strong> {selectedCustomer.name}</div>
                <div><strong>Email:</strong> {selectedCustomer.email}</div>
                <div><strong>Mobile:</strong> {selectedCustomer.mobile}</div>
                <div><strong>Address:</strong> {selectedCustomer.address || "N/A"}</div>
              </div>
            </div>
          )}

          <h6 className="mb-3 text-primary mt-3">
            <FaCalendarAlt className="me-2" /> Invoice Details
          </h6>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Invoice Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="invoice_date"
                  value={formData.invoice_date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Due Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <h6 className="mb-3 text-primary mt-3">
            <FaBoxes className="me-2" /> Invoice Items
          </h6>
          {loadingProducts ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Loading products...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>HSN/SAC Code</th>
                    <th style={{ width: "80px" }}>Qty</th>
                    <th style={{ width: "100px" }}>Rate (₹)</th>
                    <th style={{ width: "80px" }}>GST%</th>
                    <th style={{ width: "100px" }}>Amount (₹)</th>
                    <th style={{ width: "50px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ minWidth: "250px" }}>
                        <Form.Select
                          size="sm"
                          value={item.product_id}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="rounded-2"
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.product_name} ({product.product_code}) - ₹{product.selling_price} ({product.gst_rate}% GST)
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={item.hsn_code}
                          onChange={(e) => handleItemChange(index, "hsn_code", e.target.value)}
                          placeholder="HSN/SAC"
                          className="rounded-2"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                          min="1"
                          className="rounded-2"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)}
                          min="0"
                          className="rounded-2"
                        />
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={item.gst_rate}
                          onChange={(e) => handleItemChange(index, "gst_rate", parseInt(e.target.value))}
                          className="rounded-2"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </Form.Select>
                      </td>
                      <td className="fw-semibold text-primary">
                        ₹{(item.amount || 0).toLocaleString()}
                      </td>
                      <td>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          <Button variant="outline-primary" size="sm" onClick={addItem} className="mt-2">
            <FaPlus className="me-1" /> Add Item
          </Button>

          <h6 className="mb-3 text-primary mt-4">
            <FaPercent className="me-2" /> Discount & Charges
          </h6>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Discount Type</Form.Label>
                <Form.Select name="discount_type" value={formData.discount_type} onChange={handleChange}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Discount Value</Form.Label>
                <Form.Control
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleChange}
                  min="0"
                  step={formData.discount_type === "percentage" ? "1" : "100"}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Cess Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="cess_amount"
                  value={formData.cess_amount}
                  onChange={handleChange}
                  min="0"
                  step="10"
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="mb-3 text-primary mt-3">
            <FaRupeeSign className="me-2" /> Summary
          </h6>
          <Row>
            <Col md={12}>
              <div className="bg-light p-3 rounded-3">
                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <span className="text-muted">Subtotal:</span>
                      <strong className="float-end">₹{calculations.subtotal.toLocaleString()}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Discount:</span>
                      <strong className="float-end text-danger">
                        - ₹{(calculations.subtotal - calculations.taxable_amount).toLocaleString()}
                      </strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Taxable Amount:</span>
                      <strong className="float-end">₹{calculations.taxable_amount.toLocaleString()}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">GST Amount:</span>
                      <strong className="float-end">₹{calculations.gst_amount.toLocaleString()}</strong>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <span className="text-muted">Cess:</span>
                      <strong className="float-end">₹{formData.cess_amount.toLocaleString()}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Total Amount:</span>
                      <strong className="float-end">₹{calculations.total_amount.toLocaleString()}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Round Off:</span>
                      <strong className="float-end">₹{calculations.round_off.toLocaleString()}</strong>
                    </div>
                    <div className="pt-2 border-top">
                      <h5 className="text-primary mb-0">
                        Net Amount: <span className="float-end">₹{calculations.net_amount.toLocaleString()}</span>
                      </h5>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          <h6 className="mb-3 text-primary mt-3">
            <FaBuilding className="me-2" /> Additional Information
          </h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select name="payment_method" value={formData.payment_method} onChange={handleChange}>
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Transaction ID</Form.Label>
                <Form.Control
                  type="text"
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleChange}
                  placeholder="Transaction reference"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Terms & Conditions</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="terms_conditions"
              value={formData.terms_conditions}
              onChange={handleChange}
              placeholder="Payment terms, delivery terms, etc."
            />
          </Form.Group>
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
              <>
                <FaFileInvoice className="me-2" />
                {invoice ? "Update Invoice" : "Generate Invoice"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default InvoiceModal;
