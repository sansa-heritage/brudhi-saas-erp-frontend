import React, { useState, useRef } from "react";
import {
  Modal,
  Button,
  Card,
  Row,
  Col,
  Badge,
  Alert,
  Form,
} from "react-bootstrap";
import {
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaDownload,
  FaTrash,
  FaEye,
  FaUpload,
  FaTimes,
} from "react-icons/fa";

const DocumentViewer = ({ show, onHide, documents, onUpload, onDelete }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("other");
  const fileInputRef = useRef(null);

  const getFileIcon = (fileName, fileType) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();
    if (extension === "pdf")
      return <FaFilePdf size={40} className="text-danger" />;
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension))
      return <FaFileImage size={40} className="text-primary" />;
    if (fileType?.includes("pdf"))
      return <FaFilePdf size={40} className="text-danger" />;
    if (fileType?.includes("image"))
      return <FaFileImage size={40} className="text-primary" />;
    return <FaFileAlt size={40} className="text-secondary" />;
  };

  const getDocTypeBadge = (type) => {
    const types = {
      gst: { text: "GST Certificate", color: "primary" },
      pan: { text: "PAN Card", color: "warning" },
      registration: { text: "Registration Certificate", color: "success" },
      agreement: { text: "Dealer Agreement", color: "info" },
      aadhar: { text: "Aadhar Card", color: "secondary" },
      other: { text: "Other Document", color: "secondary" },
    };
    return types[type] || types.other;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    // Simulate upload - replace with actual API call
    setTimeout(() => {
      const newDoc = {
        id: Date.now(),
        name: selectedFile.name,
        type: docType,
        size: (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB",
        uploadDate: new Date().toISOString().split("T")[0],
        url: URL.createObjectURL(selectedFile),
      };
      if (onUpload) {
        onUpload(newDoc);
      }
      setUploading(false);
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocType("other");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1500);
  };

  const handleDelete = (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      if (onDelete) {
        onDelete(docId);
      }
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFileAlt className="me-2" /> Documents & Certificates
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted small">
                Total Documents: {documents?.length || 0}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowUploadModal(true)}
            >
              <FaUpload className="me-2" /> Upload Document
            </Button>
          </div>

          {documents && documents.length > 0 ? (
            <Row>
              {documents.map((doc) => {
                const docTypeBadge = getDocTypeBadge(doc.type);
                return (
                  <Col md={12} key={doc.id} className="mb-3">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex align-items-start gap-3">
                          {getFileIcon(doc.name, doc.type)}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6
                                  className="mb-1"
                                  style={{
                                    fontSize: "0.85rem",
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {doc.name}
                                </h6>
                                <Badge
                                  bg={docTypeBadge.color}
                                  className="mb-2"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {docTypeBadge.text}
                                </Badge>
                                <div className="text-muted small">
                                  Size: {doc.size} | Uploaded: {doc.uploadDate}
                                </div>
                              </div>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => window.open(doc.url, "_blank")}
                                  title="View Document"
                                >
                                  <FaEye />
                                </Button>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() =>
                                    window.open(doc.url, "_download")
                                  }
                                  title="Download"
                                >
                                  <FaDownload />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(doc.id)}
                                  title="Delete"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <div className="text-center py-5">
              <FaFileAlt size={60} className="text-muted mb-3" />
              <p className="text-muted mb-2">No documents uploaded yet</p>
              <small className="text-muted d-block mb-3">
                Upload GST certificates, PAN cards, agreements, etc.
              </small>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUploadModal(true)}
              >
                <FaUpload className="me-2" /> Upload First Document
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="small">
            <strong>Supported formats:</strong> PDF, JPG, PNG, DOC (Max size:
            5MB)
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>Document Type</Form.Label>
            <Form.Select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="gst">GST Certificate</option>
              <option value="pan">PAN Card</option>
              <option value="registration">Registration Certificate</option>
              <option value="agreement">Dealer Agreement</option>
              <option value="aadhar">Aadhar Card</option>
              <option value="other">Other Document</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Select File</Form.Label>
            <input
              type="file"
              className="form-control"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </Form.Group>

          {selectedFile && (
            <div className="bg-light p-2 rounded">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="fw-semibold">{selectedFile.name}</small>
                  <br />
                  <small className="text-muted">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </small>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger p-0"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <FaTimes />
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DocumentViewer;
