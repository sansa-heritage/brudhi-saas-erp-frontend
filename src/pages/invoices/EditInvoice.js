import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaEdit } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateInvoice, getInvoiceById } from "../../api/tenant/invoice.api";
import { getCustomers } from "../../api/tenant/customer.api";
import { getDealers } from "../../api/tenant/dealer.api";
import { cylinderTypeApi } from "../../api/tenant/masterData.api";

const EditInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loadingParties, setLoadingParties] = useState(false);
  const [partyType, setPartyType] = useState("customer");
  const [cylinderTypes, setCylinderTypes] = useState([]);
  const [loadingCylinderTypes, setLoadingCylinderTypes] = useState(false);
  const [originalInvoice, setOriginalInvoice] = useState(null);

  const [invoiceData, setInvoiceData] = useState({
    partyId: "",
    partyName: "",
    partyGst: "",
    partyAddress: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    discountType: "percentage",
    discountValue: 0,
    roundOff: 0,
    paymentStatus: "unpaid",
    paidAmount: 0,
    paymentMethod: "",
    transactionId: "",
    notes: "",
    termsConditions: "",
  });

  const [items, setItems] = useState([
    {
      cylinderTypeId: "",
      quantity: 1,
      rate: 0,
      gstPercent: 18,
      cessPercent: 0,
      discountPercent: 0,
    },
  ]);

  // Fetch cylinder types on component mount
  useEffect(() => {
    fetchCylinderTypes();
    fetchInvoice();
  }, []);

  // Fetch parties when party type changes
  useEffect(() => {
    if (partyType === "customer") {
      fetchCustomers();
    } else {
      fetchDealers();
    }
  }, [partyType]);

  // After customers or dealers are loaded, auto-fill the selected party
  useEffect(() => {
    if (originalInvoice && (customers.length > 0 || dealers.length > 0)) {
      const partyList = partyType === "customer" ? customers : dealers;
      const originalPartyId = originalInvoice.partyId || originalInvoice.party_id;
      
      const existingParty = partyList.find(party => 
        party.id === originalPartyId || 
        party.id === parseInt(originalPartyId)
      );
      
      if (existingParty) {
        setInvoiceData(prev => ({
          ...prev,
          partyId: existingParty.id,
          partyName: existingParty.name || existingParty.customer_name || existingParty.dealer_name || "",
          partyGst: existingParty.gst_number || existingParty.gst || "",
          partyAddress: existingParty.address || "",
        }));
      }
    }
  }, [customers, dealers, partyType, originalInvoice]);

  const fetchInvoice = async () => {
    setFetching(true);
    try {
      const response = await getInvoiceById(id);
      console.log("Invoice response:", response);

      const invoice = response?.data?.data || response?.data || response;
      
      if (invoice) {
        console.log("Found invoice:", invoice);
        setOriginalInvoice(invoice);
        
        // Set party type based on invoice data
        const invoicePartyType = invoice.partyType || invoice.party_type || "customer";
        setPartyType(invoicePartyType);
        
        // Format date fields
        const formatDate = (dateString) => {
          if (!dateString) return "";
          return dateString.split('T')[0];
        };
        
        // Set invoice data
        setInvoiceData({
          partyId: invoice.partyId || invoice.party_id || "",
          partyName: invoice.partyName || invoice.party_name || "",
          partyGst: invoice.partyGst || invoice.party_gst || "",
          partyAddress: invoice.partyAddress || invoice.party_address || "",
          invoiceDate: formatDate(invoice.invoiceDate || invoice.invoice_date) || new Date().toISOString().split("T")[0],
          dueDate: formatDate(invoice.dueDate || invoice.due_date) || "",
          discountType: invoice.discountType || invoice.discount_type || "percentage",
          discountValue: invoice.discountValue || invoice.discount_value || 0,
          roundOff: invoice.roundOff || invoice.round_off || 0,
          paymentStatus: invoice.paymentStatus || invoice.payment_status || "unpaid",
          paidAmount: invoice.paidAmount || invoice.paid_amount || 0,
          paymentMethod: invoice.paymentMethod || invoice.payment_method || "",
          transactionId: invoice.transactionId || invoice.transaction_id || "",
          notes: invoice.notes || "",
          termsConditions: invoice.termsConditions || invoice.terms_conditions || "",
        });

        // Set items
        const invoiceItems = invoice.items || invoice.invoice_items || [];
        if (invoiceItems && invoiceItems.length > 0) {
          const formattedItems = invoiceItems.map((item) => ({
            cylinderTypeId: item.cylinderTypeId || item.cylinder_type_id || item.cylinderType?.id || "",
            quantity: item.quantity || 1,
            rate: item.rate || 0,
            gstPercent: item.gstPercent || item.gst_percent || 18,
            cessPercent: item.cessPercent || item.cess_percent || 0,
            discountPercent: item.discountPercent || item.discount_percent || 0,
          }));
          setItems(formattedItems);
        }
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to load invoice data", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      setTimeout(() => {
        navigate("/invoices");
      }, 2000);
    } finally {
      setFetching(false);
    }
  };

  const fetchCylinderTypes = async () => {
    setLoadingCylinderTypes(true);
    try {
      const response = await cylinderTypeApi.getAll();
      console.log("Cylinder types response:", response);

      let cylinderList = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        cylinderList = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        cylinderList = response.data;
      } else if (Array.isArray(response)) {
        cylinderList = response;
      }

      console.log("Extracted cylinder types:", cylinderList);
      setCylinderTypes(cylinderList);
    } catch (error) {
      console.error("Error fetching cylinder types:", error);
      toast.error("Failed to load cylinder types", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setLoadingCylinderTypes(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingParties(true);
    try {
      const response = await getCustomers();
      console.log("Customers response:", response);

      let customerList = [];
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        customerList = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        customerList = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        customerList = response.data;
      } else if (Array.isArray(response)) {
        customerList = response;
      }

      console.log("Extracted customers:", customerList);
      setCustomers(customerList);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setLoadingParties(false);
    }
  };

  const fetchDealers = async () => {
    setLoadingParties(true);
    try {
      const response = await getDealers();
      console.log("Dealers response:", response);

      let dealerList = [];
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        dealerList = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        dealerList = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        dealerList = response.data;
      } else if (Array.isArray(response)) {
        dealerList = response;
      }

      console.log("Extracted dealers:", dealerList);
      setDealers(dealerList);
    } catch (error) {
      console.error("Error fetching dealers:", error);
      toast.error("Failed to load dealers", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setLoadingParties(false);
    }
  };

  const handlePartyTypeChange = (type) => {
    setPartyType(type);
    setInvoiceData({
      ...invoiceData,
      partyId: "",
      partyName: "",
      partyGst: "",
      partyAddress: "",
    });
    if (errors.partyId) {
      setErrors({ ...errors, partyId: "" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({
      ...invoiceData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handlePartySelect = (e) => {
    const partyId = e.target.value;
    const partyList = partyType === "customer" ? customers : dealers;
    const selectedParty = partyList.find(
      (party) => party.id === parseInt(partyId)
    );

    console.log("Selected party:", selectedParty);

    if (selectedParty) {
      setInvoiceData({
        ...invoiceData,
        partyId: selectedParty.id,
        partyName:
          selectedParty.name ||
          selectedParty.customer_name ||
          selectedParty.dealer_name ||
          "",
        partyGst: selectedParty.gst_number || selectedParty.gst || "",
        partyAddress: selectedParty.address || "",
      });
    } else {
      setInvoiceData({
        ...invoiceData,
        partyId: "",
        partyName: "",
        partyGst: "",
        partyAddress: "",
      });
    }

    if (errors.partyId) {
      setErrors({ ...errors, partyId: "" });
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        cylinderTypeId: "",
        quantity: 1,
        rate: 0,
        gstPercent: 18,
        cessPercent: 0,
        discountPercent: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    }, 0);
  };

  const calculateGST = () => {
    return items.reduce((sum, item) => {
      const taxable = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      return sum + taxable * ((Number(item.gstPercent) || 0) / 100);
    }, 0);
  };

  const calculateCess = () => {
    return items.reduce((sum, item) => {
      const taxable = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      return sum + taxable * ((Number(item.cessPercent) || 0) / 100);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const gstAmount = calculateGST();
  const cessAmount = calculateCess();

  let discountAmount = 0;
  if (invoiceData.discountType === "percentage") {
    discountAmount = (subtotal * (Number(invoiceData.discountValue) || 0)) / 100;
  } else {
    discountAmount = Number(invoiceData.discountValue) || 0;
  }

  const taxableAmount = subtotal - discountAmount;
  const totalAmount = taxableAmount + gstAmount + cessAmount;
  const netAmount = totalAmount + (Number(invoiceData.roundOff) || 0);

  const validateForm = () => {
    const newErrors = {};

    if (!invoiceData.partyId) {
      newErrors.partyId = `Please select a ${
        partyType === "customer" ? "customer" : "dealer"
      }`;
    }
    if (!invoiceData.partyName) {
      newErrors.partyName = "Party name is required";
    }
    if (!invoiceData.invoiceDate) {
      newErrors.invoiceDate = "Invoice date is required";
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].cylinderTypeId) {
        newErrors[`item_${i}_cylinder`] = `Item ${i + 1}: Select cylinder type`;
      }
      if (!items[i].quantity || items[i].quantity <= 0) {
        newErrors[`item_${i}_quantity`] = `Item ${i + 1}: Valid quantity required`;
      }
      if (!items[i].rate || items[i].rate <= 0) {
        newErrors[`item_${i}_rate`] = `Item ${i + 1}: Valid rate required`;
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        partyType: partyType,
        partyId: parseInt(invoiceData.partyId),
        partyName: invoiceData.partyName,
        partyGst: invoiceData.partyGst || null,
        partyAddress: invoiceData.partyAddress || null,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate || null,
        discountType: invoiceData.discountType,
        discountValue: parseFloat(invoiceData.discountValue) || 0,
        roundOff: parseFloat(invoiceData.roundOff) || 0,
        paymentStatus: invoiceData.paymentStatus,
        paidAmount: parseFloat(invoiceData.paidAmount) || 0,
        paymentMethod: invoiceData.paymentMethod || null,
        transactionId: invoiceData.transactionId || null,
        notes: invoiceData.notes || null,
        termsConditions: invoiceData.termsConditions || null,
        updatedBy: user.id || 1,
        items: items.map((item) => ({
          cylinderTypeId: parseInt(item.cylinderTypeId),
          quantity: parseInt(item.quantity),
          rate: parseFloat(item.rate),
          gstPercent: parseFloat(item.gstPercent),
          cessPercent: parseFloat(item.cessPercent) || 0,
          discountPercent: parseFloat(item.discountPercent) || 0,
          discountAmount: 0,
        })),
      };

      console.log("Updating payload:", payload);
      const response = await updateInvoice(id, payload);
      console.log("Response:", response);

      if (response.data.success) {
        toast.success("✅ Invoice updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        });
        setTimeout(() => {
          navigate("/invoices");
        }, 1500);
      } else {
        throw new Error(response.data.message || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Update invoice error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update invoice", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Container fluid className="p-4 bg-light min-vh-100">
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3">Loading invoice data...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">
            <FaEdit className="me-2 text-secondary" /> Edit Invoice
          </h2>
          <p className="text-muted mb-0">Update GST invoice #{id}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/invoices")}>
          <FaArrowLeft className="me-2" />
          Back
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* Invoice Information */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h5 className="fw-bold mb-4">Invoice Information</h5>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>
                  Party Type <span className="text-danger">*</span>
                </Form.Label>
                <div className="d-flex gap-3">
                  <Button
                    type="button"
                    variant={partyType === "customer" ? "secondary" : "outline-secondary"}
                    onClick={() => handlePartyTypeChange("customer")}
                    size="sm"
                  >
                    Customer
                  </Button>
                  <Button
                    type="button"
                    variant={partyType === "dealer" ? "secondary" : "outline-secondary"}
                    onClick={() => handlePartyTypeChange("dealer")}
                    size="sm"
                  >
                    Dealer
                  </Button>
                </div>
              </Col>

              <Col md={8} className="mb-3">
                <Form.Label>
                  Select {partyType === "customer" ? "Customer" : "Dealer"}{" "}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={invoiceData.partyId}
                  onChange={handlePartySelect}
                  isInvalid={!!errors.partyId}
                  disabled={loadingParties}
                  required
                >
                  <option value="">
                    -- Select {partyType === "customer" ? "Customer" : "Dealer"} --
                  </option>
                  {(partyType === "customer" ? customers : dealers).map((party) => (
                    <option key={party.id} value={party.id}>
                      {party.name || party.customer_name || party.dealer_name || "Unknown"}
                      {party.gst_number ? ` (GST: ${party.gst_number})` : ""}
                    </option>
                  ))}
                </Form.Select>
                {loadingParties && <Spinner animation="border" size="sm" className="ms-2" />}
                <Form.Control.Feedback type="invalid">
                  {errors.partyId}
                </Form.Control.Feedback>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Party Name</Form.Label>
                <Form.Control
                  type="text"
                  value={invoiceData.partyName}
                  readOnly
                  className="bg-light"
                  placeholder="Select a party to see name"
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>GST Number</Form.Label>
                <Form.Control
                  type="text"
                  value={invoiceData.partyGst}
                  readOnly
                  className="bg-light"
                  placeholder="Not available"
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Party Address</Form.Label>
                <Form.Control
                  type="text"
                  value={invoiceData.partyAddress}
                  readOnly
                  className="bg-light"
                  placeholder="Not available"
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>
                  Invoice Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="invoiceDate"
                  value={invoiceData.invoiceDate}
                  onChange={handleChange}
                  isInvalid={!!errors.invoiceDate}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.invoiceDate}
                </Form.Control.Feedback>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={invoiceData.dueDate}
                  onChange={handleChange}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Invoice Items */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Invoice Items</h5>
              <Button variant="primary" onClick={addItem} size="sm">
                <FaPlus className="me-2" />
                Add Item
              </Button>
            </div>
            <div className="table-responsive">
              <Table bordered size="sm">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "25%" }}>Cylinder Type</th>
                    <th style={{ width: "10%" }}>Qty</th>
                    <th style={{ width: "12%" }}>Rate (₹)</th>
                    <th style={{ width: "10%" }}>GST %</th>
                    <th style={{ width: "10%" }}>Cess %</th>
                    <th style={{ width: "10%" }}>Disc %</th>
                    <th style={{ width: "13%" }}>Total (₹)</th>
                    <th style={{ width: "10%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const itemTotal = (item.quantity || 0) * (item.rate || 0);
                    return (
                      <tr key={index}>
                        <td>
                          <Form.Select
                            value={item.cylinderTypeId}
                            onChange={(e) =>
                              handleItemChange(index, "cylinderTypeId", e.target.value)
                            }
                            isInvalid={!!errors[`item_${index}_cylinder`]}
                            disabled={loadingCylinderTypes}
                            required
                          >
                            <option value="">Select Cylinder Type</option>
                            {cylinderTypes.length > 0 ? (
                              cylinderTypes.map((cylinder) => (
                                <option key={cylinder.id} value={cylinder.id}>
                                  {cylinder.name ||
                                    cylinder.cylinder_name ||
                                    cylinder.type ||
                                    `Cylinder ${cylinder.id}`}
                                  {cylinder.capacity ? ` (${cylinder.capacity} KG)` : ""}
                                </option>
                              ))
                            ) : (
                              !loadingCylinderTypes && (
                                <option disabled>No cylinder types available</option>
                              )
                            )}
                          </Form.Select>
                          {loadingCylinderTypes && (
                            <Spinner animation="border" size="sm" className="mt-1" />
                          )}
                          {!loadingCylinderTypes && cylinderTypes.length === 0 && (
                            <small className="text-warning d-block">
                              No cylinder types found. Please add cylinder types first.
                            </small>
                          )}
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, "quantity", e.target.value)
                            }
                            min="1"
                            isInvalid={!!errors[`item_${index}_quantity`]}
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(index, "rate", e.target.value)
                            }
                            min="0"
                            step="0.01"
                            isInvalid={!!errors[`item_${index}_rate`]}
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={item.gstPercent}
                            onChange={(e) =>
                              handleItemChange(index, "gstPercent", e.target.value)
                            }
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={item.cessPercent}
                            onChange={(e) =>
                              handleItemChange(index, "cessPercent", e.target.value)
                            }
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            value={item.discountPercent}
                            onChange={(e) =>
                              handleItemChange(index, "discountPercent", e.target.value)
                            }
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="text-end fw-bold">
                          ₹{itemTotal.toFixed(2)}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Discount & Round Off */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h5 className="fw-bold mb-4">Discount & Round Off</h5>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>Discount Type</Form.Label>
                <Form.Select
                  name="discountType"
                  value={invoiceData.discountType}
                  onChange={handleChange}
                >
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Discount Value</Form.Label>
                <Form.Control
                  type="number"
                  name="discountValue"
                  value={invoiceData.discountValue}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Round Off</Form.Label>
                <Form.Control
                  type="number"
                  name="roundOff"
                  value={invoiceData.roundOff}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0.00"
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Payment Information */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h5 className="fw-bold mb-4">Payment Information</h5>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  name="paymentStatus"
                  value={invoiceData.paymentStatus}
                  onChange={handleChange}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Paid Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="paidAmount"
                  value={invoiceData.paidAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={invoiceData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Transaction ID</Form.Label>
                <Form.Control
                  type="text"
                  name="transactionId"
                  value={invoiceData.transactionId}
                  onChange={handleChange}
                  placeholder="TXN123456"
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Notes & Terms */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={invoiceData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes..."
                />
              </Col>
              <Col md={6}>
                <Form.Label>Terms & Conditions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="termsConditions"
                  value={invoiceData.termsConditions}
                  onChange={handleChange}
                  placeholder="Terms and conditions..."
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Summary */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Invoice Summary</h5>
            <Row>
              <Col md={2}>
                <Alert variant="light" className="text-center mb-0 p-2">
                  <small>Subtotal</small>
                  <br />
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </Alert>
              </Col>
              <Col md={2}>
                <Alert variant="light" className="text-center mb-0 p-2">
                  <small>Discount</small>
                  <br />
                  <strong className="text-danger">-₹{discountAmount.toFixed(2)}</strong>
                </Alert>
              </Col>
              <Col md={2}>
                <Alert variant="light" className="text-center mb-0 p-2">
                  <small>Taxable</small>
                  <br />
                  <strong>₹{taxableAmount.toFixed(2)}</strong>
                </Alert>
              </Col>
              <Col md={2}>
                <Alert variant="light" className="text-center mb-0 p-2">
                  <small>GST</small>
                  <br />
                  <strong>₹{gstAmount.toFixed(2)}</strong>
                </Alert>
              </Col>
              <Col md={2}>
                <Alert variant="light" className="text-center mb-0 p-2">
                  <small>Cess</small>
                  <br />
                  <strong>₹{cessAmount.toFixed(2)}</strong>
                </Alert>
              </Col>
              <Col md={2}>
                <Alert variant="success" className="text-center mb-0 p-2">
                  <small>Net Amount</small>
                  <br />
                  <strong className="fs-6">₹{netAmount.toFixed(2)}</strong>
                </Alert>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Submit Button */}
        <div className="text-end">
          <Button type="submit" variant="success" size="lg" disabled={loading}>
            <FaSave className="me-2" />
            {loading ? "Updating..." : "Update Invoice"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditInvoice;