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
import { useNavigate } from "react-router-dom";
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
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCreditCard,
  FaTag,
} from "react-icons/fa";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createOrder } from "../../api/tenant/order.api";
import { getCustomers } from "../../api/tenant/customer.api";
import { getDealers } from "../../api/tenant/dealer.api";
import { getProducts } from "../../api/tenant/inventory.api";

// Order Status Flow Configuration - Gas Agency
const ORDER_STATUS_FLOW = {
  pending: {
    label: "Pending",
    description: "Order has been created but not yet confirmed",
    color: "#ffc107",
    allowedNext: ["confirmed", "cancelled"],
  },
  confirmed: {
    label: "Confirmed",
    description: "Order has been confirmed by admin",
    color: "#17a2b8",
    allowedNext: ["processing", "cancelled"],
  },
  processing: {
    label: "Processing",
    description: "Cylinders are being filled/refilled",
    color: "#007bff",
    allowedNext: ["filled", "cancelled"],
  },
  filled: {
    label: "Filled",
    description: "Cylinders have been filled, pending quality check",
    color: "#6f42c1",
    allowedNext: ["quality_check", "cancelled"],
  },
  quality_check: {
    label: "Quality Check",
    description: "Quality check in progress",
    color: "#fd7e14",
    allowedNext: ["ready_for_dispatch", "failed"],
  },
  ready_for_dispatch: {
    label: "Ready for Dispatch",
    description: "Order is ready to be dispatched",
    color: "#20c997",
    allowedNext: ["dispatched", "cancelled"],
  },
  dispatched: {
    label: "Dispatched",
    description: "Order has been dispatched from agency",
    color: "#0dcaf0",
    allowedNext: ["out_for_delivery", "cancelled"],
  },
  out_for_delivery: {
    label: "Out for Delivery",
    description: "Delivery person is on the way",
    color: "#0d6efd",
    allowedNext: ["delivered", "returned"],
  },
  delivered: {
    label: "Delivered",
    description: "Order has been delivered to customer",
    color: "#198754",
    allowedNext: ["completed", "returned"],
  },
  completed: {
    label: "Completed",
    description: "Order is successfully completed",
    color: "#198754",
    allowedNext: [],
  },
  cancelled: {
    label: "Cancelled",
    description: "Order has been cancelled",
    color: "#dc3545",
    allowedNext: [],
  },
  returned: {
    label: "Returned",
    description: "Order was returned by customer",
    color: "#dc3545",
    allowedNext: ["processing"],
  },
  failed: {
    label: "Failed",
    description: "Quality check failed, needs rework",
    color: "#dc3545",
    allowedNext: ["processing"],
  },
};

// Helper function to check if status transition is valid
const isValidStatusTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) return true;
  const currentConfig = ORDER_STATUS_FLOW[currentStatus];
  if (!currentConfig) return false;
  return currentConfig.allowedNext.includes(newStatus);
};

// Get next allowed statuses
const getNextAllowedStatuses = (currentStatus) => {
  const currentConfig = ORDER_STATUS_FLOW[currentStatus];
  if (!currentConfig) return [];
  return currentConfig.allowedNext;
};

