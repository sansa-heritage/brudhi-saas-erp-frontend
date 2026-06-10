// src/pages/invoices/EditInvoice.js

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
  Tab,
  Nav,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaArrowLeft,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaRupeeSign,
  FaPercent,
  FaMoneyBillWave,
  FaFileInvoice,
  FaInfoCircle,
  FaBoxes,
  FaCreditCard,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaEdit,
} from "react-icons/fa";
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
  const [activeTab, setActiveTab] = useState("party");
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

  // Validation helpers
  const getValidationIcon = (fieldValue, validationError) => {
    if (!fieldValue) {
      return <FaInfoCircle className="text-secondary ms-2" size={14} />;
    }
    if (!validationError) {
      return <FaCheckCircle className="text-success ms-2" size={14} />;
    }
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-${fieldValue}`}>{validationError}</Tooltip>
        }
      >
        <span className="text-danger ms-2" style={{ cursor: "pointer" }}>
          <FaExclamationTriangle size={14} />
        </span>
      </OverlayTrigger>
    );
  };

  useEffect(() => {
    fetchCylinderTypes();
    fetchInvoice();
  }, []);

  useEffect(() => {
    if (partyType === "customer") {
      fetchCustomers();
    } else {
      fetchDealers();
    }
  }, [partyType]);

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
      const invoice = response?.data?.data || response?.data || response;
      
      if (invoice) {
        setOriginalInvoice(invoice);
        
        const invoicePartyType = invoice.partyType || invoice.party_type || "customer";
        setPartyType(invoicePartyType);
        
        const formatDate = (dateString) => {
          if (!dateString) return "";
          return dateString.split('T')[0];
        };
        
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
      setTimeout(() => navigate("/invoices"), 2000);
    } finally {
      setFetching(false);
    }
  };

  const fetchCylinderTypes = async () => {
    setLoadingCylinderTypes(true);
    try {
      const response = await cylinderTypeApi.getAll();
      let cylinderList = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        cylinderList = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        cylinderList = response.data;
      } else if (Array.isArray(response)) {
        cylinderList = response;
      }
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

    if (selectedParty) {
      setInvoiceData({
        ...invoiceData,
        partyId: selectedParty.id,
        partyName: selectedParty.name || selectedParty.customer_name || selectedParty.dealer_name || "",
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
      newErrors.partyId = `Please select a ${partyType === "customer" ? "customer" : "dealer"}`;
    }
    if (!invoiceData.invoiceDate) {
      newErrors.invoiceDate = "Invoice date is required";
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].cylinderTypeId) {
        newErrors[`item_${i}_cylinder`] = `Select cylinder type`;
      }
      if (!items[i].quantity || items[i].quantity <= 0) {
        newErrors[`item_${i}_quantity`] = `Valid quantity required`;
      }
      if (!items[i].rate || items[i].rate <= 0) {
        newErrors[`item_${i}_rate`] = `Valid rate required`;
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

      const response = await updateInvoice(id, payload);

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
      <Container
        fluid
        className="px-4 py-3"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading invoice data...</h4>
        </div>
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

      {/* Header */}
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "rgb(30, 58, 111)" }}>
            <FaEdit className="me-2" /> Edit Invoice
          </h2>
          <p className="text-muted mb-0">Update GST invoice #{id}</p>
        </div>
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/invoices")}
          style={{ borderRadius: "10px", padding: "10px 20px" }}
        >
          <FaArrowLeft className="me-2" />
          Back to Invoices
        </Button>
      </div> */}

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
            <Nav
              variant="tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav.Item>
                <Nav.Link eventKey="party" className="fw-semibold">
                  <FaUser className="me-2" /> Party Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="items" className="fw-semibold">
                  <FaBoxes className="me-2" /> Invoice Items
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="payment" className="fw-semibold">
                  <FaCreditCard className="me-2" /> Payment & Discount
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="additional" className="fw-semibold">
                  <FaInfoCircle className="me-2" /> Additional Info
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* Party Information Tab */}
              <Tab.Pane eventKey="party" active={activeTab === "party"}>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Label className="fw-semibold">Party Type *</Form.Label>
                    <div className="d-flex gap-2">
                      <Button
                        type="button"
                        onClick={() => handlePartyTypeChange("customer")}
                        style={{
                          backgroundColor: partyType === "customer" ? "rgb(30, 58, 111)" : "#fff",
                          color: partyType === "customer" ? "#fff" : "#6c757d",
                          border: partyType === "customer" ? "none" : "1px solid #dee2e6",
                          borderRadius: "8px",
                          padding: "8px 24px",
                        }}
                      >
                        Customer
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handlePartyTypeChange("dealer")}
                        style={{
                          backgroundColor: partyType === "dealer" ? "rgb(30, 58, 111)" : "#fff",
                          color: partyType === "dealer" ? "#fff" : "#6c757d",
                          border: partyType === "dealer" ? "none" : "1px solid #dee2e6",
                          borderRadius: "8px",
                          padding: "8px 24px",
                        }}
                      >
                        Dealer
                      </Button>
                    </div>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">
                      Select {partyType === "customer" ? "Customer" : "Dealer"} *
                    </Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Select
                        value={invoiceData.partyId}
                        onChange={handlePartySelect}
                        isInvalid={!!errors.partyId}
                        disabled={loadingParties}
                        style={{ borderRadius: "8px", padding: "10px" }}
                        className="flex-grow-1"
                      >
                        <option value="">-- Select {partyType === "customer" ? "Customer" : "Dealer"} --</option>
                        {(partyType === "customer" ? customers : dealers).map((party) => (
                          <option key={party.id} value={party.id}>
                            {party.name || party.customer_name || party.dealer_name || "Unknown"}
                          </option>
                        ))}
                      </Form.Select>
                      {getValidationIcon(invoiceData.partyId, errors.partyId)}
                    </div>
                    {errors.partyId && (
                      <Form.Text className="text-danger">{errors.partyId}</Form.Text>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">GST Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={invoiceData.partyGst}
                      readOnly
                      className="bg-light"
                      style={{ borderRadius: "8px", padding: "10px" }}
                      placeholder="Not available"
                    />
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Label className="fw-semibold">Party Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={invoiceData.partyAddress}
                      readOnly
                      className="bg-light"
                      style={{ borderRadius: "8px" }}
                      placeholder="Not available"
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Invoice Date *</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="date"
                        name="invoiceDate"
                        value={invoiceData.invoiceDate}
                        onChange={handleChange}
                        isInvalid={!!errors.invoiceDate}
                        style={{ borderRadius: "8px", padding: "10px" }}
                        className="flex-grow-1"
                      />
                      {getValidationIcon(invoiceData.invoiceDate, errors.invoiceDate)}
                    </div>
                    {errors.invoiceDate && (
                      <Form.Text className="text-danger">{errors.invoiceDate}</Form.Text>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Due Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="dueDate"
                      value={invoiceData.dueDate}
                      onChange={handleChange}
                      style={{ borderRadius: "8px", padding: "10px" }}
                    />
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Invoice Items Tab */}
              <Tab.Pane eventKey="items" active={activeTab === "items"}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0" style={{ color: "rgb(30, 58, 111)" }}>
                    <FaBoxes className="me-2" /> Invoice Items
                  </h6>
                  <Button
                    type="button"
                    onClick={addItem}
                    size="sm"
                    style={{
                      backgroundColor: "rgb(30, 58, 111)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                    }}
                  >
                    <FaPlus className="me-1" size={12} /> Add Item
                  </Button>
                </div>
                <hr className="mt-0 mb-3" />
                <div className="table-responsive">
                  <Table bordered className="mb-0" style={{ fontSize: "14px" }}>
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th style={{ padding: "12px", width: "25%" }}>Cylinder Type *</th>
                        <th style={{ padding: "12px", width: "8%" }}>Qty *</th>
                        <th style={{ padding: "12px", width: "12%" }}>Rate (₹) *</th>
                        <th style={{ padding: "12px", width: "10%" }}>GST %</th>
                        <th style={{ padding: "12px", width: "10%" }}>Cess %</th>
                        <th style={{ padding: "12px", width: "10%" }}>Disc %</th>
                        <th style={{ padding: "12px", width: "15%" }}>Total (₹)</th>
                        <th style={{ padding: "12px", width: "10%" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                        const itemTotal = (item.quantity || 0) * (item.rate || 0);
                        return (
                          <tr key={index}>
                            <td style={{ padding: "8px" }}>
                              <Form.Select
                                value={item.cylinderTypeId}
                                onChange={(e) => handleItemChange(index, "cylinderTypeId", e.target.value)}
                                isInvalid={!!errors[`item_${index}_cylinder`]}
                                size="sm"
                                style={{ fontSize: "13px" }}
                              >
                                <option value="">Select Cylinder</option>
                                {cylinderTypes.map((cylinder) => (
                                  <option key={cylinder.id} value={cylinder.id}>
                                    {cylinder.name || cylinder.cylinder_name || cylinder.type}
                                  </option>
                                ))}
                              </Form.Select>
                            </td>
                            <td style={{ padding: "8px" }}>
                              <Form.Control
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                min="1"
                                isInvalid={!!errors[`item_${index}_quantity`]}
                                size="sm"
                                style={{ fontSize: "13px" }}
                              />
                            </td>
                            <td style={{ padding: "8px" }}>
                              <Form.Control
                                type="number"
                                value={item.rate}
                                onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                min="0"
                                step="0.01"
                                isInvalid={!!errors[`item_${index}_rate`]}
                                size="sm"
                                style={{ fontSize: "13px" }}
                              />
                            </td>
                            <td style={{ padding: "8px" }}>
                              <Form.Control
                                type="number"
                                value={item.gstPercent}
                                onChange={(e) => handleItemChange(index, "gstPercent", e.target.value)}
                                min="0"
                                step="0.01"
                                size="sm"
                                style={{ fontSize: "13px" }}
                              />
                            </td>
                            <td style={{ padding: "8px" }}>
                              <Form.Control
                                type="number"
                                value={item.cessPercent}
                                onChange={(e) => handleItemChange(index, "cessPercent", e.target.value)}
                                min="0"
                                step="0.01"
                                size="sm"
                                style={{ fontSize: "13px" }}
                              />
                            </td>
                            <td style={{ padding: "8px" }}>
                              <Form.Control
                                type="number"
                                value={item.discountPercent}
                                onChange={(e) => handleItemChange(index, "discountPercent", e.target.value)}
                                min="0"
                                step="0.01"
                                size="sm"
                                style={{ fontSize: "13px" }}
                              />
                            </td>
                            <td className="text-end fw-bold" style={{ padding: "8px", color: "#027A48" }}>
                              ₹{itemTotal.toFixed(2)}
                            </td>
                            <td className="text-center" style={{ padding: "8px" }}>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                                style={{ color: "#dc3545" }}
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

                {/* Summary Cards */}
                <div className="mt-4">
                  <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                    Current Totals
                  </h6>
                  <hr className="mt-0 mb-3" />
                  <Row>
                    <Col md={2}>
                      <div className="text-center p-2 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                        <small className="text-muted">Subtotal</small>
                        <br />
                        <strong>₹{subtotal.toFixed(2)}</strong>
                      </div>
                    </Col>
                    <Col md={2}>
                      <div className="text-center p-2 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                        <small className="text-muted">GST</small>
                        <br />
                        <strong>₹{gstAmount.toFixed(2)}</strong>
                      </div>
                    </Col>
                    <Col md={2}>
                      <div className="text-center p-2 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                        <small className="text-muted">Cess</small>
                        <br />
                        <strong>₹{cessAmount.toFixed(2)}</strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center p-2 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                        <small className="text-muted">Taxable Value</small>
                        <br />
                        <strong>₹{taxableAmount.toFixed(2)}</strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center p-2 rounded" style={{ backgroundColor: "#ECFDF3", border: "1px solid #027A48" }}>
                        <small className="text-muted" style={{ color: "#027A48" }}>Net Amount</small>
                        <br />
                        <strong style={{ color: "#027A48" }}>₹{netAmount.toFixed(2)}</strong>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab.Pane>

              {/* Payment & Discount Tab */}
              <Tab.Pane eventKey="payment" active={activeTab === "payment"}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Discount Type</Form.Label>
                    <Form.Select
                      name="discountType"
                      value={invoiceData.discountType}
                      onChange={handleChange}
                      style={{ borderRadius: "8px", padding: "10px" }}
                    >
                      <option value="fixed">Fixed Amount (₹)</option>
                      <option value="percentage">Percentage (%)</option>
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Discount Value</Form.Label>
                    <Form.Control
                      type="number"
                      name="discountValue"
                      value={invoiceData.discountValue}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      style={{ borderRadius: "8px", padding: "10px" }}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Round Off</Form.Label>
                    <Form.Control
                      type="number"
                      name="roundOff"
                      value={invoiceData.roundOff}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="0.00"
                      style={{ borderRadius: "8px", padding: "10px" }}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Payment Status</Form.Label>
                    <Form.Select
                      name="paymentStatus"
                      value={invoiceData.paymentStatus}
                      onChange={handleChange}
                      style={{ borderRadius: "8px", padding: "10px" }}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Paid Amount (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="paidAmount"
                      value={invoiceData.paidAmount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      style={{ borderRadius: "8px", padding: "10px" }}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Payment Method</Form.Label>
                    <Form.Select
                      name="paymentMethod"
                      value={invoiceData.paymentMethod}
                      onChange={handleChange}
                      style={{ borderRadius: "8px", padding: "10px" }}
                    >
                      <option value="">Select Payment Method</option>
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </Form.Select>
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Label className="fw-semibold">Transaction ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="transactionId"
                      value={invoiceData.transactionId}
                      onChange={handleChange}
                      placeholder="TXN123456"
                      style={{ borderRadius: "8px", padding: "10px" }}
                    />
                  </Col>
                </Row>

                {/* Final Summary */}
                <div className="mt-4 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                  <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                    Final Invoice Summary
                  </h6>
                  <hr className="mt-0 mb-3" />
                  <Row>
                    <Col md={3}>
                      <div><small className="text-muted">Subtotal:</small> <strong>₹{subtotal.toFixed(2)}</strong></div>
                    </Col>
                    <Col md={3}>
                      <div><small className="text-muted">Discount:</small> <strong className="text-danger">-₹{discountAmount.toFixed(2)}</strong></div>
                    </Col>
                    <Col md={3}>
                      <div><small className="text-muted">Taxable Amount:</small> <strong>₹{taxableAmount.toFixed(2)}</strong></div>
                    </Col>
                    <Col md={3}>
                      <div><small className="text-muted">GST + Cess:</small> <strong>₹{(gstAmount + cessAmount).toFixed(2)}</strong></div>
                    </Col>
                    <Col md={3} className="mt-2">
                      <div><small className="text-muted">Round Off:</small> <strong>₹{Number(invoiceData.roundOff).toFixed(2)}</strong></div>
                    </Col>
                    <Col md={6} className="mt-2">
                      <div className="p-2 rounded" style={{ backgroundColor: "#ECFDF3" }}>
                        <small className="text-muted" style={{ color: "#027A48" }}>Net Payable Amount:</small>
                        <br />
                        <strong className="fs-5" style={{ color: "#027A48" }}>₹{netAmount.toFixed(2)}</strong>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab.Pane>

              {/* Additional Info Tab */}
              <Tab.Pane eventKey="additional" active={activeTab === "additional"}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="notes"
                      value={invoiceData.notes}
                      onChange={handleChange}
                      placeholder="Additional notes..."
                      style={{ borderRadius: "8px" }}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="fw-semibold">Terms & Conditions</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="termsConditions"
                      value={invoiceData.termsConditions}
                      onChange={handleChange}
                      placeholder="Terms and conditions..."
                      style={{ borderRadius: "8px" }}
                    />
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>

          {/* Action Buttons inside Card Footer */}
          <Card.Footer className="bg-white border-top-0 pb-4 px-4">
            {Object.keys(errors).length > 0 && (
              <Alert variant="danger" className="mb-3">
                Please fix the errors before submitting.
              </Alert>
            )}
            <div className="d-flex justify-content-between gap-3">
              <Button
                onClick={() => navigate("/invoices")}
                style={{
                  backgroundColor: "#6c757d",
                  border: "none",
                  borderRadius: "14px",
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
                disabled={loading}
                style={{
                  backgroundColor: "rgb(30, 58, 111)",
                  border: "none",
                  borderRadius: "14px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
                }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Update Invoice
                  </>
                )}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Form>

      <style>{`
        .nav-tabs {
          border-bottom: 2px solid #e9ecef;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 12px 20px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .nav-tabs .nav-link:hover {
          color: rgb(30, 58, 111);
          background: transparent;
        }
        .nav-tabs .nav-link.active {
          color: rgb(30, 58, 111);
          background: transparent;
          border-bottom: 2px solid rgb(30, 58, 111);
        }
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
        .form-control:focus, .form-select:focus {
          border-color: rgb(30, 58, 111);
          box-shadow: 0 0 0 0.2rem rgba(30, 58, 111, 0.25);
        }
      `}</style>
    </Container>
  );
};

export default EditInvoice;