import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import {
  FaBoxes,
  FaRupeeSign,
  FaWarehouse,
  FaStickyNote,
  FaTag,
  FaBarcode,
} from "react-icons/fa";

const InventoryModal = ({ show, onHide, item, onSave, isEditing }) => {
  const [formData, setFormData] = useState({
    productName: "",
    sku: "",
    category: "",
    quantity: 0,
    price: 0,
    gst: 0,
    warehouse: "",
    status: "active",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      productName: "",
      sku: "",
      category: "",
      quantity: 0,
      price: 0,
      gst: 0,
      warehouse: "",
      status: "active",
      notes: "",
    });
    setErrors({});
  };

  useEffect(() => {
    if (item && isEditing) {
      setFormData({
        productName: item.productName || "",
        sku: item.sku || "",
        category: item.category || "",
        quantity: item.quantity || 0,
        price: item.price || 0,
        gst: item.gst || 0,
        warehouse: item.warehouse || "",
        status: item.status || "active",
        notes: item.notes || "",
      });
    } else {
      resetForm();
    }
  }, [item, show, isEditing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (formData.gst < 0 || formData.gst > 100) {
      newErrors.gst = "GST must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onSave(formData);
      resetForm();
      onHide();
    } catch (error) {
      console.error("Error saving inventory:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaBoxes className="me-2" />
          {isEditing ? "Edit Inventory Item" : "Add New Inventory Item"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Form>
          <div className="bg-light p-3 rounded mb-3">
            <h6 className="mb-0 text-primary">
              <FaBoxes className="me-2" /> Basic Details
            </h6>
          </div>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Product Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  isInvalid={!!errors.productName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.productName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  SKU <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Enter SKU code"
                  isInvalid={!!errors.sku}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.sku}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Food">Food & Beverages</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="bg-light p-3 rounded mb-3">
            <h6 className="mb-0 text-primary">
              <FaRupeeSign className="me-2" /> Stock & Pricing
            </h6>
          </div>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  isInvalid={!!errors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantity}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Price (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  isInvalid={!!errors.price}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>GST (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  isInvalid={!!errors.gst}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.gst}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="bg-light p-3 rounded mb-3">
            <h6 className="mb-0 text-primary">
              <FaWarehouse className="me-2" /> Location & Status
            </h6>
          </div>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Warehouse</Form.Label>
                <Form.Control
                  type="text"
                  name="warehouse"
                  value={formData.warehouse}
                  onChange={handleChange}
                  placeholder="Enter warehouse name/location"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="bg-light p-3 rounded mb-3">
            <h6 className="mb-0 text-primary">
              <FaStickyNote className="me-2" /> Additional Notes
            </h6>
          </div>

          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional information about the product..."
            />
          </Form.Group>

          <Alert variant="info" className="mt-2">
            <strong>Note:</strong> Fields marked with <span className="text-danger">*</span> are required.
          </Alert>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            <>{isEditing ? "Update Item" : "Save Item"}</>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InventoryModal;