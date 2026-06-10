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
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaMoneyBillWave,
  FaPercent,
  FaCalendarAlt,
  FaTag,
  FaCheckCircle,
  FaTimes,
  FaFileInvoice,
  FaUser,
  FaCreditCard,
  FaInfoCircle,
} from "react-icons/fa";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getExpenseById, updateExpense } from "../../api/tenant/expense.api";

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("expense");
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    expense_date: "",
    tax_amount: "0",
    total_amount: "0",
    gst: "0",
    payment_status: "Pending",
    reference_no: "",
    created_by: "",
  });

  useEffect(() => {
    loadExpense();
  }, [id]);

  const loadExpense = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getExpenseById(id);
      console.log("Expense response:", response);

      let expenseData = null;
      if (response?.data?.data) expenseData = response.data.data;
      else if (response?.data) expenseData = response.data;
      else expenseData = response;

      if (!expenseData) {
        setError("Expense not found");
        setLoading(false);
        return;
      }

      console.log("Expense data:", expenseData);

      // Calculate GST rate from tax_amount and amount
      let gstRate = 0;
      if (expenseData.amount > 0 && expenseData.tax_amount > 0) {
        gstRate = (expenseData.tax_amount / expenseData.amount) * 100;
      }

      setFormData({
        category: expenseData.category || "",
        description: expenseData.description || "",
        amount: expenseData.amount || "",
        expense_date:
          expenseData.expense_date?.split("T")[0] ||
          expenseData.expenseDate?.split("T")[0] ||
          "",
        tax_amount: expenseData.tax_amount || expenseData.taxAmount || "0",
        total_amount:
          expenseData.total_amount || expenseData.totalAmount || "0",
        gst: gstRate.toFixed(0),
        payment_status:
          expenseData.payment_status || expenseData.paymentStatus || "Pending",
        reference_no:
          expenseData.reference_no ||
          expenseData.referenceNo ||
          `EXP-${expenseData.id}`,
        created_by: expenseData.created_by || expenseData.createdBy || "Admin",
      });
    } catch (err) {
      console.error("Failed to load expense:", err);
      const errorMsg = err.response?.data?.message || "Failed to load expense";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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

  const calculateTaxAndTotal = (amount, gstRate) => {
    const amt = parseFloat(amount) || 0;
    const gst = parseFloat(gstRate) || 0;
    const taxAmount = (amt * gst) / 100;
    const totalAmount = amt + taxAmount;
    return {
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
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
        formData.gst,
      );

      const expenseData = {
        category: formData.category,
        expenseDate: formData.expense_date,
        amount: parseFloat(formData.amount),
        taxAmount: parseFloat(taxAmount),
        totalAmount: parseFloat(totalAmount),
        description: formData.description || null,
        paymentStatus: formData.payment_status,
      };

      console.log("Updating expense data:", expenseData);

      await updateExpense(id, expenseData);

      toast.success(`✅ Expense updated successfully! 🎉`, {
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
      }, 1500);
    } catch (error) {
      console.error("Update error:", error);

      let errorMessage = "Failed to update expense";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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

  if (loading) {
    return (
      <Container
        fluid
        className="p-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
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
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading expense data...</h5>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        fluid
        className="p-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
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
        <Alert variant="secondary" className="text-center">
          <h4>Expense not found</h4>
          <p>The expense you're looking for doesn't exist.</p>
          <Button variant="secondary" onClick={() => navigate("/expenses")}>
            Back to Expenses
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="px-4 py-3"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
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

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-0 pt-3 px-4">
            <div className="d-flex gap-2 border-bottom pb-2">
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("expense")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "expense" ? "bg-light" : ""}`}
                style={{
                  color:
                    activeTab === "expense" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaMoneyBillWave className="me-2" /> Expense Details
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("tax")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "tax" ? "bg-light" : ""}`}
                style={{
                  color: activeTab === "tax" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaPercent className="me-2" /> Tax Information
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("payment")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "payment" ? "bg-light" : ""}`}
                style={{
                  color:
                    activeTab === "payment" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaCreditCard className="me-2" /> Payment Information
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="p-4">
            {/* Expense Details Tab */}
            {activeTab === "expense" && (
              <div>
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaTag className="me-2" /> Basic Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        isInvalid={!!formErrors.category}
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
                      {formErrors.category && (
                        <Form.Text className="text-danger">
                          {formErrors.category}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FaCalendarAlt className="me-1" /> Expense Date *
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="expense_date"
                        value={formData.expense_date}
                        onChange={handleChange}
                        isInvalid={!!formErrors.expense_date}
                        max={new Date().toISOString().split("T")[0]}
                      />
                      {formErrors.expense_date && (
                        <Form.Text className="text-danger">
                          {formErrors.expense_date}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the expense"
                      />
                      <Form.Text className="text-muted">
                        Provide additional details about this expense
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}

            {/* Tax Information Tab */}
            {activeTab === "tax" && (
              <div>
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaPercent className="me-2" /> Tax Calculation
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Amount (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        isInvalid={!!formErrors.amount}
                      />
                      {formErrors.amount && (
                        <Form.Text className="text-danger">
                          {formErrors.amount}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
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

                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaInfoCircle className="me-2" /> Tax Summary
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
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
                    <Form.Group>
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

                {parseFloat(formData.gst) > 0 &&
                  formData.amount &&
                  parseFloat(formData.amount) > 0 && (
                    <Alert variant="info" className="mt-4 rounded-3">
                      <small>
                        <strong>Tax Calculation Summary:</strong>
                        <br />• Amount: ₹
                        {parseFloat(formData.amount || 0).toLocaleString()}
                        <br />• GST ({formData.gst}%): ₹
                        {(
                          (parseFloat(formData.amount) *
                            parseFloat(formData.gst)) /
                          100
                        ).toLocaleString()}
                        <br />•{" "}
                        <strong>
                          Total Amount: ₹
                          {(
                            parseFloat(formData.amount) +
                            (parseFloat(formData.amount) *
                              parseFloat(formData.gst)) /
                              100
                          ).toLocaleString()}
                        </strong>
                      </small>
                    </Alert>
                  )}
              </div>
            )}

            {/* Payment Information Tab */}
            {activeTab === "payment" && (
              <div>
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaCreditCard className="me-2" /> Payment Details
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FaCheckCircle className="me-1" /> Payment Status
                      </Form.Label>
                      <Form.Select
                        name="payment_status"
                        value={formData.payment_status}
                        onChange={handleChange}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Select whether this expense has been paid or pending
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FaInfoCircle className="me-1" /> Confirmation
                      </Form.Label>
                      <Alert variant="success" className="mt-1 p-3 rounded-3">
                        <small>
                          <strong>Ready to Update?</strong>
                          <br />
                          Please review all the expense details before updating.
                          <br />
                          You can edit the expense again later if needed.
                        </small>
                      </Alert>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}
          </Card.Body>

          {/* Action Buttons inside Card Footer */}
          <Card.Footer className="bg-white border-top-0 pb-4 px-4">
            <div className="d-flex justify-content-between gap-3">
              <Button
                onClick={() => navigate("/expenses")}
                style={{
                  backgroundColor: "#6c757d",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#fff",
                }}
              >
                <FaTimes size={14} /> Cancel
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: "rgb(30, 58, 111)",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
                }}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Update Expense
                  </>
                )}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Form>

      <style>{`
        .rounded-3 {
          border-radius: 12px !important;
        }
        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </Container>
  );
};

export default EditExpense;