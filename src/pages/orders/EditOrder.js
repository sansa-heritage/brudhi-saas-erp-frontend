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
  Table,
  Badge,
  OverlayTrigger,
  Tooltip,
  Tab,
  Nav,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaShoppingCart,
  FaPlus,
  FaTrash,
  FaUser,
  FaTruck,
  FaMoneyBill,
  FaCalendarAlt,
  FaBox,
  FaBuilding,
  FaPercent,
  FaEdit,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCreditCard,
  FaTag,
} from "react-icons/fa";
import { getOrderById, updateOrder } from "../../api/tenant/order.api";
import { getCustomers } from "../../api/tenant/customer.api";
import { getDealers } from "../../api/tenant/dealer.api";
import { getProducts } from "../../api/tenant/inventory.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("order");

  // Data lists
  const [customers, setCustomers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [partyType, setPartyType] = useState("customer");

  const currentUserId = parseInt(localStorage.getItem("userId")) || 1;

  // Order Items
  const [items, setItems] = useState([]);
  const [nextItemId, setNextItemId] = useState(1);
  const [removedItems, setRemovedItems] = useState([]);

  const [formData, setFormData] = useState({
    order_date: "",
    customer_id: "",
    customer_type: "customer",
    order_type: "sales",
    status: "pending",
    payment_status: "pending",
    payment_method: "",
    subtotal: 0,
    discount_type: "percentage",
    discount_value: 0,
    discount_amount: 0,
    tax_amount: 0,
    shipping_charge: 0,
    total_amount: 0,
    notes: "",
    delivery_address: "",
    delivery_date: "",
    created_by: currentUserId,
    changed_by: currentUserId,
  });

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
        overlay={<Tooltip id={`tooltip-${fieldValue}`}>{validationError}</Tooltip>}
      >
        <span className="text-danger ms-2" style={{ cursor: "pointer" }}>
          <FaExclamationTriangle size={14} />
        </span>
      </OverlayTrigger>
    );
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    calculateTotals();
  }, [items, formData.discount_type, formData.discount_value, formData.shipping_charge]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderRes, customersRes, dealersRes, productsRes] = await Promise.all([
        getOrderById(id),
        getCustomers().catch(err => {
          console.error("Customers API error:", err);
          return [];
        }),
        getDealers().catch(err => {
          console.error("Dealers API error:", err);
          return [];
        }),
        getProducts().catch(err => {
          console.error("Products API error:", err);
          return [];
        }),
      ]);

      let orderData = null;
      if (orderRes?.data?.data) {
        orderData = orderRes.data.data;
      } else if (orderRes?.data) {
        orderData = orderRes.data;
      } else if (orderRes) {
        orderData = orderRes;
      }

      console.log("Order data received:", orderData);

      if (!orderData) {
        toast.error("Order not found", { position: "top-right", theme: "colored", transition: Bounce });
        navigate("/orders");
        return;
      }

      // Extract customers list
      let customersList = [];
      if (customersRes?.data?.data?.data && Array.isArray(customersRes.data.data.data)) {
        customersList = customersRes.data.data.data;
      } else if (customersRes?.data?.data && Array.isArray(customersRes.data.data)) {
        customersList = customersRes.data.data;
      } else if (customersRes?.data && Array.isArray(customersRes.data)) {
        customersList = customersRes.data;
      } else if (Array.isArray(customersRes)) {
        customersList = customersRes;
      }
      setCustomers(customersList);

      // Extract dealers list
      let dealersList = [];
      if (dealersRes?.data?.data?.data && Array.isArray(dealersRes.data.data.data)) {
        dealersList = dealersRes.data.data.data;
      } else if (dealersRes?.data?.data && Array.isArray(dealersRes.data.data)) {
        dealersList = dealersRes.data.data;
      } else if (dealersRes?.data && Array.isArray(dealersRes.data)) {
        dealersList = dealersRes.data;
      } else if (Array.isArray(dealersRes)) {
        dealersList = dealersRes;
      }
      setDealers(dealersList);

      // Extract products list
      let productsList = [];
      if (productsRes?.data?.data?.data && Array.isArray(productsRes.data.data.data)) {
        productsList = productsRes.data.data.data;
      } else if (productsRes?.data?.data && Array.isArray(productsRes.data.data)) {
        productsList = productsRes.data.data;
      } else if (productsRes?.data && Array.isArray(productsRes.data)) {
        productsList = productsRes.data;
      } else if (Array.isArray(productsRes)) {
        productsList = productsRes;
      }
      
      const mappedProducts = (productsList || []).map(product => ({
        id: product.id,
        name: product.product_name || product.name,
        price: parseFloat(product.selling_price || product.price || 0),
        gst_rate: parseFloat(product.gst_rate || 18),
        current_stock: parseInt(product.current_stock || 0),
      }));
      setProducts(mappedProducts);

      // Set party type from order data
      const customerType = orderData.customer_type || "customer";
      setPartyType(customerType);

      // Set form data
      setFormData({
        order_date: orderData.order_date ? orderData.order_date.split("T")[0] : "",
        customer_id: orderData.customer_id?.toString() || "",
        customer_type: customerType,
        order_type: orderData.order_type || "sales",
        status: orderData.status || "pending",
        payment_status: orderData.payment_status || "pending",
        payment_method: orderData.payment_method || "",
        subtotal: parseFloat(orderData.subtotal) || 0,
        discount_type: orderData.discount_type || "percentage",
        discount_value: parseFloat(orderData.discount_value) || 0,
        discount_amount: parseFloat(orderData.discount_amount) || 0,
        tax_amount: parseFloat(orderData.tax_amount) || 0,
        shipping_charge: parseFloat(orderData.shipping_charge) || 0,
        total_amount: parseFloat(orderData.total_amount) || 0,
        notes: orderData.notes || "",
        delivery_address: orderData.delivery_address || "",
        delivery_date: orderData.delivery_date ? orderData.delivery_date.split("T")[0] : "",
        created_by: orderData.created_by || currentUserId,
        changed_by: currentUserId,
      });

      // Set items from order data
      if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
        const mappedItems = orderData.items.map((item, idx) => ({
          id: idx + 1,
          product_id: item.product_id?.toString() || "",
          product_name: item.product_name || "",
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          gst_rate: parseFloat(item.gst_rate) || 18,
          discount_percent: parseFloat(item.discount_percent) || 0,
          total_amount: parseFloat(item.total_amount) || 0,
          is_existing: true,
        }));
        setItems(mappedItems);
        setNextItemId(mappedItems.length + 1);
      } else {
        setItems([{ 
          id: 1, 
          product_id: "", 
          product_name: "", 
          quantity: 1, 
          unit_price: 0, 
          gst_rate: 18, 
          discount_percent: 0, 
          total_amount: 0,
          is_existing: false,
        }]);
        setNextItemId(2);
      }

      // toast.success("Order loaded successfully", { position: "top-right", autoClose: 1500, theme: "colored", transition: Bounce });
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load order details", { position: "top-right", theme: "colored", transition: Bounce });
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const calculateItemTotal = (item) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unit_price || 0;
    const taxableValue = quantity * unitPrice;
    const discountAmount = (taxableValue * (item.discount_percent || 0)) / 100;
    const afterDiscount = taxableValue - discountAmount;
    const gstAmount = (afterDiscount * (item.gst_rate || 0)) / 100;
    const totalAmount = afterDiscount + gstAmount;
    
    return {
      taxable_value: taxableValue,
      discount_amount: discountAmount,
      gst_amount: gstAmount,
      total_amount: totalAmount,
    };
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTaxAmount = 0;
    
    const updatedItems = items.map(item => {
      if (item.product_id && item.quantity > 0 && item.unit_price > 0) {
        const calculations = calculateItemTotal(item);
        subtotal += calculations.taxable_value;
        totalTaxAmount += calculations.gst_amount;
        return { 
          ...item, 
          total_amount: calculations.total_amount,
        };
      }
      return item;
    });
    
    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      setItems(updatedItems);
    }

    let discountAmount = 0;
    if (formData.discount_type === "percentage") {
      discountAmount = (subtotal * (formData.discount_value || 0)) / 100;
    } else {
      discountAmount = formData.discount_value || 0;
    }

    const afterDiscount = subtotal - discountAmount;
    const taxAmount = parseFloat(formData.tax_amount) || totalTaxAmount;
    const shippingCharge = parseFloat(formData.shipping_charge) || 0;
    const totalAmount = afterDiscount + taxAmount + shippingCharge;

    setFormData(prev => ({
      ...prev,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePartyTypeChange = (type) => {
    setPartyType(type);
    setFormData(prev => ({ ...prev, customer_type: type, customer_id: "" }));
  };

  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find(p => p.id === parseInt(productId));
    if (selectedProduct) {
      const updatedItems = [...items];
      const quantity = updatedItems[index].quantity || 1;
      const unitPrice = selectedProduct.price;
      const discountPercent = updatedItems[index].discount_percent || 0;
      const gstRate = selectedProduct.gst_rate;
      
      const taxableValue = quantity * unitPrice;
      const discountAmount = (taxableValue * discountPercent) / 100;
      const afterDiscount = taxableValue - discountAmount;
      const gstAmount = (afterDiscount * gstRate) / 100;
      const totalAmount = afterDiscount + gstAmount;
      
      updatedItems[index] = {
        ...updatedItems[index],
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        unit_price: selectedProduct.price,
        gst_rate: selectedProduct.gst_rate,
        total_amount: totalAmount,
      };
      setItems(updatedItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    
    if (field === "quantity" || field === "unit_price" || field === "discount_percent") {
      const quantity = updatedItems[index].quantity || 0;
      const unitPrice = updatedItems[index].unit_price || 0;
      const discountPercent = updatedItems[index].discount_percent || 0;
      const gstRate = updatedItems[index].gst_rate || 0;
      
      const taxableValue = quantity * unitPrice;
      const discountAmount = (taxableValue * discountPercent) / 100;
      const afterDiscount = taxableValue - discountAmount;
      const gstAmount = (afterDiscount * gstRate) / 100;
      const totalAmount = afterDiscount + gstAmount;
      
      updatedItems[index].total_amount = totalAmount;
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: nextItemId,
        product_id: "",
        product_name: "",
        quantity: 1,
        unit_price: 0,
        gst_rate: 18,
        discount_percent: 0,
        total_amount: 0,
        is_existing: false,
      },
    ]);
    setNextItemId(nextItemId + 1);
  };

  const removeItem = (index) => {
    const itemToRemove = items[index];
    if (itemToRemove.is_existing && itemToRemove.product_id) {
      setRemovedItems([...removedItems, parseInt(itemToRemove.product_id)]);
    }
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.order_date) {
      newErrors.order_date = "Order date is required";
    }
    
    if (!formData.customer_id) {
      newErrors.customer_id = `Please select a ${partyType === "customer" ? "customer" : "dealer"}`;
    }
    
    if (!items || items.length === 0) {
      newErrors.items = "At least one item is required";
    } else {
      let hasValidItems = false;
      items.forEach((item, index) => {
        if (item.product_id && item.quantity > 0 && item.unit_price > 0) {
          hasValidItems = true;
        }
        if (!item.product_id) {
          newErrors[`item_${index}_product`] = "Product required";
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`item_${index}_qty`] = "Valid quantity required";
        }
      });
      if (!hasValidItems) {
        newErrors.items = "At least one valid item is required";
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the validation errors", { position: "top-right", theme: "colored", transition: Bounce });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const itemsArray = [];
      
      for (const item of items) {
        if (item.product_id && item.product_id !== "" && item.quantity > 0 && item.unit_price > 0) {
          const quantity = parseInt(item.quantity);
          const unitPrice = parseFloat(item.unit_price);
          const taxableValue = quantity * unitPrice;
          const discountPercent = parseFloat(item.discount_percent) || 0;
          const discountAmount = (taxableValue * discountPercent) / 100;
          const afterDiscount = taxableValue - discountAmount;
          const gstRate = parseFloat(item.gst_rate) || 18;
          const cgstAmount = (afterDiscount * gstRate) / 200;
          const sgstAmount = (afterDiscount * gstRate) / 200;
          const totalAmount = afterDiscount + cgstAmount + sgstAmount;
          
          itemsArray.push({
            product_id: parseInt(item.product_id),
            product_name: item.product_name,
            quantity: quantity,
            unit_price: unitPrice,
            discount_percent: discountPercent,
            discount_amount: discountAmount,
            taxable_value: taxableValue,
            gst_rate: gstRate,
            cgst_amount: cgstAmount,
            sgst_amount: sgstAmount,
            total_amount: totalAmount,
          });
        }
      }
      
      if (itemsArray.length === 0) {
        toast.error("Please add at least one valid item", { position: "top-right", theme: "colored", transition: Bounce });
        setSubmitting(false);
        return;
      }

      const submitData = {
        order_date: formData.order_date,
        customer_id: parseInt(formData.customer_id),
        customer_type: partyType,
        order_type: formData.order_type,
        status: formData.status,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method || null,
        subtotal: parseFloat(formData.subtotal) || 0,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value) || 0,
        discount_amount: parseFloat(formData.discount_amount) || 0,
        tax_amount: parseFloat(formData.tax_amount) || 0,
        shipping_charge: parseFloat(formData.shipping_charge) || 0,
        total_amount: parseFloat(formData.total_amount) || 0,
        notes: formData.notes || null,
        delivery_address: formData.delivery_address || null,
        delivery_date: formData.delivery_date || null,
        changed_by: currentUserId,
        items: itemsArray,
        removed_items: removedItems.length > 0 ? removedItems : null,
      };

      console.log("Submitting order update:", submitData);
      
      await updateOrder(id, submitData);
      
      toast.success("✅ Order updated successfully!", { position: "top-right", autoClose: 3000, theme: "colored", transition: Bounce });
      
      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (error) {
      console.error("Failed to update order:", error);
      const errorMessage = error.response?.data?.message || "Failed to update order";
      toast.error(`❌ ${errorMessage}`, { position: "top-right", autoClose: 4000, theme: "colored", transition: Bounce });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading order details...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" transition={Bounce} />

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-0 pt-3 px-4">
            <div className="d-flex gap-2 border-bottom pb-2">
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("order")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "order" ? "bg-light" : ""}`}
                style={{
                  color: activeTab === "order" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaShoppingCart className="me-2" /> Order Details
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("party")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "party" ? "bg-light" : ""}`}
                style={{
                  color: activeTab === "party" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaUser className="me-2" /> Party Information
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("financial")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "financial" ? "bg-light" : ""}`}
                style={{
                  color: activeTab === "financial" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaMoneyBill className="me-2" /> Financial Details
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("items")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "items" ? "bg-light" : ""}`}
                style={{
                  color: activeTab === "items" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaBox className="me-2" /> Order Items
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="p-4">
            {/* Order Details Tab */}
            {activeTab === "order" && (
              <div>
                <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                  <FaCalendarAlt className="me-2" /> Basic Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Order Date <span className="text-danger">*</span></Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="date"
                          name="order_date"
                          value={formData.order_date}
                          onChange={handleChange}
                          isInvalid={!!errors.order_date}
                          className="flex-grow-1 rounded-2"
                        />
                        {getValidationIcon(formData.order_date, errors.order_date)}
                      </div>
                      {errors.order_date && <Form.Text className="text-danger">{errors.order_date}</Form.Text>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Order Type</Form.Label>
                      <Form.Select name="order_type" value={formData.order_type} onChange={handleChange} className="rounded-2">
                        <option value="sales">Sales Order</option>
                        <option value="purchase">Purchase Order</option>
                        <option value="return">Return Order</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Order Status</Form.Label>
                      <Form.Select name="status" value={formData.status} onChange={handleChange} className="rounded-2">
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="filled">Filled</option>
                        <option value="quality_check">Quality Check</option>
                        <option value="ready_for_dispatch">Ready for Dispatch</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="success" className="mt-4 rounded-3">
                  <FaCheckCircle className="me-2" />
                  <small>
                    <strong>Ready to Update?</strong>
                    <br />
                    Please review all order details before updating.
                    <br />
                    You can edit the order again later if needed.
                  </small>
                </Alert>
              </div>
            )}

            {/* Party Information Tab */}
            {activeTab === "party" && (
              <div>
                <Row>
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaUser className="me-2" /> Select Party Type
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Party Type *</Form.Label>
                      <div className="d-flex gap-3">
                        <Button
                          type="button"
                          variant={partyType === "customer" ? "secondary" : "outline-secondary"}
                          onClick={() => handlePartyTypeChange("customer")}
                          size="sm"
                          className="rounded-pill"
                        >
                          Customer
                        </Button>
                        <Button
                          type="button"
                          variant={partyType === "dealer" ? "secondary" : "outline-secondary"}
                          onClick={() => handlePartyTypeChange("dealer")}
                          size="sm"
                          className="rounded-pill"
                        >
                          Dealer
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaBuilding className="me-2" /> Select Party
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Select {partyType === "customer" ? "Customer" : "Dealer"} <span className="text-danger">*</span>
                      </Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Select
                          name="customer_id"
                          value={formData.customer_id}
                          onChange={handleChange}
                          isInvalid={!!errors.customer_id}
                          className="flex-grow-1 rounded-2"
                        >
                          <option value="">Select {partyType === "customer" ? "Customer" : "Dealer"}</option>
                          {(partyType === "customer" ? customers : dealers).map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name || item.company_name || item.first_name || item.customer_name}
                            </option>
                          ))}
                        </Form.Select>
                        {getValidationIcon(formData.customer_id, errors.customer_id)}
                      </div>
                      {errors.customer_id && <Form.Text className="text-danger">{errors.customer_id}</Form.Text>}
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}

            {/* Financial Details Tab */}
            {activeTab === "financial" && (
              <div>
                <Row>
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaCreditCard className="me-2" /> Payment Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Payment Status</Form.Label>
                      <Form.Select name="payment_status" value={formData.payment_status} onChange={handleChange} className="rounded-2">
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="refunded">Refunded</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Payment Method</Form.Label>
                      <Form.Select name="payment_method" value={formData.payment_method} onChange={handleChange} className="rounded-2">
                        <option value="">Select Method</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaTruck className="me-2" /> Shipping Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Delivery Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="delivery_address"
                        value={formData.delivery_address}
                        onChange={handleChange}
                        placeholder="Enter delivery address"
                        className="rounded-2"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Delivery Date</Form.Label>
                      <Form.Control type="date" name="delivery_date" value={formData.delivery_date} onChange={handleChange} className="rounded-2" />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Additional notes..."
                        className="rounded-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Financial Summary */}
                <div className="bg-light p-3 rounded-3 mt-3">
                  <Row>
                    <Col md={3}>
                      <small className="text-muted d-block">Subtotal</small>
                      <strong>₹{formatCurrency(formData.subtotal)}</strong>
                    </Col>
                    <Col md={3}>
                      <small className="text-muted d-block">Discount</small>
                      <strong className="text-danger">-₹{formatCurrency(formData.discount_amount)}</strong>
                    </Col>
                    <Col md={3}>
                      <small className="text-muted d-block">Tax Amount</small>
                      <strong>₹{formatCurrency(formData.tax_amount)}</strong>
                    </Col>
                    <Col md={3}>
                      <small className="text-muted d-block">Shipping</small>
                      <strong>₹{formatCurrency(formData.shipping_charge)}</strong>
                    </Col>
                  </Row>
                  <hr className="my-2" />
                  <div className="text-end">
                    <small className="text-muted">Grand Total:</small>
                    <strong className="text-primary fs-5 ms-2">₹{formatCurrency(formData.total_amount)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items Tab */}
            {activeTab === "items" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0" style={{ color: "rgb(30, 58, 111)" }}>
                    <FaBox className="me-2" /> Order Items
                  </h6>
                  <Button variant="outline-secondary" size="sm" onClick={addItem} className="rounded-pill">
                    <FaPlus className="me-1" size={12} /> Add Item
                  </Button>
                </div>
                <hr className="mt-0 mb-3" />

                <div className="table-responsive">
                  <Table bordered className="mb-0" style={{ fontSize: "14px" }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "40px" }}>#</th>
                        <th>Product *</th>
                        <th style={{ width: "100px" }}>Qty *</th>
                        <th style={{ width: "120px" }}>Unit Price</th>
                        <th style={{ width: "80px" }}>Disc%</th>
                        <th style={{ width: "80px" }}>GST%</th>
                        <th style={{ width: "120px" }}>Total</th>
                        <th style={{ width: "50px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center">{index + 1}</td>
                          <td style={{ minWidth: "250px" }}>
                            <Form.Select
                              value={item.product_id}
                              onChange={(e) => handleProductSelect(index, e.target.value)}
                              isInvalid={!!errors[`item_${index}_product`]}
                              size="sm"
                              className="rounded-2"
                            >
                              <option value="">Select Product</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - ₹{product.price.toFixed(2)}
                                </option>
                              ))}
                            </Form.Select>
                            {errors[`item_${index}_product`] && <Form.Text className="text-danger">{errors[`item_${index}_product`]}</Form.Text>}
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                              min="1"
                              size="sm"
                              className="rounded-2"
                              isInvalid={!!errors[`item_${index}_qty`]}
                            />
                            {errors[`item_${index}_qty`] && <Form.Text className="text-danger">{errors[`item_${index}_qty`]}</Form.Text>}
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              size="sm"
                              className="rounded-2"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              value={item.discount_percent}
                              onChange={(e) => handleItemChange(index, "discount_percent", parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              step="0.1"
                              size="sm"
                              className="rounded-2"
                            />
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary px-3 py-2 rounded-pill">{item.gst_rate}%</span>
                          </td>
                          <td className="text-end fw-semibold">₹{formatCurrency(item.total_amount)}</td>
                          <td className="text-center">
                            <Button variant="outline-secondary" size="sm" onClick={() => removeItem(index)} disabled={items.length === 1} className="rounded-circle" style={{ width: "32px", height: "32px", padding: "0" }}>
                              <FaTrash size={12} />
                            </Button>
                           </td>
                          </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr className="table-active">
                        <td colSpan="6" className="text-end fw-bold">Grand Total:</td>
                        <td colSpan="2" className="text-end fw-bold text-primary fs-5">₹{formatCurrency(formData.total_amount)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
                {errors.items && <small className="text-danger">{errors.items}</small>}
              </div>
            )}
          </Card.Body>

          {/* Action Buttons inside Card Footer */}
          <Card.Footer className="bg-white border-top-0 pb-4 px-4">
            <div className="d-flex justify-content-between gap-3">
              <Button
                onClick={() => navigate("/orders")}
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
                  padding: "10px 28px",
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
                    <FaSave size={14} /> Update Order
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
        .rounded-2 {
          border-radius: 8px !important;
        }
        .form-label {
          margin-bottom: 0.5rem;
          font-size: 13px;
        }
        .form-text {
          font-size: 11px;
          margin-top: 0.25rem;
        }
        .badge {
          font-weight: 500;
        }
        .nav-tabs {
          border-bottom: none !important;
        }
        .nav-link {
          border: none;
          color: #6c757d;
          padding: 10px 16px;
          font-size: 14px;
          transition: all 0.2s;
          border-radius: 30px;
          margin-right: 8px;
        }
        .nav-link:hover {
          color: rgb(30, 58, 111);
          background: #f1f5f9;
        }
        .nav-link.active {
          color: rgb(30, 58, 111);
          background: #eef2ff;
          border: none;
        }
        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </Container>
  );
};

export default EditOrder;