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
  FaUserTie,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getDealerDocuments,
  addDealerDocument,
  updateDealerDocument,
  deleteDealerDocument,
} from "../../components/services/documentService";
import { getDealers } from "../../components/services/dealerService";

// Dealer document types (inline)
const DEALER_DOCUMENT_TYPES = {
  gst: "GST Certificate",
  pan: "PAN Card",
  agreement: "Dealer Agreement",
  authorization: "Authorization Letter",
  bank: "Bank Details",
  other: "Other Documents",
};

const DealerDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    dealerId: "",
    dealerName: "",
    documentType: "agreement",
    fileName: "",
    fileSize: "",
    validTill: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docs, dealersData] = await Promise.all([
        getDealerDocuments(),
        getDealers()
      ]);
      
      console.log("Loaded dealer documents:", docs);
      console.log("Loaded dealers data:", dealersData);
      
      const docsArray = Array.isArray(docs) ? docs : [];
      const dealersArray = Array.isArray(dealersData) ? dealersData : [];
      
      setDocuments(docsArray);
      setDealers(dealersArray);
    } catch (error) {
      console.error("Error loading data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load dealer documents',
      });
      setDocuments([]);
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDealerSelect = (e) => {
    const dealerId = parseInt(e.target.value);
    const dealer = dealers.find((d) => d.id === dealerId);
    setFormData({
      ...formData,
      dealerId,
      dealerName: dealer?.name || "",
    });
  };

  const handleSave = async () => {
    try {
      if (selectedDoc) {
        await updateDealerDocument(selectedDoc.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Document updated successfully!',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await addDealerDocument(formData);
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

  const handleEdit = (doc) => {
    setSelectedDoc(doc);
    setFormData({
      dealerId: doc.dealerId,
      dealerName: doc.dealerName,
      documentType: doc.document_type || doc.documentType || "agreement",
      fileName: doc.file_name || doc.fileName || "",
      fileSize: doc.file_size || doc.fileSize || "",
      validTill: doc.valid_till || doc.validTill || "",
      notes: doc.notes || "",
    });
    setShowModal(true);
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
        await deleteDealerDocument(id);
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
      dealerId: "",
      dealerName: "",
      documentType: "agreement",
      fileName: "",
      fileSize: "",
      validTill: "",
      notes: "",
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
    if (status === "expired") {
      return (
        <Badge bg="danger" className="rounded-pill px-3">
          <FaClock className="me-1" /> Expired
        </Badge>
      );
    }
    return (
      <Badge bg="warning" className="rounded-pill px-3">
        <FaClock className="me-1" /> Pending
      </Badge>
    );
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FaFilePdf className="text-danger" size={20} />;
    if (["jpg", "jpeg", "png"].includes(ext))
      return <FaFileImage className="text-primary" size={20} />;
    return <FaFileAlt className="text-secondary" size={20} />;
  };

  const getDocumentTypeLabel = (type) => {
    return DEALER_DOCUMENT_TYPES[type] || type || "Unknown";
  };

  const filteredDocuments = documents.filter((doc) => {
    const docTypeLabel = getDocumentTypeLabel(doc.document_type || doc.documentType);
    const matchesSearch =
      searchTerm === "" ||
      doc.dealerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docTypeLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.file_name || doc.fileName)?.toLowerCase().includes(searchTerm.toLowerCase());
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
          <h5 className="mt-3">Loading dealer documents...</h5>
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
          className="text-decoration-none p-0 d-flex align-items-center text-success"
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
      <div className="bg-gradient-success text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaUserTie className="me-2" /> Dealer Documents
            </h2>
            <p className="mb-0 opacity-75">
              Manage dealer agreements, GST certificates, authorization letters
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
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Total Documents</small>
                  <h4 className="text-success mb-0 fw-bold">
                    {documents.length}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FaFileAlt className="text-success" size={24} />
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
                  <small className="text-muted">Verified</small>
                  <h4 className="text-success mb-0 fw-bold">
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
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Pending</small>
                  <h4 className="text-warning mb-0 fw-bold">
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
                  placeholder="Search by dealer or document name..."
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
                <option value="expired">Expired</option>
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
                  <th>Dealer</th>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>Upload Date</th>
                  <th>Valid Till</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="fw-semibold">{doc.dealerName}</td>
                    <td>{getDocumentTypeLabel(doc.document_type || doc.documentType)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {getFileIcon(doc.file_name || doc.fileName)}
                        <span>{doc.file_name || doc.fileName}</span>
                      </div>
                    </td>
                    <td>{doc.upload_date || doc.uploadDate}</td>
                    <td
                      className={
                        (doc.valid_till || doc.validTill) && new Date(doc.valid_till || doc.validTill) < new Date()
                          ? "text-danger fw-semibold"
                          : ""
                      }
                    >
                      {doc.valid_till || doc.validTill || "N/A"}
                    </td>
                    <td>{getStatusBadge(doc.status)}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => navigate(`/documents/dealers/view/${doc.dealerId}`)}
                        title="View Dealer Documents"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => window.open(doc.file_url || doc.url, "_blank")}
                        title="Download"
                      >
                        <FaDownload />
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1 rounded-circle"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        onClick={() => handleEdit(doc)}
                        title="Edit"
                      >
                        <FaEdit />
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
                      <FaUserTie size={50} className="text-muted mb-3" />
                      <h5 className="text-muted">No dealer documents found</h5>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setSelectedDoc(null);
                          resetForm();
                          setShowModal(true);
                        }}
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
          className="bg-success text-white rounded-top-3 border-0"
        >
          <Modal.Title className="fw-bold">
            <FaPlus className="me-2" />{" "}
            {selectedDoc ? "Edit Document" : "Upload Document"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Dealer *</Form.Label>
              <Form.Select
                value={formData.dealerId}
                onChange={handleDealerSelect}
                className="rounded-2"
                disabled={loading || dealers.length === 0}
              >
                <option value="">{loading ? "Loading dealers..." : "Choose dealer..."}</option>
                {dealers.map((dealer) => (
                  <option key={dealer.id} value={dealer.id}>
                    {dealer.name} {dealer.companyName ? `- ${dealer.companyName}` : ''}
                  </option>
                ))}
              </Form.Select>
              {dealers.length === 0 && !loading && (
                <Form.Text className="text-danger">
                  No dealers found. Please add dealers first.
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Document Type *</Form.Label>
              <Form.Select
                value={formData.documentType}
                onChange={(e) =>
                  setFormData({ ...formData, documentType: e.target.value })
                }
                className="rounded-2"
              >
                {Object.entries(DEALER_DOCUMENT_TYPES).map(
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
                  if (file) {
                    setFormData({
                      ...formData,
                      fileName: file.name,
                      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                    });
                  }
                }}
              />
              <Form.Text className="text-muted">
                Supported formats: PDF, JPG, PNG (Max size: 5MB)
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Valid Till (Optional)</Form.Label>
              <Form.Control
                type="date"
                value={formData.validTill}
                onChange={(e) =>
                  setFormData({ ...formData, validTill: e.target.value })
                }
                className="rounded-2"
              />
              <Form.Text className="text-muted">
                Set expiry date for this document
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
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
            variant="success"
            onClick={handleSave}
            className="rounded-pill px-4"
            disabled={!formData.dealerId}
          >
            {selectedDoc ? "Update" : "Upload"} Document
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
      `}</style>
    </Container>
  );
};

export default DealerDocuments;