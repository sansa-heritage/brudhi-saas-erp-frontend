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
} from "react-icons/fa";
import { getOrderById, updateOrder } from "../../api/tenant/order.api";
import { getCustomers } from "../../api/tenant/customer.api";
import { getDealers } from "../../api/tenant/dealer.api";
import { getProducts } from "../../api/tenant/inventory.api";

// Toast helper functions
const showToast = (icon, title, timer = 3000) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  
  Toast.fire({
    icon: icon,
    title: title,
  });
};

const showErrorToast = (title, timer = 4000) => {
  showToast("error", title, timer);
};

const showSuccessToast = (title, timer = 2000) => {
  showToast("success", title, timer);
};

const showWarningToast = (title, timer = 3000) => {
  showToast("warning", title, timer);
};

const showInfoToast = (title, timer = 3000) => {
  showToast("info", title, timer);
};

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    calculateTotals();
  }, [items, formData.discount_type, formData.discount_value, formData.shipping_charge]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all required data in parallel
      const [orderRes, customersRes, dealersRes, productsRes] = await Promise.all([
        getOrderById(id),
        getCustomers().catch(err => {
          console.error("Customers API error:", err);
          showErrorToast("Failed to load customers");
          return [];
        }),
        getDealers().catch(err => {
          console.error("Dealers API error:", err);
          showErrorToast("Failed to load dealers");
          return [];
        }),
        getProducts().catch(err => {
          console.error("Products API error:", err);
          showErrorToast("Failed to load products");
          return [];
        }),
      ]);

      // Extract order data - FIXED: Handle the actual response structure
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
        showErrorToast("Order not found");
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
      console.log("Customers loaded:", customersList.length);
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
      console.log("Dealers loaded:", dealersList.length);
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
      console.log("Products loaded:", mappedProducts.length);
      setProducts(mappedProducts);

      // Set party type from order data
      const customerType = orderData.customer_type || "customer";
      setPartyType(customerType);

      // Set form data - FIXED: Properly map all fields
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

      // Set items from order data - FIXED: Map items correctly
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
        console.log("Mapped items:", mappedItems);
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

      showSuccessToast("Order loaded successfully", 1500);

    } catch (err) {
      console.error("Failed to load data:", err);
      showErrorToast("Failed to load order details");
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
    showInfoToast(`Switched to ${type === "customer" ? "Customer" : "Dealer"} mode`);
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
      showSuccessToast(`Added ${selectedProduct.name}`, 1000);
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
    showInfoToast("New item added");
  };

  const removeItem = (index) => {
    const itemToRemove = items[index];
    if (itemToRemove.is_existing && itemToRemove.product_id) {
      setRemovedItems([...removedItems, parseInt(itemToRemove.product_id)]);
    }
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    showWarningToast("Item removed", 1500);
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showErrorToast("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare items array
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
        showErrorToast("Please add at least one valid item");
        setSubmitting(false);
        return;
      }

      // Prepare submit data
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
      
      const response = await updateOrder(id, submitData);
      console.log("Order update response:", response);
      
      showSuccessToast("Order updated successfully!");
      
      // Small delay to show toast before navigation
      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (error) {
      console.error("Failed to update order:", error);
      console.error("Error details:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || "Failed to update order";
      showErrorToast(errorMessage);
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
      <Container fluid className="p-4 bg-light">
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3">Loading order details...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            className="text-decoration-none p-0 d-flex align-items-center text-secondary mb-2"
            onClick={() => navigate("/orders")}
          >
            <FaArrowLeft className="me-2" /> Back to Orders
          </Button>
          <h2 className="fw-bold mb-1">
            <FaEdit className="me-2 text-secondary" /> Edit Order #{id}
          </h2>
          <p className="text-muted">Update order information</p>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Order Details */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaCalendarAlt className="me-2 text-secondary" /> Order Details
                </h6>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Order Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="order_date"
                        value={formData.order_date}
                        onChange={handleChange}
                        isInvalid={!!errors.order_date}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.order_date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Order Type</Form.Label>
                      <Form.Select
                        name="order_type"
                        value={formData.order_type}
                        onChange={handleChange}
                      >
                        <option value="sales">Sales Order</option>
                        <option value="purchase">Purchase Order</option>
                        <option value="return">Return Order</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Order Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Party Information */}
            <Card className="border-0 shadow-sm rounded-3 mt-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaUser className="me-2 text-secondary" /> Party Information
                </h6>

                <Form.Group className="mb-3">
                  <Form.Label>Select Party Type *</Form.Label>
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
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Select {partyType === "customer" ? "Customer" : "Dealer"} *
                  </Form.Label>
                  <Form.Select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    isInvalid={!!errors.customer_id}
                  >
                    <option value="">Select {partyType === "customer" ? "Customer" : "Dealer"}</option>
                    {(partyType === "customer" ? customers : dealers).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name || item.company_name || item.first_name || item.customer_name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.customer_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Financial Details */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaMoneyBill className="me-2 text-secondary" /> Financial Details
                </h6>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Status</Form.Label>
                      <Form.Select
                        name="payment_status"
                        value={formData.payment_status}
                        onChange={handleChange}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="refunded">Refunded</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleChange}
                      >
                        <option value="">Select Method</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subtotal</Form.Label>
                      <Form.Control
                        type="text"
                        value={`₹${parseFloat(formData.subtotal).toFixed(2)}`}
                        readOnly
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Type</Form.Label>
                      <Form.Select
                        name="discount_type"
                        value={formData.discount_type}
                        onChange={handleChange}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Value</Form.Label>
                      <Form.Control
                        type="number"
                        name="discount_value"
                        value={formData.discount_value}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Amount</Form.Label>
                      <Form.Control
                        type="number"
                        name="tax_amount"
                        value={formData.tax_amount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shipping Charge</Form.Label>
                      <Form.Control
                        type="number"
                        name="shipping_charge"
                        value={formData.shipping_charge}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="bg-light p-3 rounded-3 mb-3">
                  <Row>
                    <Col md={6}>
                      <h6 className="text-secondary mb-0">Discount: ₹{parseFloat(formData.discount_amount).toFixed(2)}</h6>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-secondary mb-0">Total: ₹{parseFloat(formData.total_amount).toFixed(2)}</h6>
                    </Col>
                  </Row>
                </div>

                <h6 className="fw-bold mb-3 mt-3">
                  <FaTruck className="me-2 text-secondary" /> Shipping Information
                </h6>

                <Form.Group className="mb-3">
                  <Form.Label>Delivery Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleChange}
                    placeholder="Enter delivery address"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Delivery Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="delivery_date"
                        value={formData.delivery_date}
                        onChange={handleChange}
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
              </Card.Body>
            </Card>
          </Col>

          {/* Order Items */}
          <Col lg={12}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">
                    <FaBox className="me-2 text-secondary" /> Order Items
                  </h6>
                  <Button variant="outline-secondary" size="sm" onClick={addItem}>
                    <FaPlus className="me-1" /> Add Item
                  </Button>
                </div>

                <div className="table-responsive">
                  <Table bordered>
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Product *</th>
                        <th style={{ width: "100px" }}>Quantity *</th>
                        <th style={{ width: "120px" }}>Unit Price</th>
                        <th style={{ width: "80px" }}>Discount %</th>
                        <th style={{ width: "80px" }}>GST%</th>
                        <th style={{ width: "120px" }}>Total</th>
                        <th style={{ width: "50px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items && items.length > 0 ? (
                        items.map((item, index) => (
                          <tr key={item.id}>
                            <td className="text-center">{index + 1}</td>
                            <td style={{ minWidth: "250px" }}>
                              <Form.Select
                                value={item.product_id}
                                onChange={(e) => handleProductSelect(index, e.target.value)}
                                isInvalid={!!errors[`item_${index}_product`]}
                              >
                                <option value="">Select Product</option>
                                {products && products.length > 0 ? (
                                  products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                      {product.name} - ₹{product.price.toFixed(2)}
                                    </option>
                                  ))
                                ) : (
                                  <option disabled>No products available</option>
                                )}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">
                                {errors[`item_${index}_product`]}
                              </Form.Control.Feedback>
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                                min="1"
                                isInvalid={!!errors[`item_${index}_qty`]}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors[`item_${index}_qty`]}
                              </Form.Control.Feedback>
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
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
                              />
                            </td>
                            <td className="text-center">
                              <Badge bg="secondary">{item.gst_rate}%</Badge>
                            </td>
                            <td className="text-end fw-semibold text-secondary">
                              ₹{formatCurrency(item.total_amount)}
                            </td>
                            <td className="text-center">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">No items added</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="table-light">
                      <tr className="table-secondary">
                        <td colSpan="6" className="text-end fw-bold">Grand Total:</td>
                        <td className="text-end fw-bold text-secondary fs-5">
                          ₹{formatCurrency(formData.total_amount)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
                {errors.items && <small className="text-danger">{errors.items}</small>}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate("/orders")}
            className="rounded-pill px-4"
            disabled={submitting}
          >
            <FaTimes className="me-2" /> Cancel
          </Button>
          <Button
            variant="secondary"
            type="submit"
            disabled={submitting}
            className="rounded-pill px-4"
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Update Order
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

export default EditOrder;