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
  Modal,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBoxes,
  FaBarcode,
  FaCalendarAlt,
  FaMapMarker,
  FaEye,
  FaArrowLeft,
  FaHome,
  FaTimes,
  FaFilter,
  FaSync,
} from "react-icons/fa";
import {
  getCylinderStock,
  getCylinderTypes,
  addCylinder,
  updateCylinder,
  deleteCylinder,
} from "../../components/services/cylinderService";
import Swal from "sweetalert2";

const CylinderStock = () => {
  const [stock, setStock] = useState([]);
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCylinder, setSelectedCylinder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [formData, setFormData] = useState({
    cylinder_type_id: "",
    brand_id: "",
    total_stock: "",
    available_stock: "",
    damaged_stock: "",
    returned_stock: "",
    reserved_stock: "",
    min_stock_level: "",
    max_stock_level: "",
    reorder_level: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      // Fetch cylinder stock
      const stockResponse = await getCylinderStock();
      console.log("Stock API Response:", stockResponse);
      
      let stockData = [];
      // Handle different response structures
      if (stockResponse?.data && Array.isArray(stockResponse.data)) {
        stockData = stockResponse.data;
      } else if (stockResponse?.data?.data && Array.isArray(stockResponse.data.data)) {
        stockData = stockResponse.data.data;
      } else if (Array.isArray(stockResponse)) {
        stockData = stockResponse;
      } else {
        stockData = [];
      }
      
      // Fetch cylinder types for dropdown
      const typesResponse = await getCylinderTypes();
      console.log("Types API Response:", typesResponse);
      
      let typesData = [];
      if (typesResponse?.data && Array.isArray(typesResponse.data)) {
        typesData = typesResponse.data;
      } else if (typesResponse?.data?.data && Array.isArray(typesResponse.data.data)) {
        typesData = typesResponse.data.data;
      } else if (Array.isArray(typesResponse)) {
        typesData = typesResponse;
      } else {
        typesData = [];
      }
      
      // Map stock data to match your database schema
      const mappedStock = stockData.map(item => ({
        id: item.id,
        cylinder_type_id: item.cylinder_type_id,
        cylinder_type_name: item.cylinder_type?.name || getTypeNameFromList(item.cylinder_type_id, typesData),
        brand_id: item.brand_id,
        total_stock: item.total_stock || 0,
        available_stock: item.available_stock || 0,
        damaged_stock: item.damaged_stock || 0,
        returned_stock: item.returned_stock || 0,
        reserved_stock: item.reserved_stock || 0,
        min_stock_level: item.min_stock_level || 10,
        max_stock_level: item.max_stock_level || 100,
        reorder_level: item.reorder_level || 20,
        status: item.total_stock > item.min_stock_level ? "in_stock" : "low_stock",
        location: item.location || "Warehouse",
        last_updated_by: item.last_updated_by,
        updated_at: item.updated_at,
        created_at: item.created_at,
      }));
      
      // Map types data
      const mappedTypes = typesData.map(type => ({
        id: type.id,
        name: type.name,
        weight: type.weight,
        type: type.type,
        price: type.price,
        gst_percent: type.gst_percent,
      }));
      
      console.log("Mapped stock:", mappedStock);
      console.log("Mapped types:", mappedTypes);
      
      setStock(mappedStock);
      setTypes(mappedTypes);
      
      if (mappedStock.length === 0) {
        setErrorMessage("No cylinder stock found. Click 'Add Stock' to create one.");
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to load cylinder stock";
      setErrorMessage(errorMsg);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeNameFromList = (typeId, typesList) => {
    const type = typesList.find(t => t.id === typeId);
    return type ? type.name : "Unknown";
  };

  const getTypeName = (typeId) => {
    const type = types.find((t) => t.id === typeId);
    return type ? type.name : "Unknown";
  };

  const getStockStatus = (totalStock, minLevel) => {
    if (totalStock <= 0) return { bg: "danger", text: "Out of Stock" };
    if (totalStock <= minLevel) return { bg: "warning", text: "Low Stock" };
    return { bg: "success", text: "In Stock" };
  };

  const handleSave = async () => {
    // Validate form
    if (!formData.cylinder_type_id) {
      Swal.fire({ icon: "warning", title: "Validation Error", text: "Cylinder type is required" });
      return;
    }
    if (!formData.total_stock && formData.total_stock !== 0) {
      Swal.fire({ icon: "warning", title: "Validation Error", text: "Total stock is required" });
      return;
    }

    setSubmitting(true);
    
    try {
      const stockData = {
        cylinder_type_id: parseInt(formData.cylinder_type_id),
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        total_stock: parseInt(formData.total_stock) || 0,
        available_stock: parseInt(formData.available_stock) || 0,
        damaged_stock: parseInt(formData.damaged_stock) || 0,
        returned_stock: parseInt(formData.returned_stock) || 0,
        reserved_stock: parseInt(formData.reserved_stock) || 0,
        min_stock_level: parseInt(formData.min_stock_level) || 10,
        max_stock_level: parseInt(formData.max_stock_level) || 100,
        reorder_level: parseInt(formData.reorder_level) || 20,
        notes: formData.notes || null,
      };

      console.log("Saving stock data:", stockData);

      if (selectedCylinder) {
        await updateCylinder(selectedCylinder.id, stockData);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Stock updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await addCylinder(stockData);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Stock added successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      
      await loadData();
      setShowModal(false);
      setSelectedCylinder(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save stock:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to save stock",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedCylinder(item);
    setFormData({
      cylinder_type_id: item.cylinder_type_id || "",
      brand_id: item.brand_id || "",
      total_stock: item.total_stock || "",
      available_stock: item.available_stock || "",
      damaged_stock: item.damaged_stock || "",
      returned_stock: item.returned_stock || "",
      reserved_stock: item.reserved_stock || "",
      min_stock_level: item.min_stock_level || "",
      max_stock_level: item.max_stock_level || "",
      reorder_level: item.reorder_level || "",
      notes: item.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCylinder(id);
      await loadData();
      setShowDeleteConfirm(null);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Stock record deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to delete stock:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to delete stock",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      cylinder_type_id: "",
      brand_id: "",
      total_stock: "",
      available_stock: "",
      damaged_stock: "",
      returned_stock: "",
      reserved_stock: "",
      min_stock_level: "",
      max_stock_level: "",
      reorder_level: "",
      notes: "",
    });
  };

  const filteredStock = Array.isArray(stock) ? stock.filter((item) => {
    const matchesSearch = searchTerm === "" || 
      (item.cylinder_type_name && item.cylinder_type_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || item.cylinder_type_id === parseInt(typeFilter);
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "in_stock" && item.total_stock > item.min_stock_level) ||
      (statusFilter === "low_stock" && item.total_stock <= item.min_stock_level && item.total_stock > 0) ||
      (statusFilter === "out_stock" && item.total_stock === 0);
    return matchesSearch && matchesType && matchesStatus;
  }) : [];

  const stats = {
    total: Array.isArray(stock) ? stock.length : 0,
    totalQuantity: Array.isArray(stock) ? stock.reduce((sum, s) => sum + (s.total_stock || 0), 0) : 0,
    availableQuantity: Array.isArray(stock) ? stock.reduce((sum, s) => sum + (s.available_stock || 0), 0) : 0,
    damagedQuantity: Array.isArray(stock) ? stock.reduce((sum, s) => sum + (s.damaged_stock || 0), 0) : 0,
    lowStockCount: Array.isArray(stock) ? stock.filter(s => s.total_stock <= s.min_stock_level && s.total_stock > 0).length : 0,
  };

  const handleGoBack = () => {
    navigate("/products");
  };

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">Loading cylinder stock...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center text-primary"
          onClick={handleGoBack}
        >
          <FaArrowLeft className="me-2" /> Back to Products
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/products")}
        >
          <FaHome className="me-1" /> Products
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="mb-3" onClose={() => setSuccessMessage("")} dismissible>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="danger" className="mb-3" onClose={() => setErrorMessage("")} dismissible>
          {errorMessage}
        </Alert>
      )}

      {/* Header */}
      <div className="bg-gradient-success text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaBoxes className="me-2" /> Cylinder Stock
            </h2>
            <p className="mb-0 opacity-75">
              Track cylinder stock levels, manage inventory and alerts
            </p>
          </div>
          <Button
            variant="light"
            onClick={() => {
              setSelectedCylinder(null);
              resetForm();
              setShowModal(true);
            }}
            className="rounded-pill px-4"
          >
            <FaPlus className="me-2" /> Add Stock
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Stock Records</small>
                  <h4 className="text-primary mb-0 fw-bold">{stats.total}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <FaBoxes className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Quantity</small>
                  <h4 className="text-success mb-0 fw-bold">{stats.totalQuantity}</h4>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FaBoxes className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Available Stock</small>
                  <h4 className="text-info mb-0 fw-bold">{stats.availableQuantity}</h4>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <FaEye className="text-info" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Low Stock Alerts</small>
                  <h4 className="text-warning mb-0 fw-bold">{stats.lowStockCount}</h4>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <FaSync className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by cylinder type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-2"
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-2"
              >
                <option value="all">All Cylinder Types</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_stock">Out of Stock</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="w-100 rounded-pill"
              >
                <FaFilter className="me-1" /> Clear
              </Button>
            </Col>
          </Row>
          <div className="mt-3 pt-2 border-top">
            <small className="text-muted">
              Showing {filteredStock.length} of {stock.length} stock records
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* Stock Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Cylinder Type</th>
                  <th>Total Stock</th>
                  <th>Available</th>
                  <th>Damaged</th>
                  <th>Returned</th>
                  <th>Reserved</th>
                  <th>Min Level</th>
                  <th>Max Level</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.length > 0 ? (
                  filteredStock.map((item) => {
                    const stockStatus = getStockStatus(item.total_stock, item.min_stock_level);
                    return (
                      <tr key={item.id}>
                        <td className="fw-semibold">{item.id}</td>
                        <td className="fw-semibold">{item.cylinder_type_name}</td>
                        <td className="text-end fw-bold">{item.total_stock}</td>
                        <td className="text-end text-success">{item.available_stock}</td>
                        <td className="text-end text-danger">{item.damaged_stock}</td>
                        <td className="text-end text-info">{item.returned_stock}</td>
                        <td className="text-end text-warning">{item.reserved_stock}</td>
                        <td className="text-end">{item.min_stock_level}</td>
                        <td className="text-end">{item.max_stock_level}</td>
                        <td className="text-end">{item.reorder_level}</td>
                        <td>
                          <Badge bg={stockStatus.bg} className="rounded-pill px-3 py-2">
                            {stockStatus.text}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "-"}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1 rounded-circle"
                            style={{ width: "32px", height: "32px", padding: "0" }}
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-circle"
                            style={{ width: "32px", height: "32px", padding: "0" }}
                            onClick={() => setShowDeleteConfirm(item.id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="13" className="text-center py-5">
                      <div className="py-4">
                        <FaBoxes size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No stock records found</h5>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedCylinder(null);
                            resetForm();
                            setShowModal(true);
                          }}
                        >
                          <FaPlus className="me-2" /> Add Stock
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white rounded-top-3 border-0">
          <Modal.Title className="fw-bold">
            {selectedCylinder ? "Edit Stock Record" : "Add New Stock Record"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cylinder Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={formData.cylinder_type_id}
                    onChange={(e) => setFormData({ ...formData, cylinder_type_id: e.target.value })}
                    className="rounded-2"
                  >
                    <option value="">Select Cylinder Type</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.weight} kg)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand ID</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    placeholder="Brand ID"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Stock <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.total_stock}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, total_stock: value });
                      // Auto-calculate available stock if not set
                      if (!formData.available_stock) {
                        setFormData(prev => ({ ...prev, available_stock: value }));
                      }
                    }}
                    placeholder="0"
                    min="0"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Available Stock</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.available_stock}
                    onChange={(e) => setFormData({ ...formData, available_stock: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Damaged Stock</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.damaged_stock}
                    onChange={(e) => setFormData({ ...formData, damaged_stock: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Returned Stock</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.returned_stock}
                    onChange={(e) => setFormData({ ...formData, returned_stock: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Reserved Stock</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.reserved_stock}
                    onChange={(e) => setFormData({ ...formData, reserved_stock: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Reorder Level</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    placeholder="20"
                    min="0"
                    className="rounded-2"
                  />
                  <Form.Text className="text-muted">
                    Stock level that triggers reorder alert
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Stock Level</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                    placeholder="10"
                    min="0"
                    className="rounded-2"
                  />
                  <Form.Text className="text-muted">
                    Below this level triggers low stock alert
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Stock Level</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.max_stock_level}
                    onChange={(e) => setFormData({ ...formData, max_stock_level: e.target.value })}
                    placeholder="100"
                    min="0"
                    className="rounded-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                className="rounded-2"
              />
            </Form.Group>

            {/* Stock Summary Alert */}
            {formData.total_stock && formData.min_stock_level && (
              parseInt(formData.total_stock) <= parseInt(formData.min_stock_level) && (
                <Alert variant="warning" className="mt-2 rounded-3">
                  <small>
                    <strong>⚠️ Low Stock Alert!</strong><br />
                    Current stock ({formData.total_stock}) is at or below minimum level ({formData.min_stock_level}).
                    Consider reordering soon.
                  </small>
                </Alert>
              )
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave} className="rounded-pill px-4" disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : (selectedCylinder ? "Update Stock" : "Save Stock")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!showDeleteConfirm} onHide={() => setShowDeleteConfirm(null)} centered>
        <Modal.Header closeButton className="bg-danger text-white rounded-top-3 border-0">
          <Modal.Title className="fw-bold">
            <FaTrash className="me-2" /> Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this stock record? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(showDeleteConfirm)} className="rounded-pill px-4">
            Delete Record
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .bg-gradient-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
        .text-end {
          text-align: right;
        }
      `}</style>
    </Container>
  );
};

export default CylinderStock;