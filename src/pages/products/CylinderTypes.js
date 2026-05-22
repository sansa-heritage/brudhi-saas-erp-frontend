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
  FaEye,
  FaSearch,
  FaCube,
  FaWeightHanging,
  FaRupeeSign,
  FaPercent,
  FaArrowLeft,
  FaHome,
  FaTimes,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import {
  getCylinderTypes,
  createCylinderType,
  updateCylinderType,
  deleteCylinderType,
} from "../../components/services/cylinderService";
import Swal from "sweetalert2";

const CylinderTypes = () => {
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    weight: "",
    type: "",
    capacityKg: "",
    price: "",
    gstPercent: 18,
    description: "",
    status: "active",
  });

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    filterTypes();
  }, [searchTerm, statusFilter, types]);

  const loadTypes = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getCylinderTypes();
      console.log("API Response:", response);
      
      let typesArray = [];
      
      // Handle response structure from your backend
      // Your backend returns: { success: true, data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        typesArray = response.data;
      } 
      // If response is directly an array
      else if (Array.isArray(response)) {
        typesArray = response;
      }
      // If response has data property
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        typesArray = response.data.data;
      }
      
      // Map backend fields to frontend fields
      const mappedTypes = typesArray.map(type => ({
        id: type.id,
        name: type.name,
        weight: type.weight,
        type: type.type,
        capacity_kg: type.capacityKg || type.capacity_kg,
        price: type.price,
        gst_percent: type.gstPercent || type.gst_percent,
        description: type.description,
        status: type.status === 1 || type.status === "active" ? "active" : "inactive",
        created_at: type.created_at,
      }));
      
      console.log("Mapped types:", mappedTypes);
      setTypes(mappedTypes);
      setFilteredTypes(mappedTypes);
      
      if (mappedTypes.length === 0) {
        setErrorMessage("No cylinder types found. Click 'Add Cylinder Type' to create one.");
      } else {
        setSuccessMessage(`Loaded ${mappedTypes.length} cylinder types successfully`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to load cylinder types:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to load cylinder types";
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

  const filterTypes = () => {
    let filtered = [...types];
    
    if (searchTerm) {
      filtered = filtered.filter(
        (type) =>
          (type.name && type.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (type.type && type.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((type) => type.status === statusFilter);
    }
    
    setFilteredTypes(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const handleSave = async () => {
    if (!formData.name) {
      Swal.fire({ icon: "warning", title: "Validation Error", text: "Type name is required" });
      return;
    }
    if (!formData.weight) {
      Swal.fire({ icon: "warning", title: "Validation Error", text: "Weight is required" });
      return;
    }
    if (!formData.type) {
      Swal.fire({ icon: "warning", title: "Validation Error", text: "Type is required" });
      return;
    }
    if (!formData.price) {
      Swal.fire({ icon: "warning", title: "Validation Error", text: "Price is required" });
      return;
    }

    setSubmitting(true);
    
    try {
      // Format data as per Postman body (camelCase for backend)
      const typeData = {
        name: formData.name.trim(),
        weight: parseFloat(formData.weight),
        type: formData.type,
        capacityKg: formData.capacityKg ? parseFloat(formData.capacityKg) : null,
        price: parseFloat(formData.price),
        gstPercent: parseFloat(formData.gstPercent),
        description: formData.description?.trim() || null,
        status: formData.status === "active" ? 1 : 0,
      };

      console.log("Sending data to API:", typeData);

      let response;
      if (selectedType) {
        response = await updateCylinderType(selectedType.id, typeData);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: response?.data?.message || "Cylinder type updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        response = await createCylinderType(typeData);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: response?.data?.message || "Cylinder type added successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      
      await loadTypes();
      setShowModal(false);
      setSelectedType(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save cylinder type:", error);
      const errorMsg = error.response?.data?.message || "Failed to save cylinder type";
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (type) => {
    setSelectedType(type);
    setFormData({
      name: type.name || "",
      weight: type.weight || "",
      type: type.type || "",
      capacityKg: type.capacity_kg || "",
      price: type.price || "",
      gstPercent: type.gst_percent || 18,
      description: type.description || "",
      status: type.status || "active",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCylinderType(id);
      await loadTypes();
      setShowDeleteConfirm(null);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Cylinder type deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to delete cylinder type:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to delete cylinder type",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      weight: "",
      type: "",
      capacityKg: "",
      price: "",
      gstPercent: 18,
      description: "",
      status: "active",
    });
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge bg="success" className="rounded-pill px-3 py-2">
        Active
      </Badge>
    ) : (
      <Badge bg="danger" className="rounded-pill px-3 py-2">
        Inactive
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

  const handleGoBack = () => {
    navigate("/products");
  };

  const stats = {
    total: types.length,
    active: types.filter((t) => t.status === "active").length,
    inactive: types.filter((t) => t.status === "inactive").length,
  };

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">Loading cylinder types...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
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

      {successMessage && (
        <Alert variant="success" className="mb-3" onClose={() => setSuccessMessage("")} dismissible>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" className="mb-3" onClose={() => setErrorMessage("")} dismissible>
          {errorMessage}
        </Alert>
      )}

      <div className="bg-gradient-primary text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaCube className="me-2" /> Cylinder Types
            </h2>
            <p className="mb-0 opacity-75">
              Manage different types of LPG cylinders, their specifications and pricing
            </p>
          </div>
          <Button
            variant="light"
            onClick={() => {
              setSelectedType(null);
              resetForm();
              setShowModal(true);
            }}
            className="rounded-pill px-4"
          >
            <FaPlus className="me-2" /> Add Cylinder Type
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Types</small>
                  <h4 className="text-primary mb-0 fw-bold">{stats.total}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <FaCube className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Active Types</small>
                  <h4 className="text-success mb-0 fw-bold">{stats.active}</h4>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FaEye className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Inactive Types</small>
                  <h4 className="text-danger mb-0 fw-bold">{stats.inactive}</h4>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                  <FaEye className="text-danger" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <Row>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name or type..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2"
              >
                <option value="all">All Status ({stats.total})</option>
                <option value="active">Active ({stats.active})</option>
                <option value="inactive">Inactive ({stats.inactive})</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                className="w-100 rounded-pill"
              >
                <FaFilter className="me-1" /> Clear
              </Button>
            </Col>
          </Row>
          <div className="mt-3 pt-2 border-top">
            <small className="text-muted">
              Showing {filteredTypes.length} of {types.length} cylinder types
            </small>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Weight (kg)</th>
                  <th>Type</th>
                  <th>Capacity (kg)</th>
                  <th>Price (₹)</th>
                  <th>GST %</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTypes.map((type) => (
                  <tr key={type.id}>
                    <td className="fw-semibold">{type.id}</td>
                    <td className="fw-semibold">{type.name}</td>
                    <td className="text-end">{type.weight} kg</td>
                    <td>
                      <Badge bg="info" className="rounded-pill">
                        {type.type}
                      </Badge>
                    </td>
                    <td className="text-end">{type.capacity_kg ? `${type.capacity_kg} kg` : "-"}</td>
                    <td className="fw-semibold text-primary text-end">
                      ₹{parseFloat(type.price || 0).toLocaleString()}
                    </td>
                    <td>
                      <Badge bg="secondary" className="rounded-pill">
                        {type.gst_percent}%
                      </Badge>
                    </td>
                    <td className="text-muted">{type.description || "-"}</td>
                    <td>{getStatusBadge(type.status)}</td>
                    <td className="text-muted small">
                      <FaCalendarAlt className="me-1" size={12} />
                      {formatDate(type.created_at)}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => handleEdit(type)}
                        title="Edit"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => setShowDeleteConfirm(type.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredTypes.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center py-5">
                      <div className="py-4">
                        <FaCube size={40} className="text-muted mb-3" />
                        <h5 className="text-muted">No cylinder types found</h5>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedType(null);
                            resetForm();
                            setShowModal(true);
                          }}
                        >
                          <FaPlus className="me-2" /> Add Cylinder Type
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
        <Modal.Header closeButton className="bg-primary text-white rounded-top-3 border-0">
          <Modal.Title className="fw-bold">
            {selectedType ? "Edit Cylinder Type" : "Add New Cylinder Type"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Domestic Cylinder"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="">Select Type</option>
                    <option value="Domestic">Domestic</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g., 14.2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacity (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.capacityKg}
                    onChange={(e) => setFormData({ ...formData, capacityKg: e.target.value })}
                    placeholder="e.g., 14.2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>GST Rate (%)</Form.Label>
                  <Form.Select
                    value={formData.gstPercent}
                    onChange={(e) => setFormData({ ...formData, gstPercent: e.target.value })}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the cylinder type..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {formData.price && formData.gstPercent > 0 && (
              <Alert variant="info" className="mt-2 rounded-3">
                <small>
                  <strong>Price Summary:</strong><br />
                  Base Price: ₹{parseFloat(formData.price || 0).toLocaleString()}<br />
                  GST ({formData.gstPercent}%): ₹{((parseFloat(formData.price) * parseFloat(formData.gstPercent)) / 100).toLocaleString()}<br />
                  <strong>Total Price: ₹{(parseFloat(formData.price) + (parseFloat(formData.price) * parseFloat(formData.gstPercent)) / 100).toLocaleString()}</strong>
                </small>
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} className="rounded-pill px-4" disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : selectedType ? "Update Type" : "Save Type"}
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
          <p>Are you sure you want to delete this cylinder type? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(showDeleteConfirm)} className="rounded-pill px-4">
            Delete Type
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
          cursor: pointer;
        }
        .text-end {
          text-align: right;
        }
      `}</style>
    </Container>
  );
};

export default CylinderTypes;