const AddOrder = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [statusError, setStatusError] = useState("");
  const [activeTab, setActiveTab] = useState("order");

  // Data lists - Initialize as empty arrays
  const [customers, setCustomers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [partyType, setPartyType] = useState("customer");

  const currentUserId = parseInt(localStorage.getItem("userId")) || 1;

  // Order Items
  const [items, setItems] = useState([
    {
      id: 1,
      product_id: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      gst_rate: 18,
      discount_percent: 0,
      total_amount: 0,
    },
  ]);
  const [nextItemId, setNextItemId] = useState(2);

  const [formData, setFormData] = useState({
    order_date: new Date().toISOString().split("T")[0],
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
    created_by: 1,
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
  }, [partyType]);

  useEffect(() => {
    calculateTotals();
  }, [
    items,
    formData.discount_type,
    formData.discount_value,
    formData.shipping_charge,
  ]);

  // Reset status error when status changes
  useEffect(() => {
    setStatusError("");
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: "" }));
    }
  }, [formData.status]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [customersRes, dealersRes, productsRes] = await Promise.all([
        getCustomers().catch((err) => {
          console.error("Customers API error:", err);
          return [];
        }),
        getDealers().catch((err) => {
          console.error("Dealers API error:", err);
          return [];
        }),
        getProducts().catch((err) => {
          console.error("Products API error:", err);
          return [];
        }),
      ]);

      // Extract customers - ensure it's always an array
      let customersList = [];
      if (
        customersRes &&
        customersRes.data &&
        customersRes.data.data &&
        Array.isArray(customersRes.data.data)
      ) {
        customersList = customersRes.data.data;
      } else if (
        customersRes &&
        customersRes.data &&
        Array.isArray(customersRes.data)
      ) {
        customersList = customersRes.data;
      } else if (customersRes && Array.isArray(customersRes)) {
        customersList = customersRes;
      } else if (
        customersRes &&
        customersRes.data &&
        customersRes.data.data &&
        customersRes.data.data.data &&
        Array.isArray(customersRes.data.data.data)
      ) {
        customersList = customersRes.data.data.data;
      }
      console.log("Customers loaded:", customersList.length);
      setCustomers(customersList);

      // Extract dealers - ensure it's always an array
      let dealersList = [];
      if (
        dealersRes &&
        dealersRes.data &&
        dealersRes.data.data &&
        Array.isArray(dealersRes.data.data)
      ) {
        dealersList = dealersRes.data.data;
      } else if (
        dealersRes &&
        dealersRes.data &&
        Array.isArray(dealersRes.data)
      ) {
        dealersList = dealersRes.data;
      } else if (dealersRes && Array.isArray(dealersRes)) {
        dealersList = dealersRes;
      } else if (
        dealersRes &&
        dealersRes.data &&
        dealersRes.data.data &&
        dealersRes.data.data.data &&
        Array.isArray(dealersRes.data.data.data)
      ) {
        dealersList = dealersRes.data.data.data;
      }
      console.log("Dealers loaded:", dealersList.length);
      setDealers(dealersList);

      // Extract products - ensure it's always an array (CRITICAL FIX)
      let productsList = [];
      if (
        productsRes &&
        productsRes.data &&
        productsRes.data.data &&
        Array.isArray(productsRes.data.data)
      ) {
        productsList = productsRes.data.data;
      } else if (
        productsRes &&
        productsRes.data &&
        Array.isArray(productsRes.data)
      ) {
        productsList = productsRes.data;
      } else if (productsRes && Array.isArray(productsRes)) {
        productsList = productsRes;
      } else if (
        productsRes &&
        productsRes.data &&
        productsRes.data.data &&
        productsRes.data.data.data &&
        Array.isArray(productsRes.data.data.data)
      ) {
        productsList = productsRes.data.data.data;
      }

      console.log("Products loaded:", productsList.length);
      console.log("Products sample:", productsList[0]);

      // Map products to required format
      const mappedProducts = (productsList || []).map((product) => ({
        id: product.id,
        name: product.product_name || product.name,
        price: parseFloat(product.selling_price || product.price || 0),
        gst_rate: parseFloat(product.gst_rate || 18),
        current_stock: parseInt(product.current_stock || 0),
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.warning(
        "Some data couldn't be loaded. Please check your connection.",
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        },
      );
      // Set empty arrays to prevent map errors
      setCustomers([]);
      setDealers([]);
      setProducts([]);
    } finally {
      setLoadingData(false);
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

    const updatedItems = items.map((item) => {
      if (item.product_id && item.quantity > 0 && item.unit_price > 0) {
        const calculations = calculateItemTotal(item);
        subtotal += calculations.taxable_value;
        totalTaxAmount += calculations.gst_amount;
        return {
          ...item,
          total_amount: calculations.total_amount,
          taxable_value: calculations.taxable_value,
          discount_amount: calculations.discount_amount,
          gst_amount: calculations.gst_amount,
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

    setFormData((prev) => ({
      ...prev,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle status change with validation
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const currentStatus = formData.status;

    // For new order creation, only allow "pending" or valid initial statuses
    if (currentStatus === "pending" && newStatus !== "pending") {
      // Check if the new status is valid as an initial status
      const validInitialStatuses = ["pending"];
      
      if (!validInitialStatuses.includes(newStatus)) {
        setStatusError(
          `⚠️ New orders must start with "Pending" status. ` +
          `"${ORDER_STATUS_FLOW[newStatus]?.label}" status cannot be set directly on order creation.`
        );
        toast.error(`Cannot create order with "${ORDER_STATUS_FLOW[newStatus]?.label}" status. Order must start with "Pending".`, {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
          transition: Bounce,
        });
        return;
      }
    }

    // Check if the transition is valid (for existing orders, but we still validate)
    if (currentStatus !== newStatus && !isValidStatusTransition(currentStatus, newStatus)) {
      const currentConfig = ORDER_STATUS_FLOW[currentStatus];
      const allowedNext = getNextAllowedStatuses(currentStatus);
      const allowedLabels = allowedNext.map(s => ORDER_STATUS_FLOW[s]?.label).join(", ");
      
      setStatusError(
        `⚠️ Invalid status transition! Cannot change from "${currentConfig?.label}" to "${ORDER_STATUS_FLOW[newStatus]?.label}". ` +
        `Allowed next statuses: ${allowedLabels || "None"}`
      );
      
      toast.error(`Invalid status transition! Cannot change from ${currentConfig?.label} to ${ORDER_STATUS_FLOW[newStatus]?.label}`, {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
        transition: Bounce,
      });
      return;
    }

    setStatusError("");
    setFormData((prev) => ({ ...prev, status: newStatus }));
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: "" }));
    }
  };

  const handlePartyTypeChange = (type) => {
    setPartyType(type);
    setFormData((prev) => ({ ...prev, customer_type: type, customer_id: "" }));
  };

  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find((p) => p.id === parseInt(productId));
    if (selectedProduct) {
      const updatedItems = [...items];
      const quantity = updatedItems[index].quantity || 1;
      const unitPrice = selectedProduct.price;
      const taxableValue = quantity * unitPrice;
      const discountAmount =
        (taxableValue * (updatedItems[index].discount_percent || 0)) / 100;
      const afterDiscount = taxableValue - discountAmount;
      const gstAmount = (afterDiscount * (selectedProduct.gst_rate || 0)) / 100;
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

    if (
      field === "quantity" ||
      field === "unit_price" ||
      field === "discount_percent"
    ) {
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
      },
    ]);
    setNextItemId(nextItemId + 1);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.order_date) {
      newErrors.order_date = "Order date is required";
    }

    if (!formData.customer_id) {
      newErrors.customer_id = `Please select a ${partyType === "customer" ? "customer" : "dealer"}`;
    }

    // ✅ ADDED: Validate order status is pending for new orders
    if (formData.status !== "pending") {
      newErrors.status = `Order status must be "Pending". Cannot create order with "${ORDER_STATUS_FLOW[formData.status]?.label}" status directly.`;
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
      toast.error("Please fix the validation errors", {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare items array
      const itemsArray = [];

      for (const item of items) {
        if (
          item.product_id &&
          item.product_id !== "" &&
          item.quantity > 0 &&
          item.unit_price > 0
        ) {
          const quantity = parseInt(item.quantity);
          const unitPrice = parseFloat(item.unit_price);
          const taxableValue = quantity * unitPrice;
          const discountPercent = parseFloat(item.discount_percent) || 0;
          const discountAmount = (taxableValue * discountPercent) / 100;
          const afterDiscount = taxableValue - discountAmount;
          const gstRate = parseFloat(item.gst_rate) || 18;
          const gstAmount = (afterDiscount * gstRate) / 100;
          const totalAmount = afterDiscount + gstAmount;

          itemsArray.push({
            product_id: parseInt(item.product_id),
            product_name: item.product_name,
            quantity: quantity,
            unit_price: unitPrice,
            discount_percent: discountPercent,
            discount_amount: discountAmount,
            taxable_value: taxableValue,
            gst_rate: gstRate,
            gst_amount: gstAmount,
            total_amount: totalAmount,
          });
        }
      }

      console.log("Items array being sent:", itemsArray);

      if (itemsArray.length === 0) {
        toast.error("Please add at least one valid item", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });

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
        created_by: formData.created_by,
        changed_by: formData.changed_by,
        items: itemsArray,
      };

      console.log("Submitting order:", submitData);

      const response = await createOrder(submitData);
      console.log("Order creation response:", response);

      toast.success(
        `✅ Order created successfully! Order ID: ${response.data?.id || "N/A"} | Status: ${ORDER_STATUS_FLOW[formData.status]?.label} 🎉`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        },
      );

      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (error) {
      console.error("Failed to create order:", error);
      console.error("Error details:", error.response?.data);

      toast.error(error.response?.data?.message || "Failed to create order", {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loadingData) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading data...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" transition={Bounce} />

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="order" className="fw-semibold">
                  <FaShoppingCart className="me-2" /> Order Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="party" className="fw-semibold">
                  <FaUser className="me-2" /> Party Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="financial" className="fw-semibold">
                  <FaMoneyBill className="me-2" /> Financial Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="items" className="fw-semibold">
                  <FaBox className="me-2" /> Order Items
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* Order Details Tab */}
              <Tab.Pane eventKey="order" active={activeTab === "order"}>
                <Row>
                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaCalendarAlt className="me-2" /> Basic Information
                    </h6>
                    <hr className="mt-0 mb-3" />

                    <Form.Group className="mb-4">
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

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Order Type</Form.Label>
                      <Form.Select name="order_type" value={formData.order_type} onChange={handleChange} className="rounded-2">
                        <option value="sales">Sales Order</option>
                        <option value="purchase">Purchase Order</option>
                        <option value="return">Return Order</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Order Status <span className="text-danger">*</span>
                        <small className="text-muted ms-2"><FaInfoCircle /> New orders must start with "Pending"</small>
                      </Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleStatusChange}
                          isInvalid={!!errors.status || !!statusError}
                          className="flex-grow-1 rounded-2"
                        >
                          {Object.entries(ORDER_STATUS_FLOW).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </Form.Select>
                        {getValidationIcon(formData.status, errors.status || statusError)}
                      </div>
                      {errors.status && <Form.Text className="text-danger">{errors.status}</Form.Text>}
                      {statusError && <Form.Text className="text-danger">{statusError}</Form.Text>}
                      {formData.status === "pending" && !errors.status && !statusError && (
                        <Form.Text className="text-success">✓ Valid - Orders must start with Pending status</Form.Text>
                      )}
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <h6 className="fw-bold mb-3" style={{ color: "rgb(30, 58, 111)" }}>
                      <FaInfoCircle className="me-2" /> Status Flow Information
                    </h6>
                    <hr className="mt-0 mb-3" />
                    
                    <div className="bg-light p-3 rounded-3">
                      <small className="text-muted d-block mb-2"><strong>Order Status Flow (Gas Agency):</strong></small>
                      <div className="d-flex flex-wrap gap-1 align-items-center small">
                        <span className="badge bg-warning text-dark">Pending</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-info">Confirmed</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-primary">Processing</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-secondary">Filled</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-warning text-dark">Quality Check</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-success">Ready for Dispatch</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-info">Dispatched</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-primary">Out for Delivery</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-success">Delivered</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-success">Completed</span>
                      </div>
                      <small className="text-muted mt-2 d-block">Note: Orders can only be created with "Pending" status</small>
                    </div>

                    <Alert variant="success" className="mt-4 rounded-3">
                      <FaCheckCircle className="me-2" />
                      <small>
                        <strong>Ready to Submit?</strong>
                        <br />
                        Please review all order details before submitting.
                        <br />
                        You can edit the order later if needed.
                      </small>
                    </Alert>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Party Information Tab */}
              <Tab.Pane eventKey="party" active={activeTab === "party"}>
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
                              {item.name || item.company_name || item.first_name}
                            </option>
                          ))}
                        </Form.Select>
                        {getValidationIcon(formData.customer_id, errors.customer_id)}
                      </div>
                      {errors.customer_id && <Form.Text className="text-danger">{errors.customer_id}</Form.Text>}
                    </Form.Group>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Financial Details Tab */}
              <Tab.Pane eventKey="financial" active={activeTab === "financial"}>
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
              </Tab.Pane>

              {/* Order Items Tab */}
              <Tab.Pane eventKey="items" active={activeTab === "items"}>
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
                                  {product.name} - ₹{product.price}
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
              </Tab.Pane>
            </Tab.Content>
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
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave size={14} /> Submit
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
      `}</style>
    </Container>
  );
};

export default AddOrder;