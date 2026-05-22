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

  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    hsn_code: "",
    unit: "NOS",
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
      
      // Handle different response structures
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        brandsData = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        brandsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        brandsData = response.data;
      } else if (Array.isArray(response)) {
        brandsData = response;
      } else if (response?.data?.brands && Array.isArray(response.data.brands)) {
        brandsData = response.data.brands;
      }
      
      // Ensure it's an array
      brandsData = Array.isArray(brandsData) ? brandsData : [];
      setBrands(brandsData);
      
      // Only show success if brands were found (optional, can be removed)
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
      // Silently fail - brands are optional
      console.log("Brands feature unavailable:", error?.message || "Unknown error");
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.product_name?.trim()) {
      errors.product_name = "Product name is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.purchase_price) {
      errors.purchase_price = "Purchase price is required";
    } else if (isNaN(formData.purchase_price) || parseFloat(formData.purchase_price) <= 0) {
      errors.purchase_price = "Purchase price must be a positive number";
    }

    if (!formData.selling_price) {
      errors.selling_price = "Selling price is required";
    } else if (isNaN(formData.selling_price) || parseFloat(formData.selling_price) <= 0) {
      errors.selling_price = "Selling price must be a positive number";
    }

    if (formData.gst_rate && (isNaN(formData.gst_rate) || parseFloat(formData.gst_rate) < 0 || parseFloat(formData.gst_rate) > 100)) {
      errors.gst_rate = "GST rate must be between 0 and 100";
    }

    if (formData.opening_stock && (isNaN(formData.opening_stock) || parseInt(formData.opening_stock) < 0)) {
      errors.opening_stock = "Opening stock must be a non-negative number";
    }

    if (formData.min_stock_level && (isNaN(formData.min_stock_level) || parseInt(formData.min_stock_level) < 0)) {
      errors.min_stock_level = "Minimum stock level must be a non-negative number";
    }

    if (formData.max_stock_level && (isNaN(formData.max_stock_level) || parseInt(formData.max_stock_level) < 0)) {
      errors.max_stock_level = "Maximum stock level must be a non-negative number";
    }

    if (formData.reorder_level && (isNaN(formData.reorder_level) || parseInt(formData.reorder_level) < 0)) {
      errors.reorder_level = "Reorder level must be a non-negative number";
    }

    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.warning("Please fix the validation errors", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
      return false;
    }
    
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
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
      
      const response = await createProduct(productData);
      
      toast.success(`✓ Product "${formData.product_name}" added successfully!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
      
      setTimeout(() => {
        navigate("/inventory");
      }, 1500);
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
      
      toast.error(`✗ ${errorMessage}`, {
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
  const purchasePrice = parseFloat(formData.purchase_price) || 0;
  const sellingPrice = parseFloat(formData.selling_price) || 0;
  const margin = sellingPrice - purchasePrice;
  const gstRate = parseFloat(formData.gst_rate) || 0;
  const gstAmount = (sellingPrice * gstRate) / 100;

  return (
    <Container fluid className="px-4 py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
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

      {/* Header Section */}
      <div className="bg-secondary text-white rounded-3 p-4 mb-4 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              <FaBox className="me-2" /> Add New Product
            </h2>
            <p className="mb-0 opacity-75">Add a new product to your inventory</p>
          </div>
          <Button variant="light" onClick={handleGoBack} className="rounded-pill px-4">
            <FaArrowLeft className="me-2" /> Back to Products
          </Button>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Left Column - Basic & Pricing Info */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaTag className="me-2 text-secondary" /> Basic Information
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    isInvalid={!!formErrors.product_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.product_name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
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
                  <Form.Control.Feedback type="invalid">
                    {formErrors.category}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><FaBarcode className="me-1" /> HSN Code</Form.Label>
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

                <Form.Group className="mb-3">
                  <Form.Label>Unit of Measurement</Form.Label>
                  <Form.Select name="unit" value={formData.unit} onChange={handleChange}>
                    <option value="NOS">Number (NOS)</option>
                    <option value="KG">Kilogram (KG)</option>
                    <option value="LTR">Liter (LTR)</option>
                    <option value="PC">Piece (PC)</option>
                    <option value="BOX">Box (BOX)</option>
                  </Form.Select>
                </Form.Group>

                <h6 className="fw-bold mb-3 mt-4">
                  <FaRupeeSign className="me-2 text-secondary" /> Pricing & Tax
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Purchase Price (₹) <span className="text-danger">*</span></Form.Label>
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
                  <Form.Control.Feedback type="invalid">
                    {formErrors.purchase_price}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Selling Price (₹) <span className="text-danger">*</span></Form.Label>
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
                  <Form.Control.Feedback type="invalid">
                    {formErrors.selling_price}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><FaPercent className="me-1" /> GST Rate (%)</Form.Label>
                  <Form.Select
                    name="gst_rate"
                    value={formData.gst_rate}
                    onChange={handleChange}
                    isInvalid={!!formErrors.gst_rate}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.gst_rate}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Pricing Summary */}
                {(purchasePrice > 0 || sellingPrice > 0) && (
                  <Alert variant="secondary" className="mt-3 rounded-3">
                    <small className="d-block">
                      <strong>Pricing Summary:</strong>
                    </small>
                    <small className="d-block">• Purchase Price: ₹{purchasePrice.toLocaleString()}</small>
                    <small className="d-block">• Selling Price: ₹{sellingPrice.toLocaleString()}</small>
                    <small className="d-block">• Margin: ₹{margin.toLocaleString()}</small>
                    <small className="d-block">• GST Rate: {gstRate}%</small>
                    <small className="d-block">• GST Amount: ₹{gstAmount.toLocaleString()}</small>
                    <small className="d-block text-success">• Final Price: ₹{(sellingPrice + gstAmount).toLocaleString()}</small>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Stock & Location Info */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <FaBuilding className="me-2 text-secondary" /> Stock & Location
                </h6>
                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Opening Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="opening_stock"
                    value={formData.opening_stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="1"
                    isInvalid={!!formErrors.opening_stock}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.opening_stock}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Min Stock Level</Form.Label>
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
                  <Form.Control.Feedback type="invalid">
                    {formErrors.min_stock_level}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Alert when stock falls below this level
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Max Stock Level</Form.Label>
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
                  <Form.Control.Feedback type="invalid">
                    {formErrors.max_stock_level}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
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
                  <Form.Control.Feedback type="invalid">
                    {formErrors.reorder_level}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Quantity to reorder when stock is low
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><FaMapMarkerAlt className="me-1" /> Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Warehouse A, Shelf 1"
                  />
                  <Form.Text className="text-muted">
                    Storage location in warehouse
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Brand (Optional)</Form.Label>
                  <Form.Select
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleChange}
                    disabled={loadingBrands}
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
                      <span className="ms-2 text-muted small">Loading brands...</span>
                    </div>
                  )}
                  <Form.Text className="text-muted">
                    Brands are optional - you can add a product without selecting a brand
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button
            variant="secondary"
            type="submit"
            disabled={submitting}
            className="rounded-pill px-5"
            style={{ backgroundColor: "#6c757d", border: "none" }}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Save Product
              </>
            )}
          </Button>
        </div>
      </Form>

      <style>{`
        .rounded-3 {
          border-radius: 0.75rem !important;
        }
      `}</style>
    </Container>
  );
};

export default AddInventory;