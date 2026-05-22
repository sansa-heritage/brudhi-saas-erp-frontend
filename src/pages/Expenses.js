// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Container,
//   Card,
//   Table,
//   Button,
//   Modal,
//   Form,
//   Row,
//   Col,
//   Badge,
//   Alert,
// } from "react-bootstrap";
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaFilePdf,
//   FaChartLine,
//   FaMoneyBillWave,
//   FaRupeeSign,
//   FaPercent,
//   FaCalendarAlt,
//   FaTag,
//   FaBuilding,
//   FaArrowLeft,
//   FaHome,
// } from "react-icons/fa";

// const Expenses = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [expenses] = useState([
//     {
//       id: 1,
//       category: "Rent",
//       description: "Office Rent - January",
//       amount: 50000,
//       date: "2024-01-05",
//       gst: 18,
//       tax: 9000,
//       status: "Paid",
//     },
//     {
//       id: 2,
//       category: "Utilities",
//       description: "Electricity Bill",
//       amount: 8500,
//       date: "2024-01-10",
//       gst: 5,
//       tax: 425,
//       status: "Paid",
//     },
//     {
//       id: 3,
//       category: "Salary",
//       description: "Staff Salaries",
//       amount: 150000,
//       date: "2024-01-25",
//       gst: 0,
//       tax: 0,
//       status: "Paid",
//     },
//     {
//       id: 4,
//       category: "Marketing",
//       description: "Google Ads",
//       amount: 25000,
//       date: "2024-01-15",
//       gst: 18,
//       tax: 4500,
//       status: "Pending",
//     },
//   ]);

//   const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
//   const totalTax = expenses.reduce((sum, exp) => sum + exp.tax, 0);

//   const navigate = useNavigate();

//   // Handle back button - go to dashboard
//   const handleGoBack = () => {
//     navigate("/dashboard");
//   };

//   return (
//     <Container fluid className="p-4 bg-light">
//       {/* Back Button - Redirects to Dashboard */}
//       <div className="mb-3 d-flex align-items-center gap-3">
//         <Button
//           variant="link"
//           className="text-decoration-none p-0 d-flex align-items-center"
//           onClick={handleGoBack}
//         >
//           <FaArrowLeft className="me-2" /> Back to Dashboard
//         </Button>
//         <Button
//           variant="outline-secondary"
//           size="sm"
//           className="rounded-pill"
//           onClick={() => navigate("/dashboard")}
//         >
//           <FaHome className="me-1" /> Dashboard
//         </Button>
//       </div>
//       {/* Header with Gradient Background */}
//       <div className="bg-gradient-danger text-white rounded-3 p-4 mb-4 shadow">
//         <div className="d-flex justify-content-between align-items-center">
//           <div>
//             <h2 className="fw-bold mb-1">
//               <FaMoneyBillWave className="me-2" /> Expenses
//             </h2>
//             <p className="mb-0 opacity-75">
//               Track and manage all business expenses, claim input tax credit
//             </p>
//           </div>
//           <Button
//             variant="light"
//             onClick={() => setShowModal(true)}
//             className="rounded-pill px-4"
//           >
//             <FaPlus className="me-2" /> Add Expense
//           </Button>
//         </div>
//       </div>

