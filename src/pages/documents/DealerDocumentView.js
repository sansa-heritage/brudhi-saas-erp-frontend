import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Table,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaHome,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaDownload,
  FaTrash,
  FaEye,
  FaUpload,
  FaCheckCircle,
  FaClock,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarker,
  FaRupeeSign,
  FaPercent,
} from "react-icons/fa";
import {
  getDealerDocuments,
  deleteDealerDocument,
  addDealerDocument,
} from "../../components/services/documentService";
import { getDealerById } from "../../components/services/dealerService";

const DealerDocumentView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "agreement",
    size: "",
    validTill: "",
  });
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    const dealerData = getDealerById(id);
    const allDocs = getDealerDocuments();
    const dealerDocs = allDocs.filter((doc) => doc.dealerId === parseInt(id));

    setDealer(dealerData);
    setDocuments(dealerDocs);
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setFormData({
        ...formData,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });
    }
  };

  const handleUpload = () => {
    if (!formData.name) {
      alert("Please select a file");
      return;
    }

    setUploading(true);
    setTimeout(() => {
      const newDoc = {
        dealerId: parseInt(id),
        dealerName: dealer?.name,
        name: formData.name,
        type: formData.type,
        size: formData.size,
        uploadDate: new Date().toISOString().split("T")[0],
        url: "#",
        status: "pending",
        validTill: formData.validTill,
      };
      addDealerDocument(newDoc);
      loadData();
      setUploading(false);
      setShowUploadModal(false);
      setFormData({
        name: "",
        type: "agreement",
        size: "",
        validTill: "",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMessage("Document uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  const handleDelete = (docId) => {
    deleteDealerDocument(docId);
    loadData();
    setShowDeleteConfirm(null);
    setSuccessMessage("Document deleted successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();
    if (extension === "pdf")
      return <FaFilePdf size={30} className="text-danger" />;
    if (["jpg", "jpeg", "png", "gif"].includes(extension))
      return <FaFileImage size={30} className="text-primary" />;
    return <FaFileAlt size={30} className="text-secondary" />;
  };

  const getDocumentTypeName = (type) => {
    const types = {
      gst: "GST Certificate",
      pan: "PAN Card",
      agreement: "Dealer Agreement",
      authorization: "Authorization Letter",
      bank: "Bank Details",
      other: "Other Document",
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    if (status === "verified") {
      return (
        <Badge bg="success" className="rounded-pill px-3 py-2">
          <FaCheckCircle className="me-1" /> Verified
        </Badge>
      );
    }
    return (
      <Badge bg="warning" className="rounded-pill px-3 py-2">
        <FaClock className="me-1" /> Pending
      </Badge>
    );
  };

  const getDealerTypeBadge = (type) => {
    const types = {
      distributor: { text: "Distributor", color: "primary" },
      retailer: { text: "Retailer", color: "success" },
      franchise: { text: "Franchise", color: "info" },
    };
    const t = types[type] || types.retailer;
    return (
      <Badge bg={t.color} className="rounded-pill">
        {t.text}
      </Badge>
    );
  };

  const handleGoBack = () => {
    navigate("/documents/dealers");
  };

  if (loading) {
    return (
      <Container fluid className="p-4 bg-light">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dealer documents...</p>
        </div>
      </Container>
    );
  }

  if (!dealer) {
    return (
      <Container fluid className="p-4 bg-light">
        <Alert variant="danger" className="text-center">
          <h5>Dealer Not Found</h5>
          <p>The dealer you're looking for doesn't exist.</p>
          <Button
            variant="primary"
            onClick={() => navigate("/documents/dealers")}
          >
            Back to Dealers
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
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

      {/* Back Button */}
      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center text-success"
          onClick={handleGoBack}
        >
          <FaArrowLeft className="me-2" /> Back to Dealers
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill"
          onClick={() => navigate("/documents/dealers")}
        >
          <FaHome className="me-1" /> Documents
        </Button>
      </div>

      {/* Dealer Header */}
      <div className="bg-gradient-success text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <h2 className="fw-bold mb-0">{dealer.name}</h2>
              {getDealerTypeBadge(dealer.dealerType)}
              <Badge bg="light" text="dark" className="rounded-pill">
                Code: {dealer.dealerCode}
              </Badge>
            </div>
            <p className="mb-1 opacity-75">{dealer.companyName}</p>
            <div className="d-flex gap-3 mt-2 flex-wrap">
              <span>
                <FaEnvelope className="me-1" /> {dealer.email}
              </span>
              <span>
                <FaPhone className="me-1" /> {dealer.phone}
              </span>
              <span>
                <FaBuilding className="me-1" /> GST: {dealer.gstin || "N/A"}
              </span>
              <span>
                <FaMapMarker className="me-1" /> {dealer.territory}
              </span>
              <span>
                <FaRupeeSign className="me-1" /> Commission: {dealer.commission}
                %
              </span>
            </div>
          </div>
          <Button
            variant="light"
            onClick={() => setShowUploadModal(true)}
            className="rounded-pill px-4"
          >
            <FaUpload className="me-2" /> Upload Document
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Documents Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>Upload Date</th>
                  <th>Valid Till</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="fw-semibold">
                        {getDocumentTypeName(doc.type)}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {getFileIcon(doc.name)}
                          <span>{doc.name}</span>
                        </div>
                      </td>
                      <td>{doc.uploadDate}</td>
                      <td
                        className={
                          doc.validTill && new Date(doc.validTill) < new Date()
                            ? "text-danger fw-semibold"
                            : ""
                        }
                      >
                        {doc.validTill || "N/A"}
                        {doc.validTill &&
                          new Date(doc.validTill) < new Date() && (
                            <Badge bg="danger" className="ms-2 rounded-pill">
                              Expired
                            </Badge>
                          )}
                      </td>
                      <td>{doc.size}</td>
                      <td>{getStatusBadge(doc.status)}</td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-1 rounded-circle"
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: "0",
                          }}
                          onClick={() => window.open(doc.url, "_blank")}
                          title="View"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-1 rounded-circle"
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: "0",
                          }}
                          onClick={() => window.open(doc.url, "_download")}
                          title="Download"
                        >
                          <FaDownload />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-circle"
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: "0",
                          }}
                          onClick={() => setShowDeleteConfirm(doc.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaFileAlt size={50} className="text-muted mb-3" />
                      <h5 className="text-muted">No Documents Found</h5>
                      <p className="text-muted small">
                        No documents have been uploaded for this dealer yet.
                      </p>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setShowUploadModal(true)}
                        className="rounded-pill"
                      >
                        <FaUpload className="me-2" /> Upload First Document
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Upload Document Modal */}
      <Modal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          className="bg-success text-white rounded-top-3 border-0"
        >
          <Modal.Title className="fw-bold">
            <FaUpload className="me-2" /> Upload Document for {dealer.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="info" className="small rounded-3">
            <strong>Supported formats:</strong> PDF, JPG, PNG (Max size: 5MB)
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Document Type *</Form.Label>
            <Form.Select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="rounded-2"
            >
              <option value="gst">GST Certificate</option>
              <option value="pan">PAN Card</option>
              <option value="agreement">Dealer Agreement</option>
              <option value="authorization">Authorization Letter</option>
              <option value="bank">Bank Details</option>
              <option value="other">Other Document</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Select File *</Form.Label>
            <input
              type="file"
              className="form-control rounded-2"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Valid Till (Optional)
            </Form.Label>
            <Form.Control
              type="date"
              value={formData.validTill}
              onChange={(e) =>
                setFormData({ ...formData, validTill: e.target.value })
              }
              className="rounded-2"
            />
            <Form.Text className="text-muted">
              Set expiry date for agreements and certificates
            </Form.Text>
          </Form.Group>

          {formData.name && (
            <div className="bg-light p-3 rounded-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="fw-semibold">{formData.name}</small>
                  <br />
                  <small className="text-muted">{formData.size}</small>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger p-0"
                  onClick={() => {
                    setFormData({ ...formData, name: "", size: "" });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button
            variant="secondary"
            onClick={() => setShowUploadModal(false)}
            className="rounded-pill px-4"
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleUpload}
            disabled={!formData.name || uploading}
            className="rounded-pill px-4"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm !== null}
        onHide={() => setShowDeleteConfirm(null)}
        centered
      >
        <Modal.Header
          closeButton
          className="bg-danger text-white rounded-top-3 border-0"
        >
          <Modal.Title className="fw-bold">
            <FaTrash className="me-2" /> Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p>Are you sure you want to delete this document?</p>
          <Alert variant="danger" className="rounded-3">
            <small>
              This action cannot be undone. The document will be permanently
              removed.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="bg-light rounded-bottom-3 border-0">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(null)}
            className="rounded-pill px-4"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(showDeleteConfirm)}
            className="rounded-pill px-4"
          >
            Delete Document
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx="true">{`
        .bg-gradient-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default DealerDocumentView;
