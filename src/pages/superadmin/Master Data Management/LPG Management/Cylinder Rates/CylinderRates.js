import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Card,
  Badge,
  InputGroup,
  FormControl,
  Pagination,
} from "react-bootstrap";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaSearch,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaRupeeSign,
  FaCalendarAlt,
  FaGasPump,
  FaChartLine,
  FaTag,
  FaBuilding,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  cylinderRateApi,
  cylinderTypeApi,
  brandApi,
} from "../../../../../api/superadmin/masterData.api";

const CylinderRates = () => {
  const [rates, setRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [cylinderTypes, setCylinderTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [viewShow, setViewShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBrand, setSelectedBrand] = useState("");

  const [currentRate, setCurrentRate] = useState(null);
  const [formData, setFormData] = useState({
    cylinderTypeId: "",
    brandId: "",
    price: "",
    effectiveFrom: "",
    gstPercent: "5.00",
    cess: "0",
    status: "1",
  });

  // Calculate summary stats
  const totalRates = filteredRates.length;
  const activeRates = filteredRates.filter(r => r.is_current === 1).length;
  const inactiveRates = filteredRates.filter(r => r.is_current === 0).length;

  // Fetch data on component mount
  useEffect(() => {
    fetchCylinderTypes();
    fetchBrands();
  }, []);

  // Fetch rates when selected brand changes
  useEffect(() => {
    fetchRates();
  }, [selectedBrand]);

  // Filter rates based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredRates(rates);
    } else {
      const filtered = rates.filter(
        (rate) =>
          rate.cylinder_type_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          rate.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredRates(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, rates]);

  // Fetch cylinder types - COMPLETE WORKING VERSION
  const fetchCylinderTypes = async () => {
    try {
      console.log("Fetching cylinder types...");
      const response = await cylinderTypeApi.getAll();
      console.log("Cylinder types API response:", response);

      let typesData = [];

      if (response && response.data) {
        if (
          response.data.success === true &&
          Array.isArray(response.data.data)
        ) {
          typesData = response.data.data;
          console.log(
            "Case 1 - Found data in response.data.data:",
            typesData.length,
          );
        }
        else if (Array.isArray(response.data)) {
          typesData = response.data;
          console.log(
            "Case 2 - Found data in response.data:",
            typesData.length,
          );
        }
        else if (response.data.data && Array.isArray(response.data.data)) {
          typesData = response.data.data;
          console.log("Case 3 - Found nested data:", typesData.length);
        }
      }
      else if (Array.isArray(response)) {
        typesData = response;
        console.log("Case 4 - Response is array:", typesData.length);
      }

      const activeTypes = typesData.filter((type) => type.status === 1);
      console.log(
        `Total types: ${typesData.length}, Active types: ${activeTypes.length}`,
      );

      setCylinderTypes(activeTypes);

      if (typesData.length === 0) {
        console.warn(
          "No cylinder types found! Please add cylinder types first.",
        );
        Swal.fire({
          icon: "info",
          title: "No Cylinder Types",
          text: "Please add cylinder types before creating rates.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching cylinder types:", error);
      console.error("Error details:", error.response?.data);

      Swal.fire({
        icon: "error",
        title: "Error Loading Cylinder Types",
        text:
          error.response?.data?.message ||
          "Failed to load cylinder types. Please refresh the page.",
      });

      setCylinderTypes([]);
    }
  };
  
  // Fetch brands
  const fetchBrands = async () => {
    try {
      const response = await brandApi.getDropdown();
      console.log("Brands response:", response.data);

      let brandsData = [];
      if (response.data && response.data.success) {
        brandsData = response.data.data || [];
      } else if (response.data && Array.isArray(response.data)) {
        brandsData = response.data;
      } else if (Array.isArray(response)) {
        brandsData = response;
      }

      setBrands(brandsData);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  // Fetch all rates
  const fetchRates = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedBrand) {
        response = await cylinderRateApi.getByBrand(selectedBrand);
      } else {
        response = await cylinderRateApi.getAll();
      }

      console.log("Rates response:", response.data);

      let ratesData = [];

      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.data) {
          ratesData = response.data.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          ratesData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          ratesData = response.data.data;
        }
      } else if (response.data && Array.isArray(response.data)) {
        ratesData = response.data;
      } else if (Array.isArray(response)) {
        ratesData = response;
      }

      console.log("Extracted rates data:", ratesData);
      setRates(ratesData);
      setFilteredRates(ratesData);
    } catch (error) {
      console.error("Error fetching rates:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch rates",
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Auto-calculate GST percent based on cylinder type
  const autoCalculateGST = (cylinderTypeId) => {
    if (!cylinderTypeId) return "5.00";
    
    const selectedCylinder = cylinderTypes.find(type => type.id === parseInt(cylinderTypeId));
    
    if (!selectedCylinder) return "5.00";
    
    let gstPercent = 5.00;
    
    if (selectedCylinder.type === "domestic") {
      gstPercent = 5.00;
    } else if (selectedCylinder.type === "commercial") {
      gstPercent = 18.00;
    } else if (selectedCylinder.type === "industrial") {
      gstPercent = 18.00;
    }
    
    return gstPercent.toFixed(2);
  };

  // Handle input change with auto GST calculation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "cylinderTypeId") {
        updated.gstPercent = autoCalculateGST(value);
      }

      return updated;
    });
  };

  // Add Rate
  const handleAdd = async () => {
    if (!formData.cylinderTypeId || !formData.brandId || !formData.price || !formData.effectiveFrom) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields: Cylinder Type, Brand, Price, and Effective Date",
      });
      return;
    }

    try {
      const payload = {
        brandId: parseInt(formData.brandId),
        cylinderTypeId: parseInt(formData.cylinderTypeId),
        price: parseFloat(formData.price),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: null,
        gstPercent: formData.gstPercent ? parseFloat(formData.gstPercent) : 5.0,
        cess: formData.cess ? parseFloat(formData.cess) : 0,
        isCurrent: formData.status === "1" ? true : false,
      };

      console.log("Creating rate with payload:", payload);
      const response = await cylinderRateApi.create(payload);
      console.log("Create response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Cylinder rate added successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData({
        cylinderTypeId: "",
        brandId: "",
        price: "",
        effectiveFrom: "",
        gstPercent: "5.00",
        cess: "0",
        status: "1",
      });
      setShow(false);
      await fetchRates();
    } catch (error) {
      console.error("Error adding rate:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to add rate",
      });
    }
  };

  // Delete Rate
  const handleDelete = async (id, cylinderType, brand) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete rate for ${cylinderType} (${brand})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await cylinderRateApi.delete(id);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Rate has been deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchRates();
      } catch (error) {
        console.error("Error deleting rate:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to delete rate",
        });
      }
    }
  };

  // View Rate
  const handleView = async (rate) => {
    try {
      const response = await cylinderRateApi.getById(rate.id);
      let fullData = rate;
      if (response.data && response.data.data) {
        fullData = response.data.data;
      } else if (response.data) {
        fullData = response.data;
      }
      setCurrentRate(fullData);
      setViewShow(true);
    } catch (error) {
      console.error("Error fetching rate details:", error);
      setCurrentRate(rate);
      setViewShow(true);
    }
  };

  // Edit Open
  const handleEditOpen = (rate) => {
    setCurrentRate(rate);
    setFormData({
      cylinderTypeId: rate.cylinder_type_id?.toString() || "",
      brandId: rate.brand_id?.toString() || "",
      price: rate.price?.toString() || "",
      effectiveFrom:
        rate.effective_from?.split("T")[0] || rate.effective_from || "",
      gstPercent: rate.gst_percent?.toString() || "5.00",
      cess: rate.cess?.toString() || "0",
      status: rate.is_current === 1 ? "1" : "0",
    });
    setEditShow(true);
  };

  // Update Rate
  const handleUpdate = async () => {
    if (
      !formData.cylinderTypeId ||
      !formData.brandId ||
      !formData.price ||
      !formData.effectiveFrom
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields",
      });
      return;
    }

    try {
      const payload = {
        brandId: parseInt(formData.brandId),
        cylinderTypeId: parseInt(formData.cylinderTypeId),
        price: parseFloat(formData.price),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: null,
        gstPercent: formData.gstPercent ? parseFloat(formData.gstPercent) : 5.0,
        cess: formData.cess ? parseFloat(formData.cess) : 0,
        isCurrent: formData.status === "1" ? true : false,
      };

      console.log("Updating rate ID:", currentRate.id);
      console.log("Updating rate with payload:", payload);

      const response = await cylinderRateApi.update(currentRate.id, payload);
      console.log("Update response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Rate has been updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditShow(false);
      setFormData({
        cylinderTypeId: "",
        brandId: "",
        price: "",
        effectiveFrom: "",
        gstPercent: "5.00",
        cess: "0",
        status: "1",
      });

      await fetchRates();
    } catch (error) {
      console.error("Error updating rate:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to update rate",
      });
    }
  };

  // Toggle status
  const handleToggleStatus = async (rate) => {
    const isActive = rate.is_current === 1;
    const action = isActive ? "deactivate" : "activate";

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to ${action} rate for ${rate.cylinder_type_name} (${rate.brand_name})?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          isCurrent: !isActive,
        };
        await cylinderRateApi.update(rate.id, payload);

        Swal.fire({
          icon: "success",
          title: `${action.charAt(0).toUpperCase() + action.slice(1)}d!`,
          text: `Rate has been ${action}d successfully`,
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchRates();
      } catch (error) {
        console.error("Error toggling status:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || `Failed to ${action} rate`,
        });
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const isActive = status === 1;
    return (
      <Badge
        bg={isActive ? "success" : "danger"}
        className="px-2 py-1 rounded-pill"
        style={{ fontSize: "11px", fontWeight: 500 }}
      >
        <span className="me-1">{isActive ? "●" : "○"}</span>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedBrand("");
    setSearchTerm("");
  };

  // Get random color for badges
  const getBadgeColor = (text) => {
    const colors = ["primary", "success", "danger", "warning", "info", "secondary"];
    const index = text ? text.length % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="p-4" style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: "#1e293b", fontSize: "1.5rem" }}>
          <FaRupeeSign className="me-2" style={{ color: "#dc3545", fontSize: "1.3rem" }} />
          Cylinder Rates
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Manage cylinder pricing for different brands</p>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total Rates</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{totalRates}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e3f2fd", width: "36px", height: "36px" }}>
                  <FaChartLine size={16} style={{ color: "#3085d6" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Active Rates</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{activeRates}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#d1fae5", width: "36px", height: "36px" }}>
                  <FaToggleOn size={16} style={{ color: "#10b981" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Inactive Rates</p>
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>{inactiveRates}</h4>
                </div>
                <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fee2e2", width: "36px", height: "36px" }}>
                  <FaToggleOff size={16} style={{ color: "#ef4444" }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-0" style={{ borderRadius: "20px", overflow: "hidden" }}>
        <Card.Header className="bg-white border-0 py-3 px-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="mb-0 fw-bold" style={{ fontSize: "1rem" }}>Cylinder Rates Database</h5>
              <p className="text-muted small mb-0" style={{ fontSize: "11px" }}>Manage, edit, and monitor cylinder pricing information</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={fetchRates} className="rounded-pill px-3" style={{ fontSize: "12px", padding: "5px 12px" }}>
                <FaSync className="me-1" size={12} /> Refresh
              </Button>
              <Button variant="primary" onClick={() => setShow(true)} className="rounded-pill px-4" style={{ background: "#1e3a6f", border: "none", fontSize: "12px", padding: "5px 16px" }}>
                <FaPlus className="me-2" size={12} /> Add New Rate
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Search and Filter Bar */}
          <div className="px-4 pt-3 pb-2">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
              <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
                <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                  <InputGroup.Text className="bg-white border-end-0" style={{ fontSize: "12px" }}>
                    <FaSearch className="text-muted" size={12} />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search by cylinder or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                    style={{ fontSize: "13px" }}
                  />
                </InputGroup>
              </div>
              <div className="d-flex gap-2">
                <Form.Select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="rounded-pill px-3"
                  style={{ width: "220px", fontSize: "12px" }}
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </Form.Select>
                {(selectedBrand || searchTerm) && (
                  <Button variant="outline-secondary" onClick={clearFilters} className="rounded-pill px-3" style={{ fontSize: "12px" }}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: "2rem", height: "2rem" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted" style={{ fontSize: "13px" }}>Loading rates...</p>
            </div>
          )}

          {/* Modern Table */}
          {!loading && (
            <div className="table-responsive px-4">
              <Table className="align-middle mb-0" style={{ minWidth: "1100px", fontSize: "12px" }}>
                <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                  <tr className="text-muted">
                    <th className="py-2 ps-3" style={{ width: "60px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>#</th>
                    <th className="py-2" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Cylinder Type</th>
                    <th className="py-2" style={{ width: "150px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Brand</th>
                    <th className="py-2" style={{ width: "100px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Price</th>
                    <th className="py-2" style={{ width: "70px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>GST</th>
                    <th className="py-2" style={{ width: "110px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Effective From</th>
                    <th className="py-2" style={{ width: "90px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", textAlign: "center" }}>Status</th>
                    <th className="py-2 text-center" style={{ width: "170px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="text-muted">
                          <FaChartLine size={36} className="mb-2 opacity-25" />
                          <p style={{ fontSize: "13px" }}>No rates found</p>
                          <Button variant="primary" size="sm" onClick={() => setShow(true)} className="rounded-pill" style={{ fontSize: "11px" }}>
                            <FaPlus className="me-1" size={10} /> Add your first rate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((r, i) => (
                      <tr key={r.id} className="border-bottom" style={{ borderBottom: "1px solid #f0f2f8" }}>
                        <td className="py-2 ps-3 text-center fw-bold text-muted" style={{ fontSize: "12px" }}>{indexOfFirstItem + i + 1}</td>
                        <td className="py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: "32px", height: "32px", background: "transparent" }}
                            >
                              <FaGasPump size={14} style={{ color: "#667eea" }} />
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "13px" }}>{r.cylinder_type_name}</div>
                              <div className="small text-muted" style={{ fontSize: "10px" }}>ID: {r.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge bg={getBadgeColor(r.brand_name)} className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaBuilding className="me-1" size={10} />
                            {r.brand_name}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">
                          <Badge bg="info" className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaRupeeSign className="me-1" size={10} />
                            {formatPrice(r.price)}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">
                          <Badge bg="dark" className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaTag className="me-1" size={8} />
                            {r.gst_percent || 5}%
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Badge bg="secondary" className="px-2 py-1 rounded-pill" style={{ fontSize: "11px", fontWeight: 500 }}>
                            <FaCalendarAlt className="me-1" size={10} />
                            {formatDate(r.effective_from)}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">{getStatusBadge(r.is_current)}</td>
                        <td className="py-2">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleView(r)}
                              title="View Details"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#0dcaf0", color: "#0dcaf0" }}
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEditOpen(r)}
                              title="Edit Rate"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#ffc107", color: "#ffc107" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleToggleStatus(r)}
                              title={r.is_current === 1 ? "Deactivate" : "Activate"}
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: r.is_current === 1 ? "#dc3545" : "#198754", color: r.is_current === 1 ? "#dc3545" : "#198754" }}
                            >
                              {r.is_current === 1 ? <FaToggleOn size={12} /> : <FaToggleOff size={12} />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(r.id, r.cylinder_type_name, r.brand_name)}
                              title="Delete Rate"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: "28px", height: "28px", padding: "0", borderColor: "#dc3545", color: "#dc3545" }}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredRates.length > 0 && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top mt-2">
              <div className="text-muted" style={{ fontSize: "11px" }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRates.length)} of {filteredRates.length} entries
              </div>
              <Pagination className="mb-0" style={{ fontSize: "12px" }}>
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="rounded-circle mx-1">
                  <FaChevronLeft size={10} />
                </Pagination.Prev>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Pagination.Item key={pageNum} active={pageNum === currentPage} onClick={() => paginate(pageNum)} className="mx-1" style={{ fontSize: "12px", minWidth: "30px", textAlign: "center" }}>
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-circle mx-1">
                  <FaChevronRight size={10} />
                </Pagination.Next>
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaPlus className="me-2" style={{ color: "#1e3a6f", fontSize: "14px" }} /> Add New Cylinder Rate
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Cylinder Type <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="cylinderTypeId"
                value={formData.cylinderTypeId || ""}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value="">Select Cylinder Type</option>
                {cylinderTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.weight}) - {type.type}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted" style={{ fontSize: "11px" }}>
                GST will be auto-calculated based on cylinder type (Domestic: 5%, Commercial/Industrial: 18%)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Brand <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="brandId"
                value={formData.brandId || ""}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Price (₹) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="price"
                placeholder="Enter price in rupees"
                value={formData.price || ""}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>GST Percentage</Form.Label>
              <Form.Control
                type="number"
                name="gstPercent"
                placeholder="Enter GST percentage"
                value={formData.gstPercent || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                readOnly
                className="rounded-3"
                style={{ fontSize: "13px", backgroundColor: '#e9ecef' }}
              />
              <Form.Text className="text-muted text-success" style={{ fontSize: "11px" }}>
                ✓ Auto-calculated based on cylinder type
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>CESS</Form.Label>
              <Form.Control
                type="number"
                name="cess"
                placeholder="Enter CESS amount"
                value={formData.cess || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Effective Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="effectiveFrom"
                value={formData.effectiveFrom || ""}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status || "1"}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd} className="rounded-pill px-3" style={{ background: "#1e3a6f", fontSize: "12px" }}>Save Rate</Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={viewShow} onHide={() => setViewShow(false)} centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEye className="me-2" style={{ color: "#0dcaf0", fontSize: "14px" }} /> Rate Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          {currentRate && (
            <>
              <div className="text-center mb-3">
                <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: "60px", height: "60px", background: "transparent" }}>
                  <FaChartLine size={30} style={{ color: "#667eea" }} />
                </div>
                <h4 className="mb-0" style={{ fontSize: "1.2rem" }}>{currentRate.cylinder_type_name}</h4>
                <Badge bg="secondary" className="mt-1" style={{ fontSize: "11px" }}>{currentRate.brand_name}</Badge>
              </div>
              <hr className="my-2" />
              <div className="row" style={{ fontSize: "12px" }}>
                <div className="col-md-6 mb-2">
                  <strong>Cylinder Type:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentRate.cylinder_type_name}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Brand:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentRate.brand_name}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Price:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatPrice(currentRate.price)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>GST:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{currentRate.gst_percent || 5}%</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>CESS:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>₹{currentRate.cess || 0}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Effective Date:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentRate.effective_from)}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Status:</strong>
                  <div className="mt-1">{getStatusBadge(currentRate.is_current)}</div>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Created At:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentRate.created_at)}</p>
                </div>
                <div className="col-md-12 mb-2">
                  <strong>Last Updated:</strong>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>{formatDate(currentRate.updated_at)}</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="secondary" onClick={() => setViewShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-white border-0 pt-3 px-4">
          <Modal.Title className="fw-bold" style={{ fontSize: "1.1rem" }}>
            <FaEdit className="me-2" style={{ color: "#ffc107", fontSize: "14px" }} /> Edit Cylinder Rate
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-3">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Cylinder Type <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="cylinderTypeId"
                value={formData.cylinderTypeId || ""}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value="">Select Cylinder Type</option>
                {cylinderTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.weight}) - {type.type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Brand <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="brandId"
                value={formData.brandId || ""}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Price (₹) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>GST Percentage</Form.Label>
              <Form.Control
                type="number"
                name="gstPercent"
                value={formData.gstPercent || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>CESS</Form.Label>
              <Form.Control
                type="number"
                name="cess"
                value={formData.cess || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Effective Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="effectiveFrom"
                value={formData.effectiveFrom || ""}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "12px" }}>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status || "1"}
                onChange={handleChange}
                className="rounded-3"
                style={{ fontSize: "13px" }}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-3 px-4">
          <Button variant="light" onClick={() => setEditShow(false)} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Cancel</Button>
          <Button variant="warning" onClick={handleUpdate} className="rounded-pill px-3" style={{ fontSize: "12px" }}>Update Rate</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CylinderRates;