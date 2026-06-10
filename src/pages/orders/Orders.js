import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaShoppingCart,
  FaFilter,
  FaTimes,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaTruck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getOrders, deleteOrder, updateOrderStatus } from "../../api/tenant/order.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Order status color mapping (matching Expenses list style)
const statusConfig = {
  pending: { bg: "#FEF6D7", color: "#FED229", label: "Pending", icon: "clock" },
  confirmed: { bg: "#D3EAFF", color: "#437EF7", label: "Confirmed", icon: "check" },
  processing: { bg: "#FFE0CB", color: "#FF8532", label: "Processing", icon: "sync" },
  filled: { bg: "#D3EAFF", color: "#437EF7", label: "Filled", icon: "box" },
  quality_check: { bg: "#FEF6D7", color: "#FED229", label: "Quality Check", icon: "check" },
  ready_for_dispatch: { bg: "#ECFDF3", color: "#027A48", label: "Ready to Dispatch", icon: "box" },
  dispatched: { bg: "#D3EAFF", color: "#437EF7", label: "Dispatched", icon: "truck" },
  out_for_delivery: { bg: "#FFE0CB", color: "#FF8532", label: "Out for Delivery", icon: "truck" },
  delivered: { bg: "#ECFDF3", color: "#027A48", label: "Delivered", icon: "check" },
  completed: { bg: "#ECFDF3", color: "#027A48", label: "Completed", icon: "check" },
  cancelled: { bg: "#FFDCE2", color: "#F94765", label: "Cancelled", icon: "ban" },
  returned: { bg: "#FFDCE2", color: "#F94765", label: "Returned", icon: "ban" },
  failed: { bg: "#FFF2F0", color: "#E2341D", label: "Failed", icon: "ban" },
};

// Order type color mapping
const orderTypeConfig = {
  sales: { bg: "#ECFDF3", color: "#027A48", label: "Sales" },
  purchase: { bg: "#D3EAFF", color: "#437EF7", label: "Purchase" },
  return: { bg: "#FFDCE2", color: "#F94765", label: "Return" },
};

