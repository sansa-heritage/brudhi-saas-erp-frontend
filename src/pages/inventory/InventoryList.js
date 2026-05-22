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
  FaBoxes,
  FaFilter,
  FaTimes,
  FaHome,
  FaRupeeSign,
  FaPercent,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  getStockAlerts,
} from "../../api/tenant/inventory.api";
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

const InventoryList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
      } else if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        productsData = response.data.data.data;
      }

      const formattedProducts = productsData.map((product) => ({
        id: product.id,
        product_code: product.product_code,
        product_name: product.product_name || product.name,
        category: product.category,
        hsn_code: product.hsn_code,
        unit: product.unit,
        unit_price: product.unit_price || product.selling_price,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        gst_rate: product.gst_rate,
        current_stock: product.current_stock,
        min_stock_level: product.min_stock_level,
        max_stock_level: product.max_stock_level,
        reorder_level: product.reorder_level,
        opening_stock: product.opening_stock,
        location: product.location,
        brand_id: product.brand_id,
        brand_name: product.brand_name,
        status: product.status,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Failed to load products:", error);
      setErrorMessage(error.response?.data?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStockAlerts = async () => {
    try {
      const response = await getStockAlerts();
      console.log("Stock alerts response:", response);
      
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
    setSelectedProduct(product);
    setShowViewModal(true);
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
        showDeleteSuccessToast(`Product "${name}" deleted successfully`);
        await loadProducts();
        await loadStockAlerts();
      } catch (error) {
        console.error("Delete error:", error);
        showDeleteErrorToast(error.response?.data?.message || "Failed to delete product");
      }
    }
  };

  const getStockStatusBadge = (currentStock, minStockLevel) => {
    if (currentStock <= 0) {
      return (
        <Badge 
          bg="danger"
          style={{ padding: "6px 12px", borderRadius: "20px", fontWeight: "500" }}
        >
          Out of Stock
        </Badge>
      );
    } else if (currentStock <= minStockLevel) {
      return (
        <Badge 
          bg="warning"
          style={{ padding: "6px 12px", borderRadius: "20px", fontWeight: "500" }}
        >
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge 
          bg="secondary"
          style={{ padding: "6px 12px", borderRadius: "20px", fontWeight: "500", backgroundColor: "#6c757d" }}
        >
          In Stock
        </Badge>
      );
    }
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
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    let matchesStockStatus = true;
    if (stockStatusFilter === "low") {
      matchesStockStatus = product.current_stock > 0 && product.current_stock <= product.min_stock_level;
    } else if (stockStatusFilter === "out") {
      matchesStockStatus = product.current_stock <= 0;
    } else if (stockStatusFilter === "in") {
      matchesStockStatus = product.current_stock > product.min_stock_level;
    }

    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];

  const stats = {
    total: products.length,
    totalValue: products.reduce((sum, p) => sum + ((p.current_stock || 0) * (p.selling_price || 0)), 0),
    lowStock: products.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock_level).length,
    outOfStock: products.filter(p => p.current_stock <= 0).length,
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
    if (stockStatusFilter !== "all") filters.push(`Status: ${stockStatusFilter === "low" ? "Low Stock" : stockStatusFilter === "out" ? "Out of Stock" : "In Stock"}`);
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters;
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h4 className="mt-3">Loading inventory...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none d-flex align-items-center"
          onClick={handleGoBack}
          style={{ color: "#6c757d" }}
        >
          <FaSignOutAlt className="me-1" /> Back to Dashboard
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/dashboard")}
        >
          <FaHome className="me-1" /> Dashboard
        </Button>
      </div>

      {/* Success Message */}
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

      {/* Error Message */}
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
          <h2 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
            {/* Inventory Management */}
          </h2>
        </div>
        <Button
          variant="secondary"
          onClick={handleAdd}
          style={{ backgroundColor: "#6c757d", border: "none", borderRadius: "8px" }}
        >
          <FaPlus className="me-2" /> Add Product
        </Button>
      </div>

      {/* Inventory Section Title */}
      <div className="mb-3">
        <h3 className="fw-bold mb-0">Inventory Management</h3>
        <p className="text-muted mb-0">Manage all products, track stock levels, and monitor inventory</p>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0" style={{ borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>Total Products</small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>{stats.total}</h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>Total: {stats.total}</small>
                </div>
                <div style={{ backgroundColor: "#e3f2fd", padding: "8px", borderRadius: "10px" }}>
                  <FaBoxes size={18} style={{ color: "#4361ee" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0" style={{ borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>Stock Value</small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>₹{formatCurrency(stats.totalValue)}</h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>Inventory value</small>
                </div>
                <div style={{ backgroundColor: "#e8f5e9", padding: "8px", borderRadius: "10px" }}>
                  <FaRupeeSign size={18} style={{ color: "#2e7d32" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0" style={{ borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>Low Stock</small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>{stats.lowStock}</h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>Needs restock</small>
                </div>
                <div style={{ backgroundColor: "#fff3e0", padding: "8px", borderRadius: "10px" }}>
                  <FaExclamationTriangle size={18} style={{ color: "#ff9800" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0" style={{ borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
            <Card.Body className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted mb-0" style={{ fontSize: "11px" }}>Out of Stock</small>
                  <h5 className="mb-0 fw-bold" style={{ fontSize: "20px" }}>{stats.outOfStock}</h5>
                  <small className="text-muted" style={{ fontSize: "9px" }}>Unavailable</small>
                </div>
                <div style={{ backgroundColor: "#e8f5e9", padding: "8px", borderRadius: "10px" }}>
                  <FaTimes size={18} style={{ color: "#2e7d32" }} />
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
            <strong>Stock Alerts:</strong> {stockAlerts.length} product(s) are running low on stock.
            Please review and restock soon.
          </div>
        </Alert>
      )}

      {/* Search and Filter Section */}
      <Card className="border-0 mb-4" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <Card.Body className="py-3">
          <Row>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: "#fff", borderRight: "none" }}>
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
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
                  <option key={cat} value={cat}>{cat}</option>
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
                title="Clear all filters"
              >
                <FaFilter />
              </Button>
            </Col>
          </Row>

          {/* Active Filters Display */}
          {getFilterText().length > 0 && (
            <div className="mt-3 pt-2 border-top">
              <small className="text-muted me-2">Active filters:</small>
              {getFilterText().map((filter, index) => (
                <Badge
                  key={index}
                  bg="secondary"
                  className="me-2 px-3 py-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (filter.includes("Category")) setCategoryFilter("all");
                    if (filter.includes("Status")) setStockStatusFilter("all");
                    if (filter.includes("Search")) setSearchTerm("");
                  }}
                >
                  {filter} <FaTimes size={10} className="ms-2" />
                </Badge>
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
        {filteredProducts.length === 0 && (
          <Button variant="link" onClick={clearFilters} className="p-0">
            Clear all filters
          </Button>
        )}
      </div>

      {/* Products Table */}
      <Card className="border-0" style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ fontSize: "14px" }}>
              <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <tr>
                  <th style={{ padding: "16px 12px" }}>Product Code</th>
                  <th style={{ padding: "16px 12px" }}>Product Name</th>
                  <th style={{ padding: "16px 12px" }}>Category</th>
                  <th style={{ padding: "16px 12px" }}>HSN Code</th>
                  <th style={{ padding: "16px 12px" }}>Selling Price</th>
                  <th style={{ padding: "16px 12px" }}>Current Stock</th>
                  <th style={{ padding: "16px 12px" }}>Stock Status</th>
                  <th style={{ padding: "16px 12px" }}>GST%</th>
                  <th style={{ padding: "16px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold text-primary">{product.product_code}</div>
                      <small className="text-muted">ID: {product.id}</small>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div className="fw-semibold">{product.product_name}</div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <Badge 
                        bg="secondary"
                        style={{ padding: "6px 12px", borderRadius: "20px", fontWeight: "500", backgroundColor: "#6c757d" }}
                      >
                        {product.category || "N/A"}
                      </Badge>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <code className="small" style={{ color: "#6c757d" }}>{product.hsn_code || "-"}</code>
                    </td>
                    <td className="fw-semibold" style={{ padding: "16px 12px" }}>
                      ₹{formatCurrency(product.selling_price)}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span className={product.current_stock <= product.min_stock_level ? "text-danger fw-semibold" : "fw-semibold"} style={{ color: product.current_stock <= product.min_stock_level ? "#dc3545" : "#6c757d" }}>
                        {product.current_stock || 0} {product.unit || "NOS"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      {getStockStatusBadge(product.current_stock, product.min_stock_level)}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <Badge 
                        bg="secondary"
                        style={{ padding: "6px 12px", borderRadius: "20px", fontWeight: "500", backgroundColor: "#6c757d" }}
                      >
                        {product.gst_rate || 18}%
                      </Badge>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <Button
                        variant="link"
                        size="sm"
                        className="me-2"
                        onClick={() => handleView(product)}
                        title="View Details"
                        style={{ color: "#4361ee", textDecoration: "none" }}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(product.id)}
                        title="Edit"
                        style={{ color: "#ff9800", textDecoration: "none" }}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleDelete(product.id, product.product_name)}
                        title="Delete"
                        style={{ color: "#dc3545", textDecoration: "none" }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="py-4">
                        <FaSearch size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No products found</h5>
                        <p className="text-muted small">
                          Try adjusting your search or filter criteria
                        </p>
                        <Button
                          variant="primary"
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

      {/* View Product Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <FaEye className="me-2 text-secondary" /> Product Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedProduct && (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Product Code</small>
                  <p className="fw-semibold text-primary mb-0">{selectedProduct.product_code}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Product Name</small>
                  <p className="fw-semibold mb-0">{selectedProduct.product_name}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Category</small>
                  <p className="mb-0">{selectedProduct.category || "N/A"}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">HSN Code</small>
                  <p className="mb-0"><code style={{ color: "#6c757d" }}>{selectedProduct.hsn_code || "N/A"}</code></p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Unit</small>
                  <p className="mb-0">{selectedProduct.unit || "NOS"}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-muted">Location</small>
                  <p className="mb-0">{selectedProduct.location || "N/A"}</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Purchase Price</small>
                  <p className="text-danger fw-semibold mb-0">₹{formatCurrency(selectedProduct.purchase_price)}</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Selling Price</small>
                  <p className="text-success fw-semibold mb-0">₹{formatCurrency(selectedProduct.selling_price)}</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">GST Rate</small>
                  <p className="mb-0">{selectedProduct.gst_rate || 18}%</p>
                </div>
              </Col>
              <Col md={12}>
                <hr />
                <h6 className="text-bold mb-3">Stock Information</h6>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Opening Stock</small>
                  <p className="mb-0">{selectedProduct.opening_stock || 0}</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Current Stock</small>
                  <p className={selectedProduct.current_stock <= selectedProduct.min_stock_level ? "text-danger fw-semibold mb-0" : "fw-semibold mb-0"} style={{ color: selectedProduct.current_stock <= selectedProduct.min_stock_level ? "#dc3545" : "#6c757d" }}>
                    {selectedProduct.current_stock || 0}
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Stock Status</small>
                  <div>{getStockStatusBadge(selectedProduct.current_stock, selectedProduct.min_stock_level)}</div>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Min Stock Level</small>
                  <p className="mb-0">{selectedProduct.min_stock_level || 0}</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Max Stock Level</small>
                  <p className="mb-0">{selectedProduct.max_stock_level || 0}</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <small className="text-muted">Reorder Level</small>
                  <p className="mb-0">{selectedProduct.reorder_level || 0}</p>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button 
            variant="secondary" 
            onClick={() => setShowViewModal(false)}
            style={{ backgroundColor: "#6c757d", border: "none" }}
          >
            Close
          </Button>
          {selectedProduct && (
            <Button
              variant="primary"
              onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedProduct.id);
              }}
              style={{ backgroundColor: "#6c757d", border: "none" }}
            >
              <FaEdit className="me-2" /> Edit Product
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InventoryList;