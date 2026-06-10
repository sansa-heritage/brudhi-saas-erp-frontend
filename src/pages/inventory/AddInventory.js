import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Tab,
  Nav,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaBox,
  FaPercent,
  FaTag,
  FaBarcode,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaBuilding,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaChartLine,
  FaWarehouse,
  FaBalanceScale,
  FaDollarSign,
} from "react-icons/fa";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createProduct } from "../../api/tenant/inventory.api";
import { brandApi } from "../../api/tenant/masterData.api";

const AddInventory = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    hsn_code: "",
    unit: "NOS",
    unit_price: "",
    purchase_price: "",
    selling_price: "",
    gst_rate: "18",
    min_stock_level: "",
    max_stock_level: "",
    reorder_level: "",
    opening_stock: "",
    location: "",
    brand_id: "",
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await brandApi.getBrands();

      let brandsData = [];

      if (
        response?.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        brandsData = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        brandsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        brandsData = response.data;
      } else if (Array.isArray(response)) {
        brandsData = response;
      } else if (
        response?.data?.brands &&
        Array.isArray(response.data.brands)
      ) {
        brandsData = response.data.brands;
      }

      brandsData = Array.isArray(brandsData) ? brandsData : [];
      setBrands(brandsData);

      if (brandsData.length > 0) {
        toast.success(`✓ Loaded ${brandsData.length} brands`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
      }
    } catch (error) {
      console.log(
        "Brands feature unavailable:",
        error?.message || "Unknown error",
      );
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const getValidationIcon = (fieldValue, validationError) => {
    if (!fieldValue) {
      return <FaInfoCircle className="text-secondary ms-2" size={14} />;
    }
    if (!validationError) {
      return <FaCheckCircle className="text-success ms-2" size={14} />;
    }
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-${fieldValue}`}>{validationError}</Tooltip>
        }
      >
        <span className="text-danger ms-2" style={{ cursor: "pointer" }}>
          <FaExclamationTriangle size={14} />
        </span>
      </OverlayTrigger>
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.product_name?.trim()) {
      errors.product_name = "Product name is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.unit_price) {
      errors.unit_price = "Unit price is required";
    } else if (
      isNaN(formData.unit_price) ||
      parseFloat(formData.unit_price) <= 0
    ) {
      errors.unit_price = "Unit price must be a positive number";
    }

    if (!formData.purchase_price) {
      errors.purchase_price = "Purchase price is required";
    } else if (
      isNaN(formData.purchase_price) ||
      parseFloat(formData.purchase_price) <= 0
    ) {
      errors.purchase_price = "Purchase price must be a positive number";
    }

    if (!formData.selling_price) {
      errors.selling_price = "Selling price is required";
    } else if (
      isNaN(formData.selling_price) ||
      parseFloat(formData.selling_price) <= 0
    ) {
      errors.selling_price = "Selling price must be a positive number";
    }

    if (
      formData.gst_rate &&
      (isNaN(formData.gst_rate) ||
        parseFloat(formData.gst_rate) < 0 ||
        parseFloat(formData.gst_rate) > 100)
    ) {
      errors.gst_rate = "GST rate must be between 0 and 100";
    }

    if (
      formData.opening_stock &&
      (isNaN(formData.opening_stock) || parseInt(formData.opening_stock) < 0)
    ) {
      errors.opening_stock = "Opening stock must be a non-negative number";
    }

    if (
      formData.min_stock_level &&
      (isNaN(formData.min_stock_level) ||
        parseInt(formData.min_stock_level) < 0)
    ) {
      errors.min_stock_level =
        "Minimum stock level must be a non-negative number";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.warning("⚠️ Please fix the validation errors", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "selling_price" && !formData.unit_price) {
      setFormData((prev) => ({ ...prev, unit_price: value }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const productData = {
        product_name: formData.product_name.trim(),
        category: formData.category,
        hsn_code: formData.hsn_code || null,
        unit: formData.unit,
        unit_price: parseFloat(formData.unit_price) || 0,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        gst_rate: parseFloat(formData.gst_rate) || 18,
        min_stock_level: parseInt(formData.min_stock_level) || 0,
        max_stock_level: parseInt(formData.max_stock_level) || 0,
        reorder_level: parseInt(formData.reorder_level) || 0,
        opening_stock: parseInt(formData.opening_stock) || 0,
        location: formData.location || null,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        created_by: 1,
      };

      console.log("Submitting product data:", productData);

      const response = await createProduct(productData);

      toast.success(
        `✅ Product "${formData.product_name}" added successfully! 🎉`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        },
      );

      setTimeout(() => {
        navigate("/inventory");
      }, 2000);
    } catch (error) {
      let errorMessage = "Failed to save product";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(", ");
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate("/inventory");
  };

  // Calculate margin and GST amount for preview
  const unitPrice = parseFloat(formData.unit_price) || 0;
  const purchasePrice = parseFloat(formData.purchase_price) || 0;
  const sellingPrice = parseFloat(formData.selling_price) || 0;
  const purchaseMargin = sellingPrice - purchasePrice;
  const unitMargin = sellingPrice - unitPrice;
  const gstRate = parseFloat(formData.gst_rate) || 0;
  const gstAmount = (sellingPrice * gstRate) / 100;

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

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
            <Nav
              variant="tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav.Item>
                <Nav.Link eventKey="basic" className="fw-semibold">
                  <FaTag className="me-2" /> Basic Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="pricing" className="fw-semibold">
                  <FaRupeeSign className="me-2" /> Pricing & Tax
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="stock" className="fw-semibold">
                  <FaWarehouse className="me-2" /> Stock & Location
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* Basic Information Tab */}
              <Tab.Pane eventKey="basic" active={activeTab === "basic"}>
                <Row>
                  <Col lg={6}>
                    <div className="mb-4">
                      <h6
                        className="fw-bold mb-3"
                        style={{ color: "rgb(30, 58, 111)" }}
                      >
                        <FaBox className="me-2" /> Product Details
                      </h6>
                      <hr className="mt-0 mb-4" />

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Product Name <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            isInvalid={!!formErrors.product_name}
                            className="flex-grow-1 rounded-2"
                          />
                          {getValidationIcon(
                            formData.product_name,
                            formErrors.product_name,
                          )}
                        </div>
                        {formErrors.product_name && (
                          <Form.Text className="text-danger">
                            {formErrors.product_name}
                          </Form.Text>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Category <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            isInvalid={!!formErrors.category}
                            className="flex-grow-1 rounded-2"
                          >
                            <option value="">Select Category</option>
                            <option value="LPG Cylinder">LPG Cylinder</option>
                            <option value="Gas Stove">Gas Stove</option>
                            <option value="Regulator">Regulator</option>
                            <option value="Pipe">Pipe</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                          {getValidationIcon(
                            formData.category,
                            formErrors.category,
                          )}
                        </div>
                        {formErrors.category && (
                          <Form.Text className="text-danger">
                            {formErrors.category}
                          </Form.Text>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          <FaBarcode className="me-1" /> HSN Code
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="hsn_code"
                          value={formData.hsn_code}
                          onChange={handleChange}
                          placeholder="e.g., 73110047"
                          className="rounded-2"
                        />
                        <Form.Text className="text-muted">
                          Harmonized System of Nomenclature code
                        </Form.Text>
                      </Form.Group>
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="mb-4">
                      <h6
                        className="fw-bold mb-3"
                        style={{ color: "rgb(30, 58, 111)" }}
                      >
                        <FaBuilding className="me-2" /> Additional Information
                      </h6>
                      <hr className="mt-0 mb-4" />

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          <FaBalanceScale className="me-1" /> Unit of
                          Measurement
                        </Form.Label>
                        <Form.Select
                          name="unit"
                          value={formData.unit}
                          onChange={handleChange}
                          className="rounded-2"
                        >
                          <option value="NOS">Number (NOS)</option>
                          <option value="KG">Kilogram (KG)</option>
                          <option value="LTR">Liter (LTR)</option>
                          <option value="PC">Piece (PC)</option>
                          <option value="BOX">Box (BOX)</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Brand (Optional)
                        </Form.Label>
                        <Form.Select
                          name="brand_id"
                          value={formData.brand_id}
                          onChange={handleChange}
                          disabled={loadingBrands}
                          className="rounded-2"
                        >
                          <option value="">Select Brand (Optional)</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </Form.Select>
                        {loadingBrands && (
                          <div className="mt-2">
                            <Spinner animation="border" size="sm" />
                            <span className="ms-2 text-muted small">
                              Loading brands...
                            </span>
                          </div>
                        )}
                        <Form.Text className="text-muted">
                          Brands are optional - you can add a product without
                          selecting a brand
                        </Form.Text>
                      </Form.Group>
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Pricing & Tax Tab */}
              <Tab.Pane eventKey="pricing" active={activeTab === "pricing"}>
                <Row>
                  <Col lg={6}>
                    <div className="mb-4">
                      <h6
                        className="fw-bold mb-3"
                        style={{ color: "rgb(30, 58, 111)" }}
                      >
                        <FaDollarSign className="me-2" /> Pricing Information
                      </h6>
                      <hr className="mt-0 mb-4" />

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Unit Price (₹) <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            name="unit_price"
                            value={formData.unit_price}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            isInvalid={!!formErrors.unit_price}
                            className="flex-grow-1 rounded-2"
                          />
                          {getValidationIcon(
                            formData.unit_price,
                            formErrors.unit_price,
                          )}
                        </div>
                        {formErrors.unit_price && (
                          <Form.Text className="text-danger">
                            {formErrors.unit_price}
                          </Form.Text>
                        )}
                        <Form.Text className="text-muted">
                          Base price per unit before tax
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Purchase Price (₹){" "}
                          <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            name="purchase_price"
                            value={formData.purchase_price}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            isInvalid={!!formErrors.purchase_price}
                            className="flex-grow-1 rounded-2"
                          />
                          {getValidationIcon(
                            formData.purchase_price,
                            formErrors.purchase_price,
                          )}
                        </div>
                        {formErrors.purchase_price && (
                          <Form.Text className="text-danger">
                            {formErrors.purchase_price}
                          </Form.Text>
                        )}
                        <Form.Text className="text-muted">
                          Cost price at which product is purchased
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Selling Price (₹){" "}
                          <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            name="selling_price"
                            value={formData.selling_price}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            isInvalid={!!formErrors.selling_price}
                            className="flex-grow-1 rounded-2"
                          />
                          {getValidationIcon(
                            formData.selling_price,
                            formErrors.selling_price,
                          )}
                        </div>
                        {formErrors.selling_price && (
                          <Form.Text className="text-danger">
                            {formErrors.selling_price}
                          </Form.Text>
                        )}
                        <Form.Text className="text-muted">
                          Retail price at which product is sold
                        </Form.Text>
                      </Form.Group>
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="mb-4">
                      <h6
                        className="fw-bold mb-3"
                        style={{ color: "rgb(30, 58, 111)" }}
                      >
                        <FaPercent className="me-2" /> Tax Information
                      </h6>
                      <hr className="mt-0 mb-4" />

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          GST Rate (%)
                        </Form.Label>
                        <Form.Select
                          name="gst_rate"
                          value={formData.gst_rate}
                          onChange={handleChange}
                          isInvalid={!!formErrors.gst_rate}
                          className="rounded-2"
                        >
                          <option value="0">0% (No GST)</option>
                          <option value="5">5% (Essential Goods)</option>
                          <option value="12">12% (Standard Rate)</option>
                          <option value="18">18% (Standard Rate)</option>
                          <option value="28">28% (Luxury Rate)</option>
                        </Form.Select>
                        {formErrors.gst_rate && (
                          <Form.Text className="text-danger">
                            {formErrors.gst_rate}
                          </Form.Text>
                        )}
                      </Form.Group>

                      {(unitPrice > 0 ||
                        purchasePrice > 0 ||
                        sellingPrice > 0) && (
                        <Alert variant="info" className="mt-3 rounded-3">
                          <small>
                            <strong>Pricing Summary:</strong>
                            <br />• Unit Price: ₹{unitPrice.toLocaleString()}
                            <br />• Purchase Price: ₹
                            {purchasePrice.toLocaleString()}
                            <br />• Selling Price: ₹
                            {sellingPrice.toLocaleString()}
                            <br />• Purchase Margin: ₹
                            {purchaseMargin.toLocaleString()}
                            <br />• Unit Margin: ₹{unitMargin.toLocaleString()}
                            <br />• GST Rate: {gstRate}%
                            <br />• GST Amount: ₹{gstAmount.toLocaleString()}
                            <br />•{" "}
                            <strong>
                              Final Price (incl. GST): ₹
                              {(sellingPrice + gstAmount).toLocaleString()}
                            </strong>
                          </small>
                        </Alert>
                      )}
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Stock & Location Tab */}
              <Tab.Pane eventKey="stock" active={activeTab === "stock"}>
                <Row>
                  <Col lg={6}>
                    <div className="mb-4">
                      <h6
                        className="fw-bold mb-3"
                        style={{ color: "rgb(30, 58, 111)" }}
                      >
                        <FaChartLine className="me-2" /> Stock Levels
                      </h6>
                      <hr className="mt-0 mb-4" />

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Opening Stock
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            name="opening_stock"
                            value={formData.opening_stock}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="1"
                            isInvalid={!!formErrors.opening_stock}
                            className="flex-grow-1 rounded-2"
                          />
                          {getValidationIcon(
                            formData.opening_stock,
                            formErrors.opening_stock,
                          )}
                        </div>
                        {formErrors.opening_stock && (
                          <Form.Text className="text-danger">
                            {formErrors.opening_stock}
                          </Form.Text>
                        )}
                        <Form.Text className="text-muted">
                          Initial stock quantity
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Minimum Stock Level
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            name="min_stock_level"
                            value={formData.min_stock_level}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="1"
                            isInvalid={!!formErrors.min_stock_level}
                            className="flex-grow-1 rounded-2"
                          />
                          {getValidationIcon(
                            formData.min_stock_level,
                            formErrors.min_stock_level,
                          )}
                        </div>
                        {formErrors.min_stock_level && (
                          <Form.Text className="text-danger">
                            {formErrors.min_stock_level}
                          </Form.Text>
                        )}
                        <Form.Text className="text-muted">
                          Alert when stock falls below this level
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Maximum Stock Level
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="max_stock_level"
                          value={formData.max_stock_level}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="1"
                          isInvalid={!!formErrors.max_stock_level}
                          className="rounded-2"
                        />
                        {formErrors.max_stock_level && (
                          <Form.Text className="text-danger">
                            {formErrors.max_stock_level}
                          </Form.Text>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Reorder Level
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="reorder_level"
                          value={formData.reorder_level}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="1"
                          isInvalid={!!formErrors.reorder_level}
                          className="rounded-2"
                        />
                        {formErrors.reorder_level && (
                          <Form.Text className="text-danger">
                            {formErrors.reorder_level}
                          </Form.Text>
                        )}
                        <Form.Text className="text-muted">
                          Quantity to reorder when stock is low
                        </Form.Text>
                      </Form.Group>
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="mb-4">
                      <h6
                        className="fw-bold mb-3"
                        style={{ color: "rgb(30, 58, 111)" }}
                      >
                        <FaMapMarkerAlt className="me-2" /> Location Information
                      </h6>
                      <hr className="mt-0 mb-4" />

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Storage Location
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g., Warehouse A, Shelf 1"
                          className="rounded-2"
                        />
                        <Form.Text className="text-muted">
                          Storage location in warehouse
                        </Form.Text>
                      </Form.Group>

                      <Alert variant="success" className="mt-4 rounded-3">
                        <FaCheckCircle className="me-2" />
                        <small>
                          <strong>Ready to Submit?</strong>
                          <br />
                          Please review all the product details before
                          submitting.
                          <br />
                          You can edit the product later if needed.
                        </small>
                      </Alert>
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>

          {/* Action Buttons inside Card Footer */}
          <Card.Footer className="bg-white border-top-0 pb-4 px-4">
            <div className="d-flex justify-content-between gap-3">
              <Button
                onClick={handleGoBack}
                style={{
                  backgroundColor: "#6c757d",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#fff",
                }}
              >
                <FaTimes size={14} /> Cancel
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: "rgb(30, 58, 111)",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(30, 58, 111, 0.25)",
                }}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaSave size={14} /> Submit Product
                  </>
                )}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Form>

      <style>{`
        .nav-tabs {
          border-bottom: 2px solid #e9ecef;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 12px 20px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .nav-tabs .nav-link:hover {
          color: rgb(30, 58, 111);
          background: transparent;
        }
        .nav-tabs .nav-link.active {
          color: rgb(30, 58, 111);
          background: transparent;
          border-bottom: 2px solid rgb(30, 58, 111);
        }
        .rounded-3 {
          border-radius: 12px !important;
        }
        .rounded-2 {
          border-radius: 8px !important;
        }
        .form-label {
          margin-bottom: 0.5rem;
          font-size: 13px;
        }
        .form-text {
          font-size: 11px;
          margin-top: 0.25rem;
        }
      `}</style>
    </Container>
  );
};

export default AddInventory;