// Payment status color mapping
const paymentStatusConfig = {
  paid: { bg: "#ECFDF3", color: "#027A48", label: "Paid" },
  pending: { bg: "#FFDCE2", color: "#F94765", label: "Pending" },
  partial: { bg: "#FEF6D7", color: "#FED229", label: "Partial" },
  refunded: { bg: "#FFF2F0", color: "#E2341D", label: "Refunded" },
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getOrders();
      let ordersData = [];

      if (response?.data?.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      } else if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        ordersData = response.data.data.data;
      } else if (response?.data?.data?.orders && Array.isArray(response.data.data.orders)) {
        ordersData = response.data.data.orders;
      }

      if (ordersData.length > 0) {
        const formattedOrders = ordersData.map((order) => ({
          id: order.id,
          order_no: order.order_no,
          order_date: order.order_date,
          customer_id: order.customer_id,
          customer_name: order.customer_name,
          customer_type: order.customer_type,
          order_type: order.order_type,
          status: order.status,
          payment_status: order.payment_status,
          subtotal: parseFloat(order.subtotal) || 0,
          discount_amount: parseFloat(order.discount_amount) || 0,
          tax_amount: parseFloat(order.tax_amount) || 0,
          shipping_charge: parseFloat(order.shipping_charge) || 0,
          total_amount: parseFloat(order.total_amount) || 0,
          notes: order.notes,
          delivery_address: order.delivery_address,
          delivery_date: order.delivery_date,
          assigned_to: order.assigned_to,
          assigned_to_name: order.assigned_to_name,
          created_by: order.created_by,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: order.items || [],
        }));
        setOrders(formattedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    navigate(`/orders/edit/${id}`);
  };

  const handleAdd = () => {
    navigate("/orders/add");
  };

  const handleDelete = async (id, orderNo) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete order "${orderNo}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6c757d",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteOrder(id);
        toast.success(`✓ Order "${orderNo}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
        await loadOrders();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(`✗ ${error.response?.data?.message || "Failed to delete order"}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setOrderTypeFilter("all");
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.order_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesOrderType = orderTypeFilter === "all" || order.order_type === orderTypeFilter;

    return matchesSearch && matchesStatus && matchesOrderType;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    totalAmount: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
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
          <h4 className="mt-3">Loading orders...</h4>
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

      {errorMessage && (
        <Alert
          variant="danger"
          className="mb-3"
          onClose={() => setErrorMessage("")}
          dismissible
        >
          {errorMessage}
        </Alert>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {/* <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            Order Management
          </h2>
          <p className="text-muted mb-0">Manage cylinder orders and track delivery status</p> */}
        </div>
        <Button
          onClick={handleAdd}
          style={{
            backgroundColor: "rgb(30, 58, 111)",
            border: "none",
            borderRadius: "14px",
            padding: "12px 22px",
            fontWeight: "600",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
          }}
        >
          <FaPlus size={14} />
          Create Order
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card
            className="border-0"
            style={{
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
                    Total Orders
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.total}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    {stats.total} entries
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFDCE2",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaShoppingCart size={18} style={{ color: "#F94765" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="border-0"
            style={{
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
                    Pending
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.pending}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Awaiting confirmation
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#FEF6D7",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaClock size={18} style={{ color: "#FED229" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="border-0"
            style={{
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
                    Processing
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.processing}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    In progress
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFE0CB",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaBox size={18} style={{ color: "#FF8532" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="border-0"
            style={{
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>
                    Total Amount
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    ₹{formatCurrency(stats.totalAmount)}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    All orders
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#D3EAFF",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaRupeeSign size={18} style={{ color: "#437EF7" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <Card
        className="border-0 mb-4"
        style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <Card.Body className="py-3">
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text
                  style={{ backgroundColor: "#fff", borderRight: "none" }}
                >
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by order number or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderLeft: "none" }}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status ({stats.total})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="processing">Processing ({stats.processing})</option>
                <option value="delivered">Delivered ({stats.delivered})</option>
                <option value="cancelled">Cancelled ({stats.cancelled})</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
              >
                <option value="all">All Types ({stats.total})</option>
                <option value="sales">Sales</option>
                <option value="purchase">Purchase</option>
                <option value="return">Return</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                className="w-100"
                title="Clear filters"
              >
                <FaFilter />
              </Button>
            </Col>
          </Row>

          {/* Active Filters Display */}
          {(statusFilter !== "all" || orderTypeFilter !== "all" || searchTerm) && (
            <div className="mt-3 pt-2 border-top">
              <small className="text-muted me-2">Active filters:</small>
              {statusFilter !== "all" && (
                <span
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px 12px",
                    marginRight: "8px",
                    borderRadius: "20px",
                    display: "inline-block",
                    fontSize: "12px",
                  }}
                  onClick={() => setStatusFilter("all")}
                >
                  Status: {statusConfig[statusFilter]?.label || statusFilter} <FaTimes size={10} className="ms-2" />
                </span>
              )}
              {orderTypeFilter !== "all" && (
                <span
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px 12px",
                    marginRight: "8px",
                    borderRadius: "20px",
                    display: "inline-block",
                    fontSize: "12px",
                  }}
                  onClick={() => setOrderTypeFilter("all")}
                >
                  Type: {orderTypeConfig[orderTypeFilter]?.label || orderTypeFilter} <FaTimes size={10} className="ms-2" />
                </span>
              )}
              {searchTerm && (
                <span
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px 12px",
                    marginRight: "8px",
                    borderRadius: "20px",
                    display: "inline-block",
                    fontSize: "12px",
                  }}
                  onClick={() => setSearchTerm("")}
                >
                  Search: "{searchTerm}" <FaTimes size={10} className="ms-2" />
                </span>
              )}
              <Button
                variant="link"
                size="sm"
                onClick={clearFilters}
                className="p-0 ms-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      {/* Orders Table */}
      <Card
        className="border-0"
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ fontSize: "14px" }}>
              <thead
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                <tr>
                  <th style={{ padding: "16px 12px" }}>Order Details</th>
                  <th style={{ padding: "16px 12px" }}>Customer</th>
                  <th style={{ padding: "16px 12px" }}>Type</th>
                  <th style={{ padding: "16px 12px" }}>Amount</th>
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>Payment</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const orderDate = formatDate(order.order_date);
                  return (
                    <tr
                      key={order.id}
                      style={{ borderBottom: "1px solid #e9ecef" }}
                    >
                      {/* Order Details */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="fw-semibold">{order.order_no}</div>
                        <small className="text-muted">
                          {/* <FaCalendarAlt size={10} className="me-1" /> */}
                          {orderDate}
                        </small>
                        {/* <div>
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            Items: {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                          </small>
                        </div> */}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "16px 12px" }}>
                        <div>
                          <FaUser size={12} className="text-muted me-1" />
                          <span className="fw-semibold">{order.customer_name || "N/A"}</span>
                        </div>
                      </td>

                      {/* Order Type */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: orderTypeConfig[order.order_type]?.bg || "#f3f4f6",
                            color: orderTypeConfig[order.order_type]?.color || "#1e293b",
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {orderTypeConfig[order.order_type]?.label || order.order_type}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: "16px 12px" }}>
                        <span className="fw-bold">
                          ₹{formatCurrency(order.total_amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: statusConfig[order.status]?.bg || "#f3f4f6",
                            color: statusConfig[order.status]?.color || "#1e293b",
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {statusConfig[order.status]?.label || order.status}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "600",
                            fontSize: "13px",
                            backgroundColor: paymentStatusConfig[order.payment_status]?.bg || "#f3f4f6",
                            color: paymentStatusConfig[order.payment_status]?.color || "#1e293b",
                            border: "none",
                            display: "inline-block",
                          }}
                        >
                          {paymentStatusConfig[order.payment_status]?.label || order.payment_status}
                        </span>
                      </td>

                      {/* Actions Dropdown */}
                      <td style={{ padding: "16px 12px" }}>
                        <div className="action-dropdown">
                          <button
                            className="action-trigger"
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === order.id ? null : order.id,
                              )
                            }
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#f1f5f9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "transparent")
                            }
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="6" r="2" fill="currentColor" />
                              <circle cx="12" cy="12" r="2" fill="currentColor" />
                              <circle cx="12" cy="18" r="2" fill="currentColor" />
                            </svg>
                          </button>

                          {activeDropdown === order.id && (
                            <div className="dropdown-menu-custom">
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleView(order);
                                }}
                                className="dropdown-item-custom"
                                title="View Details"
                              >
                                <FaEye style={{ color: "#4361ee", fontSize: "14px" }} />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleEdit(order.id);
                                }}
                                className="dropdown-item-custom"
                                title="Edit"
                              >
                                <FaEdit style={{ color: "#ff9800", fontSize: "14px" }} />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleDelete(order.id, order.order_no);
                                }}
                                className="dropdown-item-custom delete"
                                title="Delete"
                              >
                                <FaTrash style={{ color: "#dc3545", fontSize: "14px" }} />
                              </button>
                            </div>
                          )}
                        </div>

                        <style>{`
                          .action-dropdown { position: relative; }
                          .action-trigger { color: #64748b; transition: all 0.2s; }
                          .action-trigger:hover { color: #1e293b; }
                          .dropdown-menu-custom {
                            position: absolute;
                            top: 100%;
                            right: 0;
                            margin-top: 4px;
                            min-width: 40px;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                            z-index: 1000;
                            overflow: hidden;
                            animation: dropdownSlide 0.2s ease;
                            display: flex;
                            flex-direction: column;
                            gap: 2px;
                            padding: 4px;
                          }
                          @keyframes dropdownSlide {
                            from { opacity: 0; transform: translateY(-5px); }
                            to { opacity: 1; transform: translateY(0); }
                          }
                          .dropdown-item-custom {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            padding: 6px;
                            border: none;
                            background: white;
                            cursor: pointer;
                            transition: background-color 0.2s;
                            border-radius: 6px;
                          }
                          .dropdown-item-custom:hover { background-color: #f8fafc; }
                          .dropdown-item-custom.delete:hover { background-color: #fef2f2; }
                        `}</style>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <FaShoppingCart size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No orders found</h5>
                        <p className="text-muted small">
                          Try adjusting your search or filter criteria
                        </p>
                        <Button 
                          style={{
                            backgroundColor: "rgb(30, 58, 111)",
                            border: "none"
                          }}
                          size="sm" 
                          onClick={clearFilters}
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* View Order Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <FaEye className="me-2 text-secondary" /> Order Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <small className="text-muted">Order Number</small>
                  <p className="fw-bold mb-0">{selectedOrder.order_no}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Order Date</small>
                  <p className="fw-bold mb-0">{formatDate(selectedOrder.order_date)}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <small className="text-muted">Customer</small>
                  <p className="fw-bold mb-0">{selectedOrder.customer_name || "N/A"}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Order Type</small>
                  <div>{orderTypeConfig[selectedOrder.order_type]?.label || selectedOrder.order_type}</div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <small className="text-muted">Order Status</small>
                  <div className="mt-1">
                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontWeight: "600",
                        fontSize: "13px",
                        backgroundColor: statusConfig[selectedOrder.status]?.bg || "#f3f4f6",
                        color: statusConfig[selectedOrder.status]?.color || "#1e293b",
                        border: "none",
                        display: "inline-block",
                      }}
                    >
                      {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                    </span>
                  </div>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Payment Status</small>
                  <div className="mt-1">
                    <span
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontWeight: "600",
                        fontSize: "13px",
                        backgroundColor: paymentStatusConfig[selectedOrder.payment_status]?.bg || "#f3f4f6",
                        color: paymentStatusConfig[selectedOrder.payment_status]?.color || "#1e293b",
                        border: "none",
                        display: "inline-block",
                      }}
                    >
                      {paymentStatusConfig[selectedOrder.payment_status]?.label || selectedOrder.payment_status}
                    </span>
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <small className="text-muted">Total Amount</small>
                  <p className="fw-bold text-primary fs-5 mb-0">₹{formatCurrency(selectedOrder.total_amount)}</p>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          {/* <Button
            variant="secondary"
            onClick={() => setShowViewModal(false)}
            style={{ backgroundColor: "#6c757d", border: "none" }}
          >
            Close
          </Button> */}
          {selectedOrder && (
            <Button
              onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedOrder.id);
              }}
              style={{
                backgroundColor: "rgb(30, 58, 111)",
                border: "none"
              }}
            >
              <FaEdit className="me-2" /> Edit Order
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders;