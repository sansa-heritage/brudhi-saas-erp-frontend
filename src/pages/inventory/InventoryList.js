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
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaBoxes,
  FaFilter,
  FaTimes,
  FaRupeeSign,
  FaPercent,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  getStockAlerts,
} from "../../api/tenant/inventory.api";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Stock status color mapping
const stockStatusConfig = {
  inStock: { bg: "#ECFDF3", color: "#027A48", label: "In Stock" },
  lowStock: { bg: "#FEF6D7", color: "#FED229", label: "Low Stock" },
  outOfStock: { bg: "#FFDCE2", color: "#F94765", label: "Out of Stock" },
};

// Category color mapping
// const categoryConfig = {
//   default: { bg: "#F3F4F6", color: "#1e293b", label: "Other" },
// };

const categoryConfig = {
  "LPG Cylinder": { bg: "#D3EAFF", color: "#1e293b", label: "LPG Cylinder" },
  "Gas Stove": { bg: "#FFE0CB", color: "#FF8532", label: "Gas Stove" },
  Regulator: { bg: "#ECFDF3", color: "#027A48", label: "Regulator" },
  Pipe: { bg: "#FEF6D7", color: "#FED229", label: "Pipe" },
  Accessories: { bg: "#FFDCE2", color: "#F94765", label: "Accessories" },
  Other: { bg: "#F3F4F6", color: "#1e293b", label: "Other" },
  default: { bg: "#F3F4F6", color: "#1e293b", label: "Other" },
};

const InventoryList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [stockAlerts, setStockAlerts] = useState([]);

  useEffect(() => {
    loadProducts();
    loadStockAlerts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getProducts();
      console.log("Products response:", response);

      let productsData = [];

      if (response?.data?.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      } else if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        productsData = response.data.data.data;
      }

      const formattedProducts = productsData.map((product) => ({
        id: product.id,
        // product_code: product.product_code,
        product_name: product.product_name || product.name,
        category: product.category,
        selling_price: product.selling_price,
        current_stock: product.current_stock,
        min_stock_level: product.min_stock_level,
        gst_rate: product.gst_rate,
        unit: product.unit,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Failed to load products:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to load products",
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStockAlerts = async () => {
    try {
      const response = await getStockAlerts();
      let alertsData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        alertsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        alertsData = response.data;
      } else if (Array.isArray(response)) {
        alertsData = response;
      }
      setStockAlerts(alertsData);
    } catch (error) {
      console.error("Failed to load stock alerts:", error);
    }
  };

  const handleView = (product) => {
    navigate(`/inventory/view/${product.id}`);
  };

  const handleEdit = (id) => {
    navigate(`/inventory/edit/${id}`);
  };

  const handleAdd = () => {
    navigate("/inventory/add");
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete product "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6c757d",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);
        toast.success(`✓ Product "${name}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
        await loadProducts();
        await loadStockAlerts();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(`✗ ${error.response?.data?.message || "Failed to delete product"}`, {
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

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStockStatusFilter("all");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    const stockStatus = getStockStatus(product.current_stock, product.min_stock_level);
    let matchesStockStatus = true;
    if (stockStatusFilter === "low") {
      matchesStockStatus = stockStatus === "lowStock";
    } else if (stockStatusFilter === "out") {
      matchesStockStatus = stockStatus === "outOfStock";
    } else if (stockStatusFilter === "in") {
      matchesStockStatus = stockStatus === "inStock";
    }

    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  const stats = {
    total: products.length,
    totalValue: products.reduce(
      (sum, p) => sum + (p.current_stock || 0) * (p.selling_price || 0),
      0,
    ),
    lowStock: products.filter(
      (p) => p.current_stock > 0 && p.current_stock <= p.min_stock_level,
    ).length,
    outOfStock: products.filter((p) => p.current_stock <= 0).length,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getFilterText = () => {
    const filters = [];
    if (categoryFilter !== "all") filters.push(`Category: ${categoryFilter}`);
    if (stockStatusFilter !== "all")
      filters.push(
        `Status: ${stockStatusFilter === "low" ? "Low Stock" : stockStatusFilter === "out" ? "Out of Stock" : "In Stock"}`,
      );
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters;
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
          <h4 className="mt-3">Loading products...</h4>
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

      {successMessage && (
        <Alert
          variant="success"
          className="mb-3"
          onClose={() => setSuccessMessage("")}
          dismissible
        >
          {successMessage}
        </Alert>
      )}

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
            Inventory Management
          </h2>
          <p className="text-muted mb-0">Manage all products and track stock levels</p> */}
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
          Add Product
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
                    Total Products
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.total}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Active products
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFDCE2",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaBoxes size={18} style={{ color: "#F94765" }} />
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
                    Stock Value
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    ₹{formatCurrency(stats.totalValue)}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Inventory value
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#FEF6D7",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaRupeeSign size={18} style={{ color: "#FED229" }} />
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
                    Low Stock
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.lowStock}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Needs restock
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFE0CB",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaExclamationTriangle size={18} style={{ color: "#FF8532" }} />
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
                    Out of Stock
                  </small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>
                    {stats.outOfStock}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>
                    Unavailable
                  </small>
                </div>
                <div
                  style={{
                    backgroundColor: "#D3EAFF",
                    padding: "8px",
                    borderRadius: "10px",
                  }}
                >
                  <FaTimes size={18} style={{ color: "#437EF7" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stock Alerts Banner */}
      {stockAlerts.length > 0 && (
        <Alert variant="warning" className="mb-4 rounded-3">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle size={20} className="me-2" />
            <strong>Stock Alerts:</strong> {stockAlerts.length} product(s) are
            running low on stock. Please review and restock soon.
          </div>
        </Alert>
      )}

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
                  placeholder="Search by code, name or category..."
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories ({stats.total})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({products.filter(p => p.category === cat).length})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
              >
                <option value="all">All Stock Status ({stats.total})</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock ({stats.lowStock})</option>
                <option value="out">Out of Stock ({stats.outOfStock})</option>
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

          {getFilterText().length > 0 && (
            <div className="mt-3 pt-2 border-top">
              <small className="text-muted me-2">Active filters:</small>
              {getFilterText().map((filter, index) => (
                <span
                  key={index}
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
                  onClick={() => {
                    if (filter.includes("Category")) setCategoryFilter("all");
                    if (filter.includes("Status")) setStockStatusFilter("all");
                    if (filter.includes("Search")) setSearchTerm("");
                  }}
                >
                  {filter} <FaTimes size={10} className="ms-2" />
                </span>
              ))}
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
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Table - Simplified */}
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
                  <th style={{ padding: "16px 12px" }}>Product Details</th>
                  <th style={{ padding: "16px 12px" }}>Category</th>
                  <th style={{ padding: "16px 12px" }}>Price</th>
                  <th style={{ padding: "16px 12px" }}>Stock</th>
                  <th style={{ padding: "16px 12px" }}>Status</th>
                  <th style={{ padding: "16px 12px" }}>GST</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    style={{ borderBottom: "1px solid #e9ecef" }}
                  >
                    {/* Product Details */}
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold">{product.product_name}</div>
                      {/* <small className="text-muted">Code: {product.product_code}</small> */}
                    </td>

                    {/* Category */}
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontWeight: "600",
                          fontSize: "13px",
                          backgroundColor: categoryConfig[product.category]?.bg || categoryConfig.default.bg,
                          color: categoryConfig[product.category]?.color || categoryConfig.default.color,
                          border: "none",
                          display: "inline-block",
                        }}
                      >
                        {product.category || "N/A"}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: "16px 12px" }}>
                      <span className="fw-semibold">
                        ₹{formatCurrency(product.selling_price)}
                      </span>
                    </td>

                    {/* Stock */}
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        className="fw-semibold"
                        style={{
                          color: product.current_stock <= product.min_stock_level
                            ? "#F94765"
                            : "#1e293b",
                        }}
                      >
                        {product.current_stock || 0} {product.unit || "NOS"}
                      </span>
                    </td>

                    {/* Stock Status */}
                    <td style={{ padding: "16px 12px" }}>
                      {getStockStatusBadge(product.current_stock, product.min_stock_level)}
                    </td>

                    {/* GST */}
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontWeight: "600",
                          fontSize: "13px",
                          backgroundColor: "#F3F4F6",
                          color: "#1e293b",
                          display: "inline-block",
                        }}
                      >
                        {product.gst_rate || 18}%
                      </span>
                    </td>

                    {/* Actions Dropdown */}
                    <td style={{ padding: "16px 12px" }}>
                      <div className="action-dropdown">
                        <button
                          className="action-trigger"
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === product.id ? null : product.id,
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

                        {activeDropdown === product.id && (
                          <div className="dropdown-menu-custom">
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleView(product);
                              }}
                              className="dropdown-item-custom"
                              title="View Details"
                            >
                              <FaEye style={{ color: "#4361ee", fontSize: "14px" }} />
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleEdit(product.id);
                              }}
                              className="dropdown-item-custom"
                              title="Edit"
                            >
                              <FaEdit style={{ color: "#ff9800", fontSize: "14px" }} />
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                handleDelete(product.id, product.product_name);
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
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No products found</h5>
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
    </Container>
  );
};

export default InventoryList;