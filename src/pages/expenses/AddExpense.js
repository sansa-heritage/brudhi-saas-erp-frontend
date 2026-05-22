import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaMoneyBillWave,
  FaPercent,
  FaTag,
  FaCheckCircle,
  FaUser,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addExpense } from "../../api/tenant/expense.api";

const AddExpense = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    expense_date: new Date().toISOString().split('T')[0],
    tax_amount: "0",
    total_amount: "0",
    gst: "0",
    payment_status: "Paid",
    created_by: 1,
  });

  const validateForm = () => {
    const errors = {};
    
    if (!formData.category) {
      errors.category = "Category is required";
    }
    
    if (!formData.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be a positive number";
    }
    
    if (!formData.expense_date) {
      errors.expense_date = "Expense date is required";
    } else {
      const selectedDate = new Date(formData.expense_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        errors.expense_date = "Expense date cannot be in the future";
      }
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.warning("⚠️ Please fix the validation errors", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }
    
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "amount" || name === "gst") {
      const amount =
        name === "amount" ? parseFloat(value) : parseFloat(formData.amount);
      const gst = name === "gst" ? parseFloat(value) : parseFloat(formData.gst);
      if (!isNaN(amount) && !isNaN(gst) && amount > 0) {
        const taxAmount = (amount * gst) / 100;
        const totalAmount = amount + taxAmount;
        setFormData((prev) => ({
          ...prev,
          tax_amount: taxAmount.toFixed(2),
          total_amount: totalAmount.toFixed(2),
        }));
      } else if (amount > 0) {
        setFormData((prev) => ({
          ...prev,
          tax_amount: "0",
          total_amount: amount.toFixed(2),
        }));
      }
    }
  };

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
        overlay={<Tooltip id={`tooltip-${fieldValue}`}>{validationError}</Tooltip>}
      >
        <span className="text-danger ms-1" style={{ cursor: "pointer" }}>
          <FaExclamationTriangle size={14} />
        </span>
      </OverlayTrigger>
    );
  };

  const calculateTaxAndTotal = (amount, gstRate) => {
    const amt = parseFloat(amount) || 0;
    const gst = parseFloat(gstRate) || 0;
    const taxAmount = (amt * gst) / 100;
    const totalAmount = amt + taxAmount;
    return { taxAmount: taxAmount.toFixed(2), totalAmount: totalAmount.toFixed(2) };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);

    try {
      const { taxAmount, totalAmount } = calculateTaxAndTotal(
        formData.amount,
        formData.gst
      );

      const expenseData = {
        category: formData.category,
        expenseDate: formData.expense_date,
        amount: parseFloat(formData.amount),
        taxAmount: parseFloat(taxAmount),
        totalAmount: parseFloat(totalAmount),
        description: formData.description || null,
        paymentStatus: formData.payment_status,
        createdBy: formData.created_by,
      };

      console.log("Sending expense data:", expenseData);

      const response = await addExpense(expenseData);
      console.log("Add expense response:", response);

      // ✅ SUCCESS TOAST MESSAGE
      toast.success(`✅ Expense   added successfully! 🎉`, {
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
        navigate("/expenses");
      }, 2000);
    } catch (error) {
      console.error("Save error:", error);
      
      let errorMessage = "Failed to save expense";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(", ");
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate("/expenses");
    toast.info("🔙 Returning to expenses list", {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
      transition: Bounce,
    });
  };

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
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
      <div className="bg-secondary text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaUser className="me-2" /> Add New Expense
            </h2>
            <p className="mb-0 opacity-75">Fill in the details to add a new expense</p>
          </div>
          <Button
            variant="light"
            onClick={handleGoBack}
            className="rounded-pill px-4"
          >
            <FaArrowLeft className="me-2" /> Back to Expenses
          </Button>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Left Column - Expense Details */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaMoneyBillWave className="me-2 text-secondary" /> Expense Details
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      isInvalid={!!formErrors.category}
                      className="flex-grow-1"
                    >
                      <option value="">Select Category</option>
                      <option value="Rent">Rent</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Salary">Salary</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Travel">Travel</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Transport">Transport</option>
                      <option value="Legal">Legal</option>
                      <option value="Software">Software</option>
                      <option value="Training">Training</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                    {getValidationIcon(formData.category, formErrors.category)}
                  </div>
                  {formErrors.category && (
                    <Form.Text className="text-danger">{formErrors.category}</Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Expense Date *</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="date"
                      name="expense_date"
                      value={formData.expense_date}
                      onChange={handleChange}
                      isInvalid={!!formErrors.expense_date}
                      max={new Date().toISOString().split('T')[0]}
                      className="flex-grow-1"
                    />
                    {getValidationIcon(formData.expense_date, formErrors.expense_date)}
                  </div>
                  {formErrors.expense_date && (
                    <Form.Text className="text-danger">{formErrors.expense_date}</Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the expense (optional)"
                  />
                  <Form.Text className="text-muted">
                    Provide additional details about this expense
                  </Form.Text>
                </Form.Group>

                <h6 className="fw-bold mb-3 mt-4">
                  <FaPercent className="me-2 text-secondary" /> Tax Information
                </h6>
                <hr />

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount (₹) *</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0.01"
                          isInvalid={!!formErrors.amount}
                          className="flex-grow-1"
                        />
                        {getValidationIcon(formData.amount, formErrors.amount)}
                      </div>
                      {formErrors.amount && (
                        <Form.Text className="text-danger">{formErrors.amount}</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>GST Rate (%)</Form.Label>
                      <Form.Select
                        name="gst"
                        value={formData.gst}
                        onChange={handleChange}
                      >
                        <option value="0">0% (No GST)</option>
                        <option value="5">5% (Essential Goods)</option>
                        <option value="12">12% (Standard Rate)</option>
                        <option value="18">18% (Standard Rate)</option>
                        <option value="28">28% (Luxury Rate)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Amount (₹)</Form.Label>
                      <Form.Control
                        type="text"
                        name="tax_amount"
                        value={formData.tax_amount}
                        readOnly
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Total Amount (₹)</Form.Label>
                      <Form.Control
                        type="text"
                        name="total_amount"
                        value={formData.total_amount}
                        readOnly
                        disabled
                        className="bg-light text-primary fw-bold"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Payment & Additional Info */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaCheckCircle className="me-2 text-secondary" /> Payment Information
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Payment Status</Form.Label>
                  <Form.Select
                    name="payment_status"
                    value={formData.payment_status}
                    onChange={handleChange}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Created By</Form.Label>
                  <Form.Control
                    type="text"
                    value="Admin User"
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    This will be automatically populated from your profile
                  </Form.Text>
                </Form.Group>

                {/* Tax Summary Alert */}
                {parseFloat(formData.gst) > 0 && formData.amount && parseFloat(formData.amount) > 0 && (
                  <Alert variant="info" className="mt-3 rounded-3">
                    <small>
                      <strong>Tax Calculation Summary:</strong>
                      <br />• Amount: ₹{parseFloat(formData.amount || 0).toLocaleString()}
                      <br />• GST ({formData.gst}%): ₹{(
                        (parseFloat(formData.amount) * parseFloat(formData.gst)) / 100
                      ).toLocaleString()}
                      <br />•{" "}
                      <strong>
                        Total Amount: ₹{(
                          parseFloat(formData.amount) +
                          (parseFloat(formData.amount) * parseFloat(formData.gst)) / 100
                        ).toLocaleString()}
                      </strong>
                    </small>
                  </Alert>
                )}

                <h6 className="fw-bold mb-3 mt-4">
                  <FaTag className="me-2 text-secondary" /> Additional Notes
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    placeholder="Any additional notes about this expense..."
                  />
                  <Form.Text className="text-muted">
                    Add any extra information or remarks about this expense
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button
            variant="secondary"
            type="submit"
            disabled={submitting}
            className="rounded-pill px-4"
            style={{ backgroundColor: "#6c757d", border: "none" }}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
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
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
      `}</style>
    </Container>
  );
};

export default AddExpense;