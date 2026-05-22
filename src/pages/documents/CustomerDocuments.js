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
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaSearch,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DocumentViewer from "../../components/Modals/DocumentViewer";
import {
  getCustomerDocuments,
  addCustomerDocument,
  updateCustomerDocument,
  deleteCustomerDocument,
} from "../../components/services/documentService.js";
import { getCustomers } from "../../components/services/customerService";

// Document types for customer documents (inline)
const CUSTOMER_DOCUMENT_TYPES = {
  gst: "GST Certificate",
  pan: "PAN Card",
  aadhar: "Aadhar Card",
  registration: "Business Registration",
  agreement: "Customer Agreement",
  other: "Other Documents",
};

const CustomerDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    name: "",
    type: "gst",
    size: "",
    expiryDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load documents and customers in parallel
      const [docs, customersData] = await Promise.all([
        getCustomerDocuments(),
        getCustomers()
      ]);
      
      console.log("Loaded documents:", docs);
      console.log("Loaded customers data:", customersData);
      
      // Ensure we're working with arrays
      const docsArray = Array.isArray(docs) ? docs : [];
      const customersArray = Array.isArray(customersData) ? customersData : [];
      
      setDocuments(docsArray);
      setCustomers(customersArray);
    } catch (error) {
      console.error("Error loading data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load customer documents',
      });
      setDocuments([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (e) => {
    const customerId = parseInt(e.target.value);
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer);
    setFormData({
      ...formData,
      customerId,
      customerName: customer?.name || "",
    });
  };

  const handleSave = async () => {
    try {
      if (selectedDoc) {
        await updateCustomerDocument(selectedDoc.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Document updated successfully!',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await addCustomerDocument(formData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Document uploaded successfully!',
          timer: 1500,
          showConfirmButton: false,
        });
      }
      await loadData();
      setShowModal(false);
      setSelectedDoc(null);
      resetForm();
    } catch (error) {
      console.error("Error saving document:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to save document',
      });
    }
  };

  const handleViewDocuments = (customer) => {
    setSelectedCustomer(customer);
    const customerDocs = documents.filter(
      (doc) => doc.customerId === customer.id,
    );
    setSelectedDoc(customerDocs);
    setShowViewer(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteCustomerDocument(id);
        await loadData();
        Swal.fire(
          'Deleted!',
          'Document has been deleted.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting document:", error);
        Swal.fire(
          'Error!',
          'Failed to delete document.',
          'error'
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      customerName: "",
      name: "",
      type: "gst",
      size: "",
      expiryDate: "",
    });
  };

  const getStatusBadge = (status) => {
    if (status === "verified") {
      return (
        <Badge bg="success" className="rounded-pill px-3">
          <FaCheckCircle className="me-1" /> Verified
        </Badge>
      );
    }
    return (
      <Badge bg="warning" className="rounded-pill px-3">
        <FaClock className="me-1" /> Pending
      </Badge>
    );
  };

  const getDocumentTypeLabel = (type) => {
    return CUSTOMER_DOCUMENT_TYPES[type] || type || "Unknown";
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchTerm === "" ||
      doc.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGoBack = () => {
    navigate("/documents");
  };

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h5 className="mt-3">Loading documents...</h5>
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
          <FaArrowLeft className="me-2" /> Back to Documents
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/documents")}
        >
          <FaHome className="me-1" /> Documents
        </Button>
      </div>

      {/* Header */}
      <div className="bg-gradient-primary text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaUsers className="me-2" /> Customer Documents
            </h2>
            <p className="mb-0 opacity-75">
              Manage GST certificates, PAN cards, agreements and other customer
              documents
            </p>
          </div>
          <Button
            variant="light"
            onClick={() => {
              setSelectedDoc(null);
              resetForm();
              setShowModal(true);
            }}
            className="rounded-pill px-4"
          >
            <FaPlus className="me-2" /> Upload Document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Total Documents</small>
                  <h4 className="text-primary">{documents.length}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <FaUsers className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Verified</small>
                  <h4 className="text-success">
                    {documents.filter((d) => d.status === "verified").length}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FaCheckCircle className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <small>Pending</small>
                  <h4 className="text-warning">
                    {documents.filter((d) => d.status === "pending").length}
                  </h4>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <FaClock className="text-warning" size={24} />
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
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by customer or document name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-2"
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Documents Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Customer Name</th>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>Upload Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="fw-semibold">{doc.customerName}</td>
                    <td>{getDocumentTypeLabel(doc.type)}</td>
                    <td>{doc.name}</td>
                    <td>{doc.uploadDate}</td>
                    <td
                      className={
                        doc.expiryDate && new Date(doc.expiryDate) < new Date()
                          ? "text-danger"
                          : ""
                      }
                    >
                      {doc.expiryDate || "N/A"}
                    </td>
                    <td>{getStatusBadge(doc.status)}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => handleViewDocuments({ id: doc.customerId, name: doc.customerName })}
                        title="View Customer Documents"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => window.open(doc.url, "_blank")}
                        title="Download"
                      >
                        <FaDownload />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => handleDelete(doc.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredDocuments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaUsers size={50} className="text-muted mb-3" />
                      <h5 className="text-muted">No documents found</h5>
                      <Button
                        variant="primary"
                        onClick={() => setShowModal(true)}
                      >
                        Upload First Document
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Upload Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          className="bg-primary text-white rounded-top-3 border-0"
        >
          <Modal.Title className="fw-bold">
            <FaPlus className="me-2" /> Upload Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Customer *</Form.Label>
              <Form.Select
                value={formData.customerId}
                onChange={handleCustomerSelect}
                className="rounded-2"
                disabled={loading || customers.length === 0}
              >
                <option value="">{loading ? "Loading customers..." : "Choose customer..."}</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.companyName ? `- ${customer.companyName}` : ''}
                  </option>
                ))}
              </Form.Select>
              {customers.length === 0 && !loading && (
                <Form.Text className="text-danger">
                  No customers found. Please add customers first.
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Document Type *</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="rounded-2"
              >
                {Object.entries(CUSTOMER_DOCUMENT_TYPES).map(
                  ([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ),
                )}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Select File *</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="rounded-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file)
                    setFormData({
                      ...formData,
                      name: file.name,
                      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                    });
                }}
              />
              <Form.Text className="text-muted">
                Supported formats: PDF, JPG, PNG (Max size: 5MB)
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Expiry Date (Optional)</Form.Label>
              <Form.Control
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="rounded-2"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            className="rounded-pill px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="rounded-pill px-4"
            disabled={!formData.customerId || !formData.name}
          >
            Upload Document
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Document Viewer */}
      <DocumentViewer
        show={showViewer}
        onHide={() => setShowViewer(false)}
        documents={
          selectedCustomer
            ? documents.filter((d) => d.customerId === selectedCustomer.id)
            : []
        }
        onUpload={() => {}}
        onDelete={() => {}}
      />

      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
      `}</style>
    </Container>
  );
};

export default CustomerDocuments;