//       {/* Expense Summary Cards */}
//       <Row className="g-3 mb-4">
//         <Col md={4}>
//           <Card className="border-0 shadow-sm rounded-3 h-100">
//             <Card.Body className="p-3">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <small className="text-muted">Total Expenses</small>
//                   <h4 className="text-danger mb-0 fw-bold">
//                     ₹{totalExpenses.toLocaleString()}
//                   </h4>
//                   <small className="text-success">+5.1% from last month</small>
//                 </div>
//                 <div className="bg-danger bg-opacity-10 rounded-circle p-3">
//                   <FaMoneyBillWave className="text-danger" size={24} />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="border-0 shadow-sm rounded-3 h-100">
//             <Card.Body className="p-3">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <small className="text-muted">Input Tax Credit (ITC)</small>
//                   <h4 className="text-success mb-0 fw-bold">
//                     ₹{totalTax.toLocaleString()}
//                   </h4>
//                   <small className="text-muted">GST paid on expenses</small>
//                 </div>
//                 <div className="bg-success bg-opacity-10 rounded-circle p-3">
//                   <FaPercent className="text-success" size={24} />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="border-0 shadow-sm rounded-3 h-100">
//             <Card.Body className="p-3">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <small className="text-muted">Net GST Liability</small>
//                   <h4 className="text-primary mb-0 fw-bold">
//                     ₹{(82800 - totalTax).toLocaleString()}
//                   </h4>
//                   <small className="text-muted">After ITC adjustment</small>
//                 </div>
//                 <div className="bg-primary bg-opacity-10 rounded-circle p-3">
//                   <FaChartLine className="text-primary" size={24} />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Expenses Table */}
//       <Card className="border-0 shadow-sm rounded-3">
//         <Card.Body className="p-0">
//           <div className="table-responsive">
//             <Table hover className="mb-0 align-middle">
//               <thead className="table-light">
//                 <tr>
//                   <th>Date</th>
//                   <th>Category</th>
//                   <th>Description</th>
//                   <th>Amount (₹)</th>
//                   <th>GST %</th>
//                   <th>GST Amount</th>
//                   <th>Total</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {expenses.map((expense) => (
//                   <tr key={expense.id}>
//                     <td>
//                       <FaCalendarAlt className="text-muted me-2" size={12} />
//                       {expense.date}
//                     </td>
//                     <td>
//                       <Badge bg="secondary" className="rounded-pill px-3">
//                         {expense.category}
//                       </Badge>
//                     </td>
//                     <td className="text-muted">{expense.description}</td>
//                     <td className="fw-semibold">
//                       ₹{expense.amount.toLocaleString()}
//                     </td>
//                     <td>
//                       <Badge bg="info" className="rounded-pill px-3">
//                         {expense.gst}%
//                       </Badge>
//                     </td>
//                     <td className="text-muted">
//                       ₹{expense.tax.toLocaleString()}
//                     </td>
//                     <td className="fw-semibold text-primary">
//                       ₹{(expense.amount + expense.tax).toLocaleString()}
//                     </td>
//                     <td>
//                       <Badge
//                         bg={expense.status === "Paid" ? "success" : "warning"}
//                         className="rounded-pill px-3 py-2"
//                       >
//                         {expense.status}
//                       </Badge>
//                     </td>
//                     <td>
//                       <Button
//                         variant="outline-primary"
//                         size="sm"
//                         className="me-1 rounded-circle"
//                         style={{ width: "32px", height: "32px", padding: "0" }}
//                         onClick={() => navigate(`/expenses/edit/${expense.id}`)}
//                       >
//                         <FaEdit />
//                       </Button>
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         className="rounded-circle"
//                         style={{ width: "32px", height: "32px", padding: "0" }}
//                       >
//                         <FaTrash />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* Add Expense Modal */}
//       <Modal
//         show={showModal}
//         onHide={() => setShowModal(false)}
//         centered
//         className="expense-modal"
//       >
//         <Modal.Header
//           closeButton
//           className="bg-danger text-white rounded-top-3 border-0"
//         >
//           <Modal.Title className="fw-bold">
//             <FaPlus className="me-2" /> Add New Expense
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="p-4">
//           <Form>
//             {/* Section Header */}
//             <div className="bg-light p-3 rounded-3 mb-4">
//               <h6 className="mb-0 text-danger fw-bold">
//                 <FaTag className="me-2" /> Expense Details
//               </h6>
//             </div>

//             <Form.Group className="mb-3">
//               <Form.Label className="fw-semibold">
//                 Expense Category <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select className="rounded-2">
//                 <option>Rent</option>
//                 <option>Utilities</option>
//                 <option>Salary</option>
//                 <option>Marketing</option>
//                 <option>Travel</option>
//                 <option>Office Supplies</option>
//                 <option>Other</option>
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label className="fw-semibold">Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 placeholder="Describe the expense"
//                 className="rounded-2"
//               />
//             </Form.Group>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">
//                     Amount (₹) <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Control
//                     type="number"
//                     placeholder="0"
//                     className="rounded-2"
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">
//                     Date <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Control type="date" className="rounded-2" />
//                 </Form.Group>
//               </Col>
//             </Row>

//             {/* Section Header */}
//             <div className="bg-light p-3 rounded-3 mb-4 mt-3">
//               <h6 className="mb-0 text-danger fw-bold">
//                 <FaPercent className="me-2" /> Tax Information
//               </h6>
//             </div>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">GST Rate</Form.Label>
//                   <Form.Select className="rounded-2">
//                     <option>0%</option>
//                     <option>5%</option>
//                     <option>12%</option>
//                     <option>18%</option>
//                     <option>28%</option>
//                   </Form.Select>
//                   <Form.Text className="text-muted small">
//                     Select applicable GST rate
//                   </Form.Text>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">
//                     Vendor GSTIN (Optional)
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="22AAAAA0000A1Z"
//                     className="rounded-2"
//                   />
//                   <Form.Text className="text-muted small">
//                     Required for claiming ITC
//                   </Form.Text>
//                 </Form.Group>
//               </Col>
//             </Row>

//             {/* Section Header */}
//             <div className="bg-light p-3 rounded-3 mb-4 mt-3">
//               <h6 className="mb-0 text-danger fw-bold">
//                 <FaBuilding className="me-2" /> Payment Information
//               </h6>
//             </div>

//             <Form.Group className="mb-3">
//               <Form.Label className="fw-semibold">Payment Status</Form.Label>
//               <Form.Select className="rounded-2">
//                 <option>Paid</option>
//                 <option>Pending</option>
//               </Form.Select>
//             </Form.Group>

//             <Alert variant="info" className="mt-3 rounded-3">
//               <small>
//                 <strong>Note:</strong> Input Tax Credit (ITC) can be claimed
//                 only if:
//                 <br />
//                 • Vendor GSTIN is valid and active
//                 <br />
//                 • Expense is for business purposes
//                 <br />• Payment is made within 180 days
//               </small>
//             </Alert>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer className="bg-light rounded-bottom-3 border-0">
//           <Button
//             variant="secondary"
//             onClick={() => setShowModal(false)}
//             className="rounded-pill px-4"
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={() => setShowModal(false)}
//             className="rounded-pill px-4"
//           >
//             Save Expense
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Styles */}
//       <style jsx="true">{`
//         .bg-gradient-danger {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//         }
//         .table tbody tr:hover {
//           background-color: #f8f9fa;
//           cursor: pointer;
//         }
//         .expense-modal .modal-content {
//           border-radius: 1rem;
//         }
//       `}</style>
//     </Container>
//   );
// };

// export default Expenses;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Container,
//   Card,
//   Table,
//   Button,
//   Modal,
//   Form,
//   Row,
//   Col,
//   Badge,
//   Alert,
//   Spinner,
// } from "react-bootstrap";
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaFilePdf,
//   FaChartLine,
//   FaMoneyBillWave,
//   FaRupeeSign,
//   FaPercent,
//   FaCalendarAlt,
//   FaTag,
//   FaBuilding,
//   FaArrowLeft,
//   FaHome,
// } from "react-icons/fa";
// import {
//   getExpenses,
//   addExpense,
//   updateExpense,
//   deleteExpense,
// } from "../components/services/expenseService";
// import Swal from "sweetalert2";

// const Expenses = () => {
//   const navigate = useNavigate();
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingExpense, setEditingExpense] = useState(null);
//   const [formData, setFormData] = useState({
//     category: "",
//     description: "",
//     amount: "",
//     expenseDate: "",
//     gst: "",
//     reference_no: "",
//     receipt_path: "",
//     payment_status: "Paid",
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   // Fetch expenses on load
//   useEffect(() => {
//     fetchExpenses();
//   }, []);

//   const fetchExpenses = async () => {
//     setLoading(true);
//     try {
//       const response = await getExpenses();
//       console.log("Fetched expenses:", response.data);

//       let expensesData = [];
//       if (response.data && response.data.data) {
//         expensesData = response.data.data;
//       } else if (response.data && Array.isArray(response.data)) {
//         expensesData = response.data;
//       } else if (Array.isArray(response)) {
//         expensesData = response;
//       }

//       setExpenses(expensesData);
//     } catch (error) {
//       console.error("Failed to fetch expenses:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error!",
//         text: error.response?.data?.message || "Failed to load expenses",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const calculateTaxAndTotal = (amount, gstRate) => {
//     const amt = parseFloat(amount) || 0;
//     const gst = parseFloat(gstRate) || 0;
//     const taxAmount = (amt * gst) / 100;
//     const totalAmount = amt + taxAmount;
//     return { taxAmount, totalAmount };
//   };

//   const resetModal = () => {
//     setShowModal(false);
//     setEditingExpense(null);
//     setFormData({
//       category: "",
//       description: "",
//       amount: "",
//       expenseDate: "",
//       gst: "",
//       reference_no: "",
//       receipt_path: "",
//       payment_status: "Paid",
//     });
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSubmitting(true);

//     // Validation
//     if (!formData.category) {
//       setError("Category is required");
//       setSubmitting(false);
//       return;
//     }
//     if (!formData.amount) {
//       setError("Amount is required");
//       setSubmitting(false);
//       return;
//     }
//     if (!formData.expense_date) {
//       setError("Date is required");
//       setSubmitting(false);
//       return;
//     }

//     try {
//       const { taxAmount, totalAmount } = calculateTaxAndTotal(
//         formData.amount,
//         formData.gst,
//       );

//       // Match database fields: id, category, expense_date, amount, tax_amount, total_amount, description, reference_no, receipt_path
//       const expenseData = {
//         category: formData.category,
//         expense_date: formData.expense_date,
//         amount: parseFloat(formData.amount),
//         tax_amount: taxAmount,
//         total_amount: totalAmount,
//         description: formData.description || null,
//         reference_no: formData.reference_no || null,
//         receipt_path: formData.receipt_path || null,
//         payment_status: formData.payment_status,
//       };

//       if (editingExpense) {
//         await updateExpense(editingExpense.id, expenseData);
//         Swal.fire({
//           icon: "success",
//           title: "Updated!",
//           text: "Expense updated successfully",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       } else {
//         await addExpense(expenseData);
//         Swal.fire({
//           icon: "success",
//           title: "Added!",
//           text: "Expense added successfully",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       }

//       await fetchExpenses();
//       resetModal();
//     } catch (error) {
//       console.error("Save error:", error);
//       setError(error.response?.data?.message || "Failed to save expense");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = (expense) => {
//     setEditingExpense(expense);
//     setFormData({
//       category: expense.category || "",
//       description: expense.description || "",
//       amount: expense.amount || "",
//       expense_date: expense.expense_date || "",
//       gst: expense.gst || "",
//       reference_no: expense.reference_no || "",
//       receipt_path: expense.receipt_path || "",
//       payment_status: expense.payment_status || "Paid",
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id, name) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: `Delete expense "${name || id}"?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     });

//     if (result.isConfirmed) {
//       try {
//         await deleteExpense(id);
//         Swal.fire({
//           icon: "success",
//           title: "Deleted!",
//           text: "Expense deleted successfully",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//         await fetchExpenses();
//       } catch (error) {
//         console.error("Delete error:", error);
//         Swal.fire({
//           icon: "error",
//           title: "Error!",
//           text: error.response?.data?.message || "Failed to delete expense",
//         });
//       }
//     }
//   };

//   const totalExpenses = expenses.reduce(
//     (sum, exp) => sum + (parseFloat(exp.amount) || 0),
//     0,
//   );
//   const totalTax = expenses.reduce(
//     (sum, exp) => sum + (parseFloat(exp.tax_amount) || 0),
//     0,
//   );

//   const handleGoBack = () => {
//     navigate("/dashboard");
//   };

//   if (loading) {
//     return (
//       <Container fluid className="p-4 bg-light">
//         <div className="text-center py-5">
//           <Spinner animation="border" variant="danger" size="lg" />
//           <h5 className="mt-3 text-muted">Loading expenses...</h5>
//         </div>
//       </Container>
//     );
//   }

//   return (
//     <Container fluid className="p-4 bg-light">
//       {/* Back Button */}
//       <div className="mb-3 d-flex align-items-center gap-3">
//         <Button
//           variant="link"
//           className="text-decoration-none p-0 d-flex align-items-center"
//           onClick={handleGoBack}
//         >
//           <FaArrowLeft className="me-2" /> Back to Dashboard
//         </Button>
//         <Button
//           variant="outline-secondary"
//           size="sm"
//           className="rounded-pill"
//           onClick={() => navigate("/dashboard")}
//         >
//           <FaHome className="me-1" /> Dashboard
//         </Button>
//       </div>

//       {/* Header */}
//       <div className="bg-gradient-danger text-white rounded-3 p-4 mb-4 shadow">
//         <div className="d-flex justify-content-between align-items-center">
//           <div>
//             <h2 className="fw-bold mb-1">
//               <FaMoneyBillWave className="me-2" /> Expenses
//             </h2>
//             <p className="mb-0 opacity-75">
//               Track and manage all business expenses, claim input tax credit
//             </p>
//           </div>
//           <Button
//             variant="light"
//             onClick={() => setShowModal(true)}
//             className="rounded-pill px-4"
//           >
//             <FaPlus className="me-2" /> Add Expense
//           </Button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <Row className="g-3 mb-4">
//         <Col md={4}>
//           <Card className="border-0 shadow-sm rounded-3 h-100">
//             <Card.Body className="p-3">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <small className="text-muted">Total Expenses</small>
//                   <h4 className="text-danger mb-0 fw-bold">
//                     ₹{totalExpenses.toLocaleString()}
//                   </h4>
//                 </div>
//                 <div className="bg-danger bg-opacity-10 rounded-circle p-3">
//                   <FaMoneyBillWave className="text-danger" size={24} />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="border-0 shadow-sm rounded-3 h-100">
//             <Card.Body className="p-3">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <small className="text-muted">Input Tax Credit (ITC)</small>
//                   <h4 className="text-success mb-0 fw-bold">
//                     ₹{totalTax.toLocaleString()}
//                   </h4>
//                 </div>
//                 <div className="bg-success bg-opacity-10 rounded-circle p-3">
//                   <FaPercent className="text-success" size={24} />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <Card className="border-0 shadow-sm rounded-3 h-100">
//             <Card.Body className="p-3">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <small className="text-muted">Net GST Liability</small>
//                   <h4 className="text-primary mb-0 fw-bold">
//                     ₹{(82800 - totalTax).toLocaleString()}
//                   </h4>
//                 </div>
//                 <div className="bg-primary bg-opacity-10 rounded-circle p-3">
//                   <FaChartLine className="text-primary" size={24} />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Expenses Table */}
//       <Card className="border-0 shadow-sm rounded-3">
//         <Card.Body className="p-0">
//           <div className="table-responsive">
//             <Table hover className="mb-0 align-middle">
//               <thead className="table-light">
//                 <tr>
//                   <th>Date</th>
//                   <th>Category</th>
//                   <th>Description</th>
//                   <th>Amount (₹)</th>
//                   <th>GST %</th>
//                   <th>GST Amount</th>
//                   <th>Total</th>
//                   <th>Ref No</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {expenses.map((expense) => (
//                   <tr key={expense.id}>
//                     <td>
//                       <FaCalendarAlt className="text-muted me-2" size={12} />
//                       {expense.expense_date}
//                     </td>
//                     <td>
//                       <Badge bg="secondary" className="rounded-pill px-3">
//                         {expense.category}
//                       </Badge>
//                     </td>
//                     <td className="text-muted">{expense.description || "-"}</td>
//                     <td className="fw-semibold">
//                       ₹{parseFloat(expense.amount || 0).toLocaleString()}
//                     </td>
//                     <td>
//                       <Badge bg="info" className="rounded-pill px-3">
//                         {expense.gst || 0}%
//                       </Badge>
//                     </td>
//                     <td className="text-muted">
//                       ₹{parseFloat(expense.tax_amount || 0).toLocaleString()}
//                     </td>
//                     <td className="fw-semibold text-primary">
//                       ₹{parseFloat(expense.total_amount || 0).toLocaleString()}
//                     </td>
//                     <td>
//                       <small className="text-muted">
//                         {expense.reference_no || "-"}
//                       </small>
//                     </td>
//                     <td>
//                       <Badge
//                         bg={
//                           expense.payment_status === "Paid"
//                             ? "success"
//                             : "warning"
//                         }
//                         className="rounded-pill px-3 py-2"
//                       >
//                         {expense.payment_status || "Pending"}
//                       </Badge>
//                     </td>
//                     <td>
//                       <Button
//                         variant="outline-primary"
//                         size="sm"
//                         className="me-1 rounded-circle"
//                         style={{ width: "32px", height: "32px", padding: "0" }}
//                         onClick={() => handleEdit(expense)}
//                       >
//                         <FaEdit />
//                       </Button>
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         className="rounded-circle"
//                         style={{ width: "32px", height: "32px", padding: "0" }}
//                         onClick={() =>
//                           handleDelete(expense.id, expense.category)
//                         }
//                       >
//                         <FaTrash />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//                 {expenses.length === 0 && (
//                   <tr>
//                     <td colSpan="10" className="text-center py-5">
//                       <div className="py-4">
//                         <FaMoneyBillWave
//                           size={40}
//                           className="text-muted mb-3"
//                         />
//                         <h5 className="text-muted">No expenses found</h5>
//                         <p className="text-muted small">
//                           Click "Add Expense" to create your first expense
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </Table>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* Add/Edit Expense Modal */}
//       <Modal
//         show={showModal}
//         onHide={resetModal}
//         centered
//         className="expense-modal"
//         size="lg"
//       >
//         <Modal.Header
//           closeButton
//           className="bg-danger text-white rounded-top-3 border-0"
//         >
//           <Modal.Title className="fw-bold">
//             <FaPlus className="me-2" />
//             {editingExpense ? "Edit Expense" : "Add New Expense"}
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body className="p-4">
//             {error && <Alert variant="danger">{error}</Alert>}

//             {/* Expense Details */}
//             <div className="bg-light p-3 rounded-3 mb-4">
//               <h6 className="mb-0 text-danger fw-bold">
//                 <FaTag className="me-2" /> Expense Details
//               </h6>
//             </div>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">
//                     Expense Category <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Select
//                     name="category"
//                     value={formData.category}
//                     onChange={handleChange}
//                     className="rounded-2"
//                     required
//                   >
//                     <option value="">Select Category</option>
//                     <option value="Rent">Rent</option>
//                     <option value="Utilities">Utilities</option>
//                     <option value="Salary">Salary</option>
//                     <option value="Marketing">Marketing</option>
//                     <option value="Travel">Travel</option>
//                     <option value="Office Supplies">Office Supplies</option>
//                     <option value="Other">Other</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">
//                     Expense Date <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="expense_date"
//                     value={formData.expense_date}
//                     onChange={handleChange}
//                     className="rounded-2"
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label className="fw-semibold">Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Describe the expense"
//                 className="rounded-2"
//               />
//             </Form.Group>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">
//                     Amount (₹) <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Control
//                     type="number"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleChange}
//                     placeholder="0"
//                     className="rounded-2"
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">Reference No</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="reference_no"
//                     value={formData.reference_no}
//                     onChange={handleChange}
//                     placeholder="Invoice/Bill number"
//                     className="rounded-2"
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             {/* Tax Information */}
//             <div className="bg-light p-3 rounded-3 mb-4 mt-3">
//               <h6 className="mb-0 text-danger fw-bold">
//                 <FaPercent className="me-2" /> Tax Information
//               </h6>
//             </div>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">GST Rate (%)</Form.Label>
//                   <Form.Select
//                     name="gst"
//                     value={formData.gst}
//                     onChange={handleChange}
//                     className="rounded-2"
//                   >
//                     <option value="0">0%</option>
//                     <option value="5">5%</option>
//                     <option value="12">12%</option>
//                     <option value="18">18%</option>
//                     <option value="28">28%</option>
//                   </Form.Select>
//                   <Form.Text className="text-muted small">
//                     Select applicable GST rate
//                   </Form.Text>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">Receipt Path</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="receipt_path"
//                     value={formData.receipt_path}
//                     onChange={handleChange}
//                     placeholder="Upload receipt URL or path"
//                     className="rounded-2"
//                   />
//                   <Form.Text className="text-muted small">
//                     Upload receipt file path
//                   </Form.Text>
//                 </Form.Group>
//               </Col>
//             </Row>

//             {/* Payment Information */}
//             <div className="bg-light p-3 rounded-3 mb-4 mt-3">
//               <h6 className="mb-0 text-danger fw-bold">
//                 <FaBuilding className="me-2" /> Payment Information
//               </h6>
//             </div>

//             <Form.Group className="mb-3">
//               <Form.Label className="fw-semibold">Payment Status</Form.Label>
//               <Form.Select
//                 name="payment_status"
//                 value={formData.payment_status}
//                 onChange={handleChange}
//                 className="rounded-2"
//               >
//                 <option value="Paid">Paid</option>
//                 <option value="Pending">Pending</option>
//               </Form.Select>
//             </Form.Group>

//             {formData.gst > 0 && formData.amount && (
//               <Alert variant="info" className="mt-3 rounded-3">
//                 <small>
//                   <strong>Tax Calculation:</strong>
//                   <br />
//                   Amount: ₹{parseFloat(formData.amount || 0).toLocaleString()}
//                   <br />
//                   GST ({formData.gst}%): ₹
//                   {(
//                     (parseFloat(formData.amount || 0) *
//                       parseFloat(formData.gst || 0)) /
//                     100
//                   ).toLocaleString()}
//                   <br />
//                   <strong>
//                     Total Amount: ₹
//                     {(
//                       parseFloat(formData.amount || 0) +
//                       (parseFloat(formData.amount || 0) *
//                         parseFloat(formData.gst || 0)) /
//                         100
//                     ).toLocaleString()}
//                   </strong>
//                 </small>
//               </Alert>
//             )}
//           </Modal.Body>
//           <Modal.Footer className="bg-light rounded-bottom-3 border-0">
//             <Button
//               variant="secondary"
//               onClick={resetModal}
//               className="rounded-pill px-4"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="danger"
//               type="submit"
//               disabled={submitting}
//               className="rounded-pill px-4"
//             >
//               {submitting ? (
//                 <Spinner animation="border" size="sm" />
//               ) : editingExpense ? (
//                 "Update Expense"
//               ) : (
//                 "Save Expense"
//               )}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>

//       <style jsx="true">{`
//         .bg-gradient-danger {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//         }
//         .table tbody tr:hover {
//           background-color: #f8f9fa;
//         }
//         .expense-modal .modal-content {
//           border-radius: 1rem;
//         }
//       `}</style>
//     </Container>
//   );
// };

// export default Expenses;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaChartLine,
  FaMoneyBillWave,
  FaRupeeSign,
  FaPercent,
  FaCalendarAlt,
  FaTag,
  FaBuilding,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../components/services/expenseService";
import Swal from "sweetalert2";

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    expense_date: "",  // Changed from expenseDate to expense_date
    gst: "0",
    reference_no: "",
    receipt_path: "",
    payment_status: "Paid",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch expenses on load
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await getExpenses();
      console.log("Fetched expenses:", response.data);

      let expensesData = [];
      if (response.data && response.data.data && response.data.data.data) {
        expensesData = response.data.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        expensesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        expensesData = response.data;
      } else if (Array.isArray(response)) {
        expensesData = response;
      }

      setExpenses(expensesData);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to load expenses",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTaxAndTotal = (amount, gstRate) => {
    const amt = parseFloat(amount) || 0;
    const gst = parseFloat(gstRate) || 0;
    const taxAmount = (amt * gst) / 100;
    const totalAmount = amt + taxAmount;
    return { taxAmount, totalAmount };
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      category: "",
      description: "",
      amount: "",
      expense_date: "",
      gst: "0",
      reference_no: "",
      receipt_path: "",
      payment_status: "Paid",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validation - using correct field name expense_date
    if (!formData.category) {
      setError("Category is required");
      setSubmitting(false);
      return;
    }
    if (!formData.amount) {
      setError("Amount is required");
      setSubmitting(false);
      return;
    }
    if (!formData.expense_date) {
      setError("Date is required");
      setSubmitting(false);
      return;
    }

    try {
      const { taxAmount, totalAmount } = calculateTaxAndTotal(
        formData.amount,
        formData.gst,
      );

      // Convert date to ISO format (e.g., "2026-04-15" -> "2026-04-15T18:30:00.000Z")
      const expenseDateObj = new Date(formData.expense_date);
      // Set to noon (12:00:00) to avoid timezone issues
      expenseDateObj.setHours(12, 0, 0, 0);
      const formattedExpenseDate = expenseDateObj.toISOString();

      console.log("Original date:", formData.expense_date);
      console.log("Formatted date:", formattedExpenseDate);

      const expenseData = {
        category: formData.category,
        expense_date: formattedExpenseDate,
        amount: parseFloat(formData.amount),
        tax_amount: taxAmount,
        total_amount: totalAmount,
        description: formData.description || null,
        reference_no: formData.reference_no || null,
        receipt_path: formData.receipt_path || null,
        payment_status: formData.payment_status,
        created_by: 4,
      };

      console.log("Sending expense data:", expenseData);

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Expense updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await addExpense(expenseData);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Expense added successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      await fetchExpenses();
      resetModal();
    } catch (error) {
      console.error("Save error:", error);
      setError(error.response?.data?.message || "Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    
    // Convert ISO date to YYYY-MM-DD for date input
    let formattedDate = "";
    if (expense.expense_date) {
      formattedDate = expense.expense_date.split('T')[0];
    }
    
    setFormData({
      category: expense.category || "",
      description: expense.description || "",
      amount: expense.amount || "",
      expense_date: formattedDate,
      gst: expense.gst || "0",
      reference_no: expense.reference_no || "",
      receipt_path: expense.receipt_path || "",
      payment_status: expense.payment_status || "Paid",
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete expense "${name || id}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteExpense(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Expense deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        await fetchExpenses();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete expense",
        });
      }
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + (parseFloat(exp.amount) || 0),
    0,
  );
  const totalTax = expenses.reduce(
    (sum, exp) => sum + (parseFloat(exp.tax_amount) || 0),
    0,
  );

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light">
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" size="lg" />
          <h5 className="mt-3 text-muted">Loading expenses...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center"
          onClick={handleGoBack}
        >
          <FaArrowLeft className="me-2" /> Back to Dashboard
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/dashboard")}
        >
          <FaHome className="me-1" /> Dashboard
        </Button>
      </div>

      {/* Header */}
      <div className="bg-gradient-danger text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaMoneyBillWave className="me-2" /> Expenses
            </h2>
            <p className="mb-0 opacity-75">
              Track and manage all business expenses, claim input tax credit
            </p>
          </div>
          <Button
            variant="light"
            onClick={() => setShowModal(true)}
            className="rounded-pill px-4"
          >
            <FaPlus className="me-2" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Expenses</small>
                  <h4 className="text-danger mb-0 fw-bold">
                    ₹{totalExpenses.toLocaleString()}
                  </h4>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                  <FaMoneyBillWave className="text-danger" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Input Tax Credit (ITC)</small>
                  <h4 className="text-success mb-0 fw-bold">
                    ₹{totalTax.toLocaleString()}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FaPercent className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Net GST Liability</small>
                  <h4 className="text-primary mb-0 fw-bold">
                    ₹{(82800 - totalTax).toLocaleString()}
                  </h4>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <FaChartLine className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Expenses Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount (₹)</th>
                  <th>GST %</th>
                  <th>GST Amount</th>
                  <th>Total</th>
                  <th>Ref No</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <FaCalendarAlt className="text-muted me-2" size={12} />
                      {expense.expense_date}
                    </td>
                    <td>
                      <Badge bg="secondary" className="rounded-pill px-3">
                        {expense.category}
                      </Badge>
                    </td>
                    <td className="text-muted">{expense.description || "-"}</td>
                    <td className="fw-semibold">
                      ₹{parseFloat(expense.amount || 0).toLocaleString()}
                    </td>
                    <td>
                      <Badge bg="info" className="rounded-pill px-3">
                        {expense.gst || 0}%
                      </Badge>
                    </td>
                    <td className="text-muted">
                      ₹{parseFloat(expense.tax_amount || 0).toLocaleString()}
                    </td>
                    <td className="fw-semibold text-primary">
                      ₹{parseFloat(expense.total_amount || 0).toLocaleString()}
                    </td>
                    <td>
                      <small className="text-muted">
                        {expense.reference_no || "-"}
                      </small>
                    </td>
                    <td>
                      <Badge
                        bg={
                          expense.payment_status === "Paid"
                            ? "success"
                            : "warning"
                        }
                        className="rounded-pill px-3 py-2"
                      >
                        {expense.payment_status || "Pending"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => handleEdit(expense)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() =>
                          handleDelete(expense.id, expense.category)
                        }
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="py-4">
                        <FaMoneyBillWave
                          size={40}
                          className="text-muted mb-3"
                        />
                        <h5 className="text-muted">No expenses found</h5>
                        <p className="text-muted small">
                          Click "Add Expense" to create your first expense
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Expense Modal */}
      <Modal
        show={showModal}
        onHide={resetModal}
        centered
        className="expense-modal"
        size="lg"
      >
        <Modal.Header
          closeButton
          className="bg-danger text-white rounded-top-3 border-0"
        >
          <Modal.Title className="fw-bold">
            <FaPlus className="me-2" />
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Expense Details */}
            <div className="bg-light p-3 rounded-3 mb-4">
              <h6 className="mb-0 text-danger fw-bold">
                <FaTag className="me-2" /> Expense Details
              </h6>
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Expense Category <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="rounded-2"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salary">Salary</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Travel">Travel</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Expense Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="expense_date"
                    value={formData.expense_date}
                    onChange={handleChange}
                    className="rounded-2"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the expense"
                className="rounded-2"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Amount (₹) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0"
                    className="rounded-2"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Reference No</Form.Label>
                  <Form.Control
                    type="text"
                    name="reference_no"
                    value={formData.reference_no}
                    onChange={handleChange}
                    placeholder="Invoice/Bill number"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Tax Information */}
            <div className="bg-light p-3 rounded-3 mb-4 mt-3">
              <h6 className="mb-0 text-danger fw-bold">
                <FaPercent className="me-2" /> Tax Information
              </h6>
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">GST Rate (%)</Form.Label>
                  <Form.Select
                    name="gst"
                    value={formData.gst}
                    onChange={handleChange}
                    className="rounded-2"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </Form.Select>
                  <Form.Text className="text-muted small">
                    Select applicable GST rate
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Receipt Path</Form.Label>
                  <Form.Control
                    type="text"
                    name="receipt_path"
                    value={formData.receipt_path}
                    onChange={handleChange}
                    placeholder="Upload receipt URL or path"
                    className="rounded-2"
                  />
                  <Form.Text className="text-muted small">
                    Upload receipt file path
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Payment Information */}
            <div className="bg-light p-3 rounded-3 mb-4 mt-3">
              <h6 className="mb-0 text-danger fw-bold">
                <FaBuilding className="me-2" /> Payment Information
              </h6>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Payment Status</Form.Label>
              <Form.Select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                className="rounded-2"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </Form.Select>
            </Form.Group>

            {formData.gst > 0 && formData.amount && (
              <Alert variant="info" className="mt-3 rounded-3">
                <small>
                  <strong>Tax Calculation:</strong>
                  <br />
                  Amount: ₹{parseFloat(formData.amount || 0).toLocaleString()}
                  <br />
                  GST ({formData.gst}%): ₹
                  {(
                    (parseFloat(formData.amount || 0) *
                      parseFloat(formData.gst || 0)) /
                    100
                  ).toLocaleString()}
                  <br />
                  <strong>
                    Total Amount: ₹
                    {(
                      parseFloat(formData.amount || 0) +
                      (parseFloat(formData.amount || 0) *
                        parseFloat(formData.gst || 0)) /
                        100
                    ).toLocaleString()}
                  </strong>
                </small>
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light rounded-bottom-3 border-0">
            <Button
              variant="secondary"
              onClick={resetModal}
              className="rounded-pill px-4"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="submit"
              disabled={submitting}
              className="rounded-pill px-4"
            >
              {submitting ? (
                <Spinner animation="border" size="sm" />
              ) : editingExpense ? (
                "Update Expense"
              ) : (
                "Save Expense"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style jsx="true">{`
        .bg-gradient-danger {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
        .expense-modal .modal-content {
          border-radius: 1rem;
        }
      `}</style>
    </Container>
  );
};

export default Expenses;