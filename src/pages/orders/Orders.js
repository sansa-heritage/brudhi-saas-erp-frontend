import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
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
  FaArrowLeft,
  FaHome,
  FaUser,
  FaCalendarAlt,
  FaRupeeSign,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaTruck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getOrders, deleteOrder } from "../../api/tenant/order.api";
import Swal from "sweetalert2";

// Toast helper functions for delete only
const showDeleteSuccessToast = (title, timer = 2000) => {
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
    icon: "success",
    title: title,
  });
};

const showDeleteErrorToast = (title, timer = 4000) => {
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
    icon: "error",
    title: title,
  });
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
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
      console.log("=== FULL API RESPONSE ===");
      console.log("Response status:", response?.status);
      console.log("Response data:", response?.data);

      let ordersData = [];

      if (response?.data?.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
        console.log(
          "Found orders in response.data.data, count:",
          ordersData.length,
        );
      } else if (response?.data && Array.isArray(response.data)) {
        ordersData = response.data;
        console.log("Found orders in response.data, count:", ordersData.length);
      } else if (Array.isArray(response)) {
        ordersData = response;
        console.log("Found orders in response, count:", ordersData.length);
      } else if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        ordersData = response.data.data.data;
        console.log(
          "Found orders in response.data.data.data, count:",
          ordersData.length,
        );
      } else if (
        response?.data?.data?.orders &&
        Array.isArray(response.data.data.orders)
      ) {
        ordersData = response.data.data.orders;
        console.log(
          "Found orders in response.data.data.orders, count:",
          ordersData.length,
        );
      } else {
        console.warn(
          "Could not find orders array. Response structure:",
          response,
        );
        setErrorMessage("Unable to parse orders data. Please check console.");
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

        console.log("Formatted orders:", formattedOrders);
        setOrders(formattedOrders);
      } else {
        console.log("No orders found in response");
        setOrders([]);
        setErrorMessage("No orders found. Create your first order!");
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
        showDeleteSuccessToast(`Order ${orderNo} deleted successfully`);
        await loadOrders();
      } catch (error) {
        console.error("Delete error:", error);
        showDeleteErrorToast(error.response?.data?.message || "Failed to delete order");
      }
    }
  };

 const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        bg: "hsl(227, 81%, 42%)", 
        text: "Pending", 
        color: "#ffffff" 
      },
      confirmed: { 
        bg: "hsl(188, 78%, 41%)", 
        text: "Confirmed", 
        color: "#ffffff" 
      },
      processing: { 
        bg: "hsl(211, 100%, 50%)", 
        text: "Processing", 
        color: "#ffffff" 
      },
      shipped: { 
        bg: "hsl(210, 11%, 61%)", 
        text: "Shipped", 
        color: "#ffffff" 
      },
      delivered: { 
        bg: "hsl(134, 61%, 41%)", 
        text: "Delivered", 
        color: "#ffffff" 
      },
      completed: { 
        bg: "hsl(134, 61%, 41%)", 
        text: "Completed", 
        color: "#ffffff" 
      },
      cancelled: { 
        bg: "hsl(354, 70%, 54%)", 
        text: "Cancelled", 
        color: "#ffffff" 
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge 
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 12px",
          borderRadius: "20px",
          fontWeight: "500",
          display: "inline-block"
        }}
      >
        {config.text}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "secondary", text: "Pending" },
      paid: { bg: "secondary", text: "Paid" },
      partial: { bg: "secondary", text: "Partial" },
      refunded: { bg: "secondary", text: "Refunded" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge bg={config.bg} className="rounded-pill px-2 py-1">
        {config.text}
      </Badge>
    );
  };

  const getOrderTypeBadge = (type) => {
    const typeConfig = {
      sales: { bg: "secondary", text: "Sales" },
      purchase: { bg: "secondary", text: "Purchase" },
      return: { bg: "secondary", text: "Return" },
    };
    const config = typeConfig[type] || typeConfig.sales;
    return (
      <Badge bg={config.bg} className="rounded-pill px-2 py-1">
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
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

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesOrderType =
      orderTypeFilter === "all" || order.order_type === orderTypeFilter;

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

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light">
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading orders...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FaShoppingCart className="me-2 text-secondary" /> Order Management
          </h2>
          <p className="text-muted">
            Manage all customer orders and track status
          </p>
        </div>
        <Button variant="secondary" onClick={handleAdd}>
          <FaPlus className="me-2" /> Create Order
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={2}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Total Orders</small>
              <h3 className="fw-bold mb-0">{stats.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Pending</small>
              <h3 className="fw-bold text-secondary mb-0">{stats.pending}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Processing</small>
              <h3 className="fw-bold text-secondary mb-0">
                {stats.processing}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Delivered</small>
              <h3 className="fw-bold text-secondary mb-0">{stats.delivered}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Cancelled</small>
              <h3 className="fw-bold text-secondary mb-0">{stats.cancelled}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="text-center">
              <small className="text-muted">Total Value</small>
              <h3 className="fw-bold text-secondary mb-0">
                ₹{formatCurrency(stats.totalAmount)}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="secondary" className="mb-4">
          <div className="d-flex align-items-center">
            <FaShoppingCart size={24} className="me-3" />
            <div>
              <strong>{errorMessage}</strong>
            </div>
          </div>
        </Alert>
      )}

      {/* Search and Filter */}
      <Card className="border-0 shadow-sm mb-4 rounded-3">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by order no, customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
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
              >
                <FaFilter />
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Order No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td className="text-secondary fw-semibold">
                        {order.order_no}
                       </td>
                      <td>{formatDate(order.order_date)}</td>
                      <td>{order.customer_name || "N/A"}</td>
                      <td>{getOrderTypeBadge(order.order_type)}</td>
                      <td className="text-center">
                        <Badge bg="secondary" className="rounded-pill">
                          {order.items?.length || 0}
                        </Badge>
                       </td>
                      <td className="fw-bold">
                        ₹{formatCurrency(order.total_amount)}
                       </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{getPaymentStatusBadge(order.payment_status)}</td>
                      <td>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-1 rounded-circle"
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: "0",
                          }}
                          onClick={() => handleView(order)}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-1 rounded-circle"
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: "0",
                          }}
                          onClick={() => handleEdit(order.id)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-circle"
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: "0",
                          }}
                          onClick={() => handleDelete(order.id, order.order_no)}
                        >
                          <FaTrash />
                        </Button>
                       </td>
                     </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <FaShoppingCart size={50} className="text-muted mb-3" />
                      <h5>No orders found</h5>
                      <Button
                        variant="secondary"
                        onClick={handleAdd}
                        className="mt-2"
                      >
                        Create First Order
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* View Order Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-secondary text-white">
          <Modal.Title>Order Details - {selectedOrder?.order_no}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row>
                <Col md={6}>
                  <strong>Order Date:</strong>{" "}
                  {formatDate(selectedOrder.order_date)}
                  <br />
                  <strong>Customer:</strong> {selectedOrder.customer_name}
                  <br />
                  <strong>Order Type:</strong> {selectedOrder.order_type}
                  <br />
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(selectedOrder.status)}
                </Col>
                <Col md={6}>
                  <strong>Payment Status:</strong>{" "}
                  {getPaymentStatusBadge(selectedOrder.payment_status)}
                  <br />
                  <strong>Total Amount:</strong> ₹
                  {formatCurrency(selectedOrder.total_amount)}
                  <br />
                  <strong>Notes:</strong> {selectedOrder.notes || "N/A"}
                </Col>
              </Row>

              <h6 className="mt-3">Order Items</h6>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product_name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">
                        ₹{formatCurrency(item.unit_price)}
                      </td>
                      <td className="text-end">
                        ₹{formatCurrency(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setShowViewModal(false);
              handleEdit(selectedOrder?.id);
            }}
          >
            Edit Order
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders;