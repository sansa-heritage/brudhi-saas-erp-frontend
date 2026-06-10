import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Tab,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaBox,
  FaBarcode,
  FaRupeeSign,
  FaPercent,
  FaTag,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaMapMarkerAlt,
  FaBuilding,
  FaChartLine,
  FaWarehouse,
  FaBalanceScale,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaFileInvoice,
  FaCreditCard,
  FaChartBar,
} from "react-icons/fa";
import { getProductById, deleteProduct } from "../../api/tenant/inventory.api";
import Swal from "sweetalert2";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Stock status color mapping (matching AddInventory colors)
const stockStatusConfig = {
  inStock: { bg: "#ECFDF3", color: "#027A48", label: "In Stock" },
  lowStock: { bg: "#FEF6D7", color: "#FED229", label: "Low Stock" },
  outOfStock: { bg: "#FFDCE2", color: "#F94765", label: "Out of Stock" },
};

// Category color mapping (matching AddInventory colors)
const categoryConfig = {
  "LPG Cylinder": { bg: "#D3EAFF", color: "#1e293b", label: "LPG Cylinder" },
  "Gas Stove": { bg: "#FFE0CB", color: "#FF8532", label: "Gas Stove" },
  Regulator: { bg: "#ECFDF3", color: "#027A48", label: "Regulator" },
  Pipe: { bg: "#FEF6D7", color: "#FED229", label: "Pipe" },
  Accessories: { bg: "#FFDCE2", color: "#F94765", label: "Accessories" },
  Other: { bg: "#F3F4F6", color: "#1e293b", label: "Other" },
  default: { bg: "#F3F4F6", color: "#1e293b", label: "Other" },
};

// Status color mapping
const statusConfig = {
  active: { bg: "#ECFDF3", color: "#027A48", label: "Active" },
  inactive: { bg: "#FFDCE2", color: "#F94765", label: "Inactive" },
};

const ViewInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProductById(id);
        console.log("Product response:", response);

        let productData = null;
        if (response?.data?.data) productData = response.data.data;
        else if (response?.data) productData = response.data;
        else productData = response;

        if (!productData) {
          setError("Product not found");
          setLoading(false);
          return;
        }

        setProduct(productData);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setError(
          error.response?.data?.message || "Failed to load product details",
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const getStockStatus = (currentStock, minStockLevel) => {
    if (currentStock <= 0) {
      return "outOfStock";
    } else if (currentStock <= minStockLevel) {
      return "lowStock";
    } else {
      return "inStock";
    }
  };

  const getStockStatusBadge = (currentStock, minStockLevel) => {
    const status = getStockStatus(currentStock, minStockLevel);
    const config = stockStatusConfig[status];
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const config = categoryConfig[category] || categoryConfig.default;
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.active;
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "6px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {config.label}
      </span>
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
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate margin and GST
  const purchasePrice = parseFloat(product?.purchase_price) || 0;
  const sellingPrice = parseFloat(product?.selling_price) || 0;
  const margin = sellingPrice - purchasePrice;
  const marginPercent =
    purchasePrice > 0 ? ((margin / purchasePrice) * 100).toFixed(2) : 0;
  const gstRate = parseFloat(product?.gst_rate) || 0;
  const gstAmount = (sellingPrice * gstRate) / 100;
  const finalPrice = sellingPrice + gstAmount;
  const stockValue = (product?.current_stock || 0) * sellingPrice;

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
          <h5 className="mt-3 text-muted">Loading product details...</h5>
        </div>
      </Container>
    );
  }

  if (error || !product) {
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
          <h4>Product not found</h4>
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <Button variant="secondary" onClick={() => navigate("/inventory")}>
            Back to Inventory
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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          {/* <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            {product.product_name}
          </h2>
          <p className="text-muted mb-0">Code: {product.product_code}</p> */}
        </div>
        <div className="d-flex gap-2">
          <Button
            onClick={() => navigate(`/inventory/edit/${product.id}`)}
            style={{
              backgroundColor: "rgb(30, 58, 111)",
              border: "none",
              borderRadius: "30px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaEdit size={14} /> Edit
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3 px-4">
          <Tabs
            defaultActiveKey="overview"
            className="border-0 gap-2"
            style={{ borderBottom: "2px solid #e9ecef" }}
          >
            <Tab
              eventKey="overview"
              title={
                <span className="fw-semibold">
                  <FaBox className="me-2" /> Overview
                </span>
              }
              tabClassName="border-0"
            >
              <div className="p-3">
                {/* Basic Information Section */}
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaTag className="me-2" /> Basic Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Product Code
                      </small>
                      <strong>
                        <FaBarcode className="me-1" size={12} />
                        {product.product_code}
                      </strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Category
                      </small>
                      {getCategoryBadge(product.category)}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Unit of Measurement
                      </small>
                      <strong>
                        <FaBalanceScale className="me-1" size={12} />
                        {product.unit || "NOS"}
                      </strong>
                    </div>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        HSN Code
                      </small>
                      <strong>{product.hsn_code || "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Brand
                      </small>
                      <strong>
                        <FaBuilding className="me-1" size={12} />
                        {product.brand_name || product.brand?.name || "N/A"}
                      </strong>
                    </div>
                  </Col>
                  {/* <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Status
                      </small>
                      {getStatusBadge(product.status)}
                    </div>
                  </Col> */}
                </Row>

                {/* Financial Information Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaMoneyBillWave className="me-2" /> Financial Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Purchase Price
                      </small>
                      <strong>{formatCurrency(product.purchase_price)}</strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Selling Price
                      </small>
                      <strong className="text-success">
                        {formatCurrency(product.selling_price)}
                      </strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Margin
                      </small>
                      <strong
                        className={margin >= 0 ? "text-success" : "text-danger"}
                      >
                        {formatCurrency(margin)} ({marginPercent}%)
                      </strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        GST Rate
                      </small>
                      <strong>
                        <FaPercent className="me-1" size={12} />
                        {product.gst_rate || 18}%
                      </strong>
                    </div>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        GST Amount
                      </small>
                      <strong>{formatCurrency(gstAmount)}</strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Final Price (incl. GST)
                      </small>
                      <strong className="text-primary">
                        {formatCurrency(finalPrice)}
                      </strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Stock Value
                      </small>
                      <strong>{formatCurrency(stockValue)}</strong>
                    </div>
                  </Col>
                </Row>

                {/* Stock Information Section */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaWarehouse className="me-2" /> Stock Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Current Stock
                      </small>
                      <strong
                        className={
                          (product.current_stock || 0) <=
                          (product.min_stock_level || 0)
                            ? "text-danger"
                            : ""
                        }
                      >
                        {product.current_stock || 0} {product.unit || "NOS"}
                      </strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Stock Status
                      </small>
                      {getStockStatusBadge(
                        product.current_stock,
                        product.min_stock_level,
                      )}
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Minimum Stock Level
                      </small>
                      <strong>
                        {product.min_stock_level || 0} {product.unit || "NOS"}
                      </strong>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Maximum Stock Level
                      </small>
                      <strong>
                        {product.max_stock_level || 0} {product.unit || "NOS"}
                      </strong>
                    </div>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Reorder Level
                      </small>
                      <strong>
                        {product.reorder_level || 0} {product.unit || "NOS"}
                      </strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Opening Stock
                      </small>
                      <strong>
                        {product.opening_stock || 0} {product.unit || "NOS"}
                      </strong>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Location
                      </small>
                      <strong>
                        <FaMapMarkerAlt className="me-1" size={12} />
                        {product.location || "Not specified"}
                      </strong>
                    </div>
                  </Col>
                </Row>

                {/* System Information */}
                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaInfoCircle className="me-2" /> System Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={6}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Created By
                      </small>
                      <strong>
                        <FaUser className="me-1" size={12} />
                        {product.created_by?.name || "Admin"}
                      </strong>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Created On
                      </small>
                      <strong>
                        <FaClock className="me-1" size={12} />
                        {formatDate(product.created_at)}
                      </strong>
                    </div>
                  </Col>
                </Row>

                {/* Stock Alert Warning */}
                {product.current_stock <= product.min_stock_level &&
                  product.current_stock > 0 && (
                    <Alert variant="warning" className="mt-4 rounded-3">
                      <FaExclamationTriangle className="me-2" />
                      <small>
                        <strong>Low Stock Alert:</strong> Current stock (
                        {product.current_stock} {product.unit}) is at or below
                        minimum level ({product.min_stock_level} {product.unit}
                        ). Please restock soon.
                      </small>
                    </Alert>
                  )}

                {product.current_stock <= 0 && (
                  <Alert variant="danger" className="mt-4 rounded-3">
                    <FaExclamationTriangle className="me-2" />
                    <small>
                      <strong>Out of Stock:</strong> This product is currently
                      out of stock. Please restock immediately.
                    </small>
                  </Alert>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Header>
      </Card>

      <style>{`
        .nav-tabs {
          border-bottom: none !important;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 10px 16px;
          font-size: 14px;
          transition: all 0.2s;
          border-radius: 30px;
          margin-right: 8px;
        }
        .nav-tabs .nav-link:hover {
          color: rgb(30, 58, 111);
          background: #f1f5f9;
        }
        .nav-tabs .nav-link.active {
          color: rgb(30, 58, 111);
          background: #eef2ff;
          border: none;
        }
        .rounded-3 {
          border-radius: 12px !important;
        }
      `}</style>
    </Container>
  );
};

export default ViewInventory;