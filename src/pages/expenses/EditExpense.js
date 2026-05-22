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
  FaHome,
  FaUser,
  FaFileInvoice,
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

      toast.success(`✓ Expense updated successfully!`, {
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

      toast.error(`✗ ${errorMessage}`, {
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

  const handleCancel = () => {
    navigate("/expenses");
  };

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light">
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
          <h5 className="mt-3">Loading expense details...</h5>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4 bg-light">
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
          <h5>Error Loading Expense</h5>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => navigate("/expenses")}>
            Back to Expenses
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
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

      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center text-secondary"
          onClick={() => navigate("/expenses")}
        >
          <FaArrowLeft className="me-2" /> Back to Expenses
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/expenses")}
        >
          <FaHome className="me-1" /> Expenses
        </Button>
      </div>

      {/* Header */}
      <div
        className="bg-secondary text-white rounded-3 p-4 mb-4 shadow"
        style={{ backgroundColor: "#6c757d" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaMoneyBillWave className="me-2" /> Edit Expense
            </h2>
            <p className="mb-0 opacity-75">Update expense details</p>
          </div>
          <div className="bg-secondary bg-opacity-20 rounded-circle p-3">
            <FaMoneyBillWave size={28} className="text-white" />
          </div>
        </div>
      </div>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-4">
              {/* Reference Number Display */}
              <div className="bg-light p-3 rounded-3 mb-4">
                <Row>
                  <Col md={6}>
                    <small className="text-muted">Reference Number</small>
                    <div className="fw-bold text-secondary">
                      <FaFileInvoice className="me-2" />
                      {formData.reference_no}
                    </div>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">Created By</small>
                    <div className="fw-semibold">
                      <FaUser className="me-2" />
                      {formData.created_by}
                    </div>
                  </Col>
                </Row>
              </div>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <FaTag className="me-1" /> Category{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        isInvalid={!!formErrors.category}
                        className="rounded-2"
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
                      <Form.Control.Feedback type="invalid">
                        {formErrors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <FaCalendarAlt className="me-1" /> Expense Date{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="expense_date"
                        value={formData.expense_date}
                        onChange={handleChange}
                        isInvalid={!!formErrors.expense_date}
                        max={new Date().toISOString().split("T")[0]}
                        className="rounded-2"
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.expense_date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
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
                        <FaMoneyBillWave className="me-1" /> Amount (₹){" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        isInvalid={!!formErrors.amount}
                        className="rounded-2"
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.amount}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <FaPercent className="me-1" /> GST Rate (%)
                      </Form.Label>
                      <Form.Select
                        name="gst"
                        value={formData.gst}
                        onChange={handleChange}
                        className="rounded-2"
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
                      <Form.Label className="fw-semibold">
                        <FaPercent className="me-1" /> Tax Amount (₹)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="tax_amount"
                        value={formData.tax_amount}
                        readOnly
                        disabled
                        className="bg-light rounded-2"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <FaMoneyBillWave className="me-1" /> Total Amount (₹)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="total_amount"
                        value={formData.total_amount}
                        readOnly
                        disabled
                        className="bg-light text-black fw-bold rounded-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <FaCheckCircle className="me-1" /> Payment Status
                      </Form.Label>
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
                  </Col>
                </Row>

                {parseFloat(formData.gst) > 0 &&
                  formData.amount &&
                  parseFloat(formData.amount) > 0 && (
                    <Alert variant="info" className="mt-3 rounded-3">
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
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" /> Update Expense
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
      `}</style>
    </Container>
  );
};

export default EditExpense;