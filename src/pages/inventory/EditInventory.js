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
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
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
import { getProductById, updateProduct } from "../../api/tenant/inventory.api";
import { brandApi } from "../../api/tenant/masterData.api";

const EditInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [formErrors, setFormErrors] = useState({});
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  const [formData, setFormData] = useState({
    product_name: "",
    product_code: "",
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
    current_stock: "",
    opening_stock: "",
    location: "",
    brand_id: "",
    status: "active",
  });

  useEffect(() => {
    loadBrands();
    loadProduct();
  }, [id]);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await brandApi.getBrands();
      console.log("Brands response:", response);

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

      const formattedBrands = brandsData.map((brand) => ({
        id: brand.id,
        name: brand.name || brand.brand_name || brand.brandName,
      }));

      setBrands(formattedBrands);
    } catch (error) {
      console.error("Failed to load brands (optional):", error);
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProductById(id);
      console.log("Product response:", response);

      let productData = null;
      if (response?.data?.data) productData = response.data.data;
      else if (response?.data) productData = response.data;
      else productData = response;

      if (!productData) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      console.log("Product data:", productData);

      setFormData({
        product_name: productData.product_name || "",
        product_code: productData.product_code || "",
        category: productData.category || "",
        hsn_code: productData.hsn_code || "",
        unit: productData.unit || "NOS",
        unit_price: productData.unit_price || productData.selling_price || "",
        purchase_price: productData.purchase_price || "",
        selling_price: productData.selling_price || "",
        gst_rate: productData.gst_rate || "18",
        min_stock_level: productData.min_stock_level || "",
        max_stock_level: productData.max_stock_level || "",
        reorder_level: productData.reorder_level || "",
        current_stock: productData.current_stock || "",
        opening_stock: productData.opening_stock || "",
        location: productData.location || "",
        brand_id: productData.brand_id || "",
        status: productData.status || "active",
      });
    } catch (err) {
      console.error("Failed to load product:", err);
      const errorMsg = err.response?.data?.message || "Failed to load product";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.product_name) {
      errors.product_name = "Product name is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
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
      formData.min_stock_level &&
      (isNaN(formData.min_stock_level) ||
        parseInt(formData.min_stock_level) < 0)
    ) {
      errors.min_stock_level =
        "Minimum stock level must be a non-negative number";
    }

    if (
      formData.max_stock_level &&
      (isNaN(formData.max_stock_level) ||
        parseInt(formData.max_stock_level) < 0)
    ) {
      errors.max_stock_level =
        "Maximum stock level must be a non-negative number";
    }

    if (
      formData.reorder_level &&
      (isNaN(formData.reorder_level) || parseInt(formData.reorder_level) < 0)
    ) {
      errors.reorder_level = "Reorder level must be a non-negative number";
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
        product_name: formData.product_name,
        category: formData.category,
        hsn_code: formData.hsn_code || null,
        unit: formData.unit,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        gst_rate: parseFloat(formData.gst_rate) || 18,
        min_stock_level: parseInt(formData.min_stock_level) || 0,
        max_stock_level: parseInt(formData.max_stock_level) || 0,
        reorder_level: parseInt(formData.reorder_level) || 0,
        location: formData.location || null,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        status: formData.status,
      };

      console.log("Updating product data:", productData);

      const response = await updateProduct(id, productData);
      console.log("Update product response:", response);

      toast.success(
        `✅ Product "${formData.product_name}" updated successfully! 🎉`,
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        },
      );

      setTimeout(() => {
        navigate("/inventory");
      }, 1500);
    } catch (error) {
      console.error("Update error:", error);

      let errorMessage = "Failed to update product";
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
  const purchasePrice = parseFloat(formData.purchase_price) || 0;
  const sellingPrice = parseFloat(formData.selling_price) || 0;
  const margin = sellingPrice - purchasePrice;
  const marginPercent =
    purchasePrice > 0 ? ((margin / purchasePrice) * 100).toFixed(2) : 0;
  const gstRate = parseFloat(formData.gst_rate) || 0;
  const gstAmount = (sellingPrice * gstRate) / 100;
  const finalPrice = sellingPrice + gstAmount;

  if (loading) {
    return (
      <Container
        fluid
        className="p-4"
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
        <div className="text-center py-5">
          <Spinner animation="border" variant="secondary" size="lg" />
          <h5 className="mt-3 text-muted">Loading product data...</h5>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        fluid
        className="p-4"
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
        <Alert variant="secondary" className="text-center">
          <h4>Product not found</h4>
          <p>The product you're looking for doesn't exist.</p>
          <Button variant="secondary" onClick={() => navigate("/inventory")}>
            Back to Inventory
          </Button>
        </Alert>
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

      <Form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-0 pt-3 px-4">
            <div className="d-flex gap-2 border-bottom pb-2">
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("basic")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "basic" ? "bg-light" : ""}`}
                style={{
                  color: activeTab === "basic" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaTag className="me-2" /> Basic Information
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("pricing")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "pricing" ? "bg-light" : ""}`}
                style={{
                  color:
                    activeTab === "pricing" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaRupeeSign className="me-2" /> Pricing & Tax
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setActiveTab("stock")}
                className={`fw-semibold text-decoration-none px-3 py-2 rounded-3 ${activeTab === "stock" ? "bg-light" : ""}`}
                style={{
                  color: activeTab === "stock" ? "rgb(30, 58, 111)" : "#6c757d",
                }}
              >
                <FaWarehouse className="me-2" /> Stock & Location
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="p-4">
            {/* Basic Information Tab */}
            {activeTab === "basic" && (
              <div>
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaBox className="me-2" /> Product Details
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="product_name"
                        value={formData.product_name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        isInvalid={!!formErrors.product_name}
                      />
                      {formErrors.product_name && (
                        <Form.Text className="text-danger">
                          {formErrors.product_name}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        isInvalid={!!formErrors.category}
                      >
                        <option value="">Select Category</option>
                        <option value="LPG Cylinder">LPG Cylinder</option>
                        <option value="Gas Stove">Gas Stove</option>
                        <option value="Regulator">Regulator</option>
                        <option value="Pipe">Pipe</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                      {formErrors.category && (
                        <Form.Text className="text-danger">
                          {formErrors.category}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FaBarcode className="me-1" /> HSN Code
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="hsn_code"
                        value={formData.hsn_code}
                        onChange={handleChange}
                        placeholder="e.g., 73110047"
                      />
                      <Form.Text className="text-muted">
                        Harmonized System of Nomenclature code
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FaBalanceScale className="me-1" /> Unit of Measurement
                      </Form.Label>
                      <Form.Select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                      >
                        <option value="NOS">Number (NOS)</option>
                        <option value="KG">Kilogram (KG)</option>
                        <option value="LTR">Liter (LTR)</option>
                        <option value="PC">Piece (PC)</option>
                        <option value="BOX">Box (BOX)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
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
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Brand (Optional)</Form.Label>
                      <Form.Select
                        name="brand_id"
                        value={formData.brand_id}
                        onChange={handleChange}
                        disabled={loadingBrands}
                      >
                        <option value="">-- Select Brand (Optional) --</option>
                        {brands.length > 0 ? (
                          brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No brands available
                          </option>
                        )}
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
                        Brands are optional - you can update product without
                        changing brand
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}

            {/* Pricing & Tax Tab */}
            {activeTab === "pricing" && (
              <div>
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaDollarSign className="me-2" /> Pricing Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Purchase Price (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="purchase_price"
                        value={formData.purchase_price}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        isInvalid={!!formErrors.purchase_price}
                      />
                      {formErrors.purchase_price && (
                        <Form.Text className="text-danger">
                          {formErrors.purchase_price}
                        </Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Cost price at which product is purchased
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Selling Price (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="selling_price"
                        value={formData.selling_price}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        isInvalid={!!formErrors.selling_price}
                      />
                      {formErrors.selling_price && (
                        <Form.Text className="text-danger">
                          {formErrors.selling_price}
                        </Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Retail price at which product is sold
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaPercent className="me-2" /> Tax Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>GST Rate (%)</Form.Label>
                      <Form.Select
                        name="gst_rate"
                        value={formData.gst_rate}
                        onChange={handleChange}
                        isInvalid={!!formErrors.gst_rate}
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
                  </Col>
                </Row>

                {(purchasePrice > 0 || sellingPrice > 0) && (
                  <Alert variant="info" className="mt-3 rounded-3">
                    <small>
                      <strong>Pricing & Tax Summary:</strong>
                      <br />• Purchase Price: ₹{purchasePrice.toLocaleString()}
                      <br />• Selling Price: ₹{sellingPrice.toLocaleString()}
                      <br />• Margin: ₹{margin.toLocaleString()} (
                      {marginPercent}%)
                      <br />• GST Rate: {gstRate}%
                      <br />• GST Amount: ₹{gstAmount.toLocaleString()}
                      <br />•{" "}
                      <strong>
                        Final Price (incl. GST): ₹{finalPrice.toLocaleString()}
                      </strong>
                    </small>
                  </Alert>
                )}
              </div>
            )}

            {/* Stock & Location Tab */}
            {activeTab === "stock" && (
              <div>
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaChartLine className="me-2" /> Stock Levels
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Minimum Stock Level</Form.Label>
                      <Form.Control
                        type="number"
                        name="min_stock_level"
                        value={formData.min_stock_level}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="1"
                        isInvalid={!!formErrors.min_stock_level}
                      />
                      {formErrors.min_stock_level && (
                        <Form.Text className="text-danger">
                          {formErrors.min_stock_level}
                        </Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Alert when stock falls below this level
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Maximum Stock Level</Form.Label>
                      <Form.Control
                        type="number"
                        name="max_stock_level"
                        value={formData.max_stock_level}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="1"
                        isInvalid={!!formErrors.max_stock_level}
                      />
                      {formErrors.max_stock_level && (
                        <Form.Text className="text-danger">
                          {formErrors.max_stock_level}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Reorder Level</Form.Label>
                      <Form.Control
                        type="number"
                        name="reorder_level"
                        value={formData.reorder_level}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="1"
                        isInvalid={!!formErrors.reorder_level}
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
                  </Col>
                </Row>

                <h6
                  className="fw-bold mb-3 mt-4"
                  style={{ color: "rgb(30, 58, 111)" }}
                >
                  <FaMapMarkerAlt className="me-2" /> Location Information
                </h6>
                <hr className="mt-0 mb-3" />
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Storage Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Warehouse A, Shelf 1, Rack 2"
                      />
                      <Form.Text className="text-muted">
                        Storage location in warehouse
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Stock Status Preview */}
                {formData.min_stock_level && formData.current_stock && (
                  <Card className="border-0 bg-light rounded-3 mt-4">
                    <Card.Body className="p-3">
                      <h6 className="fw-semibold mb-2">
                        <FaInfoCircle className="me-2" /> Stock Status Preview
                      </h6>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Current Stock:</small>
                        <strong>
                          {parseInt(formData.current_stock) || 0}{" "}
                          {formData.unit}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Min Level:</small>
                        <strong>
                          {parseInt(formData.min_stock_level) || 0}{" "}
                          {formData.unit}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">Status:</small>
                        <strong
                          className={
                            (parseInt(formData.current_stock) || 0) <= 0
                              ? "text-danger"
                              : (parseInt(formData.current_stock) || 0) <=
                                  (parseInt(formData.min_stock_level) || 0)
                                ? "text-warning"
                                : "text-success"
                          }
                        >
                          {(parseInt(formData.current_stock) || 0) <= 0
                            ? "Out of Stock"
                            : (parseInt(formData.current_stock) || 0) <=
                                (parseInt(formData.min_stock_level) || 0)
                              ? "Low Stock"
                              : "In Stock"}
                        </strong>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                <Alert variant="success" className="mt-4 rounded-3">
                  <FaCheckCircle className="me-2" />
                  <small>
                    <strong>Ready to Update?</strong>
                    <br />
                    Please review all the product details before updating.
                    <br />
                    You can edit the product again later if needed.
                  </small>
                </Alert>
              </div>
            )}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Update Product
                  </>
                )}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Form>

      <style>{`
        .rounded-3 {
          border-radius: 12px !important;
        }
        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </Container>
  );
};

export default EditInventory;
